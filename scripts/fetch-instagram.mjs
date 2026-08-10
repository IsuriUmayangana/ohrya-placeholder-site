/**
 * Fetches the latest Instagram posts/reels and writes public/data/instagram.json.
 *
 * Usage: npm run fetch:instagram
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchInstagramFeed } from "./lib/instagram-feed.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "public", "data", "instagram.json");

try {
  const feed = await fetchInstagramFeed();
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
  console.log(`Wrote ${feed.items.length} post(s)/reel(s) to public/data/instagram.json`);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
