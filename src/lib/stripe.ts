import Stripe from "stripe";
import { env } from "@/config/env";

/**
 * Single global instance of the Stripe SDK client.
 */
export const stripe = new Stripe(
  env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_compilation_only",
  {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  },
);
