import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/store";
import { generateOtp, saveOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const trimmed = (email ?? "").trim();

    if (!trimmed) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(trimmed);
    if (!user) {
      return NextResponse.json(
        { error: "No survey found for this email" },
        { status: 404 }
      );
    }

    const code = generateOtp();
    await saveOtp(trimmed, code, user.emailSlug);
    await sendOtpEmail(trimmed, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
  }
}
