"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { getFavorites, getMenuItems, toggleFavorite } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/shared/menu-item-card";
import { MenuCardSkeleton } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/components/providers/auth-provider";

/** Customer favorites / wishlist (optional feature). */
export function FavoritesView() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getFavorites(user.id), getMenuItems({ sort: "rating" })])
      .then(([ids, all]) => {
        setFavorites(ids);
        setItems(all.filter((i) => ids.includes(i._id)));
      })
      .catch((err: unknown) => {
        setItems([]);
        toast.error("Could not load favorites", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      });
  }, [user]);

  const handleToggleFavorite = useCallback(
    async (itemId: string) => {
      if (!user) return;
      try {
        const next = await toggleFavorite(user.id, itemId);
        setFavorites(next);
        setItems((prev) => prev?.filter((i) => next.includes(i._id)) ?? null);
        toast.success("Removed from favorites");
      } catch (err: unknown) {
        toast.error("Could not update favorites", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      }
    },
    [user],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">
          My <span className="text-gradient-gold">Favorites</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal wishlist — tap the heart to save a pizza for later.
        </p>
      </div>

      {items === null ? (
        <MenuCardSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={HeartOff}
          title="No favorites yet"
          description="Browse the menu and tap the heart icon on any pizza you love."
          action={
            <Button asChild className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
              <Link href="/browse-menu">
                <Heart className="size-4" /> Browse Menu
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              className="h-full"
              isFavorite
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
