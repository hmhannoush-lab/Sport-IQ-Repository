import { Workout, localDateKey } from "./store";

// Session-RPE method (Foster): load = minutes × perceived effort (1–10).
const RPE: Record<Workout["intensity"], number> = { low: 3, medium: 5, high: 8 };

export type LoadZone = "building" | "under" | "optimal" | "caution" | "high";

export interface TrainingLoad {
  /** Load over the last 7 days. */
  acute: number;
  /** Average weekly load over the last 28 days. */
  chronic: number;
  /** acute ÷ chronic, null until there is enough history. */
  ratio: number | null;
  zone: LoadZone;
  /** Weekly totals, oldest first (4 weeks). */
  weeks: number[];
}

export function sessionLoad(w: Workout) {
  return w.durationMin * RPE[w.intensity];
}

export function computeTrainingLoad(workouts: Workout[], today: Date = new Date()): TrainingLoad {
  const byDay = new Map<string, number>();
  for (const w of workouts) byDay.set(w.date, (byDay.get(w.date) ?? 0) + sessionLoad(w));

  // weeks[3] is the most recent 7 days.
  const weeks = [0, 0, 0, 0];
  let firstLoggedIndex = -1;
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const load = byDay.get(localDateKey(d)) ?? 0;
    weeks[3 - Math.floor(i / 7)] += load;
    if (load > 0) firstLoggedIndex = i;
  }

  const acute = weeks[3];
  const chronic = weeks.reduce((a, b) => a + b, 0) / 4;
  // The ratio is only meaningful with ~3 weeks of history.
  const ratio = firstLoggedIndex >= 14 && chronic > 0 ? acute / chronic : null;

  let zone: LoadZone = "building";
  if (ratio !== null) {
    if (ratio < 0.8) zone = "under";
    else if (ratio <= 1.3) zone = "optimal";
    else if (ratio <= 1.5) zone = "caution";
    else zone = "high";
  }
  return { acute, chronic, ratio, zone, weeks };
}

export const ZONE_COPY: Record<LoadZone, { label: string; advice: string }> = {
  building: {
    label: "Building baseline",
    advice: "Log sessions for about 3 weeks to unlock your injury-risk ratio. Until then, raise weekly load by no more than ~10%.",
  },
  under: {
    label: "Under-training",
    advice: "This week is well below your usual load. Fine for a planned deload — otherwise add sessions gradually to keep fitness.",
  },
  optimal: {
    label: "Sweet spot",
    advice: "Your load matches what your body is used to — the range linked to the lowest injury risk. Keep progressing steadily.",
  },
  caution: {
    label: "Spike — caution",
    advice: "This week is noticeably above your norm. Keep the next sessions easy and prioritise sleep and fuelling.",
  },
  high: {
    label: "High injury risk",
    advice: "Load has spiked sharply versus your last month. Swap the next hard session for recovery and build back up gradually.",
  },
};
