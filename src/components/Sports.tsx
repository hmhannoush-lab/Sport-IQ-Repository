import { useMemo, useState } from "react";
import { useStore, SportPractice } from "@/lib/store";
import { SPORTS, getSportById, SportInfo } from "@/lib/sports";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Plus, X, Dumbbell, Apple, Moon, StretchHorizontal, AlertTriangle, Flame } from "lucide-react";

const LEVELS: { value: SportPractice["level"]; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "competitive", label: "Competitive" },
];

const categoryColor: Record<SportInfo["category"], string> = {
  endurance: "bg-primary/15 text-primary",
  strength: "bg-accent/20 text-accent",
  team: "bg-highlight/40 text-foreground",
  racket: "bg-primary/10 text-primary",
  combat: "bg-accent/15 text-accent",
  "mind-body": "bg-primary-soft text-primary",
  outdoor: "bg-highlight/30 text-foreground",
  water: "bg-primary/15 text-primary",
};

export const Sports = () => {
  const { store, addSport, removeSport } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [level, setLevel] = useState<SportPractice["level"]>("intermediate");
  const [sessions, setSessions] = useState<number>(3);
  const [notes, setNotes] = useState("");

  const myPractices = store.sports;
  const mySports = useMemo(
    () => myPractices.map((p) => ({ practice: p, info: getSportById(p.sportId) })),
    [myPractices]
  );

  const availableSports = useMemo(
    () => SPORTS.filter((s) => !myPractices.find((p) => p.sportId === s.id)),
    [myPractices]
  );

  const submit = () => {
    if (!selectedSportId) return;
    addSport({ sportId: selectedSportId, level, sessionsPerWeek: sessions, notes: notes.trim() || undefined });
    setSelectedSportId("");
    setLevel("intermediate");
    setSessions(3);
    setNotes("");
    setPickerOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <Card className="p-6 sm:p-8 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Your sports</p>
              <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Tell us how you train</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Pick the sports you practice and get tailored training, nutrition, recovery and mobility advice for each one.
              </p>
            </div>
          </div>
          <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage text-primary-foreground hover:opacity-90 shadow-glow rounded-full">
                <Plus className="h-4 w-4 mr-1" /> Add sport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add a sport</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sport</Label>
                  <Select value={selectedSportId} onValueChange={setSelectedSportId}>
                    <SelectTrigger><SelectValue placeholder="Pick a sport" /></SelectTrigger>
                    <SelectContent>
                      {availableSports.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="mr-2">{s.emoji}</span>{s.name}
                        </SelectItem>
                      ))}
                      {availableSports.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">All sports added</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={level} onValueChange={(v) => setLevel(v as SportPractice["level"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sessions / week</Label>
                    <Input type="number" min={1} max={14} value={sessions} onChange={(e) => setSessions(+e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. training for marathon in May" />
                </div>
                <Button onClick={submit} disabled={!selectedSportId} className="w-full bg-sage text-primary-foreground hover:opacity-90">
                  Save sport
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* My sports + advice */}
      {mySports.length === 0 ? (
        <Card className="p-10 border-dashed border-2 border-border/60 rounded-3xl text-center bg-card/40">
          <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display text-lg mb-1">No sports yet</h3>
          <p className="text-sm text-muted-foreground">Add a sport to unlock personalized advice for your training.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {mySports.map(({ practice, info }) => (
            info
              ? <SportAdviceCard key={practice.sportId} practice={practice} info={info} onRemove={() => removeSport(practice.sportId)} />
              : <CustomSportCard key={practice.sportId} practice={practice} onRemove={() => removeSport(practice.sportId)} />
          ))}
        </div>
      )}

      {/* Browse all */}
      {availableSports.length > 0 && (
        <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/60 backdrop-blur-sm">
          <h3 className="font-display text-lg mb-4">Browse more sports</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSports.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSportId(s.id); setPickerOpen(true); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-border/50 bg-background/40 hover:bg-muted/40 transition-zen text-left"
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="text-sm font-medium truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const CustomSportCard = ({ practice, onRemove }: { practice: SportPractice; onRemove: () => void }) => (
  <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center text-3xl shrink-0">
          🏅
        </div>
        <div>
          <h3 className="font-display text-2xl tracking-tight">{practice.customName ?? practice.sportId}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Custom</Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{practice.level}</Badge>
            <Badge variant="outline" className="text-[10px]">
              <Flame className="h-3 w-3 mr-1" />{practice.sessionsPerWeek}×/week
            </Badge>
          </div>
          {practice.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{practice.notes}"</p>}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground hover:text-accent rounded-full">
        <X className="h-4 w-4" />
      </Button>
    </div>
    <p className="text-sm text-muted-foreground">
      Custom sport added. Ask the AI Coach for tailored training, nutrition and recovery advice for this sport.
    </p>
  </Card>
);

const SportAdviceCard = ({
  practice,
  info,
  onRemove,
}: {
  practice: SportPractice;
  info: SportInfo;
  onRemove: () => void;
}) => {
  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center text-3xl shrink-0">
            {info.emoji}
          </div>
          <div>
            <h3 className="font-display text-2xl tracking-tight">{info.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge className={`${categoryColor[info.category]} border-0 text-[10px] uppercase tracking-wider`}>
                {info.category}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{practice.level}</Badge>
              <Badge variant="outline" className="text-[10px]">
                <Flame className="h-3 w-3 mr-1" />{practice.sessionsPerWeek}×/week
              </Badge>
            </div>
            {practice.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{practice.notes}"</p>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground hover:text-accent rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Demands */}
      <div className="mb-5 p-4 rounded-2xl bg-muted/30 border border-border/40">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Key demands</p>
        <div className="flex flex-wrap gap-1.5">
          {info.demands.map((d) => (
            <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/50">{d}</span>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <AdviceBlock icon={Dumbbell} title="Training" items={info.training} />
        <AdviceBlock icon={Apple} title="Nutrition" items={info.nutrition} />
        <AdviceBlock icon={Moon} title="Recovery" items={info.recovery} />
        <AdviceBlock icon={StretchHorizontal} title="Mobility focus" items={info.mobility} compact />
      </div>

      {/* Injury risks */}
      <div className="mt-5 p-4 rounded-2xl border border-accent/30 bg-accent-soft">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">Watch out for</p>
        </div>
        <p className="text-sm text-foreground/90">{info.injuryRisks.join(" · ")}</p>
      </div>
    </Card>
  );
};

const AdviceBlock = ({
  icon: Icon,
  title,
  items,
  compact = false,
}: {
  icon: typeof Dumbbell;
  title: string;
  items: string[];
  compact?: boolean;
}) => (
  <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="font-display text-base">{title}</h4>
    </div>
    {compact ? (
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="text-xs px-2.5 py-1 rounded-full bg-muted/40 border border-border/40">{it}</span>
        ))}
      </div>
    ) : (
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
