import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Silences the Turbopack workspace root warning
  turbopack: {
    root: ".",
    resolveAlias: {
      "@/*": ["./src/*"]
    }
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // @ts-ignore - experimental property from Next.js 15+ warning
    allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  },
};

export default nextConfig;

