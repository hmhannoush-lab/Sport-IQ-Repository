import { useState } from "react";
import { todayKey, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PersonalAdvice } from "./PersonalAdvice";
import { RecoveryProtocol } from "./RecoveryProtocol";

const SORE_AREAS = ["Neck", "Shoulders", "Back", "Chest", "Arms", "Core", "Hips", "Quads", "Hamstrings", "Calves", "Knees", "Ankles"];

export const Fatigue = () => {
  const { store, addFatigue } = useStore();
  const [fatigueLevel, setFatigueLevel] = useState(4);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [soreness, setSoreness] = useState<string[]>([]);
  const [injuries, setInjuries] = useState("");

  const toggle = (a: string) => setSoreness((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));

  const submit = () => {
    addFatigue({ date: todayKey(), fatigueLevel, sleepQuality, soreness, injuries });
    setSoreness([]);
    setInjuries("");
  };

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Recovery</p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight">Listen to your <span className="text-gradient-sage italic">body</span></h2>
      </div>

      <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
        <h3 className="font-display text-xl mb-5">How are you feeling?</h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Fatigue level</Label>
              <span className="text-sm text-muted-foreground">{fatigueLevel} / 10</span>
            </div>
            <Slider value={[fatigueLevel]} onValueChange={([v]) => setFatigueLevel(v)} min={1} max={10} step={1} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Sleep quality last night</Label>
              <span className="text-sm text-muted-foreground">{sleepQuality} / 5</span>
            </div>
            <Slider value={[sleepQuality]} onValueChange={([v]) => setSleepQuality(v)} min={1} max={5} step={1} />
          </div>

          <div>
            <Label className="mb-2 block">Sore areas</Label>
            <div className="flex flex-wrap gap-2">
              {SORE_AREAS.map((a) => {
                const on = soreness.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggle(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-zen border ${
                      on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="injuries" className="mb-2 block">Injuries or pain (optional)</Label>
            <Input id="injuries" placeholder="e.g. tight left hamstring after run" value={injuries} onChange={(e) => setInjuries(e.target.value)} />
          </div>

          <Button onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto rounded-full px-6">
            Get personalized advice
          </Button>
        </div>
      </Card>

      <PersonalAdvice />

      <RecoveryProtocol />

      {store.fatigue.length > 1 && (
        <Card className="p-5 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
          <h3 className="font-display text-xl mb-3">Recent check-ins</h3>
          <div className="space-y-2">
            {store.fatigue.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
                <span className="text-muted-foreground">{f.date}</span>
                <span>Fatigue {f.fatigueLevel}/10 · Sleep {f.sleepQuality}/5</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{f.soreness.length} sore area{f.soreness.length === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
