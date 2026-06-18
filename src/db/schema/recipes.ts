import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { ingredients } from "./ingredients";
import { products } from "./products";
import { lifecycleDates } from "./utils";

export const recipeQuantityUnitEnum = pgEnum("recipe_quantity_unit", [
  "g",
  "kg",
  "ml",
  "l",
]);

export const recipes = pgTable(
  "recipes",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    instructions: text("instructions"),
    yieldQuantity: decimal("yield_quantity", { precision: 10, scale: 3 })
      .notNull()
      .default("1"),
    yieldUnit: varchar("yield_unit", { length: 30 }).notNull().default("batch"),
    ...lifecycleDates,
  },
  (table) => ({
    productIdUniqueIdx: uniqueIndex("recipes_product_id_unique").on(
      table.productId,
    ),
  }),
);

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    recipeId: varchar("recipe_id", { length: 30 })
      .references(() => recipes.id, { onDelete: "cascade" })
      .notNull(),
    ingredientId: varchar("ingredient_id", { length: 30 })
      .references(() => ingredients.id, { onDelete: "restrict" })
      .notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
    unit: recipeQuantityUnitEnum("unit").notNull(),
    notes: text("notes"),
    position: integer("position").notNull().default(0),
    ...lifecycleDates,
  },
  (table) => ({
    recipeIdIdx: index("recipe_ingredients_recipe_id_idx").on(table.recipeId),
    ingredientIdIdx: index("recipe_ingredients_ingredient_id_idx").on(
      table.ingredientId,
    ),
  }),
);

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  product: one(products, {
    fields: [recipes.productId],
    references: [products.id],
  }),
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  }),
);

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;
