import { useMemo } from "react";
import { useStore, todayKey } from "@/lib/store";
import { useUnits } from "@/lib/units";
import { hydrationTargetMl } from "@/lib/health";
import { buildSeries, seriesStats } from "@/lib/stats";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Moon, Footprints, HeartPulse, Dumbbell, Sparkles, Activity, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Priority = "high" | "medium" | "low";

interface Focus {
  id: string;
  icon: LucideIcon;
  title: string;
  message: string;
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  low: "bg-sage/10 text-sage-foreground border-sage/20",
};

const priorityLabel: Record<Priority, string> = {
  high: "Priority",
  medium: "Worth a look",
  low: "On track",
};

export const CoachBrief = () => {
  const { store } = useStore();
  const { units, water: fmtWater } = useUnits();
  const profile = store.profile;

  const focuses = useMemo<Focus[]>(() => {
    if (!profile) return [];
    const today = store.metrics[todayKey()];
    const sleep = seriesStats(buildSeries("sleepHours", 7, store.metrics, store.workouts));
    const water = seriesStats(buildSeries("waterMl", 7, store.metrics, store.workouts));
    const steps = seriesStats(buildSeries("steps", 7, store.metrics, store.workouts));
    const hr = seriesStats(buildSeries("restingHr", 14, store.metrics, store.workouts));
    const workouts = seriesStats(buildSeries("workouts", 7, store.metrics, store.workouts));

    const hydroTarget = hydrationTargetMl(profile);
    const latestFatigue = store.fatigue[0];

    const out: Focus[] = [];

    // Sleep — strongest recovery signal
    if (sleep.count === 0) {
      out.push({
        id: "sleep",
        icon: Moon,
        title: "Log last night's sleep",
        message: "Sleep is the lever with the biggest day-to-day impact on energy, mood and recovery. A quick entry sets the tone for the rest of today's plan.",
        priority: "high",
      });
    } else if (sleep.last && sleep.last < 6.5) {
      out.push({
        id: "sleep",
        icon: Moon,
        title: "Protect recovery today",
        message: `You averaged ${sleep.last.toFixed(1)}h last night, below your 7h target. Consider keeping intensity moderate, prioritising protein, and aiming for an earlier wind-down tonight.`,
        priority: "high",
      });
    } else if (sleep.avg < 7) {
      out.push({
        id: "sleep",
        icon: Moon,
        title: "Sleep trending low",
        message: `Your 7-day average is ${sleep.avg.toFixed(1)}h. Small wins — consistent bedtime, dim lights an hour before — compound quickly.`,
        priority: "medium",
      });
    }

    // Hydration
    const todayWater = today?.waterMl ?? 0;
    if (todayWater < hydroTarget * 0.4) {
      out.push({
        id: "water",
        icon: Droplets,
        title: "Hydration is behind",
        message: `You're at ${fmtWater(todayWater)} of a ${fmtWater(hydroTarget)} target. A glass now and one with each meal usually closes the gap without thinking about it.`,
        priority: todayWater === 0 ? "high" : "medium",
      });
    }

    // Fatigue / soreness
    if (latestFatigue && latestFatigue.fatigueLevel >= 7) {
      out.push({
        id: "fatigue",
        icon: Activity,
        title: "Fatigue is elevated",
        message: `You rated fatigue ${latestFatigue.fatigueLevel}/10 recently${latestFatigue.soreness.length ? ` with soreness in ${latestFatigue.soreness.join(", ")}` : ""}. A mobility session or zone-2 walk will likely serve you better than a hard effort today.`,
        priority: "high",
      });
    }

    // Resting HR drift
    if (hr.count >= 5 && hr.trend > 8) {
      out.push({
        id: "hr",
        icon: HeartPulse,
        title: "Resting HR trending up",
        message: `Your resting heart rate is ${hr.trend.toFixed(0)}% above the prior baseline. That often signals accumulated load, under-recovery or early illness — keep today easy and revisit tomorrow.`,
        priority: "medium",
      });
    }

    // Movement
    if (steps.count > 0 && steps.avg < 5000) {
      out.push({
        id: "steps",
        icon: Footprints,
        title: "Add some daily movement",
        message: `Averaging ${Math.round(steps.avg).toLocaleString()} steps. A 15-minute walk after one meal today is a low-friction way to nudge the trend.`,
        priority: "low",
      });
    }

    // Training consistency
    if (workouts.count === 0 || workouts.avg < 15) {
      out.push({
        id: "train",
        icon: Dumbbell,
        title: "Plan one session you'll actually do",
        message: "Consistency beats intensity. Pick a short, realistic session for today — even 20 minutes counts and keeps the habit alive.",
        priority: "low",
      });
    }

    // Mood / check-in nudge if nothing else stands out
    if (out.length === 0) {
      out.push({
        id: "steady",
        icon: Smile,
        title: "You're tracking well",
        message: "Recent metrics look balanced. Keep the basics steady today — sleep, hydration, protein, movement — and check back in tomorrow.",
        priority: "low",
      });
    }

    // Cap to 3 to keep it digestible
    const order: Priority[] = ["high", "medium", "low"];
    return out
      .sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority))
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fmtWater is rebuilt from `units` each render
  }, [store, profile, units]);

  if (!profile) return null;

  return (
    <Card className="border-border/50 shadow-card p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-sage/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-sage-foreground" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Coach brief</p>
          <h3 className="font-display text-xl text-foreground leading-tight">
            What matters most for you today
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            A read on your last few days of logs — no judgement, just where a small, deliberate effort will pay off the most.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {focuses.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="flex gap-3 p-4 rounded-xl border border-border/60 bg-muted/20"
            >
              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/60">
                <Icon className="h-4 w-4 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-medium text-sm text-foreground">{f.title}</h4>
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${priorityStyles[f.priority]}`}>
                    {priorityLabel[f.priority]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
