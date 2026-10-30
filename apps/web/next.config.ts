import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@local-services/ui", "@local-services/types"],
  experimental: {
    optimizePackageImports: ["@local-services/ui"],
  },
  // Rewrites are handled by vercel.json in production
  // Only use local rewrites in development
  async rewrites() {
    const gateway = process.env.API_GATEWAY_ORIGIN || "http://localhost";
    return [{ source: "/api/:path*", destination: `${gateway}/api/:path*` }];
  },
};

export default nextConfig;
