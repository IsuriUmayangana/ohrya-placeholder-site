/** Canonical public site — used for shared referral links (?ref=) and Open Graph. */
export const DEFAULT_PUBLIC_ORIGIN = "https://ohrya.org";

function normalizeOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}

/** Main marketing site — landing page and signup. */
export const MAIN_SITE_ORIGIN =
  normalizeOrigin(process.env.NEXT_PUBLIC_MAIN_SITE_ORIGIN) ?? DEFAULT_PUBLIC_ORIGIN;

/** Referral success page origin (post-signup /referral route) in production builds. */
export const FORM_ORIGIN =
  normalizeOrigin(process.env.NEXT_PUBLIC_FORM_ORIGIN) ?? MAIN_SITE_ORIGIN;

/** Shared signup links (?ref=) — always the live public site for WhatsApp/social. */
export const REFERRAL_SIGNUP_ORIGIN =
  normalizeOrigin(process.env.NEXT_PUBLIC_REFERRAL_SIGNUP_ORIGIN) ?? DEFAULT_PUBLIC_ORIGIN;

export function buildReferralSignupUrl(referralCode: string): string {
  const origin = REFERRAL_SIGNUP_ORIGIN || DEFAULT_PUBLIC_ORIGIN;
  return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * URL for the post-signup referral page.
 * In the browser, stays on the current host (localhost when testing locally).
 */
export function formReferralUrl(params: URLSearchParams): string {
  const path = `/referral?${params.toString()}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  if (process.env.NODE_ENV === "development") {
    return path;
  }
  const origin = FORM_ORIGIN || DEFAULT_PUBLIC_ORIGIN;
  return `${origin}${path}`;
}

/** Guard against relative links in external shares (WhatsApp requires https://). */
export function ensureAbsoluteReferralLink(referralLink: string): string {
  const trimmed = referralLink.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = REFERRAL_SIGNUP_ORIGIN || DEFAULT_PUBLIC_ORIGIN;
  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}

/** Canonical ohrya.org origin for user-facing links (never dashboard.* subdomains). */
export function getPublicSiteOrigin(): string {
  return MAIN_SITE_ORIGIN || DEFAULT_PUBLIC_ORIGIN;
}

export function buildAbsoluteSiteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteOrigin()}${normalizedPath}`;
}

export function buildDashboardUrl(slug: string): string {
  return buildAbsoluteSiteUrl(`/dashboard/${encodeURIComponent(slug)}`);
}

export function buildMyDashboardUrl(email?: string): string {
  const url = new URL(buildAbsoluteSiteUrl("/dashboard"));
  const trimmedEmail = email?.trim();
  if (trimmedEmail) {
    url.searchParams.set("email", trimmedEmail);
  }
  return url.toString();
}

export function buildLeaderboardUrl(): string {
  return buildAbsoluteSiteUrl("/leaderboard");
}
