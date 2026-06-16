import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";
import { account, session, user as userTable, verification } from "@/db/schema/auth";
import { admin, anonymous } from "better-auth/plugins";
import { tasks } from "@trigger.dev/sdk/v3";
import { resend } from "@/lib/resend";
import { sendVerificationEmail, sendForgotPasswordEmail } from "@/lib/emails";

const isDevelopment = env.NODE_ENV === "development";
const domainArray = env.TRUSTED_ORIGINS?.split(",") || [];

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
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
    baseURL: env.BETTER_AUTH_URL,
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
        // ✉️ Fires on initial sign up or whenever a new verification sequence triggers!
        async sendVerificationEmail(data, request) {
            await sendVerificationEmail({
                to: data.user.email,
                customerName: data.user.name,
                verificationUrl: data.url,
            });
        },
        sendOnSignIn: true,
        // 🎉 Triggers automatically when they click the token URL inside the email!
        async afterEmailVerification(user, request) {
            console.log(`📡 Triggering background sync for ${user.email}`);

            await tasks.trigger("sync-user-on-verification", {
                userId: user.id,
                email: user.email,
                name: user.name,
                // @ts-ignore - marketingConsent is an additionalField
                marketingConsent: user.marketingConsent === true,
            });
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
        additionalFields: {
            marketingConsent: {
                type: "boolean",
                defaultValue: false,
            },
            stripeCustomerId: {
                type: "string",

            }
        },
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