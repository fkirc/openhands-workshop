import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  agentRules: false,
  allowedDevOrigins: [
    "work-1-xbvjadjarafueilw.prod-runtime.all-hands.dev",
    "work-2-xbvjadjarafueilw.prod-runtime.all-hands.dev",
    "work-1-rlykyoueutylhqtr.prod-runtime.all-hands.dev",
    "work-2-rlykyoueutylhqtr.prod-runtime.all-hands.dev",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/danube-temp",
        destination:
          "https://www.wien.gv.at/assets/sonderloesungen/wassertemperatur/wassertemperatur.xml",
      },
    ];
  },
};

export default nextConfig;
