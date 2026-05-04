import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keyId = process.env.OHRYA_AWS_KEY_ID ?? "";
  const secret = process.env.OHRYA_AWS_SECRET ?? "";
  const tableName = process.env.DYNAMODB_TABLE_NAME ?? "";
  const sesEmail = process.env.SES_FROM_EMAIL ?? "";

  return NextResponse.json({
    OHRYA_AWS_KEY_ID: keyId ? `${keyId.slice(0, 8)}...` : "(empty)",
    OHRYA_AWS_SECRET: secret ? `${secret.slice(0, 4)}...` : "(empty)",
    DYNAMODB_TABLE_NAME: tableName || "(empty)",
    SES_FROM_EMAIL: sesEmail || "(empty)",
    AWS_REGION: process.env.AWS_REGION || "(not set - will default to us-east-1)",
  });
}
