import { NextRequest, NextResponse } from "next/server";
import { getAllResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");   // "YYYY-MM-DD"
  const to = searchParams.get("to");       // "YYYY-MM-DD"
  const device = searchParams.get("device"); // "All" | "Desktop" | "Mobile" | "Tablet" | "Other"

  let responses = getAllResponses();

  // Apply date filter
  if (from) responses = responses.filter((r) => r.submittedAt >= from);
  if (to)   responses = responses.filter((r) => r.submittedAt <= `${to}T23:59:59.999Z`);

  // Apply device filter
  if (device && device !== "All") {
    responses = responses.filter((r) => (r.device ?? "Other") === device);
  }

  const total = responses.length;

  if (total === 0) {
    return NextResponse.json({
      total: 0, avgScore: 0, avgTimeToComplete: "—", trends: [],
      campaigns: [], giveAnswers: [], donationAmounts: [], voteAnswers: [],
      shineAnswers: [], recognitionAnswers: [], dropOff: [], responses: [],
      deviceBreakdown: [],
    });
  }

  // Trends: submissions per day
  const byDay: Record<string, number> = {};
  responses.forEach((r) => {
    const day = r.submittedAt.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const trends = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  function count(field: keyof typeof responses[0]) {
    const tally: Record<string, number> = {};
    responses.forEach((r) => {
      const val = String(r[field] || "Unknown");
      tally[val] = (tally[val] || 0) + 1;
    });
    return Object.entries(tally).map(([name, value]) => ({ name, value }));
  }

  const avgScore = responses.reduce((s, r) => s + r.surveyScore + r.referralScore, 0) / total;
  const avgTimeSeconds = Math.round(
    responses.reduce((s, r) => s + (r.timeToCompleteSeconds || 0), 0) / total
  );

  const deviceBreakdown = count("device");

  const dropOff = [
    { question: "Which campaign inspires you the most?", views: total, answered: total },
    { question: "After watching the video, will you GIVE?", views: total, answered: responses.filter((r) => r.willGive).length },
    { question: "Brilliant! Score screen", views: total, answered: total },
    { question: "If you chose to donate, what amount?", views: total, answered: responses.filter((r) => r.donationAmount).length },
    { question: "Will you VOTE for a vetted nonprofit?", views: total, answered: responses.filter((r) => r.willVote).length },
    { question: "Almost there! Score screen", views: total, answered: total },
    { question: "Will you SHINE by sharing your link?", views: total, answered: responses.filter((r) => r.willShine).length },
    { question: "Is earning recognition more appealing?", views: total, answered: responses.filter((r) => r.prefersEarning).length },
    { question: "Well done! Score screen", views: total, answered: total },
    { question: "Want to hear when campaigns go live?", views: total, answered: responses.filter((r) => r.email).length },
  ];

  return NextResponse.json({
    total,
    avgScore: Math.round(avgScore * 10) / 10,
    avgTimeToComplete: avgTimeSeconds > 0 ? formatTime(avgTimeSeconds) : "—",
    trends,
    campaigns: count("campaign"),
    giveAnswers: count("willGive"),
    donationAmounts: count("donationAmount"),
    voteAnswers: count("willVote"),
    shineAnswers: count("willShine"),
    recognitionAnswers: count("prefersEarning"),
    dropOff,
    deviceBreakdown,
    responses: responses.map((r) => ({
      id: r.id, email: r.email, campaign: r.campaign, willGive: r.willGive,
      donationAmount: r.donationAmount, willVote: r.willVote, willShine: r.willShine,
      prefersEarning: r.prefersEarning, surveyScore: r.surveyScore,
      referralScore: r.referralScore, referralCount: r.referralCount,
      totalScore: r.surveyScore + r.referralScore,
      submittedAt: r.submittedAt, device: r.device ?? "Other",
      dashboardUrl: `/dashboard/${r.emailSlug}`,
    })),
  });
}
