import { z } from "zod";

export const recipeLineUnitSchema = z.enum(["g", "kg", "ml", "l"]);

export const recipeLineInputSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: recipeLineUnitSchema,
  notes: z.string().optional(),
  position: z.number().int().nonnegative(),
});

export const recipeInputSchema = z.object({
  sourceUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  instructions: z.string().optional(),
  yieldQuantity: z
    .number()
    .positive("Yield must be greater than zero")
    .default(1),
  yieldUnit: z.string().min(1).default("batch"),
  lines: z.array(recipeLineInputSchema).default([]),
});

export const importRecipeUrlSchema = z.object({
  url: z.string().url("Enter a valid recipe URL"),
});

export type RecipeInputSchema = z.infer<typeof recipeInputSchema>;
