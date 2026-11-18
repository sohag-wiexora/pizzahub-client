import type { Metadata } from "next";
import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { ProfileSettingsView } from "@/components/profile/profile-settings-view";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your PizzaHub profile details.",
};

export default function ProfileSettingsPage() {
  return (
    <DashboardGate>
      <div className="bg-background min-h-screen py-6">
        <ProfileSettingsView />
      </div>
    </DashboardGate>
  );
}
