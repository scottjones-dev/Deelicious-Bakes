"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { env } from "@/config/env";
import { db } from "@/db";
import { customers, user } from "@/db/schema";
import { assertAdminSession } from "@/lib/admin-auth";
import {
  createAdminOperationalNotification,
  writeAuditLog,
} from "@/lib/admin-events";
import { auth } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";

// =========================================================================
// CUSTOMER & AUTH SYNC (Kept local as requested)
// =========================================================================

export async function syncCustomersAction() {
  try {
    await assertAdminSession();

    const allCustomers = await db.select().from(customers);
    let syncedStripe = 0;
    let syncedResend = 0;

    for (const customer of allCustomers) {
      // 1. Sync to Stripe if they don't have stripeCustomerId
      if (!customer.stripeCustomerId) {
        try {
          const stripeCust = await stripe.customers.create({
            email: customer.email,
            name: customer.name ?? undefined,
          });

          await db
            .update(customers)
            .set({ stripeCustomerId: stripeCust.id })
            .where(eq(customers.id, customer.id));

          await writeAuditLog({
            entityType: "customer",
            entityId: customer.id,
            action: "stripe_linked",
            beforeData: customer,
            afterData: { ...customer, stripeCustomerId: stripeCust.id },
          });

          syncedStripe++;
        } catch (stripeErr) {
          console.error(`Stripe sync failed for ${customer.email}:`, stripeErr);
        }
      }

      // 2. Sync to Resend audience list
      if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
        try {
          await resend.contacts.create({
            audienceId: env.RESEND_AUDIENCE_ID,
            email: customer.email,
            firstName: customer.name ?? "Bake Lover",
            unsubscribed: !customer.marketingConsent,
          });
          syncedResend++;
        } catch (resendErr: any) {
          // If already exists, we update their status instead
          if (resendErr.message?.includes("already exists")) {
            try {
              await resend.contacts.update({
                audienceId: env.RESEND_AUDIENCE_ID,
                id: customer.email,
                unsubscribed: !customer.marketingConsent,
              });
              syncedResend++;
            } catch (err) {
              console.warn(
                `Resend contact update failed for ${customer.email}:`,
                err,
              );
            }
          } else {
            console.error(
              `Resend sync failed for ${customer.email}:`,
              resendErr,
            );
          }
        }
      }
    }

    await createAdminOperationalNotification({
      subject: "Customers synced",
      message: `Customer sync completed: ${syncedStripe} Stripe profile(s) linked and ${syncedResend} Resend contact(s) updated.`,
      status: "sent",
    });

    revalidatePath("/admin/customers");
    return {
      success: true,
      message: `Customers synced successfully! Connected ${syncedStripe} Stripe profiles and updated ${syncedResend} contacts on Resend.`,
    };
  } catch (error: any) {
    console.error("Sync customers error:", error);
    return {
      success: false,
      error: error.message || "Failed to run full manual sync.",
    };
  }
}

export async function onboardCustomerAction(data: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  marketingConsent: boolean;
}) {
  try {
    await assertAdminSession();

    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, cleanEmail),
    });

    if (existingUser) {
      return {
        success: false,
        error: "A user with this email address already exists.",
      };
    }

    // 2. Generate or use password
    const password =
      data.password ||
      Math.random().toString(36).slice(-8) +
        "!" +
        Math.random().toString(36).slice(-8).toUpperCase();

    // 3. Create user using Better Auth
    const result = await auth.api.createUser({
      body: {
        email: cleanEmail,
        password,
        name: data.name,
        role: "user",
        data: {
          marketingConsent: data.marketingConsent,
        },
      },
    });

    if (!result || !result.user) {
      throw new Error("Failed to register user account in system.");
    }

    const createdUser = result.user;

    // 4. Auto-verify since created by administrator
    await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, createdUser.id));

    // 5. Create local customer profile first so that syncUserToStripe updates it
    const [createdCustomer] = await db
      .insert(customers)
      .values({
        userId: createdUser.id,
        name: data.name,
        email: cleanEmail,
        phone: data.phone || null,
        marketingConsent: data.marketingConsent,
      })
      .returning();

    await writeAuditLog({
      entityType: "customer",
      entityId: createdCustomer.id,
      action: "create",
      afterData: createdCustomer,
    });

    await writeAuditLog({
      entityType: "user",
      entityId: createdUser.id,
      action: "create_for_customer_onboarding",
      afterData: createdUser,
    });

    // 6. Trigger Trigger.dev async background sync for Stripe, Resend, and Welcome email!
    try {
      await tasks.trigger("sync-user-on-verification", {
        userId: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        marketingConsent: data.marketingConsent,
      });
    } catch (taskError) {
      console.warn("Failed to trigger background sync task:", taskError);
    }

    revalidatePath("/admin/customers");
    return { success: true, user: createdUser };
  } catch (error: any) {
    console.error("Onboard customer error:", error);
    return {
      success: false,
      error: error.message || "Failed to onboard customer.",
    };
  }
}
