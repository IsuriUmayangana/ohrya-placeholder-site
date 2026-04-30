import { NextRequest, NextResponse } from "next/server";
import { verifyOtpToken } from "@/lib/otp-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token, code } = await req.json();

    if (!token || !code) {
      return NextResponse.json({ error: "Token and code are required" }, { status: 400 });
    }

    if (!/^\d{6}$/.test((code as string).trim())) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const result = verifyOtpToken(token as string, (code as string).trim());

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true, email: result.email });
  } catch (err) {
    console.error("verify-email-otp error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
