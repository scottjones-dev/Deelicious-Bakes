"use server";

import { db } from "@/db";
import { customers, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
