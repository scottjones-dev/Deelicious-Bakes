import { task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";

import { env } from "@/config/env";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { sendOrderPlacedEmail } from "@/lib/emails";

interface SendOrderPlacedEmailPayload {
  orderId: string;
}

interface SendOrderPlacedEmailResult {
  orderId: string;
  sent: true;
}

export const sendOrderPlacedEmailTask = task({
  id: "send-order-placed-email",
  retry: {
    maxAttempts: 3,
    factor: 2,
  },
  run: async (
    payload: SendOrderPlacedEmailPayload,
  ): Promise<SendOrderPlacedEmailResult> => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, payload.orderId),
    });

    if (!order) {
      throw new Error(`Order ${payload.orderId} not found.`);
    }

    const result = await sendOrderPlacedEmail({
      to: order.email,
      customerName: order.name,
      orderNumber: order.id,
      totalAmount: order.total,
      orderUrl: `${env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`,
    });

    if (!result.success) {
      throw new Error(
        `Failed to send order placed email for order ${payload.orderId}.`,
      );
    }

    return {
      orderId: order.id,
      sent: true,
    };
  },
});
