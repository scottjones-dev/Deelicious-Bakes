import { relations } from "drizzle-orm"
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { generateId } from "@/utils/id"

import { carts } from "./carts"
import { customers } from "./customers"
import { orders } from "./orders"
import { lifecycleDates } from "./utils"

export const notificationTypeEnum = pgEnum("notification_type", [
  "order_confirmation",
  "order_status_update",
  "abandoned_cart",
  "payment_receipt",
  "refund_confirmation",
  "marketing",
])

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "sms", // not sent yet, but the schema is ready for it
])

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
  "delivered",
])

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    customerId: varchar("customer_id", { length: 30 }).references(
      () => customers.id,
      { onDelete: "set null" }
    ),
    orderId: varchar("order_id", { length: 30 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    cartId: varchar("cart_id", { length: 30 }).references(() => carts.id, {
      onDelete: "set null",
    }),
    type: notificationTypeEnum("type").notNull(),
    channel: notificationChannelEnum("channel").notNull().default("email"),
    recipient: text("recipient").notNull(), // email address or phone number
    subject: text("subject"),
    status: notificationStatusEnum("status").notNull().default("pending"),
    sentAt: timestamp("sent_at"),
    errorMessage: text("error_message"),
    ...lifecycleDates,
  },
  (table) => ({
    customerIdIdx: index("notifications_customer_id_idx").on(
      table.customerId
    ),
    orderIdIdx: index("notifications_order_id_idx").on(table.orderId),
    cartIdIdx: index("notifications_cart_id_idx").on(table.cartId),
    typeIdx: index("notifications_type_idx").on(table.type),
  })
)

export const notificationsRelations = relations(notifications, ({ one }) => ({
  customer: one(customers, {
    fields: [notifications.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
  cart: one(carts, {
    fields: [notifications.cartId],
    references: [carts.id],
  }),
}))

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
