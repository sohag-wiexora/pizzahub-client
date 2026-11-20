import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

/**
 * Consistent premium section heading: small gold kicker, serif title,
 * optional supporting line — used on every marketing section.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
}: {
  kicker: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#8a6a2f] dark:text-gold-light">
        {kicker}
      </span>
      <h2
        className={cn(
          "font-heading text-3xl font-bold sm:text-4xl lg:text-[2.6rem] leading-[1.15]",
          tone === "light" ? "text-ivory" : "text-foreground",
          align === "center" && "max-w-2xl",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed",
            tone === "light" ? "text-ivory/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
      <span className={cn("hairline-gold w-24", align === "center" ? "" : "")} />
    </Reveal>
  );
}
