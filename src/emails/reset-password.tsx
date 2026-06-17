import { Section, Text } from "react-email";
import { EmailButton } from "./_components/email-button";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface ResetPasswordProps {
  customerName: string;
  resetUrl: string;
  unsubscribeUrl?: string; // Passed explicitly to the layout
}

export const ResetPassword = ({
  customerName = "there",
  resetUrl = "#",
  unsubscribeUrl,
}: ResetPasswordProps) => {
  return (
    <EmailLayout
      previewText="Reset your Deelicious Bakes password 🔒"
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
        Password Reset Requested 🔒
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
        We received a request to reset your password for your Deelicious Bakes
        account. Click the button below to establish your new security
        credentials:
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href={resetUrl}>Reset My Password</EmailButton>
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
        If you didn't request a change, you can safely ignore this automated
        message. Your current credentials remain fully secure. This recovery
        token link is active for **1 hour**.
      </Text>
    </EmailLayout>
  );
};

export default ResetPassword;
