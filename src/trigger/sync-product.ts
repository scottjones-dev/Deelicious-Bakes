import { task } from "@trigger.dev/sdk/v3";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { products } from "@/db/schema/products";
import { productVariants } from "@/db/schema/variants";
import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

interface SyncProductPayload {
  productId: string;
}

/**
 * 🏷️ Task: Synchronize database product & variants to Stripe
 * Triggered after products or variants are created/updated in the admin panel
 */
export const syncProductWithStripe = task({
  id: "sync-product-with-stripe",
  retry: {
    maxAttempts: 4,
    factor: 2,
  },
  run: async (payload: SyncProductPayload) => {
    return await Sentry.withScope(async (scope) => {
      scope.setTag("workflow", "sync-product-stripe");
      scope.setContext("payload", { ...payload });

      // 1. Fetch product and its variants from DB
      const dbProduct = await db.query.products.findFirst({
        where: eq(products.id, payload.productId),
        with: {
          variants: true,
        },
      });

      if (!dbProduct) {
        throw new Error(`Product ${payload.productId} not found in database.`);
      }

      // Determine active status
      const isActive = dbProduct.status === "active";

      try {
        // 2. Upsert the Product on Stripe
        const stripeProduct = await stripe.products.create({
          id: dbProduct.id, // Using 1:1 mapped IDs for consistency
          name: dbProduct.name,
          description: dbProduct.description ?? undefined,
          images: dbProduct.images && dbProduct.images.length > 0 
            ? [dbProduct.images[0].url] 
            : undefined,
          active: isActive,
          metadata: {
            dbProductId: dbProduct.id,
          },
        }, {
          idempotencyKey: `prod_sync_${dbProduct.id}`,
        }).catch(async (err) => {
          // If product already exists in Stripe, update it instead
          if (err.statusCode === 400 && err.message.includes("already exists")) {
            return await stripe.products.update(dbProduct.id, {
              name: dbProduct.name,
              description: dbProduct.description ?? undefined,
              images: dbProduct.images && dbProduct.images.length > 0 
                ? [dbProduct.images[0].url] 
                : undefined,
              active: isActive,
            });
          }
          throw err;
        });

        // 3. Upsert variants as Prices on Stripe
        for (const variant of dbProduct.variants) {
          const priceInCents = Math.round(Number(variant.price) * 100);

          // Retrieve active prices for this Stripe product to avoid duplicates
          const existingPrices = await stripe.prices.list({
            product: stripeProduct.id,
            active: true,
          });

          const matchingPrice = existingPrices.data.find(
            (p) => p.metadata.dbVariantId === variant.id && p.unit_amount === priceInCents
          );

          if (!matchingPrice) {
            // Archive old active prices for this variant as Stripe Prices are immutable
            const oldPrices = existingPrices.data.filter((p) => p.metadata.dbVariantId === variant.id);
            for (const oldPrice of oldPrices) {
              await stripe.prices.update(oldPrice.id, { active: false });
            }

            // Create a new price tier
            await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: priceInCents,
              currency: "gbp",
              active: !variant.disabled,
              metadata: {
                dbVariantId: variant.id,
                sku: variant.sku ?? "",
              },
            }, {
              idempotencyKey: `price_sync_${variant.id}_${priceInCents}`,
            });
          } else if (matchingPrice.active === variant.disabled) {
            // Update price state (e.g., toggle active if variant is enabled/disabled)
            await stripe.prices.update(matchingPrice.id, {
              active: !variant.disabled,
            });
          }
        }

        return { success: true, stripeProductId: stripeProduct.id };
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  },
});
