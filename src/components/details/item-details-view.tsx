"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Heart,
  Info,
  MapPin,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { getFavorites, getMenuItemById, toggleFavorite } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/shared/rating-stars";
import { PageLoader } from "@/components/shared/loader";
import { OrderDialog } from "@/components/details/order-dialog";
import { ReviewsSection } from "@/components/details/reviews-section";
import { RequireAuth } from "@/components/shared/require-auth";
import { useAuth } from "@/components/providers/auth-provider";

function DetailsBody({ id }: { id: string }) {
  const { user, isCustomer, isVendor, isAdmin } = useAuth();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMenuItemById(id)
      .then((data) => {
        if (cancelled) return;
        setItem(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setNotFound(
            err instanceof Error
              ? err.message
              : "This menu item could not be found.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isCustomer || !user) return;
    getFavorites(user.id)
      .then((ids) => setFavorite(ids.includes(id)))
      .catch(() => undefined);
  }, [user, isCustomer, id]);

  const handleFavorite = useCallback(async () => {
    if (!user) return;
    try {
      const ids = await toggleFavorite(user.id, id);
      setFavorite(ids.includes(id));
      toast.success(
        ids.includes(id) ? "Added to favorites" : "Removed from favorites",
      );
    } catch (err: unknown) {
      toast.error("Could not update favorites", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    }
  }, [user, id]);

  if (notFound) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-gold/12 text-gold">
          <Ban className="size-8" />
        </span>
        <h1 className="font-heading text-3xl font-bold">Item Not Available</h1>
        <p className="max-w-md text-muted-foreground">{notFound}</p>
        <Button asChild className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
          <Link href="/browse-menu">
            <ArrowLeft className="size-4" /> Back to Browse Menu
          </Link>
        </Button>
      </div>
    );
  }

  if (!item) {
    return <PageLoader label="Plating up the details…" />;
  }

  const isOwnItem = isVendor && user?.id === item.vendorId;
  const canOrder = isCustomer && !isOwnItem;

  const orderNote = isOwnItem
    ? "This is your own item — vendors cannot place orders on their own menu."
    : isVendor
      ? "Vendor accounts cannot place customer orders."
      : isAdmin
        ? "Admins cannot place customer orders."
        : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <Link
        href="/browse-menu"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="size-4" /> Back to Browse Menu
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-border bg-forest-soft">
            <Image
              src={item.images[galleryIndex] ?? item.images[0]}
              alt={item.itemName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {item.vendor.isPremium ? (
              <Badge className="absolute right-4 top-4 gap-1 border-transparent bg-gradient-to-r from-gold to-gold-light font-semibold text-forest-deep">
                <Star className="size-3 fill-forest-deep" /> Premium Vendor
              </Badge>
            ) : null}
          </div>
          {item.images.length > 1 ? (
            <div className="flex gap-3">
              {item.images.map((image, i) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setGalleryIndex(i)}
                  className={`relative aspect-[4/3] w-24 overflow-hidden rounded-xl border-2 transition-colors ${
                    i === galleryIndex ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${item.itemName} photo ${i + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-transparent bg-forest text-gold-light">
                {item.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Added{" "}
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl">
              {item.itemName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <RatingStars rating={item.rating} showValue />
                <span className="text-sm text-muted-foreground">
                  ({item.reviewCount} reviews)
                </span>
              </span>
              <span className="font-heading text-3xl font-bold text-gold">
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          {/* vendor card */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-gold to-[#a8801f] font-heading text-base font-bold text-forest-deep">
                {item.vendor.businessName.slice(0, 2).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="font-semibold">{item.vendor.businessName}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 text-gold" />
                  {item.vendor.location}
                </p>
              </div>
            </div>
            <RatingStars rating={item.vendor.rating} showValue size={13} />
          </div>

          {/* actions */}
          {canOrder ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setOrderOpen(true)}
                className="h-12 flex-1 rounded-full bg-gold px-8 text-base text-forest-deep hover:bg-gold-light sm:flex-none"
              >
                <ShoppingBag className="size-5" /> Order This Item
              </Button>
              <Button
                variant="outline"
                onClick={handleFavorite}
                aria-pressed={favorite}
                className={`h-12 rounded-full px-5 ${
                  favorite
                    ? "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "border-gold/50 hover:border-gold hover:bg-gold/10"
                }`}
              >
                <Heart className={`size-5 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "In Favorites" : "Add to Favorites"}
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-gold/35 bg-gold/[0.07] p-4 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-gold" />
              <p>{orderNote ?? "Sign in as a customer to place orders."}</p>
            </div>
          )}

          <Separator />

          {/* delivery summary */}
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prepared by
              </dt>
              <dd className="mt-0.5 font-medium">{item.vendor.businessName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pickup area
              </dt>
              <dd className="mt-0.5 font-medium">{item.location}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-12">
        <ReviewsSection itemId={item._id} />
      </div>

      {canOrder ? (
        <OrderDialog item={item} open={orderOpen} onOpenChange={setOrderOpen} />
      ) : null}
    </div>
  );
}

/** Private page: item details require a signed-in account. */
export function ItemDetailsView({ id }: { id: string }) {
  return (
    <RequireAuth>
      <DetailsBody id={id} />
    </RequireAuth>
  );
}
