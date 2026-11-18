import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageLoader } from "@/components/shared/loader";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your PizzaHub role-based dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PageLoader label="Preparing your dashboard…" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
