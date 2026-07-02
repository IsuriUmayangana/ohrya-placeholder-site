import "server-only";

import fs from "fs";
import path from "path";
import type { PublicUserStats, SurveyResponse } from "@/lib/survey-types";
import { SURVEY_SCORE } from "@/lib/survey-types";

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
  // clicks: actual referral link clicks tracked; falls back to 0 if not yet recorded
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

async function fileSaveResponse(
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
    | "referralClicks"
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

export async function getLeaderboard(): Promise<(PublicUserStats & { name: string })[]> {
  const responses = useDynamo
    ? await (await loadDynamo()).dynamoGetAllResponses()
    : readDB();

  return responses
    .map((r) => {
      const pub = toPublic(r);
      const local = r.email.split("@")[0];
      const name = local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, " ");
      return { ...pub, name };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}

export async function getLeaderboardRankBySlug(slug: string): Promise<number | null> {
  const entries = await getLeaderboard();
  const index = entries.findIndex((e) => e.emailSlug === slug.toLowerCase());
  return index === -1 ? null : index + 1;
}

export async function incrementReferralClicks(code: string): Promise<void> {
  if (useDynamo) {
    const d = await loadDynamo();
    return d.dynamoIncrementReferralClicks(code);
  }
  const responses = readDB();
  const r = responses.find((res) => res.referralCode === code.toUpperCase());
  if (r) {
    r.referralClicks = (r.referralClicks ?? 0) + 1;
    writeDB(responses);
  }
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
