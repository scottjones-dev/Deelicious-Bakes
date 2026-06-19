import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { products } from "./products";
import { lifecycleDates } from "./utils";
import { productVariants } from "./variants";

export const bundlePricingModeEnum = pgEnum("bundle_pricing_mode", [
  "fixed_price",
  "percentage_discount",
]);

export const productBundles = pgTable(
  "product_bundles",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    pricingMode: bundlePricingModeEnum("pricing_mode").notNull(),
    fixedPrice: decimal("fixed_price", { precision: 10, scale: 2 }),
    percentageDiscount: decimal("percentage_discount", {
      precision: 6,
      scale: 2,
    }),
    ...lifecycleDates,
  },
  (table) => ({
    productIdUniqueIdx: uniqueIndex("product_bundles_product_id_unique").on(
      table.productId,
    ),
  }),
);

export const productBundleItems = pgTable(
  "product_bundle_items",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    bundleId: varchar("bundle_id", { length: 30 })
      .references(() => productBundles.id, { onDelete: "cascade" })
      .notNull(),
    productVariantId: varchar("product_variant_id", { length: 30 })
      .references(() => productVariants.id, { onDelete: "restrict" })
      .notNull(),
    quantity: integer("quantity").notNull().default(1),
    position: integer("position").notNull().default(0),
    ...lifecycleDates,
  },
  (table) => ({
    bundleIdIdx: index("product_bundle_items_bundle_id_idx").on(table.bundleId),
    productVariantIdIdx: index("product_bundle_items_variant_id_idx").on(
      table.productVariantId,
    ),
  }),
);

export const productBundlesRelations = relations(
  productBundles,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productBundles.productId],
      references: [products.id],
    }),
    items: many(productBundleItems),
  }),
);

export const productBundleItemsRelations = relations(
  productBundleItems,
  ({ one }) => ({
    bundle: one(productBundles, {
      fields: [productBundleItems.bundleId],
      references: [productBundles.id],
    }),
    variant: one(productVariants, {
      fields: [productBundleItems.productVariantId],
      references: [productVariants.id],
    }),
  }),
);

export type ProductBundle = typeof productBundles.$inferSelect;
export type NewProductBundle = typeof productBundles.$inferInsert;
export type ProductBundleItem = typeof productBundleItems.$inferSelect;
export type NewProductBundleItem = typeof productBundleItems.$inferInsert;
