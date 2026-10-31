import type { Workout, DailyMetrics, WorkoutSet } from "./store";

export interface OvertrainingAnalysis {
  weeklyVolumeMins: number;
  avgIntensity: number;
  recoveryScore: number; // 0-100, higher is better
  overtrainingRisk: "low" | "moderate" | "high";
  riskScore: number; // 0-100
  days: number; // days of data analyzed
}

export interface MuscleGroup {
  name: string;
  exercises: string[];
}

export interface MuscleBalance {
  primary: MuscleGroup;
  secondary: MuscleGroup;
  imbalanceScore: number; // 0-100, higher = more imbalanced
  recommendation: string;
}

export interface BurnoutRisk {
  isBurnedOut: boolean;
  score: number; // 0-100
  factors: {
    fatigueLevel: number;
    sleepDeficit: number;
    sorenessLevel: number;
  };
  message: string;
}

export interface DeloadRecommendation {
  shouldDeload: boolean;
  reason: string;
  suggestedDuration: number; // days
  reducedIntensity: number; // 0-100, % of normal intensity
}

const MUSCLE_GROUPS: Record<string, MuscleGroup> = {
  chest: { name: "Chest", exercises: ["push-up", "bench", "chest press", "fly", "pec"] },
  back: { name: "Back", exercises: ["pull-up", "row", "lat", "deadlift", "back"] },
  legs: { name: "Legs", exercises: ["squat", "lunge", "leg press", "leg extension", "leg curl", "calf"] },
  shoulders: { name: "Shoulders", exercises: ["shoulder press", "lateral raise", "military"] },
  arms: { name: "Arms", exercises: ["bicep", "curl", "tricep", "dip"] },
  core: { name: "Core", exercises: ["plank", "crunch", "ab", "core"] },
};

function getMuscleGroupsFromExercise(exercise: string): string[] {
  const lower = exercise.toLowerCase();
  const groups: string[] = [];

  for (const [group, data] of Object.entries(MUSCLE_GROUPS)) {
    if (data.exercises.some(ex => lower.includes(ex))) {
      groups.push(group);
    }
  }

  return groups.length > 0 ? groups : ["general"];
}

function countExercisesByMuscle(workouts: Workout[]): Record<string, number> {
  const counts: Record<string, number> = {};

  workouts.forEach(w => {
    (w.sets || []).forEach(set => {
      const muscles = getMuscleGroupsFromExercise(set.exercise);
      muscles.forEach(m => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
  });

  return counts;
}

export function analyzeOvertraining(
  workouts: Workout[],
  metrics: Record<string, DailyMetrics>,
  daysBack: number = 7
): OvertrainingAnalysis {
  const now = new Date();
  const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const recentWorkouts = workouts.filter(w => new Date(w.date) >= cutoff);

  if (recentWorkouts.length === 0) {
    return {
      weeklyVolumeMins: 0,
      avgIntensity: 0,
      recoveryScore: 100,
      overtrainingRisk: "low",
      riskScore: 0,
      days: daysBack,
    };
  }

  // Calculate volume
  const weeklyVolumeMins = recentWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

  // Calculate intensity
  const intensityMap = { low: 1, medium: 2, high: 3 };
  const avgIntensity = recentWorkouts.reduce((sum, w) => sum + intensityMap[w.intensity], 0) / recentWorkouts.length;

  // Calculate recovery score based on sleep, fatigue, soreness, HR
  const recentMetrics = Object.values(metrics).filter(m => new Date(m.date) >= cutoff);

  let recoveryScore = 100;
  recentMetrics.forEach(m => {
    if (m.sleepHours && m.sleepHours < 7) {
      recoveryScore -= (7 - m.sleepHours) * 5;
    }
    if (m.fatigueLevel && m.fatigueLevel > 5) {
      recoveryScore -= (m.fatigueLevel - 5) * 3;
    }
    if (m.soreness && m.soreness > 5) {
      recoveryScore -= (m.soreness - 5) * 2;
    }
    if (m.restingHr && m.restingHr > 65) {
      recoveryScore -= Math.min(10, (m.restingHr - 65) * 0.5);
    }
  });

  recoveryScore = Math.max(0, Math.min(100, recoveryScore));

  // Calculate overtraining risk
  const volumeRisk = Math.min(50, (weeklyVolumeMins / 300) * 50); // 300 min/week = 50 points
  const intensityRisk = (avgIntensity / 3) * 30;
  const recoveryRisk = (100 - recoveryScore) * 0.2;

  const riskScore = volumeRisk + intensityRisk + recoveryRisk;

  let overtrainingRisk: "low" | "moderate" | "high" = "low";
  if (riskScore > 70) overtrainingRisk = "high";
  else if (riskScore > 40) overtrainingRisk = "moderate";

  return {
    weeklyVolumeMins,
    avgIntensity,
    recoveryScore,
    overtrainingRisk,
    riskScore: Math.round(riskScore),
    days: daysBack,
  };
}

export function detectMuscleImbalances(workouts: Workout[]): MuscleBalance[] {
  const last30Days = workouts.filter(w => {
    const date = new Date(w.date);
    const now = new Date();
    return now.getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000;
  });

  if (last30Days.length === 0) return [];

  const counts = countExercisesByMuscle(last30Days);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const imbalances: MuscleBalance[] = [];

  // Check primary vs secondary imbalances
  for (let i = 0; i < sorted.length - 1; i++) {
    const [primary, primaryCount] = sorted[i];
    const [secondary, secondaryCount] = sorted[i + 1];

    const imbalanceScore = Math.round(((primaryCount - secondaryCount) / primaryCount) * 100);

    if (imbalanceScore > 40) {
      imbalances.push({
        primary: MUSCLE_GROUPS[primary] || { name: primary, exercises: [] },
        secondary: MUSCLE_GROUPS[secondary] || { name: secondary, exercises: [] },
        imbalanceScore,
        recommendation: `${MUSCLE_GROUPS[secondary]?.name || secondary} is undertrained compared to ${MUSCLE_GROUPS[primary]?.name || primary}. Add 1-2 sessions weekly.`,
      });
    }
  }

  return imbalances;
}

export function detectBurnoutRisk(
  metrics: Record<string, DailyMetrics>,
  daysBack: number = 14
): BurnoutRisk {
  const now = new Date();
  const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const recentMetrics = Object.values(metrics).filter(m => new Date(m.date) >= cutoff);

  if (recentMetrics.length === 0) {
    return {
      isBurnedOut: false,
      score: 0,
      factors: { fatigueLevel: 0, sleepDeficit: 0, sorenessLevel: 0 },
      message: "Not enough data to assess burnout risk.",
    };
  }

  let fatigueFactor = 0;
  let sleepFactor = 0;
  let sorenessFactor = 0;

  recentMetrics.forEach(m => {
    if (m.fatigueLevel) fatigueFactor += Math.max(0, m.fatigueLevel - 5);
    if (m.sleepHours) sleepFactor += Math.max(0, 7.5 - m.sleepHours);
    if (m.soreness) sorenessFactor += Math.max(0, m.soreness - 4);
  });

  const count = recentMetrics.length;
  const avgFatigue = Math.round((fatigueFactor / count) * 10);
  const avgSleep = Math.round((sleepFactor / count) * 10);
  const avgSoreness = Math.round((sorenessFactor / count) * 10);

  const burnoutScore = Math.min(100, avgFatigue * 0.4 + avgSleep * 0.4 + avgSoreness * 0.2);

  let message = "You're recovering well.";
  if (burnoutScore > 70) {
    message = "⚠️ High burnout risk! Prioritize rest and recovery.";
  } else if (burnoutScore > 40) {
    message = "Moderate burnout indicators. Consider an easier week.";
  }

  return {
    isBurnedOut: burnoutScore > 60,
    score: Math.round(burnoutScore),
    factors: {
      fatigueLevel: avgFatigue,
      sleepDeficit: avgSleep,
      sorenessLevel: avgSoreness,
    },
    message,
  };
}

export function generateDeloadRecommendation(
  analysis: OvertrainingAnalysis,
  burnout: BurnoutRisk
): DeloadRecommendation {
  const shouldDeload = analysis.overtrainingRisk === "high" || burnout.score > 60;

  let reason = "";
  let duration = 0;
  let intensity = 100;

  if (analysis.overtrainingRisk === "high") {
    reason = `High overtraining risk (${analysis.riskScore}/100). Excessive volume + poor recovery.`;
    duration = 7;
    intensity = 50;
  } else if (burnout.score > 70) {
    reason = "Severe burnout indicators detected across fatigue, sleep, and soreness.";
    duration = 7;
    intensity = 40;
  } else if (burnout.score > 60) {
    reason = "Moderate burnout risk. Recovery metrics are declining.";
    duration = 4;
    intensity = 60;
  }

  return {
    shouldDeload,
    reason: shouldDeload ? reason : "Recovery metrics are healthy.",
    suggestedDuration: duration,
    reducedIntensity: intensity,
  };
}

export function suggestPreventativeExercises(imbalances: MuscleBalance[]): string[] {
  const suggestions: string[] = [];

  imbalances.forEach(imb => {
    const exerciseBank: Record<string, string[]> = {
      "Back": ["Bent-over rows", "Reverse fly", "Face pulls", "Dead bugs"],
      "Chest": ["Push-ups", "Incline press", "Cable fly"],
      "Legs": ["Lunges", "Step-ups", "Single-leg squats"],
      "Shoulders": ["Lateral raises", "Reverse fly", "Band pull-aparts"],
      "Arms": ["Curls", "Tricep extensions"],
      "Core": ["Planks", "Dead bugs", "Pallof press"],
    };

    const exercises = exerciseBank[imb.secondary.name] || ["General strength work"];
    suggestions.push(`${imb.secondary.name}: ${exercises.slice(0, 2).join(", ")}`);
  });

  return suggestions;
}
