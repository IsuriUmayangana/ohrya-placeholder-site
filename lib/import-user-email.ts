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
const CONTENT_PADDING = "24px 40px 40px";

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
  return `margin:0 0 16px;font-family:${FONT_FAMILY};font-size:${BODY_FONT_SIZE};font-weight:500;line-height:${BODY_LINE_HEIGHT};letter-spacing:0;color:${TEXT_COLOR};`;
}

export function buildImportUserEmailText(params: ImportUserEmailParams): string {
  const name = displayName(params);

  return `Hi ${name},

Welcome to OHRYA!

Your personal referral link is ready inside your dashboard:
${params.dashboardUrl}

Start sharing it with friends, family, and your community. Every eligible person who joins through your link counts toward your participation.

Share your link and start making an impact.

- The OHRYA Team`;
}

export function buildImportUserEmailHtml(
  params: ImportUserEmailParams,
  options: ImportUserEmailOptions = {}
): string {
  const name = escapeHtml(displayName(params));
  const dashboardUrl = escapeHtml(params.dashboardUrl);
  const assetBase = (options.assetBaseUrl || getEmailAssetBaseUrl()).replace(/\/$/, "");
  const headerUrl = `${assetBase}/email/header-spiral-logo.png`;
  const textStyle = bodyTextStyle();

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
            <td align="center" style="padding:0;line-height:0;font-size:0;">
              <img
                src="${headerUrl}"
                alt="OHRYA — Give • Vote • Shine"
                width="${EMAIL_WIDTH}"
                style="display:block;width:100%;max-width:${EMAIL_WIDTH}px;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;"
              />
            </td>
          </tr>
          <tr>
            <td style="padding:${CONTENT_PADDING};text-align:left;">
              <p style="${textStyle}">
                Hi ${name},
              </p>
              <p style="${textStyle}">
                Welcome to OHRYA!
              </p>
              <p style="${textStyle}">
                Your personal referral link is ready inside your dashboard:
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
                <tr>
                  <td align="left">
                    <a
                      href="${dashboardUrl}"
                      style="display:inline-block;background:${BUTTON_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-family:${FONT_FAMILY};font-size:16px;font-weight:500;line-height:1.2;"
                    >
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="${textStyle}">
                Start sharing it with friends, family, and your community. Every eligible person who joins through your link counts toward your participation.
              </p>
              <p style="${textStyle}">
                Share your link and start making an impact.
              </p>
              <p style="margin:0;font-family:${FONT_FAMILY};font-size:${BODY_FONT_SIZE};font-weight:500;line-height:${BODY_LINE_HEIGHT};letter-spacing:0;color:${TEXT_COLOR};">
                - The OHRYA Team
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
