import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import type { StoredFile } from "@/types";

import { generateId } from "@/utils/id";

import { productBundles } from "./bundles";
import { categories } from "./categories";
import { recipes } from "./recipes";
import { productTags } from "./tags";
import { lifecycleDates } from "./utils";
import { productVariants } from "./variants";

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);

export const productTypeEnum = pgEnum("product_type", ["standard", "bundle"]);

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    sku: text("sku"),
    dietaryInfo: text("dietary_info"),
    ingredientsInfo: text("ingredients_info"),
    sizesAndServes: text("sizes_and_serves"),
    shelfLifeStorage: text("shelf_life_storage"),
    arrivalInfo: text("arrival_info"),
    deliveryOptions: text("delivery_options"),
    images: json("images").$type<StoredFile[] | null>().default(null),
    categoryId: varchar("category_id", { length: 30 })
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),
    productType: productTypeEnum("product_type").notNull().default("standard"),
    status: productStatusEnum("status").notNull().default("active"),
    leadTimeDays: integer("lead_time_days").notNull().default(0),
    isCollectionOnly: boolean("is_collection_only").notNull().default(false),
    availableDays: integer("available_days").array(), // e.g. [1, 2, 3, 4, 5, 6, 0] for Mon-Sun (0 is Sunday)
    ...lifecycleDates,
  },
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  bundle: one(productBundles, {
    fields: [products.id],
    references: [productBundles.productId],
  }),
  recipe: one(recipes, {
    fields: [products.id],
    references: [recipes.productId],
  }),
  variants: many(productVariants),
  tags: many(productTags),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
