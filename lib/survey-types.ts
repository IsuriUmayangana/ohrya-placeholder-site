export const SURVEY_SCORE = 10;

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
  name: string;
  email: string;
  surveyScore: number;
  referralScore: number;
  referralCount: number;
  referralClicks: number;
  startedAt: string;
  submittedAt: string;
  timeToCompleteSeconds: number;
  device: "Desktop" | "Mobile" | "Tablet" | "Other";
  /** ISO timestamp when the post-signup welcome email should be sent. */
  welcomeEmailDueAt?: string;
  /** ISO timestamp when the welcome email was sent (prevents duplicate sends). */
  welcomeEmailSentAt?: string;
}

export type PublicUserStats = Pick<
  SurveyResponse,
  "referralCode" | "emailSlug" | "name" | "email" | "surveyScore" | "referralScore" | "referralCount" | "campaign"
> & { totalScore: number; leaderboardRank?: number | null };
