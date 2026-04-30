import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/otp-store";
import { createOtpToken } from "@/lib/otp-token";
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const otp = generateOtp();
    const token = createOtpToken(trimmed, otp);
    await sendOtpEmail(trimmed, otp);

    return NextResponse.json({ token });
  } catch (err) {
    console.error("send-verification-otp error:", err);
    return NextResponse.json(
      { error: "Failed to send code. Please try again." },
      { status: 500 }
    );
  }
}
