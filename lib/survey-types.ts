export interface SurveyResponse {
  id: string;
  sessionId: string;
  referralCode: string;
  emailSlug: string;
  referredBy: string;
  campaign: string;
  willGive: string;
  donationAmount: string;
  willVote: string;
  willShine: string;
  prefersEarning: string;
  email: string;
  surveyScore: number;
  referralScore: number;
  referralCount: number;
  startedAt: string;
  submittedAt: string;
  timeToCompleteSeconds: number;
  device: "Desktop" | "Mobile" | "Tablet" | "Other";
}

export type PublicUserStats = Pick<
  SurveyResponse,
  "referralCode" | "emailSlug" | "email" | "surveyScore" | "referralScore" | "referralCount" | "campaign"
> & { totalScore: number };
