import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { FavoritesView } from "@/components/dashboard/favorites-view";

export const metadata = { title: "My Favorites" };

export default function FavoritesPage() {
  return (
    <DashboardGate roles={["customer"]}>
      <FavoritesView />
    </DashboardGate>
  );
}
