import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dashboard statistic card with a soft gold accent. */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "gold",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "gold" | "green" | "red" | "neutral";
  className?: string;
}) {
  const tones = {
    gold: "from-gold to-[#a8801f] text-forest-deep",
    green: "from-emerald-400 to-emerald-600 text-white",
    red: "from-red-400 to-red-600 text-white",
    neutral: "from-forest-soft to-forest-deep text-gold-light",
  } as const;

  return (
    <div
      className={cn(
        "lift flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
          tones[tone],
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate font-heading text-2xl font-bold">{value}</p>
        {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
