import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { bulkSyncMailchimpFromImportRows } from "@/lib/mailchimp";
import { importResponses, type ImportResponseRow } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rows = (body as { rows?: ImportResponseRow[] }).rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }

  const result = await importResponses(rows);
  const mailchimp = await bulkSyncMailchimpFromImportRows(rows);

  return NextResponse.json({ ...result, mailchimp });
}