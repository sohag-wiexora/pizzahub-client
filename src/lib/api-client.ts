import type {
  ApiListParams,
  CheckoutSession,
  DashboardStats,
  MenuItem,
  MenuItemInput,
  Order,
  OrderInput,
  OrderStatus,
  PizzaUser,
  ProfileUpdateInput,
  Review,
  ReviewInput,
  SignUpInput,
  Transaction,
  UserRole,
} from "@/types";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/env";
import { db } from "@/lib/mock/data";

/**
 * The single seam between the UI and a data source.
 *
 * When `NEXT_PUBLIC_API_URL` is empty every call is answered by the local
 * mock database (demo mode). Setting it to the Render backend origin routes
 * each function to the Express API (pizzahub-server) — no UI changes needed.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const delay = (ms = 350 + Math.random() * 450) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** fetch wrapper for the real backend (cookie auth included automatically). */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? "Request failed", res.status);
  }
  return (body?.data ?? body) as T;
}

/* ------------------------------------------------------------------ */
/* Menu items                                                          */
/* ------------------------------------------------------------------ */

const isPublicItem = (i: MenuItem) => i.status === "approved";

export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
  if (USE_MOCK_DATA) {
    await delay();
    return db.menuItems().filter(isPublicItem).slice(0, 6);
  }
  return request<MenuItem[]>("/api/menu-items/featured");
}

export async function getMenuItems(
  params: ApiListParams = {},
): Promise<MenuItem[]> {
  if (USE_MOCK_DATA) {
    await delay();
    const search = params.search?.trim().toLowerCase();
    let items = db.menuItems().filter(isPublicItem);
    if (search) {
      items = items.filter(
        (i) =>
          i.itemName.toLowerCase().includes(search) ||
          i.vendor.businessName.toLowerCase().includes(search),
      );
    }
    if (params.category) items = items.filter((i) => i.category === params.category);
    if (params.location) items = items.filter((i) => i.location === params.location);
    switch (params.sort) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      default:
        items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return items;
  }
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();
  return request<MenuItem[]>(`/api/menu-items?${qs}`);
}

export async function getMenuItemById(id: string): Promise<MenuItem> {
  if (USE_MOCK_DATA) {
    await delay();
    const item = db.menuItems().find((i) => i._id === id);
    if (!item || !isPublicItem(item)) {
      throw new ApiError("This menu item does not exist or is not available.", 404);
    }
    return item;
  }
  return request<MenuItem>(`/api/menu-items/${id}`);
}

export async function getVendorMenuItems(vendorId: string): Promise<MenuItem[]> {
  if (USE_MOCK_DATA) {
    await delay();
    return db
      .menuItems()
      .filter((i) => i.vendorId === vendorId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return request<MenuItem[]>("/api/menu-items/vendor/me");
}

export async function createMenuItem(
  vendorId: string,
  input: MenuItemInput,
): Promise<MenuItem> {
  if (USE_MOCK_DATA) {
    await delay(600);
    const vendor = db.users().find((u) => u.id === vendorId);
    if (!vendor) throw new ApiError("Vendor not found", 401);
    const approved = db
      .menuItems()
      .filter((i) => i.vendorId === vendorId && i.status === "approved");
    if (
      vendor.subscriptionPlan === "free" &&
      approved.length >= 3
    ) {
      throw new ApiError(
        "Free plan allows a maximum of 3 active items. Upgrade to Premium to publish more.",
        403,
      );
    }
    const item: MenuItem = {
      _id: `mi-${Date.now()}`,
      vendorId,
      vendor: {
        id: vendorId,
        name: vendor.name,
        businessName: vendor.businessName ?? "",
        location: input.location,
        isPremium: vendor.subscriptionPlan === "premium",
        rating: 4.7,
      },
      ...input,
      status: "pending",
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return item;
  }
  return request<MenuItem>("/api/menu-items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMenuItem(
  id: string,
  vendorId: string,
  input: Partial<MenuItemInput>,
): Promise<MenuItem> {
  if (USE_MOCK_DATA) {
    await delay(500);
    const item = db.menuItems().find((i) => i._id === id);
    if (!item) throw new ApiError("Menu item not found", 404);
    if (item.vendorId !== vendorId) {
      throw new ApiError("You can only edit your own items.", 403);
    }
    return { ...item, ...input, updatedAt: new Date().toISOString() };
  }
  return request<MenuItem>(`/api/menu-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteMenuItem(id: string, vendorId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(400);
    const item = db.menuItems().find((i) => i._id === id);
    if (!item) throw new ApiError("Menu item not found", 404);
    if (item.vendorId !== vendorId) {
      throw new ApiError("You can only delete your own items.", 403);
    }
    return;
  }
  await request<void>(`/api/menu-items/${id}`, { method: "DELETE" });
}

export async function setMenuItemAvailability(
  id: string,
  vendorId: string,
  active: boolean,
): Promise<MenuItem> {
  if (USE_MOCK_DATA) {
    await delay(400);
    const item = db.menuItems().find((i) => i._id === id);
    if (!item) throw new ApiError("Menu item not found", 404);
    if (item.vendorId !== vendorId) {
      throw new ApiError("You can only manage your own items.", 403);
    }
    if (item.status !== "approved" && item.status !== "inactive") {
      throw new ApiError("Only approved items can be toggled.", 400);
    }
    const vendor = db.users().find((u) => u.id === vendorId);
    if (
      active &&
      vendor?.subscriptionPlan === "free" &&
      db.menuItems().filter((i) => i.vendorId === vendorId && i.status === "approved")
        .length >= 3
    ) {
      throw new ApiError(
        "Free plan allows a maximum of 3 active items. Deactivate one or upgrade to Premium.",
        403,
      );
    }
    return { ...item, status: active ? "approved" : "inactive" };
  }
  return request<MenuItem>(`/api/menu-items/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["pending", "accepted"];

export async function createOrder(
  user: { id: string; name: string; email: string; image?: string; role: UserRole },
  input: OrderInput,
): Promise<Order> {
  if (USE_MOCK_DATA) {
    await delay(700);
    if (user.role !== "customer") {
      throw new ApiError(
        "Only customers can place orders through the storefront.",
        403,
      );
    }
    const item = db.menuItems().find((i) => i._id === input.itemId);
    if (!item || item.status !== "approved") {
      throw new ApiError("This item is not available for ordering.", 400);
    }
    if (item.vendorId === user.id) {
      throw new ApiError("You cannot order your own item.", 403);
    }
    const duplicate = db
      .orders()
      .some(
        (o) =>
          o.customerId === user.id &&
          o.itemId === input.itemId &&
          o.deliveryDate === input.deliveryDate &&
          ACTIVE_ORDER_STATUSES.includes(o.status),
      );
    if (duplicate) {
      throw new ApiError(
        "You already have an active order for this item on this delivery date.",
        409,
      );
    }
    const now = new Date().toISOString();
    return {
      _id: `ord-${Date.now()}`,
      itemId: item._id,
      item: {
        _id: item._id,
        itemName: item.itemName,
        images: item.images,
        price: item.price,
        category: item.category,
      },
      vendorId: item.vendorId,
      vendor: item.vendor,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerImage: user.image,
      deliveryDate: input.deliveryDate,
      deliveryAddress: input.deliveryAddress,
      message: input.message,
      status: "pending",
      statusHistory: [{ status: "pending", at: now }],
      createdAt: now,
      updatedAt: now,
    };
  }
  return request<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrdersForUser(user: {
  id: string;
  role: UserRole;
}): Promise<Order[]> {
  if (USE_MOCK_DATA) {
    await delay();
    const orders = db
      .orders()
      .filter((o) =>
        user.role === "vendor" ? o.vendorId === user.id : o.customerId === user.id,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return orders;
  }
  return request<Order[]>(
    user.role === "vendor" ? "/api/orders/vendor" : "/api/orders/customer",
  );
}

export async function getOrderByVendor(
  orderId: string,
  vendorId: string,
): Promise<Order | undefined> {
  if (USE_MOCK_DATA) {
    return db
      .orders()
      .find((o) => o._id === orderId && o.vendorId === vendorId);
  }
  return request<Order>(`/api/orders/${orderId}`);
}

export async function respondToOrder(
  orderId: string,
  vendorId: string,
  action: "accept" | "reject",
): Promise<Order> {
  if (USE_MOCK_DATA) {
    await delay(450);
    const order = db.orders().find((o) => o._id === orderId);
    if (!order) throw new ApiError("Order not found", 404);
    if (order.vendorId !== vendorId) {
      throw new ApiError("This order belongs to another vendor.", 403);
    }
    if (order.status !== "pending") {
      throw new ApiError(
        "Only pending orders can be accepted or rejected — and only once.",
        400,
      );
    }
    const now = new Date().toISOString();
    const status: OrderStatus = action === "accept" ? "accepted" : "rejected";
    return {
      ...order,
      status,
      statusHistory: [...order.statusHistory, { status, at: now }],
      updatedAt: now,
    };
  }
  return request<Order>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export async function cancelOrder(
  orderId: string,
  customerId: string,
): Promise<Order> {
  if (USE_MOCK_DATA) {
    await delay(450);
    const order = db.orders().find((o) => o._id === orderId);
    if (!order) throw new ApiError("Order not found", 404);
    if (order.customerId !== customerId) {
      throw new ApiError("You can only cancel your own orders.", 403);
    }
    if (order.status !== "pending") {
      throw new ApiError(
        "Orders that are already accepted, rejected or cancelled cannot be cancelled.",
        400,
      );
    }
    const now = new Date().toISOString();
    return {
      ...order,
      status: "cancelled",
      statusHistory: [...order.statusHistory, { status: "cancelled", at: now }],
      updatedAt: now,
    };
  }
  return request<Order>(`/api/orders/${orderId}/cancel`, { method: "PATCH" });
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function getItemReviews(itemId: string): Promise<Review[]> {
  if (USE_MOCK_DATA) {
    await delay(250);
    return db
      .reviews()
      .filter((r) => r.itemId === itemId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return request<Review[]>(`/api/menu-items/${itemId}/reviews`);
}

export async function addReview(
  itemId: string,
  user: { id: string; name: string; image?: string },
  input: ReviewInput,
): Promise<Review> {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      _id: `rev-${Date.now()}`,
      itemId,
      customerId: user.id,
      customerName: user.name,
      customerImage: user.image,
      ...input,
      createdAt: new Date().toISOString(),
    };
  }
  return request<Review>(`/api/menu-items/${itemId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/* ------------------------------------------------------------------ */
/* Favorites                                                           */
/* ------------------------------------------------------------------ */

const FAVORITES_KEY = "pizzahub:favorites";

export async function getFavorites(customerId: string): Promise<string[]> {
  if (USE_MOCK_DATA) {
    try {
      const all = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "{}");
      return (all[customerId] as string[]) ?? [];
    } catch {
      return [];
    }
  }
  return request<string[]>("/api/favorites");
}

export async function toggleFavorite(
  customerId: string,
  itemId: string,
): Promise<string[]> {
  if (USE_MOCK_DATA) {
    const all = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "{}");
    const list: string[] = all[customerId] ?? [];
    const next = list.includes(itemId)
      ? list.filter((id) => id !== itemId)
      : [...list, itemId];
    all[customerId] = next;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(all));
    return next;
  }
  return request<string[]>("/api/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
}

/* ------------------------------------------------------------------ */
/* Dashboard stats                                                     */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthlyRevenue(orders: Order[]) {
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders.filter((o) => o.status !== "cancelled")) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 };
    bucket.revenue += order.item.price;
    bucket.orders += 1;
    buckets.set(key, bucket);
  }
  const now = new Date();
  const series: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 };
    series.push({
      month: MONTHS[d.getMonth()],
      revenue: Math.round(bucket.revenue * 100) / 100,
      orders: bucket.orders,
    });
  }
  return series;
}

export async function getVendorStats(vendorId: string): Promise<DashboardStats> {
  if (USE_MOCK_DATA) {
    await delay(300);
    const items = db.menuItems().filter((i) => i.vendorId === vendorId);
    const orders = db.orders().filter((o) => o.vendorId === vendorId);
    const vendor = db.users().find((u) => u.id === vendorId);
    return {
      totalMenuItems: items.length,
      activeMenuItems: items.filter((i) => i.status === "approved").length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      acceptedOrders: orders.filter((o) => o.status === "accepted").length,
      rejectedOrders: orders.filter((o) => o.status === "rejected").length,
      totalOrders: orders.length,
      subscriptionPlan: vendor?.subscriptionPlan ?? "free",
      subscriptionExpiresAt: vendor?.subscriptionExpiresAt,
      monthlyRevenue: monthlyRevenue(orders),
    };
  }
  return request<DashboardStats>("/api/dashboard/vendor");
}

export async function getCustomerStats(customerId: string): Promise<DashboardStats> {
  if (USE_MOCK_DATA) {
    await delay(300);
    const orders = db.orders().filter((o) => o.customerId === customerId);
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      acceptedOrders: orders.filter((o) => o.status === "accepted").length,
      rejectedOrders: orders.filter((o) => o.status === "rejected").length,
      cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
      monthlyRevenue: monthlyRevenue(orders),
    };
  }
  return request<DashboardStats>("/api/dashboard/customer");
}

export async function getAdminStats(): Promise<DashboardStats> {
  if (USE_MOCK_DATA) {
    await delay(300);
    const users = db.users();
    const orders = db.orders();
    const revenue = db
      .transactions()
      .filter((t) => t.status === "succeeded")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalUsers: users.length,
      totalVendors: users.filter((u) => u.role === "vendor").length,
      totalCustomers: users.filter((u) => u.role === "customer").length,
      totalMenuItems: db.menuItems().length,
      pendingMenuItems: db.menuItems().filter((i) => i.status === "pending").length,
      totalTransactions: db.transactions().length,
      revenue: Math.round(revenue * 100) / 100,
      monthlyRevenue: monthlyRevenue(orders),
    };
  }
  return request<DashboardStats>("/api/dashboard/admin");
}

/* ------------------------------------------------------------------ */
/* Admin — users & moderation & transactions                           */
/* ------------------------------------------------------------------ */

export async function getAdminUsers(
  params: { search?: string; role?: string } = {},
): Promise<PizzaUser[]> {
  if (USE_MOCK_DATA) {
    await delay();
    const search = params.search?.trim().toLowerCase();
    let users = db.users();
    if (search) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }
    if (params.role && params.role !== "all") {
      users = users.filter((u) => u.role === params.role);
    }
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();
  return request<PizzaUser[]>(`/api/users?${qs}`);
}

export async function setUserBlocked(
  userId: string,
  isBlocked: boolean,
): Promise<PizzaUser> {
  if (USE_MOCK_DATA) {
    await delay(400);
    const user = db.users().find((u) => u.id === userId);
    if (!user) throw new ApiError("User not found", 404);
    if (user.role === "admin") {
      throw new ApiError("Admin accounts cannot be blocked.", 403);
    }
    return { ...user, isBlocked };
  }
  return request<PizzaUser>(`/api/users/${userId}/block`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}

export async function getAdminMenuItems(
  params: { search?: string; status?: string } = {},
): Promise<MenuItem[]> {
  if (USE_MOCK_DATA) {
    await delay();
    const search = params.search?.trim().toLowerCase();
    let items = db.menuItems();
    if (search) {
      items = items.filter(
        (i) =>
          i.itemName.toLowerCase().includes(search) ||
          i.vendor.businessName.toLowerCase().includes(search),
      );
    }
    if (params.status && params.status !== "all") {
      items = items.filter((i) => i.status === params.status);
    }
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();
  return request<MenuItem[]>(`/api/admin/menu-items?${qs}`);
}

export async function moderateMenuItem(
  itemId: string,
  status: "approved" | "rejected",
): Promise<MenuItem> {
  if (USE_MOCK_DATA) {
    await delay(450);
    const item = db.menuItems().find((i) => i._id === itemId);
    if (!item) throw new ApiError("Menu item not found", 404);
    return { ...item, status, updatedAt: new Date().toISOString() };
  }
  return request<MenuItem>(`/api/admin/menu-items/${itemId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function adminDeleteMenuItem(itemId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(400);
    return;
  }
  await request<void>(`/api/admin/menu-items/${itemId}`, { method: "DELETE" });
}

export async function getTransactions(): Promise<Transaction[]> {
  if (USE_MOCK_DATA) {
    await delay();
    return db
      .transactions()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return request<Transaction[]>("/api/transactions");
}

/* ------------------------------------------------------------------ */
/* Payments (Stripe Checkout — vendor subscription only)               */
/* ------------------------------------------------------------------ */

export async function createCheckoutSession(vendorId: string): Promise<CheckoutSession> {
  if (USE_MOCK_DATA) {
    await delay(600);
    const sessionId = `cs_demo_${Date.now()}`;
    return { sessionId, url: `/payment/success?session_id=${sessionId}` };
  }
  return request<CheckoutSession>("/api/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ vendorId }),
  });
}
