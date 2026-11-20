"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  BadgeCheck,
  Clock4,
  MapPin,
  Quote,
  Search,
  ShieldCheck,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/shared/reveal";
import { RatingStars } from "@/components/shared/rating-stars";
import { db } from "@/lib/mock/data";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified Kitchens Only",
    text: "Every vendor and every menu item is reviewed by our team before it reaches your plate.",
  },
  {
    icon: Clock4,
    title: "Oven-to-Door Speed",
    text: "Smart dispatch keeps delivery under 30 minutes across our partner zones.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    text: "Role-verified accounts, protected dashboards and payment-grade security throughout.",
  },
  {
    icon: BadgeDollarSign,
    title: "Honest Pricing",
    text: "No hidden fees. What you see on the card is exactly what you pay at checkout.",
  },
];

const testimonials = db.testimonials();

const steps = [
  {
    icon: Search,
    title: "Browse & Choose",
    text: "Explore verified pizza kitchens near you, filter by category, price or rating and pick your favourite bake.",
  },
  {
    icon: UtensilsCrossed,
    title: "Order in Seconds",
    text: "Choose your quantity, add a delivery address and confirm — the restaurant is notified instantly.",
  },
  {
    icon: MapPin,
    title: "Track & Enjoy",
    text: "Follow every status change from accepted to on the way, then enjoy hot pizza at your door.",
  },
];

/** How PizzaHub Works — required three-step explainer. */
export function HowItWorks() {
  return (
    <section className="bg-surface-alt/60 py-20 dark:bg-background lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Simple by design"
          title="How PizzaHub Works"
          description="Three steps between your craving and a hot slice — no phone calls, no guesswork."
        />
        <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <StaggerItem key={title} className="h-full">
              <div className="lift relative flex h-full flex-col gap-4 rounded-[16px] border border-border bg-card p-6 sm:p-7">
                <span className="absolute right-5 top-5 font-heading text-4xl font-bold text-gold/25">
                  0{index + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

/** Restaurant partner promo — premium vendor acquisition band. */
export function PartnerBanner() {
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-[20px] border border-border bg-card shadow-card lg:grid-cols-2">
            <div className="relative min-h-[260px] lg:min-h-[420px]">
              <Image
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                alt="Freshly baked pizza on a wooden table"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col justify-center gap-5 p-6 sm:p-10 lg:p-12">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-foreground">
                <Store className="size-3.5 text-gold" />
                For Restaurant Owners
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
                Put your kitchen on the map.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Join a curated network of premium pizza partners. Manage your
                menu, receive orders in real time and grow with homepage
                placement, analytics and a verified badge.
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Free plan with 3 active menu items",
                  "Premium placement and unlimited bakes",
                  "Real-time order dashboard",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <BadgeCheck className="size-4 shrink-0 text-success" />
                    <span className="text-foreground/85">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex flex-wrap gap-3">
                <Button asChild className="rounded-lg">
                  <Link href="/sign-up?role=vendor">
                    Become a Partner <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href="/browse-menu">See the menu</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Why Choose PizzaHub — required custom benefits section. */
export function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-forest-deep py-20 text-ivory lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 size-[26rem] rounded-full bg-gold/[0.08] blur-[110px]" />
        <div className="absolute bottom-0 left-0 size-[22rem] rounded-full bg-gold/[0.05] blur-[100px]" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tone="light"
          kicker="The PizzaHub Promise"
          title="Why Choose PizzaHub?"
          description="A premium ordering experience built on trust, taste and technology."
        />
        <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title} className="h-full">
              <div className="group flex h-full flex-col gap-4 rounded-2xl border border-gold/20 bg-white/[0.04] p-6 transition-colors hover:border-gold/45 hover:bg-white/[0.07]">
                <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-[#a8801f] text-forest-deep shadow-lg">
                  <Icon className="size-6" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-ivory">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-ivory/65">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

/** Extra section (chosen): Customer Testimonials. */
export function Testimonials() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Loved by Foodies"
          title="Customer Testimonials"
          description="Real words from the people who matter most — our pizza lovers."
        />
        <StaggerGrid className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id} className="h-full">
              <motion.figure
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex h-full flex-col gap-5 rounded-2xl border border-border/70 bg-card p-7 shadow-sm"
              >
                <Quote className="size-8 fill-gold/20 text-gold" />
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/85">
                  “{t.comment}”
                </blockquote>
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <figcaption className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-forest-soft to-forest-deep text-sm font-bold text-gold-light">
                      {t.image}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t.role}
                      </span>
                    </span>
                  </figcaption>
                  <RatingStars rating={t.rating} size={13} />
                </div>
              </motion.figure>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

/** Golden CTA — closes the homepage. */
export function CtaBanner() {
  return (
    <section className="bg-background pb-20 lg:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold via-[#d8b45e] to-[#a8801f] px-6 py-14 text-center text-forest-deep sm:px-12 lg:px-20">
            <Star
              aria-hidden
              className="absolute -left-6 -top-6 size-40 rotate-12 fill-white/10 text-transparent"
            />
            <Star
              aria-hidden
              className="absolute -bottom-10 -right-8 size-52 -rotate-12 fill-white/10 text-transparent"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
                Hungry? Your Perfect Pizza Is One Tap Away.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium opacity-80 sm:text-base">
                Join thousands of pizza lovers ordering on PizzaHub every day.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-7 h-12 rounded-full bg-forest-deep px-8 text-gold-light hover:bg-forest"
              >
                <Link href="/browse-menu">
                  Order Now <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
