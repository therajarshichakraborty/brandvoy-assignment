import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only when building inside Docker.
  // Vercel requires the standard build layout; standalone breaks it.
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.entitysport.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
