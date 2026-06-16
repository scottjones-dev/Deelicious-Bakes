import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";
import { account, session, user as userTable, verification } from "@/db/schema/auth"; 
import { admin, anonymous } from "better-auth/plugins";
import { eq } from "drizzle-orm"; 
import { stripe } from "@/lib/stripe"; 
import { resend } from "@/lib/resend";
import { sendWelcomeEmail, sendVerificationEmail, sendForgotPasswordEmail } from "@/lib/emails";

const isDevelopment = process.env.NODE_ENV === "development";
const domainArray = env.TRUSTED_ORIGINS?.split(",") || [];

export const auth = betterAuth({
    account: {
        accountLinking: {
            allowDifferentEmails: true,
            allowUnlinkingAll: true,
            enabled: true,
            trustedProviders() {
                return ["email-password", "facebook", "google", "microsoft"];
            },
            updateUserInfoOnLink: true,
        },
    },
    advanced: {
        ipAddress: {
            ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
        },
    },
    appName: siteConfig.name,
    basePath: "/api/auth",
    baseURL: siteConfig.url,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            account: account,
            session: session,
            user: userTable,
            verification: verification,
        },
    }),
    emailAndPassword: {
        autoSignIn: false,
        enabled: true,
        async onPasswordReset(data, request) {
            console.log("Password reset link requested for confirmation context.");
        },
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 60 * 60 * 1000,
        revokeSessionsOnPasswordReset: true,
        
        // 🔒 Fires instantly when a password reset transaction is started!
        async sendResetPassword(data, request) {
            await sendForgotPasswordEmail({
                to: data.user.email,
                customerName: data.user.name,
                resetUrl: data.url, // Better-Auth passes down the complete localized reset endpoint token string automatically
            });
        },
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        enabled: true,
        requireEmailVerification: true,

        // ✉️ Fires on initial sign up or whenever a new verification sequence triggers!
        async sendVerificationEmail(data, request) {
            await sendVerificationEmail({
                to: data.user.email,
                customerName: data.user.name,
                verificationUrl: data.url, // Better-Auth passes down the auto-generated email callback check link
            });
        },

        // 🎉 Triggers automatically when they click the token URL inside the email!
        async afterEmailVerification(user, request) {
            console.log("🎉 User verified email. Running global synchronization pipelines...");

            try {
                // 1. Create matching profile inside Stripe
                const stripeCustomer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: { dbUserId: user.id },
                });

                // 2. Map Stripe identifier to user record row in Postgres
                await db.update(userTable)
                    .set({ stripeCustomerId: stripeCustomer.id })
                    .where(eq(userTable.id, user.id));

                // 3. Sync to Resend Audiences Marketing Contacts
                if (env.RESEND_AUDIENCE_ID) {
                    const [firstName = "", lastName = ""] = user.name.split(" ");
                    await resend.contacts.create({
                        audienceId: env.RESEND_AUDIENCE_ID,
                        email: user.email,
                        firstName,
                        lastName,
                        unsubscribed: false,
                    });
                }

                // 4. Dispatch the Gourmet Welcome Confirmation Layout
                await sendWelcomeEmail({ 
                    to: user.email, 
                    customerName: user.name 
                });

                console.log(`✅ Sync complete for ${user.email}. DB, Resend, and Stripe are unified.`);
            } catch (error) {
                console.error("❌ Failed to complete background syncing operations:", error);
            }
        },
    },
    logger: {
        level: "debug",
        log(level, message, ...args) {
            console.log(`[${level.toUpperCase()}] ${message}`, ...args);
        },
    },
    onAPIError: {
        onError(error, ctx) {
            console.error("API Error:", error);
        },
        throw: true,
    },
    plugins: [admin(), anonymous()],
    rateLimit: {
        enabled: true,
        max: 100,
        window: 60 * 1000,
    },
    socialProviders: {},
    telemetry: { enabled: false },
    trustedOrigins: async () => {
        if (isDevelopment) {
            return ["http://localhost:5173", ...domainArray];
        }
        return [env.NEXT_PUBLIC_APP_URL];
    },
    user: {
        changeEmail: { enabled: false },
        deleteUser: {
            enabled: true,
            async afterDelete(user, request) {
                console.log("User deleted:", user.email);
                if (env.RESEND_AUDIENCE_ID) {
                    try {
                        await resend.contacts.remove({
                            audienceId: env.RESEND_AUDIENCE_ID,
                            email: user.email,
                        });
                    } catch (err) {
                        console.error("Failed to remove contact on deletion:", err);
                    }
                }
            },
            async beforeDelete(user, request) {
                console.log("Before deleting user:", user.email);
            },
            deleteTokenExpiresIn: 60 * 60 * 1000,
            async sendDeleteAccountVerification(data, request) {
                console.log("Sending account deletion verification email to:", data.user.email);
            },
        }
    },
});