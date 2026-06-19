"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  ingredients,
  productBundleItems,
  productBundles,
  products,
  productTags,
  productVariants,
  recipeIngredients,
  recipes,
} from "@/db/schema";
import { assertAdminSession } from "@/lib/admin-auth";
import {
  createAdminAlertNotification,
  createAdminOperationalNotification,
  writeAuditLog,
} from "@/lib/admin-events";
import { stripe } from "@/lib/stripe";
import { bundleInputSchema } from "@/lib/validations/bundle";
import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product";
import { importRecipeUrlSchema } from "@/lib/validations/recipe";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "An unknown error occurred";
}

function mergeRawProductDataWithId(rawData: unknown, id: string) {
  if (typeof rawData !== "object" || rawData === null) {
    return { id };
  }
  return { ...rawData, id };
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function parseIngredientLine(rawLine: string) {
  const cleaned = rawLine.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml)\s+(.+)$/i);

  if (!match) {
    return {
      quantity: 1,
      unit: "g" as const,
      name: cleaned,
    };
  }

  const quantity = Number.parseFloat(match[1].replace(",", "."));
  const unit = match[2].toLowerCase() as "g" | "kg" | "ml" | "l";
  const name = match[3].trim();

  return {
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unit,
    name,
  };
}

function collectRecipeCandidates(
  node: unknown,
): Array<Record<string, unknown>> {
  if (!node) return [];
  if (Array.isArray(node)) {
    return node.flatMap((entry) => collectRecipeCandidates(entry));
  }
  if (typeof node !== "object") return [];

  const record = node as Record<string, unknown>;
  const graph = record["@graph"];
  const nested = graph ? collectRecipeCandidates(graph) : [];
  const typeField = record["@type"];
  const types = Array.isArray(typeField) ? typeField : [typeField];
  const isRecipe = types.some(
    (type) => typeof type === "string" && type.toLowerCase() === "recipe",
  );

  return isRecipe ? [record, ...nested] : nested;
}

function parseRecipeFromHtml(html: string) {
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const candidates: Array<Record<string, unknown>> = [];
  let match: RegExpExecArray | null = scriptRegex.exec(html);

  while (match) {
    const rawJson = match[1]?.trim();
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        candidates.push(...collectRecipeCandidates(parsed));
      } catch {
        // ignore invalid JSON-LD script blocks
      }
    }
    match = scriptRegex.exec(html);
  }

  if (candidates.length === 0) {
    throw new Error("No JSON-LD Recipe data found at this URL.");
  }

  return candidates[0];
}

async function upsertProductRecipe({
  productId,
  recipeData,
}: {
  productId: string;
  recipeData: {
    sourceUrl?: string;
    sourceName?: string;
    instructions?: string;
    yieldQuantity: number;
    yieldUnit: string;
    lines: Array<{
      ingredientId: string;
      quantity: number;
      unit: "g" | "kg" | "ml" | "l";
      notes?: string;
      position: number;
    }>;
  } | null;
}) {
  const existingRecipe = await db.query.recipes.findFirst({
    where: eq(recipes.productId, productId),
    columns: { id: true },
  });

  if (!recipeData) {
    if (existingRecipe) {
      await db.delete(recipes).where(eq(recipes.id, existingRecipe.id));
    }
    return;
  }

  let recipeId = existingRecipe?.id;
  if (recipeId) {
    await db
      .update(recipes)
      .set({
        sourceUrl: recipeData.sourceUrl ?? null,
        sourceName: recipeData.sourceName ?? null,
        instructions: recipeData.instructions ?? null,
        yieldQuantity: recipeData.yieldQuantity.toFixed(3),
        yieldUnit: recipeData.yieldUnit,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId));
  } else {
    const [createdRecipe] = await db
      .insert(recipes)
      .values({
        productId,
        sourceUrl: recipeData.sourceUrl ?? null,
        sourceName: recipeData.sourceName ?? null,
        instructions: recipeData.instructions ?? null,
        yieldQuantity: recipeData.yieldQuantity.toFixed(3),
        yieldUnit: recipeData.yieldUnit,
      })
      .returning({ id: recipes.id });
    recipeId = createdRecipe.id;
  }

  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));
  if (recipeData.lines.length > 0) {
    await db.insert(recipeIngredients).values(
      recipeData.lines.map((line, index) => ({
        recipeId,
        ingredientId: line.ingredientId,
        quantity: line.quantity.toFixed(3),
        unit: line.unit,
        notes: line.notes || null,
        position: index,
      })),
    );
  }
}

export async function filterProducts({ query }: { query: string }) {
  noStore();
  try {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length === 0) {
      return {
        data: null,
        error: null,
      };
    }

    const directProductMatches = await db.query.products.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      with: {
        category: {
          columns: {
            name: true,
          },
        },
      },
      where: (table, { and, eq, or, ilike }) =>
        and(
          eq(table.status, "active"),
          or(
            ilike(table.name, `%${normalizedQuery}%`),
            ilike(table.slug, `%${normalizedQuery}%`),
            ilike(table.description, `%${normalizedQuery}%`),
          ),
        ),
      orderBy: (table, { asc }) => [asc(table.name)],
      limit: 24,
    });

    const categoryMatches = await db.query.categories.findMany({
      columns: {
        name: true,
      },
      where: (table, { ilike }) => ilike(table.name, `%${normalizedQuery}%`),
      with: {
        products: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
          where: (table, { eq }) => eq(table.status, "active"),
          orderBy: (table, { asc }) => [asc(table.name)],
        },
      },
    });

    type SearchResultProduct = {
      id: string;
      name: string;
      slug: string;
      group: string;
      score: number;
    };

    const loweredQuery = normalizedQuery.toLowerCase();
    const byProductId = new Map<string, SearchResultProduct>();

    for (const product of directProductMatches) {
      const loweredName = product.name.toLowerCase();
      const loweredSlug = product.slug.toLowerCase();
      const loweredDescription = product.description?.toLowerCase() ?? "";

      const score = loweredName.startsWith(loweredQuery)
        ? 0
        : loweredName.includes(loweredQuery)
          ? 1
          : loweredSlug.includes(loweredQuery)
            ? 2
            : loweredDescription.includes(loweredQuery)
              ? 3
              : 4;

      byProductId.set(product.id, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        group: product.category?.name ?? "Products",
        score,
      });
    }

    for (const category of categoryMatches) {
      for (const product of category.products) {
        if (byProductId.has(product.id)) continue;
        byProductId.set(product.id, {
          id: product.id,
          name: product.name,
          slug: product.slug,
          group: category.name,
          score: 5,
        });
      }
    }

    const rankedProducts = [...byProductId.values()].sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return a.name.localeCompare(b.name);
    });

    const grouped = new Map<
      string,
      {
        name: string;
        products: Array<{ id: string; name: string; slug: string }>;
      }
    >();

    for (const product of rankedProducts) {
      if (!grouped.has(product.group)) {
        grouped.set(product.group, {
          name: product.group,
          products: [],
        });
      }

      grouped.get(product.group)?.products.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
      });
    }

    return {
      data: [...grouped.values()],
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function createProduct(
  rawData: unknown,
  variantsList: {
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
  }[],
  tagIds: string[],
  rawBundleData?: unknown,
) {
  try {
    await assertAdminSession();

    const data = createProductSchema.parse(rawData);
    const bundleData =
      data.productType === "bundle"
        ? bundleInputSchema.parse(rawBundleData)
        : null;

    const [product] = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        sku: data.sku,
        dietaryInfo: data.dietaryInfo,
        ingredientsInfo: data.ingredientsInfo,
        sizesAndServes: data.sizesAndServes,
        shelfLifeStorage: data.shelfLifeStorage,
        arrivalInfo: data.arrivalInfo,
        deliveryOptions: data.deliveryOptions,
        categoryId: data.categoryId,
        productType: data.productType,
        status: data.status,
        images: data.images,
        leadTimeDays: data.leadTimeDays,
        isCollectionOnly: data.isCollectionOnly,
        availableDays: data.availableDays,
      })
      .returning();
    await writeAuditLog({
      entityType: "product",
      entityId: product.id,
      action: "create",
      afterData: product,
    });
    await createAdminOperationalNotification({
      subject: "Product created",
      message: `Product ${product.name} (${product.id}) was created.`,
      status: "sent",
    });

    // Insert variants
    if (variantsList.length > 0) {
      await db.insert(productVariants).values(
        variantsList.map((v, i) => ({
          productId: product.id,
          name: v.name,
          sku:
            v.sku ||
            `${product.slug}-${v.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          position: i,
          disabled: false,
        })),
      );
    }

    // Link tags
    if (tagIds.length > 0) {
      await db.insert(productTags).values(
        tagIds.map((tId) => ({
          productId: product.id,
          tagId: tId,
        })),
      );
    }

    if (bundleData) {
      const [bundle] = await db
        .insert(productBundles)
        .values({
          productId: product.id,
          pricingMode: bundleData.pricingMode,
          fixedPrice:
            bundleData.pricingMode === "fixed_price"
              ? (bundleData.fixedPrice ?? null)
              : null,
          percentageDiscount:
            bundleData.pricingMode === "percentage_discount"
              ? (bundleData.percentageDiscount ?? null)
              : null,
        })
        .returning();

      await db.insert(productBundleItems).values(
        bundleData.items.map((item, index) => ({
          bundleId: bundle.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          position: index,
        })),
      );
    }

    const normalizedRecipeLines =
      data.recipe?.lines
        .filter(
          (line) =>
            line.ingredientId.trim().length > 0 &&
            Number.isFinite(line.quantity) &&
            line.quantity > 0,
        )
        .map((line, index) => ({
          ingredientId: line.ingredientId,
          quantity: line.quantity,
          unit: line.unit,
          notes: line.notes?.trim() || undefined,
          position: index,
        })) ?? [];

    const hasRecipeData =
      Boolean(data.recipe?.instructions?.trim()) ||
      Boolean(data.recipe?.sourceUrl?.trim()) ||
      normalizedRecipeLines.length > 0;

    await upsertProductRecipe({
      productId: product.id,
      recipeData: hasRecipeData
        ? {
            sourceUrl: data.recipe?.sourceUrl?.trim() || undefined,
            sourceName: data.recipe?.sourceName?.trim() || undefined,
            instructions: data.recipe?.instructions?.trim() || undefined,
            yieldQuantity: data.recipe?.yieldQuantity ?? 1,
            yieldUnit: data.recipe?.yieldUnit?.trim() || "batch",
            lines: normalizedRecipeLines,
          }
        : null,
    });

    // Trigger background sync task with Stripe (Optional, handles asynchronously)
    try {
      await tasks.trigger("sync-product-with-stripe", {
        productId: product.id,
      });
    } catch (taskErr) {
      console.warn(
        "Failed to fire Stripe background task, manual sync available:",
        taskErr,
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/store");
    return { success: true, product };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Product creation failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    console.error("Create product error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to create product.",
    };
  }
}

export async function updateProduct(
  id: string,
  rawData: unknown,
  variantsList: {
    id?: string;
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
  }[],
  tagIds: string[],
  rawBundleData?: unknown,
) {
  try {
    await assertAdminSession();

    const data = updateProductSchema.parse(
      mergeRawProductDataWithId(rawData, id),
    );
    const previousProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    const bundleData =
      data.productType === "bundle"
        ? bundleInputSchema.parse(rawBundleData)
        : null;

    const [product] = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        sku: data.sku,
        dietaryInfo: data.dietaryInfo,
        ingredientsInfo: data.ingredientsInfo,
        sizesAndServes: data.sizesAndServes,
        shelfLifeStorage: data.shelfLifeStorage,
        arrivalInfo: data.arrivalInfo,
        deliveryOptions: data.deliveryOptions,
        categoryId: data.categoryId,
        productType: data.productType,
        status: data.status,
        images: data.images,
        leadTimeDays: data.leadTimeDays,
        isCollectionOnly: data.isCollectionOnly,
        availableDays: data.availableDays,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    await writeAuditLog({
      entityType: "product",
      entityId: id,
      action: "update",
      beforeData: previousProduct ?? null,
      afterData: product,
    });
    await createAdminOperationalNotification({
      subject: "Product updated",
      message: `Product ${product.name} (${id}) was updated.`,
      status: "sent",
    });

    const existingVariants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, id),
      columns: { id: true },
    });
    const existingVariantIds = new Set(existingVariants.map((v) => v.id));
    const incomingVariantIds = new Set(
      variantsList
        .map((v) => v.id)
        .filter((variantId): variantId is string => Boolean(variantId)),
    );

    for (const [index, variant] of variantsList.entries()) {
      const variantPayload = {
        name: variant.name,
        sku:
          variant.sku ||
          `${product.slug}-${variant.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice || null,
        position: index,
        disabled: false,
        updatedAt: new Date(),
      };

      if (variant.id && existingVariantIds.has(variant.id)) {
        await db
          .update(productVariants)
          .set(variantPayload)
          .where(eq(productVariants.id, variant.id));
      } else {
        await db.insert(productVariants).values({
          productId: id,
          ...variantPayload,
        });
      }
    }

    for (const existingId of existingVariantIds) {
      if (!incomingVariantIds.has(existingId)) {
        await db
          .delete(productVariants)
          .where(eq(productVariants.id, existingId));
      }
    }

    // Update tags
    await db.delete(productTags).where(eq(productTags.productId, id));
    if (tagIds.length > 0) {
      await db.insert(productTags).values(
        tagIds.map((tId) => ({
          productId: id,
          tagId: tId,
        })),
      );
    }

    const existingBundle = await db.query.productBundles.findFirst({
      where: eq(productBundles.productId, id),
      columns: {
        id: true,
      },
    });

    if (bundleData) {
      let bundleId = existingBundle?.id;
      if (bundleId) {
        await db
          .update(productBundles)
          .set({
            pricingMode: bundleData.pricingMode,
            fixedPrice:
              bundleData.pricingMode === "fixed_price"
                ? (bundleData.fixedPrice ?? null)
                : null,
            percentageDiscount:
              bundleData.pricingMode === "percentage_discount"
                ? (bundleData.percentageDiscount ?? null)
                : null,
            updatedAt: new Date(),
          })
          .where(eq(productBundles.id, bundleId));
      } else {
        const [createdBundle] = await db
          .insert(productBundles)
          .values({
            productId: id,
            pricingMode: bundleData.pricingMode,
            fixedPrice:
              bundleData.pricingMode === "fixed_price"
                ? (bundleData.fixedPrice ?? null)
                : null,
            percentageDiscount:
              bundleData.pricingMode === "percentage_discount"
                ? (bundleData.percentageDiscount ?? null)
                : null,
          })
          .returning();
        bundleId = createdBundle.id;
      }

      await db
        .delete(productBundleItems)
        .where(eq(productBundleItems.bundleId, bundleId));

      await db.insert(productBundleItems).values(
        bundleData.items.map((item, index) => ({
          bundleId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          position: index,
        })),
      );
    } else if (existingBundle) {
      await db
        .delete(productBundles)
        .where(eq(productBundles.id, existingBundle.id));
    }

    const normalizedRecipeLines =
      data.recipe?.lines
        .filter(
          (line) =>
            line.ingredientId.trim().length > 0 &&
            Number.isFinite(line.quantity) &&
            line.quantity > 0,
        )
        .map((line, index) => ({
          ingredientId: line.ingredientId,
          quantity: line.quantity,
          unit: line.unit,
          notes: line.notes?.trim() || undefined,
          position: index,
        })) ?? [];

    const hasRecipeData =
      Boolean(data.recipe?.instructions?.trim()) ||
      Boolean(data.recipe?.sourceUrl?.trim()) ||
      normalizedRecipeLines.length > 0;

    await upsertProductRecipe({
      productId: id,
      recipeData: hasRecipeData
        ? {
            sourceUrl: data.recipe?.sourceUrl?.trim() || undefined,
            sourceName: data.recipe?.sourceName?.trim() || undefined,
            instructions: data.recipe?.instructions?.trim() || undefined,
            yieldQuantity: data.recipe?.yieldQuantity ?? 1,
            yieldUnit: data.recipe?.yieldUnit?.trim() || "batch",
            lines: normalizedRecipeLines,
          }
        : null,
    });

    // Sync changes to Stripe
    try {
      await tasks.trigger("sync-product-with-stripe", { productId: id });
    } catch (taskErr) {
      console.warn(
        "Failed to fire Stripe update task, manual sync available:",
        taskErr,
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/store");
    return { success: true, product };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Product update failed",
      message: `Product ${id} failed to update: ${getErrorMessage(error)}`,
      status: "failed",
    });
    console.error("Update product error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to update product.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await assertAdminSession();

    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    // 1. Archive on Stripe first (if it exists there)
    try {
      await stripe.products.update(id, { active: false });
    } catch (stripeErr) {
      console.warn(
        "Could not archive product on Stripe (maybe it didn't exist there yet):",
        stripeErr,
      );
    }

    // 2. Archive locally instead of hard deleting
    await db
      .update(products)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    if (existing) {
      await writeAuditLog({
        entityType: "product",
        entityId: id,
        action: "archive",
        beforeData: existing,
        afterData: { ...existing, status: "archived" },
      });
      await createAdminOperationalNotification({
        subject: "Product archived",
        message: `Product ${existing.name} (${id}) was archived.`,
        status: "sent",
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: true, message: "Product archived successfully." };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Product archive failed",
      message: `Product ${id} failed to archive: ${getErrorMessage(error)}`,
      status: "failed",
    });
    console.error("Delete product error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to delete product.",
    };
  }
}

export async function syncProductToStripeAction(productId: string) {
  try {
    await assertAdminSession();

    // Trigger task immediately or run logic manually
    await tasks.trigger("sync-product-with-stripe", { productId });
    return {
      success: true,
      message: "Sync task successfully triggered in the background! 🏷️",
    };
  } catch (error: unknown) {
    console.error("Sync product action error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to trigger product sync.",
    };
  }
}

export async function importRecipeFromUrl(rawUrl: string) {
  try {
    await assertAdminSession();

    const { url } = importRecipeUrlSchema.parse({ url: rawUrl });
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Could not fetch recipe URL.");
    }

    const html = await response.text();
    const recipe = parseRecipeFromHtml(html);
    const recipeName =
      typeof recipe.name === "string" ? recipe.name.trim() : "Imported recipe";
    const rawIngredients = Array.isArray(recipe.recipeIngredient)
      ? recipe.recipeIngredient
      : [];
    const rawInstructions = Array.isArray(recipe.recipeInstructions)
      ? recipe.recipeInstructions
          .map((entry) => {
            if (typeof entry === "string") return entry;
            if (entry && typeof entry === "object") {
              const text = (entry as Record<string, unknown>).text;
              return typeof text === "string" ? text : "";
            }
            return "";
          })
          .filter((line) => line.trim().length > 0)
          .join("\n")
      : typeof recipe.recipeInstructions === "string"
        ? recipe.recipeInstructions
        : "";
    const rawYield = recipe.recipeYield;
    const numericYieldMatch =
      typeof rawYield === "string" ? rawYield.match(/(\d+(?:[.,]\d+)?)/) : null;
    const yieldQuantity = numericYieldMatch
      ? Number.parseFloat(numericYieldMatch[1].replace(",", "."))
      : 1;

    const knownIngredients = await db.query.ingredients.findMany({
      columns: {
        id: true,
        slug: true,
      },
    });
    const ingredientBySlug = new Map(
      knownIngredients.map((ingredient) => [ingredient.slug, ingredient]),
    );

    const createdIngredients: Array<{
      id: string;
      name: string;
      slug: string;
    }> = [];
    const lines: Array<{
      ingredientId: string | undefined;
      quantity: number;
      unit: "g" | "kg" | "ml" | "l";
      notes: string;
      position: number;
    }> = [];

    for (const [index, entry] of rawIngredients.entries()) {
      if (typeof entry !== "string") continue;

      const parsed = parseIngredientLine(entry);
      const slug = slugifyValue(parsed.name);
      let matchedIngredient = ingredientBySlug.get(slug);

      if (!matchedIngredient) {
        const baseUnit =
          parsed.unit === "ml" || parsed.unit === "l" ? "ml" : "g";
        const purchaseUnit =
          parsed.unit === "kg"
            ? "kg"
            : parsed.unit === "l"
              ? "l"
              : parsed.unit === "ml"
                ? "ml"
                : "g";
        const [createdIngredient] = await db
          .insert(ingredients)
          .values({
            name: parsed.name,
            slug,
            baseUnit,
            purchaseUnit,
            purchaseQuantity: "1.000",
            purchasePrice: "0.00",
            costPerBaseUnit: "0.00000000",
            pricingStatus: "needs_pricing",
            queueStatus: "queued",
            supplier: "Imported from recipe",
          })
          .returning({
            id: ingredients.id,
            name: ingredients.name,
            slug: ingredients.slug,
          });

        matchedIngredient = createdIngredient;
        ingredientBySlug.set(slug, createdIngredient);
        createdIngredients.push(createdIngredient);
      }

      lines.push({
        ingredientId: matchedIngredient?.id,
        quantity: parsed.quantity,
        unit: parsed.unit,
        notes: entry,
        position: index,
      });
    }

    if (createdIngredients.length > 0) {
      await createAdminAlertNotification({
        subject: "Imported ingredients need pricing",
        message: `${createdIngredients.length} placeholder ingredient(s) were created from recipe import.`,
      });
      await Promise.all(
        createdIngredients.map((ingredient) =>
          writeAuditLog({
            entityType: "ingredient",
            entityId: ingredient.id,
            action: "create_placeholder_from_recipe",
            afterData: ingredient,
          }),
        ),
      );
      revalidatePath("/admin/ingredients");
      revalidatePath("/admin");
    }

    return {
      success: true,
      data: {
        sourceUrl: url,
        sourceName: recipeName,
        instructions: rawInstructions,
        yieldQuantity:
          Number.isFinite(yieldQuantity) && yieldQuantity > 0
            ? yieldQuantity
            : 1,
        yieldUnit: "batch",
        lines,
        createdIngredients,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
