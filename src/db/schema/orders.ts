import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { OrderItemCustomizations } from "@/lib/validations/cart";

import { generateId } from "@/utils/id";

import { addresses } from "./addresses";
import { customers } from "./customers";
import { products } from "./products";
import { lifecycleDates } from "./utils";
import { productVariants } from "./variants";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "ready_for_collection",
  "completed",
  "cancelled",
  "refunded",
]);

export const orderFulfillmentMethodEnum = pgEnum("order_fulfillment_method", [
  "delivery",
  "collection",
]);

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    customerId: varchar("customer_id", { length: 30 })
      .references(() => customers.id)
      .notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    fulfillmentMethod: orderFulfillmentMethodEnum("fulfillment_method")
      .notNull()
      .default("delivery"),
    billingAddressId: varchar("billing_address_id", {
      length: 30,
    }).references(() => addresses.id, { onDelete: "set null" }),
    deliveryAddressId: varchar("delivery_address_id", {
      length: 30,
    }).references(() => addresses.id, { onDelete: "set null" }), // null for collection orders
    // snapshot of customer contact details at the time of order
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    note: text("note"), // e.g. general delivery/collection instructions
    fulfillmentDate: timestamp("fulfillment_date"), // Scheduled date for pick-up or delivery
    fulfillmentTimeSlot: text("fulfillment_time_slot"), // e.g. "09:00 - 11:00" or "Afternoon"
    subtotal: decimal("subtotal", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("gbp"),
    stripePaymentIntentId: text("stripe_payment_intent_id"), // denormalized for quick lookup; payments table is source of truth
    ...lifecycleDates,
  },
  (table) => ({
    customerIdIdx: index("orders_customer_id_idx").on(table.customerId),
    statusIdx: index("orders_status_idx").on(table.status),
    billingAddressIdIdx: index("orders_billing_address_id_idx").on(
      table.billingAddressId,
    ),
    deliveryAddressIdIdx: index("orders_delivery_address_id_idx").on(
      table.deliveryAddressId,
    ),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  deliveryAddress: one(addresses, {
    fields: [orders.deliveryAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type OrderFulfillmentMethod =
  (typeof orderFulfillmentMethodEnum.enumValues)[number];

// immutable line-item snapshot — decoupled from live product/variant data
// so historical orders never change if a product is later edited, repriced, or deleted
export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    orderId: varchar("order_id", { length: 30 })
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: varchar("product_id", { length: 30 }).references(
      () => products.id,
      { onDelete: "set null" },
    ),
    productVariantId: varchar("product_variant_id", {
      length: 30,
    }).references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    sku: varchar("sku", { length: 64 }),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
    customizations: json("customizations")
      .$type<OrderItemCustomizations | null>()
      .default(null),
    createdAt: lifecycleDates.createdAt,
  },
  (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
    productIdIdx: index("order_items_product_id_idx").on(table.productId),
    productVariantIdIdx: index("order_items_product_variant_id_idx").on(
      table.productVariantId,
    ),
  }),
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
