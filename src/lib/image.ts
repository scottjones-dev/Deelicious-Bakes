import type { StoredFile } from "@/types";

const BROKEN_UNSPLASH_IMAGE =
  "https://images.unsplash.com/photo-1535141192574-5d4897c13636";

const REPLACEMENT_UNSPLASH_IMAGE =
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd";

const DEFAULT_LOBBY_IMAGE =
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600";

const categoryFallbacks: Record<string, string> = {
  cupcakes: DEFAULT_LOBBY_IMAGE,
  "celebration-cakes": DEFAULT_LOBBY_IMAGE,
  "brownies-traybakes":
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600",
  macarons:
    "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
};

export function normalizeLobbyImageUrl(url: string | null | undefined) {
  if (!url) return null;

  if (url.includes(BROKEN_UNSPLASH_IMAGE)) {
    return url.replace(BROKEN_UNSPLASH_IMAGE, REPLACEMENT_UNSPLASH_IMAGE);
  }

  return url;
}

export function getCategoryImage(category: {
  image: string | null | undefined;
  slug: string | null | undefined;
}) {
  return (
    normalizeLobbyImageUrl(category.image) ||
    (category.slug ? categoryFallbacks[category.slug] : null) ||
    DEFAULT_LOBBY_IMAGE
  );
}

export function getProductImage(product: {
  images?: StoredFile[] | null;
  category?: {
    image: string | null | undefined;
    slug: string | null | undefined;
  } | null;
}) {
  return (
    normalizeLobbyImageUrl(product.images?.[0]?.url) ||
    (product.category
      ? getCategoryImage(product.category)
      : DEFAULT_LOBBY_IMAGE)
  );
}
