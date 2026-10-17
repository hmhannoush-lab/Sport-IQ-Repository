import { useStore, todayKey } from "@/lib/store";
import { calcBMI, bmiCategory, calcMacros, hydrationTargetMl } from "@/lib/health";
import { buildSeries, seriesStats } from "@/lib/stats";
import { useUnits, displayWater, kgTo, mlFrom } from "@/lib/units";
import { MetricCard } from "./MetricCard";
import { Motivation } from "./Motivation";
import { CoachBrief } from "./CoachBrief";
import { ProgressCompare } from "./ProgressCompare";
import { Badges } from "./Badges";
import { LogToday } from "./LogToday";
import { Trends } from "./Trends";
import { MetricStats } from "./MetricStats";
import { MetricAlerts } from "./MetricAlerts";
import { AlertHistory } from "./AlertHistory";
import { useMetricAlertNotifier } from "@/hooks/use-metric-alert-notifier";


import { PersonalAdvice } from "./PersonalAdvice";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplets, Moon, Footprints, HeartPulse, Scale, Flame, Dumbbell } from "lucide-react";

export const Dashboard = () => {
  const { store, upsertMetrics } = useStore();
  useMetricAlertNotifier();
  const profile = store.profile!;
  const { units, labels } = useUnits();
  const imperial = units === "imperial";
  // Quick-add buttons: a glass and a bottle in the user's units.
  const glass = imperial ? Math.round(mlFrom(8, units)) : 250;
  const bottle = imperial ? Math.round(mlFrom(16, units)) : 500;

  const today = store.metrics[todayKey()] ?? { date: todayKey(), waterMl: 0, sleepHours: 0, steps: 0, restingHr: 0, mood: 3 };

  const bmi = calcBMI(profile);
  const cat = bmiCategory(bmi);
  const macros = calcMacros(profile);
  const hydroTarget = hydrationTargetMl(profile);

  // 7-day series for sparklines
  const stepsSeries = buildSeries("steps", 7, store.metrics, store.workouts);
  const sleepSeries = buildSeries("sleepHours", 7, store.metrics, store.workouts);
  const waterSeries = buildSeries("waterMl", 7, store.metrics, store.workouts);
  const hrSeries = buildSeries("restingHr", 7, store.metrics, store.workouts);
  const weightSeries = buildSeries("weightKg", 7, store.metrics, store.workouts);
  const calSeries = buildSeries("calories", 7, store.metrics, store.workouts);
  const workoutSeries = buildSeries("workouts", 7, store.metrics, store.workouts);

  const stepsStats = seriesStats(stepsSeries);
  const sleepStats = seriesStats(sleepSeries);
  const waterStats = seriesStats(waterSeries);
  const hrStats = seriesStats(hrSeries);
  const weightStats = seriesStats(weightSeries);
  const calStats = seriesStats(calSeries);
  const workoutStats = seriesStats(workoutSeries);

  const addWater = (ml: number) => upsertMetrics(todayKey(), { waterMl: Math.max(0, today.waterMl + ml) });

  const currentWeight = today.weightKg ?? weightStats.last ?? profile.weightKg;
  const currentCalories = today.calories ?? 0;

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Today · {new Date().toLocaleDateString(undefined, { weekday: "long" })}</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">
            How you're <span className="text-gradient-sage italic">doing</span>
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      <Motivation />

      <CoachBrief />

      <ProgressCompare />

      <PersonalAdvice compact />

      <Badges />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Footprints}
          label="Steps"
          value={today.steps ? today.steps.toLocaleString() : "—"}
          hint={stepsStats.count > 1 ? `7-day avg ${Math.round(stepsStats.avg).toLocaleString()}` : undefined}
          tone={today.steps >= 8000 ? "good" : today.steps >= 5000 ? "warning" : "default"}
          series={stepsSeries}
          trend={stepsStats.trend}
          trendGoodWhen="up"
        />
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={today.sleepHours ? today.sleepHours.toString() : "—"}
          unit={today.sleepHours ? "h" : ""}
          hint={sleepStats.count > 1 ? `7-day avg ${sleepStats.avg.toFixed(1)} h` : undefined}
          tone={today.sleepHours >= 7 ? "good" : today.sleepHours >= 6 ? "warning" : "default"}
          series={sleepSeries}
          trend={sleepStats.trend}
          trendGoodWhen="up"
        />
        <MetricCard
          icon={Droplets}
          label="Hydration"
          value={`${displayWater(today.waterMl, units)}`}
          unit={`/ ${displayWater(hydroTarget, units)} ${labels.water}`}
          tone={today.waterMl >= hydroTarget ? "good" : today.waterMl >= hydroTarget * 0.5 ? "warning" : "alert"}
          series={waterSeries}
          trend={waterStats.trend}
          trendGoodWhen="up"
        >
          <Progress value={Math.min(100, (today.waterMl / hydroTarget) * 100)} className="mt-3 h-2" />
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => addWater(glass)}>{imperial ? "+8 oz" : "+250"}</Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => addWater(bottle)}>{imperial ? "+16 oz" : "+500"}</Button>
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => addWater(-glass)}>−</Button>
          </div>
        </MetricCard>
        <MetricCard
          icon={HeartPulse}
          label="Resting HR"
          value={today.restingHr ? today.restingHr.toString() : hrStats.last ? Math.round(hrStats.last).toString() : "—"}
          unit={today.restingHr || hrStats.last ? "bpm" : ""}
          hint={hrStats.count > 1 ? `7-day avg ${Math.round(hrStats.avg)} bpm` : undefined}
          series={hrSeries}
          trend={hrStats.trend}
          trendGoodWhen="down"
        />
        <MetricCard
          icon={Flame}
          label="Calories"
          value={currentCalories ? currentCalories.toLocaleString() : "—"}
          unit={currentCalories ? `/ ${macros.calories.toLocaleString()}` : `target ${macros.calories.toLocaleString()}`}
          hint={`${macros.proteinG}P · ${macros.carbG}C · ${macros.fatG}F`}
          tone={currentCalories === 0 ? "default" : Math.abs(currentCalories - macros.calories) < 200 ? "good" : "warning"}
          series={calSeries}
          trend={calStats.trend}
        />
        <MetricCard
          icon={Scale}
          label="Weight"
          value={kgTo(currentWeight, units).toFixed(1)}
          unit={labels.weight}
          hint={`BMI ${bmi.toFixed(1)} · ${cat.label}`}
          tone={cat.tone === "good" ? "good" : cat.tone === "warning" ? "warning" : "alert"}
          series={weightSeries}
          trend={weightStats.trend}
          trendGoodWhen={profile.goal === "lose" ? "down" : profile.goal === "gain" ? "up" : "down"}
        />
        <MetricCard
          icon={Dumbbell}
          label="Workout min"
          value={workoutStats.last ? Math.round(workoutStats.last).toString() : "—"}
          unit={workoutStats.last ? "today" : ""}
          hint={workoutStats.count > 1 ? `7-day total ${Math.round(workoutStats.avg * workoutStats.count)} min` : "Log a session"}
          tone={workoutStats.last ? "good" : "default"}
          series={workoutSeries}
          trend={workoutStats.trend}
          trendGoodWhen="up"
        />
      </div>

      {/* Remount on unit change so typed values aren't saved in the wrong units. */}
      <LogToday key={units} />

      <MetricAlerts />

      <AlertHistory />

      <MetricStats />


      <Trends />

    </div>
  );
};
