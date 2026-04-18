import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-app",
  outputFileTracingRoot: process.cwd(),
  images: {
    qualities: [75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
