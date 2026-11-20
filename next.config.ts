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
