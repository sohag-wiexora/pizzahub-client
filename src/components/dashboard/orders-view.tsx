"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Order, UserRole } from "@/types";
import { getOrdersForUser } from "@/lib/api-client";
import { OrderCard } from "@/components/dashboard/order-card";
import { InlineLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

/** Orders page — vendor sees incoming orders, customer sees their orders. */
export function OrdersView({ perspective }: { perspective: UserRole }) {
  const { user, isVendor, isCustomer } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState<string>("all");

  const allowed =
    (perspective === "vendor" && isVendor) ||
    (perspective === "customer" && isCustomer);

  const load = useCallback(() => {
    if (!user) return;
    setOrders(null);
    getOrdersForUser({ id: user.id, role: user.role })
      .then(setOrders)
      .catch((err: unknown) => {
        setOrders([]);
        toast.error("Could not load orders", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      });
  }, [user]);

  useEffect(() => {
    if (allowed && user) load();
  }, [allowed, user, load]);

  if (!allowed || !user) return null;

  const filtered = (orders ?? []).filter(
    (o) => status === "all" || o.status === status,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            {perspective === "vendor" ? "Customer Orders" : "My Orders"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {perspective === "vendor"
              ? "Accept or reject pending orders — each order can be decided only once."
              : "Track every pizza you've ordered. Pending orders can be cancelled."}
          </p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 rounded-full" aria-label="Filter orders by status">
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

      {orders === null ? (
        <InlineLoader className="py-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={status === "all" ? "No orders yet" : `No ${status} orders`}
          description={
            perspective === "vendor"
              ? "New orders from customers will appear here instantly."
              : "Order a delicious pizza from the Browse Menu to get started."
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((order) => (
            <OrderCard key={order._id} order={order} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
