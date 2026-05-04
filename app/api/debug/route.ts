import { NextResponse } from "next/server";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tableName = process.env.DYNAMODB_TABLE_NAME ?? "";

  // Check credential-related env vars
  const envInfo = {
    AWS_REGION: process.env.AWS_REGION || "(not set)",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.slice(0, 8)}...` : "(not set)",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "present" : "(not set)",
    AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN ? "present" : "(not set)",
    AWS_CONTAINER_CREDENTIALS_RELATIVE_URI: process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || "(not set)",
    AWS_CONTAINER_CREDENTIALS_FULL_URI: process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI || "(not set)",
    AWS_WEB_IDENTITY_TOKEN_FILE: process.env.AWS_WEB_IDENTITY_TOKEN_FILE || "(not set)",
    AWS_ROLE_ARN: process.env.AWS_ROLE_ARN || "(not set)",
    OHRYA_AWS_KEY_ID: process.env.OHRYA_AWS_KEY_ID ? `${process.env.OHRYA_AWS_KEY_ID.slice(0, 8)}...` : "(empty)",
    DYNAMODB_TABLE_NAME: tableName || "(empty)",
  };

  // Test 1: Default credential chain (no explicit credentials)
  let defaultChainTest = "not tested";
  try {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const result = await client.send(new ListTablesCommand({ Limit: 1 }));
    defaultChainTest = `SUCCESS - tables: ${JSON.stringify(result.TableNames)}`;
  } catch (err) {
    defaultChainTest = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  // Test 2: Explicit IAM user credentials
  let explicitCredsTest = "not tested";
  const keyId = process.env.OHRYA_AWS_KEY_ID ?? "";
  const secret = process.env.OHRYA_AWS_SECRET ?? "";
  if (keyId && secret) {
    try {
      const client = new DynamoDBClient({
        region: "us-east-1",
        credentials: { accessKeyId: keyId, secretAccessKey: secret },
      });
      const result = await client.send(new ListTablesCommand({ Limit: 1 }));
      explicitCredsTest = `SUCCESS - tables: ${JSON.stringify(result.TableNames)}`;
    } catch (err) {
      explicitCredsTest = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }
  } else {
    explicitCredsTest = "skipped - OHRYA_AWS_KEY_ID not set";
  }

  return NextResponse.json({ envInfo, defaultChainTest, explicitCredsTest });
}
