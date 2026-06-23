import { describe, expect, it } from "vitest";
import { bundleInputSchema } from "@/lib/validations/bundle";

describe("bundleInputSchema", () => {
  it("accepts fixed price bundles", () => {
    const parsed = bundleInputSchema.safeParse({
      fixedPrice: "19.99",
      items: [{ position: 0, productVariantId: "variant_1", quantity: 1 }],
      pricingMode: "fixed_price",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid fixed prices", () => {
    const parsed = bundleInputSchema.safeParse({
      fixedPrice: "-2",
      items: [{ position: 0, productVariantId: "variant_1", quantity: 1 }],
      pricingMode: "fixed_price",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts percentage discount bundles", () => {
    const parsed = bundleInputSchema.safeParse({
      items: [{ position: 0, productVariantId: "variant_1", quantity: 2 }],
      percentageDiscount: "15",
      pricingMode: "percentage_discount",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects percentage discounts above 100", () => {
    const parsed = bundleInputSchema.safeParse({
      items: [{ position: 0, productVariantId: "variant_1", quantity: 1 }],
      percentageDiscount: "101",
      pricingMode: "percentage_discount",
    });

    expect(parsed.success).toBe(false);
  });
});
