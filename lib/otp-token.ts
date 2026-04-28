import "server-only";

import crypto from "crypto";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function getSecret(): string {
  const s = process.env.OTP_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("OTP_SECRET or ADMIN_SESSION_SECRET must be configured");
  return s;
}

/**
 * Creates a stateless signed token that binds an email to a specific OTP.
 * No database required — the HMAC signature IS the proof of authenticity.
 */
export function createOtpToken(email: string, otp: string): string {
  const payload = Buffer.from(
    JSON.stringify({ e: email.toLowerCase().trim(), x: Date.now() + OTP_EXPIRY_MS })
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(`${payload}.${otp}`)
    .digest("base64url");

  return `${payload}.${sig}`;
}

/**
 * Verifies the token by recomputing the HMAC with the provided OTP.
 * Returns the verified email on success.
 */
export function verifyOtpToken(
  token: string,
  otp: string
): { valid: boolean; email?: string } {
  try {
    const dotIdx = token.indexOf(".");
    if (dotIdx === -1) return { valid: false };

    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(`${payload}.${otp}`)
      .digest("base64url");

    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");

    if (sigBuf.length !== expBuf.length) return { valid: false };
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return { valid: false };

    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      e: string;
      x: number;
    };
    if (Date.now() > data.x) return { valid: false };

    return { valid: true, email: data.e };
  } catch {
    return { valid: false };
  }
}
