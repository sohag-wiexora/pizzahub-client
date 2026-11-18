"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Crown, Home, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

function SuccessBody() {
  const searchParams = useSearchParams();
  const { user, activatePremium, isMock } = useAuth();
  const [activated, setActivated] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;
    // Security: this page only *displays* confirmation. In production the
    // subscription is activated by a verified Stripe webhook on the server —
    // never by trusting this redirect. Mock mode mirrors the final state.
    if (isMock && user?.role === "vendor" && user.subscriptionPlan !== "premium") {
      const result = activatePremium();
      setActivated(result.ok);
      if (result.ok) {
        toast.success("Premium activated", {
          description: "Unlimited menu items unlocked — enjoy!",
        });
      }
    } else {
      setActivated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <span className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
        <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="size-10" />
        </span>
      </span>

      <div>
        <h1 className="font-heading text-4xl font-bold">
          Payment <span className="text-gradient-gold">Successful!</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you{user ? `, ${user.name}` : ""}! Your transaction
          {sessionId ? (
            <>
              {" "}
              (<span className="font-mono text-xs">{sessionId.slice(0, 20)}…</span>)
            </>
          ) : null}{" "}
          was processed securely by Stripe.
        </p>
      </div>

      {user?.role === "vendor" ? (
        <div className="w-full rounded-2xl border border-gold/40 bg-gradient-to-br from-forest-deep to-forest-soft p-6 text-ivory">
          <p className="flex items-center justify-center gap-2 font-heading text-xl font-bold">
            <Crown className="size-5 text-gold" />
            {activated ? "Premium Plan Activated" : "Premium Plan Confirming"}
          </p>
          <p className="mt-2 text-sm text-ivory/70">
            {activated
              ? "Unlimited active items, the Premium badge and homepage placement are unlocked."
              : "Your subscription will unlock automatically once Stripe's webhook verifies the payment (usually seconds)."}
          </p>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-gold/40 bg-gold/[0.07] p-6">
          <p className="flex items-center justify-center gap-2 font-heading text-xl font-bold">
            <PartyPopper className="size-5 text-gold" /> Order payment received
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-gold text-forest-deep hover:bg-gold-light">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        {user?.role === "vendor" ? (
          <Button
            asChild
            variant="outline"
            className="rounded-full border-gold/50 hover:border-gold hover:bg-gold/10"
          >
            <Link href="/dashboard/subscription">View Subscription</Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="rounded-full border-gold/50 hover:border-gold hover:bg-gold/10"
          >
            <Link href="/dashboard/orders">View My Orders</Link>
          </Button>
        )}
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

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessBody />
    </Suspense>
  );
}
