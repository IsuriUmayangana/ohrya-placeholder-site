import { NextResponse } from "next/server";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keyId = process.env.OHRYA_AWS_KEY_ID ?? "";
  const secret = process.env.OHRYA_AWS_SECRET ?? "";
  const tableName = process.env.DYNAMODB_TABLE_NAME ?? "";
  const sesEmail = process.env.SES_FROM_EMAIL ?? "";
  const sessionToken = process.env.AWS_SESSION_TOKEN ?? "";

  // Try a real DynamoDB call with explicit credentials
  let dynamoTest = "not tested";
  try {
    const credentials = keyId && secret ? { accessKeyId: keyId, secretAccessKey: secret } : undefined;
    const client = new DynamoDBClient({
      region: "us-east-1",
      credentials,
    });
    const result = await client.send(new ListTablesCommand({ Limit: 1 }));
    dynamoTest = `SUCCESS - tables: ${JSON.stringify(result.TableNames)}`;
  } catch (err) {
    dynamoTest = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    OHRYA_AWS_KEY_ID: keyId ? `${keyId.slice(0, 8)}...` : "(empty)",
    OHRYA_AWS_SECRET: secret ? `${secret.slice(0, 4)}...` : "(empty)",
    DYNAMODB_TABLE_NAME: tableName || "(empty)",
    SES_FROM_EMAIL: sesEmail || "(empty)",
    AWS_REGION: process.env.AWS_REGION || "(not set)",
    AWS_SESSION_TOKEN: sessionToken ? `present (${sessionToken.slice(0, 6)}...)` : "(not set)",
    dynamoTest,
  });
}
