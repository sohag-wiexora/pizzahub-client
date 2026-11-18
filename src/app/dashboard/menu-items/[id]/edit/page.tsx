"use client";

import { useEffect, useState } from "react";
import { ApiError, getVendorMenuItems } from "@/lib/api-client";
import { MenuItemForm } from "@/components/vendor/menu-item-form";
import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { PageLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

function EditItemBody({ itemId }: { itemId: string }) {
  const { user } = useAuth();
  const [item, setItem] = useState<Awaited<
    ReturnType<typeof getVendorMenuItems>
  >[number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getVendorMenuItems(user.id)
      .then((items) => {
        const found = items.find((i) => i._id === itemId);
        if (!found) {
          setError("This item does not exist in your menu or belongs to another vendor.");
        } else {
          setItem(found);
        }
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : "Could not load the item.",
        ),
      );
  }, [user, itemId]);

  if (error) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="Item unavailable"
        description={error}
      />
    );
  }
  if (!item) return <PageLoader label="Loading your item…" />;
  return <MenuItemForm item={item} />;
}

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <DashboardGate roles={["vendor"]}>
      <EditItemLoader params={params} />
    </DashboardGate>
  );
}

function EditItemLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);
  if (!id) return <PageLoader />;
  return <EditItemBody itemId={id} />;
}
