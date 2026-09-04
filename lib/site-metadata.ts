import type { Metadata } from "next";
import { REFERRAL_SHARE_MESSAGE } from "@/lib/referral-share";
import { MAIN_SITE_ORIGIN, buildReferralSignupUrl } from "@/lib/site-urls";

const SITE_ORIGIN = MAIN_SITE_ORIGIN || "https://ohrya.org";

export const siteMetadataBase = new URL(SITE_ORIGIN);

const OG_IMAGE = {
  url: "/og/ohrya-referral-share.png",
  width: 1200,
  height: 630,
  alt: "OHRYA — Give • Vote • Shine",
};

/** OG image for ?ref= links — static PNG for WhatsApp/Facebook crawlers. */
export function buildReferralShareOgImagePath(_referralCode?: string): string {
  return "/og/ohrya-referral-share.png";
}

export function buildReferralLinkMetadata(referralCode: string): Pick<Metadata, "title" | "description" | "openGraph" | "twitter"> {
  const code = referralCode.trim();
  const ogImage = buildReferralShareOgImagePath(code);
  const description = REFERRAL_SHARE_MESSAGE.replace(/\n/g, " ");
  const title = "Join me on OHRYA";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "OHRYA",
      title,
      description,
      url: buildReferralSignupUrl(code),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "OHRYA — Give • Vote • Shine",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "OHRYA — Give • Vote • Shine",
    description:
      "Free to join, no donation. Climb the leaderboard and help create meaningful change.",
    images: [OG_IMAGE.url],
  },
};
