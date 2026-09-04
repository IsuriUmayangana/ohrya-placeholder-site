import { ensureAbsoluteReferralLink } from "@/lib/site-urls";

export const WHATSAPP_REFERRAL_MESSAGE =
  "I'm in this with OHRYA. Free to join, no donation. If I bring the most people I get $2,500 and another $2,500 goes to charity. Use my link:";

export function buildWhatsAppShareText(referralLink: string): string {
  const absoluteLink = ensureAbsoluteReferralLink(referralLink);
  // Blank line before URL helps WhatsApp detect it and attach a link preview card.
  return `${WHATSAPP_REFERRAL_MESSAGE}\n\n${absoluteLink}`;
}

export function buildWhatsAppShareUrl(referralLink: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(buildWhatsAppShareText(referralLink))}`;
}
