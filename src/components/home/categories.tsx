"use client";

import Link from "next/link";
import { Heart, Leaf, Pizza, Drumstick, Sparkles, CupSoda, Flame, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORY_META, PIZZA_CATEGORIES } from "@/config/constants";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/shared/reveal";

const ICONS: Record<string, LucideIcon> = {
  Pizza,
  Leaf,
  Flame,
  Sparkles,
  Drumstick,
  CupSoda,
  Heart,
};

/** Explore by category — 6 required categories with imagery. */
export function PizzaCategories() {
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Explore"
          title="Pizza Categories"
          description="Six curated worlds of flavour — from wood-fired classics to chef-crafted gourmet bakes."
        />

        <StaggerGrid className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {PIZZA_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = ICONS[meta.icon] ?? Pizza;
            return (
              <StaggerItem key={category}>
                <Link
                  href={`/browse-menu?category=${encodeURIComponent(category)}`}
                  className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meta.image}
                      alt={category}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-forest-deep/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-gold text-forest-deep shadow-lg">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="text-sm font-semibold leading-snug">{category}</h3>
                    <p className="text-xs text-muted-foreground">{meta.blurb}</p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <Reveal className="mt-8 flex justify-center" delay={0.15}>
          <Link
            href="/browse-menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
          >
            Browse the full menu <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
