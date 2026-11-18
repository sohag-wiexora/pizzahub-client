import type { Metadata } from "next";
import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { VendorMenuItemsView } from "@/components/vendor/vendor-menu-items-view";

export const metadata: Metadata = { title: "My Menu Items" };

export default function VendorMenuItemsPage() {
  return (
    <DashboardGate roles={["vendor"]}>
      <VendorMenuItemsView />
    </DashboardGate>
  );
}
