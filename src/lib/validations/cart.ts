// src/lib/validations/cart.ts
import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().length(30),
  productVariantId: z.string().length(30),
  quantity: z.number().int().positive().default(1),
  // JSON bucket for customizable attributes (e.g. cake lettering, allergen options)
  customizations: z.record(z.string(), z.any()).nullable().optional(),
});

export type CartItemSchema = z.infer<typeof cartItemSchema>;
