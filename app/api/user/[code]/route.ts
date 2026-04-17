import { NextRequest, NextResponse } from "next/server";
import { getUserByCode } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = getUserByCode(code.toUpperCase());
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
