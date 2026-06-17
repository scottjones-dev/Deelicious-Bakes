import { task, schedules } from "@trigger.dev/sdk/v3";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { customers } from "@/db/schema/customers";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/emails";
import { env } from "@/config/env";
import * as Sentry from "@sentry/nextjs";

interface SyncUserPayload {
  userId: string;
  email: string;
  name: string;
  marketingConsent: boolean;
}

// =========================================================================
// TASK 1: Sync to Stripe (Creates Stripe Customer & updates Drizzle DB)
// =========================================================================
export const syncUserToStripe = task({
  id: "sync-user-to-stripe",
  retry: {
    maxAttempts: 5,
    factor: 2,
  },
  run: async (payload: SyncUserPayload) => {
    return await Sentry.withScope(async (scope) => {
      scope.setUser({ id: payload.userId, email: payload.email });
      scope.setTag("task", "sync-user-to-stripe");

      // 1. Stripe Customer Creation (Idempotent)
      const stripeCustomer = await stripe.customers.create(
        {
          email: payload.email,
          name: payload.name,
          metadata: { dbUserId: payload.userId },
        },
        { idempotencyKey: `stripe_cust_${payload.userId}` },
      );

      // 2. Sync to local Auth User Table
      await db
        .update(userTable)
        .set({ stripeCustomerId: stripeCustomer.id })
        .where(eq(userTable.id, payload.userId));

      // 3. Match and link the Customers Table (Decoupled profile table)
      const existingCustomer = await db.query.customers.findFirst({
        where: eq(customers.email, payload.email),
      });

      if (existingCustomer) {
        await db
          .update(customers)
          .set({
            userId: payload.userId,
            stripeCustomerId: stripeCustomer.id,
            marketingConsent: payload.marketingConsent,
          })
          .where(eq(customers.id, existingCustomer.id));
      } else {
        await db.insert(customers).values({
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
          stripeCustomerId: stripeCustomer.id,
          marketingConsent: payload.marketingConsent,
        });
      }

      return { stripeCustomerId: stripeCustomer.id };
    });
  },
});

// =========================================================================
// TASK 2: Sync to Resend Audience
// =========================================================================
export const syncUserToResend = task({
  id: "sync-user-to-resend",
  retry: {
    maxAttempts: 5,
    factor: 2,
  },
  run: async (payload: SyncUserPayload) => {
    const audienceId = env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return { skipped: true, reason: "No RESEND_AUDIENCE_ID configured" };
    }

    return await Sentry.withScope(async (scope) => {
      scope.setUser({ id: payload.userId, email: payload.email });
      scope.setTag("task", "sync-user-to-resend");

      const [firstName = "", lastName = ""] = payload.name.split(" ");

      try {
        await resend.contacts.create({
          audienceId,
          email: payload.email,
          firstName,
          lastName,
          unsubscribed: !payload.marketingConsent,
        });
      } catch (resendError: any) {
        // If contact already exists on Resend, update it to keep consent in sync
        if (resendError.message?.includes("already exists")) {
          await resend.contacts.update({
            audienceId,
            email: payload.email,
            firstName,
            lastName,
            unsubscribed: !payload.marketingConsent,
          });
        } else {
          throw resendError;
        }
      }

      return { success: true };
    });
  },
});

// =========================================================================
// TASK 3: Send Welcome Email
// =========================================================================
export const triggerWelcomeEmail = task({
  id: "trigger-welcome-email",
  retry: {
    maxAttempts: 3,
    factor: 1.5,
  },
  run: async (payload: { email: string; name: string }) => {
    await sendWelcomeEmail({
      to: payload.email,
      customerName: payload.name,
    });
    return { sent: true };
  },
});

// =========================================================================
// ORCHESTRATOR TASK (Backward Compatible Entrypoint)
// =========================================================================
export const syncUserOnVerification = task({
  id: "sync-user-on-verification",
  run: async (payload: SyncUserPayload) => {
    // Fire off Stripe, Resend and Welcome email tasks concurrently in the background.
    // If any individual task fails, Trigger.dev handles its retries in isolation.
    await Promise.all([
      syncUserToStripe.trigger(payload),
      syncUserToResend.trigger(payload),
      triggerWelcomeEmail.trigger({ email: payload.email, name: payload.name }),
    ]);

    return { orchestration: "initiated" };
  },
});

// =========================================================================
// SCHEDULED TASK: Daily Integrity Sync (3 AM Daily)
// =========================================================================
export const dailyUserIntegritySync = schedules.task({
  id: "daily-user-integrity-sync",
  cron: "0 3 * * *",
  run: async () => {
    return await Sentry.withScope(async (scope) => {
      scope.setTag("workflow", "daily-integrity-sync");

      try {
        const allUsers = await db.select().from(userTable);

        console.log(`📡 Starting daily sync for ${allUsers.length} users...`);

        for (const user of allUsers) {
          try {
            // A. Ensure Stripe Customer exists
            if (!user.stripeCustomerId) {
              const stripeCustomer = await stripe.customers.create(
                {
                  email: user.email,
                  name: user.name,
                  metadata: { dbUserId: user.id },
                },
                { idempotencyKey: `sync-${user.id}` },
              );

              await db
                .update(userTable)
                .set({ stripeCustomerId: stripeCustomer.id })
                .where(eq(userTable.id, user.id));
            }

            // B. Sync to Resend Audience
            if (env.RESEND_AUDIENCE_ID) {
              const [firstName = "", lastName = ""] = user.name.split(" ");

              try {
                await resend.contacts.create({
                  audienceId: env.RESEND_AUDIENCE_ID,
                  email: user.email,
                  firstName,
                  lastName,
                  unsubscribed: !user.marketingConsent,
                });
              } catch (resendError: any) {
                await resend.contacts.update({
                  audienceId: env.RESEND_AUDIENCE_ID,
                  email: user.email,
                  unsubscribed: !user.marketingConsent,
                });
              }
            }
          } catch (userError) {
            console.error(`❌ Failed to sync user ${user.email}:`, userError);
            Sentry.captureException(userError);
          }
        }

        return { processed: allUsers.length };
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  },
});
