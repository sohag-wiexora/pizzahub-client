"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex" aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              "shrink-0",
              i <= Math.round(rating)
                ? "fill-gold text-gold"
                : "fill-transparent text-gold/30",
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-xs font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
