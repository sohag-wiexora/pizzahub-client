import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Full-page luxury loader — used by route-level loading states. */
export function PageLoader({ label = "Preparing something delicious…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <span className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
        <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-[#a8801f] text-forest-deep">
          <Loader2 className="size-7 animate-spin" />
        </span>
      </span>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-10 text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin text-gold" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}

/** Card grid skeleton matching the menu card dimensions. */
export function MenuCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
