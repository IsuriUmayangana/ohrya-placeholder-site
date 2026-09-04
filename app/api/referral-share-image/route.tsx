import {
  renderReferralShareImage,
  type ReferralShareImageFormat,
} from "@/lib/referral-share-image-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim();
  if (!ref) {
    return new Response("Missing ref parameter", { status: 400 });
  }

  const format: ReferralShareImageFormat =
    searchParams.get("format") === "story" ? "story" : "post";

  return renderReferralShareImage(ref, format);
}
