export const SKIPPED_DEFAULT_ANSWERS = {
  willGive: "Yes",
  donationAmount: "$25",
  willVote: "Yes",
  willShine: "Yes",
  prefersEarning: "Yes",
} as const;

export type SubmitSurveyParams = {
  campaign: string;
  name: string;
  email: string;
  referredBy?: string;
  startedAt?: string;
};

export type SubmitSurveyResult = {
  referralCode: string;
  emailSlug: string;
};

export async function checkEmailAlreadyRegistered(email: string): Promise<boolean> {
  const check = await fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`);
  return check.ok;
}

export async function submitSurveyResponse(params: SubmitSurveyParams): Promise<SubmitSurveyResult> {
  const res = await fetch("/api/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: Math.random().toString(36).slice(2),
      referredBy: params.referredBy || "",
      campaign: params.campaign,
      name: params.name,
      email: params.email,
      ...SKIPPED_DEFAULT_ANSWERS,
      surveyScore: 10,
      startedAt: params.startedAt || new Date().toISOString(),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to save response");
  }
  if (!data.response?.referralCode || !data.response?.emailSlug) {
    throw new Error("Invalid response from server");
  }
  return {
    referralCode: data.response.referralCode,
    emailSlug: data.response.emailSlug,
  };
}

export function referralSuccessUrl(result: SubmitSurveyResult, email: string): string {
  const params = new URLSearchParams({
    code: result.referralCode,
    email,
    slug: result.emailSlug,
  });
  return `/referral?${params.toString()}`;
}
