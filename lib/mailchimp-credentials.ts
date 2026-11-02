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

export function getMailchimpOptionalEnv(name: "MERGE_CAMPAIGN" | "SIGNUP_TAG"): string | undefined {
  const env = process.env;
  const key = name === "MERGE_CAMPAIGN" ? "MAILCHIMP" + "_MERGE_CAMPAIGN" : "MAILCHIMP" + "_SIGNUP_TAG";
  const value = env[key]?.trim();
  return value || undefined;
}
