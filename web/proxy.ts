import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

// Paths that must stay reachable without a session: Auth0's own SDK routes
// (/auth/login, /auth/callback, ...) and our API routes, which return proper
// status codes instead of redirects when unauthenticated.
const PUBLIC_PREFIXES = ["/auth", "/api"];

export async function proxy(request: NextRequest) {
  const response = await auth0.middleware(request);

  if (PUBLIC_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return response;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  // Silently refresh the token set (access + ID token) when near/at expiry and
  // persist it onto `response`'s cookies. Server Components/Actions later in
  // this request only ever call `getSession()` and can't set cookies
  // themselves — without this, the ID token we forward to Supabase (Third-
  // Party Auth) goes stale, and every RLS-protected call starts returning 401
  // once it expires, even though the user still "feels" logged in.
  try {
    await auth0.getAccessToken(request, response);
  } catch (error) {
    console.error("[auth0] token refresh failed, forcing re-login:", error);
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
