import "server-only";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { PublicUserStats, SurveyResponse, SURVEY_SCORE } from "@/lib/survey-types";

function getDoc() {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const accessKeyId = process.env.OHRYA_AWS_KEY_ID;
  const secretAccessKey = process.env.OHRYA_AWS_SECRET;
  const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
  return DynamoDBDocumentClient.from(new DynamoDBClient({ region, credentials }));
}

export const REFERRAL_CODE_GSI = "ReferralCodeIndex";
export const EMAIL_SLUG_GSI = "EmailSlugIndex";
export const EMAIL_GSI = "EmailIndex";

function tableName(): string {
  const t = process.env.DYNAMODB_TABLE_NAME;
  if (!t) throw new Error("DYNAMODB_TABLE_NAME is not set");
  return t;
}

/**
 * Referral bonus formula.
 * clicks    = 0 (not tracked yet; keeping the variable for future use)
 * donations = 0 (not tracked yet; keeping the variable for future use)
 *
 * ClickNew  = clicks + 50
 * SCR       = (signUps + 1) / (ClickNew + 1)
 * DCR       = (donations + 1) / (signUps + 1)
 * BaseScore = (3 × SCR) + (30 × DCR)
 * Efficiency= (signUps + donations) / ClickNew
 * Multiplier= Efficiency ^ 0.5
 * LogVolume = ln(1 + signUps + donations)
 * MS        = BaseScore × LogVolume × Multiplier
 * MSE       = MS × 100
 */
function calcReferralScore(referralCount: number, donations = 0, clicks = 0): number {
  const signUps = referralCount;
  const clickNew = clicks + 50;
  const scr = (signUps + 1) / (clickNew + 1);
  const dcr = (donations + 1) / (signUps + 1);
  const baseScore = 3 * scr + 30 * dcr;
  const efficiency = (signUps + donations) / clickNew;
  const multiplier = Math.sqrt(efficiency);
  const logVolume = Math.log(1 + signUps + donations);
  const ms = baseScore * logVolume * multiplier;
  return Math.round(ms * 100 * 100) / 100;
}

function toPublic(r: SurveyResponse): PublicUserStats {
  const referralScore = calcReferralScore(r.referralCount, 0, r.referralClicks ?? 0);
  return {
    referralCode: r.referralCode,
    emailSlug: r.emailSlug,
    email: r.email,
    surveyScore: SURVEY_SCORE,
    referralScore,
    referralCount: r.referralCount,
    campaign: r.campaign,
    totalScore: SURVEY_SCORE + referralScore,
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
    | "referralClicks"
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

  const doc = getDoc();

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
    surveyScore: SURVEY_SCORE,
    id: Math.random().toString(36).slice(2, 10),
    referralCode,
    emailSlug,
    referralScore: 0,
    referralCount: 0,
    referralClicks: 0,
    submittedAt: now.toISOString(),
    timeToCompleteSeconds,
    device: data.device ?? "Other",
  };

  await doc.send(
    new PutCommand({
      TableName: tbl,
      Item: { ...response, emailLower },
    })
  );

  return response;
}

export async function dynamoGetUserByCode(code: string): Promise<PublicUserStats | null> {
  const doc = getDoc();
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
  const doc = getDoc();
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
  const doc = getDoc();
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
  const doc = getDoc();
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

export async function dynamoIncrementReferralClicks(code: string): Promise<void> {
  const doc = getDoc();
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
  const ref = q.Items?.[0];
  if (ref?.id) {
    await doc.send(
      new UpdateCommand({
        TableName: tbl,
        Key: { id: ref.id },
        UpdateExpression: "ADD referralClicks :one",
        ExpressionAttributeValues: { ":one": 1 },
      })
    );
  }
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
