import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin-auth";
import {
  buildImportUserEmailHtml,
  buildImportUserEmailText,
} from "@/lib/import-user-email";

export const dynamic = "force-dynamic";

function dashboardAccessUrl(email: string): string {
  const base = process.env.DASHBOARD_BASE_URL?.trim() || "https://dashboard.ohrya.org";
  return `${base}/my-dashboard?email=${encodeURIComponent(email)}`;
}

export async function GET(req: NextRequest) {
  const session = (await cookies()).get("admin_session")?.value;
  const secret = getAdminSessionSecret();
  if (!secret || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name")?.trim() || "Alex";
  const email = searchParams.get("email")?.trim() || "alex@example.com";
  const format = searchParams.get("format") || "html";
  const origin = req.nextUrl.origin;

  const params = {
    name,
    email,
    campaign: searchParams.get("campaign")?.trim() || "",
    dashboardUrl: dashboardAccessUrl(email),
  };

  if (format === "text") {
    return new NextResponse(buildImportUserEmailText(params), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const html = buildImportUserEmailHtml(params, { assetBaseUrl: origin });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
