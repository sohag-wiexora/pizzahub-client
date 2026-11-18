"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary — unexpected runtime failures render this luxury
 * recovery screen instead of the default Next.js crash overlay.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your monitoring service (Sentry, Logtail, …) here.
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-300">
        <TriangleAlert className="size-9" />
      </span>
      <h1 className="mt-6 font-heading text-3xl font-bold sm:text-4xl">
        Something went <span className="text-gradient-gold">wrong</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected error interrupted this page. Your data is safe — try
        again, and if the problem persists please contact support.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[0.68rem] text-muted-foreground/70">
          error ref: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={reset}
          className="h-11 rounded-full bg-gold px-7 text-forest-deep hover:bg-gold-light"
        >
          <RefreshCw className="size-4" /> Try Again
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-gold/50 px-7 hover:border-gold hover:bg-gold/10"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
