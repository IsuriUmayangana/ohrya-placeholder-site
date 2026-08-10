import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCachedInstagramFeed, setCachedInstagramFeed } from "@/lib/instagram-cache";
import { fetchInstagramFeed, type InstagramFeed } from "@/lib/instagram-feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadStaticFeed(): Promise<InstagramFeed> {
  const filePath = path.join(process.cwd(), "public", "data", "instagram.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as InstagramFeed;
}

function liveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 240);
  }
  return "Instagram feed unavailable";
}

export async function GET() {
  const cached = getCachedInstagramFeed();
  if (cached) {
    return NextResponse.json(
      { ...cached, source: "live", cached: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const feed = await fetchInstagramFeed();
    setCachedInstagramFeed(feed);
    return NextResponse.json(
      { ...feed, source: "live", cached: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (liveError) {
    const fallbackReason = liveErrorMessage(liveError);

    try {
      const feed = await loadStaticFeed();
      return NextResponse.json(
        { ...feed, source: "static", fallbackReason },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return NextResponse.json(
        {
          updatedAt: new Date().toISOString(),
          items: [],
          source: "error",
          error: fallbackReason,
        },
        { status: 503 },
      );
    }
  }
}
