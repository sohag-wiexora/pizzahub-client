import Link from "next/link";
import { Compass, Home, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-forest-deep px-4 text-center text-ivory">
      {/* ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute -right-24 bottom-1/4 size-96 rounded-full bg-gold/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center">
        <Logo tone="light" size="md" href="/" />

        <p className="mt-10 font-heading text-[7rem] font-bold leading-none text-transparent sm:text-[9rem] [background:linear-gradient(135deg,#e8c87e,#a8801f)] [-webkit-background-clip:text] [background-clip:text]">
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
          This page slipped out of the oven
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/60">
          The page you're looking for doesn't exist or was moved. Let's get
          you back to something delicious instead.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="h-11 rounded-full bg-gold px-7 text-forest-deep hover:bg-gold-light"
          >
            <Link href="/">
              <Home className="size-4" /> Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-gold/40 bg-transparent px-7 text-gold-light hover:bg-gold/10 hover:text-gold"
          >
            <Link href="/browse-menu">
              <UtensilsCrossed className="size-4" /> Browse Menu
            </Link>
          </Button>
        </div>

        <p className="mt-10 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ivory/35">
          <Compass className="size-3.5" /> PizzaHub · Assignment 9
        </p>
      </div>
    </div>
  );
}
