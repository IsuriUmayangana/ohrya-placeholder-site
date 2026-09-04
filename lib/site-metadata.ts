import type { Metadata } from "next";
import { MAIN_SITE_ORIGIN } from "@/lib/site-urls";

const SITE_ORIGIN = MAIN_SITE_ORIGIN || "https://ohrya.org";

export const siteMetadataBase = new URL(SITE_ORIGIN);

export const sharedSiteMetadata: Metadata = {
  metadataBase: siteMetadataBase,
  title: {
    default: "OHRYA",
    template: "%s | OHRYA",
  },
  description:
    "Join an OHRYA campaign, spread the word, and be rewarded for the impact you create.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OHRYA",
    title: "OHRYA — Give • Vote • Shine",
    description:
      "Free to join, no donation. Climb the leaderboard and help create meaningful change.",
    url: SITE_ORIGIN,
  },
  twitter: {
    card: "summary_large_image",
    title: "OHRYA — Give • Vote • Shine",
    description:
      "Free to join, no donation. Climb the leaderboard and help create meaningful change.",
  },
};
