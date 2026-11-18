import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata = { title: "Manage Users" };

export default function AdminUsersPage() {
  return (
    <DashboardGate roles={["admin"]}>
      <AdminUsersView />
    </DashboardGate>
  );
}
