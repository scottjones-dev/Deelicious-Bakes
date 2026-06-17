import type { StoredFile } from "@/types"
import { relations } from "drizzle-orm"
import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

import { generateId } from "@/utils/id"

import { categories } from "./categories"
import { productTags } from "./tags"
import { lifecycleDates } from "./utils"
import { productVariants } from "./variants"

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
])

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(), // prefix_ + nanoid (12)
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    images: json("images").$type<StoredFile[] | null>().default(null),
    categoryId: varchar("category_id", { length: 30 })
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),
    status: productStatusEnum("status").notNull().default("active"),
    ...lifecycleDates,
  },
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
  })
)

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  tags: many(productTags),
}))

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
