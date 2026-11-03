/** Runtime env read — avoids empty build-time inlining on Amplify (see instagram-credentials). */
export function getMailchimpCredentials(): {
  apiKey: string;
  listId: string;
  datacenter: string;
} | null {
  const env = process.env;
  const apiKey = env["MAILCHIMP" + "_API_KEY"]?.trim();
  const listId = env["MAILCHIMP" + "_AUDIENCE_ID"]?.trim();
  if (!apiKey || !listId) return null;

  const datacenter = apiKey.split("-").pop()?.trim();
  if (!datacenter) return null;

  return { apiKey, listId, datacenter };
}

export function getMailchimpOptionalEnv(name: "SIGNUP_TAG"): string | undefined {
  const value = process.env["MAILCHIMP" + "_SIGNUP_TAG"]?.trim();
  return value || undefined;
}

/** Mailchimp merge tag for the audience "Campaign" field (not the display label). */
export function getMailchimpCampaignMergeTag(): string {
  const custom = process.env["MAILCHIMP" + "_MERGE_CAMPAIGN"]?.trim();
  return custom || "CAMPAIGN";
}
