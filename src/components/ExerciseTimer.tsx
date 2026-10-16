import { useEffect, useRef, useState } from "react";
import { ExerciseTiming } from "@/lib/exercises";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface Props {
  timing: ExerciseTiming;
}

type Phase = "work" | "rest" | "done";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

// Tiny WebAudio beep so we don't need an asset
const beep = (freq = 880, duration = 0.18) => {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch {
    /* no-op */
  }
};

export const ExerciseTimer = ({ timing }: Props) => {
  const { workSec, restSec, rounds, unit } = timing;
  const hasRest = restSec > 0 && rounds > 1;

  const [phase, setPhase] = useState<Phase>("work");
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(workSec);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset whenever the timing input changes (e.g. switching exercises)
  useEffect(() => {
    setPhase("work");
    setRound(1);
    setRemaining(workSec);
    setRunning(false);
  }, [workSec, restSec, rounds]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) {
          if (r <= 4) beep(660, 0.08); // countdown ticks
          return r - 1;
        }
        // Phase ended
        if (phase === "work") {
          if (round >= rounds) {
            beep(1320, 0.4);
            setPhase("done");
            setRunning(false);
            return 0;
          }
          if (hasRest) {
            beep(523, 0.2);
            setPhase("rest");
            return restSec;
          }
          // No rest configured — straight to next round
          beep(880, 0.2);
          setRound((n) => n + 1);
          return workSec;
        }
        // rest -> next work round
        beep(880, 0.25);
        setPhase("work");
        setRound((n) => n + 1);
        return workSec;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, round, rounds, workSec, restSec, hasRest]);

  const reset = () => {
    setPhase("work");
    setRound(1);
    setRemaining(workSec);
    setRunning(false);
  };

  const skip = () => {
    if (phase === "done") return;
    if (phase === "work") {
      if (round >= rounds) {
        setPhase("done");
        setRemaining(0);
        setRunning(false);
        return;
      }
      if (hasRest) {
        setPhase("rest");
        setRemaining(restSec);
      } else {
        setRound((n) => n + 1);
        setRemaining(workSec);
      }
    } else if (phase === "rest") {
      setPhase("work");
      setRound((n) => n + 1);
      setRemaining(workSec);
    }
  };

  const total = phase === "rest" ? restSec : workSec;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 100;

  const phaseLabel =
    phase === "done" ? "Complete" : phase === "rest" ? "Rest" : `Work · ${unit} ${round}/${rounds}`;

  const ringColor =
    phase === "done"
      ? "stroke-primary"
      : phase === "rest"
      ? "stroke-highlight"
      : "stroke-primary";

  // SVG ring geometry
  const size = 168;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (1 - progress / 100);

  return (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Guided timer</p>
          <p className="font-display text-base">{phaseLabel}</p>
        </div>
        <p className="text-[11px] text-muted-foreground text-right">
          {rounds} × {fmt(workSec)}
          {hasRest ? ` · ${fmt(restSec)} rest` : ""}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              className="stroke-muted/40 fill-none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              className={`fill-none ${ringColor} transition-[stroke-dashoffset] duration-500 ease-linear`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl tracking-tight tabular-nums">
              {phase === "done" ? "✓" : fmt(remaining)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {phase === "done" ? "All rounds done" : phase === "rest" ? "Rest" : "Work"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={reset}
            aria-label="Reset timer"
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (phase === "done") reset();
              setRunning((r) => !r);
            }}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6"
          >
            {running ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> {phase === "done" ? "Restart" : "Start"}
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={skip}
            disabled={phase === "done"}
            aria-label="Skip phase"
            className="rounded-full"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
