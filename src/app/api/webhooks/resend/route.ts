import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "contact.updated") {
      const email = data.email;
      const isUnsubscribed = data.unsubscribed;

      console.log(`📬 Resend status webhook sync: ${email} changed unsubscribed status to: ${isUnsubscribed}`);
      // [Database sync logic will go here later]
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Failed to process Resend webhook event:", error);
    return NextResponse.json({ error: "Webhook event handler crashed" }, { status: 500 });
  }
}