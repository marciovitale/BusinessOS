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

  // Force a token refresh on every request and persist it onto `response`'s
  // cookies. Server Components/Actions later in this request only ever call
  // `getSession()` and can't set cookies themselves.
  //
  // `refresh: true` is required here, not optional: the SDK's own
  // "refresh if near expiry" check (the default when this flag is omitted)
  // looks ONLY at the ACCESS token's `expiresAt` — never the ID token's. The
  // ID token is what we forward to Supabase (Third-Party Auth), and Auth0
  // lets the two have different lifetimes. Once the ID token outlives its
  // own (shorter) expiry while the access token is still "fresh enough",
  // the SDK sees no reason to refresh, the ID token we send stays stale, and
  // every RLS-protected call starts returning 401 — silently, since the user
  // still "feels" logged in. Confirmed by reading getTokenSet() in the SDK:
  // `if (options.refresh || expiresAt === undefined || shouldRefresh)` only
  // computes `shouldRefresh` off the access token.
  try {
    await auth0.getAccessToken(request, response, { refresh: true });
  } catch (error) {
    console.error("[auth0] token refresh failed, forcing re-login:", error);
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
