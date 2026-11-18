"use client";

import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Order status timeline (optional feature) — visualises the order's real
 * status events with timestamps: Placed → Accepted → Out for Delivery.
 * Rejected / Cancelled render as terminal red/grey nodes.
 */
export function OrderTimeline({ order }: { order: Order }) {
  const accepted = order.statusHistory.find((e) => e.status === "accepted");

  // If the vendor accepted, the kitchen → delivery leg is implied progress.
  const showDeliveryLeg = Boolean(accepted);

  const steps: {
    key: string;
    label: string;
    at?: string;
    icon: typeof Clock;
    tone: "gold" | "green" | "red" | "neutral";
  }[] = [
    {
      key: "placed",
      label: "Order Placed",
      at: order.statusHistory[0]?.at ?? order.createdAt,
      icon: Clock,
      tone: "gold",
    },
  ];

  if (order.status === "rejected") {
    steps.push({
      key: "rejected",
      label: "Rejected by Restaurant",
      at: order.statusHistory.find((e) => e.status === "rejected")?.at,
      icon: XCircle,
      tone: "red",
    });
  } else if (order.status === "cancelled") {
    steps.push({
      key: "cancelled",
      label: "Cancelled",
      at: order.statusHistory.find((e) => e.status === "cancelled")?.at,
      icon: XCircle,
      tone: "neutral",
    });
  } else {
    steps.push({
      key: "accepted",
      label: "Restaurant Confirmed",
      at: accepted?.at,
      icon: CheckCircle2,
      tone: accepted ? "green" : "neutral",
    });
    if (showDeliveryLeg) {
      steps.push(
        {
          key: "out",
          label: "Out for Delivery",
          icon: Truck,
          tone: "neutral",
        },
        {
          key: "delivered",
          label: "Delivered",
          icon: PackageCheck,
          tone: "neutral",
        },
      );
    }
  }

  return (
    <ol className="flex flex-col gap-0.5">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step.tone === "gold" || step.tone === "green";
        const failed = step.tone === "red";
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[0.68rem] top-6 h-[calc(100%-1.5rem)] w-px",
                  done ? "bg-gold/60" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                done
                  ? "border-gold bg-gold text-forest-deep"
                  : failed
                    ? "border-red-400 bg-red-500 text-white"
                    : "border-border bg-muted text-muted-foreground",
              )}
            >
              <step.icon className="size-3.5" />
            </span>
            <div className="leading-tight">
              <p
                className={cn(
                  "text-sm font-semibold",
                  !done && !failed && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.at ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(step.at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  Pending
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
