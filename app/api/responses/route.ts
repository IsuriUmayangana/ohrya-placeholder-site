import { NextRequest, NextResponse } from "next/server";
import { saveResponse, getAllResponses, getStats } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = saveResponse({
      sessionId: body.sessionId || "anon",
      referredBy: body.referredBy || "",
      campaign: body.campaign || "",
      willGive: body.willGive || "",
      donationAmount: body.donationAmount || "",
      willVote: body.willVote || "",
      willShine: body.willShine || "",
      prefersEarning: body.prefersEarning || "",
      email: body.email || "",
      surveyScore: body.surveyScore || 0,
    });
    return NextResponse.json({ success: true, response });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const responses = getAllResponses();
  const stats = getStats();
  return NextResponse.json({ responses, stats });
}
