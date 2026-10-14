/** reCAPTCHA v3 (invisible) — browser only. */

export function getRecaptchaSiteKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
  return key || undefined;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.grecaptcha?.execute) {
    return new Promise((resolve) => window.grecaptcha!.ready(() => resolve()));
  }

  const existing = document.querySelector<HTMLScriptElement>('script[src*="google.com/recaptcha/api.js"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      const done = () => window.grecaptcha?.ready(() => resolve());
      if (window.grecaptcha) done();
      else existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => window.grecaptcha!.ready(() => resolve());
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
}

/** Returns a token when configured; undefined when reCAPTCHA is disabled (no site key). */
export async function executeRecaptcha(action: string): Promise<string | undefined> {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) return undefined;

  await loadRecaptchaScript(siteKey);
  if (!window.grecaptcha?.execute) {
    throw new Error("reCAPTCHA is unavailable");
  }
  return window.grecaptcha.execute(siteKey, { action });
}
