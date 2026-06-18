import * as z from "zod";
import { recipeInputSchema } from "./recipe";

export const storedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.url(),
  key: z.string(),
  size: z.number(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  dietaryInfo: z.string().optional().nullable(),
  ingredientsInfo: z.string().optional().nullable(),
  sizesAndServes: z.string().optional().nullable(),
  shelfLifeStorage: z.string().optional().nullable(),
  arrivalInfo: z.string().optional().nullable(),
  deliveryOptions: z.string().optional().nullable(),
  images: z.array(storedFileSchema).nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  productType: z.enum(["standard", "bundle"]).default("standard"),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  leadTimeDays: z.number().int().nonnegative().default(0),
  isCollectionOnly: z.boolean().default(false),
  availableDays: z.array(z.number().int().min(0).max(6)).nullable().optional(),
  recipe: recipeInputSchema.optional(),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1, "Product ID is required"),
});

export const filterProductsSchema = z.object({
  query: z.string(),
});

export const getProductInventorySchema = z.object({
  id: z.string(),
});

export const getProductsSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const updateProductRatingSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type FilterProductsSchema = z.infer<typeof filterProductsSchema>;
export type GetProductInventorySchema = z.infer<
  typeof getProductInventorySchema
>;
export type GetProductsSchema = z.infer<typeof getProductsSchema>;
export type UpdateProductRatingSchema = z.infer<
  typeof updateProductRatingSchema
>;
