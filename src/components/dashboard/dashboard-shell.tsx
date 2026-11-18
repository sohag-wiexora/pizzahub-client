"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  ClipboardList,
  Receipt,
  Heart,
  Crown,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageLoader } from "@/components/shared/loader";
import { RequireAuth } from "@/components/shared/require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

function navFor(role: UserRole): NavItem[] {
  switch (role) {
    case "vendor":
      return [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/menu-items", label: "My Menu Items", icon: UtensilsCrossed },
        { href: "/dashboard/menu-items/new", label: "Add Menu Item", icon: PlusCircle },
        { href: "/dashboard/orders", label: "Customer Orders", icon: ShoppingBag },
        { href: "/dashboard/subscription", label: "Subscription", icon: Crown },
      ];
    case "admin":
      return [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/users", label: "Manage Users", icon: Users },
        { href: "/dashboard/items", label: "Manage Menu Items", icon: ClipboardList },
        { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
      ];
    default:
      return [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
        { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
      ];
  }
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [itemsOpen, setItemsOpen] = useState(true);

  useEffect(() => {
    // "Add Menu Item" should keep "My Menu Items" highlighted when active
    setItemsOpen(pathname.startsWith("/dashboard/menu-items"));
  }, [pathname]);

  if (!user) return null;
  const items = navFor(user.role);

  const active = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : href === "/dashboard/menu-items"
        ? pathname.startsWith("/dashboard/menu-items")
        : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-5">
        <Logo tone="light" size="sm" href="/" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="px-3 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold/70">
          {user.role === "admin"
            ? "Admin Panel"
            : user.role === "vendor"
              ? "Vendor Panel"
              : "Customer Panel"}
        </p>
        {items.map((item) => {
          // collapse "Add Menu Item" into the items group visually
          const isChild = item.href === "/dashboard/menu-items/new";
          if (isChild && !itemsOpen) return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isChild && "ml-4 border-l border-gold/15 pl-5",
                active(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "size-4.5 shrink-0",
                  active(item.href) ? "text-gold" : "opacity-70",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
          <Avatar className="size-9 border border-gold/40">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-gold to-[#a8801f] text-xs font-bold text-forest-deep">
              {user.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[0.68rem] text-sidebar-foreground/55">
              {user.role === "vendor"
                ? (user.businessName ?? "Restaurant owner")
                : user.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start rounded-xl border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          asChild
        >
          <Link href="/profile-settings">
            <Settings className="size-4" /> Profile Settings
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start rounded-xl border-red-400/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          onClick={async () => {
            await signOut();
            toast.success("Signed out", { description: "See you soon!" });
            router.push("/");
          }}
        >
          <LogOut className="size-4" /> Logout
        </Button>
      </div>
    </div>
  );
}

function DashboardInner({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const roleBadge =
    user.role === "admin"
      ? "Administrator"
      : user.role === "vendor"
        ? "Restaurant Owner"
        : "Customer";

  return (
    <div className="flex min-h-screen bg-background">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open dashboard menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-sidebar-border p-0">
                <SidebarContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold leading-tight">
                {navFor(user.role).find((i) =>
                  i.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(i.href),
                )?.label ?? "Dashboard"}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {user.role === "vendor"
                  ? "Manage your restaurant and orders"
                  : user.role === "admin"
                    ? "Platform overview and management"
                    : "Track your pizza journey"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "vendor" ? (
              <Badge className="hidden gap-1 border-transparent bg-gradient-to-r from-gold to-gold-light text-forest-deep sm:inline-flex">
                <Crown className="size-3" />
                {user.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan"}
              </Badge>
            ) : (
              <Badge className="hidden border-gold/40 bg-gold/10 text-gold sm:inline-flex">
                {roleBadge}
              </Badge>
            )}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:border-gold/50"
                  aria-label="Open profile menu"
                >
                  <Avatar className="size-8 border border-gold/40">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-gold to-[#a8801f] text-xs font-bold text-forest-deep">
                      {user.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate font-semibold">{user.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile-settings">
                    <Settings className="size-4" /> Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <UtensilsCrossed className="size-4" /> Browse Menu
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Dashboard shell: role-guarded layout with role-based sidebar navigation.
 * URL manipulation cannot expose another role's dashboard.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <DashboardInner>{children}</DashboardInner>
    </RequireAuth>
  );
}

export function DashboardGate({
  roles,
  children,
}: {
  /** Omit to allow any signed-in role (e.g. profile settings). */
  roles?: UserRole[];
  children: ReactNode;
}) {
  return <RequireAuth roles={roles}>{children}</RequireAuth>;
}

export { PageLoader as DashboardLoader };
