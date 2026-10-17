import { Card } from "@/components/ui/card";
import { useStore, localDateKey } from "@/lib/store";
import { calcStreak, quoteOfTheDay, streakMessage, weeklyActiveDays } from "@/lib/motivation";
import { Flame, Quote } from "lucide-react";

export const Motivation = () => {
  const { store } = useStore();
  const streak = calcStreak(store.metrics, store.workouts);
  const weekly = weeklyActiveDays(store.metrics, store.workouts);
  const q = quoteOfTheDay();

  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = localDateKey(d);
    const active =
      store.workouts.some((w) => w.date === key) ||
      (store.metrics[key] &&
        (store.metrics[key].waterMl >= 1000 ||
          store.metrics[key].sleepHours >= 6 ||
          store.metrics[key].steps >= 3000));
    return { letter: d.toLocaleDateString(undefined, { weekday: "narrow" }), active, isToday: i === 6 };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-6 sm:p-7 border-border/40 shadow-lift lg:col-span-2 bg-gradient-to-br from-primary-soft/70 via-card to-accent-soft/40 relative overflow-hidden rounded-2xl">
        <div aria-hidden className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <Quote className="absolute top-4 right-4 h-16 w-16 text-primary/10" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3 relative">Daily reflection</p>
        <p className="font-display text-2xl sm:text-3xl text-foreground leading-snug relative">"{q.text}"</p>
        <p className="text-sm text-muted-foreground mt-4 relative">— {q.author}</p>
        <div className="mt-4 pt-4 border-t border-border/40 relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">Did you know?</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{q.funFact}</p>
          <a
            href={q.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground/80 hover:text-primary underline underline-offset-2 mt-2 inline-block"
          >
            Source
          </a>
        </div>
      </Card>

      <Card className="p-5 border-border/40 shadow-lift flex flex-col bg-gradient-to-br from-card to-accent-soft/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-accent-soft flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Streak</p>
            <p className="font-display text-3xl leading-tight text-foreground">
              {streak} <span className="text-base text-muted-foreground font-sans">day{streak === 1 ? "" : "s"}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{streakMessage(streak, store.preferences?.motivationStyle)}</p>
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-zen ${
                    d.active
                      ? "bg-sage text-primary-foreground shadow-card"
                      : "bg-muted/50 text-muted-foreground"
                  } ${d.isToday ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""}`}
                >
                  {d.active ? "✓" : ""}
                </div>
                <span className="text-[10px] text-muted-foreground">{d.letter}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">{weekly} of 7 active days this week</p>
        </div>
      </Card>
    </div>
  );
};
