import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { auth } from "@/lib/auth";
import { syncMarketingConsent } from "@/lib/marketing-consent";
import { resend } from "@/lib/resend";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Internal server exception encountered.";
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please sign in." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, subscribe } = body;

    if (typeof subscribe !== "boolean") {
      return NextResponse.json(
        { error: "Invalid body parameter. 'subscribe' must be a boolean." },
        { status: 400 },
      );
    }

    await syncMarketingConsent({
      email: session.user.email,
      userId: session.user.id,
      name:
        typeof name === "string" && name.trim().length > 0
          ? name
          : session.user.name,
      marketingConsent: subscribe,
    });

    if (env.RESEND_AUDIENCE_ID) {
      await resend.contacts.update({
        audienceId: env.RESEND_AUDIENCE_ID,
        id: session.user.email,
        unsubscribed: !subscribe,
      });
    }

    return NextResponse.json({
      success: true,
      subscribed: subscribe,
      message: subscribe
        ? "You have been successfully resubscribed to our bakery updates! 🥐"
        : "You have been unsubscribed. You will only receive transactional receipts. 🔒",
    });
  } catch (error: unknown) {
    console.error("❌ Failed to update communication preferences:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
