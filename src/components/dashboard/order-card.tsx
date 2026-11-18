"use client";

import Image from "next/image";
import { CalendarDays, MapPin, MessageSquareText, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/types";
import { cancelOrder, respondToOrder } from "@/lib/api-client";
import { ORDER_STATUS_META } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Full order card shared by vendor (accept/reject) and customer
 * (view/cancel) perspectives. Actions are gated by status exactly once.
 */
export function OrderCard({
  order,
  onChanged,
}: {
  order: Order;
  onChanged?: () => void;
}) {
  const { user, isVendor, isCustomer } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "accept" | "reject" | "cancel" | null
  >(null);

  const meta = ORDER_STATUS_META[order.status];
  const canDecide = isVendor && order.status === "pending";
  const canCancel = isCustomer && order.status === "pending";

  const run = async () => {
    if (!user || !confirmAction) return;
    setBusy(true);
    try {
      if (confirmAction === "cancel") {
        await cancelOrder(order._id, user.id);
        toast.success("Order cancelled", {
          description: `${order.item.itemName} order was cancelled.`,
        });
      } else {
        await respondToOrder(order._id, user.id, confirmAction);
        toast.success(
          confirmAction === "accept" ? "Order accepted" : "Order rejected",
          {
            description:
              confirmAction === "accept"
                ? "The customer has been notified. Get the oven ready!"
                : `The ${order.item.itemName} order was rejected.`,
          },
        );
      }
      setConfirmAction(null);
      onChanged?.();
    } catch (err: unknown) {
      toast.error("Action failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy = {
    accept: {
      title: "Accept this order?",
      body: "Once accepted you are committed to deliver on the requested date.",
    },
    reject: {
      title: "Reject this order?",
      body: "The customer will see the order as rejected. This can only be done once.",
    },
    cancel: {
      title: "Cancel this order?",
      body: "Pending orders can be cancelled. Accepted or rejected orders cannot.",
    },
  } as const;

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="grid gap-0 md:grid-cols-[200px_1fr_240px]">
        {/* item */}
        <div className="relative aspect-[16/10] md:aspect-auto md:h-full">
          <Image
            src={order.item.images[0]}
            alt={order.item.itemName}
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>

        {/* details */}
        <div className="flex flex-col gap-2 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`border ${meta.className}`}>{meta.label}</Badge>
            <span className="text-xs text-muted-foreground">
              Requested {formatDate(order.createdAt)} · Order #{order._id.slice(-6).toUpperCase()}
            </span>
          </div>
          <h3 className="font-heading text-lg font-semibold">
            {order.item.itemName}
          </h3>
          <p className="text-xs text-muted-foreground">
            ${order.item.price.toFixed(2)} · {order.item.category}
          </p>

          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="size-3 text-gold" /> Delivery Date
              </dt>
              <dd className="mt-0.5">{formatDate(order.deliveryDate)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3 text-gold" /> Delivery Address
              </dt>
              <dd className="mt-0.5">{order.deliveryAddress}</dd>
            </div>
            {order.message ? (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <MessageSquareText className="size-3 text-gold" /> Customer Message
                </dt>
                <dd className="mt-0.5 italic text-foreground/85">“{order.message}”</dd>
              </div>
            ) : null}
          </dl>

          {/* parties */}
          <div className="mt-1 text-xs text-muted-foreground">
            {isVendor ? (
              <p>
                Customer:{" "}
                <strong className="text-foreground">{order.customerName}</strong>{" "}
                · {order.customerEmail}
              </p>
            ) : (
              <p>
                Vendor:{" "}
                <strong className="text-foreground">
                  {order.vendor.businessName}
                </strong>{" "}
                · {order.vendor.location}
              </p>
            )}
          </div>

          {(canDecide || canCancel) && (
            <div className="mt-auto flex gap-2 pt-3">
              {canDecide ? (
                <>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmAction("accept")}
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setConfirmAction("reject")}
                    className="rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                </>
              ) : null}
              {canCancel ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setConfirmAction("cancel")}
                  className="ml-auto rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  <XCircle className="size-3.5" /> Cancel Order
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* timeline */}
        <div className="border-t border-border/60 bg-background/50 p-5 md:border-l md:border-t-0">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Status Timeline
          </p>
          <OrderTimeline order={order} />
        </div>
      </div>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              {confirmAction ? confirmCopy[confirmAction].title : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction ? confirmCopy[confirmAction].body : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={run}
              disabled={busy}
              className={
                confirmAction === "accept"
                  ? "rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                  : "rounded-full bg-destructive text-white hover:bg-destructive/90"
              }
            >
              {busy ? "Working…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
