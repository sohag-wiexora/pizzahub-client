"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { PageLoader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types";

/**
 * Client-side route shield used by private pages.
 * - Unauthenticated  → redirect to /sign-in (with ?next= return path)
 * - Wrong role       → friendly forbidden state (server verifies again)
 * - Blocked account  → blocked screen, protected features stay closed
 */
export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || redirecting) return;
    if (!user) {
      setRedirecting(true);
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    } else if (roles && !roles.includes(user.role)) {
      setRedirecting(true);
      router.replace("/dashboard");
    }
  }, [user, isLoading, roles, pathname, redirecting, router]);

  if (isLoading || redirecting || !user) {
    return <PageLoader label="Checking your session…" />;
  }

  if (user.isBlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-300/60 bg-red-50 p-10 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <span className="flex size-14 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-300">
            <Ban className="size-7" />
          </span>
          <h1 className="font-heading text-2xl font-bold">Account Blocked</h1>
          <p className="text-sm text-muted-foreground">
            This account has been blocked by an administrator, so protected
            platform features are unavailable. Contact support if you believe
            this is a mistake.
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-gold/40 bg-card p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Ban className="size-7" />
          </span>
          <h1 className="font-heading text-2xl font-bold">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            This area is reserved for{" "}
            <strong className="text-foreground">
              {roles.join(" and ")}
            </strong>{" "}
            accounts. Redirecting you to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
