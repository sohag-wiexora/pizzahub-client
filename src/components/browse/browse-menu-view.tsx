"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { LOCATIONS, PIZZA_CATEGORIES } from "@/config/constants";
import { getFavorites, getMenuItems, toggleFavorite } from "@/lib/api-client";
import { debounce } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/shared/menu-item-card";
import { MenuCardSkeleton } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { useAuth } from "@/components/providers/auth-provider";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Public browse experience: search + category + location + price sorting. */
export function BrowseMenuView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isCustomer } = useAuth();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all",
  );
  const [location, setLocation] = useState(
    searchParams.get("location") ?? "all",
  );
  const [sort, setSort] = useState<SortValue>(
    (searchParams.get("sort") as SortValue) ?? "newest",
  );

  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  /* keep the URL shareable — every filter lands in the query string */
  const syncUrl = useMemo(
    () =>
      debounce((state: Record<string, string>) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(state)) {
          if (value && value !== "all" && value !== "newest") {
            params.set(key, value);
          }
        }
        const qs = params.toString();
        router.replace(qs ? `/browse-menu?${qs}` : "/browse-menu", {
          scroll: false,
        });
      }, 400),
    [router],
  );

  useEffect(() => {
    syncUrl({ search, category, location, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, location, sort]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    getMenuItems({
      search,
      category: category === "all" ? undefined : category,
      location: location === "all" ? undefined : location,
      sort,
    })
      .then((data) => !cancelled && setItems(data))
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          toast.error("Could not load the menu", {
            description:
              err instanceof Error ? err.message : "Please try again.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, location, sort]);

  useEffect(() => {
    if (!isCustomer || !user) return;
    getFavorites(user.id).then(setFavorites).catch(() => setFavorites([]));
  }, [user, isCustomer]);

  const handleToggleFavorite = useCallback(
    async (itemId: string) => {
      if (!user) return;
      try {
        setFavorites(await toggleFavorite(user.id, itemId));
      } catch (err: unknown) {
        toast.error("Could not update favorites", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      }
    },
    [user],
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setLocation("all");
    setSort("newest");
  };

  const hasFilters =
    search || category !== "all" || location !== "all" || sort !== "newest";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      {/* heading */}
      <div className="flex flex-col items-start gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">
          The Menu
        </span>
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Browse Our <span className="text-gradient-gold">Menu</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Find your latest pizza. Search, filter and sort — then order in
          minutes.
        </p>
      </div>

      {/* filter bar */}
      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pizza…"
              className="h-11 rounded-full pl-10"
              aria-label="Search menu items by name"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className="h-11 rounded-full"
                aria-label="Filter by category"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PIZZA_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger
                className="h-11 rounded-full"
                aria-label="Filter by location"
              >
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
              <SelectTrigger
                className="h-11 rounded-full"
                aria-label="Sort items"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* results */}
      <div className="mt-8">
        {items === null ? (
          <MenuCardSkeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No pizzas match your search"
            description="Try a different name, category or location — or clear the filters to see the full menu."
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="rounded-full"
                >
                  Clear all filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground">{items.length}</strong>{" "}
              {items.length === 1 ? "item" : "items"}
              {hasFilters ? " · filtered results" : ""}
            </p>
            <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <StaggerItem key={item._id} className="h-full">
                  <MenuItemCard
                    item={item}
                    className="h-full"
                    isFavorite={favorites.includes(item._id)}
                    onToggleFavorite={
                      isCustomer && user ? handleToggleFavorite : undefined
                    }
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </>
        )}
      </div>
    </div>
  );
}
