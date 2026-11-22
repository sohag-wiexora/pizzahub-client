"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client.
 *
 * The auth server lives on the Express backend, but the browser talks to it
 * through this app's own origin: next.config.ts rewrites `/api/auth/*` to the
 * backend. That keeps the session cookie first-party.
 *
 * Calling the backend origin directly (e.g. …onrender.com from …vercel.app)
 * would make the cookie a third-party cookie, which modern browsers block —
 * `get-session` and `/api/auth/token` then answer 401 even right after a
 * successful sign-in, and the dashboard guard bounces the user back.
 */
const fallbackBaseURL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const authClient = createAuthClient({
  // In the browser always use the current origin, so cookies stay first-party.
  baseURL:
    typeof window !== "undefined" ? window.location.origin : fallbackBaseURL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
