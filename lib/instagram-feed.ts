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

export type InstagramFeedItem = {
  id: string;
  caption: string;
  mediaType: string;
  mediaProductType: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp: string;
};

export type InstagramFeed = {
  updatedAt: string;
  items: InstagramFeedItem[];
};

function mapItem(item: Record<string, string | undefined>): InstagramFeedItem {
  return {
    id: item.id ?? "",
    caption: item.caption || "",
    mediaType: item.media_type ?? "",
    mediaProductType: item.media_product_type || null,
    mediaUrl: item.media_url || null,
    thumbnailUrl: item.thumbnail_url || null,
    permalink: item.permalink ?? "",
    timestamp: item.timestamp ?? "",
  };
}

function isDisplayable(item: InstagramFeedItem): boolean {
  return Boolean(item.permalink && (item.thumbnailUrl || item.mediaUrl));
}

import { getInstagramCredentials } from "@/lib/instagram-credentials";

export function getInstagramConfig() {
  return getInstagramCredentials();
}

export async function fetchInstagramFeed(
  { limit = FEED_LIMIT } = {},
): Promise<InstagramFeed> {
  const { userId, accessToken } = getInstagramCredentials();
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

  const payload = (await response.json()) as { data?: Record<string, string | undefined>[] };
  const items = (payload.data || [])
    .map(mapItem)
    .filter(isDisplayable)
    .slice(0, limit);

  return {
    updatedAt: new Date().toISOString(),
    items,
  };
}
