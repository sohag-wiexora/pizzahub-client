"use client";

import { createAuthClient } from "better-auth/react";
import { AUTH_BASE_URL } from "@/lib/env";

/**
 * Better Auth client bound to the Express server (pizzahub-server).
 * The server owns the session cookie (httpOnly) and exposes the JWT plugin,
 * so nothing sensitive ever lives in the browser.
 *
 * In mock mode there is no backend URL yet — fall back to the current origin
 * so the client stays harmless (requests simply 401 until the API exists).
 */
export const authClient = createAuthClient({
  baseURL:
    AUTH_BASE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000"),
});

export const { useSession, signIn, signUp, signOut } = authClient;
