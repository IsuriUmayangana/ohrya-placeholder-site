/** Navigate after signup — relative paths stay on current host; absolute URLs cross domains. */
export function navigateAfterSignup(url: string, router: { replace: (href: string) => void }): void {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.location.replace(url);
    return;
  }
  router.replace(url);
}
