import "server-only";

import fs from "fs";
import path from "path";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  emailLower: string;
  code: string;
  emailSlug: string;
  expiresAt: number; // epoch ms
  attempts: number;
}

// ── File-based (local dev) ────────────────────────────────────────────────────

const OTP_PATH = path.join(process.cwd(), "data", "otps.json");

function readOtps(): OtpRecord[] {
  try {
    const raw = fs.readFileSync(OTP_PATH, "utf-8");
    return JSON.parse(raw) as OtpRecord[];
  } catch {
    return [];
  }
}

function writeOtps(records: OtpRecord[]): void {
  try {
    fs.mkdirSync(path.dirname(OTP_PATH), { recursive: true });
    fs.writeFileSync(OTP_PATH, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write OTPs:", err);
  }
}

// ── DynamoDB-based ────────────────────────────────────────────────────────────

const useDynamo = Boolean(process.env.DYNAMODB_TABLE_NAME?.trim());

async function getDynamoClient() {
  const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient } = await import("@aws-sdk/lib-dynamodb");
  return DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" })
  );
}

async function dynamoSaveOtp(emailLower: string, code: string, emailSlug: string): Promise<void> {
  const { QueryCommand, UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
  const doc = await getDynamoClient();
  const tbl = process.env.DYNAMODB_TABLE_NAME!;

  const q = await doc.send(
    new QueryCommand({
      TableName: tbl,
      IndexName: "EmailIndex",
      KeyConditionExpression: "emailLower = :e",
      ExpressionAttributeValues: { ":e": emailLower },
      Limit: 1,
    })
  );

  const item = q.Items?.[0];
  if (!item?.id) throw new Error("User not found");

  await doc.send(
    new UpdateCommand({
      TableName: tbl,
      Key: { id: item.id },
      UpdateExpression: "SET otpCode = :c, otpExpiry = :x, otpAttempts = :z",
      ExpressionAttributeValues: {
        ":c": code,
        ":x": Date.now() + OTP_EXPIRY_MS,
        ":z": 0,
      },
    })
  );
}

async function dynamoVerifyOtp(
  emailLower: string,
  code: string
): Promise<{ valid: boolean; emailSlug?: string }> {
  const { QueryCommand, UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
  const doc = await getDynamoClient();
  const tbl = process.env.DYNAMODB_TABLE_NAME!;

  const q = await doc.send(
    new QueryCommand({
      TableName: tbl,
      IndexName: "EmailIndex",
      KeyConditionExpression: "emailLower = :e",
      ExpressionAttributeValues: { ":e": emailLower },
      Limit: 1,
    })
  );

  const item = q.Items?.[0];
  if (!item?.id) return { valid: false };

  const attempts = (item.otpAttempts as number) ?? 0;
  const expiry = (item.otpExpiry as number) ?? 0;

  if (attempts >= MAX_ATTEMPTS) return { valid: false };
  if (Date.now() > expiry) return { valid: false };

  if (item.otpCode !== code) {
    await doc.send(
      new UpdateCommand({
        TableName: tbl,
        Key: { id: item.id },
        UpdateExpression: "SET otpAttempts = :a",
        ExpressionAttributeValues: { ":a": attempts + 1 },
      })
    );
    return { valid: false };
  }

  await doc.send(
    new UpdateCommand({
      TableName: tbl,
      Key: { id: item.id },
      UpdateExpression: "REMOVE otpCode, otpExpiry, otpAttempts",
    })
  );

  return { valid: true, emailSlug: item.emailSlug as string };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function saveOtp(email: string, code: string, emailSlug: string): Promise<void> {
  const emailLower = email.toLowerCase().trim();
  if (useDynamo) {
    await dynamoSaveOtp(emailLower, code, emailSlug);
    return;
  }
  const records = readOtps().filter((r) => r.emailLower !== emailLower);
  records.push({ emailLower, code, emailSlug, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
  writeOtps(records);
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<{ valid: boolean; emailSlug?: string }> {
  const emailLower = email.toLowerCase().trim();

  if (useDynamo) {
    return dynamoVerifyOtp(emailLower, code);
  }

  const records = readOtps();
  const idx = records.findIndex((r) => r.emailLower === emailLower);

  if (idx === -1) return { valid: false };

  const rec = records[idx];
  if (rec.attempts >= MAX_ATTEMPTS) return { valid: false };
  if (Date.now() > rec.expiresAt) return { valid: false };

  if (rec.code !== code) {
    records[idx] = { ...rec, attempts: rec.attempts + 1 };
    writeOtps(records);
    return { valid: false };
  }

  records.splice(idx, 1);
  writeOtps(records);
  return { valid: true, emailSlug: rec.emailSlug };
}
