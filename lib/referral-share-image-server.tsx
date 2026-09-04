import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { REFERRAL_SHARE_MESSAGE } from "@/lib/referral-share";
import { buildReferralSignupUrl } from "@/lib/site-urls";

export type ReferralShareImageFormat = "post" | "story";

async function loadLogoDataUrl(): Promise<string> {
  const logoPath = join(process.cwd(), "public", "email", "ohrya-logo-primary.png");
  const logoPng = await readFile(logoPath);
  return `data:image/png;base64,${logoPng.toString("base64")}`;
}

export async function renderReferralShareImage(
  referralCode: string,
  format: ReferralShareImageFormat = "post"
): Promise<ImageResponse> {
  const logoSrc = await loadLogoDataUrl();
  const referralLink = buildReferralSignupUrl(referralCode);
  const displayLink = referralLink.replace(/^https?:\/\//, "");

  if (format === "story") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #F1FBFF 0%, #FFFFFF 55%, #F1FBFF 100%)",
            padding: "80px 64px",
          }}
        >
          <img src={logoSrc} width={320} height={274} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 600, color: "#2F718B", lineHeight: 1.35 }}>
              {REFERRAL_SHARE_MESSAGE}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#699BB0",
                padding: "16px 28px",
                borderRadius: 16,
                background: "#EEF5F6",
              }}
            >
              {displayLink}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#2F718B" }}>Give • Vote • Shine</div>
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #F1FBFF 0%, #FFFFFF 100%)",
          padding: "48px 64px",
        }}
      >
        <img src={logoSrc} width={280} height={240} alt="" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 680,
            marginLeft: 40,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 600, color: "#2F718B", lineHeight: 1.35 }}>
            {REFERRAL_SHARE_MESSAGE}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#699BB0" }}>{displayLink}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#2F718B" }}>Give • Vote • Shine</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
