import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Instant-navigation insights are noisy for fully client-rendered pages
    // (e.g. the dashboard) that cannot opt in via `export const instant`.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backend = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
    if (!backend) return [];

    return {
      // Better Auth is hosted by the Express backend, but the browser must
      // reach it through THIS origin (`/api/auth/*`). Otherwise the session
      // cookie belongs to the backend's domain (…onrender.com) and becomes a
      // third-party cookie on the client domain (…vercel.app) — Chrome blocks
      // those, so `get-session` / `/api/auth/token` return 401 even after a
      // successful sign-in. Proxying keeps the cookie first-party.
      beforeFiles: [
        {
          source: "/api/auth/:path*",
          destination: `${backend}/api/auth/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      // Verified Unsplash photography used by the mock dataset
      { protocol: "https", hostname: "images.unsplash.com" },
      // ImgBB-hosted uploads (menu items & avatars)
      { protocol: "https", hostname: "i.ibb.co" },
      // Google OAuth avatars resolved by Better Auth
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
