/** Public form subdomain — referral success page and referral links. */
export const FORM_ORIGIN =
  process.env.NEXT_PUBLIC_FORM_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "" : "https://form.ohrya.org");

/** Main marketing site — landing page and signup. */
export const MAIN_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_MAIN_SITE_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "" : "https://www.ohrya.org");

export function formReferralUrl(params: URLSearchParams): string {
  const path = `/referral?${params.toString()}`;
  return FORM_ORIGIN ? `${FORM_ORIGIN}${path}` : path;
}
