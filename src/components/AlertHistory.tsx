import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, todayKey, localDateKey } from "@/lib/store";
import { ALERT_METRICS, formatAlertValue, getAlertMetric } from "@/lib/alerts";
import { History, ExternalLink, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const dayLabel = (date: string) => {
  const today = todayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export const AlertHistory = () => {
  const { store, clearAlertHistory } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const history = store.alertHistory ?? [];

  const filtered = useMemo(
    () => (filter === "all" ? history : history.filter((e) => e.key === filter)),
    [history, filter],
  );
  const visible = showAll ? filtered : filtered.slice(0, 8);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const e of visible) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [visible]);

  const usedKeys = useMemo(() => [...new Set(history.map((e) => e.key))], [history]);

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-display text-xl leading-tight">Alert history</h3>
            <p className="text-xs text-muted-foreground">
              {history.length} threshold crossing{history.length === 1 ? "" : "s"} recorded
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={clearAlertHistory}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No alerts yet. Once a metric crosses one of your thresholds, it lands here with the coach note and sources.
        </p>
      ) : (
        <>
          {usedKeys.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs rounded-full border transition-zen ${
                  filter === "all" ? "bg-primary text-primary-foreground border-transparent" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {ALERT_METRICS.filter((m) => usedKeys.includes(m.key)).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setFilter(m.key)}
                  className={`px-3 py-1 text-xs rounded-full border transition-zen ${
                    filter === m.key ? "bg-primary text-primary-foreground border-transparent" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-5">
            {grouped.map(([date, events]) => (
              <div key={date}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{dayLabel(date)}</p>
                <ol className="relative border-l border-border/60 pl-4 space-y-3">
                  {events.map((e) => {
                    const def = getAlertMetric(e.key);
                    if (!def) return null;
                    const open = expanded === e.id + e.at;
                    return (
                      <li key={e.id + e.at} className="relative">
                        <span className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-destructive" />
                        <button
                          onClick={() => setExpanded(open ? null : e.id + e.at)}
                          className="w-full text-left rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 hover:bg-muted/30 transition-zen"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground text-sm">{def.label}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              {formatAlertValue(def, e.value)} · {e.direction} {formatAlertValue(def, e.threshold)}
                            </span>
                            <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
                              {new Date(e.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                          {open && (
                            <div className="mt-2.5">
                              <p className="text-sm text-muted-foreground leading-relaxed">{def.coach[e.direction]}</p>
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {def.sources.map((s) => (
                                  <a
                                    key={s.url}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={s.citation}
                                    onClick={(ev) => ev.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-zen"
                                  >
                                    {s.label}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          {filtered.length > 8 && (
            <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show less" : `Show all ${filtered.length}`}
            </Button>
          )}
        </>
      )}
    </Card>
  );
};
