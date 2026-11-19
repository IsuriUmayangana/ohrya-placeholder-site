export const CAMPAIGN_NOMINATION_MAX_LENGTH = 300;

export function normalizeCampaignNomination(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, CAMPAIGN_NOMINATION_MAX_LENGTH);
}