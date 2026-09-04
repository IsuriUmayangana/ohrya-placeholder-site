import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { saveResponse, getAllResponses, getStats } from "@/lib/store";
import type { SurveyResponse } from "@/lib/survey-types";
import { SURVEY_SCORE } from "@/lib/survey-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function detectDevice(ua: string): SurveyResponse["device"] {
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(s)) return "Tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(s)) return "Mobile";
  if (/windows|macintosh|linux/i.test(s)) return "Desktop";
  return "Other";
}

async function sendSignupWelcomeEmail(response: SurveyResponse): Promise<void> {
  try {
    await sendWelcomeEmail({
      name: response.name,
      email: response.email,
      campaign: response.campaign,
    });
  } catch (err) {
    // Sign-up still succeeds if email fails — log for Amplify/server logs.
    console.error("[api/responses] welcome email failed", response.email, err);
  }
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
      name: body.name || "",
      email: body.email || "",
      surveyScore: SURVEY_SCORE,
      startedAt: body.startedAt || new Date().toISOString(),
      device: detectDevice(ua),
    });
    await sendSignupWelcomeEmail(response);
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
