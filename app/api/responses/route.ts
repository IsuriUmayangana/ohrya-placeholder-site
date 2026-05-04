import { NextRequest, NextResponse } from "next/server";
import { saveResponse, getAllResponses, getStats } from "@/lib/store";
import type { SurveyResponse } from "@/lib/survey-types";

function detectDevice(ua: string): SurveyResponse["device"] {
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(s)) return "Tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(s)) return "Mobile";
  if (/windows|macintosh|linux/i.test(s)) return "Desktop";
  return "Other";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ua = req.headers.get("user-agent") || "";
    const response = await saveResponse({
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
      startedAt: body.startedAt || new Date().toISOString(),
      device: detectDevice(ua),
    });
    return NextResponse.json({ success: true, response });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/responses POST]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  const responses = await getAllResponses();
  const stats = await getStats();
  return NextResponse.json({ responses, stats });
}
