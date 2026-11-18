"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { getFavorites, getFeaturedMenuItems, toggleFavorite } from "@/lib/api-client";
import { SectionHeading } from "@/components/shared/section-heading";
import { MenuItemCard } from "@/components/shared/menu-item-card";
import { MenuCardSkeleton } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { StaggerGrid, StaggerItem, Reveal } from "@/components/shared/reveal";
import { useAuth } from "@/components/providers/auth-provider";

/** Featured Menu Items — 6 approved & active items from the database. */
export function FeaturedItems() {
  const { user, isCustomer } = useAuth();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getFeaturedMenuItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          toast.error("Could not load featured items", {
            description:
              err instanceof Error ? err.message : "Please try again in a moment.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCustomer || !user) return;
    getFavorites(user.id).then(setFavorites).catch(() => setFavorites([]));
  }, [user, isCustomer]);

  const handleToggleFavorite = useCallback(
    async (itemId: string) => {
      if (!user) return;
      try {
        const next = await toggleFavorite(user.id, itemId);
        setFavorites(next);
        toast.success(
          next.includes(itemId) ? "Added to favorites" : "Removed from favorites",
        );
      } catch (err: unknown) {
        toast.error("Could not update favorites", {
          description:
            err instanceof Error ? err.message : "Please try again.",
        });
      }
    },
    [user],
  );

  return (
    <section id="featured" className="bg-ivory py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            kicker="Handpicked"
            title="Featured Menu Items"
            description="Chef-approved bakes from our premium partner kitchens — fresh from the oven, ready for your table."
            className="md:max-w-xl"
          />
          <Reveal delay={0.1}>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-gold/50 font-semibold hover:border-gold hover:bg-gold hover:text-forest-deep"
            >
              <Link href="/browse-menu">
                View All <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        {items === null ? (
          <div className="mt-12">
            <MenuCardSkeleton count={6} />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gold/40 bg-card px-6 py-16 text-center">
            <ChefHat className="size-10 text-gold" />
            <p className="font-heading text-xl font-semibold">The oven is warming up</p>
            <p className="text-sm text-muted-foreground">
              No featured items yet — check back shortly.
            </p>
          </div>
        ) : (
          <StaggerGrid className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <StaggerItem key={item._id} className="h-full">
                <MenuItemCard
                  item={item}
                  isFavorite={favorites.includes(item._id)}
                  onToggleFavorite={
                    isCustomer && user ? handleToggleFavorite : undefined
                  }
                  className="h-full"
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}
