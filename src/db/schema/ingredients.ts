import { relations } from "drizzle-orm";
import {
  decimal,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { recipeIngredients } from "./recipes";
import { lifecycleDates } from "./utils";

export const ingredientBaseUnitEnum = pgEnum("ingredient_base_unit", [
  "g",
  "ml",
]);

export const ingredientPurchaseUnitEnum = pgEnum("ingredient_purchase_unit", [
  "g",
  "kg",
  "ml",
  "l",
]);

export const ingredientPricingStatusEnum = pgEnum("ingredient_pricing_status", [
  "priced",
  "needs_pricing",
]);

export const ingredientQueueStatusEnum = pgEnum("ingredient_queue_status", [
  "none",
  "queued",
  "resolved",
]);

export const ingredients = pgTable(
  "ingredients",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    baseUnit: ingredientBaseUnitEnum("base_unit").notNull(),
    purchaseUnit: ingredientPurchaseUnitEnum("purchase_unit").notNull(),
    purchaseQuantity: decimal("purchase_quantity", {
      precision: 12,
      scale: 3,
    }).notNull(),
    purchasePrice: decimal("purchase_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    costPerBaseUnit: decimal("cost_per_base_unit", {
      precision: 14,
      scale: 8,
    }).notNull(),
    pricingStatus: ingredientPricingStatusEnum("pricing_status")
      .notNull()
      .default("priced"),
    queueStatus: ingredientQueueStatusEnum("queue_status")
      .notNull()
      .default("none"),
    supplier: text("supplier"),
    ...lifecycleDates,
  },
  (table) => ({
    slugUniqueIdx: uniqueIndex("ingredients_slug_unique").on(table.slug),
    nameUniqueIdx: uniqueIndex("ingredients_name_unique").on(table.name),
  }),
);

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeLines: many(recipeIngredients),
}));

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
