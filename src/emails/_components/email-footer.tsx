import { Hr, Section, Text } from "react-email";
import { env } from "@/config/env";
import { theme } from "./theme";

interface EmailFooterProps {
  unsubscribeUrl?: string;
}

export const EmailFooter = ({ unsubscribeUrl }: EmailFooterProps) => {
  const fallbackUrl = `${env.NEXT_PUBLIC_APP_URL}/account/settings`;

  const targetUrl = unsubscribeUrl || fallbackUrl;

  return (
    <Section style={{ marginTop: "40px" }}>
      {/* Visual separator rule */}
      <Hr style={{ borderColor: theme.colors.border, margin: "24px 0" }} />

      {/* Brand Script Mark - Scaled up significantly to pop beautifully */}
      <Text
        style={{
          fontFamily: theme.fonts.signature,
          fontSize: "34px",
          fontWeight: "normal",
          color: theme.colors.primary,
          margin: "0 0 12px 0",
          lineHeight: "1",
        }}
      >
        Deelicious Bakes
      </Text>

      {/* Transactional Legal & Footer Text */}
      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "13px",
          lineHeight: "22px",
          color: theme.colors.mutedForeground,
          margin: "0",
          letterSpacing: "0.2px",
        }}
      >
        You are receiving this email because you opted into updates from
        Deelicious Bakes.
        <br />
        Salisbury, Wiltshire •
        <a
          href={targetUrl}
          style={{
            color: theme.colors.accent, // Rich caramel accent
            textDecoration: "underline",
            marginLeft: "4px",
          }}
        >
          Unsubscribe
        </a>
      </Text>
    </Section>
  );
};
