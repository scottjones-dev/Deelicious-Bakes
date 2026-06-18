"use client";

import { ArrowDown, ArrowUp, PlusCircle, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export type BundlePricingMode = "fixed_price" | "percentage_discount";

export type AvailableBundleVariant = {
  id: string;
  productName: string;
  variantName: string;
  price: string;
};

export type BundleDraftItem = {
  productVariantId: string;
  quantity: number;
};

interface BundleCompositionEditorProps {
  isPending: boolean;
  visible: boolean;
  availableVariants: AvailableBundleVariant[];
  pricingMode: BundlePricingMode;
  pricingValue: string;
  items: BundleDraftItem[];
  onPricingModeChange: (mode: BundlePricingMode) => void;
  onPricingValueChange: (value: string) => void;
  onItemsChange: (items: BundleDraftItem[]) => void;
}

export function BundleCompositionEditor({
  isPending,
  visible,
  availableVariants,
  pricingMode,
  pricingValue,
  items,
  onPricingModeChange,
  onPricingValueChange,
  onItemsChange,
}: BundleCompositionEditorProps) {
  if (!visible) {
    return null;
  }

  const variantsById = new Map(
    availableVariants.map((variant) => [variant.id, variant]),
  );
  const subtotal = items.reduce((total, item) => {
    const variant = variantsById.get(item.productVariantId);
    if (!variant) return total;
    return total + Number(variant.price) * item.quantity;
  }, 0);
  const numericPricingValue = Number(pricingValue);
  const hasNumericPricingValue = !Number.isNaN(numericPricingValue);
  const estimatedTotal =
    pricingMode === "fixed_price"
      ? hasNumericPricingValue
        ? numericPricingValue
        : null
      : hasNumericPricingValue
        ? subtotal * (1 - numericPricingValue / 100)
        : null;
  const estimatedSavings =
    estimatedTotal === null ? null : Math.max(subtotal - estimatedTotal, 0);

  return (
    <Card className="border border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Bundle Composition
        </CardTitle>
        <CardDescription className="text-xs">
          Choose bundle components, set quantities, and define bundle pricing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Pricing Mode
            </label>
            <select
              value={pricingMode}
              disabled={isPending}
              onChange={(event) =>
                onPricingModeChange(event.target.value as BundlePricingMode)
              }
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="fixed_price">Fixed bundle price</option>
              <option value="percentage_discount">Percentage discount</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              {pricingMode === "fixed_price"
                ? "Bundle Price (£)"
                : "Discount (%)"}
            </label>
            <Input
              type="number"
              min="0"
              max={pricingMode === "percentage_discount" ? "100" : undefined}
              step="0.01"
              value={pricingValue}
              disabled={isPending}
              onChange={(event) => onPricingValueChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.productVariantId || "variant"}-${index}`}
              className="grid gap-3 rounded-lg border border-border/60 p-4 md:grid-cols-[1fr_110px_auto]"
            >
              <div className="grid gap-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Component Variant
                </label>
                <select
                  value={item.productVariantId}
                  disabled={isPending}
                  onChange={(event) =>
                    onItemsChange(
                      items.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, productVariantId: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Select a variant</option>
                  {availableVariants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.productName} · {variant.variantName} (
                      {formatPrice(variant.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  disabled={isPending}
                  onChange={(event) =>
                    onItemsChange(
                      items.map((entry, entryIndex) =>
                        entryIndex === index
                          ? {
                              ...entry,
                              quantity: Math.max(
                                Number.parseInt(event.target.value, 10) || 1,
                                1,
                              ),
                            }
                          : entry,
                      ),
                    )
                  }
                />
              </div>
              <div className="flex items-end gap-1">
                <button
                  type="button"
                  disabled={isPending || index === 0}
                  onClick={() => {
                    const clone = [...items];
                    const previous = clone[index - 1];
                    clone[index - 1] = clone[index];
                    clone[index] = previous;
                    onItemsChange(clone);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground disabled:opacity-50"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={isPending || index === items.length - 1}
                  onClick={() => {
                    const clone = [...items];
                    const next = clone[index + 1];
                    clone[index + 1] = clone[index];
                    clone[index] = next;
                    onItemsChange(clone);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground disabled:opacity-50"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={isPending || items.length <= 1}
                  onClick={() =>
                    onItemsChange(
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onItemsChange([...items, { productVariantId: "", quantity: 1 }])
          }
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <PlusCircle className="size-4" />
          Add Bundle Item
        </button>

        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <p>Component subtotal: {formatPrice(subtotal)}</p>
          {estimatedTotal !== null ? (
            <>
              <p>Bundle total: {formatPrice(estimatedTotal)}</p>
              {estimatedSavings !== null && estimatedSavings > 0 ? (
                <p className="text-emerald-600">
                  Customer saves {formatPrice(estimatedSavings)}
                </p>
              ) : null}
            </>
          ) : (
            <p>Set a valid pricing value to preview bundle total.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
