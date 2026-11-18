import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { SubscriptionView } from "@/components/vendor/subscription-view";

export const metadata = { title: "Subscription" };

export default function SubscriptionPage() {
  return (
    <DashboardGate roles={["vendor"]}>
      <SubscriptionView />
    </DashboardGate>
  );
}
