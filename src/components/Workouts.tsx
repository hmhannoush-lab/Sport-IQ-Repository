import { useState } from "react";
import { todayKey, useStore, Workout } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Trash2, Flame } from "lucide-react";
import { ExerciseLibrary } from "./ExerciseLibrary";

const TYPES = ["Run", "Walk", "Cycle", "Swim", "Strength", "Yoga", "HIIT", "Pilates", "Sports", "Other"];

export const Workouts = () => {
  const { store, addWorkout, deleteWorkout } = useStore();
  const [type, setType] = useState("Run");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<Workout["intensity"]>("medium");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(todayKey());

  const submit = () => {
    addWorkout({ date, type, durationMin: duration, intensity, notes });
    setNotes("");
  };

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

      <ExerciseLibrary />

      <Card className="p-5 sm:p-6 border-border/50 shadow-card">
        <h3 className="font-display text-xl mb-4 flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" /> Log a session
        </h3>
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
        <div className="mt-3">
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button onClick={submit} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">Add session</Button>
      </Card>

      <div className="space-y-2">
        {store.workouts.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-border/60 shadow-none bg-transparent">
            <Dumbbell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No workouts yet — log your first session above.</p>
          </Card>
        ) : (
          store.workouts.map((w) => (
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
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
