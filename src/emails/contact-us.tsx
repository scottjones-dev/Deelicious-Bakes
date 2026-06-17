import { Section, Text } from "react-email";
import { EmailButton } from "./_components/email-button";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface ContactUsProps {
  customerName: string;
  message: string;
  unsubscribeUrl?: string;
}

export const ContactUs = ({
  customerName = "there",
  message = "",
  unsubscribeUrl,
}: ContactUsProps) => {
  return (
    <EmailLayout
      previewText="We've received your message! 🍪"
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
        Thank you for contacting us! 🍪
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
        We've received your message and our team will get back to you as soon as
        possible. Here is a copy of what you sent us:
      </Text>

      <Section
        style={{
          padding: "24px",
          backgroundColor: theme.colors.background,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            margin: "0",
            color: theme.colors.foreground,
            fontStyle: "italic",
          }}
        >
          "{message}"
        </Text>
      </Section>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "16px",
          lineHeight: "26px",
          color: theme.colors.mutedForeground,
        }}
      >
        In the meantime, feel free to browse our latest bakes!
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href="https://deeliciousbakes.co.uk">
          Back to Bakery
        </EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default ContactUs;
