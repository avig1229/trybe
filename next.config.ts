import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Silences the Turbopack workspace root warning
  turbopack: {
    resolveAlias: {
      "@/*": ["./src/*"]
    }
  }
};

export default nextConfig;
