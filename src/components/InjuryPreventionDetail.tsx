import { useStore } from "@/lib/store";
import {
  analyzeOvertraining,
  detectMuscleImbalances,
  detectBurnoutRisk,
  generateDeloadRecommendation,
  suggestPreventativeExercises,
} from "@/lib/injuryPrevention";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Zap, Heart, TrendingDown, Shield, BookOpen } from "lucide-react";

export const InjuryPreventionDetail = () => {
  const { store } = useStore();

  const overtraining = analyzeOvertraining(store.workouts, store.metrics, 7);
  const burnout = detectBurnoutRisk(store.metrics, 14);
  const imbalances = detectMuscleImbalances(store.workouts);
  const deloadRec = generateDeloadRecommendation(overtraining, burnout);
  const preventativeExercises = suggestPreventativeExercises(imbalances);

  const getColorClass = (risk: string) => {
    if (risk === "high") return "text-destructive";
    if (risk === "moderate") return "text-accent";
    return "text-primary";
  };

  const getBarColor = (risk: string) => {
    if (risk === "high") return "bg-destructive";
    if (risk === "moderate") return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Prevention</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">Injury <span className="text-gradient-sage italic">prevention</span></h2>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="overtraining">Overtraining</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Risk Scores */}
            <Card className="p-5 sm:p-6 border-border/50 shadow-card">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm">Overtraining Risk</h3>
                  <span className={`text-xl font-bold ${getColorClass(overtraining.overtrainingRisk)}`}>
                    {overtraining.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(overtraining.overtrainingRisk)}`}
                    style={{ width: `${overtraining.riskScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 capitalize">{overtraining.overtrainingRisk} risk</p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 border-border/50 shadow-card">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm">Burnout Risk</h3>
                  <span className={`text-xl font-bold ${burnout.isBurnedOut ? "text-destructive" : "text-primary"}`}>
                    {burnout.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${burnout.isBurnedOut ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${burnout.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{burnout.isBurnedOut ? "High" : "Healthy"} recovery</p>
              </div>
            </Card>
          </div>

          {/* Recovery Score */}
          <Card className="p-5 sm:p-6 border-border/50 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base">Recovery Score</h3>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{Math.round(overtraining.recoveryScore)}/100</div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on sleep, fatigue, soreness, and resting heart rate from the past {overtraining.days} days.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Sleep quality</span>
                <span className="text-muted-foreground">{burnout.factors.sleepDeficit}/10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Fatigue level</span>
                <span className="text-muted-foreground">{burnout.factors.fatigueLevel}/10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Soreness level</span>
                <span className="text-muted-foreground">{burnout.factors.sorenessLevel}/10</span>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          {deloadRec.shouldDeload && (
            <Card className="p-5 sm:p-6 border-border/50 shadow-card bg-gradient-to-br from-highlight/20 to-card border-highlight/30">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-display text-base mb-1">Deload Week Recommended</h3>
                  <p className="text-sm text-muted-foreground mb-3">{deloadRec.reason}</p>
                  <div className="bg-card/50 rounded-lg p-3 text-xs">
                    <p><strong>Plan:</strong> Reduce intensity to {deloadRec.reducedIntensity}% for {deloadRec.suggestedDuration} days</p>
                    <p className="mt-2">• Focus on technique & form, not weight</p>
                    <p>• Increase stretching & mobility work</p>
                    <p>• Prioritize 8+ hours sleep nightly</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Overtraining Tab */}
        <TabsContent value="overtraining" className="space-y-4">
          <Card className="p-5 sm:p-6 border-border/50 shadow-card">
            <h3 className="font-display text-base mb-4">Training Volume Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weekly Volume</p>
                <p className="text-2xl font-bold">{overtraining.weeklyVolumeMins}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Intensity</p>
                <p className="text-2xl font-bold">{overtraining.avgIntensity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">out of 3.0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recovery Score</p>
                <p className="text-2xl font-bold text-primary">{Math.round(overtraining.recoveryScore)}</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/40 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {overtraining.weeklyVolumeMins > 300 && <li>• Reduce volume by 20-30%</li>}
                {overtraining.avgIntensity > 2.2 && <li>• Include more moderate-intensity sessions</li>}
                {Math.round(overtraining.recoveryScore) < 60 && <li>• Prioritize sleep and rest days</li>}
                {overtraining.overtrainingRisk === "low" && <li>• Continue your current training approach</li>}
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-4">
          {imbalances.length > 0 ? (
            <Card className="p-5 sm:p-6 border-border/50 shadow-card">
              <h3 className="font-display text-base mb-4">Muscle Group Imbalances</h3>
              <div className="space-y-4">
                {imbalances.map((imb, idx) => (
                  <div key={idx} className="pb-4 border-b border-border/50 last:pb-0 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{imb.primary.name} vs {imb.secondary.name}</span>
                      <span className="text-sm font-bold text-accent">{imb.imbalanceScore}% gap</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.min(100, imb.imbalanceScore)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{imb.recommendation}</p>
                  </div>
                ))}
              </div>

              {preventativeExercises.length > 0 && (
                <div className="mt-6 p-4 bg-muted/40 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Corrective Exercises
                  </h4>
                  <div className="space-y-2">
                    {preventativeExercises.map((ex, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-5 sm:p-6 border-border/50 shadow-card bg-gradient-to-br from-primary-soft/30 to-card">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">No muscle imbalances detected. Great balance!</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Recovery Tab */}
        <TabsContent value="recovery" className="space-y-4">
          <Card className="p-5 sm:p-6 border-border/50 shadow-card">
            <h3 className="font-display text-base mb-4">Recovery Metrics (14-day average)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Fatigue Level</span>
                  <span className="text-sm font-bold">{burnout.factors.fatigueLevel}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${burnout.factors.fatigueLevel > 7 ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${(burnout.factors.fatigueLevel / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Sleep Deficit</span>
                  <span className="text-sm font-bold">{burnout.factors.sleepDeficit}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${burnout.factors.sleepDeficit > 3 ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${(burnout.factors.sleepDeficit / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Soreness Level</span>
                  <span className="text-sm font-bold">{burnout.factors.sorenessLevel}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${burnout.factors.sorenessLevel > 6 ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${(burnout.factors.sorenessLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/40 rounded-lg">
              <p className="text-sm font-medium mb-2">Recovery Recommendations:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {burnout.factors.sleepDeficit > 3 && <li>• Aim for 8+ hours sleep nightly</li>}
                {burnout.factors.fatigueLevel > 6 && <li>• Add an extra rest day this week</li>}
                {burnout.factors.sorenessLevel > 5 && <li>• Increase foam rolling & stretching</li>}
                {burnout.score < 40 && <li>• Continue current recovery practices</li>}
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
