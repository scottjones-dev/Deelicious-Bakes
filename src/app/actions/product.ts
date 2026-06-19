"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { db } from "@/db";
import { products, productTags, productVariants } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "An unknown error occurred";
}

export async function filterProducts({ query }: { query: string }) {
  noStore();
  try {
    if (query.length === 0) {
      return {
        data: null,
        error: null,
      };
    }

    const categoriesWithProducts = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        products: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      where: (table, { ilike }) => ilike(table.name, `%${query}%`),
    });

    return {
      data: categoriesWithProducts,
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
) {
  try {
    const data = createProductSchema.parse(rawData);

    const [product] = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        categoryId: data.categoryId,
        status: data.status,
        images: data.images,
        leadTimeDays: data.leadTimeDays,
        isCollectionOnly: data.isCollectionOnly,
        availableDays: data.availableDays,
      })
      .returning();

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
    return { success: true, product };
  } catch (error: any) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: error.message || "Failed to create product.",
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
) {
  try {
    const data = updateProductSchema.parse({ ...(rawData as any), id });

    const [product] = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        categoryId: data.categoryId,
        status: data.status,
        images: data.images,
        leadTimeDays: data.leadTimeDays,
        isCollectionOnly: data.isCollectionOnly,
        availableDays: data.availableDays,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // Simple variant replacement strategy (for simplicity & clean state)
    await db.delete(productVariants).where(eq(productVariants.productId, id));

    // Insert new variants list
    if (variantsList.length > 0) {
      await db.insert(productVariants).values(
        variantsList.map((v, i) => ({
          productId: id,
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
    return { success: true, product };
  } catch (error: any) {
    console.error("Update product error:", error);
    return {
      success: false,
      error: error.message || "Failed to update product.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    // 1. Delete on Stripe first (archive so it doesn't show up in listings)
    try {
      await stripe.products.update(id, { active: false });
    } catch (stripeErr) {
      console.warn(
        "Could not archive product on Stripe (maybe it didn't exist there yet):",
        stripeErr,
      );
    }

    // 2. Cascade delete from local DB
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product.",
    };
  }
}

export async function syncProductToStripeAction(productId: string) {
  try {
    // Trigger task immediately or run logic manually
    await tasks.trigger("sync-product-with-stripe", { productId });
    return {
      success: true,
      message: "Sync task successfully triggered in the background! 🏷️",
    };
  } catch (error: any) {
    console.error("Sync product action error:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger product sync.",
    };
  }
}
