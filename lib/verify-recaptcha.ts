import "server-only";

const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaVerifyResult =
  | { ok: true; score: number }
  | { ok: false; error: string };

function getRecaptchaSecret(): string | undefined {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  return secret || undefined;
}

function getMinScore(): number {
  const raw = process.env.RECAPTCHA_MIN_SCORE?.trim();
  if (!raw) return 0.5;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.5;
}

/** When RECAPTCHA_SECRET_KEY is unset, verification is skipped (local dev). */
export function isRecaptchaEnforced(): boolean {
  return Boolean(getRecaptchaSecret());
}

export async function verifyRecaptchaToken(
  token: unknown,
  expectedAction: string,
): Promise<RecaptchaVerifyResult> {
  const secret = getRecaptchaSecret();
  if (!secret) {
    return { ok: true, score: 1 };
  }

  if (typeof token !== "string" || !token.trim()) {
    return { ok: false, error: "Security verification failed. Please try again." };
  }

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
  });

  let payload: {
    success?: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    payload = (await response.json()) as typeof payload;
  } catch {
    return { ok: false, error: "Security verification unavailable. Please try again shortly." };
  }

  if (!payload.success) {
    return { ok: false, error: "Security verification failed. Please try again." };
  }

  if (payload.action && payload.action !== expectedAction) {
    return { ok: false, error: "Security verification failed. Please try again." };
  }

  const score = typeof payload.score === "number" ? payload.score : 0;
  if (score < getMinScore()) {
    return { ok: false, error: "We could not verify this sign up. Please try again later." };
  }

  return { ok: true, score };
}
