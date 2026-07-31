/** Navigate after signup — supports cross-subdomain redirect to form.ohrya.org. */
export function navigateAfterSignup(url: string, router: { replace: (href: string) => void }): void {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.location.replace(url);
    return;
  }
  router.replace(url);
}
