import { NextRequest, NextResponse } from "next/server";
import { getUserByCode, getUserBySlug } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Try by referral code first (6-char uppercase), then by full email slug
  const user = (await getUserByCode(code)) ?? (await getUserBySlug(code));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
