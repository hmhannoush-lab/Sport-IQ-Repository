import { useStore } from "@/lib/store";
import { useUnits } from "@/lib/units";
import { personalAdvice, AdviceLevel } from "@/lib/advice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Dumbbell, Apple, Moon, AlertTriangle, ShieldCheck, Activity, Droplets } from "lucide-react";

const levelMeta: Record<AdviceLevel, { label: string; ring: string; chip: string; icon: typeof ShieldCheck }> = {
  green: { label: "Recovered", ring: "border-primary/40 bg-primary-soft/40", chip: "bg-primary text-primary-foreground", icon: ShieldCheck },
  amber: { label: "Caution", ring: "border-highlight bg-highlight/20", chip: "bg-highlight text-foreground", icon: Activity },
  red: { label: "Rest needed", ring: "border-accent/50 bg-accent-soft", chip: "bg-accent text-accent-foreground", icon: AlertTriangle },
};

const intensityChip: Record<string, string> = {
  rest: "bg-accent/20 text-accent",
  low: "bg-primary/15 text-primary",
  medium: "bg-highlight/40 text-foreground",
  high: "bg-primary text-primary-foreground",
};

const toneDot: Record<string, string> = {
  good: "bg-primary",
  warning: "bg-highlight",
  alert: "bg-accent",
  neutral: "bg-muted-foreground/40",
};

interface Props {
  compact?: boolean;
}

export const PersonalAdvice = ({ compact = false }: Props) => {
  const { store } = useStore();
  const { water } = useUnits();
  const profile = store.profile;
  if (!profile) return null;

  const latest = store.fatigue[0];
  const advice = personalAdvice(profile, latest, store.workouts, store.metrics, store.sports);
  const meta = levelMeta[advice.level];
  const Icon = meta.icon;

  if (compact) {
    return (
      <Card className={`p-5 border-2 rounded-3xl ${meta.ring} shadow-card`}>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center shrink-0 shadow-card">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`${meta.chip} uppercase text-[10px] tracking-wider border-0`}>{meta.label}</Badge>
              {!latest && (
                <span className="text-[11px] text-muted-foreground">Log a check-in for personalized advice</span>
              )}
            </div>
            <h3 className="font-display text-lg leading-snug mb-2">{advice.summary}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {advice.signals.slice(0, 3).map((s) => (
                <span key={s.label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-card/60 px-2 py-1 rounded-full border border-border/50">
                  <span className={`h-1.5 w-1.5 rounded-full ${toneDot[s.tone]}`} />
                  {s.label}: <strong className="text-foreground font-medium">{s.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header status card */}
      <Card className={`p-6 border-2 rounded-3xl ${meta.ring} shadow-card`}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-card flex items-center justify-center shrink-0 shadow-card">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${meta.chip} uppercase text-[10px] tracking-wider border-0`}>{meta.label}</Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personalized for {profile.name}</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-tight tracking-tight mb-3">
              {advice.summary}
            </h3>
            {!latest && (
              <p className="text-sm text-muted-foreground">
                No check-in logged yet — submit one above and the engine will tailor everything to your fatigue, soreness and injuries.
              </p>
            )}
          </div>
        </div>

        {/* Signal strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5">
          {advice.signals.map((s) => (
            <div key={s.label} className="rounded-2xl bg-card/70 border border-border/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`h-1.5 w-1.5 rounded-full ${toneDot[s.tone]}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-display text-base tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {advice.flags.length > 0 && (
          <div className="mt-5 space-y-2">
            {advice.flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm bg-card/70 border border-border/50 rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span className="text-foreground/90">{f}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Training */}
      <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-5">
          <Dumbbell className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Training plan</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {advice.training.map((t, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-display text-base leading-snug">{t.title}</h4>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${intensityChip[t.intensity]}`}>
                  {t.intensity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{t.duration}</p>
              <p className="text-sm text-foreground/90 italic mb-3">{t.why}</p>
              <ul className="space-y-1.5">
                {t.steps.map((s, j) => (
                  <li key={j} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {t.avoid && t.avoid.length > 0 && (
                <p className="mt-3 text-xs text-accent">
                  <strong>Avoid:</strong> {t.avoid.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Diet */}
      <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-5">
          <Apple className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Nutrition focus</h3>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-display text-2xl tracking-tight text-gradient-sage">{advice.diet.focus}</span>
        </div>
        <p className="text-sm text-foreground/90 italic mb-4">{advice.diet.why}</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatTile icon={Droplets} label="Hydration" value={water(advice.diet.hydrationMl)} />
          <StatTile label="Protein" value={`${advice.diet.proteinG} g`} />
          <StatTile label="Calories" value={advice.diet.calorieDelta === 0 ? "On target" : `${advice.diet.calorieDelta > 0 ? "+" : ""}${advice.diet.calorieDelta} kcal`} />
        </div>
        <ul className="space-y-2">
          {advice.diet.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Lifestyle */}
      {advice.lifestyle.length > 0 && (
        <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-4 w-4 text-primary" />
            <h3 className="font-display text-xl">Lifestyle</h3>
          </div>
          <ul className="space-y-2">
            {advice.lifestyle.map((l, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/90">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

const StatTile = ({ icon: Icon, label, value }: { icon?: typeof Droplets; label: string; value: string }) => (
  <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <p className="font-display text-base tracking-tight">{value}</p>
  </div>
);
