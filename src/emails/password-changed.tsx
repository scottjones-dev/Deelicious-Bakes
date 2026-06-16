import * as React from "react";
import { Text, Section } from "react-email";
import { EmailLayout } from "./_components/email-layout";
import { EmailButton } from "./_components/email-button";
import { theme } from "./_components/theme";

interface PasswordChangedProps {
  customerName: string;
  unsubscribeUrl?: string;
}

export const PasswordChanged = ({ 
  customerName = "there", 
  unsubscribeUrl 
}: PasswordChangedProps) => {
  return (
    <EmailLayout previewText="Your password has been successfully updated 🔒" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{
        fontFamily: theme.fonts.heading,
        fontSize: "24px",
        fontWeight: "bold",
        color: theme.colors.foreground,
        margin: "0 0 16px 0"
      }}>
        Security Update: Password Changed 🔒
      </Text>

      <Text style={{
        fontFamily: theme.fonts.sans,
        fontSize: "16px",
        lineHeight: "26px",
        color: theme.colors.mutedForeground,
        margin: "0 0 24px 0"
      }}>
        Hi {customerName},
        <br /><br />
        This is a quick confirmation that the password for your Dee-licious Bakes account was recently changed.
      </Text>

      <Text style={{
        fontFamily: theme.fonts.sans,
        fontSize: "16px",
        lineHeight: "26px",
        color: theme.colors.mutedForeground,
        margin: "0 0 24px 0"
      }}>
        If you made this change, you can safely disregard this email. If you did **not** authorize this update, please contact our support team immediately or use the button below to secure your account.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href="https://deeliciousbakes.co.uk/sign-in">
          Secure My Account
        </EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default PasswordChanged;
