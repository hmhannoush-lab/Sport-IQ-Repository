import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { buildSeries, seriesStats, MetricKey } from "@/lib/stats";
import { useUnits, seriesInUnits } from "@/lib/units";
import { Sparkline } from "./Sparkline";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Row {
  key: MetricKey;
  label: string;
  unit: string;
  decimals?: number;
  goodWhen?: "up" | "down";
}

const ROWS: Row[] = [
  { key: "steps", label: "Steps", unit: "", goodWhen: "up" },
  { key: "sleepHours", label: "Sleep", unit: "h", decimals: 1, goodWhen: "up" },
  { key: "waterMl", label: "Water", unit: "ml", goodWhen: "up" },
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g", goodWhen: "up" },
  { key: "weightKg", label: "Weight", unit: "kg", decimals: 1 },
  { key: "restingHr", label: "Rest HR", unit: "bpm", goodWhen: "down" },
  { key: "fatigueLevel", label: "Fatigue", unit: "/10", goodWhen: "down" },
  { key: "soreness", label: "Soreness", unit: "/10", goodWhen: "down" },
  { key: "workouts", label: "Workout min", unit: "min", goodWhen: "up" },
];

const RANGES = [7, 14, 30];

const fmt = (v: number, decimals = 0) =>
  decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();

export const MetricStats = () => {
  const { store } = useStore();
  const [days, setDays] = useState(7);
  const { units, labels } = useUnits();
  const rows = ROWS.map((r) =>
    r.key === "waterMl" ? { ...r, unit: labels.water, decimals: units === "imperial" ? 0 : 1 }
    : r.key === "weightKg" ? { ...r, unit: labels.weight }
    : r,
  );

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-display text-xl leading-tight">Metric statistics</h3>
            <p className="text-xs text-muted-foreground">Latest, average, range and change over your last {days} days</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-muted/40 border border-border/40">
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded-full transition-zen ${
                days === d ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="text-left font-normal pb-2">Metric</th>
              <th className="text-right font-normal pb-2">Latest</th>
              <th className="text-right font-normal pb-2">Avg</th>
              <th className="text-right font-normal pb-2">Min</th>
              <th className="text-right font-normal pb-2">Max</th>
              <th className="text-right font-normal pb-2">Logs</th>
              <th className="text-right font-normal pb-2">Change</th>
              <th className="text-right font-normal pb-2 w-20">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const series = seriesInUnits(r.key, buildSeries(r.key, days, store.metrics, store.workouts), units);
              const s = seriesStats(series);
              const has = s.count > 0;
              const up = s.trend > 1;
              const down = s.trend < -1;
              const good = r.goodWhen ? (up && r.goodWhen === "up") || (down && r.goodWhen === "down") : null;
              const TrendIcon = up ? TrendingUp : down ? TrendingDown : Minus;
              return (
                <tr key={r.key} className="border-t border-border/40">
                  <td className="py-2 pr-2 font-medium text-foreground">{r.label}</td>
                  <td className="py-2 text-right tabular-nums">{has ? `${fmt(s.last, r.decimals)}${r.unit ? " " + r.unit : ""}` : "—"}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{has ? fmt(s.avg, r.decimals) : "—"}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{has ? fmt(s.min, r.decimals) : "—"}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{has ? fmt(s.max, r.decimals) : "—"}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{s.count}/{days}</td>
                  <td className="py-2 text-right tabular-nums">
                    {has && s.count > 1 ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          good === null ? "text-muted-foreground" : good ? "text-sage-foreground" : "text-destructive"
                        }`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {s.trend > 0 ? "+" : ""}
                        {s.trend.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-2">
                    {has ? <Sparkline data={series} /> : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
