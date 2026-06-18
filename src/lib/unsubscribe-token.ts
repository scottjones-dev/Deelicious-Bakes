import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";

const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 90;

type UnsubscribeTokenPayload = {
  email: string;
  exp: number;
};

function sign(value: string): string {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(value)
    .digest("base64url");
}

function isValidPayload(payload: unknown): payload is UnsubscribeTokenPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<UnsubscribeTokenPayload>;
  return (
    typeof candidate.email === "string" &&
    candidate.email.length > 0 &&
    typeof candidate.exp === "number" &&
    Number.isFinite(candidate.exp)
  );
}

export function createUnsubscribeToken(
  email: string,
  expiresInSeconds = DEFAULT_EXPIRY_SECONDS,
): string {
  const payload: UnsubscribeTokenPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0 || dotIndex === token.length - 1) {
    return null;
  }

  const encodedPayload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expectedSignature = sign(encodedPayload);
  const actualSignatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (actualSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (!isValidPayload(payload)) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.email.trim().toLowerCase();
  } catch {
    return null;
  }
}

export function buildEmailUnsubscribeUrl(email: string): string {
  const token = createUnsubscribeToken(email);
  return `${env.NEXT_PUBLIC_APP_URL}/api/emails/unsubscribe?token=${encodeURIComponent(token)}`;
}
