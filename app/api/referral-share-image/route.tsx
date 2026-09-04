import {
  renderReferralShareImage,
  type ReferralShareImageFormat,
} from "@/lib/referral-share-image-server";

export const runtime = "nodejs";

/** Public preview image for social crawlers (WhatsApp, Facebook, iMessage). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim();
  if (!ref) {
    return new Response("Missing ref parameter", { status: 400 });
  }

  const format: ReferralShareImageFormat =
    searchParams.get("format") === "story" ? "story" : "post";

  const image = await renderReferralShareImage(ref, format);
  image.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
  return image;
}
