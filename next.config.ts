import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fix Next.js Hot Reloading / Fast Refresh on Linux & paths with spaces
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800, // Actively poll file modification timestamps every 800ms
        aggregateTimeout: 300, // Debounce rebuild after file change
        ignored: ["**/node_modules", "**/.git", "**/.next"],
      };
    }
    return config;
  },
};

export default nextConfig;
