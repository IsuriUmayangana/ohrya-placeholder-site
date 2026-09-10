import { ensureAbsoluteReferralLink } from "@/lib/site-urls";

export const REFERRAL_SHARE_MESSAGE =
  "I'm in this with OHRYA. Free to join, no donation. If I bring the most people I get $2,500 and another\n$2,500 goes to charity. Use my link:";

/** @deprecated Use REFERRAL_SHARE_MESSAGE */
export const WHATSAPP_REFERRAL_MESSAGE = REFERRAL_SHARE_MESSAGE;

export const MESSENGER_SHARE_CHANNEL = "messenger";

export function buildMessengerShareLink(referralLink: string): string {
  const url = new URL(ensureAbsoluteReferralLink(referralLink));
  url.searchParams.set("share", MESSENGER_SHARE_CHANNEL);
  return url.toString();
}

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

function buildReferralShareTextForMessenger(referralLink: string): string {
  return `${REFERRAL_SHARE_MESSAGE}\n${buildMessengerShareLink(referralLink)}`;
}

async function copyReferralShareTextForMessenger(referralLink: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildReferralShareTextForMessenger(referralLink));
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

/** Opens Facebook share dialog with referral link preview (OHRYA logo + message from OG tags). */
export function buildFacebookPostShareUrl(referralLink: string): string {
  const link = ensureAbsoluteReferralLink(referralLink);
  const params = new URLSearchParams({ u: link });
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

export async function shareReferralToFacebook(
  referralLink: string
): Promise<{ message: string; copied: boolean }> {
  const copied = await copyReferralShareText(referralLink);
  openSharePopup(buildFacebookPostShareUrl(referralLink));
  return {
    copied,
    message: copied
      ? "Referral message copied — paste it into your Facebook post above the link preview."
      : "Facebook post opened — paste your OHRYA referral message and link into the post.",
  };
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
  const link = buildMessengerShareLink(referralLink);
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

export async function shareReferralToMessenger(
  referralLink: string
): Promise<{ message: string; copied: boolean }> {
  const copied = await copyReferralShareTextForMessenger(referralLink);

  if (isMobileDevice()) {
    // Link-only share (fb-messenger://share) sends a preview card without your message text.
    // Copy the full message + URL, then open Messenger so the user can paste it into a chat.
    window.location.href = "fb-messenger://";
    return {
      copied,
      message: copied
        ? "Referral message copied — pick a friend in Messenger and paste to send."
        : "Opening Messenger — paste your OHRYA referral message into a chat.",
    };
  }

  openSharePopup(buildMessengerShareUrl(referralLink));
  return {
    copied,
    message: copied
      ? "Referral message copied — paste it into Messenger before sending the link preview."
      : "Messenger opened — paste your OHRYA referral message into the chat.",
  };
}
