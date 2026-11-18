"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createCheckoutSession } from "@/lib/api-client";
import { PREMIUM_PRICE_USD, FREE_PLAN_ACTIVE_ITEM_LIMIT } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { cn, formatDate } from "@/lib/utils";

const freeFeatures = [
  `Up to ${FREE_PLAN_ACTIVE_ITEM_LIMIT} active menu items`,
  "Basic vendor dashboard",
  "Order accept / reject management",
  "Standard listing placement",
];

const premiumFeatures = [
  "Unlimited active menu items",
  "Premium vendor badge",
  "Featured placement on the homepage",
  "Priority order handling",
  "All Free plan features included",
];

/** Vendor subscription page — Free vs Premium with Stripe Checkout wiring. */
export function SubscriptionView() {
  const { user } = useAuth();
  const [starting, setStarting] = useState(false);
  const isPremium = user?.subscriptionPlan === "premium";

  useEffect(() => {
    document.title = "Subscription · PizzaHub";
  }, []);

  const startUpgrade = async () => {
    if (!user) return;
    setStarting(true);
    try {
      // Server creates the Stripe Checkout Session; the vendor is only ever
      // billed for their own account (session is bound to the JWT identity).
      const session = await createCheckoutSession(user.id);
      if (session.url.startsWith("http")) {
        window.location.href = session.url; // real Stripe Checkout
      } else {
        // Mock mode — jump to our in-app success page.
        window.location.href = session.url;
      }
    } catch (err: unknown) {
      toast.error("Could not start checkout", {
        description: err instanceof Error ? err.message : "Try again.",
      });
      setStarting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Grow your restaurant with PizzaHub Premium — activated only after a
          verified Stripe payment.
        </p>
      </div>

      {isPremium ? (
        <Card className="rounded-2xl border-gold/40 bg-gradient-to-br from-forest-deep to-forest-soft text-ivory">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-2xl">
              <PartyPopper className="size-6 text-gold" /> You're Premium!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Badge className="gap-1 border-transparent bg-gradient-to-r from-gold to-gold-light text-forest-deep">
              <Crown className="size-3.5" /> Premium Plan Active
            </Badge>
            {user.subscriptionExpiresAt ? (
              <p className="text-sm text-ivory/70">
                Renews on{" "}
                <strong className="text-ivory">
                  {formatDate(user.subscriptionExpiresAt)}
                </strong>
              </p>
            ) : null}
            <p className="text-sm text-ivory/70">
              Unlimited items, premium badge and homepage placement are all
              unlocked.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free */}
        <Card
          className={cn(
            "rounded-2xl border-border/70",
            !isPremium && "border-gold/50 shadow-[0_0_0_1px_var(--gold)]",
          )}
        >
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Free</CardTitle>
            <p className="text-sm text-muted-foreground">
              For new kitchens finding their rhythm.
            </p>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <p className="font-heading text-4xl font-bold">
              $0
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>
            <ul className="flex-1 space-y-2.5 text-sm">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              disabled
              variant="outline"
              className="rounded-full border-border"
            >
              {isPremium ? "Included in Premium" : "Current Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Premium */}
        <Card className="relative overflow-hidden rounded-2xl border-gold/50 bg-gradient-to-b from-gold/[0.08] to-transparent">
          <Badge className="absolute right-4 top-4 border-transparent bg-gradient-to-r from-gold to-gold-light text-forest-deep">
            Most Popular
          </Badge>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-2xl">
              <Crown className="size-5 text-gold" /> Premium
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              For restaurants ready to grow faster.
            </p>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <p className="font-heading text-4xl font-bold text-gold">
              ${PREMIUM_PRICE_USD}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>
            <ul className="flex-1 space-y-2.5 text-sm">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Crown className="mt-0.5 size-3.5 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <Button disabled variant="outline" className="rounded-full border-gold/50">
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={startUpgrade}
                disabled={starting}
                className="rounded-full bg-gold text-forest-deep hover:bg-gold-light"
              >
                {starting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Redirecting to
                    Stripe…
                  </>
                ) : (
                  <>
                    <Crown className="size-4" /> Upgrade to Premium
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Payments are processed securely by Stripe. Premium activates after
        Stripe confirms the payment via webhook — never from this page alone.{" "}
        <Link href="/payment/cancel" className="underline hover:text-gold">
          Cancel behaviour
        </Link>{" "}
        is handled gracefully.
      </p>
    </div>
  );
}
