import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { db } from "@/db";
import { carts } from "@/db/schema/carts";
import { orderItems, orders } from "@/db/schema/orders";
import { payments } from "@/db/schema/payments";
import { stockMovements, stocks } from "@/db/schema/stocks";
import { createAdminOperationalNotification } from "@/lib/admin-events";
import { stripe } from "@/lib/stripe";
import { getBundleCompositionFromCustomizations } from "@/lib/validations/cart";

type StripeWebhookCheckoutSession = {
  metadata?: {
    orderId?: string;
    cartId?: string;
  } | null;
  payment_intent: string | null;
  latest_charge?: string | null;
  amount_total: number | null;
  currency: string | null;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  let event: { type: string; data: { object: unknown } };

  // 🔒 Verify that the incoming request actually came from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error(`❌ Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // Handle Checkout Completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as StripeWebhookCheckoutSession;
    const orderId = session.metadata?.orderId;
    const cartId = session.metadata?.cartId;

    if (orderId) {
      console.log(
        `💰 Stripe Checkout session completed. Syncing order: ${orderId}`,
      );

      try {
        await db.transaction(async (tx) => {
          // 1. Update Order Status to "Paid"
          await tx
            .update(orders)
            .set({
              status: "paid",
              stripePaymentIntentId: session.payment_intent as string,
            })
            .where(eq(orders.id, orderId));

          // 2. Log Successful Payment Record
          await tx.insert(payments).values({
            orderId: orderId,
            stripePaymentIntentId: session.payment_intent as string,
            stripeChargeId: session.latest_charge as string,
            status: "succeeded",
            amount: (session.amount_total! / 100).toString(),
            currency: session.currency ?? "gbp",
            paidAt: new Date(),
          });

          // 3. Mark Cart as "Converted"
          if (cartId) {
            await tx
              .update(carts)
              .set({
                status: "converted",
                convertedOrderId: orderId,
              })
              .where(eq(carts.id, cartId));
          }

          // 4. Update Stock Levels (Decrement)
          const orderItemsList = await tx
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));

          for (const item of orderItemsList) {
            const bundleComposition = getBundleCompositionFromCustomizations(
              item.customizations,
            );

            if (bundleComposition) {
              for (const bundleItem of bundleComposition.items) {
                const quantityToDecrement = bundleItem.quantity * item.quantity;
                const currentStock = await tx.query.stocks.findFirst({
                  where: eq(
                    stocks.productVariantId,
                    bundleItem.productVariantId,
                  ),
                });

                if (!currentStock) {
                  continue;
                }

                const newQuantity = currentStock.quantity - quantityToDecrement;

                await tx
                  .update(stocks)
                  .set({ quantity: newQuantity })
                  .where(eq(stocks.id, currentStock.id));

                await tx.insert(stockMovements).values({
                  stockId: currentStock.id,
                  orderId,
                  type: "sale",
                  quantityChange: -quantityToDecrement,
                  quantityAfter: newQuantity,
                  reason: `Sold via Bundle ${item.productName} in Order #${orderId}`,
                });
              }
            } else if (item.productVariantId) {
              const currentStock = await tx.query.stocks.findFirst({
                where: eq(stocks.productVariantId, item.productVariantId),
              });

              if (currentStock) {
                const newQuantity = currentStock.quantity - item.quantity;

                // Update stock volume
                await tx
                  .update(stocks)
                  .set({ quantity: newQuantity })
                  .where(eq(stocks.id, currentStock.id));

                // Insert stock movement audit trace
                await tx.insert(stockMovements).values({
                  stockId: currentStock.id,
                  orderId: orderId,
                  type: "sale",
                  quantityChange: -item.quantity,
                  quantityAfter: newQuantity,
                  reason: `Sold via Order #${orderId}`,
                });
              }
            }
          }
        });

        // 5. Fire off Email Notifications via Trigger.dev in the background
        // Wait! We trigger the background tasks here
        if (process.env.TRIGGER_SECRET_KEY) {
          // We dynamically require it here so it NEVER runs during 'next build'
          const { tasks } = await import("@trigger.dev/sdk/v3");
          await tasks.trigger(
            "send-order-placed-email",
            { orderId },
            { idempotencyKey: `order-email-${orderId}` },
          );
        } else {
          console.log(
            "⏭️ Skipping task trigger during build environment verification.",
          );
        }

        console.log(
          `✅ Order ${orderId} successfully locked, paid, and stocked.`,
        );
        await createAdminOperationalNotification({
          subject: "Stripe order paid",
          message: `Order ${orderId} payment confirmed via Stripe webhook.`,
          status: "delivered",
          orderId,
        });
      } catch (dbError) {
        await createAdminOperationalNotification({
          subject: "Stripe webhook fulfillment failed",
          message: `Order ${orderId} webhook processing failed: ${getErrorMessage(dbError)}`,
          status: "failed",
          orderId,
        });
        console.error(
          `❌ Transaction failed during webhook order fulfillment for order ${orderId}:`,
          dbError,
        );
        return new NextResponse("Internal database transaction error", {
          status: 500,
        });
      }
    } else {
      await createAdminOperationalNotification({
        subject: "Stripe checkout metadata issue",
        message:
          "Checkout session completed without orderId metadata. Manual investigation required.",
        status: "failed",
      });
      console.warn(
        "⚠️ Checkout session completed, but metadata does not contain orderId.",
      );
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
