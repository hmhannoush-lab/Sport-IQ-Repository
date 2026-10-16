import { useStore, FatigueEntry, todayKey } from "@/lib/store";
import { SPORTS } from "@/lib/sports";
import {
  calcCalorieTarget,
  calcMacros,
  hydrationTargetMl,
  recommendWorkouts,
  getMealPlan,
  dietGuidance,
} from "@/lib/health";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coach } from "@/components/Coach";
import {
  LayoutDashboard,
  Salad,
  HeartPulse,
  Dumbbell,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
  Droplets,
  Moon,
  Footprints,
  Scale,
  Flame,
  Activity,
  Smile,
} from "lucide-react";

const METRICS_GUIDE: { icon: typeof Droplets; label: string; why: string }[] = [
  { icon: Droplets, label: "Water (ml)", why: "Hydration drives energy, focus and recovery. We track daily intake vs your target." },
  { icon: Moon, label: "Sleep (hours)", why: "Sleep is where muscle repairs and hormones reset. Under 7h shows up fast in fatigue." },
  { icon: Footprints, label: "Steps", why: "A simple proxy for daily movement and baseline cardio health." },
  { icon: Activity, label: "Resting HR (bpm)", why: "A lower trend over weeks usually means better fitness and recovery." },
  { icon: Scale, label: "Weight (kg)", why: "Tracked as a weekly trend — daily noise is normal, the slope is what matters." },
  { icon: Flame, label: "Calories & macros", why: "We compare what you eat to your personalized target so you can adjust gently." },
  { icon: Smile, label: "Mood & soreness", why: "Quick check-ins help the coach spot overload before it becomes injury." },
  { icon: Dumbbell, label: "Workouts", why: "Sessions, duration and load feed your training history and recovery picture." },
];

const GOAL_COPY: Record<string, { title: string; line: string; how: string[] }> = {
  lose: {
    title: "Lean down, sustainably",
    line: "We'll run a gentle calorie deficit while protecting muscle and energy.",
    how: [
      "Eat slightly under your daily burn — no crash diets.",
      "Hit protein first at every meal to keep lean mass.",
      "Mix strength + steady cardio; sleep is non-negotiable.",
    ],
  },
  gain: {
    title: "Build muscle the smart way",
    line: "A small surplus, heavy compound work, and real recovery.",
    how: [
      "Eat a slight surplus, protein at every meal.",
      "Progressive overload 3–5×/week, log your lifts.",
      "7–9h sleep — that's where growth actually happens.",
    ],
  },
  maintain: {
    title: "Hold your shape, raise the floor",
    line: "Steady fueling, balanced training, sharper habits.",
    how: [
      "Eat to your daily burn — consistency over intensity.",
      "Mix strength, cardio, mobility across the week.",
      "Track sleep, water, mood — small drifts matter.",
    ],
  },
  performance: {
    title: "Train like an athlete",
    line: "Fuel hard, recover harder, periodize for your sport.",
    how: [
      "Eat for output — small surplus, carbs around sessions.",
      "Plan hard / easy days; recovery is part of training.",
      "Watch fatigue & soreness trends to avoid overreach.",
    ],
  },
};

const TAB_EXPLANATIONS: { icon: typeof LayoutDashboard; label: string; text: string }[] = [
  { icon: LayoutDashboard, label: "Today", text: "Your daily cockpit — log water, sleep, steps, mood and see how today stacks up against your targets." },
  { icon: Sparkles, label: "Coach", text: "A private AI coach that knows your profile, sports and recent check-ins. Ask anything." },
  { icon: Salad, label: "Diet", text: "Personalized calorie & macro targets plus a sample meal plan for each day of the week." },
  { icon: HeartPulse, label: "Recovery", text: "Fatigue, soreness, sleep & injury check-ins — with protocols when you're running hot." },
  { icon: Dumbbell, label: "Workouts", text: "Log sessions, follow guided exercises with video form cues, and track your training load." },
  { icon: Trophy, label: "Sports", text: "Manage the sports you practice — level, weekly volume, notes — so all advice gets tuned to them." },
  { icon: BookOpen, label: "Sources", text: "The evidence behind every recommendation — guidelines, papers, and trusted references." },
];

export const Roadmap = ({ onEnter }: { onEnter: () => void }) => {
  const { store } = useStore();
  const p = store.profile;
  if (!p) return null;

  const goal = GOAL_COPY[p.goal] ?? GOAL_COPY.maintain;
  const macros = calcMacros(p);
  const calories = calcCalorieTarget(p);
  const water = hydrationTargetMl(p);
  const sportNames = store.sports
    .map((s) => SPORTS.find((x) => x.id === s.sportId)?.name)
    .filter(Boolean)
    .slice(0, 4);

  // Build a baseline check-in from onboarding health answers so the very first
  // plan already reflects fatigue, sleep and injuries.
  const hb = store.healthBaseline;
  const baselineEntry: FatigueEntry | undefined = hb
    ? {
        id: "onboarding-baseline",
        date: todayKey(),
        fatigueLevel: hb.fatigueLevel,
        soreness: [],
        injuries: [hb.injuries, hb.currentPain].filter((x) => x && x.trim()).join(", "),
        sleepQuality: hb.avgSleepHours >= 8 ? 5 : hb.avgSleepHours >= 7 ? 4 : hb.avgSleepHours >= 6 ? 3 : 2,
      }
    : undefined;

  const training = recommendWorkouts(p, store.workouts, baselineEntry);
  const meals = getMealPlan(p, 0, hb?.allergies ?? []);
  const dietTips = dietGuidance(p, store.sports, hb?.allergies ?? [], hb?.allergyNotes ?? "").slice(0, 5);



  return (
    <div className="min-h-screen bg-hero relative overflow-hidden grain">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-orb" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl animate-orb" style={{ animationDelay: "-8s" }} />
      </div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 animate-fade-up">
        {/* Hero */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <Compass className="h-3.5 w-3.5" /> Your roadmap
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Welcome, <span className="text-gradient-sage italic">{p.name}</span>.<br />
            Here's the plan.
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Your body, your sport, your data — turned into a personalized plan by your AI coach.
            It keeps adapting as you log workouts, recovery and meals.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" onClick={onEnter} className="rounded-full px-7 shadow-glow">
              Start now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("roadmap-tour")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full px-7"
            >
              See the plan first
            </Button>
          </div>
        </section>

        {/* Goal summary */}
        <Card className="p-6 sm:p-8 border-border/60 shadow-card">
          <div className="flex items-start gap-4 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-sage flex items-center justify-center shadow-glow shrink-0">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Your goal</p>
              <h2 className="font-display text-2xl sm:text-3xl">{goal.title}</h2>
              <p className="text-muted-foreground mt-2">{goal.line}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily calories</p>
              <p className="font-display text-2xl mt-1">{calories.toLocaleString()}<span className="text-sm text-muted-foreground"> kcal</span></p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Protein target</p>
              <p className="font-display text-2xl mt-1">{macros.proteinG}<span className="text-sm text-muted-foreground"> g</span></p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hydration</p>
              <p className="font-display text-2xl mt-1">{(water / 1000).toFixed(1)}<span className="text-sm text-muted-foreground"> L</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">How it should feel</p>
            <ul className="space-y-2">
              {goal.how.map((h) => (
                <li key={h} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {sportNames.length > 0 && (
            <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Tuned for:</span>
              {sportNames.map((n) => (
                <Badge key={n} variant="secondary" className="rounded-full">{n}</Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Generated training plan */}
        <section className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Generated for you</p>
            <h2 className="font-display text-2xl sm:text-3xl">Your first training plan</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">{training.headline}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {training.suggestions.map((s) => (
              <Card key={s.title} className="p-5 border-border/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-display text-base leading-snug">{s.title}</p>
                  <Badge variant="secondary" className="rounded-full shrink-0 capitalize">{s.intensity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{s.type} · {s.durationMin} min</p>
                <p className="text-sm text-foreground/90 italic mb-3">{s.why}</p>
                <ul className="space-y-1.5">
                  {s.steps.map((step) => (
                    <li key={step} className="flex gap-2 text-sm text-foreground/90">
                      <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Generated diet plan */}
        <section className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Generated for you</p>
            <h2 className="font-display text-2xl sm:text-3xl">Your first day of eating</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              {calories.toLocaleString()} kcal · {macros.proteinG}g protein · {macros.carbG}g carbs · {macros.fatG}g fat
              {hb?.allergies?.length ? " — adapted to your allergies." : "."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {meals.map((m) => (
              <Card key={m.meal} className="p-5 border-border/50">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{m.meal}</p>
                <p className="font-display text-base mb-1">{m.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </Card>
            ))}
          </div>
          {dietTips.length > 0 && (
            <Card className="p-5 border-border/50 bg-muted/20">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Nutrition notes</p>
              <ul className="space-y-2">
                {dietTips.map((t) => (
                  <li key={t} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>



        {/* Tab explanations */}
        <section id="roadmap-tour" className="space-y-4 scroll-mt-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">What's inside</p>
            <h2 className="font-display text-2xl sm:text-3xl">A quick tour of each tab</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Seven tabs, each with one job. Tap any to open it later.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {TAB_EXPLANATIONS.map(({ icon: Icon, label, text }) => (
              <Card key={label} className="p-5 border-border/50 hover:border-primary/40 transition-zen">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-base mb-1">{label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Metrics guide */}
        <section className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">What we track & why</p>
            <h2 className="font-display text-2xl sm:text-3xl">Your metrics, explained</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Nothing here is logged automatically — you stay in control. Log what you can, skip what you can't.
              Trends matter more than any single day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {METRICS_GUIDE.map(({ icon: Icon, label, why }) => (
              <Card key={label} className="p-5 border-border/50">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-base mb-1">{label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{why}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-5 border-dashed border-border/60 bg-muted/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Privacy note:</span> all your check-ins stay on this device unless you sign in.
              The coach only sees what's needed to give you advice.
            </p>
          </Card>
        </section>

        {/* Embedded chatbot */}
        <section className="space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Got questions?</p>
            <h2 className="font-display text-2xl sm:text-3xl">Chat with your coach</h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Ask anything about your plan, goal, or the app itself — before you dive in.
            </p>
          </div>
          <Coach />
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={onEnter} className="rounded-full px-8 shadow-glow">
            Enter Sport IQ <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};
