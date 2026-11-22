/**
 * Central access to public environment variables.
 *
 * The frontend only ever needs ONE public variable:
 *   NEXT_PUBLIC_API_URL → the Render backend origin.
 *
 * Better Auth lives on that backend too, but the browser reaches it through
 * this app's own origin: next.config.ts rewrites `/api/auth/*` to
 * `${NEXT_PUBLIC_API_URL}/api/auth/*`. That keeps the session cookie
 * first-party — cross-site cookies between vercel.app and onrender.com are
 * blocked by browsers, which breaks `get-session` / `/api/auth/token` (401).
 *
 * Every secret (BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, MONGODB_URI,
 * STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, IMGBB_API_KEY, BETTER_AUTH_URL)
 * lives exclusively in the backend .env on Render — never here.
 */

/** Render API base URL without a trailing slash. Empty → in-app mock data. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

/**
 * Mock mode is derived from configuration, not a second flag:
 * no backend URL configured yet → demo with the in-browser mock database.
 */
export const USE_MOCK_DATA = API_BASE_URL === "";
