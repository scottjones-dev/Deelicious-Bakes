import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/utils/id";

import { customers } from "./customers";
import { lifecycleDates } from "./utils";

export const addressTypeEnum = pgEnum("address_type", ["billing", "delivery"]);

export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    customerId: varchar("customer_id", { length: 30 })
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    type: addressTypeEnum("type").notNull().default("delivery"),
    label: text("label"), // e.g. "Home", "Work"
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("GB"),
    phone: text("phone"), // delivery contact number
    isDefault: boolean("is_default").notNull().default(false),
    ...lifecycleDates,
  },
  (table) => ({
    customerIdIdx: index("addresses_customer_id_idx").on(table.customerId),
  }),
);

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
}));

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
