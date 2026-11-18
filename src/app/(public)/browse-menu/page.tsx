import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseMenuView } from "@/components/browse/browse-menu-view";
import { PageLoader } from "@/components/shared/loader";

export const metadata: Metadata = {
  title: "Browse Menu",
  description:
    "Search, filter and sort approved pizza menus from verified PizzaHub vendors.",
};

export default function BrowseMenuPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading the menu…" />}>
      <BrowseMenuView />
    </Suspense>
  );
}
