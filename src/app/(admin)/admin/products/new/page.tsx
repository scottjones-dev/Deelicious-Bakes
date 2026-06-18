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

  const availableVariants = await db.query.productVariants.findMany({
    columns: {
      id: true,
      name: true,
      price: true,
    },
    where: (table, { eq }) => eq(table.disabled, false),
    with: {
      product: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (table, { asc }) => [asc(table.createdAt)],
  });

  const allIngredients = await db.query.ingredients.findMany({
    columns: {
      id: true,
      name: true,
      baseUnit: true,
      costPerBaseUnit: true,
    },
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return (
    <CreateProductForm
      categories={allCategories}
      availableVariants={availableVariants}
      ingredients={allIngredients}
    />
  );
}
