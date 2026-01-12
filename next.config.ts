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
};

export default nextConfig;

