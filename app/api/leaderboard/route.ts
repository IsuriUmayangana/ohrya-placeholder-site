import crypto from "crypto";
import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/store";

export const dynamic = "force-dynamic";

function gravatarUrl(email: string, size = 128): string {
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
}

export async function GET() {
  try {
    const entries = await getLeaderboard();
    const ranked = entries.map((e, i) => ({
      rank: i + 1,
      name: e.name,
      totalScore: e.totalScore,
      surveyScore: e.surveyScore,
      referralScore: e.referralScore,
      referralCount: e.referralCount,
      campaign: e.campaign,
      avatarUrl: gravatarUrl(e.email),

      // Add email to the entry -> to confirm
      email: e.email,
    }));
    return NextResponse.json(ranked);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
