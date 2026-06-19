import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { carts, customers, productVariants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { cartItemSchema } from "@/lib/validations/cart";
import type { CartSummary, CartSummaryItem } from "@/types/cart";
import { generateId } from "@/utils/id";

const CART_TOKEN_COOKIE = "deelicious_cart_token";
const EMPTY_CART_SUMMARY: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600";

type CartItem = {
  productId: string;
  productVariantId: string;
  quantity: number;
  customizations?: Record<string, unknown> | null;
  bundleComposition?: {
    bundleId: string;
    items: {
      productVariantId: string;
      quantity: number;
    }[];
  } | null;
};

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  marketingConsent?: boolean;
};

function mergeItemLists(
  primary: CartItem[],
  secondary: CartItem[],
): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of [...primary, ...secondary]) {
    const bundleKey = item.bundleComposition
      ? JSON.stringify(item.bundleComposition)
      : "";
    const customizationsKey = item.customizations
      ? JSON.stringify(item.customizations)
      : "";
    const key = `${item.productId}:${item.productVariantId}:${bundleKey}:${customizationsKey}`;
    const existing = merged.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    merged.set(key, { ...item });
  }

  return [...merged.values()];
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCartItems(rawItems: unknown, cartId: string): CartItem[] {
  const parsed = cartItemSchema.array().safeParse(rawItems ?? []);

  if (!parsed.success) {
    throw new Error(`Cart ${cartId} contains invalid item data.`);
  }

  return parsed.data.map((item) => ({
    ...item,
    customizations:
      item.customizations && typeof item.customizations === "object"
        ? item.customizations
        : null,
    bundleComposition: item.bundleComposition ?? null,
  }));
}

async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    marketingConsent:
      "marketingConsent" in user ? Boolean(user.marketingConsent) : false,
  };
}

async function ensureCustomerForUser(user: SessionUser): Promise<string> {
  const existingCustomer = await db.query.customers.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
    columns: { id: true },
  });

  if (existingCustomer) {
    return existingCustomer.id;
  }

  const [createdCustomer] = await db
    .insert(customers)
    .values({
      userId: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      marketingConsent: user.marketingConsent ?? false,
    })
    .returning({ id: customers.id });

  return createdCustomer.id;
}

async function getActiveCartByCustomerId(customerId: string) {
  return db.query.carts.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.customerId, customerId), eq(table.status, "active")),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
  });
}

async function getActiveCartByGuestToken(guestToken: string) {
  return db.query.carts.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.guestToken, guestToken), eq(table.status, "active")),
    orderBy: (table, { desc }) => [desc(table.updatedAt)],
  });
}

async function persistItems(cartId: string, items: CartItem[]): Promise<void> {
  await db
    .update(carts)
    .set({
      items,
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
}

async function toCartSummary(items: CartItem[]): Promise<CartSummary> {
  if (items.length === 0) return EMPTY_CART_SUMMARY;

  const variantIds = [...new Set(items.map((item) => item.productVariantId))];
  const variants = await db.query.productVariants.findMany({
    where: and(
      inArray(productVariants.id, variantIds),
      eq(productVariants.disabled, false),
    ),
    columns: {
      id: true,
      name: true,
      price: true,
    },
    with: {
      product: {
        columns: {
          id: true,
          slug: true,
          name: true,
          status: true,
          images: true,
        },
      },
    },
  });

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const summaryItems: CartSummaryItem[] = [];

  for (const item of items) {
    const variant = variantMap.get(item.productVariantId);
    if (!variant || variant.product.status !== "active") continue;

    const unitPrice = toNumber(variant.price);
    const lineTotal = unitPrice * item.quantity;
    const firstImage = variant.product.images?.[0]?.url ?? null;

    summaryItems.push({
      productId: variant.product.id,
      productSlug: variant.product.slug,
      productName: variant.product.name,
      productImage: firstImage ?? FALLBACK_PRODUCT_IMAGE,
      variantId: variant.id,
      variantName: variant.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const subtotal = summaryItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = summaryItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: summaryItems,
    itemCount,
    subtotal,
  };
}

async function resolveActiveCart(options: { createIfMissing: boolean }) {
  const cookieStore = await cookies();
  const sessionUser = await getSessionUser();
  const customerId = sessionUser
    ? await ensureCustomerForUser(sessionUser)
    : null;
  const guestToken = cookieStore.get(CART_TOKEN_COOKIE)?.value ?? null;

  let customerCart = customerId
    ? await getActiveCartByCustomerId(customerId)
    : null;
  let guestCart = guestToken
    ? await getActiveCartByGuestToken(guestToken)
    : null;

  if (customerCart && guestCart && customerCart.id !== guestCart.id) {
    const mergedItems = mergeItemLists(
      normalizeCartItems(customerCart.items, customerCart.id),
      normalizeCartItems(guestCart.items, guestCart.id),
    );

    await persistItems(customerCart.id, mergedItems);
    await db
      .update(carts)
      .set({
        status: "converted",
        guestToken: null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, guestCart.id));

    cookieStore.delete(CART_TOKEN_COOKIE);
    customerCart = {
      ...customerCart,
      items: mergedItems,
    };
    guestCart = null;
  }

  if (!customerCart && customerId && guestCart) {
    await db
      .update(carts)
      .set({
        customerId,
        guestToken: null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, guestCart.id));

    cookieStore.delete(CART_TOKEN_COOKIE);
    customerCart = {
      ...guestCart,
      customerId,
      guestToken: null,
    };
    guestCart = null;
  }

  const activeCart = customerCart ?? guestCart;
  if (activeCart) {
    return {
      id: activeCart.id,
      items: normalizeCartItems(activeCart.items, activeCart.id),
    };
  }

  if (!options.createIfMissing) return null;

  if (customerId) {
    const [createdCart] = await db
      .insert(carts)
      .values({
        customerId,
        items: [],
        status: "active",
      })
      .returning({
        id: carts.id,
      });

    return { id: createdCart.id, items: [] };
  }

  const newGuestToken = generateId(undefined, { length: 40 });
  cookieStore.set({
    name: CART_TOKEN_COOKIE,
    value: newGuestToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const [createdGuestCart] = await db
    .insert(carts)
    .values({
      guestToken: newGuestToken,
      items: [],
      status: "active",
    })
    .returning({
      id: carts.id,
    });

  return { id: createdGuestCart.id, items: [] };
}

export async function getCartSummary(): Promise<CartSummary> {
  const cart = await resolveActiveCart({ createIfMissing: false });
  if (!cart) return EMPTY_CART_SUMMARY;

  return toCartSummary(cart.items);
}

export async function addItemToCart(input: {
  productId: string;
  productVariantId: string;
  quantity?: number;
}): Promise<CartSummary> {
  const parsed = cartItemSchema
    .pick({
      productId: true,
      productVariantId: true,
      quantity: true,
    })
    .parse({
      productId: input.productId,
      productVariantId: input.productVariantId,
      quantity: input.quantity ?? 1,
    });

  const variant = await db.query.productVariants.findFirst({
    where: (table, { eq }) => eq(table.id, parsed.productVariantId),
    columns: {
      id: true,
      productId: true,
      disabled: true,
    },
    with: {
      product: {
        columns: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!variant || variant.disabled || variant.product.status !== "active") {
    throw new Error("This product option is no longer available.");
  }

  if (variant.product.id !== parsed.productId) {
    throw new Error("The selected product option is invalid.");
  }

  const cart = await resolveActiveCart({ createIfMissing: true });
  if (!cart) {
    throw new Error("Unable to create a cart.");
  }

  const nextItems = [...cart.items];
  const existingIndex = nextItems.findIndex(
    (item) =>
      item.productId === parsed.productId &&
      item.productVariantId === parsed.productVariantId,
  );

  if (existingIndex >= 0) {
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      quantity: nextItems[existingIndex].quantity + parsed.quantity,
    };
  } else {
    nextItems.push({
      productId: parsed.productId,
      productVariantId: parsed.productVariantId,
      quantity: parsed.quantity,
      customizations: null,
      bundleComposition: null,
    });
  }

  await persistItems(cart.id, nextItems);
  return toCartSummary(nextItems);
}

export async function updateCartItemQuantity(input: {
  productVariantId: string;
  quantity: number;
}): Promise<CartSummary> {
  const cart = await resolveActiveCart({ createIfMissing: false });
  if (!cart) return EMPTY_CART_SUMMARY;

  if (input.quantity <= 0) {
    return removeItemFromCart({ productVariantId: input.productVariantId });
  }

  const nextItems = cart.items.map((item) =>
    item.productVariantId === input.productVariantId
      ? { ...item, quantity: input.quantity }
      : item,
  );

  await persistItems(cart.id, nextItems);
  return toCartSummary(nextItems);
}

export async function removeItemFromCart(input: {
  productVariantId: string;
}): Promise<CartSummary> {
  const cart = await resolveActiveCart({ createIfMissing: false });
  if (!cart) return EMPTY_CART_SUMMARY;

  const nextItems = cart.items.filter(
    (item) => item.productVariantId !== input.productVariantId,
  );

  await persistItems(cart.id, nextItems);
  return toCartSummary(nextItems);
}

export async function clearCart(): Promise<CartSummary> {
  const cart = await resolveActiveCart({ createIfMissing: false });
  if (!cart) return EMPTY_CART_SUMMARY;

  await persistItems(cart.id, []);
  return EMPTY_CART_SUMMARY;
}
