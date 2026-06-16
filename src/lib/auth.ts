import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";
import { account, session, user, verification } from "@/db/schema/auth";
import { admin, anonymous } from "better-auth/plugins";

const isDevelopment = process.env.NODE_ENV === "development";
const domainArray = env.TRUSTED_ORIGINS?.split(",") || [];

export const auth = betterAuth({
    account: {
        accountLinking: {
            allowDifferentEmails: true,
            allowUnlinkingAll: true,
            enabled: true,
            trustedProviders() {
                // Implement your logic to determine trusted providers here
                return ["email-password", "facebook", "google", "microsoft",];
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
            user: user,
            verification: verification,
        },
    }),
    emailAndPassword: {
        autoSignIn: false,
        enabled: true,
        async onPasswordReset(data, request) {
            // Handle password reset logic here 
            // Send Email Later
            console.log("Password reset requested for:", data.user.email);
        },
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 60 * 60 * 1000, // 1 hour
        revokeSessionsOnPasswordReset: true,
        async sendResetPassword(data, request) {
            // Implement your email sending logic here
            console.log("Sending password reset email to:", data.user.email);
        },
    },
    emailVerification: {
        async afterEmailVerification(user, request) {
            // Implement your logic after email verification here
            // send email welcome email
            console.log("Email verified for user:", user.email);
        },
        autoSignInAfterVerification: true,
        enabled: true,
        expiresIn: 60 * 60 * 1000, // 1 hour
        sendOnSignIn: true,
        sendOnSignUp: true,
        requireEmailVerification: true,
        async sendVerificationEmail(data, request) {
            // Implement your email sending logic here
            // send email Email Verification email telling them to verify their email but expires in 1 hour
            console.log("Sending verification email to:", data.user.email);
        },
    },
    logger: {
        level: "debug",
        log(level, message, ...args) {
            // Implement your logging logic here
            console.log(`[${level.toUpperCase()}] ${message}`, ...args);
        },
    },
    onAPIError: {
        onError(error, ctx) {
            // Implement your error handling logic here
            console.error("API Error:", error);
        },
        throw: true,
    },
    plugins: [
        admin(),
        anonymous()
    ],
    rateLimit: {
        enabled: true,
        max: 100,
        window: 60 * 1000, // 1 minute
    },
    socialProviders: {
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
            enabled: true,
            fields: ["id", "email", "name", "first_name", "last_name", "picture"],
            scope: ["email", "public_profile"],
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            enabled: true,
            scope: ["openid", "email", "profile"],
        },
        microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID || "",
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
            enabled: true,
            scope: ["User.Read"],
        },
    },
    telemetry: {
        enabled: false,
    },
    trustedOrigins: async () => {
        if (isDevelopment) {
            return ["http://localhost:5173", ...domainArray];
        }
        return [env.NEXT_PUBLIC_APP_URL];
    },
    user: {
        changeEmail: {
            enabled: false,
        },
        deleteUser: {
            enabled: true,
            async afterDelete(user, request) {
                // Implement your logic after user deletion here
                console.log("User deleted:", user.email);
                // Emails last time sorry to see you go
            },
            async beforeDelete(user, request) {
                // Implement your logic before user deletion here
                // check if user has any pending transactions or is admin and prevent deletion if so
                console.log("Before deleting user:", user.email);
            },
            deleteTokenExpiresIn: 60 * 60 * 1000, // 1 hour
            async sendDeleteAccountVerification(data, request) {
                // Implement your email sending logic here
                console.log("Sending account deletion verification email to:", data.user.email);
            },
        }
    },
});