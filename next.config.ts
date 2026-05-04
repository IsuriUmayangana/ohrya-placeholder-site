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
  // Embed these server-side env vars into the build so they are available
  // in Amplify SSR Lambda functions at runtime.
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "",
  },
};

export default nextConfig;
