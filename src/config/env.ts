import { z } from "zod";

/**
 * Runtime-validated environment schema
 * Fail fast on missing or invalid env vars
 */

const envSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    ADMIN_EMAIL: z.email().optional(),

    RESEND_API_KEY: z.string().optional(),
    RESEND_AUDIENCE_ID: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.email().optional(),

    UPLOADTHING_SECRET: z.string().optional(),
    UPLOADTHING_APP_ID: z.string().optional(),

    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    TRUSTED_ORIGINS: z.string().optional(),
});

/**
 * Parse + validate once at startup
 * If invalid → app crashes immediately (correct behaviour)
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
}

/**
 * Fully typed env object
 */
export const env = parsed.data;