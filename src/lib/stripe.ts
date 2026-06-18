import Stripe from "stripe";
import { env } from "@/config/env";

if (!env.STRIPE_SECRET_KEY && env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is required in production");
}

/**
 * Single global instance of the Stripe SDK client.
 */
export const stripe = new Stripe(
  env.STRIPE_SECRET_KEY ?? "sk_test_dummy_key_for_compilation_only",
  {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  },
);
