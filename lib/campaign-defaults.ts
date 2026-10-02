/** Survey / import campaign value when none is provided (e.g. Meta lead ads). */
export const DEFAULT_CAMPAIGN_NAME = "Animals";

export function normalizeCampaignName(campaign: string | undefined | null): string {
  const trimmed = (campaign ?? "").trim();
  return trimmed || DEFAULT_CAMPAIGN_NAME;
}
