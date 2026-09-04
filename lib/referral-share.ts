import { ensureAbsoluteReferralLink } from "@/lib/site-urls";

export const REFERRAL_SHARE_MESSAGE =
  "I'm in this with OHRYA. Free to join, no donation. If I bring the most people I get $2,500 and another $2,500 goes to charity. Use my link:";

/** @deprecated Use REFERRAL_SHARE_MESSAGE */
export const WHATSAPP_REFERRAL_MESSAGE = REFERRAL_SHARE_MESSAGE;

export function buildReferralShareText(referralLink: string): string {
  const absoluteLink = ensureAbsoluteReferralLink(referralLink);
  return `${REFERRAL_SHARE_MESSAGE}\n\n${absoluteLink}`;
}

export function buildSocialPostText(referralLink: string): string {
  return buildReferralShareText(referralLink);
}

export function buildWhatsAppShareText(referralLink: string): string {
  return buildReferralShareText(referralLink);
}

export function buildWhatsAppShareUrl(referralLink: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(buildReferralShareText(referralLink))}`;
}

/** Opens Facebook share dialog as a post with message + link preview (includes OHRYA logo). */
export function buildFacebookPostShareUrl(referralLink: string): string {
  const link = ensureAbsoluteReferralLink(referralLink);
  const params = new URLSearchParams({
    u: link,
    quote: REFERRAL_SHARE_MESSAGE,
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/** Opens LinkedIn compose post with pre-filled message and link. */
export function buildLinkedInPostShareUrl(referralLink: string): string {
  const params = new URLSearchParams({
    shareActive: "true",
    text: buildReferralShareText(referralLink),
  });
  return `https://www.linkedin.com/feed/?${params.toString()}`;
}

export function openSharePopup(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer,width=640,height=720");
}

export function shareReferralToFacebook(referralLink: string): { message: string } {
  openSharePopup(buildFacebookPostShareUrl(referralLink));
  return { message: "Facebook post opened with your referral message and link." };
}

export function shareReferralToLinkedIn(referralLink: string): { message: string } {
  openSharePopup(buildLinkedInPostShareUrl(referralLink));
  return { message: "LinkedIn post opened with your referral message and link." };
}

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isIosDevice(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openInstagramStoryCamera(): void {
  const storyTarget = isIosDevice()
    ? "instagram://story-camera"
    : "intent://story-camera/#Intent;scheme=instagram;package=com.instagram.android;end";

  if (isIosDevice()) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = storyTarget;
    document.body.appendChild(iframe);
    window.setTimeout(() => iframe.remove(), 1500);
  } else {
    window.open(storyTarget, "_blank");
  }
}

/** Copy referral text and open Instagram story flow (mobile) or instagram.com (desktop). */
export async function shareReferralToInstagramStory(
  referralLink: string
): Promise<{ copied: boolean; message: string }> {
  const text = buildReferralShareText(referralLink);
  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    copied = false;
  }

  if (isMobileDevice()) {
    openInstagramStoryCamera();
    return {
      copied,
      message: copied
        ? "Link copied — paste it as a link sticker in your Instagram story."
        : "Open Instagram and add your referral link as a story link sticker.",
    };
  }

  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  return {
    copied,
    message: copied
      ? "Link copied. Open Instagram on your phone and share it to your story."
      : "Open Instagram on your phone to share your link as a story.",
  };
}
