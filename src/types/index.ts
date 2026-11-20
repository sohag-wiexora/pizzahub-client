/**
 * Global domain types for PizzaHub.
 * These mirror the MongoDB collections defined by the pizzahub-server API,
 * so swapping the mock data layer for the real backend stays a 1-file change.
 */

export type UserRole = "vendor" | "customer" | "admin";

export type MenuItemStatus = "pending" | "approved" | "rejected" | "inactive";

export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type SubscriptionPlan = "free" | "premium";

export type PaymentStatus = "succeeded" | "pending" | "failed";

/** users collection (Better Auth user + PizzaHub profile fields) */
export interface PizzaUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isBlocked: boolean;
  businessName?: string; // vendor only
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

/** lightweight vendor card embedded in menu items / orders */
export interface VendorSummary {
  id: string;
  name: string;
  businessName: string;
  location: string;
  image?: string;
  isPremium: boolean;
  rating: number;
}

export interface MenuItem {
  _id: string;
  vendorId: string;
  vendor: VendorSummary;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuItemStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemInput {
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
}

export interface OrderItemSummary {
  _id: string;
  itemName: string;
  images: string[];
  price: number;
  category: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  _id: string;
  itemId: string;
  item: OrderItemSummary;
  vendorId: string;
  vendor: VendorSummary;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerImage?: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  /** how many pizzas the customer ordered (defaults to 1) */
  quantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  itemId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  quantity?: number;
}

export interface Transaction {
  _id: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  _id: string;
  itemId: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isBlocked: boolean;
  businessName?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: Exclude<UserRole, "admin">;
  businessName?: string;
}

export interface ProfileUpdateInput {
  name?: string;
  image?: string;
}

export interface DashboardStats {
  totalMenuItems?: number;
  activeMenuItems?: number;
  pendingOrders?: number;
  acceptedOrders?: number;
  rejectedOrders?: number;
  cancelledOrders?: number;
  totalOrders?: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  totalUsers?: number;
  totalVendors?: number;
  totalCustomers?: number;
  pendingMenuItems?: number;
  totalTransactions?: number;
  revenue?: number;
  monthlyRevenue?: { month: string; revenue: number; orders: number }[];
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface ApiListParams {
  search?: string;
  category?: string;
  location?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "rating";
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };
