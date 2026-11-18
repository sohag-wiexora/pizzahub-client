# 🍕 PizzaHub — Premium Pizza Ordering & Delivery Platform

A full-featured pizza ordering platform built with **Next.js 16 (App Router)**, **TypeScript**, **ShadCN UI**, **Framer Motion**, **Better Auth** and **Stripe** — styled with an exclusive **Forest Noir × Champagne Gold × Warm Ivory** design system.

> **Assignment 9** — Role-based pizza platform for customers, restaurant (vendor) owners and admins.

---

## ✨ Features

### Public
- **Animated luxury homepage** — hero, featured items, category showcase, why-choose, customer testimonials, CTA banner
- **Browse Menu** — live **search**, **category filter**, **location filter** and **sorting** (price asc/desc, top rated, newest); every filter syncs to the URL query string so results are shareable
- **Item Details** — image gallery, vendor card with rating, description, delivery info, reviews & ratings section
- **Custom 404**, global error boundary, skeleton loading states, fully responsive, dark/light theme toggle

### Customers
- Order any approved item (delivery date + address + optional message) — with a **one active order per item per day** rule and vendor self-order prevention
- **My Orders** dashboard with a visual **order status timeline** and cancellation of pending orders
- **Favorites / wishlist** (heart any pizza)
- **Reviews & ratings** on items they have context for
- Profile settings (name + ImgBB avatar; role & plan intentionally locked)

### Vendors (Restaurant Owners)
- **Menu management** — create/update/delete items, ImgBB image upload, availability toggle (approved ⇄ inactive)
- **Admin moderation flow** — every new/updated item goes back to *Pending* until an admin approves it
- **Free vs Premium subscription** — Free plan is capped at **3 active items**; Premium ($9.99/mo) unlocks unlimited items + badge, paid via **Stripe Checkout**
- **Order handling** — accept or reject incoming orders (one-time decision), sales overview chart

### Admins
- **Manage Users** — search, role filter, block/unblock (blocked users lose all protected access)
- **Manage Menu Items** — review pending submissions, approve / reject / republish / delete
- **Transactions** — read-only Stripe subscription ledger
- Platform analytics dashboard (users, vendors, items, revenue, charts)

### Security & Roles
- Role guard on **both** layers: `src/proxy.ts` (Next 16's middleware successor) redirects unauthenticated users to sign-in, and the client `RequireAuth`/`DashboardGate` wrapper re-verifies identity + role — **you cannot open another role's dashboard by editing the URL**
- The authoritative role/ownership checks live on the API server (JWT session); the client never sends identity fields — sessions resolve the actor
- All destructive actions use confirmation dialogs; **no `alert()` anywhere — toasts only** (sonner)

---

## 🔐 Demo Accounts (mock mode)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pizzahub.com` | `Admin@123` |
| Vendor | `owner@slicetown.com` | `Vendor@123` |
| Customer | `rahim@example.com` | `Pass@123` |

The sign-in page has one-click prefill badges for these in mock mode.

---

## 🧰 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack, Cache Components) |
| Language | TypeScript (strict) |
| UI | ShadCN UI (radix-nova) + Tailwind CSS v4 + Framer Motion |
| Auth | Better Auth client (credentials + Google OAuth) with a mock fallback |
| Payments | Stripe Checkout (vendor subscription only — customer ordering is Stripe-free) |
| Uploads | ImgBB (menu photos & avatars) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Notifications | sonner toasts |

---

## 🚀 Getting Started

```bash
# 1. install
npm install

# 2. environment
cp .env.example .env.local   # then fill values

# 3. run
npm run dev                  # http://localhost:3000

# production
npm run build && npm start
```

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` → in-browser mock API; `false` → real Express API |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of `pizzahub-server` (default `http://localhost:5000`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth origin (defaults to API base) |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB key for image uploads |
| `NEXT_PUBLIC_APP_URL` | This app's origin (OAuth callbacks) |

`.env.local` is **never committed** (ignored by git); `.env.example` documents the shape.

**Live site:** _add your Vercel deployment URL here_

---

## 🧩 Challenges & Implementation Notes

### 1. Sorting / filtering via URL query parameters
`/browse-menu` keeps `?search=&category=&location=&sort=` in the URL:

- State → URL sync through a debounced `router.replace`, so typing never floods history
- URL → state on load (`useSearchParams`), making filtered views **shareable and bookmarkable**
- Sorting (`price-asc` / `price-desc` / `rating` / `newest`) is applied **server-side in the API layer** (`getMenuItems({ sort })`), not by re-sorting on the client — the same contract the Express backend must honour

### 2. JWT / session flow without `middleware.ts`
Next.js 16 **removed `middleware.ts`** in favour of `src/proxy.ts` (`export function proxy()`):

- `proxy.ts` runs on the edge for `/dashboard/*`, `/menu/*`, `/payment/*`, `/profile-settings/*` and checks for a session cookie (`better-auth.session_token` for real auth, `ph_mock_session` for the mock). No cookie → redirect to `/sign-in?next=…`
- After redirect, `next` is honoured so users land where they intended
- Cookie presence alone is **not** authorization — `AuthProvider` (Better Auth `useSession`) re-fetches the user, and `DashboardGate roles={[…]}` blocks other roles with an *Access Restricted* screen. The Express API (JWT in the session cookie) repeats every ownership/role check, so a spoofed client request fails server-side

### 3. Vendor cannot order own items
`createOrder` resolves the actor from the session, compares it with the item's `vendorId` and rejects with a clear error — the UI also disables the button and explains why.

### 4. One-time accept/reject & cancellation rules
Orders carry a `statusHistory` event log. `respondToOrder` only succeeds from `pending` (once), `cancelOrder` only from `pending`, and a **duplicate active order** (same item + delivery date) is rejected — all enforced in the API layer, surfaced through toasts.

### 5. Free-plan 3-item limit
`createMenuItem` counts the vendor's **active (approved)** items and blocks the 4th on the Free plan; the dashboard shows live usage and an upgrade CTA. Availability toggles let vendors swap which items stay active without deleting anything.

### 6. Stripe subscription (vendors only)
`createCheckoutSession` asks the server for a Checkout Session bound to the **session's** vendor id (never a client-supplied one). Success/cancel redirects go to `/payment/success` / `/payment/cancel`, and premium is only activated by the server-side **Stripe webhook** — the success page merely displays state.

### 7. Mock → Real API swap in one file
All data flows through `src/lib/api-client.ts`. With `NEXT_PUBLIC_USE_MOCK_DATA=false` each exported function calls `${API_BASE_URL}/api/…` with credentials; the mock implements the identical contract (shape + status codes + business rules) so the backend can be attached without touching any component.

### 8. Next 16 quirks handled
- `params` / `searchParams` are **async** — awaited inside `<Suspense>` so Cache Components can still prerender
- Runtime client hooks (`usePathname`) in layouts are Suspense-wrapped (partial prerendering)
- `new Date()` at render time is blocked during prerender — moved to module scope
- Image hosts whitelisted via `images.remotePatterns` (Unsplash, ImgBB, Google avatars)

---

## 📁 Structure

```
src/
├── app/
│   ├── (public)/        # navbar+footer shell: home, browse-menu, menu/[id], payment/*
│   ├── (auth)/          # dark minimal shell: sign-in, sign-up
│   ├── dashboard/       # role-guarded shell + per-role pages
│   ├── profile-settings/
│   ├── error.tsx · not-found.tsx · loading.tsx · icon.svg
├── components/          # layout · home · shared · auth · browse · details · dashboard · vendor · admin · profile · ui
├── lib/                 # api-client (mock↔real seam) · mock/data · auth · validation · imgbb · env · utils
├── config/constants.ts  # categories, locations, status meta, plan limits
├── types/index.ts       # domain types
└── proxy.ts             # Next 16 route guard
```

---

> Built with 🤎 as Assignment 9. Frontend only — pairs with the `pizzahub-server` Express + MongoDB backend.
