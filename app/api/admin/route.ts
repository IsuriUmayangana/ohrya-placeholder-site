import { NextResponse } from "next/server";
import { getAllResponses, getStats } from "@/lib/store";

export async function GET() {
  const responses = await getAllResponses();
  const stats = await getStats();
  return NextResponse.json({ responses, stats });
}
