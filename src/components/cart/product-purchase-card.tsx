"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

interface ProductPurchaseCardProps {
  productId: string;
  variants: {
    id: string;
    name: string;
    price: number;
  }[];
}

export function ProductPurchaseCard({
  productId,
  variants,
}: ProductPurchaseCardProps) {
  const { addItem, isPending } = useCart();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? variants[0],
    [variants, variantId],
  );

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/40 p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium">Choose size</p>
        <Select value={variantId} onValueChange={setVariantId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                {variant.name} · {formatPrice(variant.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Quantity</p>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) =>
            setQuantity(Math.max(1, Number(event.target.value) || 1))
          }
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-semibold">
          {selectedVariant
            ? formatPrice(selectedVariant.price * quantity)
            : formatPrice(0)}
        </span>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isPending || !selectedVariant}
        onClick={() => {
          if (!selectedVariant) return;
          addItem({
            productId,
            productVariantId: selectedVariant.id,
            quantity,
          });
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
