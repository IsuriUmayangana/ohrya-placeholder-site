import type { SurveyResponse } from "@/lib/survey-types";

export type ImportMergeRow = {
  name?: string;
  email: string;
  campaign?: string;
  willGive?: string;
  donationAmount?: string;
  willVote?: string;
  willShine?: string;
  prefersEarning?: string;
  device?: SurveyResponse["device"];
  referralCount?: number;
};

/** Apply non-empty CSV fields onto an existing response. Returns true if anything changed. */
export function applyImportRowUpdates(
  existing: SurveyResponse,
  row: ImportMergeRow,
  calcReferralScore: (referralCount: number, donations?: number, clicks?: number) => number
): boolean {
  let changed = false;

  const name = row.name?.trim();
  if (name && existing.name !== name) {
    existing.name = name;
    changed = true;
  }

  const campaign = row.campaign?.trim();
  if (campaign && existing.campaign !== campaign) {
    existing.campaign = campaign;
    changed = true;
  }

  const willGive = row.willGive?.trim();
  if (willGive && existing.willGive !== willGive) {
    existing.willGive = willGive;
    changed = true;
  }

  const donationAmount = row.donationAmount?.trim();
  if (donationAmount && existing.donationAmount !== donationAmount) {
    existing.donationAmount = donationAmount;
    changed = true;
  }

  const willVote = row.willVote?.trim();
  if (willVote && existing.willVote !== willVote) {
    existing.willVote = willVote;
    changed = true;
  }

  const willShine = row.willShine?.trim();
  if (willShine && existing.willShine !== willShine) {
    existing.willShine = willShine;
    changed = true;
  }

  const prefersEarning = row.prefersEarning?.trim();
  if (prefersEarning && existing.prefersEarning !== prefersEarning) {
    existing.prefersEarning = prefersEarning;
    changed = true;
  }

  if (row.device && existing.device !== row.device) {
    existing.device = row.device;
    changed = true;
  }

  if (row.referralCount != null) {
    const referralCount = Math.max(0, row.referralCount);
    if (existing.referralCount !== referralCount) {
      existing.referralCount = referralCount;
      existing.referralScore = calcReferralScore(referralCount, 0, 0);
      changed = true;
    }
  }

  return changed;
}
