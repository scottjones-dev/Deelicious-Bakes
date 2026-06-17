import type * as React from "react";
import { Body, Container, Font, Head, Html, Preview } from "react-email";
import { env } from "@/config/env";
import { EmailFooter } from "./email-footer"; // Import updated footer
import { theme } from "./theme";

interface EmailLayoutProps {
  previewText: string;
  unsubscribeUrl?: string; // Add the prop here
  children: React.ReactNode;
}

const BASE_URL = env.NEXT_PUBLIC_APP_URL;

export const EmailLayout = ({
  previewText,
  unsubscribeUrl,
  children,
}: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Brittany Signature"
          fallbackFontFamily="Georgia"
          webFont={{
            url: `${BASE_URL}/fonts/BrittanySignature.ttf`,
            format: "truetype",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.foreground,
          fontFamily: theme.fonts.sans,
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <Container
          style={{
            backgroundColor: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: "40px",
            maxWidth: "580px",
          }}
        >
          {children}

          {/* Pass the unsubscribe string explicitly down to the footer */}
          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
};
