import { useMemo, useState } from "react";
import { useStore, localDateKey } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";

type RangeKey = "30d" | "90d" | "180d";

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "180d", label: "6 months", days: 180 },
];

const dayKey = localDateKey;
const shift = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Get ISO week key: YYYY-Www
function weekKey(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const MetricHistoryCharts = () => {
  const { store } = useStore();
  const [range, setRange] = useState<RangeKey>("30d");
  const days = RANGES.find((r) => r.key === range)!.days;

  const daily = useMemo(() => {
    const today = new Date();
    // Pre-bucket fatigue entries by date — latest one wins
    const fatigueByDate: Record<string, (typeof store.fatigue)[number]> = {};
    [...store.fatigue]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .forEach((f) => {
        fatigueByDate[f.date] = f;
      });

    const out: { date: string; label: string; fatigue: number | null; injury: number | null }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = shift(today, -i);
      const k = dayKey(d);
      const m = store.metrics[k];
      const f = fatigueByDate[k];
      const fatigue =
        f?.fatigueLevel ??
        (typeof m?.fatigueLevel === "number" && m.fatigueLevel > 0 ? m.fatigueLevel : null);

      let injury: number | null = null;
      if (f) {
        const sore = Array.isArray(f.soreness) ? f.soreness.length : 0;
        const injuryFlag = f.injuries && f.injuries.trim() !== "" ? 3 : 0;
        injury = Math.min(10, sore + injuryFlag);
      } else if (typeof m?.soreness === "number" && m.soreness > 0) {
        injury = m.soreness;
      }

      out.push({
        date: k,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        fatigue,
        injury,
      });
    }
    return out;
  }, [store.metrics, store.fatigue, days]);

  const hasAny = daily.some((d) => d.fatigue !== null || d.injury !== null);

  // Weekly summary — last 8 weeks within range
  const weekly = useMemo(() => {
    const buckets: Record<string, { fatigue: number[]; injury: number[]; weekStart: Date }> = {};
    daily.forEach((p) => {
      const d = new Date(p.date + "T00:00:00");
      const k = weekKey(d);
      if (!buckets[k]) {
        // Compute Monday of that week for label
        const day = d.getDay() || 7;
        const monday = shift(d, 1 - day);
        buckets[k] = { fatigue: [], injury: [], weekStart: monday };
      }
      if (p.fatigue !== null) buckets[k].fatigue.push(p.fatigue);
      if (p.injury !== null) buckets[k].injury.push(p.injury);
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([k, v]) => ({
        key: k,
        label: v.weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        fatigue: v.fatigue.length ? +(v.fatigue.reduce((s, x) => s + x, 0) / v.fatigue.length).toFixed(1) : 0,
        injury: v.injury.length ? +(v.injury.reduce((s, x) => s + x, 0) / v.injury.length).toFixed(1) : 0,
      }));
  }, [daily]);

  const monthly = useMemo(() => {
    const buckets: Record<string, { fatigue: number[]; injury: number[]; monthStart: Date }> = {};
    daily.forEach((p) => {
      const d = new Date(p.date + "T00:00:00");
      const k = monthKey(d);
      if (!buckets[k]) {
        buckets[k] = { fatigue: [], injury: [], monthStart: new Date(d.getFullYear(), d.getMonth(), 1) };
      }
      if (p.fatigue !== null) buckets[k].fatigue.push(p.fatigue);
      if (p.injury !== null) buckets[k].injury.push(p.injury);
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => ({
        key: k,
        label: v.monthStart.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        fatigue: v.fatigue.length ? +(v.fatigue.reduce((s, x) => s + x, 0) / v.fatigue.length).toFixed(1) : 0,
        injury: v.injury.length ? +(v.injury.reduce((s, x) => s + x, 0) / v.injury.length).toFixed(1) : 0,
        fatigueDays: v.fatigue.length,
        injuryDays: v.injury.length,
      }));
  }, [daily]);

  const avg = (arr: (number | null)[]) => {
    const vals = arr.filter((v): v is number => v !== null);
    if (!vals.length) return null;
    return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };
  const fatigueAvg = avg(daily.map((d) => d.fatigue));
  const injuryAvg = avg(daily.map((d) => d.injury));
  const fatiguePeak = Math.max(0, ...daily.map((d) => d.fatigue ?? 0));
  const injuryPeak = Math.max(0, ...daily.map((d) => d.injury ?? 0));

  return (
    <div className="rounded-2xl bg-muted/20 border border-border/40 p-4 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h4 className="font-display text-base">Fatigue & injury trends</h4>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-muted/40 border border-border/40">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 text-[11px] rounded-full transition-colors ${
                range === r.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!hasAny ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No fatigue or injury data yet. Log fatigue or soreness to see trends here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat icon={<Activity className="h-3 w-3" />} label="Avg fatigue" value={fatigueAvg !== null ? `${fatigueAvg}/10` : "—"} />
            <Stat label="Peak fatigue" value={fatiguePeak ? `${fatiguePeak}/10` : "—"} />
            <Stat icon={<AlertTriangle className="h-3 w-3" />} label="Avg injury" value={injuryAvg !== null ? `${injuryAvg}/10` : "—"} />
            <Stat label="Peak injury" value={injuryPeak ? `${injuryPeak}/10` : "—"} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Daily</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily.map((d) => ({ ...d, fatigue: d.fatigue ?? undefined, injury: d.injury ?? undefined }))} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} minTickGap={20} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number | undefined, name) => [v == null ? "—" : `${v}/10`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="fatigue" name="Fatigue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="injury" name="Injury" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <SummaryChart title="Weekly average" data={weekly} />
            <SummaryChart title="Monthly average" data={monthly} />
          </div>

          {monthly.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Monthly breakdown</p>
              <div className="space-y-1">
                {monthly.slice().reverse().map((m) => (
                  <div key={m.key} className="flex items-center justify-between text-xs rounded-lg bg-card/60 border border-border/40 px-3 py-1.5">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      Fatigue <span className="text-foreground">{m.fatigue || "—"}</span> · Injury <span className="text-foreground">{m.injury || "—"}</span> · {m.fatigueDays}d logged
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-xl bg-card/60 border border-border/40 px-3 py-2">
    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-0.5 flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="font-display text-base tabular-nums">{value}</p>
  </div>
);

const SummaryChart = ({ title, data }: { title: string; data: { label: string; fatigue: number; injury: number }[] }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{title}</p>
    <div className="h-44 w-full">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name) => [`${v}/10`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="fatigue" name="Fatigue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="injury" name="Injury" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);
