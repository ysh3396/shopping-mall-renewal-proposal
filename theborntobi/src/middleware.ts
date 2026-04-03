import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect storefront routes — cookie existence only (no JWT decode per CLAUDE.md)
  // Auth pages (/auth/*) are excluded via matcher, so they remain accessible
  if (!pathname.startsWith("/admin")) {
    const customerToken =
      request.cookies.get("customer-session-token")?.value ||
      request.cookies.get("__Secure-customer-session-token")?.value;

    if (!customerToken) {
      const gateUrl = new URL("/auth/gate", request.url);
      return NextResponse.redirect(gateUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next|api|auth|favicon\\.ico|images|.*\\.).*)",
  ],
};
