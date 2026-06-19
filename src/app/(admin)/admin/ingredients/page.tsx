import { db } from "@/db";
import { IngredientManager } from "./ingredient-manager";

export const dynamic = "force-dynamic";

export default async function AdminIngredientsPage() {
  const allIngredients = await db.query.ingredients.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return <IngredientManager ingredients={allIngredients} />;
}
