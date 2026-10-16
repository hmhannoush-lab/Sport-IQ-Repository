import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { SeriesPoint } from "@/lib/stats";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warning" | "alert";
  className?: string;
  children?: React.ReactNode;
  series?: SeriesPoint[];
  trend?: number; // % change vs prior days
  trendGoodWhen?: "up" | "down"; // direction interpretation
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-card/80 backdrop-blur-sm",
  good: "bg-gradient-to-br from-primary-soft/80 to-card/80 backdrop-blur-sm",
  warning: "bg-gradient-to-br from-highlight/40 to-card/80 backdrop-blur-sm",
  alert: "bg-gradient-to-br from-accent-soft to-card/80 backdrop-blur-sm",
};

const iconTone: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  good: "bg-primary/20 text-primary shadow-glow",
  warning: "bg-highlight/70 text-foreground",
  alert: "bg-accent/25 text-accent",
};

const sparkColor: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-primary/70",
  good: "text-primary",
  warning: "text-highlight-foreground/70",
  alert: "text-accent",
};

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone = "default",
  className,
  children,
  series,
  trend,
  trendGoodWhen = "up",
}: Props) => {
  const showTrend = typeof trend === "number" && Math.abs(trend) >= 1 && Number.isFinite(trend);
  const positive = (trend ?? 0) > 0;
  const isGood = trendGoodWhen === "up" ? positive : !positive;
  const TrendIcon = !showTrend ? Minus : positive ? TrendingUp : TrendingDown;
  const trendColor = !showTrend
    ? "text-muted-foreground/50"
    : isGood
    ? "text-primary"
    : "text-accent";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 border-border/40 shadow-card transition-zen hover:shadow-lift hover:-translate-y-1 rounded-2xl",
        toneClasses[tone],
        className,
      )}
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</span>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-zen group-hover:scale-110", iconTone[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl text-foreground tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{hint}</p>}
      {series && series.length > 0 && (
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className={cn("flex-1", sparkColor[tone])}>
            <Sparkline data={series} height={28} />
          </div>
          <div className={cn("flex items-center gap-0.5 text-[10px] font-medium tabular-nums", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{showTrend ? `${positive ? "+" : ""}${trend!.toFixed(0)}%` : "—"}</span>
          </div>
        </div>
      )}
      {children}
    </Card>
  );
};
