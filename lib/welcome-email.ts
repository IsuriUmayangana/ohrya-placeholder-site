import "server-only";

/** Delay before the welcome email is sent after first-time sign-up. */
export const WELCOME_EMAIL_DELAY_MS = 5 * 60 * 1000;

export function welcomeEmailDueAtFromNow(now = new Date()): string {
  return new Date(now.getTime() + WELCOME_EMAIL_DELAY_MS).toISOString();
}

export function isWelcomeEmailDue(
  response: { welcomeEmailDueAt?: string; welcomeEmailSentAt?: string },
  now = new Date()
): boolean {
  if (!response.welcomeEmailDueAt || response.welcomeEmailSentAt) return false;
  return new Date(response.welcomeEmailDueAt).getTime() <= now.getTime();
}
