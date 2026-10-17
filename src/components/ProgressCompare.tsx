import { useMemo } from "react";
import { useStore, localDateKey, type DailyMetrics, type Workout } from "@/lib/store";
import { hydrationTargetMl } from "@/lib/health";
import { useUnits } from "@/lib/units";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, Droplets, Moon, Footprints, HeartPulse, Dumbbell, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Direction = "up" | "down";

interface Comparison {
  id: string;
  icon: LucideIcon;
  label: string;
  unit: string;
  recent: number | null;
  prior: number | null;
  goodWhen: Direction;
  format: (v: number) => string;
}

const dayKey = localDateKey;

function windowAverage(
  key: keyof DailyMetrics | "workouts",
  start: number,
  days: number,
  metrics: Record<string, DailyMetrics>,
  workouts: Workout[],
): number | null {
  const today = new Date();
  const vals: number[] = [];
  for (let i = start; i < start + days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    let v: number | undefined;
    if (key === "workouts") {
      v = workouts.filter((w) => w.date === k).reduce((s, w) => s + w.durationMin, 0);
    } else {
      const m = metrics[k];
      v = m ? (m[key] as number | undefined) : undefined;
    }
    if (typeof v === "number" && !Number.isNaN(v) && v !== 0) vals.push(v);
  }
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function pctChange(recent: number, prior: number): number {
  if (prior === 0) return 0;
  return ((recent - prior) / Math.abs(prior)) * 100;
}

export const ProgressCompare = () => {
  const { store } = useStore();
  const { units, labels, water, weight } = useUnits();
  const profile = store.profile;

  const comparisons = useMemo<Comparison[]>(() => {
    if (!profile) return [];
    const m = store.metrics;
    const w = store.workouts;
    const defs: Omit<Comparison, "recent" | "prior">[] = [
      { id: "sleep", icon: Moon, label: "Sleep", unit: "h", goodWhen: "up", format: (v) => `${v.toFixed(1)}h` },
      { id: "water", icon: Droplets, label: "Hydration", unit: labels.water, goodWhen: "up", format: water },
      { id: "steps", icon: Footprints, label: "Steps", unit: "", goodWhen: "up", format: (v) => Math.round(v).toLocaleString() },
      { id: "hr", icon: HeartPulse, label: "Resting HR", unit: "bpm", goodWhen: "down", format: (v) => `${Math.round(v)} bpm` },
      { id: "workouts", icon: Dumbbell, label: "Workout min/day", unit: "min", goodWhen: "up", format: (v) => `${Math.round(v)} min` },
    ];
    const keyMap: Record<string, keyof DailyMetrics | "workouts"> = {
      sleep: "sleepHours",
      water: "waterMl",
      steps: "steps",
      hr: "restingHr",
      workouts: "workouts",
    };
    return defs.map((d) => ({
      ...d,
      recent: windowAverage(keyMap[d.id], 0, 7, m, w),
      prior: windowAverage(keyMap[d.id], 7, 7, m, w),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `water` is rebuilt from `units` each render
  }, [store, profile, units]);

  const goal = useMemo(() => {
    if (!profile) return null;
    if (profile.goal !== "lose" && profile.goal !== "gain") return null;
    if (!profile.targetWeightKg) return null;

    // Latest logged weight, fall back to profile weight
    const today = new Date();
    let current: number | undefined;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const m = store.metrics[dayKey(d)];
      if (m?.weightKg) { current = m.weightKg; break; }
    }
    current ??= profile.weightKg;

    const start = profile.startWeightKg ?? profile.weightKg;
    const target = profile.targetWeightKg;
    const totalDelta = target - start;
    const doneDelta = current - start;
    const pct = totalDelta === 0
      ? 100
      : Math.max(0, Math.min(100, (doneDelta / totalDelta) * 100));
    const remaining = target - current;
    const onTrack =
      (profile.goal === "lose" && remaining <= 0) ||
      (profile.goal === "gain" && remaining >= 0) ||
      Math.sign(doneDelta) === Math.sign(totalDelta);

    return { current, start, target, pct, remaining, onTrack };
  }, [profile, store.metrics]);

  if (!profile) return null;

  const summarySentence = (() => {
    const valid = comparisons.filter((c) => c.recent !== null && c.prior !== null);
    if (valid.length === 0) {
      return "Once you have two weeks of logs, we'll show how this week compares to last and how close you are to your goal.";
    }
    const wins = valid.filter((c) => {
      const change = pctChange(c.recent!, c.prior!);
      return c.goodWhen === "up" ? change > 2 : change < -2;
    });
    if (wins.length === 0) {
      return "This week sits close to last week. Pick one habit to nudge — small, repeatable wins are what move the goal closer.";
    }
    const names = wins.map((w) => w.label.toLowerCase()).slice(0, 3).join(", ");
    return `Real progress this week on ${names}. Keep the same shape next week and the trend compounds.`;
  })();

  return (
    <Card className="border-border/50 shadow-card p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Your progress</p>
          <h3 className="font-display text-xl text-foreground leading-tight">
            This week vs last week
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{summarySentence}</p>
        </div>
      </div>

      {goal && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-sage/10 to-primary/5 border border-sage/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-sage-foreground" />
            <p className="text-sm font-medium text-foreground">
              {profile.goal === "lose" ? "Weight loss goal" : "Weight gain goal"}
            </p>
            <Badge variant="outline" className="ml-auto text-[10px] uppercase tracking-wider">
              {goal.pct >= 95 ? "Goal reached" : `${Math.round(goal.pct)}% there`}
            </Badge>
          </div>
          <Progress value={goal.pct} className="h-2 mb-3" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Scale className="h-3 w-3" />Now {weight(goal.current)}</span>
            <span>•</span>
            <span>Start {weight(goal.start)}</span>
            <span>•</span>
            <span>Target {weight(goal.target)}</span>
          </div>
          <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
            {goal.pct >= 95
              ? "You've hit your target — beautiful work. Time to set a maintenance plan or define what's next."
              : Math.abs(goal.remaining) < 1
                ? `You're within ${units === "imperial" ? "about 2 lb" : "a kilo"} of your target. Keep your routine steady and let the trend finish the job.`
                : goal.onTrack
                  ? `${weight(Math.abs(goal.remaining))} to go — your direction is right. Stay with the habits that are working.`
                  : `${weight(Math.abs(goal.remaining))} to go in the ${profile.goal === "lose" ? "loss" : "gain"} direction. Worth revisiting calories, protein and recovery this week.`}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {comparisons.map((c) => {
          const Icon = c.icon;
          const hasBoth = c.recent !== null && c.prior !== null;
          const change = hasBoth ? pctChange(c.recent!, c.prior!) : 0;
          const isImprovement = c.goodWhen === "up" ? change > 0 : change < 0;
          const flat = Math.abs(change) < 2;
          const TrendIcon = flat ? Minus : change > 0 ? TrendingUp : TrendingDown;
          const trendClass = flat
            ? "text-muted-foreground bg-muted"
            : isImprovement
              ? "text-sage-foreground bg-sage/15"
              : "text-amber-700 dark:text-amber-400 bg-amber-500/10";
          return (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/60">
                <Icon className="h-4 w-4 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">
                  {c.recent === null ? "No data yet" : `Now ${c.format(c.recent)}`}
                  {c.prior !== null && ` · before ${c.format(c.prior)}`}
                </p>
              </div>
              {hasBoth && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trendClass}`}>
                  <TrendIcon className="h-3 w-3" />
                  {flat ? "steady" : `${change > 0 ? "+" : ""}${change.toFixed(0)}%`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
