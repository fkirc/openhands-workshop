import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  agentRules: false,
  allowedDevOrigins: [
    "work-1-xbvjadjarafueilw.prod-runtime.all-hands.dev",
    "work-2-xbvjadjarafueilw.prod-runtime.all-hands.dev",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
