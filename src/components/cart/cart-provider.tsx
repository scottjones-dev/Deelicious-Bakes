"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  addToCartAction,
  clearCartAction,
  getCartSummaryAction,
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/actions/cart";
import type { CartSummary } from "@/types/cart";

interface CartContextValue {
  summary: CartSummary;
  isPending: boolean;
  addItem: (input: {
    productId: string;
    productVariantId: string;
    quantity?: number;
  }) => void;
  updateItemQuantity: (input: {
    productVariantId: string;
    quantity: number;
  }) => void;
  removeItem: (input: { productVariantId: string }) => void;
  clear: () => void;
  refresh: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialSummary,
}: React.PropsWithChildren<{ initialSummary: CartSummary }>) {
  const [summary, setSummary] = React.useState<CartSummary>(initialSummary);
  const [isPending, startTransition] = React.useTransition();

  const runCartAction = React.useCallback(
    (
      runner: () => Promise<{ data: CartSummary | null; error: string | null }>,
    ) => {
      startTransition(async () => {
        const result = await runner();
        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.data) {
          setSummary(result.data);
        }
      });
    },
    [],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      summary,
      isPending,
      addItem: (input) => {
        runCartAction(async () => {
          const result = await addToCartAction(input);
          if (!result.error) toast.success("Added to cart");
          return result;
        });
      },
      updateItemQuantity: (input) => {
        runCartAction(() => updateCartItemQuantityAction(input));
      },
      removeItem: (input) => {
        runCartAction(async () => {
          const result = await removeCartItemAction(input);
          if (!result.error) toast.success("Removed from cart");
          return result;
        });
      },
      clear: () => {
        runCartAction(async () => {
          const result = await clearCartAction();
          if (!result.error) toast.success("Cart cleared");
          return result;
        });
      },
      refresh: () => {
        runCartAction(() => getCartSummaryAction());
      },
    }),
    [summary, isPending, runCartAction],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
