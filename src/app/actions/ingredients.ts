"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ingredients } from "@/db/schema";
import { assertAdminSession } from "@/lib/admin-auth";
import {
  createAdminAlertNotification,
  createAdminOperationalNotification,
  writeAuditLog,
} from "@/lib/admin-events";
import { calculateCostPerBaseUnit } from "@/lib/recipe-cost";
import { ingredientInputSchema } from "@/lib/validations/ingredient";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "An unknown error occurred";
}

function getNextQueueStatus(params: {
  previousQueueStatus: "none" | "queued" | "resolved" | null | undefined;
  nextPricingStatus: "priced" | "needs_pricing";
}) {
  const { previousQueueStatus, nextPricingStatus } = params;
  if (previousQueueStatus === "queued") {
    return nextPricingStatus === "priced" ? "resolved" : "queued";
  }

  if (previousQueueStatus === "resolved") {
    return "resolved";
  }

  return "none";
}

export async function createIngredient(rawData: unknown) {
  try {
    await assertAdminSession();

    const data = ingredientInputSchema.parse(rawData);
    const costPerBaseUnit = calculateCostPerBaseUnit(
      data.purchasePrice,
      data.purchaseQuantity,
      data.purchaseUnit,
      data.baseUnit,
    );

    const [ingredient] = await db
      .insert(ingredients)
      .values({
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        baseUnit: data.baseUnit,
        purchaseUnit: data.purchaseUnit,
        purchaseQuantity: data.purchaseQuantity.toFixed(3),
        purchasePrice: data.purchasePrice.toFixed(2),
        costPerBaseUnit: costPerBaseUnit.toFixed(8),
        pricingStatus: costPerBaseUnit > 0 ? "priced" : "needs_pricing",
        queueStatus: "none",
        supplier: data.supplier?.trim() || null,
      })
      .returning();

    if (ingredient.pricingStatus === "needs_pricing") {
      await createAdminAlertNotification({
        subject: "Ingredient needs pricing",
        message: `${ingredient.name} was created without a valid cost.`,
      });
    }
    await writeAuditLog({
      entityType: "ingredient",
      entityId: ingredient.id,
      action: "create",
      afterData: ingredient,
    });
    await createAdminOperationalNotification({
      subject: "Ingredient created",
      message: `Ingredient ${ingredient.name} (${ingredient.id}) was created.`,
      status: "sent",
    });

    revalidatePath("/admin/ingredients");
    revalidatePath("/admin");
    return { success: true, ingredient };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Ingredient creation failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateIngredient(rawData: unknown) {
  try {
    await assertAdminSession();

    const data = ingredientInputSchema.parse(rawData);
    if (!data.id) {
      throw new Error("Ingredient ID is required");
    }

    const costPerBaseUnit = calculateCostPerBaseUnit(
      data.purchasePrice,
      data.purchaseQuantity,
      data.purchaseUnit,
      data.baseUnit,
    );
    const nextPricingStatus = costPerBaseUnit > 0 ? "priced" : "needs_pricing";

    const previous = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, data.id),
    });

    const [ingredient] = await db
      .update(ingredients)
      .set({
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        baseUnit: data.baseUnit,
        purchaseUnit: data.purchaseUnit,
        purchaseQuantity: data.purchaseQuantity.toFixed(3),
        purchasePrice: data.purchasePrice.toFixed(2),
        costPerBaseUnit: costPerBaseUnit.toFixed(8),
        pricingStatus: nextPricingStatus,
        queueStatus: getNextQueueStatus({
          previousQueueStatus: previous?.queueStatus,
          nextPricingStatus,
        }),
        supplier: data.supplier?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, data.id))
      .returning();

    if (previous?.pricingStatus !== "needs_pricing" && costPerBaseUnit === 0) {
      await createAdminAlertNotification({
        subject: "Ingredient moved to pricing queue",
        message: `${ingredient.name} needs pricing review.`,
      });
    }
    if (
      previous?.queueStatus === "queued" &&
      ingredient.queueStatus === "resolved"
    ) {
      await createAdminOperationalNotification({
        subject: "Ingredient queue item resolved",
        message: `${ingredient.name} was resolved from the import queue.`,
        status: "sent",
      });
    }
    await writeAuditLog({
      entityType: "ingredient",
      entityId: ingredient.id,
      action: "update",
      beforeData: previous ?? null,
      afterData: ingredient,
    });
    await createAdminOperationalNotification({
      subject: "Ingredient updated",
      message: `Ingredient ${ingredient.name} (${ingredient.id}) was updated.`,
      status: "sent",
    });

    revalidatePath("/admin/ingredients");
    revalidatePath("/admin");
    return { success: true, ingredient };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Ingredient update failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteIngredient(id: string) {
  try {
    await assertAdminSession();

    const existing = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, id),
    });
    await db.delete(ingredients).where(eq(ingredients.id, id));
    if (existing) {
      await writeAuditLog({
        entityType: "ingredient",
        entityId: id,
        action: "delete",
        beforeData: existing,
      });
      await createAdminOperationalNotification({
        subject: "Ingredient deleted",
        message: `Ingredient ${existing.name} (${id}) was deleted.`,
        status: "sent",
      });
    }
    revalidatePath("/admin/ingredients");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Ingredient deletion failed",
      message: `Ingredient ${id} failed to delete: ${getErrorMessage(error)}`,
      status: "failed",
    });
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function resolveIngredientQueue(id: string) {
  try {
    await assertAdminSession();

    const existing = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, id),
    });
    if (!existing) {
      throw new Error("Ingredient not found");
    }
    if (existing.queueStatus !== "queued") {
      return { success: true, ingredient: existing };
    }
    if (existing.pricingStatus !== "priced") {
      throw new Error(
        "Ingredient still needs pricing before it can be resolved.",
      );
    }

    const [ingredient] = await db
      .update(ingredients)
      .set({
        queueStatus: "resolved",
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();

    await writeAuditLog({
      entityType: "ingredient",
      entityId: ingredient.id,
      action: "resolve_pricing_queue",
      beforeData: existing,
      afterData: ingredient,
    });
    await createAdminOperationalNotification({
      subject: "Ingredient queue item resolved",
      message: `${ingredient.name} was marked as resolved in pricing queue.`,
      status: "sent",
    });
    revalidatePath("/admin/ingredients");
    revalidatePath("/admin");

    return { success: true, ingredient };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Ingredient queue resolve failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
