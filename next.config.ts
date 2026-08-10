import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Load AWS SDK from node_modules at runtime (avoids Turbopack bundle resolution issues).
  serverExternalPackages: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
  async redirects() {
    return [
      {
        source: "/splash/privacy-policy.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/splash/terms-of-service.html",
        destination: "/terms-of-service",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
    ],
  },
  // Embed these server-side env vars into the build so they are available
  // in Amplify SSR Lambda functions at runtime.
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "",
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME ?? "",
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL ?? "",
    OHRYA_AWS_KEY_ID: process.env.OHRYA_AWS_KEY_ID ?? "",
    OHRYA_AWS_SECRET: process.env.OHRYA_AWS_SECRET ?? "",
    IG_USER_ID: process.env.IG_USER_ID ?? "",
    IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN ?? "",
  },
};

export default nextConfig;
