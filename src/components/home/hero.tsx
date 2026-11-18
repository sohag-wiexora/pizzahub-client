"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Play,
  ShieldCheck,
  Star,
  Headset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/mock/data";
import { RatingStars } from "@/components/shared/rating-stars";

const features = [
  { icon: Clock, title: "Fast Delivery", text: "Within 30 minutes" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% safe checkout" },
  { icon: BadgeCheck, title: "Top Rated", text: "Verified restaurants" },
  { icon: Headset, title: "24/7 Support", text: "Always here for you" },
];

/** Home hero — Forest Noir stage with a champagne gold spotlight. */
export function Hero() {
  const reduce = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;
  const fade = (delay: number) => ({
    initial: reduce ? {} : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease },
  });

  return (
    <section className="relative overflow-hidden bg-forest-deep text-ivory">
      {/* ambient lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 size-[34rem] rounded-full bg-gold/10 blur-[110px]" />
        <div className="absolute -right-20 bottom-0 size-[30rem] rounded-full bg-gold/[0.07] blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.08),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20">
        {/* copy */}
        <div className="flex flex-col items-start gap-6">
          <motion.span
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-light"
          >
            <Star className="size-3.5 fill-gold-light" />
            Premium Pizza Experience
          </motion.span>

          <motion.h1
            {...fade(0.1)}
            className="font-heading text-[2.6rem] font-bold leading-[1.08] sm:text-6xl lg:text-[4.2rem]"
          >
            Hot &amp; Fresh Pizza{" "}
            <span className="text-gradient-gold">Delivered to Your Door</span>
          </motion.h1>

          <motion.p {...fade(0.2)} className="max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg">
            Discover the best pizza from local restaurants. Fast delivery,
            great taste — every single time. Handcrafted menus from verified
            kitchens, tracked from oven to door.
          </motion.p>

          <motion.div {...fade(0.3)} className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-gold px-7 text-forest-deep hover:bg-gold-light"
            >
              <Link href="/browse-menu">
                Explore Menu
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-ivory/25 px-6 text-ivory hover:bg-white/10"
            >
              <Link href="#featured">
                <Play className="size-4 fill-current" /> Watch Video
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* imagery */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-gold/25 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={HERO_IMAGE}
              alt="Hand lifting a slice of hot pizza with a melted cheese pull"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent" />
          </div>

          {/* floating rating card */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="absolute -left-3 bottom-16 hidden rounded-2xl border border-gold/25 bg-forest-soft/90 p-4 shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold text-gold-light">4.9</span>
              <RatingStars rating={5} size={12} />
            </div>
            <p className="mt-1 text-xs text-ivory/70">12k+ happy foodies</p>
          </motion.div>

          {/* floating delivery card */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="absolute -right-2 top-10 hidden rounded-2xl border border-gold/25 bg-gold/95 p-4 text-forest-deep shadow-xl sm:block lg:-right-6"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-widest">
              Free Delivery
            </p>
            <p className="font-heading text-lg font-bold">On orders over $25</p>
          </motion.div>
        </motion.div>
      </div>

      {/* feature strip */}
      <div className="relative border-t border-gold/15 bg-forest-soft/40">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:px-8">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={reduce ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="flex items-center gap-3"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <Icon className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ivory">{title}</p>
                <p className="text-xs text-ivory/60">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
