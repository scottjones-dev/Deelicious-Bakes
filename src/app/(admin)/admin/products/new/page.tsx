import { db } from "@/db";
import { categories } from "@/db/schema";
import { CreateProductForm } from "./create-product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  // 1. Fetch actual categories from database
  let allCategories = await db.query.categories.findMany({
    orderBy: (categories) => [categories.name],
  });

  // 2. Fallback: If no categories exist in the database, automatically initialize the default "Uncategorized" category so we always have a target
  if (allCategories.length === 0) {
    const [uncat] = await db
      .insert(categories)
      .values({
        name: "Uncategorized",
        slug: "uncategorized",
        description: "Default fallback category for catalog items.",
      })
      .returning();
    allCategories = [uncat];
  }

  return <CreateProductForm categories={allCategories} />;
}
