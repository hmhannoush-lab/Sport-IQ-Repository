import type { DailyMetrics, Tournament, Workout } from "./store";
import { formatSets } from "./workoutSets";

/** Quotes a CSV cell when it contains a comma, quote or line break. */
export function csvCell(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

const METRIC_COLUMNS: (keyof DailyMetrics)[] = [
  "date", "sleepHours", "steps", "restingHr", "waterMl", "weightKg", "activeMinutes",
  "calories", "proteinG", "carbG", "fatG", "mood", "fatigueLevel", "soreness",
];

/** Daily metrics as CSV, oldest day first. Values stay metric so the file is unambiguous. */
export function metricsCsv(metrics: Record<string, DailyMetrics>): string {
  const rows = Object.values(metrics)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => METRIC_COLUMNS.map((k) => m[k]));
  return toCsv(METRIC_COLUMNS as string[], rows);
}

export function workoutsCsv(workouts: Workout[]): string {
  const rows = [...workouts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => [w.date, w.type, w.durationMin, w.intensity, formatSets(w.sets ?? [], "metric"), w.notes]);
  return toCsv(["date", "type", "durationMin", "intensity", "sets", "notes"], rows);
}

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsDate = (iso: string) => iso.replace(/-/g, "");

/** A single all-day calendar event for the tournament, with a reminder the day before. */
export function tournamentIcs(t: Tournament, now = new Date()): string {
  const start = new Date(`${t.date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const endKey = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sport IQ//Tournament//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${icsDate(t.date)}-${encodeURIComponent(t.name)}@sport-iq`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(t.date)}`,
    `DTEND;VALUE=DATE:${endKey}`,
    `SUMMARY:${icsEscape(t.name)}`,
    `DESCRIPTION:${icsEscape(`${t.sport ? `${t.sport} event. ` : ""}Taper starts ~10 days out — see Sport IQ for your plan.`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(`${t.name} is tomorrow`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Triggers a browser download of a text file. */
export function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
