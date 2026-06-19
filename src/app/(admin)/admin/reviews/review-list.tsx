"use client";

import {
  Check,
  Loader2,
  MessageSquare,
  Send,
  ShoppingBag,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  replyToReviewAction,
  updateReviewStatusAction,
} from "@/app/actions/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewItem {
  id: string;
  productId: string;
  customerId: string | null;
  orderId: string | null;
  rating: number;
  title: string | null;
  comment: string;
  customerName: string;
  customerEmail: string;
  status: "pending" | "approved" | "rejected";
  adminReply: string | null;
  adminRepliedAt: Date | null;
  createdAt: Date;
  product?: {
    name: string;
  };
  order?: {
    id: string;
  } | null;
}

interface ReviewListProps {
  initialReviews: ReviewItem[];
}

export function ReviewList({ initialReviews }: ReviewListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const handleStatusUpdate = (
    id: string,
    name: string,
    status: "approved" | "rejected",
  ) => {
    startTransition(async () => {
      const res = await updateReviewStatusAction(id, status);

      if (res.success) {
        toast.success(`Review from "${name}" has been ${status}!`);
        router.refresh();
      } else {
        toast.error(res.error || `Failed to ${status} review.`);
      }
    });
  };

  const handleReplySubmit = (reviewId: string, customerName: string) => {
    const message = (replyDrafts[reviewId] ?? "").trim();
    if (!message) {
      toast.error("Please write a reply before sending.");
      return;
    }

    startTransition(async () => {
      const res = await replyToReviewAction(reviewId, message);
      if (res.success) {
        toast.success(`Reply sent to "${customerName}".`);
        setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save reply.");
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border-border/40 shadow-sm bg-card/40">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <MessageSquare className="size-4.5 text-primary" />
          Submitted Reviews ({initialReviews.length})
        </CardTitle>
        <CardDescription>
          Verify reviews submitted by customers. Approved reviews appear on the
          main storefront.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initialReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MessageSquare className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              No customer reviews found in the directory.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {initialReviews.map((review) => {
              const formattedDate = new Date(
                review.createdAt,
              ).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-5 border border-border/45 rounded-xl bg-card/60 hover:bg-card transition-all"
                >
                  <div className="space-y-3 max-w-3xl">
                    {/* Top line metadata */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground/50">
                        •
                      </span>
                      <span className="font-semibold text-foreground">
                        {review.customerName}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        ({review.customerEmail})
                      </span>
                      <span className="text-xs text-muted-foreground/50">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Linked items */}
                    <div className="flex flex-wrap items-center gap-3">
                      {review.product && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-border/80 flex items-center gap-1"
                        >
                          <ShoppingBag className="size-3 text-primary" />
                          <span>Product: {review.product.name}</span>
                        </Badge>
                      )}
                      {review.orderId && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-border/80 flex items-center gap-1"
                          title={review.orderId}
                        >
                          <ShoppingCart className="size-3 text-accent" />
                          <span>
                            Linked Order: #{review.orderId.substring(0, 8)}
                          </span>
                        </Badge>
                      )}

                      {/* Status Badges */}
                      {review.status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-amber-500/10 uppercase tracking-wide text-[9px] font-bold rounded-full"
                        >
                          Pending Approval
                        </Badge>
                      )}
                      {review.status === "approved" && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-emerald-500/10 uppercase tracking-wide text-[9px] font-bold rounded-full"
                        >
                          Approved
                        </Badge>
                      )}
                      {review.status === "rejected" && (
                        <Badge
                          variant="secondary"
                          className="bg-destructive/10 text-destructive hover:bg-destructive/15 border-destructive/10 uppercase tracking-wide text-[9px] font-bold rounded-full"
                        >
                          Rejected
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 pl-0.5">
                      {review.title && (
                        <h4 className="text-sm font-bold text-foreground">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-sm text-muted-foreground/90 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                      {review.adminReply ? (
                        <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                            Admin Reply
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {review.adminReply}
                          </p>
                        </div>
                      ) : null}
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyDrafts[review.id] ?? ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          disabled={isPending}
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          placeholder={
                            review.adminReply
                              ? "Update admin reply..."
                              : "Write an admin reply..."
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() =>
                            handleReplySubmit(review.id, review.customerName)
                          }
                          className="cursor-pointer"
                        >
                          {isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Send className="size-3.5" />
                          )}
                          <span>
                            {review.adminReply ? "Update Reply" : "Send Reply"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 md:self-center md:items-end">
                    {review.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          handleStatusUpdate(
                            review.id,
                            review.customerName,
                            "approved",
                          )
                        }
                        className="cursor-pointer border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 flex items-center gap-1.5 h-9 rounded-lg"
                      >
                        {isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        <span>Approve</span>
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          handleStatusUpdate(
                            review.id,
                            review.customerName,
                            "rejected",
                          )
                        }
                        className="cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5 h-9 rounded-lg"
                      >
                        {isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <X className="size-3.5" />
                        )}
                        <span>Reject</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
