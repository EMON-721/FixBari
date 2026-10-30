import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_KEY = "fixbari_access_token";
const ALLOWED_ROLE = "CUSTOMER";

const protectedPaths = ["/dashboard"];
const publicOnlyPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

function decodeJwtPayload(
  token: string
): { sub: string; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Payload = parts[1];
    if (!base64Payload) return null;
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isPublicOnlyPath = publicOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  const payload = token ? decodeJwtPayload(token) : null;
  const isAuthenticated = !!payload;
  const userRole = payload?.role;

  if (isProtectedPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== ALLOWED_ROLE) {
      const accessDeniedUrl = new URL("/access-denied", request.url);
      return NextResponse.redirect(accessDeniedUrl);
    }
  }

  if (isPublicOnlyPath && isAuthenticated && userRole === ALLOWED_ROLE) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
