import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingProps = {
  rating: number;
  className?: string;
};

export function Rating({ rating, className }: RatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`Rated ${clampedRating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < clampedRating;

        return (
          <Star
            key={index}
            className={cn(
              "size-4",
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
