"use client";

import { useState } from "react";
import { CalendarDays, Loader2, MapPin, MessageSquareText, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem, Order } from "@/types";
import { createOrder } from "@/lib/api-client";
import { orderSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Order form — Delivery Date, Delivery Address, Additional Message.
 * Customer + vendor + item are resolved server-side; the client never
 * sends identity fields, so sessions can't be spoofed.
 */
export function OrderDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});

    const parsed = orderSchema.safeParse({
      deliveryDate,
      deliveryAddress,
      message: message || undefined,
      quantity,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const order: Order = await createOrder(user, {
        itemId: item._id,
        deliveryDate: parsed.data.deliveryDate,
        deliveryAddress: parsed.data.deliveryAddress,
        message: parsed.data.message,
        quantity: parsed.data.quantity,
      });
      toast.success("Order placed successfully!", {
        description: `${parsed.data.quantity} × ${order.item.itemName} for ${order.deliveryDate} — pending vendor confirmation.`,
      });
      onOpenChange(false);
      setDeliveryDate("");
      setDeliveryAddress("");
      setMessage("");
      setQuantity(1);
    } catch (err: unknown) {
      toast.error("Could not place the order", {
        description:
          err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Order <span className="text-gradient-gold">{item.itemName}</span>
          </DialogTitle>
          <DialogDescription>
            from {item.vendor.businessName} · ${item.price.toFixed(2)} ·
            Delivery from {item.location}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-semibold">Quantity</p>
              <p className="text-xs text-muted-foreground">
                ${item.price.toFixed(2)} per pizza
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span
                aria-live="polite"
                className="w-8 text-center font-heading text-lg font-bold"
              >
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                disabled={quantity >= 20}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delivery-date" className="gap-1">
              <CalendarDays className="size-3.5 text-gold" /> Delivery Date
            </Label>
            <Input
              id="delivery-date"
              type="date"
              min={today}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="rounded-xl"
            />
            {errors.deliveryDate ? (
              <p className="text-xs font-medium text-destructive">
                {errors.deliveryDate}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delivery-address" className="gap-1">
              <MapPin className="size-3.5 text-gold" /> Delivery Address
            </Label>
            <Textarea
              id="delivery-address"
              placeholder="House / Road / Area / City — with any landmark"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="min-h-20 rounded-xl"
            />
            {errors.deliveryAddress ? (
              <p className="text-xs font-medium text-destructive">
                {errors.deliveryAddress}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-message" className="gap-1">
              <MessageSquareText className="size-3.5 text-gold" /> Additional
              Message <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="order-message"
              placeholder="Special instructions for the kitchen…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-16 rounded-xl"
            />
            {errors.message ? (
              <p className="text-xs font-medium text-destructive">
                {errors.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing order…
              </>
            ) : (
              <>Confirm Order · ${(item.price * quantity).toFixed(2)}</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
