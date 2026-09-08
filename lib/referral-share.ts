import { ensureAbsoluteReferralLink } from "@/lib/site-urls";

export const REFERRAL_SHARE_MESSAGE =
  "I'm in this with OHRYA. Free to join, no donation. If I bring the most people I get $2,500 and another\n$2,500 goes to charity. Use my link:";

/** @deprecated Use REFERRAL_SHARE_MESSAGE */
export const WHATSAPP_REFERRAL_MESSAGE = REFERRAL_SHARE_MESSAGE;

const STORY_IMAGE_FALLBACK_PATH = "/referral-social-share/OHRYA.jpg";

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

export function extractReferralCodeFromLink(referralLink: string): string | null {
  try {
    const url = new URL(ensureAbsoluteReferralLink(referralLink));
    const code = url.searchParams.get("ref")?.trim();
    if (code) return code;
  } catch {
    // fall through to regex
  }
  const match = referralLink.match(/[?&]ref=([^&]+)/i);
  return match ? decodeURIComponent(match[1]).trim() : null;
}

export function buildReferralStoryImageUrl(referralCode: string): string {
  const code = referralCode.trim();
  const params = new URLSearchParams({ ref: code, format: "story" });
  return `/api/referral-share-image?${params.toString()}`;
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

async function fetchReferralStoryImageBlob(referralCode: string): Promise<Blob | null> {
  try {
    const response = await fetch(buildReferralStoryImageUrl(referralCode));
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 0) return blob;
    }
  } catch {
    // try static fallback below
  }

  try {
    const fallback = await fetch(STORY_IMAGE_FALLBACK_PATH);
    if (fallback.ok) {
      const blob = await fallback.blob();
      if (blob.size > 0) return blob;
    }
  } catch {
    return null;
  }

  return null;
}

function downloadStoryImage(blob: Blob, referralCode: string): void {
  const ext = blob.type.includes("jpeg") ? "jpg" : "png";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ohrya-referral-${referralCode.toLowerCase()}-story.${ext}`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareStoryImageNative(
  blob: Blob,
  referralLink: string
): Promise<boolean> {
  if (typeof navigator.share !== "function") return false;

  const file = new File([blob], "ohrya-referral-story.png", { type: blob.type || "image/png" });
  const shareData: ShareData = {
    files: [file],
    title: "Join me on OHRYA",
    text: ensureAbsoluteReferralLink(referralLink),
  };

  if (navigator.canShare && !navigator.canShare(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw err;
    }
    return false;
  }
}

export type InstagramStoryShareResult = {
  copied: boolean;
  sharedImage: boolean;
  message: string;
};

/**
 * Builds a story image (message + link), then shares it to Instagram Stories when possible.
 * Instagram does not allow websites to post stories directly — we open the native share sheet
 * or save the story card so the user can add it in Instagram.
 */
export async function shareReferralToInstagramStory(
  referralLink: string,
  referralCode?: string
): Promise<InstagramStoryShareResult> {
  const code = referralCode?.trim() || extractReferralCodeFromLink(referralLink) || "";
  const absoluteLink = ensureAbsoluteReferralLink(referralLink);
  let copied = false;

  try {
    await navigator.clipboard.writeText(buildReferralShareText(referralLink));
    copied = true;
  } catch {
    copied = false;
  }

  const storyBlob = code ? await fetchReferralStoryImageBlob(code) : null;

  if (storyBlob) {
    try {
      const shared = await shareStoryImageNative(storyBlob, referralLink);
      if (shared) {
        return {
          copied,
          sharedImage: true,
          message:
            "Choose Instagram Stories, then add a link sticker and paste your referral link.",
        };
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { copied, sharedImage: false, message: "Share cancelled." };
      }
    }

    downloadStoryImage(storyBlob, code || "story");
  }

  if (isMobileDevice()) {
    window.setTimeout(() => openInstagramStoryCamera(), storyBlob ? 400 : 0);
    return {
      copied,
      sharedImage: Boolean(storyBlob),
      message: storyBlob
        ? copied
          ? "Story image saved — in Instagram, pick it from your photos and add a link sticker with your copied link."
          : "Story image saved — add it in Instagram Stories and paste your referral link as a link sticker."
        : copied
          ? "Link copied — paste it as a link sticker in your Instagram story."
          : "Open Instagram and add your referral link as a story link sticker.",
    };
  }

  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  return {
    copied,
    sharedImage: Boolean(storyBlob),
    message: storyBlob
      ? copied
        ? `Story image downloaded. On your phone, open Instagram → Story → add the image, then paste this link: ${absoluteLink}`
        : "Story image downloaded. Open Instagram on your phone and add it to your story."
      : copied
        ? "Link copied. Open Instagram on your phone and share it to your story."
        : "Open Instagram on your phone to share your link as a story.",
  };
}
