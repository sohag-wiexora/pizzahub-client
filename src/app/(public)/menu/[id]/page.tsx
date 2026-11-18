import type { Metadata } from "next";
import { Suspense } from "react";
import { ItemDetailsView } from "@/components/details/item-details-view";
import { PageLoader } from "@/components/shared/loader";

export const metadata: Metadata = {
  title: "Item Details",
  description: "Item details, gallery, vendor info and ordering on PizzaHub.",
};

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader label="Plating up the details…" />}>
      <ItemDetailsLoader params={params} />
    </Suspense>
  );
}

/** Awaited inside Suspense so the route can still be prerendered. */
async function ItemDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetailsView id={id} />;
}
