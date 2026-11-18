/**
 * Central access to public environment variables.
 * Values live in `.env.local` (never committed). See `.env.example`.
 */

/** When true (default until the server is wired) every API call is served by the in-app mock layer. */
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Base URL of the Express API (pizzahub-server), without trailing slash. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

/** Better Auth server origin — usually the same as API_BASE_URL. */
export const AUTH_BASE_URL = (
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? API_BASE_URL
).replace(/\/$/, "");

/** ImgBB API key for menu-item image uploads (safe for browser use). */
export const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";

export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
