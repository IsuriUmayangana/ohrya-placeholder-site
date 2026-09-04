import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";
import SplashLandingPage from "@/components/splash/SplashLandingPage";
import { sharedSiteMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = {
  ...sharedSiteMetadata,
  title: "OHRYA - Create Meaningful Change",
  openGraph: {
    ...sharedSiteMetadata.openGraph,
    title: "OHRYA - Create Meaningful Change",
    description:
      "I'm in this with OHRYA. Free to join, no donation. Climb the leaderboard and help create meaningful change.",
  },
  twitter: {
    ...sharedSiteMetadata.twitter,
    title: "OHRYA - Create Meaningful Change",
    description:
      "I'm in this with OHRYA. Free to join, no donation. Climb the leaderboard and help create meaningful change.",
  },
};

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <SplashLandingPage />
    </Suspense>
  );
}
