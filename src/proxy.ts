import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 route guard (the successor of middleware.ts).
 *
 * It performs a cheap cookie presence check so unauthenticated visitors
 * never even render a private page. Full identity + role verification
 * happens again on the client and (authoritatively) on the Express API.
 *
 * Recognised session cookies:
 *  - better-auth.session_token          → real Better Auth session (http/dev)
 *  - __Secure-better-auth.session_token → real session over HTTPS
 *    (Better Auth prefixes secure cookies with `__Secure-`, which is what
 *    production/Vercel uses — checking only the unprefixed name caused an
 *    endless /dashboard → /sign-in redirect loop)
 *  - ph_mock_session                    → mock session used before the API is wired
 *
 * The auth endpoints are proxied through this origin (see next.config.ts), so
 * the Better Auth cookie is first-party and actually visible here.
 */

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "ph_mock_session",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile-settings",
  "/payment",
  "/menu",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const authenticated = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );
  if (authenticated) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  url.search = `next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile-settings/:path*",
    "/payment/:path*",
    "/menu/:path*",
  ],
};
