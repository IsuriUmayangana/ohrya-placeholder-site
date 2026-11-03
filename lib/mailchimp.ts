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

type MemberPayload = {
  email_address: string;
  status_if_new?: "subscribed";
  status?: "subscribed";
  merge_fields?: Record<string, string>;
};

function buildMemberPayload(
  params: MailchimpSignupParams,
  includeCampaignMerge: boolean,
): MemberPayload {
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

async function upsertMember(payload: MemberPayload, listId: string, hash: string): Promise<Response> {
  return mailchimpFetch(`/lists/${listId}/members/${hash}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function createMember(payload: MemberPayload, listId: string): Promise<Response> {
  return mailchimpFetch(`/lists/${listId}/members`, {
    method: "POST",
    body: JSON.stringify({
      email_address: payload.email_address,
      status: "subscribed",
      merge_fields: payload.merge_fields,
    }),
  });
}

function isMemberExistsError(status: number, body: string): boolean {
  return status === 400 && body.toLowerCase().includes("member exists");
}

async function readError(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return `HTTP ${res.status}`;
  }
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

  const email = params.email.trim();
  const hash = subscriberHash(email);
  const errors: string[] = [];

  for (const includeCampaign of [true, false]) {
    const payload = buildMemberPayload(params, includeCampaign);

    const putRes = await upsertMember(payload, config.listId, hash);
    if (putRes.ok) {
      console.info("[mailchimp] Subscribed (PUT)", email.toLowerCase());
      await applySignupTag(config.listId, hash);
      return;
    }
    errors.push(`PUT: ${await readError(putRes)}`);

    const postRes = await createMember(payload, config.listId);
    if (postRes.ok) {
      console.info("[mailchimp] Subscribed (POST)", email.toLowerCase());
      await applySignupTag(config.listId, hash);
      return;
    }
    const postErr = await readError(postRes);
    if (isMemberExistsError(postRes.status, postErr)) {
      console.info("[mailchimp] Already on audience", email.toLowerCase());
      return;
    }
    errors.push(`POST: ${postErr}`);
  }

  const minimalRes = await mailchimpFetch(`/lists/${config.listId}/members`, {
    method: "POST",
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });
  if (minimalRes.ok) {
    console.info("[mailchimp] Subscribed (POST minimal)", email.toLowerCase());
    await applySignupTag(config.listId, hash);
    return;
  }
  const minimalErr = await readError(minimalRes);
  if (isMemberExistsError(minimalRes.status, minimalErr)) {
    return;
  }
  errors.push(`POST minimal: ${minimalErr}`);

  throw new Error(errors.join(" | "));
}

async function applySignupTag(listId: string, hash: string): Promise<void> {
  const signupTag = getMailchimpOptionalEnv("SIGNUP_TAG");
  if (!signupTag) return;

  const tagRes = await mailchimpFetch(`/lists/${listId}/members/${hash}/tags`, {
    method: "POST",
    body: JSON.stringify({
      tags: [{ name: signupTag, status: "active" }],
    }),
  });
  if (!tagRes.ok) {
    console.warn("[mailchimp] Tag failed (member was subscribed)", await readError(tagRes));
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
    const body = await readError(res);
    return { configured: true, error: `Mailchimp API ${res.status}: ${body}` };
  }

  const data = (await res.json()) as { name?: string; stats?: { member_count?: number } };
  return {
    configured: true,
    audienceName: data.name,
    memberCount: data.stats?.member_count,
  };
}
