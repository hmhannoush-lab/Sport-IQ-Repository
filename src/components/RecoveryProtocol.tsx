import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Moon, Wind, Waves, Footprints, Snowflake, Flame, Apple, AlertOctagon, Clock, Sparkles } from "lucide-react";

interface Block {
  id: string;
  icon: typeof Moon;
  title: string;
  tag: string;
  summary: string;
  duration: string;
  steps: string[];
  tip?: string;
}

/**
 * Detailed, actionable recovery protocol shown on the Recovery tab.
 * Adapts a few items based on the latest fatigue check-in (sore zones, sleep, fatigue level).
 */
export const RecoveryProtocol = () => {
  const { store } = useStore();
  const latest = store.fatigue[0];
  const sore = latest?.soreness ?? [];
  const fatigue = latest?.fatigueLevel ?? 4;
  const sleepQ = latest?.sleepQuality ?? 3;

  const lowerSore = sore.some((s) => ["Hips", "Quads", "Hamstrings", "Calves", "Knees", "Ankles"].includes(s));
  const upperSore = sore.some((s) => ["Neck", "Shoulders", "Back", "Chest", "Arms", "Core"].includes(s));

  const blocks: Block[] = [
    {
      id: "sleep",
      icon: Moon,
      title: "Sleep — your #1 recovery tool",
      tag: sleepQ <= 2 ? "Priority tonight" : "Daily ritual",
      summary: "Deep & REM sleep drive muscle repair, hormone balance and cognitive recovery.",
      duration: "8-h window",
      steps: [
        "Fix wake time first — keep it within 30 min, every day, weekends included.",
        "Stop caffeine 8–10 h before bed; limit alcohol (it slashes REM by ~25 %).",
        "Dim overhead lights 90 min before bed; switch to warm/lamp light only.",
        "Cool the bedroom to 18–19 °C (65–67 °F) — drives core-temp drop needed for sleep onset.",
        "10 min wind-down: shower, light reading, journal — no doom-scrolling in bed.",
        "If awake >20 min, get up, sit in dim light until sleepy, then return.",
      ],
      tip: sleepQ <= 2
        ? "Your last sleep score was low — protect tonight: no screens after 21:30 and lights out by 22:30."
        : "Aim to be in bed 30 min before your target sleep time so you actually fall asleep on schedule.",
    },
    {
      id: "breathing",
      icon: Wind,
      title: "Down-regulate your nervous system",
      tag: fatigue >= 6 ? "Do twice today" : "Once today",
      summary: "Slow nasal breathing flips you out of fight-or-flight and accelerates physical recovery.",
      duration: "5–10 min",
      steps: [
        "Box breathing: inhale 4 s · hold 4 s · exhale 4 s · hold 4 s — repeat 5 min.",
        "Or 4-7-8 breathing: inhale 4 s · hold 7 s · long exhale 8 s × 6 cycles.",
        "Sit upright, eyes closed, breathe through the nose only.",
        "Best windows: mid-afternoon dip and 30 min before bed.",
      ],
      tip: "Pair with a 2-min body scan: notice tension in jaw, shoulders, hands, then consciously release.",
    },
    {
      id: "mobility",
      icon: Waves,
      title: lowerSore && !upperSore
        ? "Lower-body mobility flow"
        : upperSore && !lowerSore
        ? "Upper-body mobility flow"
        : "Full-body mobility flow",
      tag: sore.length >= 2 ? "Targeted today" : "General maintenance",
      summary: "Restore range of motion in zones that get short and stiff from training and sitting.",
      duration: "10–12 min",
      steps: lowerSore && !upperSore
        ? [
            "World's-greatest stretch — 5 reps/side, slow.",
            "90/90 hip switches × 8/side.",
            "Couch stretch (hip flexors) 60 s/side.",
            "Standing hamstring sweep × 10/side.",
            "Banded ankle dorsiflexion 45 s/side.",
          ]
        : upperSore && !lowerSore
        ? [
            "Cat-cow × 10 slow reps.",
            "Thoracic open-book × 8/side.",
            "Wall slides × 12 reps.",
            "Doorway pec stretch 45 s/side.",
            "Neck CARs (controlled rotations) × 5 each direction.",
          ]
        : [
            "Cat-cow × 10 reps.",
            "World's-greatest stretch × 5/side.",
            "Thoracic open-book × 8/side.",
            "90/90 hip switches × 8/side.",
            "Deep squat hold 60 s with thoracic reach.",
            "Child's pose with side reach × 30 s/side.",
          ],
      tip: "Move slowly — recovery mobility is about breathing into stiff zones, not chasing depth.",
    },
    {
      id: "soft-tissue",
      icon: Flame,
      title: "Soft-tissue work",
      tag: sore.length >= 2 ? `Hit ${sore.slice(0, 3).join(", ")}` : "Maintenance",
      summary: "Foam roller + lacrosse ball reduce perceived soreness and restore tissue glide.",
      duration: "8–10 min",
      steps: [
        "Foam roll large muscles 60–90 s each: quads, glutes, lats, T-spine.",
        "Lacrosse ball on knots: 30–45 s of slow pressure, breathe out into discomfort.",
        "Pain scale: stay at 5–6 / 10. Sharp pain = back off.",
        "Finish with 3–5 active reps of the muscle you just released.",
      ],
      tip: sore.length
        ? `Spend extra time on: ${sore.join(", ").toLowerCase()}.`
        : "Rotate focus daily so no one zone gets neglected for long.",
    },
    {
      id: "active",
      icon: Footprints,
      title: "Active recovery movement",
      tag: fatigue >= 7 ? "Keep it gentle" : "Easy intent",
      summary: "Light blood flow clears metabolites and beats sitting still all day.",
      duration: "20–40 min",
      steps: [
        "Walk outside in daylight — nasal breathing, easy conversation pace.",
        "Or easy bike / swim at conversational effort. Heart rate < 70 % max.",
        "No intervals, no hills hard, no checking the clock.",
        "Bonus: 5 min barefoot on grass at the end for ankle/foot proprioception.",
      ],
      tip: "Daylight in the first hour after waking + a post-lunch walk anchors your circadian rhythm.",
    },
    {
      id: "contrast",
      icon: Snowflake,
      title: "Heat & cold (optional)",
      tag: "If accessible",
      summary: "Sauna boosts heat-shock proteins; cold exposure dampens perceived soreness.",
      duration: "15–25 min",
      steps: [
        "Sauna: 15–20 min @ 80–90 °C, 2–4×/week — best 1–3 h post-training or evening.",
        "Cold shower / plunge: 1–3 min @ 10–15 °C, focus on slow nasal breathing.",
        "Contrast finish: 3 × (3 min hot · 1 min cold), end on cold.",
        "Skip cold within 4 h of strength training if you're chasing hypertrophy — it can blunt gains.",
      ],
      tip: "Hydrate well before/after sauna — you can lose 0.5–1 L of sweat per session.",
    },
    {
      id: "fuel",
      icon: Apple,
      title: "Recovery fueling window",
      tag: "Within 2 h post-training",
      summary: "Protein + carbs in the right window restock glycogen and rebuild muscle.",
      duration: "Ongoing",
      steps: [
        "Within 30–60 min: 25–40 g protein + 0.5–1 g carbs / kg bodyweight.",
        "Easy options: Greek yoghurt + banana + oats, smoothie with whey, tuna sandwich.",
        "Sip 0.5–0.75 L water in the hour after training; add a pinch of salt if you sweat a lot.",
        "Anti-inflammatory boosters: tart cherry juice, turmeric+pepper, omega-3 (fatty fish 2×/week).",
        "Magnesium-rich evening snack (pumpkin seeds, dark chocolate) supports sleep depth.",
      ],
      tip: "Alcohol in the 3 h post-workout cuts protein synthesis ~30 %. Save it for non-training days.",
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border-border/50 shadow-card rounded-3xl bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xl">Recovery protocol — what to do today</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        A practical sequence you can run through. Tap each block for the full details.
      </p>

      <Accordion type="multiple" defaultValue={["sleep", "mobility"]} className="space-y-2">
        {blocks.map((b) => {
          const Icon = b.icon;
          return (
            <AccordionItem key={b.id} value={b.id} className="border border-border/40 rounded-2xl bg-background/40 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="h-9 w-9 rounded-xl bg-primary-soft/40 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-display text-base leading-snug">{b.title}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium">{b.tag}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {b.duration}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-sm text-foreground/90 italic mb-3">{b.summary}</p>
                <ul className="space-y-1.5 mb-3">
                  {b.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/90">
                      <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                {b.tip && (
                  <div className="text-xs bg-primary-soft/30 border border-primary/20 rounded-xl p-3 text-foreground/90">
                    <strong className="text-primary">Tip · </strong>{b.tip}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Red flags */}
      <div className="mt-6 p-4 rounded-2xl border border-accent/30 bg-accent-soft/40">
        <div className="flex items-center gap-2 mb-2">
          <AlertOctagon className="h-4 w-4 text-accent" />
          <h4 className="font-display text-base">When to stop training and see a professional</h4>
        </div>
        <ul className="space-y-1.5 text-sm text-foreground/90">
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" /><span>Sharp or pinpoint pain &gt; 4/10 that doesn't ease in 48 h.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" /><span>Visible swelling, bruising, or a joint that feels unstable.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" /><span>Numbness, tingling, or shooting pain down a limb.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" /><span>Resting heart rate elevated &gt; 10 bpm for 3+ days — sign of under-recovery or illness.</span></li>
          <li className="flex gap-2"><span className="mt-2 h-1 w-1 rounded-full bg-accent shrink-0" /><span>Mood, motivation or sleep crashing for &gt; 1 week — possible overtraining syndrome.</span></li>
        </ul>
      </div>
    </Card>
  );
};
