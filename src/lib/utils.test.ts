import { describe, expect, it } from "vitest";
import { cn, formatPrice } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats GBP currency by default", () => {
    expect(formatPrice(12.5)).toBe("£12.50");
  });

  it("formats string prices", () => {
    expect(formatPrice("99.99")).toBe("£99.99");
  });

  it("supports custom currencies", () => {
    expect(formatPrice(10, { currency: "USD" })).toContain("US$");
  });
});

describe("cn", () => {
  it("merges tailwind class conflicts", () => {
    expect(cn("p-2", "p-4", "text-sm")).toBe("p-4 text-sm");
  });
});
