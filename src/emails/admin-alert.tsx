import { Section, Text } from "react-email";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface AdminAlertEmailProps {
  subject: string;
  message: string;
  status?: "pending" | "sent" | "failed" | "delivered";
}

export default function AdminAlertEmail({
  subject,
  message,
  status = "pending",
}: AdminAlertEmailProps) {
  return (
    <EmailLayout previewText={`Admin alert: ${subject}`}>
      <Text
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: "24px",
          fontWeight: "bold",
          color: theme.colors.foreground,
          margin: "0 0 14px 0",
        }}
      >
        Admin Alert
      </Text>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "16px",
          lineHeight: "26px",
          color: theme.colors.mutedForeground,
          margin: "0 0 20px 0",
        }}
      >
        <strong>Subject:</strong> {subject}
      </Text>

      <Section
        style={{
          padding: "20px",
          backgroundColor: theme.colors.background,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          margin: "0 0 20px 0",
        }}
      >
        <Text
          style={{
            margin: "0",
            color: "#2f170f",
            fontFamily: theme.fonts.sans,
            fontSize: "15px",
            lineHeight: "24px",
          }}
        >
          {message}
        </Text>
      </Section>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "13px",
          lineHeight: "20px",
          color: theme.colors.mutedForeground,
          margin: "0",
        }}
      >
        Status: {status}
      </Text>
    </EmailLayout>
  );
}
