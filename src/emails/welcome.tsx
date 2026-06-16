import * as React from "react";
import { Text, Heading, Section } from "react-email"; 
import { EmailLayout } from "./_components/email-layout";
import { EmailButton } from "./_components/email-button";
import { theme } from "./_components/theme";

interface WelcomeEmailProps {
  customerName?: string;
  unsubscribeUrl?: string; // Passed explicitly to the layout
}

export default function WelcomeEmail({ 
  customerName = "Bake Lover",
  unsubscribeUrl 
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Fresh updates from the bakery..." unsubscribeUrl={unsubscribeUrl}>

      {/* Main Title - Beautiful visual weight */}
      <Heading style={{
        fontFamily: theme.fonts.signature,
        fontSize: "56px", 
        fontWeight: "normal",
        color: theme.colors.primary, 
        margin: "0 0 28px 0",
        lineHeight: "1.1"
      }}>
        Dee-licious Bakes
      </Heading>

      {/* Greeting String */}
      <Text style={{
        fontFamily: theme.fonts.sans,
        fontSize: "21px",
        lineHeight: "30px",
        color: theme.colors.foreground, 
        margin: "0 0 12px 0",
        fontWeight: "bold"
      }}>
        Hi {customerName},
      </Text>

      {/* Main Body Message */}
      <Text style={{
        fontFamily: theme.fonts.sans,
        fontSize: "17px",
        lineHeight: "26px",
        color: theme.colors.mutedForeground, 
        margin: "0 0 28px 0"
      }}>
        Your baking order has been received and is currently being crafted in our Salisbury kitchen!
      </Text>

      {/* Action Button */}
      <Section style={{ margin: "32px 0 12px 0" }}>
        <EmailButton href="https://localhost:3000/dashboard/orders">
          View Order Progress
        </EmailButton>
      </Section>

    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  customerName: "Alex",
} as WelcomeEmailProps;