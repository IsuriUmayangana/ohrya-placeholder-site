export interface SurveyResponse {
  id: string;
  sessionId: string;
  referralCode: string;   // unique code this user can share
  referredBy: string;     // referral code of whoever sent them here
  campaign: string;
  willGive: string;
  donationAmount: string;
  willVote: string;
  willShine: string;
  prefersEarning: string;
  email: string;
  surveyScore: number;    // points earned from the survey itself
  referralScore: number;  // bonus points earned from referrals
  referralCount: number;  // how many people clicked their link and completed
  submittedAt: string;
}

export type PublicUserStats = Pick<
  SurveyResponse,
  "referralCode" | "email" | "surveyScore" | "referralScore" | "referralCount" | "campaign"
> & { totalScore: number };

const responses: SurveyResponse[] = [];

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function saveResponse(
  data: Omit<SurveyResponse, "id" | "referralCode" | "referralScore" | "referralCount" | "submittedAt">
): SurveyResponse {
  // Credit the referrer +1 if they came via someone's link
  if (data.referredBy) {
    const referrer = responses.find((r) => r.referralCode === data.referredBy);
    if (referrer) {
      referrer.referralScore += 1;
      referrer.referralCount += 1;
    }
  }

  const response: SurveyResponse = {
    ...data,
    id: Math.random().toString(36).slice(2, 10),
    referralCode: generateCode(),
    referralScore: 0,
    referralCount: 0,
    submittedAt: new Date().toISOString(),
  };
  responses.push(response);
  return response;
}

export function getUserByCode(code: string): PublicUserStats | null {
  const r = responses.find((res) => res.referralCode === code);
  if (!r) return null;
  return {
    referralCode: r.referralCode,
    email: r.email,
    surveyScore: r.surveyScore,
    referralScore: r.referralScore,
    referralCount: r.referralCount,
    campaign: r.campaign,
    totalScore: r.surveyScore + r.referralScore,
  };
}

export function getAllResponses(): SurveyResponse[] {
  return [...responses];
}

export function getStats() {
  const total = responses.length;
  const avgScore =
    total > 0
      ? responses.reduce((s, r) => s + r.surveyScore + r.referralScore, 0) / total
      : 0;
  const campaigns = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.campaign] = (acc[r.campaign] || 0) + 1;
    return acc;
  }, {});
  return { total, avgScore: Math.round(avgScore * 10) / 10, campaigns };
}
