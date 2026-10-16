import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import {
  ALERT_METRICS,
  AlertRule,
  evaluateAlerts,
  formatAlertValue,
  resolveAlertRules,
} from "@/lib/alerts";
import { BellRing, ChevronDown, ChevronUp, ExternalLink, Settings2, AlertTriangle } from "lucide-react";

export const MetricAlerts = () => {
  const { store, setAlertRules } = useStore();
  const [configOpen, setConfigOpen] = useState(false);

  const rules = useMemo(() => resolveAlertRules(store.alertRules), [store.alertRules]);
  const triggered = useMemo(
    () => evaluateAlerts(rules, store.metrics, store.workouts),
    [rules, store.metrics, store.workouts],
  );

  const update = (key: string, patch: Partial<AlertRule>) => {
    setAlertRules(rules.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-display text-xl leading-tight">Metric alerts</h3>
            <p className="text-xs text-muted-foreground">
              {activeCount} threshold{activeCount === 1 ? "" : "s"} watched · {triggered.length} triggered today
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setConfigOpen((v) => !v)}>
          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
          {configOpen ? "Hide setup" : "Configure"}
          {configOpen ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
        </Button>
      </div>

      {triggered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing has crossed a threshold today. Log your metrics and we'll flag anything outside your range with a coach
          note and its sources.
        </p>
      ) : (
        <div className="space-y-3">
          {triggered.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <span className="font-medium text-foreground">{a.def.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  {formatAlertValue(a.def, a.value)} · {a.rule.direction} {formatAlertValue(a.def, a.rule.threshold)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.explanation}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {a.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.citation}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-zen"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {configOpen && (
        <div className="mt-5 pt-5 border-t border-border/50 space-y-3">
          {ALERT_METRICS.map((def) => {
            const rule = rules.find((r) => r.key === def.key)!;
            return (
              <div key={def.key} className="flex flex-wrap items-center gap-3">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(v) => update(def.key, { enabled: v })}
                  aria-label={`Alert on ${def.label}`}
                />
                <span className="text-sm font-medium w-32">{def.label}</span>
                <div className="flex gap-1 p-1 rounded-full bg-muted/40 border border-border/40">
                  {(["below", "above"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => update(def.key, { direction: d })}
                      className={`px-3 py-1 text-xs rounded-full transition-zen ${
                        rule.direction === d
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={rule.threshold}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) update(def.key, { threshold: v });
                  }}
                  className="h-9 w-28 rounded-xl"
                />
                <span className="text-xs text-muted-foreground">{def.unit || "count"}</span>
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground pt-1">
            Alerts also send a browser notification when notifications are enabled in Achievements.
          </p>
        </div>
      )}
    </Card>
  );
};
