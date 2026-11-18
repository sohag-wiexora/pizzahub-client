import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 route guard (the successor of middleware.ts).
 *
 * It performs a cheap cookie presence check so unauthenticated visitors
 * never even render a private page. Full identity + role verification
 * happens again on the client and (authoritatively) on the Express API.
 *
 * Recognised session cookies:
 *  - better-auth.session_token → real Better Auth session
 *  - ph_mock_session           → mock session used before the API is wired
 */

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

  const authenticated =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("ph_mock_session");
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
