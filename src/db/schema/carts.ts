import { relations } from "drizzle-orm";
import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/utils/id";
import { type CartItemSchema } from "@/lib/validations/cart";

import { customers } from "./customers";
import { orders } from "./orders";
import { lifecycleDates } from "./utils";

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "abandoned",
  "converted",
  "expired",
]);

export const carts = pgTable(
  "carts",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    customerId: varchar("customer_id", { length: 30 }).references(
      () => customers.id,
      { onDelete: "cascade" },
    ), // null until checkout / sign-in
    guestToken: varchar("guest_token", { length: 64 }).unique(), // anonymous cookie id
    email: text("email"), // captured early in checkout, used for abandoned-cart recovery
    items: json("items").$type<CartItemSchema[] | null>().default(null),
    status: cartStatusEnum("status").notNull().default("active"),
    paymentIntentId: varchar("payment_intent_id", { length: 256 }),
    clientSecret: text("client_secret"),
    convertedOrderId: varchar("converted_order_id", {
      length: 30,
    }).references(() => orders.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at"),
    abandonedAt: timestamp("abandoned_at"),
    recoveryEmailSentAt: timestamp("recovery_email_sent_at"),
    ...lifecycleDates,
  },
  (table) => ({
    customerIdIdx: index("carts_customer_id_idx").on(table.customerId),
    guestTokenIdx: index("carts_guest_token_idx").on(table.guestToken),
    statusIdx: index("carts_status_idx").on(table.status),
    expiresAtIdx: index("carts_expires_at_idx").on(table.expiresAt),
  }),
);

export const cartsRelations = relations(carts, ({ one }) => ({
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  convertedOrder: one(orders, {
    fields: [carts.convertedOrderId],
    references: [orders.id],
  }),
}));

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
