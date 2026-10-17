import type { WorkoutSet } from "./store";
import { kgTo, unitLabels, type Units } from "./units";

/** Total weight moved (kg × reps), counting bodyweight sets as zero. */
export function totalVolumeKg(sets: WorkoutSet[]): number {
  return sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * s.reps, 0);
}

/**
 * Estimated one-rep max using the Epley formula. Only trustworthy up to ~12
 * reps, so higher-rep sets are ignored.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0 || reps > 12) return 0;
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}

/** Best estimated 1RM per exercise across a list of sets. */
export function bestOneRepMaxes(sets: WorkoutSet[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of sets) {
    const e1rm = estimateOneRepMax(s.weightKg ?? 0, s.reps);
    if (e1rm > (out[s.exercise] ?? 0)) out[s.exercise] = e1rm;
  }
  return out;
}

/** "Squat 3×5 @ 100 kg; Push-up 2×15" — consecutive identical sets are grouped. */
export function formatSets(sets: WorkoutSet[], units: Units): string {
  const groups: { set: WorkoutSet; count: number }[] = [];
  for (const s of sets) {
    const last = groups[groups.length - 1];
    if (last && last.set.exercise === s.exercise && last.set.reps === s.reps && last.set.weightKg === s.weightKg) {
      last.count += 1;
    } else {
      groups.push({ set: s, count: 1 });
    }
  }
  const w = unitLabels(units).weight;
  return groups
    .map(({ set, count }) => {
      const load = set.weightKg ? ` @ ${+kgTo(set.weightKg, units).toFixed(1)} ${w}` : "";
      return `${set.exercise} ${count}×${set.reps}${load}`;
    })
    .join("; ");
}
