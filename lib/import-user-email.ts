import "server-only";

/**
 * Email copy for admin bulk sends after CSV import.
 * Update SUBJECT, TEXT_BODY, and HTML_BODY when final copy is ready.
 */
export const IMPORT_USER_EMAIL_SUBJECT = "Welcome to OHRYA";

export type ImportUserEmailParams = {
  name: string;
  email: string;
  campaign: string;
  dashboardUrl: string;
};

function displayName(params: ImportUserEmailParams): string {
  const trimmed = params.name.trim();
  if (trimmed) return trimmed;
  const local = params.email.split("@")[0] || "there";
  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, " ");
}

export function buildImportUserEmailText(params: ImportUserEmailParams): string {
  const name = displayName(params);

  return `Hi ${name},

Thank you for being part of OHRYA.

You can view your impact dashboard here:
${params.dashboardUrl}

Share your referral link to grow your impact and climb the leaderboard.

— The OHRYA Team`;
}

export function buildImportUserEmailHtml(params: ImportUserEmailParams): string {
  const name = displayName(params);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">OHRYA</p>
          <h1 style="margin:0 0 8px;font-size:24px;color:#2d2d2d;font-weight:normal;">Welcome, ${name}</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
            Thank you for being part of OHRYA.
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
            View your impact dashboard and share your referral link to grow your score.
          </p>
          <a href="${params.dashboardUrl}" style="display:inline-block;background:#5a9aaa;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:14px;">
            Open my dashboard
          </a>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">OHRYA — Making social impact visible</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
