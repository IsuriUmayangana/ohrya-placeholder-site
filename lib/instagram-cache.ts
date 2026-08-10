import type { InstagramFeed } from "@/lib/instagram-feed";

const CACHE_MS = 60 * 60 * 1000; // 1 hour

let cached: InstagramFeed | null = null;
let cachedAt = 0;

export function getCachedInstagramFeed(): InstagramFeed | null {
  if (!cached || Date.now() - cachedAt > CACHE_MS) {
    return null;
  }
  return cached;
}

export function setCachedInstagramFeed(feed: InstagramFeed): void {
  cached = feed;
  cachedAt = Date.now();
}
