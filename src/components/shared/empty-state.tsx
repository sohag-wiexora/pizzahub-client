import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Meaningful empty state — used by menu lists, orders, admin tables. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gold/35 bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-gold/12 text-gold">
        <Icon className="size-7" />
      </span>
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
