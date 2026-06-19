"use client";

import { ShoppingCart } from "lucide-react";
import type React from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  productVariantId: string;
  quantity?: number;
  className?: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}

export function AddToCartButton({
  productId,
  productVariantId,
  quantity = 1,
  className,
  label = "Add to cart",
  variant = "outline",
  size = "sm",
}: AddToCartButtonProps) {
  const { addItem, isPending } = useCart();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() =>
        addItem({
          productId,
          productVariantId,
          quantity,
        })
      }
      disabled={isPending}
    >
      <ShoppingCart className="size-4" />
      {label}
    </Button>
  );
}
