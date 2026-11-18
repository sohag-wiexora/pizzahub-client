import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { TransactionsView } from "@/components/admin/transactions-view";

export const metadata = { title: "Transactions" };

export default function AdminTransactionsPage() {
  return (
    <DashboardGate roles={["admin"]}>
      <TransactionsView />
    </DashboardGate>
  );
}
