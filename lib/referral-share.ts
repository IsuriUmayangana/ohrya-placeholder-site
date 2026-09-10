import { ensureAbsoluteReferralLink } from "@/lib/site-urls";

export const REFERRAL_SHARE_MESSAGE =
  "I'm in this with OHRYA. Free to join, no donation. If I bring the most people I get $2,500 and another\n$2,500 goes to charity. Use my link:";

/** @deprecated Use REFERRAL_SHARE_MESSAGE */
export const WHATSAPP_REFERRAL_MESSAGE = REFERRAL_SHARE_MESSAGE;

export function buildReferralShareText(referralLink: string): string {
  const absoluteLink = ensureAbsoluteReferralLink(referralLink);
  return `${REFERRAL_SHARE_MESSAGE}\n${absoluteLink}`;
}

export async function copyReferralShareText(referralLink: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildReferralShareText(referralLink));
    return true;
  } catch {
    return false;
  }
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

/** Opens Facebook Messenger send dialog with referral link preview (OHRYA logo + message). */
export function buildMessengerShareUrl(referralLink: string): string {
  const link = ensureAbsoluteReferralLink(referralLink);
  const redirectUri =
    typeof window !== "undefined" ? window.location.origin + "/" : link;
  const params = new URLSearchParams({
    link,
    redirect_uri: redirectUri,
    display: "popup",
  });
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  if (appId) params.set("app_id", appId);
  return `https://www.facebook.com/dialog/send?${params.toString()}`;
}

export function shareReferralToMessenger(referralLink: string): { message: string } {
  const link = ensureAbsoluteReferralLink(referralLink);

  if (isMobileDevice()) {
    window.location.href = `fb-messenger://share/?link=${encodeURIComponent(link)}`;
    return { message: "Opening Messenger — choose a friend to send your referral link." };
  }

  openSharePopup(buildMessengerShareUrl(referralLink));
  return { message: "Messenger opened — choose a friend to send your referral link." };
}
