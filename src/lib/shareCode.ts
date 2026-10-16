import { DailyMetrics, Profile, Workout } from "./store";
import { buildSeries, seriesStats } from "./stats";
import { computeBadges } from "./badges";
import { computeLevel } from "./level";

export interface FriendSnapshot {
  v: 1;
  name: string;
  avatar?: string;
  level: number;
  levelTitle: string;
  badges: number;
  // 7-day averages
  steps: number;
  sleepHours: number;
  waterMl: number;
  workoutMin: number;
  restingHr: number;
  // Goal vibe
  goal?: string;
  createdAt: number;
}

function utf8ToB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlToUtf8(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function buildSnapshot(
  profile: Profile,
  metrics: Record<string, DailyMetrics>,
  workouts: Workout[],
): FriendSnapshot {
  const stepsAvg = seriesStats(buildSeries("steps", 7, metrics, workouts)).avg;
  const sleepAvg = seriesStats(buildSeries("sleepHours", 7, metrics, workouts)).avg;
  const waterAvg = seriesStats(buildSeries("waterMl", 7, metrics, workouts)).avg;
  const woAvg = seriesStats(buildSeries("workouts", 7, metrics, workouts)).avg;
  const hrAvg = seriesStats(buildSeries("restingHr", 7, metrics, workouts)).avg;
  const badges = computeBadges(profile, metrics, workouts).filter((b) => b.achieved).length;
  const lvl = computeLevel(badges);
  return {
    v: 1,
    name: profile.name,
    avatar: profile.avatar,
    level: lvl.level,
    levelTitle: lvl.title,
    badges,
    steps: Math.round(stepsAvg),
    sleepHours: Math.round(sleepAvg * 10) / 10,
    waterMl: Math.round(waterAvg),
    workoutMin: Math.round(woAvg * 7), // 7-day total minutes
    restingHr: Math.round(hrAvg),
    goal: profile.goal,
    createdAt: Date.now(),
  };
}

export function encodeShareCode(snap: FriendSnapshot): string {
  return "VTL1-" + utf8ToB64Url(JSON.stringify(snap));
}

export function decodeShareCode(code: string): FriendSnapshot | null {
  try {
    const c = code.trim();
    const payload = c.startsWith("VTL1-") ? c.slice(5) : c;
    const json = b64UrlToUtf8(payload);
    const obj = JSON.parse(json);
    if (!obj || obj.v !== 1 || typeof obj.name !== "string") return null;
    return obj as FriendSnapshot;
  } catch {
    return null;
  }
}
