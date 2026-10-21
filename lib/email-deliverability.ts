import "server-only";

import { resolveMx } from "node:dns/promises";

const MX_LOOKUP_MS = 4_000;

/** domain -> null if OK, otherwise error message */
const domainCache = new Map<string, string | null>();

function emailDomain(email: string): string | null {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain || null;
}

async function lookupMx(domain: string): Promise<string | null> {
  const cached = domainCache.get(domain);
  if (cached !== undefined) return cached;

  let error: string | null = null;
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), MX_LOOKUP_MS)
      ),
    ]);
    if (!records?.length) {
      error = `domain "${domain}" has no MX records`;
    }
  } catch {
    error = `domain "${domain}" could not be verified (no mail server found)`;
  }

  domainCache.set(domain, error);
  return error;
}

export function isMxCheckEnabled(): boolean {
  return process.env.SKIP_EMAIL_MX_CHECK?.trim() !== "1";
}

/** Returns null if the address domain looks deliverable (has MX). */
export async function getEmailDeliverabilityError(email: string): Promise<string | null> {
  if (!isMxCheckEnabled()) return null;
  const domain = emailDomain(email);
  if (!domain) return "invalid email domain";
  return lookupMx(domain);
}

export async function filterEmailsByDeliverability(
  emails: string[],
): Promise<{ ok: string[]; issues: Array<{ email: string; error: string }> }> {
  if (!isMxCheckEnabled()) {
    return { ok: [...emails], issues: [] };
  }

  const uniqueDomains = [...new Set(emails.map((e) => emailDomain(e)).filter(Boolean) as string[])];
  await Promise.all(uniqueDomains.map((d) => lookupMx(d)));

  const ok: string[] = [];
  const issues: Array<{ email: string; error: string }> = [];

  for (const email of emails) {
    const domain = emailDomain(email);
    if (!domain) {
      issues.push({ email, error: "invalid email domain" });
      continue;
    }
    const domainError = domainCache.get(domain) ?? (await lookupMx(domain));
    if (domainError) {
      issues.push({ email, error: domainError });
    } else {
      ok.push(email);
    }
  }

  return { ok, issues };
}
