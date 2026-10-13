import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { getAllResponses, getStats } from "@/lib/store";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const responses = await getAllResponses();
  const stats = await getStats();
  return NextResponse.json({ responses, stats });
}
