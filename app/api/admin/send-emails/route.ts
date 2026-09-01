import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin-auth";
import { sendImportUserEmail } from "@/lib/email";
import { buildImportEmailDashboardUrl } from "@/lib/import-user-email";
import { getUserByEmail } from "@/lib/store";

export const dynamic = "force-dynamic";

export type BulkEmailRecipient = {
  email: string;
  name?: string;
  campaign?: string;
};

function dashboardAccessUrl(email: string): string {
  return buildImportEmailDashboardUrl(email);
}

export async function POST(req: Request) {
  const session = (await cookies()).get("admin_session")?.value;
  const secret = getAdminSessionSecret();
  if (!secret || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const recipients = (body as { recipients?: BulkEmailRecipient[] }).recipients;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: "No recipients to email" }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const email = recipients[i].email?.trim();
    if (!email) {
      errors.push(`Row ${i + 1}: missing email`);
      failed++;
      continue;
    }

    try {
      const user = await getUserByEmail(email);

      await sendImportUserEmail({
        email,
        name: recipients[i].name || user?.name || "",
        campaign: recipients[i].campaign || user?.campaign || "",
        dashboardUrl: dashboardAccessUrl(email),
      });
      sent++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : "Send failed";
      errors.push(`${email}: ${message}`);
    }
  }

  return NextResponse.json({ sent, failed, errors });
}
