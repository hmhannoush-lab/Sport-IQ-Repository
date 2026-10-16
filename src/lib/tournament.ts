import { Tournament } from "./store";

export type TournamentPhase = "far" | "build" | "taper" | "peak-week" | "race-day" | "recovery";

export interface TournamentPlan {
  daysOut: number;
  phase: TournamentPhase;
  label: string;
  headline: string;
  training: string[];
  nutrition: string[];
  recovery: string[];
}

export function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateIso}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function tournamentPlan(t: Tournament): TournamentPlan {
  const daysOut = daysUntil(t.date);

  if (daysOut < 0) {
    return {
      daysOut,
      phase: "recovery",
      label: "Post-event recovery",
      headline: `${Math.abs(daysOut)} day${Math.abs(daysOut) === 1 ? "" : "s"} since ${t.name} — rebuild before you rebuild load.`,
      training: [
        "48–72 h of easy movement only: walking, easy spin, mobility.",
        "First real session back should be aerobic and sub-maximal.",
        "Return to full intensity only when soreness is gone and sleep is normal.",
      ],
      nutrition: [
        "Protein 1.6–2.0 g/kg daily to repair match damage.",
        "Restore carbs and fluids for 24–48 h; add electrolytes if you cramped.",
        "Colourful produce + omega-3s to support the inflammatory clean-up.",
      ],
      recovery: [
        "Prioritise sleep — aim 8–9 h for three nights.",
        "Log any niggle in the Recovery tab so it doesn't carry into the next block.",
      ],
    };
  }

  if (daysOut === 0) {
    return {
      daysOut,
      phase: "race-day",
      label: "Event day",
      headline: `${t.name} is today — execute what you've practised, nothing new.`,
      training: [
        "Full warm-up: 10 min easy, dynamic mobility, 4–6 short accelerations.",
        "Between rounds/games: keep moving lightly, stay warm, avoid long sitting.",
      ],
      nutrition: [
        "Familiar carb-rich meal 3–4 h before (1–4 g/kg), low fibre and low fat.",
        "Top-up snack 60 min out: banana, toast, sports drink.",
        "Sip 400–600 ml fluid in the 2–3 h before; add sodium if it's hot.",
        "Nothing new on event day — no untested foods, gels or supplements.",
      ],
      recovery: [
        "Between-session refuel: carbs + 20–30 g protein within 30–60 min.",
        "Breathing or light stretching to reset between rounds.",
      ],
    };
  }

  if (daysOut <= 3) {
    return {
      daysOut,
      phase: "peak-week",
      label: "Final 72 hours",
      headline: `${daysOut} day${daysOut === 1 ? "" : "s"} to ${t.name} — freshen up, don't chase fitness.`,
      training: [
        "Very low volume: 20–30 min with a few sharp, short efforts to stay crisp.",
        "No heavy lifting, no new drills, no maximal testing.",
        "Rehearse your exact warm-up routine once.",
      ],
      nutrition: [
        "Raise carbs to 6–10 g/kg/day in the last 24–48 h for glycogen loading.",
        "Cut fibre and heavy fats the day before to avoid gut issues.",
        "Hydrate steadily; pale-yellow urine is the target.",
      ],
      recovery: [
        "Sleep is the highest-value intervention this week — protect 8+ h.",
        "Prep kit, food and travel the night before to lower stress.",
      ],
    };
  }

  if (daysOut <= 10) {
    return {
      daysOut,
      phase: "taper",
      label: "Taper",
      headline: `${daysOut} days to ${t.name} — cut volume, keep intensity.`,
      training: [
        "Reduce weekly volume by 40–60 % while keeping some race-pace intensity.",
        "Keep session frequency the same so you don't feel flat.",
        "Last hard/heavy session no later than ~5 days out.",
      ],
      nutrition: [
        "Keep protein high (1.6–2.0 g/kg) even as training drops.",
        "Match carbs to the reduced load; ramp them back up in the last 48 h.",
        "Practise your event-day meals and drinks now, not on the day.",
      ],
      recovery: [
        "Add mobility and easy aerobic flushes instead of extra hard work.",
        "Treat any niggle immediately — no 'training through it' this close.",
      ],
    };
  }

  if (daysOut <= 28) {
    return {
      daysOut,
      phase: "build",
      label: "Build block",
      headline: `${daysOut} days to ${t.name} — sharpen sport-specific quality.`,
      training: [
        "2–3 quality sessions per week at or above event intensity.",
        "Keep strength work but shift toward power and lower volume.",
        "Simulate event conditions once a week (timing, surface, duration).",
      ],
      nutrition: [
        "Fuel hard sessions properly — carbs before and after quality work.",
        "Dial in your race-day fuelling plan during long/hard sessions.",
        "Avoid aggressive dieting; performance beats weight change this close.",
      ],
      recovery: [
        "One genuine rest day per week.",
        "Track fatigue daily — rising fatigue plus falling sleep means back off.",
      ],
    };
  }

  return {
    daysOut,
    phase: "far",
    label: "Base block",
    headline: `${daysOut} days to ${t.name} — build capacity now, sharpen later.`,
    training: [
      "Build aerobic base and strength; progress load ~10 % per week.",
      "Address weaknesses and old injuries while there's time.",
      "Plan the calendar backwards: taper starts ~10 days out.",
    ],
    nutrition: [
      "Consistent daily protein and enough total energy to support the build.",
      "If body-composition change is a goal, do it now — not in the final month.",
    ],
    recovery: [
      "Deload every 3–4 weeks.",
      "Keep sleep at 7–9 h; it's the base your build sits on.",
    ],
  };
}

/** Compact line for the AI coach's context block. */
export function tournamentContext(t: Tournament | null): string {
  if (!t?.date || !t?.name) return "";
  const plan = tournamentPlan(t);
  return `UPCOMING COMPETITION: "${t.name}"${t.sport ? ` (${t.sport})` : ""} on ${t.date} — ${
    plan.daysOut < 0 ? `${Math.abs(plan.daysOut)} days ago (post-event recovery)` : `${plan.daysOut} days away`
  }. Current phase: ${plan.label}. Tailor every answer to this timeline (periodisation, taper, carb loading, travel, event-day fuelling, injury risk).`;
}
