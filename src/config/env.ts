import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.email().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_AUDIENCE_ID: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.email().optional(),
  RESEND_WEBHOOK_SECRET: z.string().default("dummy_secret"),

  UPLOADTHING_TOKEN: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().default("dummy_secret"),

  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  TRUSTED_ORIGINS: z.string().optional(),

  TRIGGER_SECRET_KEY: z.string().optional(),
});

// Determine if we are executing on the client side (browser)
const isServer = typeof window === "undefined";

// If we are on the browser, only parse client-safe public variables to prevent crashes
const parsed = isServer
  ? envSchema.safeParse(process.env)
  : z
      .object({
        NEXT_PUBLIC_APP_URL: z.url(),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
        NODE_ENV: z.enum(["development", "test", "production"]),
      })
      .safeParse({
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
        NODE_ENV: process.env.NODE_ENV,
      });

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

/**
 * Fully typed env proxy object
 * Throws a runtime error if a client-side block tries to read a sensitive server token
 */
export const env = new Proxy(parsed.data as z.infer<typeof envSchema>, {
  get(target, prop: string) {
    if (!isServer && !prop.startsWith("NEXT_PUBLIC_") && prop !== "NODE_ENV") {
      throw new Error(
        `❌ Attempted to access server-side environment variable "${prop}" on the client.`,
      );
    }
    return Reflect.get(target, prop);
  },
});
