import { relations } from "drizzle-orm"
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

import { generateId } from "@/utils/id"

import { orders } from "./orders"
import { lifecycleDates } from "./utils"
import { productVariants } from "./variants"

export const stocks = pgTable(
  "stocks",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    productVariantId: varchar("product_variant_id", { length: 30 })
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull()
      .unique(), // one stock record per variant
    quantity: integer("quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold"), // powers future low-stock alerts
    ...lifecycleDates,
  },
  (table) => ({
    productVariantIdIdx: index("stocks_product_variant_id_idx").on(
      table.productVariantId
    ),
  })
)

export const stocksRelations = relations(stocks, ({ one, many }) => ({
  productVariant: one(productVariants, {
    fields: [stocks.productVariantId],
    references: [productVariants.id],
  }),
  movements: many(stockMovements),
}))

export type Stock = typeof stocks.$inferSelect
export type NewStock = typeof stocks.$inferInsert

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "restock",
  "sale",
  "adjustment",
  "return",
  "correction",
])

// immutable audit trail of every stock change
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    stockId: varchar("stock_id", { length: 30 })
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
    orderId: varchar("order_id", { length: 30 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    type: stockMovementTypeEnum("type").notNull(),
    quantityChange: integer("quantity_change").notNull(), // signed delta
    quantityAfter: integer("quantity_after").notNull(), // snapshot after change
    reason: text("reason"),
    createdAt: lifecycleDates.createdAt,
  },
  (table) => ({
    stockIdIdx: index("stock_movements_stock_id_idx").on(table.stockId),
    orderIdIdx: index("stock_movements_order_id_idx").on(table.orderId),
  })
)

export const stockMovementsRelations = relations(
  stockMovements,
  ({ one }) => ({
    stock: one(stocks, {
      fields: [stockMovements.stockId],
      references: [stocks.id],
    }),
    order: one(orders, {
      fields: [stockMovements.orderId],
      references: [orders.id],
    }),
  })
)

export type StockMovement = typeof stockMovements.$inferSelect
export type NewStockMovement = typeof stockMovements.$inferInsert
