"use client";

import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { OrdersView } from "@/components/dashboard/orders-view";
import { useAuth } from "@/components/providers/auth-provider";

export default function OrdersPage() {
  return (
    <DashboardGate roles={["vendor", "customer"]}>
      <OrdersRolePicker />
    </DashboardGate>
  );
}

function OrdersRolePicker() {
  const { isVendor } = useAuth();
  return <OrdersView perspective={isVendor ? "vendor" : "customer"} />;
}
