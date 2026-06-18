import { z } from "zod";

export const ingredientBaseUnitSchema = z.enum(["g", "ml"]);
export const ingredientPurchaseUnitSchema = z.enum(["g", "kg", "ml", "l"]);

export const ingredientInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  baseUnit: ingredientBaseUnitSchema,
  purchaseUnit: ingredientPurchaseUnitSchema,
  purchaseQuantity: z.number().positive("Purchase quantity must be positive"),
  purchasePrice: z.number().nonnegative("Purchase price cannot be negative"),
  supplier: z.string().optional(),
});

export type IngredientInputSchema = z.infer<typeof ingredientInputSchema>;
