import "server-only";

import fs from "fs";
import path from "path";
import type { PublicUserStats, SurveyResponse } from "@/lib/survey-types";

export type { PublicUserStats, SurveyResponse } from "@/lib/survey-types";

const useDynamo = Boolean(process.env.DYNAMODB_TABLE_NAME?.trim());

type StoreDynamoModule = typeof import("@/lib/store-dynamo");
let dynamoModulePromise: Promise<StoreDynamoModule> | null = null;

function loadDynamo(): Promise<StoreDynamoModule> {
  if (!dynamoModulePromise) {
    dynamoModulePromise = import("@/lib/store-dynamo");
  }
  return dynamoModulePromise;
}

// ── File-based persistence (local / fallback) ─────────────────────────────
const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDB(): SurveyResponse[] {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return (JSON.parse(raw) as { responses: SurveyResponse[] }).responses ?? [];
  } catch {
    return [];
  }
}

function writeDB(responses: SurveyResponse[]): void {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ responses }, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write DB:", err);
  }
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function emailToSlug(email: string): string {
  const local = email.split("@")[0];
  return local
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function fileSaveResponse(
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
  > & { device?: SurveyResponse["device"] }
): Promise<SurveyResponse> {
  const responses = readDB();

  if (data.referredBy) {
    const referrer = responses.find((r) => r.referralCode === data.referredBy);
    if (referrer) {
      referrer.referralScore += 1;
      referrer.referralCount += 1;
    }
  }

  const now = new Date();
  const startedAt = data.startedAt ? new Date(data.startedAt) : now;
  const timeToCompleteSeconds = Math.max(
    0,
    Math.round((now.getTime() - startedAt.getTime()) / 1000)
  );

  const referralCode = generateCode();
  const emailSlug = `${emailToSlug(data.email)}-${referralCode.toLowerCase()}`;

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

  responses.push(response);
  writeDB(responses);
  return response;
}

export async function saveResponse(
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
  > & { device?: SurveyResponse["device"] }
): Promise<SurveyResponse> {
  if (useDynamo) {
    const d = await loadDynamo();
    return d.dynamoSaveResponse(data, { generateCode, emailToSlug });
  }
  return fileSaveResponse(data);
}

export async function getUserByCode(code: string): Promise<PublicUserStats | null> {
  if (useDynamo) return (await loadDynamo()).dynamoGetUserByCode(code);
  const responses = readDB();
  const r = responses.find((res) => res.referralCode === code.toUpperCase());
  return r ? toPublic(r) : null;
}

export async function getUserBySlug(slug: string): Promise<PublicUserStats | null> {
  if (useDynamo) return (await loadDynamo()).dynamoGetUserBySlug(slug);
  const responses = readDB();
  const r = responses.find((res) => res.emailSlug === slug.toLowerCase());
  return r ? toPublic(r) : null;
}

export async function getUserByEmail(email: string): Promise<PublicUserStats | null> {
  if (useDynamo) return (await loadDynamo()).dynamoGetUserByEmail(email);
  const responses = readDB();
  const r = responses.find((res) => res.email.toLowerCase() === email.toLowerCase().trim());
  return r ? toPublic(r) : null;
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  if (useDynamo) return (await loadDynamo()).dynamoGetAllResponses();
  return readDB();
}

export async function getStats() {
  if (useDynamo) return (await loadDynamo()).dynamoGetStats();
  const responses = readDB();
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
