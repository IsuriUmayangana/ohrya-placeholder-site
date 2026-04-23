import "server-only";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { PublicUserStats, SurveyResponse } from "@/lib/survey-types";

const REGION = process.env.AWS_REGION ?? "us-east-1";

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

export const REFERRAL_CODE_GSI = "ReferralCodeIndex";
export const EMAIL_SLUG_GSI = "EmailSlugIndex";
export const EMAIL_GSI = "EmailIndex";

function tableName(): string {
  const t = process.env.DYNAMODB_TABLE_NAME;
  if (!t) throw new Error("DYNAMODB_TABLE_NAME is not set");
  return t;
}

function toPublic(r: SurveyResponse): PublicUserStats {
  return {
    referralCode: r.referralCode,
    emailSlug: r.emailSlug,
    email: r.email,
    surveyScore: r.surveyScore,
    referralScore: r.referralScore,
    referralCount: r.referralCount,
    campaign: r.campaign,
    totalScore: r.surveyScore + r.referralScore,
  };
}

function itemToResponse(item: Record<string, unknown>): SurveyResponse {
  return item as unknown as SurveyResponse;
}

export async function dynamoSaveResponse(
  data: Omit<
    SurveyResponse,
    | "id"
    | "referralCode"
    | "emailSlug"
    | "referralScore"
    | "referralCount"
    | "submittedAt"
    | "timeToCompleteSeconds"
    | "device"
  > & { device?: SurveyResponse["device"] },
  helpers: {
    generateCode: () => string;
    emailToSlug: (email: string) => string;
  }
): Promise<SurveyResponse> {
  const tbl = tableName();
  const referredBy = (data.referredBy || "").trim().toUpperCase();

  if (referredBy) {
    const q = await doc.send(
      new QueryCommand({
        TableName: tbl,
        IndexName: REFERRAL_CODE_GSI,
        KeyConditionExpression: "referralCode = :c",
        ExpressionAttributeValues: { ":c": referredBy },
        Limit: 1,
      })
    );
    const ref = q.Items?.[0];
    if (ref?.id) {
      await doc.send(
        new UpdateCommand({
          TableName: tbl,
          Key: { id: ref.id },
          UpdateExpression: "ADD referralScore :one, referralCount :one",
          ExpressionAttributeValues: { ":one": 1 },
        })
      );
    }
  }

  const now = new Date();
  const startedAt = data.startedAt ? new Date(data.startedAt) : now;
  const timeToCompleteSeconds = Math.max(
    0,
    Math.round((now.getTime() - startedAt.getTime()) / 1000)
  );

  const referralCode = helpers.generateCode();
  const emailSlug = `${helpers.emailToSlug(data.email)}-${referralCode.toLowerCase()}`;
  const emailLower = data.email.toLowerCase().trim();

  const response: SurveyResponse = {
    ...data,
    id: Math.random().toString(36).slice(2, 10),
    referralCode,
    emailSlug,
    referralScore: 0,
    referralCount: 0,
    submittedAt: now.toISOString(),
    timeToCompleteSeconds,
    device: data.device ?? "Other",
  };

  await doc.send(
    new PutCommand({
      TableName: tbl,
      Item: {
        ...response,
        emailLower,
      },
    })
  );

  return response;
}

export async function dynamoGetUserByCode(code: string): Promise<PublicUserStats | null> {
  const tbl = tableName();
  const q = await doc.send(
    new QueryCommand({
      TableName: tbl,
      IndexName: REFERRAL_CODE_GSI,
      KeyConditionExpression: "referralCode = :c",
      ExpressionAttributeValues: { ":c": code.toUpperCase() },
      Limit: 1,
    })
  );
  const item = q.Items?.[0];
  if (!item) return null;
  return toPublic(itemToResponse(item));
}

export async function dynamoGetUserBySlug(slug: string): Promise<PublicUserStats | null> {
  const tbl = tableName();
  const q = await doc.send(
    new QueryCommand({
      TableName: tbl,
      IndexName: EMAIL_SLUG_GSI,
      KeyConditionExpression: "emailSlug = :s",
      ExpressionAttributeValues: { ":s": slug.toLowerCase() },
      Limit: 1,
    })
  );
  const item = q.Items?.[0];
  if (!item) return null;
  return toPublic(itemToResponse(item));
}

export async function dynamoGetUserByEmail(email: string): Promise<PublicUserStats | null> {
  const tbl = tableName();
  const q = await doc.send(
    new QueryCommand({
      TableName: tbl,
      IndexName: EMAIL_GSI,
      KeyConditionExpression: "emailLower = :e",
      ExpressionAttributeValues: { ":e": email.toLowerCase().trim() },
      Limit: 1,
    })
  );
  const item = q.Items?.[0];
  if (!item) return null;
  return toPublic(itemToResponse(item));
}

export async function dynamoGetAllResponses(): Promise<SurveyResponse[]> {
  const tbl = tableName();
  const out: SurveyResponse[] = [];
  let cursor: Record<string, unknown> | undefined;

  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: tbl,
        ExclusiveStartKey: cursor,
      })
    );
    for (const item of page.Items ?? []) {
      const { emailLower: _e, ...rest } = item as Record<string, unknown>;
      out.push(itemToResponse(rest));
    }
    cursor = page.LastEvaluatedKey;
  } while (cursor);

  return out;
}

export async function dynamoGetStats() {
  const responses = await dynamoGetAllResponses();
  const total = responses.length;
  const avgScore =
    total > 0
      ? responses.reduce((s, r) => s + r.surveyScore + r.referralScore, 0) / total
      : 0;
  const campaigns = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.campaign] = (acc[r.campaign] || 0) + 1;
    return acc;
  }, {});
  return { total, avgScore: Math.round(avgScore * 10) / 10, campaigns };
}
