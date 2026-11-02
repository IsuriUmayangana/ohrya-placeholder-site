import "server-only";

import { createHash } from "node:crypto";

export type MailchimpSignupParams = {
  email: string;
  name: string;
  campaign?: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

function getMailchimpConfig(): { apiKey: string; listId: string; datacenter: string } | null {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  if (!apiKey || !listId) return null;

  const datacenter = apiKey.split("-").pop()?.trim();
  if (!datacenter) {
    console.error("[mailchimp] MAILCHIMP_API_KEY must end with -{datacenter}, e.g. ...-us21");
    return null;
  }

  return { apiKey, listId, datacenter };
}

export function isMailchimpConfigured(): boolean {
  return getMailchimpConfig() !== null;
}

async function mailchimpFetch(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const config = getMailchimpConfig();
  if (!config) {
    throw new Error("Mailchimp is not configured");
  }

  const url = `https://${config.datacenter}.api.mailchimp.com/3.0${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `apikey ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

/**
 * Upserts a list member after website sign-up. No-op when env vars are unset.
 * Sign-up should not depend on this succeeding — callers should catch and log.
 */
export async function upsertMailchimpSignupMember(params: MailchimpSignupParams): Promise<void> {
  const config = getMailchimpConfig();
  if (!config) return;

  const email = params.email.trim();
  const { firstName, lastName } = splitName(params.name);
  const mergeFields: Record<string, string> = {
    FNAME: firstName,
    LNAME: lastName,
  };

  const campaignMergeKey = process.env.MAILCHIMP_MERGE_CAMPAIGN?.trim();
  if (campaignMergeKey && params.campaign?.trim()) {
    mergeFields[campaignMergeKey] = params.campaign.trim();
  }

  const statusIfNew = process.env.MAILCHIMP_STATUS_IF_NEW?.trim() || "subscribed";
  const hash = subscriberHash(email);

  const memberRes = await mailchimpFetch(`/lists/${config.listId}/members/${hash}`, {
    method: "PUT",
    body: JSON.stringify({
      email_address: email,
      status_if_new: statusIfNew,
      merge_fields: mergeFields,
    }),
  });

  if (!memberRes.ok) {
    const body = await memberRes.text();
    throw new Error(`Member upsert failed (${memberRes.status}): ${body}`);
  }

  const signupTag = process.env.MAILCHIMP_SIGNUP_TAG?.trim();
  if (signupTag) {
    const tagRes = await mailchimpFetch(`/lists/${config.listId}/members/${hash}/tags`, {
      method: "POST",
      body: JSON.stringify({
        tags: [{ name: signupTag, status: "active" }],
      }),
    });
    if (!tagRes.ok) {
      const body = await tagRes.text();
      throw new Error(`Tag update failed (${tagRes.status}): ${body}`);
    }
  }
}
