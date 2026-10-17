import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "./Sparkline";
import { useStore, localDateKey } from "@/lib/store";
import { buildSeries, seriesStats, MetricKey, SeriesPoint } from "@/lib/stats";
import { calcBMI, bmiCategory, calcMacros, hydrationTargetMl } from "@/lib/health";
import { useUnits, kgTo, displayWater } from "@/lib/units";
import {
  Scale,
  Moon,
  HeartPulse,
  Footprints,
  Dumbbell,
  Droplets,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Salad,
  Activity,
  BatteryLow,
  AlertTriangle,
} from "lucide-react";

type Direction = "up" | "down" | "flat";
type Tone = "good" | "warning" | "alert" | "neutral";

interface Recommendation {
  headline: string;
  tone: Tone;
  direction: Direction;
  diet: string[];
  training: string[];
}

interface InsightBlockProps {
  icon: typeof Scale;
  title: string;
  subtitle: string;
  unit: string;
  series: SeriesPoint[];
  primaryValue: string;
  secondaryValue?: string;
  rec: Recommendation;
}

const toneClass: Record<Tone, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  alert: "text-rose-600 dark:text-rose-400",
  neutral: "text-muted-foreground",
};

const toneBg: Record<Tone, string> = {
  good: "bg-emerald-500/10 border-emerald-500/20",
  warning: "bg-amber-500/10 border-amber-500/20",
  alert: "bg-rose-500/10 border-rose-500/20",
  neutral: "bg-muted/40 border-border/40",
};

function trendDirection(trend: number, threshold = 3): Direction {
  if (trend > threshold) return "up";
  if (trend < -threshold) return "down";
  return "flat";
}

const DirectionIcon = ({ dir }: { dir: Direction }) => {
  if (dir === "up") return <TrendingUp className="h-3.5 w-3.5" />;
  if (dir === "down") return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
};

const InsightBlock = ({ icon: Icon, title, subtitle, unit, series, primaryValue, secondaryValue, rec }: InsightBlockProps) => (
  <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary-soft/40 border border-border/40 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${toneBg[rec.tone]} ${toneClass[rec.tone]}`}>
        <DirectionIcon dir={rec.direction} />
        <span className="font-medium capitalize">{rec.direction === "flat" ? "steady" : rec.direction}</span>
      </div>
    </div>

    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        <p className="font-display text-3xl tracking-tight">
          {primaryValue}
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </p>
        {secondaryValue && <p className="text-xs text-muted-foreground mt-0.5">{secondaryValue}</p>}
      </div>
      <div className={`w-1/2 ${toneClass[rec.tone]}`}>
        <Sparkline data={series} height={44} />
      </div>
    </div>

    <div className={`rounded-2xl border p-3.5 mb-3 ${toneBg[rec.tone]}`}>
      <p className={`text-sm font-medium ${toneClass[rec.tone]}`}>{rec.headline}</p>
    </div>

    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl bg-muted/30 border border-border/40 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Salad className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Diet</p>
        </div>
        <ul className="space-y-1.5">
          {rec.diet.map((tip, i) => (
            <li key={i} className="text-xs text-foreground/85 leading-relaxed flex gap-1.5">
              <span className="text-primary mt-0.5">·</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-muted/30 border border-border/40 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Training</p>
        </div>
        <ul className="space-y-1.5">
          {rec.training.map((tip, i) => (
            <li key={i} className="text-xs text-foreground/85 leading-relaxed flex gap-1.5">
              <span className="text-primary mt-0.5">·</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
);

export const Insights = () => {
  const { store } = useStore();
  const { units, labels, water, weight } = useUnits();
  const profile = store.profile!;
  const macros = calcMacros(profile);
  const hydroTarget = hydrationTargetMl(profile);

  const days = 14;
  const weightSeries = useMemo(() => buildSeries("weightKg", days, store.metrics, store.workouts), [store]);
  const sleepSeries = useMemo(() => buildSeries("sleepHours", days, store.metrics, store.workouts), [store]);
  const hrSeries = useMemo(() => buildSeries("restingHr", days, store.metrics, store.workouts), [store]);
  const stepsSeries = useMemo(() => buildSeries("steps", days, store.metrics, store.workouts), [store]);
  const workoutSeries = useMemo(() => buildSeries("workouts", days, store.metrics, store.workouts), [store]);
  const waterSeries = useMemo(() => buildSeries("waterMl", days, store.metrics, store.workouts), [store]);
  const calSeries = useMemo(() => buildSeries("calories", days, store.metrics, store.workouts), [store]);

  const wStats = seriesStats(weightSeries);
  const slStats = seriesStats(sleepSeries);
  const hrStats = seriesStats(hrSeries);
  const stStats = seriesStats(stepsSeries);
  const wkStats = seriesStats(workoutSeries);
  const waStats = seriesStats(waterSeries);
  const calStats = seriesStats(calSeries);

  // ---- Weight & BMI ----
  const currentWeight = wStats.last || profile.weightKg;
  const bmi = calcBMI({ ...profile, weightKg: currentWeight });
  const bmiCat = bmiCategory(bmi);
  const goal = profile.goal;
  const weightDir = trendDirection(wStats.trend, 0.5);
  const goodDir: Direction | null =
    goal === "lose" ? "down" : goal === "gain" ? "up" : null;
  const weightRec: Recommendation = (() => {
    const onTrack = goodDir === null ? weightDir === "flat" : weightDir === goodDir;
    if (wStats.count < 2) {
      return {
        headline: "Log your weight regularly to unlock trend guidance.",
        tone: "neutral",
        direction: "flat",
        diet: [
          `Target ~${macros.calories.toLocaleString()} kcal / day (${macros.proteinG}g protein).`,
          "Weigh yourself 3–4 mornings a week for a reliable baseline.",
        ],
        training: [
          "Mix 3 strength sessions with 2 cardio blocks weekly.",
          "Track sessions here so trends can auto-tune advice.",
        ],
      };
    }
    if (goal === "lose") {
      return onTrack
        ? {
            headline: `Trending down (BMI ${bmi.toFixed(1)} · ${bmiCat.label}) — deficit is working.`,
            tone: "good",
            direction: weightDir,
            diet: [
              `Hold the ~${macros.calories.toLocaleString()} kcal target; keep ${macros.proteinG}g protein to protect muscle.`,
              "Fill half the plate with fibrous veg to stay full at a deficit.",
              "One refeed day/week at maintenance if energy dips.",
            ],
            training: [
              "Keep 3 full-body strength sessions to preserve lean mass.",
              "Add 2 zone-2 cardio blocks (30–45 min) to widen the deficit.",
              "Avoid stacking hard cardio on strength days when energy is low.",
            ],
          }
        : {
            headline: "Weight isn't dropping — tighten intake and add movement.",
            tone: "warning",
            direction: weightDir,
            diet: [
              `Trim ~200 kcal from carbs/fats; keep protein at ${macros.proteinG}g.`,
              "Log everything for 5 days — hidden calories usually explain plateaus.",
              "Front-load protein at breakfast (30g) to blunt cravings later.",
            ],
            training: [
              "Add 2,000 steps/day and one extra zone-2 cardio session.",
              "Swap one strength day for a full-body circuit to raise burn.",
              "Sleep ≥7h — under-sleep spikes hunger hormones.",
            ],
          };
    }
    if (goal === "gain") {
      return onTrack
        ? {
            headline: `Gaining steadily (BMI ${bmi.toFixed(1)}) — surplus + training are landing.`,
            tone: "good",
            direction: weightDir,
            diet: [
              `Hold ~${macros.calories.toLocaleString()} kcal with ${macros.proteinG}g protein & ${macros.carbG}g carbs.`,
              "Add a post-workout shake + banana on training days.",
              "Prioritize whole carbs (rice, oats, potatoes) over processed.",
            ],
            training: [
              "Progressive overload: add reps or 2.5 kg each week on compounds.",
              "4 strength sessions, cap cardio at 2×20 min so you don't out-burn intake.",
              "Rest 48h between hitting the same muscle group.",
            ],
          }
        : {
            headline: "Weight is stalling — surplus is too small or training too much cardio.",
            tone: "warning",
            direction: weightDir,
            diet: [
              "Add ~300 kcal via calorie-dense whole foods (nuts, olive oil, oats).",
              "Eat 4–5 times/day; add an evening protein snack.",
              "Track for a week — many 'gainers' undereat by 500 kcal.",
            ],
            training: [
              "Reduce cardio to 1×20 min zone-2 per week.",
              "Focus on 6–10 rep compound lifts, close to failure.",
              "Deload every 5th week to allow tissue adaptation.",
            ],
          };
    }
    // maintain / performance
    return {
      headline: `BMI ${bmi.toFixed(1)} · ${bmiCat.label} — body comp is stable.`,
      tone: bmiCat.tone === "good" ? "good" : "warning",
      direction: weightDir,
      diet: [
        `Hold ~${macros.calories.toLocaleString()} kcal at maintenance.`,
        "Focus on food quality: protein at every meal, colorful plants.",
      ],
      training: [
        "Mix strength (2–3×/wk) with variety cardio to sharpen performance.",
        "Test a benchmark workout monthly to gauge progress.",
      ],
    };
  })();

  // ---- Sleep & Resting HR ----
  const sleepAvg = slStats.avg;
  const hrLatest = hrStats.last || profile.age > 50 ? 70 : 65;
  const sleepDir = trendDirection(slStats.trend);
  const hrDir = trendDirection(hrStats.trend);
  const recoveryRec: Recommendation = (() => {
    if (slStats.count < 2 && hrStats.count < 2) {
      return {
        headline: "Log sleep and resting HR to see recovery trends.",
        tone: "neutral",
        direction: "flat",
        diet: [
          "Cut caffeine 8h before bed; avoid alcohol before hard training days.",
          "Magnesium-rich foods (leafy greens, pumpkin seeds) support sleep.",
        ],
        training: [
          "Take a full rest day every 3 hard sessions.",
          "Check morning HR before getting up — elevated readings flag fatigue.",
        ],
      };
    }
    const poorSleep = sleepAvg > 0 && sleepAvg < 6.5;
    const risingHr = hrDir === "up" && hrStats.count > 3;
    if (poorSleep || risingHr) {
      return {
        headline: risingHr
          ? "Resting HR is climbing — under-recovery brewing."
          : `Averaging ${sleepAvg.toFixed(1)}h sleep — too low for recovery.`,
        tone: "alert",
        direction: risingHr ? "up" : sleepDir,
        diet: [
          "Move dinner ≥2h before bed; keep it protein + veg heavy.",
          "Try 200mg magnesium glycinate + tart cherry juice pre-sleep.",
          "Zero caffeine after noon for one week — reassess.",
        ],
        training: [
          "Cut one hard session and swap for easy zone-2 or mobility.",
          "Cap intensity at RPE 7 until HR trend flattens.",
          "Add 10 min walking + breathwork post-workout to downshift.",
        ],
      };
    }
    const strong = sleepAvg >= 7.5 && (hrDir === "down" || hrDir === "flat");
    return strong
      ? {
          headline: `${sleepAvg.toFixed(1)}h sleep + steady HR — recovery is dialed.`,
          tone: "good",
          direction: hrDir === "down" ? "down" : "flat",
          diet: [
            "Keep current nutrition rhythm — it's working.",
            "Add tart cherries or kiwi in the evening for a small melatonin bump.",
          ],
          training: [
            "You can safely add one high-intensity session this week.",
            "Progressive overload is on the table — bump load 5–10%.",
          ],
        }
      : {
          headline: `Sleep ${sleepAvg.toFixed(1)}h · HR ${Math.round(hrLatest)}bpm — solid but improvable.`,
          tone: "warning",
          direction: sleepDir,
          diet: [
            "Aim for a consistent dinner time; late meals fragment sleep.",
            "150mg tart cherry extract 30 min pre-bed can add ~20 min sleep.",
          ],
          training: [
            "Alternate hard/easy days rather than back-to-back intensity.",
            "Add one 20-min mobility session on your lowest-energy day.",
          ],
        };
  })();

  // ---- Steps & Workout minutes ----
  const stepsAvg = stStats.avg;
  const workoutMinTotal = workoutSeries.reduce((s, p) => s + (p.value ?? 0), 0);
  const activityRec: Recommendation = (() => {
    if (stStats.count < 2 && wkStats.count < 2) {
      return {
        headline: "Start logging steps and workouts to shape training advice.",
        tone: "neutral",
        direction: "flat",
        diet: [
          "Time carbs around workouts: oats before, rice/potato after.",
          "150–200 kcal light snack if training more than 90 min.",
        ],
        training: [
          "Baseline goal: 7,000 steps/day + 3 workouts/week.",
          "Log a session — even a 20-min walk counts.",
        ],
      };
    }
    const lowSteps = stepsAvg > 0 && stepsAvg < 5000;
    const solidSteps = stepsAvg >= 8000;
    const trainingMinPerWeek = (workoutMinTotal / days) * 7;
    const lowTrain = trainingMinPerWeek < 90;
    const highTrain = trainingMinPerWeek > 300;

    if (highTrain) {
      return {
        headline: `${Math.round(trainingMinPerWeek)} min/wk training — approaching overtraining zone.`,
        tone: "warning",
        direction: trendDirection(wkStats.trend),
        diet: [
          `Bump carbs to 5–7 g/kg (${Math.round(profile.weightKg * 5)}–${Math.round(profile.weightKg * 7)}g/day).`,
          "Add electrolytes (sodium + potassium) around long sessions.",
          "Never train fasted more than once/week.",
        ],
        training: [
          "Schedule a full deload week (–40% volume) every 4th week.",
          "Cap high-intensity to 2 sessions/wk; make the rest zone-2.",
          "Watch resting HR — a +5bpm shift means it's time to back off.",
        ],
      };
    }
    if (lowSteps && lowTrain) {
      return {
        headline: `${Math.round(stepsAvg).toLocaleString()} steps avg — activity is low.`,
        tone: "alert",
        direction: trendDirection(stStats.trend),
        diet: [
          "Dial calories slightly under maintenance until movement rises.",
          "Fiber 25–35g/day keeps satiety high when calories are lower.",
        ],
        training: [
          "Add a 20-min walk after every meal — easy step wins.",
          "Book 2 non-negotiable strength sessions this week (30 min each).",
          "Habit-stack: podcast + walk to make it stick.",
        ],
      };
    }
    if (solidSteps && !lowTrain) {
      return {
        headline: `${Math.round(stepsAvg).toLocaleString()} steps + ${Math.round(trainingMinPerWeek)} min training — great load.`,
        tone: "good",
        direction: trendDirection(stStats.trend),
        diet: [
          `Fuel accordingly — hold ~${macros.calories.toLocaleString()} kcal with carbs around sessions.`,
          "Post-workout: 25–30g protein within 60 min for recovery.",
        ],
        training: [
          "You've earned a progression: add load, distance, or a new stimulus.",
          "Keep 1 pure recovery day/week (walk, mobility, sauna).",
        ],
      };
    }
    return {
      headline: `Building consistency — ${Math.round(stepsAvg).toLocaleString()} steps, ${Math.round(trainingMinPerWeek)} min/wk.`,
      tone: "warning",
      direction: trendDirection(stStats.trend),
      diet: [
        "Match calories to activity — no need to over-restrict yet.",
        "Protein: 1.6g/kg to support new training stimulus.",
      ],
      training: [
        "Aim for 8,000 steps/day and 150+ min of training this week.",
        "Add one 'easy' cardio day between strength sessions.",
      ],
    };
  })();

  // ---- Hydration & Nutrition ----
  const waterAvg = waStats.avg;
  const calAvg = calStats.avg;
  const hydroRec: Recommendation = (() => {
    if (waStats.count < 2 && calStats.count < 2) {
      return {
        headline: "Log water and calories to see hydration + fueling trends.",
        tone: "neutral",
        direction: "flat",
        diet: [
          `Target ${water(hydroTarget)} water and ~${macros.calories.toLocaleString()} kcal/day.`,
          "Front-load water: 500ml on waking cuts afternoon fatigue.",
        ],
        training: [
          "Sip 150–250ml every 15–20 min during workouts.",
          "Weigh before/after long sessions — replace 150% of loss.",
        ],
      };
    }
    const underHydrated = waterAvg < hydroTarget * 0.7;
    const wayUnder = calAvg > 0 && calAvg < macros.calories * 0.75;
    const wayOver = calAvg > macros.calories * 1.15;
    if (underHydrated) {
      return {
        headline: `${water(waterAvg)} / ${water(hydroTarget)} — chronically under-hydrated.`,
        tone: "alert",
        direction: trendDirection(waStats.trend),
        diet: [
          "Set a 500ml glass at every meal + one on waking.",
          "Add electrolytes (pinch of salt + squeeze of lemon) on workout days.",
          "Watermelon, cucumber, oranges add 200–300ml water each.",
        ],
        training: [
          "Weigh yourself before/after training — 1kg loss = 1L to replace.",
          "Pre-hydrate 500ml 30 min before workouts to preserve performance.",
        ],
      };
    }
    if (wayUnder) {
      return {
        headline: `Averaging ${Math.round(calAvg).toLocaleString()} kcal — under-fueling risks performance.`,
        tone: "warning",
        direction: trendDirection(calStats.trend),
        diet: [
          `Bring intake up to ~${macros.calories.toLocaleString()} kcal — add calorie-dense snacks.`,
          "Add nuts, olive oil, avocado to bump kcal without volume.",
          `Hit ${macros.proteinG}g protein daily — muscle needs it.`,
        ],
        training: [
          "Cut intensity 20% until intake stabilizes.",
          "Never train fasted when under-eating this much.",
        ],
      };
    }
    if (wayOver) {
      return {
        headline: `Averaging ${Math.round(calAvg).toLocaleString()} kcal — well above target.`,
        tone: "warning",
        direction: trendDirection(calStats.trend),
        diet: [
          `Trim ~300 kcal from carbs/fats to align with ${macros.calories.toLocaleString()} kcal target.`,
          "Fill half the plate with veg to lower calorie density.",
          "Watch liquid calories — juices, coffees, alcohol add up fast.",
        ],
        training: [
          "Add 2 zone-2 cardio sessions (30–45 min) this week.",
          "Extra 2,000 steps/day helps offset without extra hunger.",
        ],
      };
    }
    return {
      headline: `Hydration and fueling on target (${water(waterAvg)} · ${Math.round(calAvg).toLocaleString()} kcal).`,
      tone: "good",
      direction: "flat",
      diet: [
        `Keep hitting ${macros.proteinG}g protein and ${macros.carbG}g carbs for performance.`,
        "Add a fermented food daily (yogurt, kefir, kimchi) for gut health.",
      ],
      training: [
        "You're fueled well enough to progress load or intensity.",
        "Match carbs to hardest training day of the week.",
      ],
    };
  })();

  // ---- Fatigue & Injuries ----
  const fatigueEntries = [...store.fatigue].sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
  const latestFatigue = store.fatigue[0];
  const fatigueSeries: SeriesPoint[] = (() => {
    const today = new Date();
    const points: SeriesPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = localDateKey(d);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const match = fatigueEntries.find((f) => f.date === key);
      points.push({ date: key, label, value: match ? match.fatigueLevel : null });
    }
    return points;
  })();
  const fStats = seriesStats(fatigueSeries);
  const fatigueDir = trendDirection(fStats.trend, 5);
  // Aggregate injuries + sore areas from last 7 entries
  const recentSoreness = new Map<string, number>();
  store.fatigue.slice(0, 7).forEach((f) => {
    f.soreness.forEach((s) => recentSoreness.set(s, (recentSoreness.get(s) || 0) + 1));
  });
  const persistentSore = Array.from(recentSoreness.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([area]) => area);
  const activeInjuries = store.fatigue
    .slice(0, 5)
    .map((f) => f.injuries?.trim())
    .filter((v): v is string => !!v);
  const fatigueRec: Recommendation = (() => {
    if (!latestFatigue) {
      return {
        headline: "Log a recovery check-in to unlock fatigue-aware advice.",
        tone: "neutral",
        direction: "flat",
        diet: [
          "Protein at every meal supports tissue repair when soreness spikes.",
          "Omega-3 rich foods (salmon, walnuts, flax) blunt inflammation.",
        ],
        training: [
          "Head to Recovery to log fatigue level, sore areas, and any pain.",
          "The engine will then reshape training intensity around your signals.",
        ],
      };
    }
    const high = latestFatigue.fatigueLevel >= 7;
    const moderate = latestFatigue.fatigueLevel >= 5 && latestFatigue.fatigueLevel < 7;
    const hasInjury = activeInjuries.length > 0;
    const soreCount = latestFatigue.soreness.length;

    if (hasInjury || high) {
      return {
        headline: hasInjury
          ? `Active flag: ${activeInjuries[0]} — protect it before pushing.`
          : `Fatigue ${latestFatigue.fatigueLevel}/10 — recovery debt is real.`,
        tone: "alert",
        direction: fatigueDir,
        diet: [
          `Bump protein toward ${macros.proteinG + 20}g today to accelerate repair.`,
          "Add tart cherry, ginger, turmeric — natural anti-inflammatories.",
          "Front-load carbs to refill glycogen; avoid alcohol until symptoms ease.",
          "3L+ water with electrolytes to flush inflammatory byproducts.",
        ],
        training: [
          hasInjury
            ? `Off-load the ${activeInjuries[0].split(" ").slice(-2).join(" ")} area — train around, not through.`
            : "Swap today's session for a walk + mobility (RPE ≤ 4).",
          persistentSore.length
            ? `Skip loading ${persistentSore.slice(0, 2).join(" & ")} for 48h.`
            : "Cap intensity at RPE 6 for 2 days.",
          "Add 10 min breathwork + contrast shower to speed parasympathetic recovery.",
        ],
      };
    }
    if (moderate || soreCount >= 3) {
      return {
        headline: `Fatigue ${latestFatigue.fatigueLevel}/10${soreCount ? ` · ${soreCount} sore area${soreCount > 1 ? "s" : ""}` : ""} — throttle, don't stop.`,
        tone: "warning",
        direction: fatigueDir,
        diet: [
          `Hold ${macros.proteinG}g protein and add a carb-forward post-workout meal.`,
          "Magnesium glycinate 200mg + salty broth in the evening.",
          "Keep caffeine before noon only — protect sleep pressure.",
        ],
        training: [
          persistentSore.length
            ? `Reduce load on ${persistentSore[0]} by 30–40% this week.`
            : "Trim volume 20% but keep frequency — better than skipping.",
          "Swap one strength session for zone-2 cardio or yoga.",
          "Prioritize warm-ups: 8–10 min before any hard effort.",
        ],
      };
    }
    return {
      headline: `Fatigue ${latestFatigue.fatigueLevel}/10 · sleep quality ${latestFatigue.sleepQuality}/5 — well recovered.`,
      tone: "good",
      direction: fatigueDir === "up" ? "up" : "down",
      diet: [
        `Standard fueling: ~${macros.calories.toLocaleString()} kcal, ${macros.proteinG}g protein.`,
        "Colorful plants at every meal keep inflammation baseline low.",
      ],
      training: [
        "Green light to progress load, add a rep, or push a benchmark today.",
        "Follow a hard session with 24h of easier training to bank the gains.",
      ],
    };
  })();



  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Insights · last {days} days</p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">
          Trends & <span className="text-gradient-sage italic">recommendations</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Each metric is paired with diet and training moves tuned to the direction it's heading. Log daily to keep the guidance sharp.
        </p>
      </div>

      <InsightBlock
        icon={Scale}
        title="Weight & BMI"
        subtitle={`Goal: ${goal} · target ${macros.calories.toLocaleString()} kcal`}
        unit={labels.weight}
        primaryValue={kgTo(currentWeight, units).toFixed(1)}
        secondaryValue={`BMI ${bmi.toFixed(1)} · ${bmiCat.label}${profile.targetWeightKg ? ` · target ${weight(profile.targetWeightKg)}` : ""}`}
        series={weightSeries}
        rec={weightRec}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightBlock
          icon={Moon}
          title="Sleep & Recovery"
          subtitle="Sleep hours + resting HR"
          unit="h avg"
          primaryValue={slStats.count ? sleepAvg.toFixed(1) : "—"}
          secondaryValue={hrStats.count ? `Resting HR ${Math.round(hrStats.last)} bpm (avg ${Math.round(hrStats.avg)})` : undefined}
          series={sleepSeries}
          rec={recoveryRec}
        />

        <InsightBlock
          icon={HeartPulse}
          title="Resting HR trend"
          subtitle="Lower & flatter = fitter"
          unit="bpm"
          primaryValue={hrStats.count ? Math.round(hrStats.last).toString() : "—"}
          secondaryValue={hrStats.count > 1 ? `${wStats.trend >= 0 ? "+" : ""}${hrStats.trend.toFixed(1)}% vs prior avg` : undefined}
          series={hrSeries}
          rec={{
            ...recoveryRec,
            headline:
              hrStats.count < 2
                ? "Log resting HR each morning for 7 days to see a real trend."
                : hrDir === "down"
                ? "HR trending down — cardiovascular fitness is improving."
                : hrDir === "up"
                ? "HR trending up — could be fatigue, stress, or illness."
                : "HR is steady — hold your current mix.",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightBlock
          icon={Footprints}
          title="Steps & training load"
          subtitle="Daily movement + weekly minutes"
          unit="steps avg"
          primaryValue={stStats.count ? Math.round(stepsAvg).toLocaleString() : "—"}
          secondaryValue={`~${Math.round((workoutMinTotal / days) * 7)} min training / week`}
          series={stepsSeries}
          rec={activityRec}
        />

        <InsightBlock
          icon={Dumbbell}
          title="Workout minutes"
          subtitle="Session volume by day"
          unit="min"
          primaryValue={wkStats.count ? Math.round(wkStats.last).toString() : "—"}
          secondaryValue={`Best day ${Math.round(wkStats.max)} min · avg ${Math.round(wkStats.avg)}`}
          series={workoutSeries}
          rec={{
            ...activityRec,
            headline:
              wkStats.count < 2
                ? "Log a workout to unlock training load guidance."
                : activityRec.headline,
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightBlock
          icon={Droplets}
          title="Hydration"
          subtitle={`Target ${water(hydroTarget)} / day`}
          unit={`${labels.water} avg`}
          primaryValue={waStats.count ? String(displayWater(waterAvg, units)) : "—"}
          secondaryValue={waStats.count ? `${Math.round((waterAvg / hydroTarget) * 100)}% of target` : undefined}
          series={waterSeries}
          rec={hydroRec}
        />

        <InsightBlock
          icon={Flame}
          title="Calories & fueling"
          subtitle={`Target ${macros.calories.toLocaleString()} kcal · ${macros.proteinG}P / ${macros.carbG}C / ${macros.fatG}F`}
          unit="kcal avg"
          primaryValue={calStats.count ? Math.round(calAvg).toLocaleString() : "—"}
          secondaryValue={calStats.count ? `${Math.round((calAvg / macros.calories) * 100)}% of target` : undefined}
          series={calSeries}
          rec={{
            ...hydroRec,
            headline:
              calStats.count < 2
                ? "Log meals for 3 days to fine-tune fueling advice."
                : hydroRec.headline,
          }}
        />
      </div>

      <InsightBlock
        icon={latestFatigue && latestFatigue.fatigueLevel >= 7 ? BatteryLow : Activity}
        title="Fatigue & injuries"
        subtitle={latestFatigue ? `Last check-in ${latestFatigue.date}` : "Log a check-in on Recovery"}
        unit={fStats.count ? "/10 avg" : ""}
        primaryValue={fStats.count ? fStats.avg.toFixed(1) : "—"}
        secondaryValue={
          latestFatigue
            ? `Sleep quality ${latestFatigue.sleepQuality}/5${
                latestFatigue.soreness.length ? ` · sore: ${latestFatigue.soreness.slice(0, 3).join(", ")}` : ""
              }`
            : "Fatigue level, soreness & injuries feed today's plan"
        }
        series={fatigueSeries}
        rec={fatigueRec}
      />

      {(persistentSore.length > 0 || activeInjuries.length > 0) && (
        <Card className="p-4 sm:p-5 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-display text-base">Active flags</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {persistentSore.length > 0 && (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Recurring soreness</p>
                <div className="flex flex-wrap gap-1.5">
                  {persistentSore.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeInjuries.length > 0 && (
              <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-3.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Reported pain / injury</p>
                <ul className="space-y-1">
                  {activeInjuries.slice(0, 3).map((inj, i) => (
                    <li key={i} className="text-xs text-foreground/85">· {inj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
