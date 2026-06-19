import { and, eq } from "drizzle-orm";
import * as React from "react";
import { render } from "react-email";
import { env } from "@/config/env";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import AdminAlertEmail from "@/emails/admin-alert";
import ContactUs from "@/emails/contact-us";
import OrderPlaced from "@/emails/order-placed";
import OrderUpdate from "@/emails/order-update";
import PasswordChanged from "@/emails/password-changed";
import ResetPassword from "@/emails/reset-password";
import VerifyEmail from "@/emails/verify-email";
import WelcomeEmail from "@/emails/welcome";
import { resend } from "./resend";
import { buildEmailUnsubscribeUrl } from "./unsubscribe-token";

const FROM_ADDRESS =
  env.EMAIL_FROM_ADDRESS || "Deelicious Bakes <hello@deeliciousbakes.co.uk>";

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

interface SendPasswordChangedOptions {
  to: string;
  customerName: string;
}

interface SendOrderPlacedOptions {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: string;
  orderUrl: string;
}

interface SendOrderUpdateOptions {
  to: string;
  customerName: string;
  orderNumber: string;
  updateStatus: string;
  message: string;
  orderUrl: string;
}

interface SendContactUsOptions {
  to: string;
  customerName: string;
  message: string;
}

interface SendAdminAlertOptions {
  subject: string;
  message: string;
  status?: "pending" | "sent" | "failed" | "delivered";
}

async function getAdminAlertRecipients() {
  const dbAdmins = await db
    .select({ email: userTable.email })
    .from(userTable)
    .where(and(eq(userTable.role, "admin"), eq(userTable.banned, false)));

  const configuredList = env.ADMIN_ALERT_EMAILS
    ? env.ADMIN_ALERT_EMAILS.split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

  if (env.ADMIN_EMAIL) {
    configuredList.push(env.ADMIN_EMAIL);
  }

  const recipients = [
    ...dbAdmins.map((admin) => admin.email.trim().toLowerCase()),
    ...configuredList,
  ];

  return Array.from(new Set(recipients));
}

/**
 * 🥐 Send Welcome / Onboarding Email
 */
export async function sendWelcomeEmail({
  to,
  customerName,
}: SendWelcomeOptions) {
  try {
    const html = await render(
      React.createElement(WelcomeEmail, {
        customerName,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Welcome to Deelicious Bakes! 🥐",
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
export async function sendVerificationEmail({
  to,
  customerName,
  verificationUrl,
}: SendVerificationOptions) {
  try {
    const html = await render(
      React.createElement(VerifyEmail, {
        customerName,
        verificationUrl,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Verify your Deelicious Bakes email address! ✉️",
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
export async function sendForgotPasswordEmail({
  to,
  customerName,
  resetUrl,
}: SendResetOptions) {
  try {
    const html = await render(
      React.createElement(ResetPassword, {
        customerName,
        resetUrl,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Reset your Deelicious Bakes password 🔒",
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send password reset to ${to}:`, error);
    return { success: false, error };
  }
}

/**
 * 🔐 Send Password Changed Confirmation
 */
export async function sendPasswordChangedEmail({
  to,
  customerName,
}: SendPasswordChangedOptions) {
  try {
    const html = await render(
      React.createElement(PasswordChanged, {
        customerName,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Your Deelicious Bakes password has been changed 🔐",
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send password changed email to ${to}:`, error);
    return { success: false, error };
  }
}

/**
 * 🧁 Send Order Placed Confirmation
 */
export async function sendOrderPlacedEmail({
  to,
  customerName,
  orderNumber,
  totalAmount,
  orderUrl,
}: SendOrderPlacedOptions) {
  try {
    const html = await render(
      React.createElement(OrderPlaced, {
        customerName,
        orderNumber,
        totalAmount,
        orderUrl,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: `Thank you for your order ${orderNumber}! 🧁`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send order confirmation to ${to}:`, error);
    return { success: false, error };
  }
}

/**
 * 🥐 Send Order Update Notification
 */
export async function sendOrderUpdateEmail({
  to,
  customerName,
  orderNumber,
  updateStatus,
  message,
  orderUrl,
}: SendOrderUpdateOptions) {
  try {
    const html = await render(
      React.createElement(OrderUpdate, {
        customerName,
        orderNumber,
        updateStatus,
        message,
        orderUrl,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: `Update regarding your order ${orderNumber} 🥐`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send order update to ${to}:`, error);
    return { success: false, error };
  }
}

/**
 * 🍪 Send Contact Us Confirmation
 */
export async function sendContactUsEmail({
  to,
  customerName,
  message,
}: SendContactUsOptions) {
  try {
    const html = await render(
      React.createElement(ContactUs, {
        customerName,
        message,
        unsubscribeUrl: buildEmailUnsubscribeUrl(to),
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: "We've received your message! 🍪",
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send contact confirmation to ${to}:`, error);
    return { success: false, error };
  }
}

export async function sendAdminAlertEmail({
  subject,
  message,
  status,
}: SendAdminAlertOptions) {
  const recipients = await getAdminAlertRecipients();
  if (recipients.length === 0) {
    return {
      success: false,
      skipped: true as const,
      error: "No admin recipient",
    };
  }

  try {
    const html = await render(
      React.createElement(AdminAlertEmail, {
        subject,
        message,
        status,
      }),
    );

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipients,
      subject: `[Admin] ${subject}`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to send admin alert email:", error);
    return { success: false, error };
  }
}
