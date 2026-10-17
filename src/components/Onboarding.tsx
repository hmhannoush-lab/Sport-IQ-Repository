import { useMemo, useState } from "react";
import { Profile, SportPractice, HealthBaseline, Preferences, useStore, defaultPreferences } from "@/lib/store";
import { compressImage } from "@/lib/image";
import { cmToFtIn, ftInToCm, displayWater, displayWeight, kgFrom, mlFrom } from "@/lib/units";
import { ALLERGENS } from "@/lib/allergies";
import { SPORTS } from "@/lib/sports";
import { AVATAR_OPTIONS } from "@/lib/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowLeft, ArrowRight, Check, Search, X } from "lucide-react";
import { VitalLogo } from "@/components/VitalLogo";
import heroImg from "@/assets/hero-wellness.jpg";

type StepId = "profile" | "sports" | "health" | "prefs";
const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: "profile", title: "About you", subtitle: "A few details to personalize your plan." },
  { id: "sports", title: "Sports & training", subtitle: "Pick what you practice — we'll tailor advice." },
  { id: "health", title: "Health baseline", subtitle: "Your starting point for recovery insights." },
  { id: "prefs", title: "Preferences", subtitle: "Final touches — how you want to use Sport IQ." },
];

export const Onboarding = ({ onClose }: { onClose?: () => void } = {}) => {
  const { store, completeOnboarding } = useStore();
  const [stepIdx, setStepIdx] = useState(0);

  const [profile, setProfile] = useState<Profile>(store.profile ?? {
    name: "", age: 30, sex: "female", heightCm: 170, weightKg: 68,
    lifestyle: "moderate", diet: "omnivore", goal: "maintain",
  });
  const [sports, setSports] = useState<SportPractice[]>(store.sports ?? []);
  const [sportQuery, setSportQuery] = useState("");
  const [health, setHealth] = useState<HealthBaseline>(store.healthBaseline ?? {
    avgSleepHours: 7, restingHr: 65, injuries: "", fatigueLevel: 4, stressLevel: 4,
    dailyWaterMl: 2000, currentPain: "", moldExposure: "none", medicalConditions: "", allergies: [], allergyNotes: "",
  });
  const [prefs, setPrefs] = useState<Preferences>(store.preferences ?? defaultPreferences);
  const units = prefs.units;
  const imperial = units === "imperial";
  const { ft, inch } = cmToFtIn(profile.heightCm);

  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;
  const [customSport, setCustomSport] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    Boolean(store.profile?.medicalDisclaimerAcceptedAt),
  );

  // Curated shortlist of the ~10 most-picked sports, shown by default so users
  // don't scroll a huge grid. They can search for others or add a custom one.
  const filteredSports = useMemo(() => {
    const q = sportQuery.trim().toLowerCase();
    if (!q) {
      const popularIds = [
        "running", "cycling", "swimming", "soccer", "basketball",
        "tennis", "yoga", "weightlifting", "crossfit", "boxing",
      ];
      return popularIds
        .map((id) => SPORTS.find((s) => s.id === id))
        .filter((s): s is typeof SPORTS[number] => Boolean(s));
    }
    return SPORTS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [sportQuery]);

  const toggleSport = (id: string) => {
    setSports((cur) =>
      cur.some((s) => s.sportId === id)
        ? cur.filter((s) => s.sportId !== id)
        : [...cur, { sportId: id, level: "intermediate", sessionsPerWeek: 3 }],
    );
  };
  const updateSport = (id: string, patch: Partial<SportPractice>) => {
    setSports((cur) => cur.map((s) => (s.sportId === id ? { ...s, ...patch } : s)));
  };

  const canNext = () => {
    if (step.id === "profile") return profile.name.trim().length > 0;
    if (step.id === "prefs") return disclaimerAccepted;
    return true;
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else {
      const nowIso = new Date().toISOString();
      completeOnboarding({
        profile: {
          ...profile,
          medicalDisclaimerAcceptedAt: profile.medicalDisclaimerAcceptedAt ?? nowIso,
        },
        sports,
        healthBaseline: health,
        preferences: prefs,
      });
      onClose?.();
    }
  };
  const back = () => stepIdx > 0 && setStepIdx(stepIdx - 1);

  return (
    <div className="min-h-screen bg-zen flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <Card className="relative w-full max-w-2xl p-6 sm:p-10 shadow-glow border-border/60 bg-card/95 backdrop-blur-sm animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <VitalLogo className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sport IQ · Step {stepIdx + 1} of {STEPS.length}</p>
            <h1 className="font-display text-2xl text-foreground">{step.title}</h1>
          </div>
        </div>

        <Progress value={progress} className="mb-2 h-1.5" />
        <p className="text-sm text-muted-foreground mb-8">{step.subtitle}</p>

        <div className="space-y-5 min-h-[320px]">
          {step.id === "profile" && (
            <>
              <div className="space-y-2">
                <Label>Profile picture</Label>
                <p className="text-xs text-muted-foreground">Upload a photo or pick an emoji avatar below.</p>
                <div className="flex items-center gap-4 pt-1">
                  <div
                    className="relative h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-border/60 flex items-center justify-center bg-muted/40"
                  >
                    {profile.avatarImage ? (
                      <img src={profile.avatarImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">{profile.avatar ?? "🌿"}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-muted/40 cursor-pointer transition-zen">
                      {profile.avatarImage ? "Replace photo" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // Shrunk to a small JPEG so even large phone photos fit in local storage.
                          compressImage(file)
                            .then((avatarImage) => setProfile((p) => ({ ...p, avatarImage })))
                            .catch(() => alert("Couldn't read that image. Try a JPG or PNG."));
                        }}
                      />
                    </label>
                    {profile.avatarImage && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarImage: undefined })}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-left"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Choose an avatar</Label>
                <p className="text-xs text-muted-foreground">Pick a symbol that feels like you.</p>
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {AVATAR_OPTIONS.map((a) => {
                    const selected = (profile.avatar ?? "🌿") === a.emoji;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatar: a.emoji })}
                        title={a.label}
                        className={`relative aspect-square rounded-2xl flex items-center justify-center transition-zen overflow-hidden ${
                          selected
                            ? "ring-2 ring-offset-2 ring-offset-background shadow-glow scale-105"
                            : "ring-1 ring-border/60 hover:scale-105 hover:ring-2"
                        }`}
                        style={{
                          background: a.gradient,
                          ...(selected ? { boxShadow: `0 8px 24px -4px ${a.ring}aa`, ["--tw-ring-color" as string]: a.ring } : {}),
                        }}
                      >
                        <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10" />
                        <span className="relative text-2xl drop-shadow-sm">{a.emoji}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. Maya" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={10} max={100} value={profile.age} onChange={(e) => setProfile({ ...profile, age: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select value={profile.sex} onValueChange={(v) => setProfile({ ...profile, sex: v as Profile["sex"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Units</Label>
                <Select value={prefs.units} onValueChange={(v) => setPrefs({ ...prefs, units: v as Preferences["units"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, cm, L)</SelectItem>
                    <SelectItem value="imperial">Imperial (lb, ft/in, fl oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {imperial ? (
                  <div className="space-y-2">
                    <Label>Height (ft / in)</Label>
                    <div className="flex gap-2">
                      <Input type="number" min={3} max={7} aria-label="Feet" value={ft} onChange={(e) => setProfile({ ...profile, heightCm: ftInToCm(+e.target.value, inch) })} />
                      <Input type="number" min={0} max={11} aria-label="Inches" value={inch} onChange={(e) => setProfile({ ...profile, heightCm: ftInToCm(ft, +e.target.value) })} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" min={100} max={230} value={Math.round(profile.heightCm)} onChange={(e) => setProfile({ ...profile, heightCm: +e.target.value })} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Weight ({imperial ? "lb" : "kg"})</Label>
                  <Input type="number" min={imperial ? 66 : 30} max={imperial ? 550 : 250} value={displayWeight(profile.weightKg, units)} onChange={(e) => setProfile({ ...profile, weightKg: kgFrom(+e.target.value, units) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lifestyle</Label>
                <Select value={profile.lifestyle} onValueChange={(v) => setProfile({ ...profile, lifestyle: v as Profile["lifestyle"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary — desk job, little exercise</SelectItem>
                    <SelectItem value="light">Light — walks, occasional activity</SelectItem>
                    <SelectItem value="moderate">Moderate — exercise 3–5×/week</SelectItem>
                    <SelectItem value="active">Active — daily training</SelectItem>
                    <SelectItem value="athlete">Athlete — twice-daily / competitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Diet</Label>
                  <Select value={profile.diet} onValueChange={(v) => setProfile({ ...profile, diet: v as Profile["diet"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="omnivore">Omnivore</SelectItem>
                      <SelectItem value="pescatarian">Pescatarian</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary goal</Label>
                  <Select value={profile.goal} onValueChange={(v) => setProfile({ ...profile, goal: v as Profile["goal"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain">Gain muscle</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary goal (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  A layered goal we'll balance against your primary one — e.g. maintain weight while chasing performance.
                </p>
                <Select
                  value={profile.secondaryGoal ?? "none"}
                  onValueChange={(v) => setProfile({ ...profile, secondaryGoal: v === "none" ? undefined : (v as Profile["goal"]) })}
                >
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="lose" disabled={profile.goal === "lose"}>Lose weight</SelectItem>
                    <SelectItem value="maintain" disabled={profile.goal === "maintain"}>Maintain</SelectItem>
                    <SelectItem value="gain" disabled={profile.goal === "gain"}>Gain muscle</SelectItem>
                    <SelectItem value="performance" disabled={profile.goal === "performance"}>Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(profile.goal === "lose" || profile.goal === "gain") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target weight ({imperial ? "lb" : "kg"})</Label>
                    <Input
                      type="number" min={imperial ? 66 : 30} max={imperial ? 550 : 250} step={0.5}
                      value={profile.targetWeightKg ? displayWeight(profile.targetWeightKg, units) : ""}
                      placeholder={profile.goal === "lose" ? (imperial ? "e.g. 137" : "e.g. 62") : (imperial ? "e.g. 165" : "e.g. 75")}
                      onChange={(e) => setProfile({ ...profile, targetWeightKg: e.target.value ? kgFrom(+e.target.value, units) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe (weeks)</Label>
                    <Input
                      type="number" min={1} max={104}
                      value={profile.goalTimeframeWeeks ?? ""}
                      placeholder="e.g. 12"
                      onChange={(e) => setProfile({ ...profile, goalTimeframeWeeks: e.target.value ? +e.target.value : undefined })}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>What does success look like for you? (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Run a 10k under 50min, feel energised at work, sleep 8h consistently…"
                  value={profile.goalDetail ?? ""}
                  onChange={(e) => setProfile({ ...profile, goalDetail: e.target.value })}
                />
              </div>
            </>
          )}

          {step.id === "sports" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search sports (running, judo, surfing…)"
                  value={sportQuery}
                  onChange={(e) => setSportQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto p-1">
                {filteredSports.map((s) => {
                  const selected = sports.some((x) => x.sportId === s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSport(s.id)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-zen ${
                        selected
                          ? "bg-sage text-primary-foreground border-transparent shadow-glow"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <span className="mr-1">{s.emoji}</span>{s.name}
                    </button>
                  );
                })}
                {filteredSports.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">No sports match "{sportQuery}".</p>
                )}
              </div>
              {sports.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your sports</p>
                  {sports.map((sp) => {
                    const info = SPORTS.find((s) => s.id === sp.sportId);
                    return (
                      <div key={sp.sportId} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                        <span className="text-xl">{info?.emoji ?? "🏅"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{info?.name ?? sp.customName ?? sp.sportId}{!info && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Custom</span>}</p>
                          <div className="flex gap-2 mt-1.5">
                            <Select value={sp.level} onValueChange={(v) => updateSport(sp.sportId, { level: v as SportPractice["level"] })}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="competitive">Competitive</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number" min={0} max={20}
                              className="h-8 text-xs w-20"
                              value={sp.sessionsPerWeek}
                              onChange={(e) => updateSport(sp.sportId, { sessionsPerWeek: +e.target.value })}
                            />
                            <span className="text-xs text-muted-foreground self-center">×/week</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSport(sp.sportId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Add your own sport */}
              <div className="pt-3 border-t border-border/40 space-y-2">
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Don't see your sport?
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add your own sport (e.g. Ultimate Frisbee)"
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customSport.trim()) {
                        e.preventDefault();
                        const name = customSport.trim();
                        const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
                        setSports((cur) => [...cur, { sportId: id, level: "intermediate", sessionsPerWeek: 3, customName: name }]);
                        setCustomSport("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const name = customSport.trim();
                      if (!name) return;
                      const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
                      setSports((cur) => [...cur, { sportId: id, level: "intermediate", sessionsPerWeek: 3, customName: name }]);
                      setCustomSport("");
                    }}
                    disabled={!customSport.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              {sports.length === 0 && (
                <Badge variant="secondary" className="text-xs">Optional — you can add sports later</Badge>
              )}
            </>
          )}

          {step.id === "health" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Average sleep (hours)</Label>
                  <Input type="number" min={3} max={12} step={0.5} value={health.avgSleepHours} onChange={(e) => setHealth({ ...health, avgSleepHours: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Resting heart rate (bpm)</Label>
                  <Input type="number" min={30} max={120} value={health.restingHr} onChange={(e) => setHealth({ ...health, restingHr: +e.target.value })} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <Label>Current fatigue</Label>
                  <span className="text-sm text-muted-foreground">{health.fatigueLevel}/10</span>
                </div>
                <Slider min={1} max={10} step={1} value={[health.fatigueLevel]} onValueChange={(v) => setHealth({ ...health, fatigueLevel: v[0] })} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <Label>Stress level</Label>
                  <span className="text-sm text-muted-foreground">{health.stressLevel}/10</span>
                </div>
                <Slider min={1} max={10} step={1} value={[health.stressLevel]} onValueChange={(v) => setHealth({ ...health, stressLevel: v[0] })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily water intake ({imperial ? "fl oz" : "L"})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={imperial ? 200 : 6}
                    step={imperial ? 1 : 0.1}
                    value={health.dailyWaterMl ? displayWater(health.dailyWaterMl, units) : 0}
                    onChange={(e) => setHealth({ ...health, dailyWaterMl: Math.round(mlFrom(+e.target.value || 0, units)) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mold exposure</Label>
                  <Select value={health.moldExposure} onValueChange={(v) => setHealth({ ...health, moldExposure: v as HealthBaseline["moldExposure"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="suspected">Suspected</SelectItem>
                      <SelectItem value="confirmed">Confirmed (home/work)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anything hurting right now? (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Sharp pain in right shoulder, headache since yesterday…"
                  value={health.currentPain}
                  onChange={(e) => setHealth({ ...health, currentPain: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Past injuries (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Left knee tendinitis, lower back stiffness…"
                  value={health.injuries}
                  onChange={(e) => setHealth({ ...health, injuries: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Medical conditions (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Asthma, hypothyroidism, type 1 diabetes…"
                  value={health.medicalConditions}
                  onChange={(e) => setHealth({ ...health, medicalConditions: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Food allergies or intolerances</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select all that apply — your diet plan and recipes will avoid them.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((a) => {
                    const selected = (health.allergies ?? []).includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const cur = health.allergies ?? [];
                          setHealth({
                            ...health,
                            allergies: selected ? cur.filter((x) => x !== a.id) : [...cur, a.id],
                          });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background/60 border-border text-foreground/80 hover:bg-muted/50"
                        }`}
                      >
                        <span>{a.emoji}</span>
                        {a.label}
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  rows={2}
                  placeholder="Other allergies or intolerances (e.g. kiwi, sulfites, FODMAPs)…"
                  value={health.allergyNotes ?? ""}
                  onChange={(e) => setHealth({ ...health, allergyNotes: e.target.value })}
                />
              </div>
            </>
          )}

          {step.id === "prefs" && (
            <>
              <div className="space-y-2">
                <Label>Daily reminder</Label>
                <Input type="time" value={prefs.reminderTime} onChange={(e) => setPrefs({ ...prefs, reminderTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Motivation style</Label>
                <Select value={prefs.motivationStyle} onValueChange={(v) => setPrefs({ ...prefs, motivationStyle: v as Preferences["motivationStyle"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">Gentle — kind & supportive</SelectItem>
                    <SelectItem value="balanced">Balanced — encouraging with clear goals</SelectItem>
                    <SelectItem value="intense">Intense — push me, hold me accountable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Daily check-in notifications</p>
                  <p className="text-xs text-muted-foreground">A gentle nudge to log your day.</p>
                </div>
                <Switch checked={prefs.notifications} onCheckedChange={(c) => setPrefs({ ...prefs, notifications: c })} />
              </div>
              <p className="text-xs text-muted-foreground pt-2">Everything stays on this device. You can update any of these later.</p>

              {/* Medical disclaimer */}
              <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft/40 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-accent text-lg leading-none mt-0.5">⚕️</span>
                  <div>
                    <p className="font-display text-base text-foreground">Medical disclaimer</p>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                      Sport IQ is a wellness and education tool. Its guidance, meal plans, workouts and AI coaching are
                      <strong> not a substitute</strong> for professional medical advice, diagnosis or treatment.
                      Always consult a qualified healthcare provider before starting a new training or nutrition
                      program, especially if you have any medical condition, injury, or take medication. If you
                      experience chest pain, severe injury or other emergency symptoms, seek medical care immediately.
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
                  />
                  <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                    I understand and agree that Sport IQ does not replace professional medical advice.
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-8 mt-4 border-t border-border/40">
          <Button variant="ghost" onClick={back} disabled={stepIdx === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s.id} className={`h-1.5 rounded-full transition-all ${i === stepIdx ? "w-6 bg-primary" : i < stepIdx ? "w-1.5 bg-primary/60" : "w-1.5 bg-muted"}`} />
            ))}
          </div>
          <Button onClick={next} disabled={!canNext()} className="bg-sage text-primary-foreground hover:opacity-90 shadow-glow">
            {stepIdx === STEPS.length - 1 ? (<>Finish <Check className="h-4 w-4 ml-1" /></>) : (<>Next <ArrowRight className="h-4 w-4 ml-1" /></>)}
          </Button>
        </div>
      </Card>
    </div>
  );
};
