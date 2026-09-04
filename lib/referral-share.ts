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

export function buildReferralShareImageUrl(
  referralCode: string,
  format: "post" | "story" = "post"
): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://ohrya.org";
  const params = new URLSearchParams({
    ref: referralCode,
    format,
  });
  return `${base}/api/referral-share-image?${params.toString()}`;
}

async function fetchReferralShareImageFile(
  referralCode: string,
  format: "post" | "story" = "post"
): Promise<File | null> {
  try {
    const response = await fetch(buildReferralShareImageUrl(referralCode, format));
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], "ohrya-referral.png", { type: "image/png" });
  } catch {
    return null;
  }
}

async function tryNativeShareWithImage(
  referralLink: string,
  referralCode: string,
  format: "post" | "story" = "post"
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;

  const file = await fetchReferralShareImageFile(referralCode, format);
  if (!file) return false;

  const shareData: ShareData = {
    text: buildReferralShareText(referralLink),
    url: ensureAbsoluteReferralLink(referralLink),
    files: [file],
  };

  if (navigator.canShare && !navigator.canShare(shareData)) return false;

  try {
    await navigator.share(shareData);
    return true;
  } catch {
    return false;
  }
}

export async function downloadReferralShareImage(
  referralCode: string,
  format: "post" | "story" = "post"
): Promise<boolean> {
  try {
    const file = await fetchReferralShareImageFile(referralCode, format);
    if (!file) return false;

    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = format === "story" ? "ohrya-referral-story.png" : "ohrya-referral-post.png";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}

/** Opens Facebook share dialog as a post with message + link preview. */
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

export async function shareReferralToFacebook(
  referralLink: string,
  referralCode: string
): Promise<{ message: string }> {
  if (await tryNativeShareWithImage(referralLink, referralCode, "post")) {
    return { message: "Shared with OHRYA logo image." };
  }

  const saved = await downloadReferralShareImage(referralCode, "post");
  openSharePopup(buildFacebookPostShareUrl(referralLink));

  return {
    message: saved
      ? "Facebook post opened — add the saved OHRYA image to your post. The link will show the logo preview too."
      : "Facebook post opened — your link will show the OHRYA logo preview.",
  };
}

export async function shareReferralToLinkedIn(
  referralLink: string,
  referralCode: string
): Promise<{ message: string }> {
  if (await tryNativeShareWithImage(referralLink, referralCode, "post")) {
    return { message: "Shared with OHRYA logo image." };
  }

  const saved = await downloadReferralShareImage(referralCode, "post");
  openSharePopup(buildLinkedInPostShareUrl(referralLink));

  return {
    message: saved
      ? "LinkedIn post opened — add the saved OHRYA image to your post. The link will show the logo preview too."
      : "LinkedIn post opened — your link will show the OHRYA logo preview.",
  };
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

/** Copy referral text and share branded story image when possible. */
export async function shareReferralToInstagramStory(
  referralLink: string,
  referralCode: string
): Promise<{ copied: boolean; message: string }> {
  const text = buildReferralShareText(referralLink);
  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    copied = false;
  }

  if (await tryNativeShareWithImage(referralLink, referralCode, "story")) {
    return {
      copied,
      message: "Shared OHRYA story image — add your link sticker in Instagram if needed.",
    };
  }

  const saved = await downloadReferralShareImage(referralCode, "story");

  if (isMobileDevice()) {
    openInstagramStoryCamera();
    return {
      copied,
      message: saved
        ? "Story image saved — upload it in Instagram and add your link as a sticker."
        : copied
          ? "Link copied — paste it as a link sticker in your Instagram story."
          : "Open Instagram and add your referral link as a story link sticker.",
    };
  }

  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  return {
    copied,
    message: saved
      ? "Story image saved. Open Instagram on your phone to share it to your story."
      : copied
        ? "Link copied. Open Instagram on your phone and share it to your story."
        : "Open Instagram on your phone to share your link as a story.",
  };
}
