import { useState } from "react";
import { EXERCISES, CATEGORIES, Exercise, ExerciseCategory } from "@/lib/exercises";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayCircle, Video, Target, Zap, AlertTriangle, CheckCircle2, Wind, Timer, Sparkles, Wrench, BookOpen, Dumbbell, Trophy, ExternalLink } from "lucide-react";
import { TRAINING_SOURCES } from "@/lib/evidence";
import { ExerciseTimer } from "./ExerciseTimer";
import { MuscleMap } from "./MuscleMap";

const levelChip: Record<string, string> = {
  Beginner: "bg-primary-soft text-primary",
  Intermediate: "bg-highlight/40 text-foreground",
  Advanced: "bg-accent/20 text-accent",
};

export const ExerciseLibrary = () => {
  const [filter, setFilter] = useState<ExerciseCategory | "All">("All");

  const filtered = filter === "All" ? EXERCISES : EXERCISES.filter((e) => e.category === filter);

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <Video className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xl">Exercise library</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tap any exercise to watch the form demo and read the coaching cues.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["All", ...CATEGORIES] as const).map((c) => {
          const on = filter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c as ExerciseCategory | "All")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-zen border ${
                on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </Card>
  );
};

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group text-left rounded-2xl border border-border/50 bg-background/50 overflow-hidden hover:border-primary/40 hover:shadow-lift transition-zen"
        >
          <div className="relative aspect-square bg-muted/40 overflow-hidden">
            <video
              src={exercise.videoUrl}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-zen flex items-end p-3">
              <div className="flex items-center gap-1.5 text-primary-foreground text-xs font-medium">
                <PlayCircle className="h-4 w-4" />
                View details
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${levelChip[exercise.level]}`}>
                {exercise.level}
              </span>
            </div>
          </div>
          <div className="p-3">
            <p className="font-display text-base leading-snug">{exercise.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{exercise.category} · {exercise.defaultSets}</p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{exercise.category}</Badge>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${levelChip[exercise.level]}`}>
              {exercise.level}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl text-left">{exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl overflow-hidden bg-muted/40 mb-2">
          <video
            src={exercise.videoUrl}
            className="w-full h-auto"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">
          Video won't play?{" "}
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " proper form tutorial")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Watch a demo on YouTube ↗
          </a>
        </p>

        <p className="text-foreground/90 italic mb-5">{exercise.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {exercise.muscleDetail && (
            <section className="rounded-2xl bg-accent-soft/40 border border-accent/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-accent" />
                <h4 className="font-display text-base">Muscles worked</h4>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">{exercise.muscleDetail}</p>
              <MuscleMap muscles={exercise.muscles} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {exercise.muscles.map((m) => (
                  <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                ))}
              </div>
            </section>
          )}

          {exercise.benefits && exercise.benefits.length > 0 && (
            <section className="rounded-2xl bg-primary-soft/40 border border-primary/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="font-display text-base">Benefits</h4>
              </div>
              <ul className="space-y-1.5">
                {exercise.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {exercise.walkthrough && (
          <section className="mb-5 rounded-2xl bg-primary-soft/40 border border-primary/15 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-display text-base">How one rep looks</h4>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{exercise.walkthrough}</p>
          </section>
        )}

        <div className="mb-5">
          <ExerciseTimer timing={exercise.timing} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat icon={Target} label="Muscles" value={exercise.muscles.slice(0, 2).join(", ")} />
          <Stat icon={Zap} label="Sets × reps" value={exercise.defaultSets} />
          <Stat label="Equipment" value={exercise.equipment} />
        </div>

        {(exercise.breathing || exercise.tempo) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {exercise.breathing && (
              <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wind className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Breathing</span>
                </div>
                <p className="text-sm leading-snug">{exercise.breathing}</p>
              </div>
            )}
            {exercise.tempo && (
              <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tempo</span>
                </div>
                <p className="text-sm leading-snug">{exercise.tempo}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-5">
          <section>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h4 className="font-display text-base">Form cues</h4>
            </div>
            <ul className="space-y-1.5">
              {exercise.cues.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          {exercise.feels && exercise.feels.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-display text-base">What it should feel like</h4>
              </div>
              <ul className="space-y-1.5">
                {exercise.feels.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <h4 className="font-display text-base">Common mistakes</h4>
            </div>
            <ul className="space-y-1.5">
              {exercise.mistakes.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>

          {exercise.fixes && exercise.fixes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-primary" />
                <h4 className="font-display text-base">How to fix it</h4>
              </div>
              <ul className="space-y-1.5">
                {exercise.fixes.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-display text-base">Evidence base</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Sets, progression and injury-prevention guidance follow sports-medicine and strength &
              conditioning consensus statements.
            </p>
            <ul className="space-y-2.5">
              {TRAINING_SOURCES.map((s) => (
                <li key={s.url} className="text-xs leading-relaxed">
                  <p className="text-muted-foreground">{s.citation}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline mt-0.5"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

      </DialogContent>
    </Dialog>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon?: typeof Target; label: string; value: string }) => (
  <div className="rounded-2xl bg-muted/30 border border-border/40 p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <p className="text-sm font-medium leading-tight">{value}</p>
  </div>
);
