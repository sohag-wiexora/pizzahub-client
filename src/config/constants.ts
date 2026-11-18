import type { MenuItemStatus, OrderStatus } from "@/types";

export const APP_NAME = "PizzaHub";
export const APP_TAGLINE = "Hot & Fresh Pizza Delivered to Your Door";

/** The 6 required exploration categories */
export const PIZZA_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const;

export const CATEGORY_META: Record<
  string,
  { icon: string; blurb: string; image: string }
> = {
  "Classic Pizzas": {
    icon: "Pizza",
    blurb: "Timeless wood-fired favourites",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  "Vegetarian Pizzas": {
    icon: "Leaf",
    blurb: "Garden fresh, fully loaded",
    image:
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",
  },
  "Meat Lovers": {
    icon: "Flame",
    blurb: "For the serious carnivore",
    image:
      "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80",
  },
  "Specialty / Gourmet Pizzas": {
    icon: "Sparkles",
    blurb: "Chef-crafted signature bakes",
    image:
      "https://images.unsplash.com/photo-1600628421055-4d30de868b8f?auto=format&fit=crop&w=800&q=80",
  },
  "Sides & Appetizers": {
    icon: "Drumstick",
    blurb: "Wings, sticks & sharing plates",
    image:
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
  },
  "Beverages & Desserts": {
    icon: "CupSoda",
    blurb: "Sweet endings & cool sips",
    image:
      "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=800&q=80",
  },
};

export const FREE_PLAN_ACTIVE_ITEM_LIMIT = 3;

export const PREMIUM_PRICE_USD = 9.99;

export const MENU_STATUS_META: Record<
  MenuItemStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending Review",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  approved: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  inactive: {
    label: "Inactive",
    className:
      "bg-stone-200 text-stone-600 border-stone-300 dark:bg-stone-500/15 dark:text-stone-300 dark:border-stone-500/30",
  },
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-stone-200 text-stone-600 border-stone-300 dark:bg-stone-500/15 dark:text-stone-300 dark:border-stone-500/30",
  },
};

export const STATUS_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
];

export const LOCATIONS = [
  "Dhanmondi, Dhaka",
  "Gulshan, Dhaka",
  "Banani, Dhaka",
  "Mirpur, Dhaka",
  "Uttara, Dhaka",
  "Agrabad, Chattogram",
  "Zindabazar, Sylhet",
];
