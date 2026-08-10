/**
 * Shared Instagram Graph API feed helpers.
 */

export const API_VERSION = "v22.0";
export const FEED_LIMIT = 10;

const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_product_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
].join(",");

export function getInstagramConfig(env = process.env) {
  const userId = env.IG_USER_ID;
  const accessToken = env.IG_ACCESS_TOKEN;

  if (!userId || !accessToken) {
    throw new Error(
      "Missing IG_USER_ID or IG_ACCESS_TOKEN. Copy .env.example to .env and fill in values.",
    );
  }

  return { userId, accessToken };
}

function mapItem(item) {
  return {
    id: item.id,
    caption: item.caption || "",
    mediaType: item.media_type,
    mediaProductType: item.media_product_type || null,
    mediaUrl: item.media_url || null,
    thumbnailUrl: item.thumbnail_url || null,
    permalink: item.permalink,
    timestamp: item.timestamp,
  };
}

function isDisplayable(item) {
  return Boolean(item.permalink && (item.thumbnailUrl || item.mediaUrl));
}

export async function fetchInstagramFeed(env = process.env, { limit = FEED_LIMIT } = {}) {
  const { userId, accessToken } = getInstagramConfig(env);
  const isInstagramLogin = accessToken.startsWith("IGAA");
  const host = isInstagramLogin ? "graph.instagram.com" : "graph.facebook.com";
  const mediaPath = isInstagramLogin ? "me/media" : `${userId}/media`;

  const url = new URL(`https://${host}/${API_VERSION}/${mediaPath}`);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Graph API error ${response.status}: ${body}`);
  }

  const payload = await response.json();
  const items = (payload.data || [])
    .map(mapItem)
    .filter(isDisplayable)
    .slice(0, limit);

  return {
    updatedAt: new Date().toISOString(),
    items,
  };
}
