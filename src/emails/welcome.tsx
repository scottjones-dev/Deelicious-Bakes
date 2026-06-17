import { Heading, Section, Text } from "react-email";
import { EmailButton } from "./_components/email-button";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface WelcomeEmailProps {
  customerName?: string;
  shopUrl?: string;
  unsubscribeUrl?: string; // Passed explicitly to the layout
}

export default function WelcomeEmail({
  customerName = "Bake Lover",
  shopUrl = "https://deeliciousbakes.co.uk",
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText="Welcome to Deelicious Bakes! 🥐"
      unsubscribeUrl={unsubscribeUrl}
    >
      {/* Main Title - Beautiful visual weight */}
      <Heading
        style={{
          fontFamily: theme.fonts.signature,
          fontSize: "56px",
          fontWeight: "normal",
          color: theme.colors.primary,
          margin: "0 0 28px 0",
          lineHeight: "1.1",
        }}
      >
        Deelicious Bakes
      </Heading>

      {/* Greeting String */}
      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "21px",
          lineHeight: "30px",
          color: theme.colors.foreground,
          margin: "0 0 12px 0",
          fontWeight: "bold",
        }}
      >
        Hi {customerName},
      </Text>

      {/* Main Body Message */}
      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "17px",
          lineHeight: "26px",
          color: theme.colors.mutedForeground,
          margin: "0 0 24px 0",
        }}
      >
        We are absolutely thrilled to have you join our sweet community of
        baking enthusiasts! 🧁
        <br />
        <br />
        Deelicious Bakes is born from a passion for creating handcrafted,
        unforgettable sweet moments. Every single cookie, brownie, cupcake, and
        celebration cake is baked fresh to order in our Salisbury-based kitchen,
        using only the finest ingredients and a whole lot of love.
        <br />
        <br />
        Whether you are planning an upcoming birthday, looking for local treats,
        or just fancy indulging your sweet tooth, we can't wait to bake
        something beautiful for you.
      </Text>

      {/* Action Button */}
      <Section style={{ margin: "32px 0 12px 0" }}>
        <EmailButton href={shopUrl}>Explore the Bakery</EmailButton>
      </Section>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  customerName: "Alex",
} as WelcomeEmailProps;
