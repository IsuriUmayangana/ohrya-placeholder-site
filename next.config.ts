import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Load AWS SDK from node_modules at runtime (avoids Turbopack bundle resolution issues).
  serverExternalPackages: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
