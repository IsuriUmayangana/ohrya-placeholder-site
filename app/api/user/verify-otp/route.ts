import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    const trimmedEmail = (email ?? "").trim();
    const trimmedCode = (code ?? "").trim();

    if (!trimmedEmail || !trimmedCode) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    // Master bypass code for testing (set TEST_OTP_CODE env var to enable)
    const masterCode = process.env.TEST_OTP_CODE?.trim();
    if (masterCode && trimmedCode === masterCode) {
      const { getUserByEmail } = await import("@/lib/store");
      const user = await getUserByEmail(trimmedEmail);
      if (!user) {
        return NextResponse.json({ error: "No survey found for this email" }, { status: 404 });
      }
      return NextResponse.json({ emailSlug: user.emailSlug });
    }

    const result = await verifyOtp(trimmedEmail, trimmedCode);

    if (!result.valid || !result.emailSlug) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ emailSlug: result.emailSlug });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
