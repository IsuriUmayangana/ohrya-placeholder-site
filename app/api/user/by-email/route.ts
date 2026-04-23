import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "No survey found for this email" }, { status: 404 });
  }
  return NextResponse.json({ emailSlug: user.emailSlug });
}
