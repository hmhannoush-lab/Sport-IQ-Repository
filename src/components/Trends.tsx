import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { buildSeries, seriesStats, MetricKey } from "@/lib/stats";
import { useUnits, seriesInUnits } from "@/lib/units";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";
import { LineChart as LineIcon, BarChart3 } from "lucide-react";

interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  format?: (v: number) => string;
}

const METRICS: MetricDef[] = [
  { key: "steps", label: "Steps", unit: "", format: (v) => v.toLocaleString() },
  { key: "sleepHours", label: "Sleep", unit: "h" },
  { key: "waterMl", label: "Water", unit: "ml" },
  { key: "calories", label: "Calories", unit: "kcal", format: (v) => v.toLocaleString() },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "weightKg", label: "Weight", unit: "kg" },
  { key: "restingHr", label: "Rest HR", unit: "bpm" },
  { key: "fatigueLevel", label: "Fatigue", unit: "/10" },
  { key: "soreness", label: "Soreness", unit: "/10" },
  { key: "workouts", label: "Workout min", unit: "min" },
];

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

export const Trends = () => {
  const { store } = useStore();
  const [active, setActive] = useState<MetricKey>("steps");
  const [days, setDays] = useState(7);

  const { units, labels } = useUnits();
  const base = METRICS.find((m) => m.key === active)!;
  const def = active === "waterMl" ? { ...base, unit: labels.water } : active === "weightKg" ? { ...base, unit: labels.weight } : base;
  const series = seriesInUnits(active, buildSeries(active, days, store.metrics, store.workouts), units);
  const stats = seriesStats(series);
  const fmt = def.format ?? ((v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(1)));

  // Replace null with undefined so recharts breaks the line on missing data
  const chartData = series.map((p) => ({
    ...p,
    value: p.value === null ? undefined : p.value,
  }));

  const hasData = stats.count >= 1;

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <LineIcon className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl">Trends</h3>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-muted/40 border border-border/40">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1 text-xs rounded-full transition-zen ${
                days === r.days ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as MetricKey)}>
        <TabsList className="flex flex-wrap h-auto bg-muted/30 p-1 rounded-2xl mb-5 gap-1 justify-start">
          {METRICS.map((m) => (
            <TabsTrigger
              key={m.key}
              value={m.key}
              className="text-xs px-3 py-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={active} className="mt-0">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatBlock label="Latest" value={hasData ? `${fmt(stats.last)}${def.unit ? " " + def.unit : ""}` : "—"} />
            <StatBlock label="Average" value={hasData ? `${fmt(stats.avg)}${def.unit ? " " + def.unit : ""}` : "—"} />
            <StatBlock label="Best" value={hasData ? `${fmt(stats.max)}${def.unit ? " " + def.unit : ""}` : "—"} />
          </div>

          <div className="h-56 w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    formatter={(v: number | undefined) => (v == null ? "—" : `${fmt(v)}${def.unit ? " " + def.unit : ""}`)}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#trendFill)"
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-2">
                <BarChart3 className="h-8 w-8 opacity-40" />
                <p>No data for this metric yet — log some entries to see your trend.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">{label}</p>
    <p className="font-display text-lg tracking-tight">{value}</p>
  </div>
);
