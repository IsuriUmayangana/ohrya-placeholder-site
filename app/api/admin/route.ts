import { NextResponse } from "next/server";
import { getAllResponses, getStats } from "@/lib/store";

export async function GET() {
  const responses = getAllResponses();
  const stats = getStats();
  return NextResponse.json({ responses, stats });
}
