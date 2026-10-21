import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { bulkEmailDelayMs, sleep } from "@/lib/bulk-email-throttle";
import { getEmailDeliverabilityError } from "@/lib/email-deliverability";
import { sendImportUserEmail } from "@/lib/email";
import { buildImportEmailDashboardUrl } from "@/lib/import-user-email";
import { getEmailValidationError, normalizeEmailInput } from "@/lib/email-validation";
import { getResponseByEmail, markWelcomeEmailSent } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export type BulkEmailRecipient = {
  email: string;
  name?: string;
  campaign?: string;
};

function dashboardAccessUrl(email: string): string {
  return buildImportEmailDashboardUrl(email);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as { recipients?: BulkEmailRecipient[]; forceResend?: boolean };
  const recipients = payload.recipients;
  const forceResend = payload.forceResend === true;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: "No recipients to email" }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;
  let skippedAlreadySent = 0;
  const errors: string[] = [];
  const delayMs = bulkEmailDelayMs();

  for (let i = 0; i < recipients.length; i++) {
    if (i > 0 && delayMs > 0) {
      await sleep(delayMs);
    }

    const emailError = getEmailValidationError(recipients[i].email);
    if (emailError) {
      errors.push(`Recipient ${i + 1}: ${emailError}`);
      failed++;
      continue;
    }
    const email = normalizeEmailInput(recipients[i].email!);

    const deliverabilityError = await getEmailDeliverabilityError(email);
    if (deliverabilityError) {
      errors.push(`${email}: ${deliverabilityError}`);
      failed++;
      continue;
    }

    try {
      const response = await getResponseByEmail(email);
      if (!forceResend && response?.welcomeEmailSentAt) {
        skippedAlreadySent++;
        continue;
      }

      const csvName = recipients[i].name?.trim() ?? "";
      const name = response?.name?.trim() || csvName;

      await sendImportUserEmail({
        email,
        name,
        campaign: recipients[i].campaign?.trim() || response?.campaign || "",
        dashboardUrl: dashboardAccessUrl(email),
      });
      await markWelcomeEmailSent(email);
      sent++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : "Send failed";
      errors.push(`${email}: ${message}`);
    }
  }

  return NextResponse.json({ sent, failed, skippedAlreadySent, errors });
}
