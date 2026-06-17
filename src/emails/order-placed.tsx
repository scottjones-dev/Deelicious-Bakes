import { Hr, Section, Text } from "react-email";
import { EmailButton } from "./_components/email-button";
import { EmailLayout } from "./_components/email-layout";
import { theme } from "./_components/theme";

interface OrderPlacedProps {
  customerName: string;
  orderNumber: string;
  totalAmount: string;
  orderUrl: string;
  unsubscribeUrl?: string;
}

export const OrderPlaced = ({
  customerName = "there",
  orderNumber = "ORD-000",
  totalAmount = "£0.00",
  orderUrl = "#",
  unsubscribeUrl,
}: OrderPlacedProps) => {
  return (
    <EmailLayout
      previewText={`Thank you for your order ${orderNumber}! 🧁`}
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
        Order Confirmed! 🧁
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
        We've received your order and our bakers are getting ready to start
        crafting your treats! Here are your order details:
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
            fontWeight: "bold",
          }}
        >
          Order Number: {orderNumber}
        </Text>
        <Hr style={{ borderColor: theme.colors.border, margin: "12px 0" }} />
        <Text style={{ margin: "0", color: theme.colors.mutedForeground }}>
          Total Amount:{" "}
          <span style={{ color: theme.colors.accent, fontWeight: "bold" }}>
            {totalAmount}
          </span>
        </Text>
      </Section>

      <Section style={{ margin: "24px 0" }}>
        <EmailButton href={orderUrl}>Track My Order</EmailButton>
      </Section>

      <Text
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: "14px",
          lineHeight: "22px",
          color: theme.colors.mutedForeground,
        }}
      >
        You'll receive another update when your order is ready for delivery or
        collection.
      </Text>
    </EmailLayout>
  );
};

export default OrderPlaced;
