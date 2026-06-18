const BROKEN_UNSPLASH_IMAGE =
  "https://images.unsplash.com/photo-1535141192574-5d4897c13636";

const REPLACEMENT_UNSPLASH_IMAGE =
  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd";

export function normalizeLobbyImageUrl(url: string | null | undefined) {
  if (!url) return null;

  if (url.includes(BROKEN_UNSPLASH_IMAGE)) {
    return url.replace(BROKEN_UNSPLASH_IMAGE, REPLACEMENT_UNSPLASH_IMAGE);
  }

  return url;
}
