import { DailyMetrics, Workout, todayKey } from "./store";
import { buildSeries, MetricKey } from "./stats";
import { NUTRITION_SOURCES, RECOVERY_SOURCES, Source, TRAINING_SOURCES } from "./evidence";

export type AlertDirection = "above" | "below";

export interface AlertRule {
  key: MetricKey;
  enabled: boolean;
  direction: AlertDirection;
  threshold: number;
}

export interface AlertMetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  decimals?: number;
  /** Direction that means "something to look at" by default. */
  defaultDirection: AlertDirection;
  defaultThreshold: number;
  min: number;
  max: number;
  step: number;
  /** Coach explanation, keyed by the direction that triggered. */
  coach: Record<AlertDirection, string>;
  sources: Source[];
}

export const ALERT_METRICS: AlertMetricDef[] = [
  {
    key: "sleepHours",
    label: "Sleep",
    unit: "h",
    decimals: 1,
    defaultDirection: "below",
    defaultThreshold: 7,
    min: 3,
    max: 12,
    step: 0.5,
    coach: {
      below:
        "Short sleep blunts recovery, raises perceived effort and is linked to higher injury risk in athletes. Protect a consistent bedtime tonight, keep the room dark and cool, and treat tomorrow as a lighter training day if this repeats.",
      above:
        "Unusually long sleep can be a sign your body is repaying a recovery debt or fighting something off. If it keeps happening alongside high fatigue, pull training volume back for a few days.",
    },
    sources: [RECOVERY_SOURCES.sleepAthletes, RECOVERY_SOURCES.overtraining],
  },
  {
    key: "fatigueLevel",
    label: "Fatigue",
    unit: "/10",
    defaultDirection: "above",
    defaultThreshold: 7,
    min: 1,
    max: 10,
    step: 1,
    coach: {
      above:
        "Self-reported fatigue is one of the most sensitive early warnings of overreaching. Cut intensity (not necessarily all volume), prioritise sleep and carbohydrate intake, and re-check in 48 hours before pushing hard again.",
      below:
        "Low fatigue with consistent training means you're absorbing the load well — a good window to progress volume or intensity by roughly 5–10% this week.",
    },
    sources: [RECOVERY_SOURCES.monitoring, RECOVERY_SOURCES.overtraining, RECOVERY_SOURCES.loadInjury],
  },
  {
    key: "soreness",
    label: "Soreness",
    unit: "/10",
    defaultDirection: "above",
    defaultThreshold: 6,
    min: 1,
    max: 10,
    step: 1,
    coach: {
      above:
        "High soreness usually means eccentric overload. Keep moving with low-intensity activity, add protein across the day, and use active recovery or massage — both have the strongest evidence for reducing soreness markers.",
      below: "Soreness is well under control — your current load looks tolerable.",
    },
    sources: [RECOVERY_SOURCES.doms, RECOVERY_SOURCES.peaceLove],
  },
  {
    key: "restingHr",
    label: "Resting HR",
    unit: "bpm",
    defaultDirection: "above",
    defaultThreshold: 70,
    min: 35,
    max: 110,
    step: 1,
    coach: {
      above:
        "An elevated resting heart rate versus your baseline often reflects incomplete recovery, dehydration, heat or illness. Hydrate, sleep, and keep today aerobic and easy rather than adding intensity.",
      below:
        "A lower resting heart rate is generally a sign of improving aerobic fitness and good recovery — keep the current balance of easy and hard sessions.",
    },
    sources: [RECOVERY_SOURCES.overtraining, RECOVERY_SOURCES.monitoring],
  },
  {
    key: "waterMl",
    label: "Water",
    unit: "ml",
    defaultDirection: "below",
    defaultThreshold: 2000,
    min: 500,
    max: 5000,
    step: 100,
    coach: {
      below:
        "Fluid deficits of even 2% body mass reduce endurance performance and raise cardiovascular strain. Drink steadily across the day rather than in one hit, and add sodium if you're training long or in the heat.",
      above: "You're well hydrated. Keep intake spread through the day rather than loading it late in the evening.",
    },
    sources: [NUTRITION_SOURCES.hydration, NUTRITION_SOURCES.acsmNutrition],
  },
  {
    key: "steps",
    label: "Steps",
    unit: "",
    defaultDirection: "below",
    defaultThreshold: 7000,
    min: 1000,
    max: 20000,
    step: 500,
    coach: {
      below:
        "Daily movement outside of training drives a large share of total energy expenditure and cardiometabolic health. A 10–15 minute walk after meals is the easiest way to close the gap.",
      above: "Great non-training activity. Just make sure the extra load is accounted for on hard training days.",
    },
    sources: TRAINING_SOURCES.slice(0, 2),
  },
  {
    key: "proteinG",
    label: "Protein",
    unit: "g",
    defaultDirection: "below",
    defaultThreshold: 90,
    min: 30,
    max: 250,
    step: 5,
    coach: {
      below:
        "Under-eating protein limits repair and adaptation from training. Aim for roughly 1.4–2.0 g/kg per day, spread across 3–4 meals of 0.3 g/kg each.",
      above: "Protein intake is comfortably covered — make sure carbohydrate is also high enough to fuel your sessions.",
    },
    sources: [NUTRITION_SOURCES.issnProtein, NUTRITION_SOURCES.acsmNutrition],
  },
  {
    key: "calories",
    label: "Calories",
    unit: "kcal",
    defaultDirection: "below",
    defaultThreshold: 1600,
    min: 800,
    max: 5000,
    step: 50,
    coach: {
      below:
        "Persistent low energy availability impairs hormones, bone health and performance. If this is unintentional, add an extra carbohydrate-rich snack around training.",
      above:
        "Intake is above your chosen ceiling. Look at portion sizes of energy-dense foods first rather than cutting whole meals.",
    },
    sources: [NUTRITION_SOURCES.acsmNutrition, NUTRITION_SOURCES.dietaryGuidelines],
  },
  {
    key: "weightKg",
    label: "Weight",
    unit: "kg",
    decimals: 1,
    defaultDirection: "above",
    defaultThreshold: 85,
    min: 35,
    max: 200,
    step: 0.5,
    coach: {
      above:
        "You've crossed your upper weight guardrail. Change one lever at a time — usually daily steps and evening portions — rather than a large deficit that costs training quality.",
      below:
        "You've dropped under your lower weight guardrail. Rapid loss costs muscle and performance; keep loss under about 0.5–1% of body mass per week.",
    },
    sources: [NUTRITION_SOURCES.acsmNutrition, NUTRITION_SOURCES.dietaryGuidelines],
  },
  {
    key: "workouts",
    label: "Workout minutes",
    unit: "min",
    defaultDirection: "above",
    defaultThreshold: 120,
    min: 15,
    max: 300,
    step: 15,
    coach: {
      above:
        "Large single-day spikes in training load are associated with higher injury risk in the following week. Follow this with an easier day and progress weekly load gradually.",
      below: "Low training minutes today — fine as a planned recovery day, worth a short session otherwise.",
    },
    sources: [RECOVERY_SOURCES.loadInjury, RECOVERY_SOURCES.loadConsensus],
  },
];

export const getAlertMetric = (key: MetricKey) => ALERT_METRICS.find((m) => m.key === key);

export function defaultAlertRules(): AlertRule[] {
  return ALERT_METRICS.map((m) => ({
    key: m.key,
    enabled: ["sleepHours", "fatigueLevel", "waterMl"].includes(m.key),
    direction: m.defaultDirection,
    threshold: m.defaultThreshold,
  }));
}

/** Merge stored rules with defaults so new metrics show up automatically. */
export function resolveAlertRules(stored: AlertRule[] | undefined | null): AlertRule[] {
  const defaults = defaultAlertRules();
  if (!stored || stored.length === 0) return defaults;
  return defaults.map((d) => stored.find((s) => s.key === d.key) ?? d);
}

export interface TriggeredAlert {
  rule: AlertRule;
  def: AlertMetricDef;
  value: number;
  /** Coach explanation for the direction that fired. */
  explanation: string;
  sources: Source[];
  /** Stable id per day+rule+value bucket, for once-per-day notifications. */
  id: string;
}

export function evaluateAlerts(
  rules: AlertRule[],
  metrics: Record<string, DailyMetrics>,
  workouts: Workout[],
): TriggeredAlert[] {
  const today = todayKey();
  const out: TriggeredAlert[] = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const def = getAlertMetric(rule.key);
    if (!def) continue;
    const series = buildSeries(rule.key, 1, metrics, workouts);
    const value = series[series.length - 1]?.value;
    if (value === null || value === undefined) continue;
    if (rule.key === "workouts" && value === 0) continue;
    const fired = rule.direction === "above" ? value > rule.threshold : value < rule.threshold;
    if (!fired) continue;
    out.push({
      rule,
      def,
      value,
      explanation: def.coach[rule.direction],
      sources: def.sources,
      id: `${today}:${rule.key}:${rule.direction}:${rule.threshold}`,
    });
  }
  return out;
}

export function formatAlertValue(def: AlertMetricDef, value: number) {
  const v = def.decimals ? value.toFixed(def.decimals) : Math.round(value).toLocaleString();
  return def.unit ? `${v}${def.unit === "/10" ? "" : " "}${def.unit}` : v;
}

/** A persisted record of a threshold crossing, for the alert history timeline. */
export interface AlertEvent {
  id: string;
  key: MetricKey;
  direction: AlertDirection;
  threshold: number;
  value: number;
  /** YYYY-MM-DD */
  date: string;
  /** epoch ms when it was first detected */
  at: number;
}

export function toAlertEvent(a: TriggeredAlert): AlertEvent {
  return {
    id: a.id,
    key: a.rule.key,
    direction: a.rule.direction,
    threshold: a.rule.threshold,
    value: a.value,
    date: todayKey(),
    at: Date.now(),
  };
}
