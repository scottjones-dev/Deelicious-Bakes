import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/utils/id";

import { products } from "./products";
import { stocks } from "./stocks";
import { lifecycleDates } from "./utils";

// a purchasable, sellable unit of a product
// e.g. "Box of 6" / "Box of 12" / "Box of 24", or "Small" / "Medium" / "Large"
export const productVariants = pgTable(
  "product_variants",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(), // e.g. "Box of 6"
    sku: varchar("sku", { length: 64 }).unique(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    position: integer("position").notNull().default(0), // display order
    disabled: boolean("disabled").notNull().default(false),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("product_variants_product_id_idx").on(table.productId),
    productNameUnique: unique("product_variants_product_id_name_unique").on(
      table.productId,
      table.name,
    ),
  }),
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    stock: one(stocks, {
      fields: [productVariants.id],
      references: [stocks.productVariantId],
    }),
  }),
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
