import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { fetchInstagramFeed, type InstagramFeed } from "@/lib/instagram-feed";

export const dynamic = "force-dynamic";

async function loadStaticFeed(): Promise<InstagramFeed> {
  const filePath = path.join(process.cwd(), "public", "data", "instagram.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as InstagramFeed;
}

export async function GET() {
  try {
    const feed = await fetchInstagramFeed();
    return NextResponse.json({ ...feed, source: "live" }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (liveError) {
    try {
      const feed = await loadStaticFeed();
      return NextResponse.json({ ...feed, source: "static" }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      const message =
        liveError instanceof Error ? liveError.message : "Instagram feed unavailable";
      return NextResponse.json(
        { updatedAt: new Date().toISOString(), items: [], source: "error", error: message },
        { status: 503 },
      );
    }
  }
}
