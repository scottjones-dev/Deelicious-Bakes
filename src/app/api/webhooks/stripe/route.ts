import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { db } from "@/db";
import { carts } from "@/db/schema/carts";
import { orderItems, orders } from "@/db/schema/orders";
import { payments } from "@/db/schema/payments";
import { stockMovements, stocks } from "@/db/schema/stocks";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  // 🔒 Verify that the incoming request actually came from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle Checkout Completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
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
            if (item.productVariantId) {
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
          await tasks.trigger("send-order-placed-email", { orderId });
        } else {
          console.log(
            "⏭️ Skipping task trigger during build environment verification.",
          );
        }

        console.log(
          `✅ Order ${orderId} successfully locked, paid, and stocked.`,
        );
      } catch (dbError) {
        console.error(
          `❌ Transaction failed during webhook order fulfillment for order ${orderId}:`,
          dbError,
        );
        return new NextResponse("Internal database transaction error", {
          status: 500,
        });
      }
    } else {
      console.warn(
        "⚠️ Checkout session completed, but metadata does not contain orderId.",
      );
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
