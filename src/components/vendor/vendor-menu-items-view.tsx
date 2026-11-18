"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  Crown,
  Pencil,
  PlusCircle,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import {
  deleteMenuItem,
  getVendorMenuItems,
  setMenuItemAvailability,
} from "@/lib/api-client";
import { MENU_STATUS_META, FREE_PLAN_ACTIVE_ITEM_LIMIT } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MenuCardSkeleton } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { useAuth } from "@/components/providers/auth-provider";

/** Vendor "My Menu Items" — update, delete and availability management. */
export function VendorMenuItemsView() {
  const { user, isVendor } = useAuth();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = (vendorId: string) => {
    setItems(null);
    getVendorMenuItems(vendorId)
      .then(setItems)
      .catch((err: unknown) =>
        toast.error("Could not load your items", {
          description: err instanceof Error ? err.message : "Try again.",
        }),
      );
  };

  useEffect(() => {
    if (user && isVendor) load(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const activeCount = items?.filter((i) => i.status === "approved").length ?? 0;
  const plan = user.subscriptionPlan;
  const atLimit = plan === "free" && activeCount >= FREE_PLAN_ACTIVE_ITEM_LIMIT;

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMenuItem(pendingDelete._id, user.id);
      setItems((prev) => prev?.filter((i) => i._id !== pendingDelete._id) ?? null);
      toast.success("Item deleted", {
        description: `${pendingDelete.itemName} has been removed from your menu.`,
      });
    } catch (err: unknown) {
      toast.error("Could not delete item", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleAvailability = async (item: MenuItem, active: boolean) => {
    setBusyId(item._id);
    try {
      await setMenuItemAvailability(item._id, user.id, active);
      setItems(
        (prev) =>
          prev?.map((i) =>
            i._id === item._id
              ? { ...i, status: active ? "approved" : "inactive" }
              : i,
          ) ?? null,
      );
      toast.success(
        active
          ? `${item.itemName} is now visible to customers`
          : `${item.itemName} is now hidden (inactive)`,
      );
    } catch (err: unknown) {
      toast.error("Could not update availability", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Menu Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update, delete and manage availability. Rejected items are never
            shown to customers.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-gold text-forest-deep hover:bg-gold-light"
        >
          <Link href="/dashboard/menu-items/new">
            <PlusCircle className="size-4" /> Add Menu Item
          </Link>
        </Button>
      </div>

      {/* plan usage */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
          atLimit
            ? "border-red-300/60 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
            : "border-gold/35 bg-gold/[0.06]"
        }`}
      >
        <p className="text-sm">
          <strong>{activeCount}</strong> /{" "}
          {plan === "premium" ? "∞" : FREE_PLAN_ACTIVE_ITEM_LIMIT} active items
          on the{" "}
          <strong className="uppercase">{plan}</strong> plan
        </p>
        {plan === "free" ? (
          <Button asChild size="sm" className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
            <Link href="/dashboard/subscription">
              <Crown className="size-4" /> Upgrade to Premium for unlimited items
            </Link>
          </Button>
        ) : null}
      </div>

      {items === null ? (
        <MenuCardSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Your menu is empty"
          description="Add your first pizza so customers can find you on PizzaHub."
          action={
            <Button asChild className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
              <Link href="/dashboard/menu-items/new">
                <PlusCircle className="size-4" /> Add Menu Item
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const meta = MENU_STATUS_META[item.status];
            const toggleable = item.status === "approved" || item.status === "inactive";
            return (
              <article
                key={item._id}
                className="lift flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={item.images[0]}
                    alt={item.itemName}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover"
                  />
                  <Badge className={`absolute left-3 top-3 border ${meta.className}`}>
                    {meta.label}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-semibold leading-snug">
                      {item.itemName}
                    </h3>
                    <span className="font-heading text-lg font-bold text-gold">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.location}
                  </p>
                  <RatingStars rating={item.rating} size={12} showValue />

                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Available
                      </span>
                      <Switch
                        checked={item.status === "approved"}
                        disabled={!toggleable || busyId === item._id}
                        onCheckedChange={(v) => handleAvailability(item, v)}
                        aria-label={`Toggle availability for ${item.itemName}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full border-gold/40 hover:border-gold hover:bg-gold/10"
                      >
                        <Link href={`/dashboard/menu-items/${item._id}/edit`}>
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingDelete(item)}
                        className="flex-1 rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </div>
                    {item.status === "pending" ? (
                      <p className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                        <CircleAlert className="size-3 text-gold" />
                        Waiting for admin approval.
                      </p>
                    ) : null}
                    {item.status === "rejected" ? (
                      <p className="flex items-center gap-1 text-[0.7rem] text-red-500">
                        <CircleAlert className="size-3" />
                        Rejected by admin — not visible to customers.
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete “{pendingDelete?.itemName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the item from your menu. Customers will
              no longer be able to see or order it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Yes, delete item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
