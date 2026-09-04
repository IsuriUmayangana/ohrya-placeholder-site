import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { clearWelcomeEmailSent, getPendingWelcomeEmails, markWelcomeEmailSent } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization")?.trim();
  if (auth === `Bearer ${secret}`) return true;

  const querySecret = req.nextUrl.searchParams.get("secret")?.trim();
  return querySecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await getPendingWelcomeEmails();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const user of pending) {
    const claimed = await markWelcomeEmailSent(user.id);
    if (!claimed) continue;

    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
        campaign: user.campaign,
      });
      sent++;
    } catch (err) {
      await clearWelcomeEmailSent(user.id);
      failed++;
      const message = err instanceof Error ? err.message : "Send failed";
      errors.push(`${user.email}: ${message}`);
      console.error("[cron/welcome-emails]", user.email, err);
    }
  }

  return NextResponse.json({
    ok: true,
    pending: pending.length,
    sent,
    failed,
    errors,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
