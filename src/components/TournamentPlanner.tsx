import { useState } from "react";
import { useStore } from "@/lib/store";
import { SPORTS } from "@/lib/sports";
import { tournamentPlan } from "@/lib/tournament";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Dumbbell, Apple, Moon, X, CalendarPlus } from "lucide-react";
import { downloadText, tournamentIcs } from "@/lib/exportFiles";

const PHASE_STYLES: Record<string, string> = {
  far: "bg-muted text-muted-foreground border-border",
  build: "bg-accent/20 text-foreground border-accent/40",
  taper: "bg-primary/15 text-primary border-primary/30",
  "peak-week": "bg-primary/25 text-primary border-primary/40",
  "race-day": "bg-primary text-primary-foreground border-primary",
  recovery: "bg-muted text-muted-foreground border-border",
};

export const TournamentPlanner = ({ onAsk }: { onAsk?: (q: string) => void }) => {
  const { store, setTournament } = useStore();
  const t = store.tournament;
  const [name, setName] = useState(t?.name ?? "");
  const [date, setDate] = useState(t?.date ?? "");
  const [sport, setSport] = useState(t?.sport ?? "");

  const plan = t?.name && t?.date ? tournamentPlan(t) : null;
  const sportOptions = store.sports.map(
    (sp) => sp.customName ?? SPORTS.find((s) => s.id === sp.sportId)?.name ?? sp.sportId,
  );

  const save = () => {
    if (!name.trim() || !date) return;
    setTournament({ name: name.trim(), date, sport: sport || undefined });
  };

  return (
    <Card className="p-5 border-border/50 shadow-card rounded-2xl bg-card/80">
      <div className="flex items-start gap-3">
        <Trophy className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base">Upcoming tournament or competition</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Add your event and the coach plans your training, fuelling and taper around the date.
              </p>
            </div>
            {t && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => { setTournament(null); setName(""); setDate(""); setSport(""); }}
                aria-label="Remove event"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-2 mt-4 items-end">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Event</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Regional finals" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Sport</Label>
              <Input
                list="tournament-sports"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Optional"
                className="h-10 rounded-xl"
              />
              <datalist id="tournament-sports">
                {sportOptions.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <Button onClick={save} disabled={!name.trim() || !date} className="h-10 rounded-xl">
              {t ? "Update" : "Save"}
            </Button>
          </div>

          {plan && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${PHASE_STYLES[plan.phase]}`}>
                  {plan.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {plan.daysOut < 0
                    ? `${Math.abs(plan.daysOut)} days ago`
                    : plan.daysOut === 0
                    ? "Today"
                    : `${plan.daysOut} days to go`}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-snug">{plan.headline}</p>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Dumbbell, title: "Training", items: plan.training },
                  { icon: Apple, title: "Fuelling", items: plan.nutrition },
                  { icon: Moon, title: "Recovery", items: plan.recovery },
                ].map(({ icon: Icon, title, items }) => (
                  <div key={title} className="rounded-xl bg-muted/30 border border-border/40 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      <Icon className="h-3.5 w-3.5 text-primary" /> {title}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {items.map((i) => (
                        <li key={i} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
                          <span className="text-primary">•</span>
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {onAsk && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      onAsk(
                        `Build me a day-by-day plan for the ${plan.daysOut < 0 ? "recovery period after" : `${plan.daysOut} days before`} ${t!.name}, covering training, fuelling and sleep.`,
                      )
                    }
                  >
                    Ask the coach for a day-by-day plan
                  </Button>
                )}
                {plan.daysOut >= 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => downloadText(`${t!.name.replace(/[^\w-]+/g, "-")}.ics`, tournamentIcs(t!), "text/calendar")}
                  >
                    <CalendarPlus className="h-3.5 w-3.5 mr-1.5" /> Add to calendar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
