"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  products,
  productVariants,
  productTags,
  tags,
  orders,
  customers,
  reviews,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { tasks } from "@trigger.dev/sdk/v3";
import { resend } from "@/lib/resend";
import { env } from "@/config/env";

// =========================================================================
// 1. CATEGORY ACTIONS
// =========================================================================

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  try {
    const [category] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        image: data.image,
      })
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Create category error:", error);
    return {
      success: false,
      error: error.message || "Failed to create category.",
    };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
  },
) {
  try {
    const [category] = await db
      .update(categories)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        image: data.image,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    console.error("Update category error:", error);
    return {
      success: false,
      error: error.message || "Failed to update category.",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Determine if any products are currently linked to this category
    const linkedProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, id));

    let reassignedCount = 0;

    if (linkedProducts.length > 0) {
      // Find or create default "Uncategorized" category
      let uncategorized = await db.query.categories.findFirst({
        where: eq(categories.slug, "uncategorized"),
      });

      if (!uncategorized) {
        const [newUncat] = await db
          .insert(categories)
          .values({
            name: "Uncategorized",
            slug: "uncategorized",
            description:
              "Default fallback for products with deleted categories.",
          })
          .returning();
        uncategorized = newUncat;
      }

      // Reassign products to Uncategorized
      await db
        .update(products)
        .set({ categoryId: uncategorized.id })
        .where(eq(products.categoryId, id));

      reassignedCount = linkedProducts.length;
    }

    // Delete the original category
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return {
      success: true,
      reassignedCount,
      message:
        reassignedCount > 0
          ? `Category deleted. ${reassignedCount} products were safely moved to 'Uncategorized'.`
          : "Category deleted successfully.",
    };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category.",
    };
  }
}

// =========================================================================
// 2. PRODUCT ACTIONS
// =========================================================================

export async function createProduct(
  data: {
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    status?: "active" | "draft" | "archived";
    images?: any;
    leadTimeDays?: number;
    isCollectionOnly?: boolean;
    availableDays?: number[];
  },
  variantsList: {
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
  }[],
  tagIds: string[],
) {
  try {
    const [product] = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        categoryId: data.categoryId,
        status: data.status || "active",
        images: data.images,
        leadTimeDays: data.leadTimeDays ?? 0,
        isCollectionOnly: data.isCollectionOnly ?? false,
        availableDays: data.availableDays || [1, 2, 3, 4, 5, 6, 0],
      })
      .returning();

    // Insert variants
    if (variantsList.length > 0) {
      await db.insert(productVariants).values(
        variantsList.map((v, i) => ({
          productId: product.id,
          name: v.name,
          sku:
            v.sku ||
            `${product.slug}-${v.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          position: i,
          disabled: false,
        })),
      );
    }

    // Link tags
    if (tagIds.length > 0) {
      await db.insert(productTags).values(
        tagIds.map((tId) => ({
          productId: product.id,
          tagId: tId,
        })),
      );
    }

    // Trigger background sync task with Stripe (Optional, handles asynchronously)
    try {
      await tasks.trigger("sync-product-with-stripe", {
        productId: product.id,
      });
    } catch (taskErr) {
      console.warn(
        "Failed to fire Stripe background task, manual sync available:",
        taskErr,
      );
    }

    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error: any) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: error.message || "Failed to create product.",
    };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    status?: "active" | "draft" | "archived";
    images?: any;
    leadTimeDays?: number;
    isCollectionOnly?: boolean;
    availableDays?: number[];
  },
  variantsList: {
    id?: string;
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
  }[],
  tagIds: string[],
) {
  try {
    const [product] = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        description: data.description,
        categoryId: data.categoryId,
        status: data.status || "active",
        images: data.images,
        leadTimeDays: data.leadTimeDays ?? 0,
        isCollectionOnly: data.isCollectionOnly ?? false,
        availableDays: data.availableDays || [1, 2, 3, 4, 5, 6, 0],
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // Simple variant replacement strategy (for simplicity & clean state)
    // 1. Fetch current variant IDs to delete them later or just recreate
    await db.delete(productVariants).where(eq(productVariants.productId, id));

    // 2. Insert new variants list
    if (variantsList.length > 0) {
      await db.insert(productVariants).values(
        variantsList.map((v, i) => ({
          productId: id,
          name: v.name,
          sku:
            v.sku ||
            `${product.slug}-${v.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          position: i,
          disabled: false,
        })),
      );
    }

    // Update tags
    await db.delete(productTags).where(eq(productTags.productId, id));
    if (tagIds.length > 0) {
      await db.insert(productTags).values(
        tagIds.map((tId) => ({
          productId: id,
          tagId: tId,
        })),
      );
    }

    // Sync changes to Stripe
    try {
      await tasks.trigger("sync-product-with-stripe", { productId: id });
    } catch (taskErr) {
      console.warn(
        "Failed to fire Stripe update task, manual sync available:",
        taskErr,
      );
    }

    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error: any) {
    console.error("Update product error:", error);
    return {
      success: false,
      error: error.message || "Failed to update product.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    // 1. Delete on Stripe first (archive so it doesn't show up in listings)
    try {
      await stripe.products.update(id, { active: false });
    } catch (stripeErr) {
      console.warn(
        "Could not archive product on Stripe (maybe it didn't exist there yet):",
        stripeErr,
      );
    }

    // 2. Cascade delete from local DB
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product.",
    };
  }
}

export async function syncProductToStripeAction(productId: string) {
  try {
    // Trigger task immediately or run logic manually
    await tasks.trigger("sync-product-with-stripe", { productId });
    return {
      success: true,
      message: "Sync task successfully triggered in the background! 🏷️",
    };
  } catch (error: any) {
    console.error("Sync product action error:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger product sync.",
    };
  }
}

// =========================================================================
// 3. ORDER ACTIONS & SYNC
// =========================================================================

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

// =========================================================================
// 4. CUSTOMER SYNC
// =========================================================================

export async function syncCustomersAction() {
  try {
    const allCustomers = await db.select().from(customers);
    let syncedStripe = 0;
    let syncedResend = 0;

    for (const customer of allCustomers) {
      // 1. Sync to Stripe if they don't have stripeCustomerId
      if (!customer.stripeCustomerId) {
        try {
          const stripeCust = await stripe.customers.create({
            email: customer.email,
            name: customer.name ?? undefined,
          });

          await db
            .update(customers)
            .set({ stripeCustomerId: stripeCust.id })
            .where(eq(customers.id, customer.id));

          syncedStripe++;
        } catch (stripeErr) {
          console.error(`Stripe sync failed for ${customer.email}:`, stripeErr);
        }
      }

      // 2. Sync to Resend audience list
      if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
        try {
          await resend.contacts.create({
            audienceId: env.RESEND_AUDIENCE_ID,
            email: customer.email,
            firstName: customer.name ?? "Bake Lover",
            unsubscribed: !customer.marketingConsent,
          });
          syncedResend++;
        } catch (resendErr: any) {
          // If already exists, we update their status instead
          if (resendErr.message?.includes("already exists")) {
            try {
              await resend.contacts.update({
                audienceId: env.RESEND_AUDIENCE_ID,
                id: customer.email,
                unsubscribed: !customer.marketingConsent,
              });
              syncedResend++;
            } catch (err) {
              console.warn(
                `Resend contact update failed for ${customer.email}:`,
                err,
              );
            }
          } else {
            console.error(
              `Resend sync failed for ${customer.email}:`,
              resendErr,
            );
          }
        }
      }
    }

    revalidatePath("/admin/customers");
    return {
      success: true,
      message: `Customers synced successfully! Connected ${syncedStripe} Stripe profiles and updated ${syncedResend} contacts on Resend.`,
    };
  } catch (error: any) {
    console.error("Sync customers error:", error);
    return {
      success: false,
      error: error.message || "Failed to run full manual sync.",
    };
  }
}

// =========================================================================
// 5. REVIEWS ACTIONS
// =========================================================================

export async function submitReviewAction(
  productId: string,
  customerName: string,
  customerEmail: string,
  rating: number,
  comment: string,
  orderId?: string,
) {
  try {
    const cleanEmail = customerEmail.toLowerCase().trim();

    // Find if customer exists
    let customerRecord = await db.query.customers.findFirst({
      where: eq(customers.email, cleanEmail),
    });

    if (!customerRecord) {
      // Auto-create customer record
      const [newCust] = await db
        .insert(customers)
        .values({
          email: cleanEmail,
          name: customerName,
          marketingConsent: false,
        })
        .returning();
      customerRecord = newCust;
    }

    const [review] = await db
      .insert(reviews)
      .values({
        productId,
        customerId: customerRecord.id,
        orderId: orderId || null,
        rating,
        comment,
        customerName,
        customerEmail: cleanEmail,
        status: "pending", // default is pending approval
      })
      .returning();

    return {
      success: true,
      review,
      message:
        "Thank you! Your review has been submitted and is pending moderator approval. 🍰",
    };
  } catch (error: any) {
    console.error("Submit review error:", error);
    return {
      success: false,
      error: error.message || "Failed to submit review.",
    };
  }
}

export async function updateReviewStatusAction(
  reviewId: string,
  status: "pending" | "approved" | "rejected",
) {
  try {
    const [review] = await db
      .update(reviews)
      .set({ status, updatedAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();

    revalidatePath("/admin/reviews");
    return { success: true, review };
  } catch (error: any) {
    console.error("Update review status error:", error);
    return {
      success: false,
      error: error.message || "Failed to update review status.",
    };
  }
}
