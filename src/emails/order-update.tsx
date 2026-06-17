import { Section, Text } from "react-email";
import { EmailButton } from "./_components/email-button";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface OrderUpdateProps {
  customerName: string;
  orderNumber: string;
  updateStatus: string;
  message: string;
  orderUrl: string;
  unsubscribeUrl?: string;
}

export const OrderUpdate = ({
  customerName = "there",
  orderNumber = "ORD-000",
  updateStatus = "Updated",
  message = "Your order status has changed.",
  orderUrl = "#",
  unsubscribeUrl,
}: OrderUpdateProps) => {
  return (
    <EmailLayout
      previewText={`Update regarding your order ${orderNumber} 🥐`}
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
        Order Update: {updateStatus} 🥐
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
        We have an update regarding your order **{orderNumber}**:
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

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href={orderUrl}>View Order Details</EmailButton>
      </Section>
    </EmailLayout>
  );
};

export default OrderUpdate;
