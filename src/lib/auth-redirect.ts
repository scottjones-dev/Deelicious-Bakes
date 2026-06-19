const DEFAULT_AUTH_CALLBACK_PATH = "/account";

type SearchParamsLike = Pick<URLSearchParams, "get">;

export function sanitizeAuthCallbackPath(
  rawPath: string | null | undefined,
  fallback = DEFAULT_AUTH_CALLBACK_PATH,
) {
  if (!rawPath) {
    return fallback;
  }

  const normalized = rawPath.trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }

  return normalized;
}

export function getAuthCallbackPath(
  searchParams: SearchParamsLike,
  fallback = DEFAULT_AUTH_CALLBACK_PATH,
) {
  const rawPath =
    searchParams.get("callbackUrl") ?? searchParams.get("callbackURL");
  return sanitizeAuthCallbackPath(rawPath, fallback);
}

export function appendAuthCallback(path: string, callbackPath: string) {
  const safeCallbackPath = sanitizeAuthCallbackPath(callbackPath);
  if (safeCallbackPath === DEFAULT_AUTH_CALLBACK_PATH) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}callbackUrl=${encodeURIComponent(safeCallbackPath)}`;
}
