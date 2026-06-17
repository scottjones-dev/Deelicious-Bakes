import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { ReviewList } from "./review-list";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  // Fetch reviews with their product relations
  const allReviews = await db.query.reviews.findMany({
    with: {
      product: true,
      order: true,
    },
    orderBy: (reviews) => [reviews.createdAt],
  });

  return (
    <div className="space-y-6 p-8 flex-1">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <H1 className="font-heading text-3xl font-bold">Reviews Moderation</H1>
        <P className="text-muted-foreground text-sm mt-1">
          Monitor customer reviews and decide which ratings and feedback are
          displayed publicly on your bakery's product pages.
        </P>
      </div>

      {/* Review pipeline canvas */}
      <ReviewList initialReviews={allReviews} />
    </div>
  );
}
