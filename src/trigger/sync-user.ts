import { task, schedules } from "@trigger.dev/sdk/v3";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { eq, isNull } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/emails";
import { env } from "@/config/env";
import * as Sentry from "@sentry/nextjs";

/**
 * 📧 Task: Sync a single user to Stripe and Resend
 * Triggered automatically after email verification
 */
export const syncUserOnVerification = task({
  id: "sync-user-on-verification",
  retry: {
    maxAttempts: 5,
    factor: 2,
  },
  run: async (payload: { userId: string; email: string; name: string; marketingConsent: boolean }) => {
    return await Sentry.withScope(async (scope) => {
      scope.setUser({ id: payload.userId, email: payload.email });
      scope.setTag("workflow", "afterEmailVerification-background");

      try {
        // 1. Stripe Step (Idempotent)
        scope.setContext("step", { name: "Stripe Creation" });
        const stripeCustomer = await stripe.customers.create({
          email: payload.email,
          name: payload.name,
          metadata: { dbUserId: payload.userId },
        }, { idempotencyKey: payload.userId });

        // 2. DB Sync Step
        scope.setContext("step", { name: "Database Update" });
        await db.update(userTable)
          .set({ stripeCustomerId: stripeCustomer.id })
          .where(eq(userTable.id, payload.userId));

        // 3. Resend Marketing Step
        if (env.RESEND_AUDIENCE_ID) {
          scope.setContext("step", { name: "Resend Audience Sync" });
          const [firstName = "", lastName = ""] = payload.name.split(" ");
          
          try {
            await resend.contacts.create({
              audienceId: env.RESEND_AUDIENCE_ID,
              email: payload.email,
              firstName,
              lastName,
              unsubscribed: !payload.marketingConsent,
            });
          } catch (resendError: any) {
            // If contact already exists, update it instead
            if (resendError.message?.includes("already exists")) {
              await resend.contacts.update({
                audienceId: env.RESEND_AUDIENCE_ID,
                email: payload.email,
                firstName,
                lastName,
                unsubscribed: !payload.marketingConsent,
              });
            } else {
              throw resendError;
            }
          }
        }

        // 4. Welcome Email
        scope.setContext("step", { name: "Welcome Email" });
        await sendWelcomeEmail({ 
          to: payload.email, 
          customerName: payload.name 
        });

        return { success: true };
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  },
});

/**
 * 🕒 Scheduled Task: Daily Integrity Sync
 * Runs every day at 3 AM to catch any missed syncs or updates
 */
export const dailyUserIntegritySync = schedules.task({
  id: "daily-user-integrity-sync",
  cron: "0 3 * * *", // 3 AM daily
  run: async () => {
    return await Sentry.withScope(async (scope) => {
      scope.setTag("workflow", "daily-integrity-sync");

      try {
        // 1. Fetch all users who might need syncing
        const allUsers = await db.select().from(userTable);
        
        console.log(`📡 Starting daily sync for ${allUsers.length} users...`);

        for (const user of allUsers) {
          try {
            // A. Ensure Stripe Customer exists
            if (!user.stripeCustomerId) {
              const stripeCustomer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { dbUserId: user.id },
              }, { idempotencyKey: `sync-${user.id}` });

              await db.update(userTable)
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
                // Update if already exists to ensure consent is current
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
            // Continue to next user
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
