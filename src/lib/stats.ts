import { DailyMetrics, Workout, localDateKey } from "./store";

const dayKey = localDateKey;
const shift = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

export interface SeriesPoint {
  date: string;
  label: string;
  value: number | null;
}

export type MetricKey =
  | "steps"
  | "activeMinutes"
  | "workouts"
  | "sleepHours"
  | "fatigueLevel"
  | "soreness"
  | "waterMl"
  | "calories"
  | "proteinG"
  | "weightKg"
  | "restingHr";

/**
 * Build a contiguous N-day series for a metric. Workouts is derived from logged
 * sessions; everything else reads from metrics record.
 */
export function buildSeries(
  key: MetricKey,
  days: number,
  metrics: Record<string, DailyMetrics>,
  workouts: Workout[],
): SeriesPoint[] {
  const today = new Date();
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = shift(today, -i);
    const k = dayKey(d);
    let value: number | null = null;
    if (key === "workouts") {
      const c = workouts.filter((w) => w.date === k).reduce((s, w) => s + w.durationMin, 0);
      value = c;
    } else {
      const m = metrics[k];
      const raw = m ? (m[key as keyof DailyMetrics] as number | undefined) : undefined;
      value = typeof raw === "number" && !Number.isNaN(raw) && raw !== 0 ? raw : raw === 0 ? 0 : null;
      // For booleans-of-presence (water/steps), treat 0 as null so charts skip
      if ((key === "waterMl" || key === "steps" || key === "sleepHours") && raw === 0) value = null;
    }
    out.push({
      date: k,
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      value,
    });
  }
  return out;
}

export function seriesStats(series: SeriesPoint[]) {
  const vals = series.map((p) => p.value).filter((v): v is number => v !== null);
  if (vals.length === 0) return { avg: 0, min: 0, max: 0, last: 0, count: 0, trend: 0 };
  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / vals.length;
  const last = vals[vals.length - 1];
  // Trend = last vs avg of prior values
  const prior = vals.slice(0, -1);
  const priorAvg = prior.length ? prior.reduce((a, b) => a + b, 0) / prior.length : last;
  const trend = priorAvg === 0 ? 0 : ((last - priorAvg) / Math.abs(priorAvg)) * 100;
  return {
    avg,
    min: Math.min(...vals),
    max: Math.max(...vals),
    last,
    count: vals.length,
    trend,
  };
}
