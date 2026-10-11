import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  agentRules: false,
  // The work-host URL changes with every sandbox, so allow any host in the
  // OpenHands preview domain instead of pinning one ephemeral subdomain.
  allowedDevOrigins: ["*.prod-runtime.all-hands.dev"],
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
