import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { syncMarketingConsent } from "@/lib/marketing-consent";
import { resend } from "@/lib/resend";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

function renderHtmlResponse(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 0; background: #fff9f5; color: #2f1b14; }
      main { max-width: 560px; margin: 64px auto; background: #ffffff; border: 1px solid #f1ddd2; border-radius: 12px; padding: 32px; }
      h1 { margin: 0 0 12px 0; font-size: 24px; }
      p { margin: 0 0 20px 0; line-height: 1.6; }
      a { color: #b45309; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}">Return to Deelicious Bakes</a>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

async function markResendContactUnsubscribed(email: string) {
  if (!env.RESEND_AUDIENCE_ID) {
    return;
  }

  try {
    await resend.contacts.update({
      audienceId: env.RESEND_AUDIENCE_ID,
      email,
      unsubscribed: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("No contact")
    ) {
      await resend.contacts.create({
        audienceId: env.RESEND_AUDIENCE_ID,
        email,
        unsubscribed: true,
      });
      return;
    }

    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return renderHtmlResponse(
      "Unsubscribe link is invalid",
      "This email unsubscribe link is missing required details. Please use the full link from your email.",
      400,
    );
  }

  const email = verifyUnsubscribeToken(token);

  if (!email) {
    return renderHtmlResponse(
      "Unsubscribe link is invalid",
      "This unsubscribe link has expired or is not valid anymore.",
      400,
    );
  }

  try {
    await syncMarketingConsent({
      email,
      marketingConsent: false,
    });

    await markResendContactUnsubscribed(email);

    return renderHtmlResponse(
      "You are unsubscribed",
      "You will no longer receive marketing emails from Deelicious Bakes. You may still receive essential transactional emails.",
    );
  } catch (error) {
    console.error(
      `❌ Failed to process email unsubscribe for ${email}:`,
      error,
    );
    return renderHtmlResponse(
      "Unsubscribe failed",
      "We couldn't process your unsubscribe request right now. Please try again in a few minutes.",
      500,
    );
  }
}
