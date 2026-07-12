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

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
