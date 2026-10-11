import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  agentRules: false,
  allowedDevOrigins: [
    "work-1-tsqcamkumnqwrgvg.prod-runtime.all-hands.dev",
    "work-2-tsqcamkumnqwrgvg.prod-runtime.all-hands.dev",
  ],
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
