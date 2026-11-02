import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { getMailchimpAudienceHealth } from "@/lib/mailchimp";

export const dynamic = "force-dynamic";

/** Logged-in admin only — confirms Mailchimp env + audience without exposing secrets. */
export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const health = await getMailchimpAudienceHealth();
  return NextResponse.json(health);
}
