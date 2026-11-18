import { cn } from "@/lib/utils";

/**
 * PizzaHub brand mark — a hand-drawn champagne gold pizza slice inside a
 * soft badge, paired with the serif wordmark. Pure inline SVG so it stays
 * crisp everywhere (no image assets required).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-[#a8801f] shadow-[0_6px_16px_-6px_rgba(201,162,75,0.7)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
        {/* slice */}
        <path
          d="M12 2.6c-.5 0-1 .28-1.3.8L4.9 13.4c-.5.9.05 2 1.05 2.2 2.1.44 4.2 1.6 5.2 3.2.5.8 1.7.8 2.2 0 1-1.6 3.1-2.76 5.2-3.2 1-.2 1.55-1.3 1.05-2.2L13.3 3.4c-.3-.52-.8-.8-1.3-.8Z"
          fill="#142a1e"
        />
        {/* pepperoni */}
        <circle cx="12" cy="8.2" r="1.25" fill="#e8c87e" />
        <circle cx="10" cy="12.1" r="1.1" fill="#e8c87e" />
        <circle cx="13.8" cy="12.4" r="1" fill="#e8c87e" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  tone = "dark",
  size = "md",
  href,
}: {
  className?: string;
  /** "dark" = for light/ivory surfaces, "light" = for forest-noir surfaces */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const wordTone =
    tone === "light" ? "text-ivory" : "text-foreground";
  const subTone =
    tone === "light" ? "text-gold-light/80" : "text-gold";
  const markSize = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const titleSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  const content = (
    <>
      <LogoMark className={markSize} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading font-bold tracking-tight", titleSize, wordTone)}>
          Pizza<span className="text-gradient-gold">Hub</span>
        </span>
        <span
          className={cn(
            "mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.32em]",
            subTone,
          )}
        >
          Premium Pizza Experience
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn("flex items-center gap-3", className)}>
        {content}
      </a>
    );
  }
  return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
}
