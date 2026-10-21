export const BULK_EMAIL_DELAY_MS = 80;

export function bulkEmailDelayMs(): number {
  const raw = process.env.BULK_EMAIL_DELAY_MS?.trim();
  if (!raw) return BULK_EMAIL_DELAY_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 && n <= 500 ? n : BULK_EMAIL_DELAY_MS;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
