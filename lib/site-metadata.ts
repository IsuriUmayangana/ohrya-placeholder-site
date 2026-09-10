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

export const REFERRAL_OG_TITLE = "Join me on OHRYA";

export const MESSENGER_SHARE_OG_TITLE =
  "I'm in this with OHRYA — free to join, no donation. $2,500 prize + $2,500 to charity. Please click this text";

type ReferralLinkMetadataOptions = {
  forMessenger?: boolean;
};

export function buildReferralLinkMetadata(
  referralCode: string,
  options: ReferralLinkMetadataOptions = {}
): Pick<Metadata, "title" | "description" | "openGraph" | "twitter"> {
  const code = referralCode.trim();
  const ogImage = buildReferralShareOgImagePath(code);
  const description = REFERRAL_SHARE_MESSAGE.replace(/\n/g, " ");
  const title = options.forMessenger ? MESSENGER_SHARE_OG_TITLE : REFERRAL_OG_TITLE;
  const signupUrl = buildReferralSignupUrl(code);
  const pageUrl = options.forMessenger
    ? `${signupUrl}${signupUrl.includes("?") ? "&" : "?"}share=messenger`
    : signupUrl;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "OHRYA",
      title,
      description,
      url: pageUrl,
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
