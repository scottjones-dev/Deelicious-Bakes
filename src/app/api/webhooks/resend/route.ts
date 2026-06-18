import { NextResponse } from "next/server";
import { WebhookVerificationError } from "standardwebhooks";
import { env } from "@/config/env";
import { syncMarketingConsent } from "@/lib/marketing-consent";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    if (!env.RESEND_WEBHOOK_SECRET) {
      console.error("❌ RESEND_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    const payload = await req.text();
    const headers = {
      id: req.headers.get("webhook-id") ?? "",
      timestamp: req.headers.get("webhook-timestamp") ?? "",
      signature: req.headers.get("webhook-signature") ?? "",
    };

    if (!headers.id || !headers.timestamp || !headers.signature) {
      return NextResponse.json(
        { error: "Missing webhook signature headers" },
        { status: 400 },
      );
    }

    const event = resend.webhooks.verify({
      payload,
      headers,
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    });

    if (event.type === "contact.updated") {
      await syncMarketingConsent({
        email: event.data.email,
        marketingConsent: !event.data.unsubscribed,
      });

      console.log(
        `📬 Resend status webhook sync: ${event.data.email} changed unsubscribed status to: ${event.data.unsubscribed}`,
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("❌ Failed to process Resend webhook event:", error);
    return NextResponse.json(
      { error: "Webhook event handler crashed" },
      { status: 500 },
    );
  }
}
