import * as React from "react";
import { Text, Link, Section } from "react-email";
import { EmailLayout } from "./_components/email-layout";
import { EmailButton } from "./_components/email-button";
import { theme } from "./_components/theme";

interface VerifyEmailProps {
  customerName: string;
  verificationUrl: string;
  unsubscribeUrl?: string; // Passed explicitly to the layout
}

export const VerifyEmail = ({
  customerName = "there",
  verificationUrl = "#",
  unsubscribeUrl,
}: VerifyEmailProps) => {
  return (
    <EmailLayout
      previewText="Verify your email address to unlock fresh bakes! 🥐"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: "24px",
          fontWeight: "bold",
          color: theme.colors.foreground,
          margin: "0 0 16px 0",
        }}
      >
        Let's get you verified! 🥐
      </Text>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "16px",
          lineHeight: "26px",
          color: theme.colors.mutedForeground,
          margin: "0 0 24px 0",
        }}
      >
        Hi {customerName},
        <br />
        <br />
        Thank you for joining Deelicious Bakes! Before we can get your customer
        profile and billing portal activated, please confirm your email address
        by clicking the warm caramel action button below.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href={verificationUrl}>Verify Email Address</EmailButton>
      </Section>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "14px",
          lineHeight: "22px",
          color: theme.colors.mutedForeground,
          margin: "24px 0 0 0",
        }}
      >
        This verification link will expire in **1 hour**. If the button above
        doesn't work, copy and paste this URL into your browser:
        <br />
        <Link
          href={verificationUrl}
          style={{ color: theme.colors.primary, textDecoration: "underline" }}
        >
          {verificationUrl}
        </Link>
      </Text>
    </EmailLayout>
  );
};

export default VerifyEmail;
