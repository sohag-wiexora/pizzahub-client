"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Crown,
  Pizza,
  Receipt,
  ShoppingBag,
  Store,
  Users,
  Ban,
  CheckCircle2,
  Hourglass,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import type { DashboardStats, Order } from "@/types";
import {
  getAdminStats,
  getCustomerStats,
  getOrdersForUser,
  getVendorStats,
} from "@/lib/api-client";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrdersAreaChart, RevenueBarChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/shared/loader";
import { ORDER_STATUS_META } from "@/config/constants";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate } from "@/lib/utils";

function QuickLink({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-gold/50 hover:bg-gold/[0.05]"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-gold/12 text-gold">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{text}</span>
      </span>
      <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold" />
    </Link>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No orders yet.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border/60">
      {orders.map((order) => {
        const meta = ORDER_STATUS_META[order.status];
        return (
          <li key={order._id} className="flex items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-forest-soft text-gold-light">
              <Pizza className="size-5" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{order.item.itemName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {order.customerName} · {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge className={`border ${meta.className}`}>{meta.label}</Badge>
          </li>
        );
      })}
    </ul>
  );
}

function VendorOverview({ vendorId }: { vendorId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getVendorStats(vendorId)
      .then(setStats)
      .catch((err: unknown) =>
        toast.error("Could not load dashboard", {
          description: err instanceof Error ? err.message : "Try again.",
        }),
      );
    getOrdersForUser({ id: vendorId, role: "vendor" })
      .then((all) => setOrders(all.slice(0, 5)))
      .catch(() => setOrders([]));
  }, [vendorId]);

  if (!stats) return <InlineLoader className="py-24" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UtensilsCrossed} label="Total Menu Items" value={stats.totalMenuItems ?? 0} />
        <StatCard icon={CheckCircle2} label="Active Menu Items" value={stats.activeMenuItems ?? 0} tone="green" hint="Visible to customers" />
        <StatCard icon={Hourglass} label="Pending Orders" value={stats.pendingOrders ?? 0} tone="neutral" hint="Waiting for your response" />
        <StatCard
          icon={Crown}
          label="Subscription"
          value={stats.subscriptionPlan === "premium" ? "Premium" : "Free"}
          tone="gold"
          hint={
            stats.subscriptionExpiresAt
              ? `Renews ${formatDate(stats.subscriptionExpiresAt)}`
              : "Max 3 active items on Free"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={stats.monthlyRevenue ?? []} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-gold/30 bg-gradient-to-br from-forest-deep to-forest-soft text-ivory">
          <div aria-hidden className="absolute -right-10 -top-10 size-44 rounded-full bg-gold/10 blur-2xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <Crown className="size-5 text-gold" /> Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-4">
            <p className="font-heading text-4xl font-bold text-gold-light">
              {stats.subscriptionPlan === "premium" ? "Premium" : "Free"}
            </p>
            <ul className="space-y-1.5 text-sm text-ivory/70">
              {stats.subscriptionPlan === "premium" ? (
                <>
                  <li>✓ Unlimited active menu items</li>
                  <li>✓ Premium badge &amp; featured placement</li>
                  <li>✓ Priority order handling</li>
                </>
              ) : (
                <>
                  <li>• Up to 3 active menu items</li>
                  <li>• Basic vendor dashboard</li>
                  <li>• Order management included</li>
                </>
              )}
            </ul>
            <Button asChild className="mt-auto rounded-full bg-gold text-forest-deep hover:bg-gold-light">
              <Link href="/dashboard/subscription">
                {stats.subscriptionPlan === "premium"
                  ? "Manage Subscription"
                  : "Upgrade to Premium"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-heading text-xl">Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-gold hover:text-gold-light">
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RecentOrders orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerOverview({ customerId }: { customerId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getCustomerStats(customerId)
      .then(setStats)
      .catch((err: unknown) =>
        toast.error("Could not load dashboard", {
          description: err instanceof Error ? err.message : "Try again.",
        }),
      );
  }, [customerId]);

  if (!stats) return <InlineLoader className="py-24" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders ?? 0} />
        <StatCard icon={Hourglass} label="Pending" value={stats.pendingOrders ?? 0} tone="neutral" />
        <StatCard icon={CheckCircle2} label="Accepted" value={stats.acceptedOrders ?? 0} tone="green" />
        <StatCard icon={Ban} label="Rejected" value={stats.rejectedOrders ?? 0} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Order Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersAreaChart data={stats.monthlyRevenue ?? []} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </p>
          <QuickLink href="/browse-menu" icon={Pizza} title="Order a Pizza" text="Browse the full menu" />
          <QuickLink href="/dashboard/orders" icon={ShoppingBag} title="My Orders" text="Track and manage orders" />
          <QuickLink href="/dashboard/favorites" icon={ClipboardList} title="My Favorites" text="Reorder loved items" />
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err: unknown) =>
        toast.error("Could not load dashboard", {
          description: err instanceof Error ? err.message : "Try again.",
        }),
      );
  }, []);

  if (!stats) return <InlineLoader className="py-24" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers ?? 0}
          hint={`${stats.totalCustomers ?? 0} customers registered`}
        />
        <StatCard icon={Store} label="Vendors" value={stats.totalVendors ?? 0} tone="neutral" />
        <StatCard
          icon={Pizza}
          label="Menu Items"
          value={stats.totalMenuItems ?? 0}
          hint={`${stats.pendingMenuItems ?? 0} pending review`}
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders ?? 0}
          tone="gold"
          hint={`${stats.pendingOrders ?? 0} pending · $${(stats.revenue ?? 0).toFixed(2)} revenue`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersAreaChart data={stats.monthlyRevenue ?? []} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </p>
          <QuickLink href="/dashboard/users" icon={Users} title="Manage Users" text="Block, unblock and filter" />
          <QuickLink
            href="/dashboard/orders"
            icon={ShoppingBag}
            title="All Orders"
            text="Every order across the platform"
          />
          <QuickLink
            href="/dashboard/items?status=pending"
            icon={ClipboardList}
            title="Review Pending Items"
            text="Approve or reject submissions"
          />
          <QuickLink href="/dashboard/transactions" icon={Receipt} title="View Transactions" text="Subscription payments" />
        </div>
      </div>
    </div>
  );
}

/** Role-aware dashboard overview. */
export default function DashboardPage() {
  const { user, isAdmin, isVendor, isCustomer } = useAuth();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">
          Welcome back, <span className="text-gradient-gold">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isVendor
            ? "Here's how your restaurant is doing today."
            : isAdmin
              ? "Here's the pulse of the platform."
              : "Here's your pizza journey so far."}
        </p>
      </div>

      {isAdmin ? <AdminOverview /> : null}
      {isVendor && user ? <VendorOverview vendorId={user.id} /> : null}
      {isCustomer && user ? <CustomerOverview customerId={user.id} /> : null}
    </div>
  );
}
