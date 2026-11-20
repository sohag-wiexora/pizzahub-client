import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, MapPin, Star } from "lucide-react";
import type { MenuItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/rating-stars";
import { cn } from "@/lib/utils";

/**
 * Equal-height premium menu card used on Home, Browse Menu, Favorites
 * and vendor lists. Images are uniform (4:3) for a tidy grid.
 */
export function MenuItemCard({
  item,
  isFavorite,
  onToggleFavorite,
  className,
}: {
  item: MenuItem;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "lift group flex h-full flex-col overflow-hidden rounded-[16px] border border-border bg-card",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-soft">
        <Image
          src={item.images[0]}
          alt={item.itemName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/55 via-transparent to-transparent" />
        <Badge className="absolute left-3 top-3 border-transparent bg-forest-deep/70 text-gold-light backdrop-blur">
          {item.category}
        </Badge>
        {item.vendor.isPremium ? (
          <Badge className="absolute right-3 top-3 gap-1 border-transparent bg-gradient-to-r from-gold to-gold-light font-semibold text-forest-deep">
            <Star className="size-3 fill-forest-deep" /> Premium
          </Badge>
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(item._id);
            }}
            className={cn(
              "absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full backdrop-blur transition-colors",
              isFavorite
                ? "bg-terracotta text-white"
                : "bg-forest-deep/60 text-ivory hover:bg-forest-deep/80",
            )}
          >
            <Heart className={cn("size-4", isFavorite && "fill-current")} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-snug">
            {item.itemName}
          </h3>
          <span className="whitespace-nowrap font-heading text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <RatingStars rating={item.rating} showValue />
          <span>({item.reviewCount} reviews)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-gold" />
          <span className="truncate">
            {item.vendor.businessName} · {item.location}
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="mt-auto w-full rounded-full border-gold/50 text-foreground transition-colors hover:border-gold hover:bg-gold hover:text-forest-deep"
        >
          <Link href={`/menu/${item._id}`}>
            View Details
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
