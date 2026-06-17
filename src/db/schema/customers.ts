import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { generateId } from "@/utils/id";

import { user } from "./auth";
import { addresses } from "./addresses";
import { orders } from "./orders";
import { lifecycleDates } from "./utils";

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    // null for guest checkouts — a customer record always exists,
    // but it is only tied to a Better Auth user once they sign in/up
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" })
      .unique(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    stripeCustomerId: text("stripe_customer_id").unique(),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    ...lifecycleDates,
  },
  (table) => ({
    userIdIdx: index("customers_user_id_idx").on(table.userId),
    emailIdx: index("customers_email_idx").on(table.email),
    stripeCustomerIdIdx: index("customers_stripe_customer_id_idx").on(
      table.stripeCustomerId,
    ),
  }),
);

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
