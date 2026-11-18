import type { Metadata } from "next";
import Link from "next/link";
import { CircleX, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment Cancelled",
};

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
        <CircleX className="size-10" />
      </span>
      <div>
        <h1 className="font-heading text-4xl font-bold">
          Payment <span className="text-gradient-gold">Cancelled</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          No worries — your account hasn't been charged. You can upgrade to
          Premium any time from your dashboard.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
          <Link href="/dashboard/subscription">
            <CreditCard className="size-4" /> Try Again
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <Home className="size-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
