// src/lib/validations/cart.ts
import { z } from "zod";

const dbIdSchema = z.string().min(1).max(30);

export const bundleCompositionItemSchema = z.object({
  productVariantId: dbIdSchema,
  quantity: z.number().int().positive(),
});

export const bundleCompositionSchema = z.object({
  bundleId: dbIdSchema,
  items: z.array(bundleCompositionItemSchema).min(1),
});

export const orderItemCustomizationsSchema = z
  .object({
    bundleComposition: bundleCompositionSchema.optional(),
  })
  .catchall(z.unknown());

export const cartItemSchema = z.object({
  productId: dbIdSchema,
  productVariantId: dbIdSchema,
  quantity: z.number().int().positive().default(1),
  // JSON bucket for customizable attributes (e.g. cake lettering, allergen options)
  customizations: z.record(z.string(), z.unknown()).nullable().optional(),
  bundleComposition: bundleCompositionSchema.nullable().optional(),
});

export type BundleCompositionItemSchema = z.infer<
  typeof bundleCompositionItemSchema
>;
export type BundleCompositionSchema = z.infer<typeof bundleCompositionSchema>;
export type OrderItemCustomizations = z.infer<
  typeof orderItemCustomizationsSchema
>;
export type CartItemSchema = z.infer<typeof cartItemSchema>;
export type OrderItemCustomizationInput = Pick<
  CartItemSchema,
  "customizations" | "bundleComposition"
>;

export function toOrderItemCustomizations(
  item: OrderItemCustomizationInput,
): OrderItemCustomizations | null {
  const customizations: Record<string, unknown> = {
    ...(item.customizations ?? {}),
  };

  if (item.bundleComposition) {
    customizations.bundleComposition = item.bundleComposition;
  }

  return Object.keys(customizations).length > 0 ? customizations : null;
}

export function getBundleCompositionFromCustomizations(
  customizations: unknown,
): BundleCompositionSchema | null {
  const parsed = orderItemCustomizationsSchema.safeParse(customizations);
  if (!parsed.success || !parsed.data.bundleComposition) {
    return null;
  }

  return parsed.data.bundleComposition;
}
