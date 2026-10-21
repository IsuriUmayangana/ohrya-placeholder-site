/** Same rule as public sign-up and OTP routes. */
export const EMAIL_ADDRESS_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmailInput(raw: string): string {
  return raw.trim();
}

export function isValidEmailAddress(email: string): boolean {
  const trimmed = normalizeEmailInput(email);
  if (!trimmed || trimmed.length > 254) return false;
  return EMAIL_ADDRESS_REGEX.test(trimmed);
}

/** Human-readable error for admin/import, or null if valid. */
export function getEmailValidationError(email: string | undefined | null): string | null {
  const trimmed = normalizeEmailInput(email ?? "");
  if (!trimmed) return "missing email";
  if (trimmed.length > 254) return "email is too long";
  if (!EMAIL_ADDRESS_REGEX.test(trimmed)) return `invalid email "${trimmed}"`;
  return null;
}
