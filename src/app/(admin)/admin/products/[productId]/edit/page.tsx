import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, recipes } from "@/db/schema";
import { EditProductForm } from "./edit-product-form";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    notFound();
  }

  const variants = await db.query.productVariants.findMany({
    where: (table, { eq: variantEq }) => variantEq(table.productId, productId),
    orderBy: (table) => [table.position],
  });

  const bundle =
    (await db.query.productBundles.findFirst({
      where: (table, { eq: bundleEq }) => bundleEq(table.productId, productId),
      columns: {
        id: true,
        pricingMode: true,
        fixedPrice: true,
        percentageDiscount: true,
      },
      with: {
        items: {
          columns: {
            productVariantId: true,
            quantity: true,
            position: true,
          },
          orderBy: (table, { asc }) => [asc(table.position)],
        },
      },
    })) ?? null;

  const availableVariants = await db.query.productVariants.findMany({
    columns: {
      id: true,
      name: true,
      price: true,
      productId: true,
    },
    where: (table, { and, eq, ne }) =>
      and(eq(table.disabled, false), ne(table.productId, productId)),
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

  const categories = await db.query.categories.findMany({
    orderBy: (table) => [table.name],
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

  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.productId, productId),
    columns: {
      id: true,
      sourceUrl: true,
      sourceName: true,
      instructions: true,
      yieldQuantity: true,
      yieldUnit: true,
    },
    with: {
      ingredients: {
        columns: {
          ingredientId: true,
          quantity: true,
          unit: true,
          notes: true,
          position: true,
        },
        orderBy: (table, { asc }) => [asc(table.position)],
      },
    },
  });

  return (
    <EditProductForm
      product={product}
      variants={variants}
      categories={categories}
      bundle={bundle}
      availableVariants={availableVariants}
      ingredients={allIngredients}
      recipe={recipe ?? null}
    />
  );
}
