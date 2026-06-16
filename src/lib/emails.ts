import * as React from "react";
import { render } from "react-email";
import { resend } from "./resend";
import { env } from "@/config/env";

import WelcomeEmail from "@/emails/welcome";
import VerifyEmail from "@/emails/verify-email";
import ResetPassword from "@/emails/reset-password";

const FROM_ADDRESS = env.EMAIL_FROM_ADDRESS || 'Dee-licious Bakes <hello@dee-liciousbakes.com>';

interface SendWelcomeOptions {
    to: string;
    customerName: string;
}

interface SendVerificationOptions {
    to: string;
    customerName: string;
    verificationUrl: string;
}

interface SendResetOptions {
    to: string;
    customerName: string;
    resetUrl: string;
}

/**
 * 🥐 Send Welcome / Onboarding Email
 */
export async function sendWelcomeEmail({ to, customerName }: SendWelcomeOptions) {
    try {
        const html = await render(React.createElement(WelcomeEmail, { customerName }));

        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [to],
            subject: "Welcome to Dee-licious Bakes! 🥐",
            html,
        });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Failed to send welcome email to ${to}:`, error);
        return { success: false, error };
    }
}

/**
 * ✉️ Send Auth Email Verification Token Link
 */
export async function sendVerificationEmail({ to, customerName, verificationUrl }: SendVerificationOptions) {
    try {
        const html = await render(React.createElement(VerifyEmail, { customerName, verificationUrl }));

        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [to],
            subject: "Verify your Dee-licious Bakes email address! ✉️",
            html,
        });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Failed to send verification email to ${to}:`, error);
        return { success: false, error };
    }
}

/**
 * 🔒 Send Forgot Password / Reset Link Email
 */
export async function sendForgotPasswordEmail({ to, customerName, resetUrl }: SendResetOptions) {
    try {
        const html = await render(React.createElement(ResetPassword, { customerName, resetUrl }));

        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [to],
            subject: "Reset your Dee-licious Bakes password 🔒",
            html,
        });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Failed to send password reset to ${to}:`, error);
        return { success: false, error };
    }
}