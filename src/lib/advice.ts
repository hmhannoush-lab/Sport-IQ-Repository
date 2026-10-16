import { Profile, FatigueEntry, Workout, DailyMetrics, SportPractice, localDateKey } from "./store";
import { calcMacros, hydrationTargetMl, getSelectedSports } from "./health";

export type AdviceLevel = "green" | "amber" | "red";

export interface TrainingRec {
  title: string;
  duration: string;
  intensity: "rest" | "low" | "medium" | "high";
  why: string;
  steps: string[];
  avoid?: string[];
}

export interface DietRec {
  focus: string;
  why: string;
  bullets: string[];
  hydrationMl: number;
  proteinG: number;
  calorieDelta: number; // suggested adjustment vs target
}

export interface PersonalAdvice {
  level: AdviceLevel;
  summary: string;
  signals: { label: string; value: string; tone: "good" | "warning" | "alert" | "neutral" }[];
  flags: string[];
  training: TrainingRec[];
  diet: DietRec;
  lifestyle: string[];
}

const SORENESS_ZONES_LOWER = ["Hips", "Quads", "Hamstrings", "Calves", "Knees", "Ankles"];
const SORENESS_ZONES_UPPER = ["Neck", "Shoulders", "Back", "Chest", "Arms", "Core"];

const INJURY_HINTS = [
  { match: /knee|patell/i, area: "knee" },
  { match: /ankle|sprain/i, area: "ankle" },
  { match: /hamstring/i, area: "hamstring" },
  { match: /shoulder|rotator/i, area: "shoulder" },
  { match: /back|lumbar|spine/i, area: "back" },
  { match: /wrist|elbow|tennis|golfer/i, area: "upper-limb" },
  { match: /shin|splint/i, area: "shin" },
  { match: /achilles|tendon/i, area: "tendon" },
];

function detectInjuryArea(text: string) {
  for (const h of INJURY_HINTS) if (h.match.test(text)) return h.area;
  return text.trim() ? "general" : null;
}

function recentLoad(workouts: Workout[], days: number) {
  const cutoff = Date.now() - days * 86_400_000;
  const recent = workouts.filter((w) => new Date(w.date).getTime() >= cutoff);
  const totalMin = recent.reduce((s, w) => s + w.durationMin, 0);
  const hardCount = recent.filter((w) => w.intensity === "high").length;
  const mediumCount = recent.filter((w) => w.intensity === "medium").length;
  const types = new Set(recent.map((w) => w.type));
  return { recent, totalMin, hardCount, mediumCount, types };
}

function avgSleep(metrics: Record<string, DailyMetrics>, days: number) {
  const today = new Date();
  const vals: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = localDateKey(d);
    const v = metrics[k]?.sleepHours;
    if (v && v > 0) vals.push(v);
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * Personalized advice engine. Combines latest fatigue check-in, sore zones,
 * free-text injury notes, recent training load and average sleep into a
 * concrete training plan + diet adjustments.
 */
export function personalAdvice(
  profile: Profile,
  latest: FatigueEntry | undefined,
  workouts: Workout[],
  metrics: Record<string, DailyMetrics>,
  sports: SportPractice[] = [],
): PersonalAdvice {
  const fatigue = latest?.fatigueLevel ?? 4;
  const sleepQ = latest?.sleepQuality ?? 3;
  const soreList = latest?.soreness ?? [];
  const injuryText = (latest?.injuries ?? "").trim();
  const injuryArea = detectInjuryArea(injuryText);

  const load = recentLoad(workouts, 7);
  const sleep7 = avgSleep(metrics, 7);
  const macros = calcMacros(profile);
  const hydroBase = hydrationTargetMl(profile);
  const sportInfos = getSelectedSports(sports);

  // ---- Score & level -------------------------------------------------------
  let score = 0;
  score += Math.max(0, fatigue - 4); // fatigue >4 adds points
  score += Math.max(0, 3 - sleepQ) * 1.5; // poor sleep adds
  score += soreList.length >= 4 ? 3 : soreList.length >= 2 ? 1.5 : 0;
  score += load.hardCount >= 3 ? 2 : load.hardCount >= 2 ? 1 : 0;
  if (sleep7 !== null && sleep7 < 6) score += 2;
  if (injuryArea) score += 4;

  let level: AdviceLevel = "green";
  if (injuryArea || score >= 7 || fatigue >= 8) level = "red";
  else if (score >= 3.5 || fatigue >= 6) level = "amber";

  // ---- Signal chips --------------------------------------------------------
  const signals: PersonalAdvice["signals"] = [
    {
      label: "Fatigue",
      value: `${fatigue}/10`,
      tone: fatigue >= 7 ? "alert" : fatigue >= 5 ? "warning" : "good",
    },
    {
      label: "Sleep quality",
      value: `${sleepQ}/5`,
      tone: sleepQ <= 2 ? "alert" : sleepQ === 3 ? "warning" : "good",
    },
    {
      label: "Sore zones",
      value: soreList.length ? `${soreList.length}` : "0",
      tone: soreList.length >= 4 ? "alert" : soreList.length >= 2 ? "warning" : "good",
    },
    {
      label: "7d hard sessions",
      value: `${load.hardCount}`,
      tone: load.hardCount >= 3 ? "warning" : "good",
    },
    {
      label: "7d avg sleep",
      value: sleep7 ? `${sleep7.toFixed(1)} h` : "—",
      tone: sleep7 === null ? "neutral" : sleep7 < 6 ? "alert" : sleep7 < 7 ? "warning" : "good",
    },
  ];

  const flags: string[] = [];
  if (injuryArea) flags.push(`Injury flag: ${injuryText}`);
  if (soreList.length >= 4) flags.push(`Widespread soreness (${soreList.join(", ")})`);
  if (load.hardCount >= 3) flags.push(`${load.hardCount} hard sessions in the last 7 days`);
  if (sleep7 !== null && sleep7 < 6) flags.push(`Average sleep only ${sleep7!.toFixed(1)} h — under-recovered`);

  // ---- Training plan -------------------------------------------------------
  const training: TrainingRec[] = [];
  const lowerSore = soreList.some((s) => SORENESS_ZONES_LOWER.includes(s));
  const upperSore = soreList.some((s) => SORENESS_ZONES_UPPER.includes(s));

  if (level === "red") {
    if (injuryArea) {
      training.push({
        title: `Protect the ${injuryArea === "general" ? "affected area" : injuryArea}`,
        duration: "24–72 h",
        intensity: "rest",
        why: "Pain + load = setbacks. Calm tissue first, train the rest of the body around it.",
        steps: [
          "RICE for the first 48 h: Rest, Ice 10–15 min × 3/day, light Compression, Elevate.",
          "Avoid any movement that reproduces sharp pain (>3/10).",
          `Train pain-free zones only: ${injuryArea === "knee" || injuryArea === "ankle" || injuryArea === "hamstring" || injuryArea === "shin" ? "upper-body push/pull, core, breathing work" : "easy lower-body cycling, walking, mobility"}.`,
          "If pain or swelling persists past 72 h, see a physio or sports doc.",
        ],
        avoid: ["Plyometrics", "Heavy loading of the painful area", "Stretching into pain"],
      });
    } else {
      training.push({
        title: "Full rest day",
        duration: "Today",
        intensity: "rest",
        why: "Your body is signalling overreach. Pushing now pays back as illness or injury.",
        steps: [
          "No structured training — gentle daily movement only.",
          "10–15 min mobility flow before bed (cat-cow, hip openers, thoracic rotations).",
          "Box-breathing 4×4×4×4 for 5 min to drop sympathetic load.",
        ],
      });
    }
    training.push({
      title: "Restorative walk + breathing",
      duration: "20–30 min",
      intensity: "low",
      why: "Light movement boosts recovery blood flow without taxing the system.",
      steps: [
        "Easy nasal-breathing pace, ideally outside in daylight.",
        "Finish with 5 min of gentle stretching for tight zones.",
      ],
    });
  } else if (level === "amber") {
    training.push({
      title: lowerSore && !upperSore ? "Upper-body focus session" : upperSore && !lowerSore ? "Lower-body focus session" : "Active recovery + mobility",
      duration: "30–40 min",
      intensity: "low",
      why: soreList.length
        ? `Avoiding load on ${soreList.join(", ").toLowerCase()} while still moving.`
        : "Maintain rhythm at lower stress so your nervous system can catch up.",
      steps: lowerSore && !upperSore
        ? [
            "Push: incline push-ups 3×10, DB shoulder press 3×8.",
            "Pull: rows 3×10, face-pulls 3×12.",
            "Core: dead bug 3×10/side, side plank 3×30 s.",
          ]
        : upperSore && !lowerSore
        ? [
            "Goblet squat 3×10, Romanian deadlift 3×10 (light).",
            "Walking lunges 3×8/leg, glute bridges 3×12.",
            "Calf raises 3×15 + 5 min mobility.",
          ]
        : [
            "10 min easy bike or brisk walk warm-up.",
            "20 min full-body mobility (hips, T-spine, ankles).",
            "Foam roll any tight zones 5–8 min.",
          ],
      avoid: ["High-intensity intervals", "1RM testing", "New plyometric work"],
    });
    training.push({
      title: "Easy zone-2 cardio",
      duration: "25–35 min",
      intensity: "low",
      why: "Low-stress aerobic work clears metabolic byproducts and improves recovery.",
      steps: [
        "Pace where you can hold a conversation comfortably.",
        "Stay nasal-breathing if possible.",
      ],
    });
  } else {
    // GREEN — train as planned, with a tilt toward the user's goal
    const wantStrength = profile.goal === "gain" || profile.goal === "performance" || profile.goal === "maintain";
    const wantCardio = profile.goal === "lose" || profile.goal === "performance";

    if (wantStrength) {
      training.push({
        title: "Full-body strength block",
        duration: profile.lifestyle === "athlete" ? "60 min" : "45 min",
        intensity: load.hardCount >= 2 ? "medium" : "high",
        why: profile.goal === "gain" ? "Drives lean mass gains alongside your calorie surplus." : "Maintains strength and metabolic rate.",
        steps: [
          "Warm-up: 6 min dynamic mobility + 2 light sets of squat & press.",
          "Squat 4×6, Bench or push-up 4×8.",
          "Romanian deadlift 3×8, Row 3×10.",
          "Plank 3×45 s, finish with 5 min stretch.",
        ],
      });
    }
    if (wantCardio) {
      const isHIIT = profile.lifestyle !== "sedentary" && load.hardCount < 2;
      training.push(
        isHIIT
          ? {
              title: "Interval cardio",
              duration: "30 min",
              intensity: "high",
              why: profile.goal === "lose" ? "Big calorie burn with strong fitness gains." : "Sharpens VO2max and lactate threshold.",
              steps: [
                "10 min easy warm-up.",
                "6 × (1 min hard / 2 min easy).",
                "8 min cool-down + stretch.",
              ],
            }
          : {
              title: "Steady aerobic session",
              duration: "40 min",
              intensity: "medium",
              why: "Builds your aerobic base — sustainable and joint-friendly.",
              steps: ["Conversational pace the whole way.", "Cool down 5 min, stretch hips and calves."],
            },
      );
    }
    training.push({
      title: "Mobility & core finisher",
      duration: "15 min",
      intensity: "low",
      why: "Buffers against overuse injuries on training days.",
      steps: [
        "Hip openers 5 min, T-spine rotations 3 min.",
        "Dead bug 3×10, bird dog 3×10/side.",
      ],
    });
  }

  // ---- Diet ---------------------------------------------------------------
  let diet: DietRec;
  const baseProtein = macros.proteinG;
  const baseCals = macros.calories;

  if (level === "red") {
    diet = {
      focus: "Repair & refuel",
      why: "Tissue repair needs extra protein, anti-inflammatory fats, and carbs to restock glycogen.",
      bullets: [
        `Hit ${Math.round(baseProtein * 1.15)} g protein today (≈ +15 % vs target) — split across 4 meals.`,
        "Add omega-3 sources: fatty fish, walnuts, flaxseed, or algae oil.",
        "Colorful produce at every meal: berries, leafy greens, peppers — polyphenols help recovery.",
        "Slow carbs (oats, rice, sweet potato) to replenish glycogen without spiking insulin.",
        "Reduce alcohol and ultra-processed foods — both blunt recovery.",
      ],
      hydrationMl: hydroBase + 500,
      proteinG: Math.round(baseProtein * 1.15),
      calorieDelta: profile.goal === "lose" ? +200 : 0, // ease off any deficit on rest days
    };
  } else if (level === "amber") {
    diet = {
      focus: "Steady fueling + recovery nutrients",
      why: "Moderate stress — keep macros on target and lean into anti-inflammatory foods.",
      bullets: [
        `Protein around ${baseProtein} g, ideally 25–35 g per meal.`,
        "Add tart cherries, ginger, or turmeric — natural anti-inflammatories.",
        "Magnesium-rich foods (pumpkin seeds, dark chocolate, spinach) support sleep & muscles.",
        "An extra piece of fruit pre-workout for steady energy.",
      ],
      hydrationMl: hydroBase + 300,
      proteinG: baseProtein,
      calorieDelta: 0,
    };
  } else {
    diet = {
      focus: profile.goal === "gain" ? "Fuel growth" : profile.goal === "lose" ? "Sustain the deficit" : "Maintain & perform",
      why: "You're recovered — eat to support today's training intent.",
      bullets: [
        `Protein at ${baseProtein} g, evenly spread across the day.`,
        "Carbs around training: oats/banana 60–90 min before, rice/potato within 2 h after.",
        "Healthy fats from olive oil, avocado, nuts — keep portions moderate.",
        "Caffeine OK 30–45 min pre-training if tolerated.",
      ],
      hydrationMl: hydroBase + (load.hardCount >= 1 ? 200 : 0),
      proteinG: baseProtein,
      calorieDelta: 0,
    };
  }

  // ---- Lifestyle ----------------------------------------------------------
  const lifestyle: string[] = [];
  if (sleepQ <= 2 || (sleep7 !== null && sleep7 < 6.5)) {
    lifestyle.push("Lights down 60 min before bed; no screens in bed for 3 nights.");
    lifestyle.push("Cool the room to 18–19 °C and target 8 h sleep window.");
  }
  if (soreList.length >= 2) {
    lifestyle.push(`Foam-roll the sore zones (${soreList.join(", ").toLowerCase()}) for 8 min tonight.`);
  }
  if (load.hardCount >= 3) {
    lifestyle.push("Schedule one full rest day this week — no negotiation.");
  }
  if (level === "green") {
    lifestyle.push("10 min sunlight within 1 h of waking — anchors circadian rhythm.");
  }
  if (injuryArea) {
    lifestyle.push("Log pain level (0–10) morning and evening for the next 5 days to track recovery.");
  }

  // ---- Sport-specific tailoring ------------------------------------------
  if (sportInfos.length > 0) {
    // Diet: append one nutrition cue per sport (max 3)
    for (const info of sportInfos.slice(0, 3)) {
      if (info.nutrition[0]) diet.bullets.push(`${info.emoji} ${info.name}: ${info.nutrition[0]}`);
    }
    // Add a sport-specific training card (always — frames general plan around their sports)
    const primary = sportInfos[0];
    const trainingTips = sportInfos
      .flatMap((s) => s.training.slice(0, 1).map((t) => `${s.emoji} ${t}`))
      .slice(0, 4);
    training.push({
      title: `${primary.name} focus${sportInfos.length > 1 ? ` (+${sportInfos.length - 1} more)` : ""}`,
      duration: "Slot into your week",
      intensity: level === "red" ? "low" : level === "amber" ? "low" : "medium",
      why: `Tailored to the demands of your selected sport${sportInfos.length > 1 ? "s" : ""}: ${sportInfos.map((s) => s.name).join(", ")}.`,
      steps: trainingTips,
      avoid: level !== "green"
        ? Array.from(new Set(sportInfos.flatMap((s) => s.injuryRisks.slice(0, 1))))
        : undefined,
    });
    // Lifestyle: add top mobility focus + first recovery cue from primary sport
    const mobilityFoci = Array.from(new Set(sportInfos.flatMap((s) => s.mobility))).slice(0, 4);
    if (mobilityFoci.length) {
      lifestyle.push(`Mobility focus for your sports: ${mobilityFoci.join(" · ")}.`);
    }
    if (primary.recovery[0]) {
      lifestyle.push(`${primary.emoji} ${primary.name} recovery: ${primary.recovery[0]}`);
    }
    // Flags: surface highest-risk injuries when user is already amber/red
    if (level !== "green") {
      const risks = Array.from(new Set(sportInfos.flatMap((s) => s.injuryRisks.slice(0, 1)))).slice(0, 3);
      if (risks.length) flags.push(`Watch sport-specific risks: ${risks.join(", ")}`);
    }
  }

  // ---- Summary headline ---------------------------------------------------
  const sportTag = sportInfos.length
    ? ` for ${sportInfos.slice(0, 2).map((s) => s.name).join(" & ")}${sportInfos.length > 2 ? " +more" : ""}`
    : "";
  const summary =
    level === "red"
      ? injuryArea
        ? "Treat the injury first — train around it intelligently."
        : "Your body needs a real rest day to come back stronger."
      : level === "amber"
      ? `Dial intensity back today and prioritize recovery${sportTag}.`
      : `You're well recovered — train as planned and fuel${sportTag}.`;

  return { level, summary, signals, flags, training, diet, lifestyle };
}
