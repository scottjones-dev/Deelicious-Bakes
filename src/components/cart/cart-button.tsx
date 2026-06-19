"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function CartButton() {
  const { summary } = useCart();

  return (
    <Button asChild variant="outline" size="sm" className="relative">
      <Link href="/cart" aria-label="Open cart">
        <ShoppingCart className="size-4" />
        <span className="sr-only">Cart</span>
        {summary.itemCount > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {summary.itemCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
