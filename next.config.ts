import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beyondgaming.in",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
