import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeTrainingLoad, ZONE_COPY, LoadZone } from "@/lib/trainingLoad";
import { RECOVERY_SOURCES } from "@/lib/evidence";
import { Card } from "@/components/ui/card";
import { Gauge, ExternalLink } from "lucide-react";

const zoneStyles: Record<LoadZone, string> = {
  building: "bg-muted text-muted-foreground border-border",
  under: "bg-highlight/30 text-foreground border-highlight",
  optimal: "bg-primary/15 text-primary border-primary/30",
  caution: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

const SOURCES = [RECOVERY_SOURCES.loadInjury, RECOVERY_SOURCES.loadConsensus];

export const TrainingLoad = () => {
  const { store } = useStore();
  const load = useMemo(() => computeTrainingLoad(store.workouts), [store.workouts]);
  const copy = ZONE_COPY[load.zone];
  const maxWeek = Math.max(...load.weeks, 1);

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Training load & injury risk</h3>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${zoneStyles[load.zone]}`}>
          {copy.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "This week", value: Math.round(load.acute).toLocaleString() },
          { label: "4-week avg", value: Math.round(load.chronic).toLocaleString() },
          { label: "Ratio", value: load.ratio === null ? "—" : load.ratio.toFixed(2) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-muted/30 border border-border/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 h-20 mb-1" aria-label="Weekly training load, last 4 weeks">
        {load.weeks.map((w, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end">
            <div
              className={`rounded-t-lg ${i === 3 ? "bg-primary" : "bg-primary/30"}`}
              style={{ height: `${Math.max(4, (w / maxWeek) * 100)}%` }}
              title={`${Math.round(w)} load units`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {["3 wks ago", "2 wks ago", "Last wk", "This wk"].map((l) => (
          <p key={l} className="flex-1 text-center text-[10px] text-muted-foreground">{l}</p>
        ))}
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">{copy.advice}</p>
      <p className="text-[11px] text-muted-foreground mt-2">
        Load = minutes × effort (low 3, medium 5, high 8). A ratio of 0.8–1.3 is the safest range.
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {SOURCES.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.citation}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            {s.label}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ))}
      </div>
    </Card>
  );
};
