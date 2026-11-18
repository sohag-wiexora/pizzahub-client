"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/types";
import { addReview, getItemReviews } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { InlineLoader } from "@/components/shared/loader";
import { useAuth } from "@/components/providers/auth-provider";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Reviews & ratings (optional feature) — list + customer review form. */
export function ReviewsSection({ itemId }: { itemId: string }) {
  const { user, isCustomer } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItemReviews(itemId)
      .then((data) => !cancelled && setReviews(data))
      .catch(() => !cancelled && setReviews([]));
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating < 1) {
      toast.error("Pick a star rating first");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Write a short review (min 5 characters)");
      return;
    }
    setSubmitting(true);
    try {
      const review = await addReview(
        itemId,
        { id: user.id, name: user.name, image: user.image },
        { rating, comment: comment.trim() },
      );
      setReviews((prev) => [review, ...(prev ?? [])]);
      setRating(0);
      setComment("");
      toast.success("Review published", {
        description: "Thanks for sharing your experience!",
      });
    } catch (err: unknown) {
      toast.error("Could not publish review", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold">
          Customer <span className="text-gradient-gold">Reviews</span>
        </h2>
        {reviews ? (
          <span className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        ) : null}
      </div>

      {reviews === null ? (
        <InlineLoader />
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {reviews.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gold/35 px-5 py-8 text-center text-sm text-muted-foreground">
              No reviews yet — be the first to share your thoughts.
            </p>
          ) : (
            reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-gold/30">
                      {review.customerImage ? (
                        <AvatarImage
                          src={review.customerImage}
                          alt={review.customerName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-forest-soft text-xs font-bold text-gold-light">
                        {review.customerName
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">
                        {review.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} size={13} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                  {review.comment}
                </p>
              </article>
            ))
          )}

          {isCustomer && user ? (
            <form
              onSubmit={submit}
              className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4"
            >
              <p className="mb-2 text-sm font-semibold">Leave a review</p>
              <div className="mb-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`size-6 transition-colors ${
                        star <= rating
                          ? "fill-gold text-gold"
                          : "fill-transparent text-gold/40 hover:text-gold"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste, portion and delivery?"
                className="min-h-16 rounded-xl border-border bg-card"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="mt-3 h-10 rounded-full bg-gold text-forest-deep hover:bg-gold-light"
              >
                {submitting ? "Publishing…" : "Publish Review"}
              </Button>
            </form>
          ) : null}
        </div>
      )}
    </section>
  );
}
