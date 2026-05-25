import type { NextConfig } from "next";

const r2PublicHost = (() => {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { distDir: ".next-app" }),
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 100],
    remotePatterns: [
      ...(r2PublicHost
        ? [{ protocol: "https" as const, hostname: r2PublicHost }]
        : []),
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
