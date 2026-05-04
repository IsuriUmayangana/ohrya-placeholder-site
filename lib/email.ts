import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function getSesClient() {
  const accessKeyId = process.env.OHRYA_AWS_KEY_ID;
  const secretAccessKey = process.env.OHRYA_AWS_SECRET;
  const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
  return new SESClient({ region: process.env.AWS_REGION ?? "us-east-1", credentials });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const from = process.env.SES_FROM_EMAIL;

  if (!from) {
    console.warn(`[OTP] SES_FROM_EMAIL not set — code for ${to}: ${code}`);
    return;
  }

  const client = getSesClient();
  await client.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "Your OHRYA dashboard access code", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `Your OHRYA verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
            Charset: "UTF-8",
          },
          Html: {
            Charset: "UTF-8",
            Data: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">OHRYA</p>
          <h1 style="margin:0 0 8px;font-size:24px;color:#2d2d2d;font-weight:normal;">Your verification code</h1>
          <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
            Enter this code to access your OHRYA impact dashboard.
          </p>
          <div style="background:#f0f9fb;border:1px solid #d0ecf0;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
            <span style="font-family:monospace;font-size:40px;font-weight:bold;color:#5a9aaa;letter-spacing:10px;">${code}</span>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="margin:0;font-size:12px;color:#d1d5db;">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">OHRYA — Making social impact visible</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
          },
        },
      },
    })
  );
}
