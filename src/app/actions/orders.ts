"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { stripe } from "@/lib/stripe";

export async function updateOrderStatus(
  orderId: string,
  status:
    | "pending"
    | "paid"
    | "processing"
    | "ready_for_collection"
    | "completed"
    | "cancelled"
    | "refunded",
) {
  try {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error("Update order status error:", error);
    return {
      success: false,
      error: error.message || "Failed to update order status.",
    };
  }
}

export async function syncOrdersWithStripeAction() {
  try {
    // Sync stripe orders manually
    // 1. Fetch recent payment intents or checkouts from Stripe
    const sessions = await stripe.checkout.sessions.list({ limit: 50 });
    let syncedCount = 0;

    for (const session of sessions.data) {
      if (session.payment_status === "paid") {
        // Find if this session's payment intent is already registered
        const existingOrder = await db.query.orders.findFirst({
          where: eq(
            orders.stripePaymentIntentId,
            session.payment_intent as string,
          ),
        });

        if (!existingOrder && session.customer_details?.email) {
          const email = session.customer_details.email.toLowerCase().trim();
          const name = session.customer_details.name || "Bake Lover";

          // Find or create customer
          let customerRecord = await db.query.customers.findFirst({
            where: eq(customers.email, email),
          });

          if (!customerRecord) {
            const [newCust] = await db
              .insert(customers)
              .values({
                email,
                name,
                marketingConsent: false,
              })
              .returning();
            customerRecord = newCust;
          }

          // Create localized order in DB
          await db.insert(orders).values({
            customerId: customerRecord.id,
            status: "paid",
            fulfillmentMethod: session.shipping_cost
              ? "delivery"
              : "collection",
            name,
            email,
            phone: session.customer_details.phone || null,
            subtotal: ((session.amount_subtotal || 0) / 100).toFixed(2),
            total: ((session.amount_total || 0) / 100).toFixed(2),
            stripePaymentIntentId: session.payment_intent as string,
          });

          syncedCount++;
        }
      }
    }

    revalidatePath("/admin/orders");
    return {
      success: true,
      message: `Sync complete! Added ${syncedCount} new Stripe orders to local database.`,
    };
  } catch (error: any) {
    console.error("Sync orders error:", error);
    return {
      success: false,
      error: error.message || "Failed to sync orders with Stripe.",
    };
  }
}

export async function createManualOrderAction(data: {
  customerSelection: "existing" | "new";
  customerId?: string;
  name: string;
  email: string;
  phone?: string;
  note?: string;
  fulfillmentMethod: "collection" | "delivery";
  fulfillmentDate?: string;
  fulfillmentTimeSlot?: string;
  total: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "ready_for_collection"
    | "completed"
    | "cancelled"
    | "refunded";
}) {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    let finalCustomerId = data.customerId;

    if (data.customerSelection === "new" || !finalCustomerId) {
      // Find or create customer
      let customerRecord = await db.query.customers.findFirst({
        where: eq(customers.email, cleanEmail),
      });

      if (!customerRecord) {
        const [newCust] = await db
          .insert(customers)
          .values({
            email: cleanEmail,
            name: data.name,
            phone: data.phone || null,
            marketingConsent: false,
          })
          .returning();
        customerRecord = newCust;
      } else {
        // Update customer profile with phone if not currently set
        await db
          .update(customers)
          .set({
            name: customerRecord.name || data.name,
            phone: customerRecord.phone || data.phone || null,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customerRecord.id));
      }
      finalCustomerId = customerRecord.id;
    }

    // Insert manual order in DB
    const [order] = await db
      .insert(orders)
      .values({
        customerId: finalCustomerId,
        status: data.status,
        fulfillmentMethod: data.fulfillmentMethod,
        name: data.name,
        email: cleanEmail,
        phone: data.phone || null,
        note: data.note || null,
        fulfillmentDate: data.fulfillmentDate
          ? new Date(data.fulfillmentDate)
          : null,
        fulfillmentTimeSlot: data.fulfillmentTimeSlot || null,
        subtotal: data.total,
        total: data.total,
        currency: "gbp",
      })
      .returning();

    revalidatePath("/admin/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error("Create manual order error:", error);
    return {
      success: false,
      error: error.message || "Failed to create manual order.",
    };
  }
}
