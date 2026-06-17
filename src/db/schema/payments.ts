import { relations } from "drizzle-orm"
import {
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { generateId } from "@/utils/id"

import { orders } from "./orders"
import { lifecycleDates } from "./utils"

export const paymentStatusEnum = pgEnum("payment_status", [
  "requires_payment_method",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "partially_refunded",
  "canceled",
])

export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    orderId: varchar("order_id", { length: 30 })
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 256,
    })
      .notNull()
      .unique(),
    stripeChargeId: varchar("stripe_charge_id", { length: 256 }),
    status: paymentStatusEnum("status")
      .notNull()
      .default("requires_payment_method"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("gbp"),
    refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    paidAt: timestamp("paid_at"),
    refundedAt: timestamp("refunded_at"),
    ...lifecycleDates,
  },
  (table) => ({
    orderIdIdx: index("payments_order_id_idx").on(table.orderId),
    stripePaymentIntentIdIdx: index(
      "payments_stripe_payment_intent_id_idx"
    ).on(table.stripePaymentIntentId),
  })
)

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}))

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
