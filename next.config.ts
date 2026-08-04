import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
