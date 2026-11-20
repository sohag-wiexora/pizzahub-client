"use client";

import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { OrdersView } from "@/components/dashboard/orders-view";
import { useAuth } from "@/components/providers/auth-provider";

export default function OrdersPage() {
  return (
    <DashboardGate roles={["vendor", "customer", "admin"]}>
      <OrdersRolePicker />
    </DashboardGate>
  );
}

function OrdersRolePicker() {
  const { user } = useAuth();
  return <OrdersView perspective={user?.role ?? "customer"} />;
}
