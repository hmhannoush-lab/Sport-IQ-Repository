import { useMemo, useState } from "react";
import { useStore, todayKey, lowerIsBetter, type PersonalRecord, type RecordUnit } from "@/lib/store";
import { EXERCISES } from "@/lib/exercises";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Medal, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useUnits, kgTo, kgFrom, kmTo, kmFrom, type Units } from "@/lib/units";

const UNITS: { value: RecordUnit; label: string }[] = [
  { value: "kg", label: "weight" },
  { value: "reps", label: "reps" },
  { value: "km", label: "distance" },
  { value: "min", label: "min (time)" },
  { value: "s", label: "sec (time)" },
];

/** Records are stored in kg/km; these show them in the user's units. */
const unitName = (unit: RecordUnit, u: Units) =>
  unit === "kg" ? (u === "imperial" ? "lb" : "kg") : unit === "km" ? (u === "imperial" ? "mi" : "km") : unit;
const toShown = (v: number, unit: RecordUnit, u: Units) => (unit === "kg" ? kgTo(v, u) : unit === "km" ? kmTo(v, u) : v);
const fromShown = (v: number, unit: RecordUnit, u: Units) => (unit === "kg" ? kgFrom(v, u) : unit === "km" ? kmFrom(v, u) : v);

interface Group {
  key: string;
  exercise: string;
  unit: RecordUnit;
  best: PersonalRecord;
  first: PersonalRecord;
  entries: PersonalRecord[];
}

const fmt = (v: number) => (Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1));

export const PersonalRecords = () => {
  const { store, addRecord, deleteRecord } = useStore();
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<RecordUnit>("kg");
  const [date, setDate] = useState(todayKey());
  const { units } = useUnits();
  const show = (v: number, u: RecordUnit) => `${fmt(toShown(v, u, units))} ${unitName(u, units)}`;

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, PersonalRecord[]>();
    for (const r of store.records) {
      const key = `${r.exercise.toLowerCase()}|${r.unit}`;
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return Array.from(map.entries()).map(([key, entries]) => {
      const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
      const better = lowerIsBetter(entries[0].unit)
        ? (a: PersonalRecord, b: PersonalRecord) => (b.value < a.value ? b : a)
        : (a: PersonalRecord, b: PersonalRecord) => (b.value > a.value ? b : a);
      return {
        key,
        exercise: sorted[sorted.length - 1].exercise,
        unit: entries[0].unit,
        best: sorted.reduce(better),
        first: sorted[0],
        entries: sorted.reverse(),
      };
    }).sort((a, b) => b.best.date.localeCompare(a.best.date));
  }, [store.records]);

  const submit = () => {
    const name = exercise.trim();
    const n = fromShown(parseFloat(value), unit, units);
    if (!name || Number.isNaN(n) || n <= 0) {
      toast.error("Add an exercise and a value above 0.");
      return;
    }
    const prev = groups.find((g) => g.key === `${name.toLowerCase()}|${unit}`);
    const isPR = !prev || (lowerIsBetter(unit) ? n < prev.best.value : n > prev.best.value);
    addRecord({ exercise: name, value: n, unit, date });
    toast.success(isPR ? `New personal record — ${name}! 🏅` : "Result saved", {
      description: isPR && prev ? `Previous best: ${show(prev.best.value, unit)}` : undefined,
    });
    setValue("");
  };

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <Medal className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xl">Personal records</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Log your best lifts, times and reps. Times count as better when they go down.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 items-end">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs">Exercise</Label>
          <Input
            list="pr-exercises"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="e.g. Back squat, 5 km run"
          />
          <datalist id="pr-exercises">
            {EXERCISES.map((e) => <option key={e.id} value={e.name} />)}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Result</Label>
          <Input type="number" inputMode="decimal" min={0} step="0.1" value={value} onChange={(e) => setValue(e.target.value)} placeholder="100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Unit</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as RecordUnit)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.value === "kg" || u.value === "km" ? `${unitName(u.value, units)} (${u.label})` : u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
        Save result
      </Button>

      {groups.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {groups.map((g) => {
            const change = g.best.value - g.first.value;
            const improved = g.entries.length > 1 && (lowerIsBetter(g.unit) ? change < 0 : change > 0);
            return (
              <div key={g.key} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base truncate">{g.exercise}</p>
                    <p className="font-display text-2xl tabular-nums">
                      {fmt(toShown(g.best.value, g.unit, units))} <span className="text-sm text-muted-foreground font-sans">{unitName(g.unit, units)}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Best on {g.best.date}</p>
                  </div>
                  {improved && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary shrink-0">
                      <TrendingUp className="h-3 w-3" />
                      {change > 0 ? "+" : ""}{show(change, g.unit)}
                    </span>
                  )}
                </div>
                <ul className="mt-3 space-y-1 max-h-28 overflow-y-auto pr-1">
                  {g.entries.map((r) => (
                    <li key={r.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.date} · <span className="text-foreground/90 tabular-nums">{show(r.value, r.unit)}</span></span>
                      <button
                        type="button"
                        onClick={() => deleteRecord(r.id)}
                        className="p-1 rounded hover:text-destructive"
                        aria-label={`Delete ${r.exercise} result from ${r.date}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
