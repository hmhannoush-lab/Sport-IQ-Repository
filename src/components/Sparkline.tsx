import { SeriesPoint } from "@/lib/stats";

interface Props {
  data: SeriesPoint[];
  height?: number;
  className?: string;
}

/**
 * Compact inline sparkline. Uses currentColor for stroke so it inherits tone.
 * Renders nothing meaningful when there's <2 data points.
 */
export const Sparkline = ({ data, height = 32, className }: Props) => {
  const width = 100; // viewBox units, scales to container
  const vals = data.map((d) => d.value);
  const numeric = vals.filter((v): v is number => v !== null);
  if (numeric.length < 2) {
    return (
      <div className={className} style={{ height }}>
        <div className="h-full w-full flex items-center text-[10px] text-muted-foreground/60">
          Not enough data yet
        </div>
      </div>
    );
  }
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  // Build path, breaking on null gaps
  let d = "";
  let pen = false;
  data.forEach((p, i) => {
    if (p.value === null) {
      pen = false;
      return;
    }
    const x = i * step;
    const y = height - ((p.value - min) / range) * (height - 4) - 2;
    d += `${pen ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    pen = true;
  });

  // Area fill path (only when fully connected)
  const areaPoints = data
    .map((p, i) => {
      if (p.value === null) return null;
      const x = i * step;
      const y = height - ((p.value - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean);
  const area =
    areaPoints.length > 1
      ? `M${areaPoints[0]} L${areaPoints.slice(1).join(" L")} L${(data.length - 1) * step},${height} L0,${height} Z`
      : "";

  // Last point dot
  const lastIdx = [...data].reverse().findIndex((p) => p.value !== null);
  const lastDataIdx = lastIdx === -1 ? -1 : data.length - 1 - lastIdx;
  const lastPoint = lastDataIdx >= 0 ? data[lastDataIdx] : null;
  const lastX = lastDataIdx * step;
  const lastY =
    lastPoint && lastPoint.value !== null
      ? height - ((lastPoint.value - min) / range) * (height - 4) - 2
      : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ height, width: "100%" }}
      aria-hidden="true"
    >
      {area && <path d={area} fill="currentColor" opacity="0.12" />}
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {lastPoint && (
        <circle cx={lastX} cy={lastY} r="1.8" fill="currentColor" />
      )}
    </svg>
  );
};
