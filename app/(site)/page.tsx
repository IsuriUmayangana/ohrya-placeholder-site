import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";
import SplashLandingPage from "@/components/splash/SplashLandingPage";

export const metadata: Metadata = {
  title: "OHRYA - Create Meaningful Change",
  description:
    "Join an OHRYA campaign, spread the word, and be rewarded for the impact you create.",
};

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <SplashLandingPage />
    </Suspense>
  );
}
