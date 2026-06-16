import Stripe from "stripe";
import { env } from "@/config/env";

if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment variables.");
}

/**
 * Single global instance of the Stripe SDK client.
 * Configured to use the latest API version automatically.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
});