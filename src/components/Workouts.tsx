import { useState } from "react";
import { todayKey, useStore, Workout, WorkoutSet, WorkoutTemplate } from "@/lib/store";
import { EXERCISES } from "@/lib/exercises";
import { useUnits, kgFrom } from "@/lib/units";
import { bestOneRepMaxes, formatSets, totalVolumeKg } from "@/lib/workoutSets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Trash2, Flame, Plus, Copy, X, Repeat, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { ExerciseLibrary } from "./ExerciseLibrary";
import { TrainingLoad } from "./TrainingLoad";
import { PersonalRecords } from "./PersonalRecords";

const TYPES = ["Run", "Walk", "Cycle", "Swim", "Strength", "Yoga", "HIIT", "Pilates", "Sports", "Other"];

export const Workouts = () => {
  const { store, addWorkout, deleteWorkout, addTemplate, deleteTemplate } = useStore();
  const { units, labels, weight } = useUnits();
  const [type, setType] = useState("Run");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<Workout["intensity"]>("medium");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(todayKey());
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [setExercise, setSetExercise] = useState("");
  const [setReps, setSetReps] = useState("");
  const [setWeight, setSetWeight] = useState("");
  const [templateName, setTemplateName] = useState("");

  const addSet = () => {
    const exercise = setExercise.trim();
    const reps = parseInt(setReps, 10);
    const w = parseFloat(setWeight);
    if (!exercise || !(reps > 0)) {
      toast.error("Add an exercise and at least 1 rep.");
      return;
    }
    setSets([...sets, { exercise, reps, weightKg: w > 0 ? kgFrom(w, units) : undefined }]);
  };

  /** Loads a template or past session into the form so it can be tweaked before saving. */
  const load = (src: Pick<WorkoutTemplate, "type" | "durationMin" | "intensity" | "sets">, label: string) => {
    setType(src.type);
    setDuration(src.durationMin);
    setIntensity(src.intensity);
    setSets(src.sets ?? []);
    setDate(todayKey());
    toast.success(`Loaded "${label}"`, { description: "Adjust anything, then press Add session." });
  };

  const submit = () => {
    addWorkout({ date, type, durationMin: duration, intensity, notes, sets: sets.length ? sets : undefined });
    setNotes("");
    setSets([]);
  };

  const saveTemplate = () => {
    const name = templateName.trim();
    if (!name) {
      toast.error("Give the template a name first.");
      return;
    }
    addTemplate({ name, type, durationMin: duration, intensity, sets: sets.length ? sets : undefined });
    setTemplateName("");
    toast.success(`Template "${name}" saved`);
  };

  const lastWorkout = store.workouts[0];

  const totalThisWeek = store.workouts
    .filter((w) => Date.now() - new Date(w.date).getTime() < 1000 * 60 * 60 * 24 * 7)
    .reduce((sum, w) => sum + w.durationMin, 0);

  const intensityClass = {
    low: "bg-primary-soft text-primary",
    medium: "bg-highlight/40 text-foreground",
    high: "bg-accent/20 text-accent",
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Movement</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">Workout <span className="text-gradient-sage italic">log</span></h2>
        </div>
        <Card className="px-5 py-3 border-border/40 shadow-card flex items-center gap-3 bg-gradient-to-br from-accent-soft to-card rounded-2xl">
          <div className="h-9 w-9 rounded-xl bg-accent/20 flex items-center justify-center">
            <Flame className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">This week</p>
            <p className="font-display text-xl">{totalThisWeek} <span className="text-sm text-muted-foreground font-sans">min</span></p>
          </div>
        </Card>
      </div>

      <TrainingLoad />

      <ExerciseLibrary />

      <Card className="p-5 sm:p-6 border-border/50 shadow-card">
        <h3 className="font-display text-xl mb-4 flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" /> Log a session
        </h3>

        {(lastWorkout || store.templates.length > 0) && (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Quick start</p>
            <div className="flex flex-wrap gap-2">
              {lastWorkout && (
                <Button variant="outline" size="sm" className="rounded-full h-8" onClick={() => load(lastWorkout, "last session")}>
                  <Repeat className="h-3.5 w-3.5 mr-1.5" /> Repeat last ({lastWorkout.type})
                </Button>
              )}
              {store.templates.map((t) => (
                <span key={t.id} className="inline-flex items-center rounded-full border border-border bg-background">
                  <button type="button" className="pl-3 pr-1.5 h-8 text-xs inline-flex items-center gap-1.5 hover:text-primary" onClick={() => load(t, t.name)}>
                    <Bookmark className="h-3 w-3" /> {t.name}
                  </button>
                  <button
                    type="button"
                    className="pr-2.5 pl-1 h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteTemplate(t.id)}
                    aria-label={`Delete template ${t.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Duration (min)</Label>
            <Input type="number" min={5} value={duration} onChange={(e) => setDuration(+e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Intensity</Label>
            <Select value={intensity} onValueChange={(v) => setIntensity(v as Workout["intensity"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border/50 bg-muted/20 p-3 sm:p-4">
          <p className="text-xs font-medium mb-2">
            Sets <span className="text-muted-foreground font-normal">(optional — for strength work)</span>
          </p>
          <div className="grid grid-cols-[1fr_4.5rem_5.5rem] sm:grid-cols-[1fr_5rem_6rem_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Exercise</Label>
              <Input list="set-exercises" value={setExercise} onChange={(e) => setSetExercise(e.target.value)} placeholder="e.g. Back squat" />
              <datalist id="set-exercises">
                {EXERCISES.map((e) => <option key={e.id} value={e.name} />)}
              </datalist>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Reps</Label>
              <Input type="number" inputMode="numeric" min={1} value={setReps} onChange={(e) => setSetReps(e.target.value)} placeholder="8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Weight ({labels.weight})</Label>
              <Input type="number" inputMode="decimal" min={0} step="0.5" value={setWeight} onChange={(e) => setSetWeight(e.target.value)} placeholder="Body" />
            </div>
            <Button variant="outline" onClick={addSet} className="col-span-3 sm:col-span-1">
              <Plus className="h-4 w-4 mr-1" /> Add set
            </Button>
          </div>
          {sets.length > 0 && (
            <ul className="mt-3 space-y-1">
              {sets.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground tabular-nums w-5">{i + 1}.</span>
                  <span className="flex-1 min-w-0 truncate">
                    {s.exercise} — {s.reps} reps{s.weightKg ? ` @ ${weight(s.weightKg)}` : ""}
                  </span>
                  <button type="button" className="p-1 text-muted-foreground hover:text-primary" onClick={() => setSets([...sets.slice(0, i + 1), s, ...sets.slice(i + 1)])} aria-label="Duplicate set">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="p-1 text-muted-foreground hover:text-destructive" onClick={() => setSets(sets.filter((_, j) => j !== i))} aria-label="Remove set">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              <li className="text-xs text-muted-foreground pt-1">
                Total volume: {weight(totalVolumeKg(sets), 0)}
              </li>
            </ul>
          )}
        </div>

        <div className="mt-3">
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90">Add session</Button>
          <div className="flex items-center gap-2 ml-auto">
            <Input className="h-9 w-40" placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            <Button variant="outline" size="sm" className="h-9" onClick={saveTemplate}>
              <Bookmark className="h-3.5 w-3.5 mr-1.5" /> Save as template
            </Button>
          </div>
        </div>
      </Card>

      <PersonalRecords />

      <div className="space-y-2">
        {store.workouts.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-border/60 shadow-none bg-transparent">
            <Dumbbell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No workouts yet — log your first session above.</p>
          </Card>
        ) : (
          store.workouts.map((w) => {
            const e1rms = Object.entries(bestOneRepMaxes(w.sets ?? []));
            return (
              <Card key={w.id} className="p-4 border-border/50 shadow-card flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{w.type}</p>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${intensityClass[w.intensity]}`}>{w.intensity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.date} · {w.durationMin} min{w.notes ? ` · ${w.notes}` : ""}</p>
                  {w.sets?.length ? (
                    <>
                      <p className="text-xs text-foreground/80 mt-1">{formatSets(w.sets, units)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Volume {weight(totalVolumeKg(w.sets), 0)}
                        {e1rms.length > 0 && ` · Est. 1RM ${e1rms.map(([ex, kg]) => `${ex} ${weight(kg, 0)}`).join(", ")}`}
                      </p>
                    </>
                  ) : null}
                </div>
                <Button variant="ghost" size="icon" onClick={() => load(w, `${w.type} on ${w.date}`)} className="text-muted-foreground hover:text-primary" aria-label="Repeat this session">
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete session">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
