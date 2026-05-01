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
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME ?? "",
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL ?? "",
    TEST_OTP_CODE: process.env.TEST_OTP_CODE ?? "",
    AWS_REGION: process.env.AWS_REGION ?? "us-east-1",
  },
};

export default nextConfig;
