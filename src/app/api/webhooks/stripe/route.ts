import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/config/env";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  // 🔒 Verify that the incoming request actually came from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // 🥐 Triggers instantly when a checkout complete webhook event drops in
  if (event.type === "checkout.session.completed") {
    const customerEmail = session.customer_details?.email;
    const totalAmount = session.amount_total / 100; // Convert pennies/cents to standard units

    console.log(`💰 Payment succeeded for customer: ${customerEmail}, Total: £${totalAmount}`);
    console.log(`🎫 Stripe Session ID captured: ${session.id}`);
    
    // [Database and Order Email integrations will go here later]
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}