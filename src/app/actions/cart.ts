"use server";

import {
  addItemToCart,
  clearCart,
  getCartSummary,
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/lib/cart";
import type { CartSummary } from "@/types/cart";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

type CartActionResult = {
  data: CartSummary | null;
  error: string | null;
};

export async function getCartSummaryAction(): Promise<CartActionResult> {
  try {
    const summary = await getCartSummary();
    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function addToCartAction(input: {
  productId: string;
  productVariantId: string;
  quantity?: number;
}): Promise<CartActionResult> {
  try {
    const summary = await addItemToCart(input);
    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function updateCartItemQuantityAction(input: {
  productVariantId: string;
  quantity: number;
}): Promise<CartActionResult> {
  try {
    const summary = await updateCartItemQuantity(input);
    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function removeCartItemAction(input: {
  productVariantId: string;
}): Promise<CartActionResult> {
  try {
    const summary = await removeItemFromCart(input);
    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function clearCartAction(): Promise<CartActionResult> {
  try {
    const summary = await clearCart();
    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}
