"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth/auth-client";
import { USE_MOCK_DATA } from "@/lib/env";
import { db, demoCredentials } from "@/lib/mock/data";
import type {
  AuthUser,
  ProfileUpdateInput,
  SignUpInput,
  UserRole,
} from "@/types";

/**
 * Authentication facade used everywhere in the UI.
 *
 * Real mode  → Better Auth (credentials + Google OAuth), cookie session.
 * Mock mode  → the same interface backed by localStorage so the whole app
 *              is demoable before the Express server is wired in.
 */

const MOCK_SESSION_KEY = "pizzahub:session";
const MOCK_COOKIE = "ph_mock_session";

export type AuthAction = { ok: boolean; message?: string };

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<AuthAction>;
  signInWithGoogle: () => Promise<AuthAction>;
  signUp: (input: SignUpInput) => Promise<AuthAction>;
  signOut: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<AuthAction>;
  demoAccounts: typeof demoCredentials;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readMockSession = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const writeMockSession = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    // Lightweight cookie so proxy.ts (Next 16 middleware) can guard routes.
    document.cookie = `${MOCK_COOKIE}=1; path=/; max-age=604800; samesite=lax`;
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
    document.cookie = `${MOCK_COOKIE}=; path=/; max-age=0`;
  }
  window.dispatchEvent(new Event("pizzahub:auth-changed"));
};

/** Seed password map for the demo accounts (mock mode only). */
const MOCK_PASSWORDS: Record<string, string> = Object.fromEntries(
  demoCredentials.map((c) => [c.email, c.password]),
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mockUser, setMockUser] = useState<AuthUser | null>(null);
  const [mockLoading, setMockLoading] = useState(true);

  const session = authClient.useSession();
  const realSession = session.data;
  const realLoading = session.isPending;

  const isMock = USE_MOCK_DATA;

  useEffect(() => {
    if (!isMock) return;
    setMockUser(readMockSession());
    setMockLoading(false);
    const listener = () => setMockUser(readMockSession());
    window.addEventListener("pizzahub:auth-changed", listener);
    return () => window.removeEventListener("pizzahub:auth-changed", listener);
  }, [isMock]);

  const user: AuthUser | null = useMemo(() => {
    if (isMock) return mockUser;
    const u = realSession?.user as
      | (Omit<AuthUser, "isBlocked" | "subscriptionPlan"> & {
          role?: UserRole;
          isBlocked?: boolean;
          subscriptionPlan?: string;
          businessName?: string;
        })
      | undefined;
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image ?? undefined,
      role: (u.role ?? "customer") as UserRole,
      isBlocked: Boolean(u.isBlocked),
      businessName: u.businessName,
      subscriptionPlan:
        (u.subscriptionPlan as AuthUser["subscriptionPlan"]) ?? "free",
      subscriptionExpiresAt: undefined,
    };
  }, [isMock, mockUser, realSession]);

  const mockSignIn = useCallback(
    (email: string, password: string): AuthAction => {
      const found = db.users().find((u) => u.email === email.toLowerCase());
      if (!found) return { ok: false, message: "No account found with this email." };
      if (found.isBlocked) {
        return {
          ok: false,
          message: "This account has been blocked. Contact support.",
        };
      }
      const expected = MOCK_PASSWORDS[found.email];
      if (!expected || expected !== password) {
        return { ok: false, message: "Incorrect email or password." };
      }
      writeMockSession({
        id: found.id,
        name: found.name,
        email: found.email,
        image: found.image,
        role: found.role,
        isBlocked: false,
        businessName: found.businessName,
        subscriptionPlan: found.subscriptionPlan,
        subscriptionExpiresAt: found.subscriptionExpiresAt,
      });
      return { ok: true };
    },
    [],
  );

  const handle = useCallback(
    async (
      action: () => Promise<{ error?: { message?: string } | null }>,
    ): Promise<AuthAction> => {
      const { error } = await action();
      return error
        ? { ok: false, message: error.message ?? "Something went wrong" }
        : { ok: true };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isMock,
      user,
      isLoading: isMock ? mockLoading : realLoading,
      isAdmin: user?.role === "admin",
      isVendor: user?.role === "vendor",
      isCustomer: user?.role === "customer",
      demoAccounts: demoCredentials,
      signIn: (email, password) =>
        isMock
          ? Promise.resolve(mockSignIn(email, password))
          : handle(() =>
              authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
              }),
            ),
      signInWithGoogle: () =>
        isMock
          ? Promise.resolve().then(() => {
              const google = db
                .users()
                .find((u) => u.email === "rahim@example.com");
              if (google) {
                writeMockSession({
                  id: google.id,
                  name: google.name,
                  email: google.email,
                  role: google.role,
                  isBlocked: false,
                  subscriptionPlan: google.subscriptionPlan,
                });
              }
              return { ok: true };
            })
          : handle(() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
              }),
            ),
      signUp: (input) => {
        if (isMock) {
          return Promise.resolve().then((): AuthAction => {
            if (db.users().some((u) => u.email === input.email.toLowerCase())) {
              return { ok: false, message: "This email is already registered." };
            }
            const newUser: AuthUser = {
              id: `u-${Date.now()}`,
              name: input.name,
              email: input.email.toLowerCase(),
              image: input.image,
              role: input.role,
              isBlocked: false,
              businessName: input.role === "vendor" ? input.businessName : undefined,
              subscriptionPlan: "free",
            };
            writeMockSession(newUser);
            return { ok: true };
          });
        }
        return handle(() =>
          authClient.signUp.email({
            name: input.name,
            email: input.email,
            password: input.password,
            image: input.image,
            callbackURL: "/dashboard",
            // extra PizzaHub profile fields — forwarded by Better Auth
            // to the server user model (role, vendor business name)
            role: input.role,
            businessName: input.businessName,
          } as Parameters<typeof authClient.signUp.email>[0]),
        );
      },
      signOut: async () => {
        if (isMock) {
          writeMockSession(null);
          return;
        }
        await authClient.signOut();
        session.refetch();
      },
      updateProfile: async (input) => {
        if (isMock) {
          if (!user) return { ok: false, message: "Not signed in" };
          const updated: AuthUser = {
            ...user,
            name: input.name ?? user.name,
            image: input.image ?? user.image,
          };
          writeMockSession(updated);
          return { ok: true };
        }
        return handle(() => authClient.updateUser(input));
      },
    }),
    [
      isMock,
      user,
      mockLoading,
      realLoading,
      demoCredentials,
      mockSignIn,
      handle,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
