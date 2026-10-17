import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStore, todayKey, type DailyMetrics } from "@/lib/store";
import { useUnits, displayWater, displayWeight, kgFrom, type Units } from "@/lib/units";
import { Plus, Check, History, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MetricHistoryCharts } from "./MetricHistoryCharts";

const FIELDS: {
  key: "sleepHours" | "steps" | "activeMinutes" | "restingHr" | "weightKg" | "calories" | "proteinG" | "fatigueLevel" | "soreness";
  label: string;
  placeholder: string;
  step?: string;
}[] = [
  { key: "sleepHours", label: "Sleep (h)", placeholder: "7.5", step: "0.1" },
  { key: "steps", label: "Steps", placeholder: "8200" },
  { key: "activeMinutes", label: "Active min", placeholder: "45" },
  { key: "restingHr", label: "Resting HR", placeholder: "58" },
  { key: "weightKg", label: "Weight", placeholder: "72.4", step: "0.1" },
  { key: "calories", label: "Calories", placeholder: "2100" },
  { key: "proteinG", label: "Protein (g)", placeholder: "120" },
  { key: "fatigueLevel", label: "Fatigue 1–10", placeholder: "4" },
  { key: "soreness", label: "Soreness 1–10", placeholder: "3" },
];

/** Weight is stored in kg but shown and typed in the user's units. */
const toShown = (key: string, v: number, u: Units) => (key === "weightKg" ? displayWeight(v, u) : v);
const labelFor = (f: (typeof FIELDS)[number], u: Units) =>
  f.key === "weightKg" ? `Weight (${u === "imperial" ? "lb" : "kg"})` : f.label;

export const LogToday = () => {
  const { store, upsertMetrics } = useStore();
  const { toast } = useToast();
  const { units, labels } = useUnits();
  const today = store.metrics[todayKey()];

  const initial: Record<string, string> = {};
  FIELDS.forEach((f) => {
    const v = today?.[f.key as keyof typeof today] as number | undefined;
    initial[f.key] = v ? String(toShown(f.key, v, units)) : "";
  });
  const [values, setValues] = useState(initial);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const save = () => {
    const patch: Record<string, number> = {};
    let count = 0;
    FIELDS.forEach((f) => {
      const raw = values[f.key];
      if (raw && raw.trim() !== "") {
        const n = parseFloat(raw);
        if (!Number.isNaN(n)) {
          patch[f.key] = f.key === "weightKg" ? kgFrom(n, units) : n;
          count++;
        }
      }
    });
    if (count === 0) {
      toast({ title: "Nothing to save", description: "Enter at least one value to log today." });
      return;
    }
    upsertMetrics(todayKey(), patch);
    toast({ title: "Saved", description: `${count} metric${count === 1 ? "" : "s"} logged for today.` });
  };

  const isLogged = (v: unknown): v is number =>
    typeof v === "number" && !Number.isNaN(v) && v !== 0;

  const recorded = FIELDS.map((f) => {
    const v = today?.[f.key as keyof typeof today] as number | undefined;
    return isLogged(v) ? { label: labelFor(f, units), value: toShown(f.key, v, units) } : null;
  }).filter((x): x is { label: string; value: number } => x !== null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const history = useMemo(() => {
    const todayK = todayKey();
    return Object.values(store.metrics)
      .filter((m) => m.date !== todayK)
      .map((m) => {
        const entries = FIELDS.map((f) => {
          const v = m[f.key as keyof DailyMetrics] as number | undefined;
          return isLogged(v) ? { label: labelFor(f, units), value: toShown(f.key, v, units) } : null;
        }).filter((x): x is { label: string; value: number } => x !== null);
        // Include water as it's tracked separately.
        const water = m.waterMl && m.waterMl > 0 ? { label: `Water (${labels.water})`, value: displayWater(m.waterMl, units) } : null;
        if (water) entries.push(water);
        return { date: m.date, entries };
      })
      .filter((d) => d.entries.length > 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [store.metrics, units, labels.water]);

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Log today</h3>
        </div>
        <p className="text-xs text-muted-foreground">Fill what you can — empty fields are skipped.</p>
      </div>

      {recorded.length > 0 && (
        <div className="mb-5 rounded-2xl bg-primary-soft/30 border border-primary/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Check className="h-3 w-3 text-primary" /> Recorded today
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recorded.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 border border-border/40 text-xs"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium tabular-nums">{Number.isInteger(r.value) ? r.value : r.value.toFixed(1)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`log-${f.key}`} className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {labelFor(f, units)}
            </Label>
            <Input
              id={`log-${f.key}`}
              type="number"
              inputMode="decimal"
              step={f.step ?? "1"}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="bg-background/60"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
          <Check className="h-4 w-4 mr-1.5" /> Save today
        </Button>
      </div>

      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mt-6 border-t border-border/40 pt-5">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between gap-2 text-left group">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="font-display text-base">Full metric history</span>
              <span className="text-xs text-muted-foreground">
                {history.length === 0 ? "no past entries" : `${history.length} day${history.length === 1 ? "" : "s"}`}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-5">
          <MetricHistoryCharts />
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No prior entries yet. Logged days will appear here.
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {history.map((d) => {
                const dateLabel = new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div key={d.date} className="rounded-2xl bg-muted/30 border border-border/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                      {dateLabel}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.entries.map((e) => (
                        <span
                          key={e.label}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 border border-border/40 text-xs"
                        >
                          <span className="text-muted-foreground">{e.label}</span>
                          <span className="font-medium tabular-nums">
                            {Number.isInteger(e.value) ? e.value.toLocaleString() : e.value.toFixed(1)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
