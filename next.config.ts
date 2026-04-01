import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed restrictive CSP headers that were blocking YouTube iframes
  reactStrictMode: false,
};

export default nextConfig;
