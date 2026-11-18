import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedItems } from "@/components/home/featured-items";
import { PizzaCategories } from "@/components/home/categories";
import { WhyChoose, Testimonials, CtaBanner } from "@/components/home/sections";

export const metadata: Metadata = {
  title: "PizzaHub — Hot & Fresh Pizza Delivered to Your Door",
  description:
    "Discover local pizza shops, browse handcrafted menus and order with confidence on PizzaHub.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedItems />
      <PizzaCategories />
      <WhyChoose />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
