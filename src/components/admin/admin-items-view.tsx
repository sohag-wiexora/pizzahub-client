"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ClipboardList, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import {
  adminDeleteMenuItem,
  getAdminMenuItems,
  moderateMenuItem,
} from "@/lib/api-client";
import { MENU_STATUS_META } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { InlineLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { debounce, formatDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "inactive", label: "Inactive" },
  { value: "rejected", label: "Rejected" },
] as const;

/** Admin — Manage Menu Items: review, approve/reject, moderate, delete. */
export function AdminItemsView() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    (q: string, s: string) => {
      setItems(null);
      getAdminMenuItems({
        search: q || undefined,
        status: s !== "all" ? s : undefined,
      })
        .then(setItems)
        .catch((err: unknown) => {
          setItems([]);
          toast.error("Could not load items", {
            description: err instanceof Error ? err.message : "Try again.",
          });
        });
    },
    [],
  );

  const debouncedLoad = useCallback(
    debounce((q: string, s: string) => load(q, s), 350),
    [load],
  );

  useEffect(() => {
    debouncedLoad(search, status);
  }, [search, status, debouncedLoad]);

  const moderate = async (item: MenuItem, next: "approved" | "rejected") => {
    setBusyId(item._id);
    try {
      const updated = await moderateMenuItem(item._id, next);
      setItems((prev) =>
        prev?.map((i) => (i._id === updated._id ? updated : i)) ?? null,
      );
      toast.success(
        next === "approved" ? "Item approved" : "Item rejected",
        {
          description:
            next === "approved"
              ? `${updated.itemName} is now live on the public menu.`
              : `${updated.itemName} will not be visible to customers.`,
        },
      );
    } catch (err: unknown) {
      toast.error("Moderation failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = async (item: MenuItem) => {
    setBusyId(item._id);
    try {
      const next = item.status === "approved" ? "rejected" : "approved";
      // admins republish/inactive via the same moderation endpoint
      const updated = await moderateMenuItem(item._id, next);
      setItems((prev) =>
        prev?.map((i) => (i._id === updated._id ? updated : i)) ?? null,
      );
      toast.success(
        next === "approved" ? "Item republished" : "Item unpublished",
        { description: updated.itemName },
      );
    } catch (err: unknown) {
      toast.error("Could not change status", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete._id);
    try {
      await adminDeleteMenuItem(confirmDelete._id);
      setItems((prev) => prev?.filter((i) => i._id !== confirmDelete._id) ?? null);
      toast.success("Item deleted", { description: confirmDelete.itemName });
      setConfirmDelete(null);
    } catch (err: unknown) {
      toast.error("Could not delete item", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Manage Menu Items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submissions, approve or reject, republish when needed and
          delete inappropriate items. Only approved items appear publicly.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name or vendor…"
            className="h-10 rounded-full pl-10"
            aria-label="Search menu items"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 rounded-full sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items === null ? (
        <InlineLoader className="py-16" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No items found"
          description="Adjust the filters to see more submissions."
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const meta = MENU_STATUS_META[item.status];
            return (
              <article
                key={item._id}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-32">
                  <Image
                    src={item.images[0]}
                    alt={item.itemName}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-semibold">
                      {item.itemName}
                    </h3>
                    <Badge className={`border ${meta.className}`}>
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.vendor.businessName} · {item.category} ·{" "}
                    ${item.price.toFixed(2)} · {item.location} ·{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        disabled={busyId === item._id}
                        onClick={() => moderate(item, "approved")}
                        className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item._id}
                        onClick={() => moderate(item, "rejected")}
                        className="rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        <XCircle className="size-3.5" /> Reject
                      </Button>
                    </>
                  ) : null}
                  {item.status === "approved" || item.status === "inactive" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === item._id}
                      onClick={() => togglePublished(item)}
                      className="rounded-full border-gold/40 hover:border-gold hover:bg-gold/10"
                    >
                      {item.status === "approved" ? "Unpublish" : "Republish"}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(item)}
                    className="rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete “{confirmDelete?.itemName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes an inappropriate item from the platform entirely.
              The vendor will no longer see it in their menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busyId !== null}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {busyId ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
