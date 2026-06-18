"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { assertAdminSession } from "@/lib/admin-auth";

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  try {
    await assertAdminSession();

    const [category] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        image: data.image,
      })
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Create category error:", error);
    return {
      success: false,
      error: error.message || "Failed to create category.",
    };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
  },
) {
  try {
    await assertAdminSession();

    const [category] = await db
      .update(categories)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        image: data.image,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Update category error:", error);
    return {
      success: false,
      error: error.message || "Failed to update category.",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await assertAdminSession();

    // Determine if any products are currently linked to this category
    const linkedProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, id));

    let reassignedCount = 0;

    if (linkedProducts.length > 0) {
      // Find or create default "Uncategorized" category
      let uncategorized = await db.query.categories.findFirst({
        where: eq(categories.slug, "uncategorized"),
      });

      if (!uncategorized) {
        const [newUncat] = await db
          .insert(categories)
          .values({
            name: "Uncategorized",
            slug: "uncategorized",
            description:
              "Default fallback for products with deleted categories.",
          })
          .returning();
        uncategorized = newUncat;
      }

      // Reassign products to Uncategorized
      await db
        .update(products)
        .set({ categoryId: uncategorized.id })
        .where(eq(products.categoryId, id));

      reassignedCount = linkedProducts.length;
    }

    // Delete the original category
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return {
      success: true,
      reassignedCount,
      message:
        reassignedCount > 0
          ? `Category deleted. ${reassignedCount} products were safely moved to 'Uncategorized'.`
          : "Category deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category.",
    };
  }
}
