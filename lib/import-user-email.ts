import "server-only";

import { MAIN_SITE_ORIGIN } from "@/lib/site-urls";

/**
 * Email copy for admin bulk sends after CSV import.
 */
export const IMPORT_USER_EMAIL_SUBJECT = "Welcome to OHRYA";

export type ImportUserEmailParams = {
  name: string;
  email: string;
  campaign: string;
  dashboardUrl: string;
};

export type ImportUserEmailOptions = {
  assetBaseUrl?: string;
};

const TEXT_COLOR = "#1A5166";
const BUTTON_COLOR = "#699bb0";
const FONT_FAMILY = "Inter, Arial, Helvetica, sans-serif";
const BODY_FONT_SIZE = "16px";
const BODY_LINE_HEIGHT = "24px";
const EMAIL_WIDTH = 600;
const CONTENT_PADDING = "0 48px 40px";
const BURST_SECTION_PADDING = "40px 48px 0";
// Figma: 1033×1033 burst, #F1FBFF, top flush, center aligned to logo sun icon
const BURST_SIZE = 1033;
const BURST_NATIVE_HEIGHT = 728;
const BURST_RADIAL_CENTER_Y = 329;
const FIGMA_FRAME_WIDTH = 1080;
const LOGO_SUN_Y = 110;

export function getEmailAssetBaseUrl(): string {
  return (
    process.env.EMAIL_ASSET_BASE_URL?.trim() ||
    MAIN_SITE_ORIGIN ||
    "https://www.ohrya.org"
  ).replace(/\/$/, "");
}

function displayName(params: ImportUserEmailParams): string {
  const trimmed = params.name.trim();
  if (trimmed) return trimmed;
  const local = params.email.split("@")[0] || "there";
  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, " ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bodyTextStyle(): string {
  return `margin:0 0 16px;font-family:${FONT_FAMILY};font-size:${BODY_FONT_SIZE};font-weight:500;line-height:${BODY_LINE_HEIGHT};letter-spacing:0;color:${TEXT_COLOR};text-align:left;`;
}

export function buildImportUserEmailText(params: ImportUserEmailParams): string {
  const name = displayName(params);

  return `Hi ${name},

Welcome to OHRYA!

Your personal referral link is ready inside your dashboard:
${params.dashboardUrl}

Start sharing it with friends, family, and your community. Every eligible person who joins through your link counts toward your participation.

Share your link and start making an impact.

The OHRYA Team`;
}

export function buildImportUserEmailHtml(
  params: ImportUserEmailParams,
  options: ImportUserEmailOptions = {}
): string {
  const name = escapeHtml(displayName(params));
  const dashboardUrl = escapeHtml(params.dashboardUrl);
  const assetBase = (options.assetBaseUrl || getEmailAssetBaseUrl()).replace(/\/$/, "");
  const burstUrl = `${assetBase}/email/burst.png`;
  const logoUrl = `${assetBase}/email/ohrya-logo-primary.png`;
  const textStyle = bodyTextStyle();
  const figmaFrameWidth = FIGMA_FRAME_WIDTH;
  const scale = EMAIL_WIDTH / figmaFrameWidth;
  const burstDisplay = Math.round(BURST_SIZE * scale);
  const burstDisplayHeight = Math.round((BURST_NATIVE_HEIGHT / BURST_SIZE) * burstDisplay);
  const burstCenterY = Math.round((BURST_RADIAL_CENTER_Y / BURST_NATIVE_HEIGHT) * burstDisplayHeight);
  const logoSunY = Math.round(LOGO_SUN_Y * scale);
  const burstOffsetY = logoSunY - burstCenterY;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to OHRYA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:0;">
        <table width="${EMAIL_WIDTH}" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:${EMAIL_WIDTH}px;background:#ffffff;">
          <tr>
            <td
              align="left"
              width="${EMAIL_WIDTH}"
              background="${burstUrl}"
              style="background-color:#ffffff;background-image:url('${burstUrl}');background-repeat:no-repeat;background-position:center ${burstOffsetY}px;background-size:${burstDisplay}px auto;padding:${BURST_SECTION_PADDING};text-align:left;"
            >
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
                <v:fill type="frame" src="${burstUrl}" color="#ffffff" />
                <v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:true;">
              <![endif]-->
              <img
                src="${logoUrl}"
                alt="OHRYA — Give • Vote • Shine"
                width="170"
                style="display:block;width:170px;max-width:170px;height:auto;margin:0 auto 24px;border:0;outline:none;text-decoration:none;"
              />
              <p style="${textStyle}">
                Hi ${name},
              </p>
              <p style="${textStyle}">
                Welcome to OHRYA!
              </p>
              <p style="${textStyle}">
                Your personal referral link is ready inside your dashboard:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 16px;">
                <tr>
                  <td align="left" style="text-align:left;">
                    <a
                      href="${dashboardUrl}"
                      style="display:inline-block;background:${BUTTON_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-family:${FONT_FAMILY};font-size:16px;font-weight:500;line-height:1.2;"
                    >
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:${CONTENT_PADDING};text-align:left;">
              <p style="${textStyle}">
                Start sharing it with friends, family, and your community. Every eligible person who joins through your link counts toward your participation.
              </p>
              <p style="${textStyle}">
                Share your link and start making an impact.
              </p>
              <p style="margin:0;font-family:${FONT_FAMILY};font-size:${BODY_FONT_SIZE};font-weight:500;line-height:${BODY_LINE_HEIGHT};letter-spacing:0;color:${TEXT_COLOR};text-align:left;">
                The OHRYA Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
