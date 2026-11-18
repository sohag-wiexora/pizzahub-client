import { DashboardGate } from "@/components/dashboard/dashboard-shell";
import { MenuItemForm } from "@/components/vendor/menu-item-form";

export const metadata = { title: "Add Menu Item" };

export default function AddMenuItemPage() {
  return (
    <DashboardGate roles={["vendor"]}>
      <MenuItemForm />
    </DashboardGate>
  );
}
