import Stripe from "stripe";
import { env } from "@/config/env";

/**
 * Single global instance of the Stripe SDK client.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
