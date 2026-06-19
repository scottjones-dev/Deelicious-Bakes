"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import type { OrderFulfillmentMethod, OrderStatus } from "@/db/schema";
import { customers, orders } from "@/db/schema";
import { assertAdminSession } from "@/lib/admin-auth";
import {
  createAdminOperationalNotification,
  writeAuditLog,
} from "@/lib/admin-events";
import { stripe } from "@/lib/stripe";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unknown error occurred.";
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await assertAdminSession();

    const previousOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    await Promise.all([
      writeAuditLog({
        entityType: "order",
        entityId: order.id,
        action: "status_update",
        beforeData: previousOrder ?? null,
        afterData: order,
      }),
      createAdminOperationalNotification({
        subject: "Order status updated",
        message: `Order ${order.id} status changed to ${status}.`,
        orderId: order.id,
        customerId: order.customerId,
      }),
    ]);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, order };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Order status update failed",
      message: `Could not update order ${orderId}: ${getErrorMessage(error)}.`,
      status: "failed",
      orderId,
    });
    console.error("Update order status error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to update order status.",
    };
  }
}

export async function syncOrdersWithStripeAction() {
  try {
    await assertAdminSession();

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
          const [createdOrder] = await db
            .insert(orders)
            .values({
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
            })
            .returning();

          await writeAuditLog({
            entityType: "order",
            entityId: createdOrder.id,
            action: "sync_from_stripe",
            afterData: createdOrder,
          });

          syncedCount++;
        }
      }
    }

    await createAdminOperationalNotification({
      subject: "Stripe orders synced",
      message: `Order sync completed with ${syncedCount} new order(s) from Stripe.`,
      status: "sent",
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return {
      success: true,
      message: `Sync complete! Added ${syncedCount} new Stripe orders to local database.`,
    };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Stripe order sync failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    console.error("Sync orders error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to sync orders with Stripe.",
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
  fulfillmentMethod: OrderFulfillmentMethod;
  fulfillmentDate?: string;
  fulfillmentTimeSlot?: string;
  total: string;
  status: OrderStatus;
}) {
  try {
    await assertAdminSession();

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

    await Promise.all([
      writeAuditLog({
        entityType: "order",
        entityId: order.id,
        action: "create",
        afterData: order,
      }),
      createAdminOperationalNotification({
        subject: "Manual order created",
        message: `Order ${order.id} was created for ${order.name}.`,
        status: "sent",
        orderId: order.id,
        customerId: order.customerId,
      }),
    ]);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, order };
  } catch (error: unknown) {
    await createAdminOperationalNotification({
      subject: "Manual order creation failed",
      message: getErrorMessage(error),
      status: "failed",
    });
    console.error("Create manual order error:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "Failed to create manual order.",
    };
  }
}
