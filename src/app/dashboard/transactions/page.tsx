import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { TransactionsView } from "@/components/admin/transactions-view";

export const metadata = { title: "Transactions" };
// Opt this segment out of instant-navigation validation — the admin ledger
// streams client-side data and does not ship a blocking server payload.
export const instant = false;

export default function AdminTransactionsPage() {
  return (
    <DashboardGate roles={["admin"]}>
      <TransactionsView />
    </DashboardGate>
  );
}
