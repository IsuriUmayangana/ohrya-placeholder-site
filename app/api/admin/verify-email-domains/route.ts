import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { filterEmailsByDeliverability } from "@/lib/email-deliverability";
import { getEmailValidationError, normalizeEmailInput } from "@/lib/email-validation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_EMAILS = 2_000;

export async function POST(req: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body as { emails?: string[] }).emails;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "No emails to verify" }, { status: 400 });
  }
  if (raw.length > MAX_EMAILS) {
    return NextResponse.json({ error: `Maximum ${MAX_EMAILS} emails per request` }, { status: 400 });
  }

  const formatIssues: Array<{ email: string; error: string }> = [];
  const toCheck: string[] = [];

  for (const entry of raw) {
    const formatError = getEmailValidationError(entry);
    if (formatError) {
      formatIssues.push({ email: String(entry ?? ""), error: formatError });
      continue;
    }
    toCheck.push(normalizeEmailInput(String(entry)));
  }

  const { issues: mxIssues } = await filterEmailsByDeliverability(toCheck);

  return NextResponse.json({
    issues: [...formatIssues, ...mxIssues],
  });
}
