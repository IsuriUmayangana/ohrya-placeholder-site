import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin-auth";
import { importResponses, type ImportResponseRow } from "@/lib/store";

export const dynamic = "force-dynamic";

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

  const rows = (body as { rows?: ImportResponseRow[] }).rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }

  const result = await importResponses(rows);
  return NextResponse.json(result);
}
