"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/config/env";
import { db } from "@/db";
import { customers } from "@/db/schema/customers";
import { sendWelcomeEmail } from "@/lib/emails";
import { resend } from "@/lib/resend";

const schema = z.object({
  email: z.email("Please enter a valid email address."),
  name: z.string().min(1, "Name is required."),
});

export async function subscribeToWaitlist(formData: {
  email: string;
  name: string;
}) {
  try {
    const validated = schema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.message };
    }

    const { email, name } = validated.data;
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 1. Check if they already exist in the database
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, cleanEmail))
      .limit(1);

    if (existing.length > 0) {
      const customer = existing[0];
      if (customer.marketingConsent) {
        return {
          success: true,
          message:
            "You're already subscribed to our waitlist! We'll keep you posted. 🥐",
        };
      }

      // Update marketing consent to true
      await db
        .update(customers)
        .set({ marketingConsent: true, name: cleanName })
        .where(eq(customers.id, customer.id));
    } else {
      // Create new customer with marketing consent
      await db.insert(customers).values({
        email: cleanEmail,
        name: cleanName,
        marketingConsent: true,
      });
    }

    // 2. Sync to Resend if audience ID is configured
    if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          audienceId: env.RESEND_AUDIENCE_ID,
          email: cleanEmail,
          firstName: cleanName,
          unsubscribed: false,
        });
      } catch (err) {
        console.error("Failed to add contact to Resend audience:", err);
        // Don't fail the action if Resend fails
      }
    }

    // 3. Send welcome email (asynchronous to not block the action)
    try {
      await sendWelcomeEmail({
        to: cleanEmail,
        customerName: cleanName,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }

    return {
      success: true,
      message:
        "You've successfully joined the Deelicious Bakes waitlist! Look out for a warm welcome in your inbox. 🥐",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Waitlist subscription error:", error);
    return {
      success: false,
      error:
        errorMessage || "An unexpected error occurred. Please try again later.",
    };
  }
}
