"use client";

import { createAuthClient } from "better-auth/react";
import { AUTH_BASE_URL } from "@/lib/env";

/**
 * Better Auth client bound to the Express server (pizzahub-server).
 * The server owns the session cookie (httpOnly) and exposes the JWT plugin,
 * so nothing sensitive ever lives in the browser.
 */
export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
