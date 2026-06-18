"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartPageContent() {
  const { summary, updateItemQuantity, removeItem, clear, isPending } =
    useCart();

  if (summary.items.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/store/all">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {summary.items.map((item) => (
          <article
            key={item.variantId}
            className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/30 p-4 sm:flex-row"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-md bg-muted">
              <Image
                src={item.productImage ?? ""}
                alt={item.productName}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <Link
                href={`/store/products/${item.productSlug}`}
                className="text-base font-semibold hover:text-primary"
              >
                {item.productName}
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.variantName}
              </p>
              <p className="text-sm font-medium">
                {formatPrice(item.unitPrice)} each
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending || item.quantity <= 1}
                  onClick={() =>
                    updateItemQuantity({
                      productVariantId: item.variantId,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  -
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() =>
                    updateItemQuantity({
                      productVariantId: item.variantId,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive"
                  disabled={isPending}
                  onClick={() =>
                    removeItem({ productVariantId: item.variantId })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="text-right text-sm font-semibold">
              {formatPrice(item.lineTotal)}
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span>{summary.itemCount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-base font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Checkout is coming soon. You can keep building your basket for now.
        </p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/store/all">Continue shopping</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={clear}
            disabled={isPending}
          >
            Clear cart
          </Button>
        </div>
      </div>
    </div>
  );
}
