import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/utils/id";
import { customers } from "./customers";
import { orders } from "./orders";
import { products } from "./products";
import { lifecycleDates } from "./utils";

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    productId: varchar("product_id", { length: 30 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    customerId: varchar("customer_id", { length: 30 }).references(
      () => customers.id,
      { onDelete: "cascade" },
    ),
    orderId: varchar("order_id", { length: 30 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(), // 1 to 5
    title: text("title"),
    comment: text("comment").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    status: reviewStatusEnum("status").notNull().default("pending"),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("reviews_product_id_idx").on(table.productId),
    customerIdIdx: index("reviews_customer_id_idx").on(table.customerId),
    orderIdIdx: index("reviews_order_id_idx").on(table.orderId),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(customers, {
    fields: [reviews.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
