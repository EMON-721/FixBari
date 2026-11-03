import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@local-services/ui", "@local-services/types"],
  experimental: {
    optimizePackageImports: ["@local-services/ui"],
  },
  // The customer Auth API uses its own fail-closed Next.js route.
  // Rewrite other service calls only when a real gateway has been configured.
  async rewrites() {
    const origin = (process.env.API_GATEWAY_ORIGIN || "").trim();
    if (!origin) return [];

    let gateway: URL;
    try {
      gateway = new URL(origin);
    } catch {
      return [];
    }
    const isDevelopmentLoopback =
      process.env.NODE_ENV !== "production" &&
      gateway.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(gateway.hostname);

    if (
      (gateway.protocol !== "https:" && !isDevelopmentLoopback) ||
      gateway.username ||
      gateway.password ||
      gateway.search ||
      gateway.hash ||
      gateway.pathname !== "/"
    ) return [];

    const services = ["services", "orders", "notifications", "payment"];
    return services.map(service => ({
      source: `/api/${service}/:path*`,
      destination: `${gateway.origin}/api/${service}/:path*`,
    }));
  },
};

export default nextConfig;
