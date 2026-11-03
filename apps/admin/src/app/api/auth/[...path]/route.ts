import { NextRequest, NextResponse } from "next/server";

// This role-restricted Next.js portal is not the Auth service. Requests are proxied
// only to an explicitly configured, trusted backend origin. Never create mock
// accounts or accept passwords when persistent authentication is unavailable.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

function unavailable() {
  return NextResponse.json(
    {
      code: "AUTH_SERVICE_UNAVAILABLE",
      message:
        "Sign-in is temporarily unavailable. The FixBari authentication server is not connected.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

function backendUrl(segments: string[], search: string): URL | null {
  const configured = (
    process.env.AUTH_SERVICE_ORIGIN || process.env.API_GATEWAY_ORIGIN || ""
  ).trim();

  if (!configured) return null;
  let base: URL;
  try {
    base = new URL(configured);
  } catch {
    return null;
  }

  // In production all credentials must travel over HTTPS.
  const loopback =
    process.env.NODE_ENV !== "production" &&
    (base.hostname === "localhost" || base.hostname === "127.0.0.1");
  if (base.protocol !== "https:" && !(loopback && base.protocol === "http:")) {
    return null;
  }
  if (base.username || base.password || base.search || base.hash || base.pathname !== "/") {
    return null;
  }
  if (!segments.length || segments.some(segment => !/^[A-Za-z0-9_-]{1,128}$/.test(segment))) {
    return null;
  }

  const target = new URL(`/api/auth/${segments.join("/")}`, base);
  target.search = search;
  return target;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const target = backendUrl(path, request.nextUrl.search);

  if (!target) return unavailable();

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  try {
    const headers = new Headers({ Accept: "application/json" });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const authorization = request.headers.get("authorization");
    if (authorization) headers.set("Authorization", authorization);

    const upstream = await fetch(target.toString(), {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      return NextResponse.json(
        { code: "AUTH_GATEWAY_ERROR", message: "The authentication service returned an unexpected redirect." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const type = upstream.headers.get("content-type") || "";
    if (!type.includes("application/json")) {
      return NextResponse.json(
        {
          code: "AUTH_GATEWAY_ERROR",
          message: "The authentication service did not return a valid API response. Please try again later.",
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    // No exception details, submitted credentials, or internal hosts are logged.
    return unavailable();
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}
