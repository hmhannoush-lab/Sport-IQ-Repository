import { useStore, todayKey } from "@/lib/store";
import {
  analyzeOvertraining,
  detectMuscleImbalances,
  detectBurnoutRisk,
  generateDeloadRecommendation,
  suggestPreventativeExercises,
} from "@/lib/injuryPrevention";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Zap, Shield, AlertCircle } from "lucide-react";

export const InjuryPrevention = () => {
  const { store } = useStore();

  // Analyze overtraining
  const overtraining = analyzeOvertraining(store.workouts, store.metrics, 7);
  const burnout = detectBurnoutRisk(store.metrics, 14);
  const imbalances = detectMuscleImbalances(store.workouts);
  const deloadRec = generateDeloadRecommendation(overtraining, burnout);
  const preventativeExercises = suggestPreventativeExercises(imbalances);

  // Get today's metrics for context
  const today = store.metrics[todayKey()] ?? {};

  if (
    overtraining.overtrainingRisk === "low" &&
    !burnout.isBurnedOut &&
    imbalances.length === 0
  ) {
    return (
      <Card className="p-5 sm:p-6 border-border/50 shadow-card bg-gradient-to-br from-primary-soft/30 to-card rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-base mb-1">Injury Risk</h3>
            <p className="text-sm text-muted-foreground">All systems optimal. Keep up the balanced approach!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overtraining Alert */}
      {overtraining.overtrainingRisk !== "low" && (
        <Card
          className={`p-5 sm:p-6 border-border/50 shadow-card rounded-2xl ${
            overtraining.overtrainingRisk === "high"
              ? "bg-gradient-to-br from-destructive/10 to-card border-destructive/20"
              : "bg-gradient-to-br from-accent/10 to-card border-accent/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                overtraining.overtrainingRisk === "high"
                  ? "bg-destructive/20"
                  : "bg-accent/20"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  overtraining.overtrainingRisk === "high"
                    ? "text-destructive"
                    : "text-accent"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base mb-1 capitalize">
                {overtraining.overtrainingRisk} overtraining risk
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {overtraining.weeklyVolumeMins} min/week at {overtraining.avgIntensity.toFixed(1)}/3 intensity
              </p>
              <p className="text-xs text-muted-foreground">
                Recovery score: {Math.round(overtraining.recoveryScore)}/100 — Combine volume with better sleep & rest.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Burnout Alert */}
      {burnout.isBurnedOut && (
        <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-2xl bg-gradient-to-br from-orange-500/10 to-card border-orange-500/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base mb-1">Burnout Risk: {burnout.score}/100</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Fatigue: {burnout.factors.fatigueLevel} | Sleep deficit: {burnout.factors.sleepDeficit} | Soreness: {burnout.factors.sorenessLevel}
              </p>
              <p className="text-xs text-muted-foreground">{burnout.message}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Deload Recommendation */}
      {deloadRec.shouldDeload && (
        <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-2xl bg-gradient-to-br from-highlight/20 to-card border-highlight/30">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-highlight/30 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingDown className="h-5 w-5 text-highlight" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base mb-1">Deload Week Recommended</h3>
              <p className="text-sm text-muted-foreground mb-2">{deloadRec.reason}</p>
              <p className="text-xs text-muted-foreground">
                Reduce intensity to {deloadRec.reducedIntensity}% for {deloadRec.suggestedDuration} days. Focus on recovery.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Muscle Imbalances */}
      {imbalances.length > 0 && (
        <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-display text-base">Muscle Imbalances Detected</h3>
              <p className="text-xs text-muted-foreground">Add preventative exercises to reduce injury risk</p>
            </div>
          </div>

          <div className="space-y-3 ml-13">
            {imbalances.map((imb, idx) => (
              <div key={idx} className="pb-3 border-b border-border/50 last:pb-0 last:border-0">
                <p className="text-sm font-medium mb-1">
                  {imb.primary.name} → {imb.secondary.name} ({imb.imbalanceScore}% imbalance)
                </p>
                <p className="text-xs text-muted-foreground">{imb.recommendation}</p>
              </div>
            ))}

            {preventativeExercises.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggested exercises:</p>
                <div className="space-y-1">
                  {preventativeExercises.map((ex, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">• {ex}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
