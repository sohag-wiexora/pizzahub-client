import { Suspense } from "react";
import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { AdminItemsView } from "@/components/admin/admin-items-view";
import { PageLoader } from "@/components/shared/loader";

export const metadata = { title: "Manage Menu Items" };

export default function AdminItemsPage() {
  return (
    <DashboardGate roles={["admin"]}>
      <Suspense fallback={<PageLoader />}>
        <AdminItemsView />
      </Suspense>
    </DashboardGate>
  );
}
