import { z } from "zod";

export const bundlePricingModeSchema = z.enum([
  "fixed_price",
  "percentage_discount",
]);

export const bundleItemInputSchema = z.object({
  productVariantId: z.string().min(1, "Bundle item variant is required"),
  quantity: z.number().int().min(1, "Bundle item quantity must be at least 1"),
  position: z.number().int().min(0),
});

export const bundleInputSchema = z
  .object({
    pricingMode: bundlePricingModeSchema,
    fixedPrice: z.string().optional(),
    percentageDiscount: z.string().optional(),
    items: z
      .array(bundleItemInputSchema)
      .min(1, "At least one bundle item is required"),
  })
  .superRefine((value, ctx) => {
    if (value.pricingMode === "fixed_price") {
      const fixedPrice = Number(value.fixedPrice);
      if (!value.fixedPrice || Number.isNaN(fixedPrice) || fixedPrice < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fixedPrice"],
          message: "Fixed bundle price must be a valid amount",
        });
      }
    }

    if (value.pricingMode === "percentage_discount") {
      const discount = Number(value.percentageDiscount);
      if (
        !value.percentageDiscount ||
        Number.isNaN(discount) ||
        discount <= 0 ||
        discount > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["percentageDiscount"],
          message: "Percentage discount must be greater than 0 and at most 100",
        });
      }
    }
  });

export type BundleInputSchema = z.infer<typeof bundleInputSchema>;
