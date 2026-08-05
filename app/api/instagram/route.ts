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
    return NextResponse.json(feed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    try {
      const feed = await loadStaticFeed();
      return NextResponse.json(feed, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      return NextResponse.json({ updatedAt: new Date().toISOString(), items: [] });
    }
  }
}
