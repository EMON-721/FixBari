import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_KEY = "fixbari_admin_access_token";
const ALLOWED_ROLE = "ADMIN";
const protectedPaths = ["/", "/bookings", "/services", "/technicians", "/users", "/settings", "/requests", "/analytics", "/transactions", "/reports", "/notifications", "/help"];
function isProtected(pathname: string) {
  return protectedPaths.some(path => path === "/" ? pathname === "/" : (pathname === path || pathname.startsWith(path + "/")));
}
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!isProtected(pathname)) return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const origin = (process.env.AUTH_SERVICE_ORIGIN || "").trim();
  if (!/^https:\/\/[^/]+$/.test(origin)) {
    // Never authorize access using an unverified decoded JWT.
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    const response = await fetch(origin + "/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.redirect(new URL("/login", request.url));
    const user = await response.json();
    if (user.role !== ALLOWED_ROLE) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
    return NextResponse.next();
  } catch {
    // Fail closed while authentication infrastructure is unavailable.
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = {
  matcher: ["/", "/bookings/:path*", "/services/:path*", "/technicians/:path*", "/users/:path*", "/settings/:path*", "/requests/:path*", "/analytics/:path*", "/transactions/:path*", "/reports/:path*", "/notifications/:path*", "/help/:path*"],
};
