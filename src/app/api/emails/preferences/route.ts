import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { env } from "@/config/env";

export async function POST(request: Request) {
    try {
        // 1. Authenticate the user session via Better-Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized access. Please sign in." },
                { status: 401 }
            );
        }

        // 2. Safeguard against missing environment variables
        if (!env.RESEND_AUDIENCE_ID) {
            console.error("❌ Missing RESEND_AUDIENCE_ID in your configuration variables.");
            return NextResponse.json(
                { error: "Email service configuration missing." },
                { status: 500 }
            );
        }

        // 3. Parse the intended preference change from the request body
        const body = await request.json();
        const { subscribe } = body; // Expects a boolean: true to resubscribe, false to unsubscribe

        if (typeof subscribe !== "boolean") {
            return NextResponse.json(
                { error: "Invalid body parameter. 'subscribe' must be a boolean." },
                { status: 400 }
            );
        }

        const targetEmail = session.user.email;

        if (subscribe) {
            // 🔄 RESUB SCRIBE: Update the contact setting 'unsubscribed' to false
            await resend.contacts.update({
                audienceId: env.RESEND_AUDIENCE_ID,
                id: targetEmail, // Resend accepts the email string as the identifier here
                unsubscribed: false,
            });

            console.log(`✅ Resubscribed ${targetEmail} to marketing updates.`);
            return NextResponse.json({
                success: true,
                subscribed: true,
                message: "You have been successfully resubscribed to our bakery updates! 🥐"
            });
        } else {
            // 🔒 UNSUBSCRIBE: Update the contact setting 'unsubscribed' to true
            await resend.contacts.update({
                audienceId: env.RESEND_AUDIENCE_ID,
                id: targetEmail,
                unsubscribed: true,
            });

            console.log(`❌ Unsubscribed ${targetEmail} from marketing updates.`);
            return NextResponse.json({
                success: true,
                subscribed: false,
                message: "You have been unsubscribed. You will only receive transactional receipts. 🔒"
            });
        }

    } catch (error: any) {
        console.error("❌ Failed to update communication preferences:", error);
        return NextResponse.json(
            { error: error.message || "Internal server exception encountered." },
            { status: 500 }
        );
    }
}