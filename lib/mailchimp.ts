import "server-only";

import { createHash } from "node:crypto";
import {
  getMailchimpCredentials,
  getMailchimpOptionalEnv,
} from "@/lib/mailchimp-credentials";

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

export function isMailchimpConfigured(): boolean {
  return getMailchimpCredentials() !== null;
}

async function mailchimpFetch(path: string, init: RequestInit): Promise<Response> {
  const config = getMailchimpCredentials();
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

type UpsertBody = {
  email_address: string;
  status_if_new: "subscribed";
  status: "subscribed";
  merge_fields: Record<string, string>;
};

function buildUpsertBody(params: MailchimpSignupParams, includeCampaignMerge: boolean): UpsertBody {
  const email = params.email.trim();
  const { firstName, lastName } = splitName(params.name);
  const mergeFields: Record<string, string> = {
    FNAME: firstName,
    LNAME: lastName,
  };

  const campaignMergeKey = getMailchimpOptionalEnv("MERGE_CAMPAIGN");
  if (includeCampaignMerge && campaignMergeKey && params.campaign?.trim()) {
    mergeFields[campaignMergeKey] = params.campaign.trim();
  }

  return {
    email_address: email,
    status_if_new: "subscribed",
    status: "subscribed",
    merge_fields: mergeFields,
  };
}

async function upsertMember(body: UpsertBody, listId: string, hash: string): Promise<Response> {
  return mailchimpFetch(`/lists/${listId}/members/${hash}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Upserts a list member after website sign-up. No-op when env vars are unset.
 * Sign-up should not depend on this succeeding — callers should catch and log.
 */
export async function upsertMailchimpSignupMember(params: MailchimpSignupParams): Promise<void> {
  const config = getMailchimpCredentials();
  if (!config) {
    console.warn("[mailchimp] Skipped sync — MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID not set");
    return;
  }

  const hash = subscriberHash(params.email);
  let body = buildUpsertBody(params, true);
  let memberRes = await upsertMember(body, config.listId, hash);

  if (!memberRes.ok) {
    const firstError = await memberRes.text();
    // Retry without custom campaign merge field (common Mailchimp 400).
    body = buildUpsertBody(params, false);
    memberRes = await upsertMember(body, config.listId, hash);
    if (!memberRes.ok) {
      const secondError = await memberRes.text();
      throw new Error(
        `Member upsert failed (${memberRes.status}): ${secondError || firstError}`,
      );
    }
  }

  console.info("[mailchimp] Subscribed", params.email.trim().toLowerCase());

  const signupTag = getMailchimpOptionalEnv("SIGNUP_TAG");
  if (signupTag) {
    const tagRes = await mailchimpFetch(`/lists/${config.listId}/members/${hash}/tags`, {
      method: "POST",
      body: JSON.stringify({
        tags: [{ name: signupTag, status: "active" }],
      }),
    });
    if (!tagRes.ok) {
      const tagBody = await tagRes.text();
      console.warn("[mailchimp] Tag failed (member was subscribed)", tagBody);
    }
  }
}

/** Admin diagnostics — verifies API key and audience ID. */
export async function getMailchimpAudienceHealth(): Promise<{
  configured: boolean;
  audienceName?: string;
  memberCount?: number;
  error?: string;
}> {
  const config = getMailchimpCredentials();
  if (!config) {
    return { configured: false, error: "Missing MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID" };
  }

  const res = await mailchimpFetch(`/lists/${config.listId}?fields=name,stats.member_count`, {
    method: "GET",
  });
  if (!res.ok) {
    const body = await res.text();
    return { configured: true, error: `Mailchimp API ${res.status}: ${body}` };
  }

  const data = (await res.json()) as { name?: string; stats?: { member_count?: number } };
  return {
    configured: true,
    audienceName: data.name,
    memberCount: data.stats?.member_count,
  };
}
