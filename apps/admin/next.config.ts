import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@local-services/ui", "@local-services/types"],
  experimental: {
    optimizePackageImports: ["@local-services/ui"],
  },
  // Auth uses a protected server route. Other backend services are only
  // reachable when a real HTTPS API gateway is explicitly configured.
  async rewrites() {
    const configured = (process.env.API_GATEWAY_ORIGIN || "").trim();
    if (!configured) return [];
    let target: URL;
    try { target = new URL(configured); } catch { return []; }
    const loopback = process.env.NODE_ENV !== "production" &&
      target.protocol === "http:" && ["localhost", "127.0.0.1"].includes(target.hostname);
    if ((target.protocol !== "https:" && !loopback) ||
        target.username || target.password || target.pathname !== "/" ||
        target.search || target.hash) return [];
    return ["orders", "services", "notifications"].map(service => ({
      source: `/api/${service}/:path*`,
      destination: `${target.origin}/api/${service}/:path*`,
    }));
  },
};

export default nextConfig;
