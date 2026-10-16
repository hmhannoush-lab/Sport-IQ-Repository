import { Profile, Lifestyle, FatigueEntry, Workout, DailyMetrics, SportPractice } from "./store";
import { SPORTS, SportInfo } from "./sports";
import { substituteForAllergies, ALLERGEN_MAP } from "./allergies";


export function getSelectedSports(sports: SportPractice[] = []): SportInfo[] {
  const map = new Map(SPORTS.map((s) => [s.id, s]));
  return sports.map((sp) => map.get(sp.sportId)).filter((s): s is SportInfo => !!s);
}

export function calcBMI(p: Profile) {
  const m = p.heightCm / 100;
  return p.weightKg / (m * m);
}

export function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", tone: "warning" as const };
  if (bmi < 25) return { label: "Healthy", tone: "good" as const };
  if (bmi < 30) return { label: "Overweight", tone: "warning" as const };
  return { label: "Obese", tone: "alert" as const };
}

const activityFactor: Record<Lifestyle, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export function calcBMR(p: Profile) {
  // Mifflin-St Jeor
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function calcTDEE(p: Profile) {
  return calcBMR(p) * activityFactor[p.lifestyle];
}

export function calcCalorieTarget(p: Profile) {
  const tdee = calcTDEE(p);
  if (p.goal === "lose") return Math.round(tdee - 500);
  if (p.goal === "gain") return Math.round(tdee + 400);
  if (p.goal === "performance") return Math.round(tdee + 200);
  return Math.round(tdee);
}

export function calcMacros(p: Profile) {
  const cals = calcCalorieTarget(p);
  // Protein g/kg by goal
  const proteinPerKg =
    p.goal === "performance" ? 2.0 : p.goal === "gain" ? 1.8 : p.goal === "lose" ? 1.6 : 1.4;
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  const fatG = Math.round((cals * 0.27) / 9);
  const carbG = Math.max(0, Math.round((cals - proteinG * 4 - fatG * 9) / 4));
  return { calories: cals, proteinG, fatG, carbG };
}

export function hydrationTargetMl(p: Profile) {
  const base = p.weightKg * 33;
  const bonus = p.lifestyle === "athlete" ? 700 : p.lifestyle === "active" ? 500 : p.lifestyle === "moderate" ? 300 : 0;
  return Math.round(base + bonus);
}

// ---------- Diet plans ----------
export interface MealIdea {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  title: string;
  desc: string;
}

// 7 distinct breakfast / lunch / snack / dinner ideas; each tuple is [omnivore, pescatarian, vegetarian, vegan]
type Variant = [string, string, string, string];
interface DayIdea { title: Variant; desc: Variant; }

const BREAKFASTS: DayIdea[] = [
  { title: ["Power oats bowl", "Power oats bowl", "Power oats bowl", "Power oats bowl"],
    desc: ["Rolled oats, banana, almond butter, chia & milk.", "Rolled oats, banana, almond butter, chia & milk.", "Rolled oats, banana, almond butter, chia & milk.", "Rolled oats, banana, almond butter, chia & soy milk."] },
  { title: ["Veggie omelette & toast", "Smoked salmon & avocado toast", "Veggie omelette & toast", "Tofu scramble & sourdough"],
    desc: ["3-egg omelette with spinach, peppers, feta on rye toast.", "Sourdough, smashed avocado, smoked salmon, capers, lemon.", "3-egg omelette with spinach, peppers, feta on rye toast.", "Tofu scramble with turmeric, spinach, tomato on sourdough."] },
  { title: ["Greek yogurt parfait", "Greek yogurt parfait", "Greek yogurt parfait", "Coconut yogurt parfait"],
    desc: ["Greek yogurt layered with granola, berries, honey, walnuts.", "Greek yogurt layered with granola, berries, honey, walnuts.", "Greek yogurt layered with granola, berries, honey, walnuts.", "Coconut yogurt layered with granola, berries, maple, walnuts."] },
  { title: ["Banana protein pancakes", "Banana protein pancakes", "Banana protein pancakes", "Vegan banana oat pancakes"],
    desc: ["Oat-banana-egg pancakes with whey, berries & nut butter.", "Oat-banana-egg pancakes with whey, berries & nut butter.", "Oat-banana-egg pancakes with whey, berries & nut butter.", "Oat-banana flax pancakes with pea protein, berries, nut butter."] },
  { title: ["Avocado-egg breakfast burrito", "Tuna-avocado wrap", "Black bean breakfast burrito", "Black bean breakfast burrito"],
    desc: ["Whole-wheat tortilla with eggs, avocado, salsa, cheese.", "Whole-wheat tortilla with tuna, avocado, lettuce, tomato.", "Whole-wheat tortilla with black beans, avocado, salsa, cheese.", "Whole-wheat tortilla with black beans, avocado, salsa, cashew cheese."] },
  { title: ["Cottage cheese fruit bowl", "Cottage cheese fruit bowl", "Cottage cheese fruit bowl", "Silken tofu fruit bowl"],
    desc: ["Cottage cheese, peach, pumpkin seeds, drizzle of honey.", "Cottage cheese, peach, pumpkin seeds, drizzle of honey.", "Cottage cheese, peach, pumpkin seeds, drizzle of honey.", "Blended silken tofu, peach, pumpkin seeds, maple syrup."] },
  { title: ["Smoothie bowl", "Smoothie bowl", "Smoothie bowl", "Smoothie bowl"],
    desc: ["Banana, mixed berries, spinach, whey, oat milk, granola.", "Banana, mixed berries, spinach, whey, oat milk, granola.", "Banana, mixed berries, spinach, whey, oat milk, granola.", "Banana, mixed berries, spinach, pea protein, oat milk, granola."] },
];

const LUNCHES: DayIdea[] = [
  { title: ["Grilled chicken grain bowl", "Seared salmon grain bowl", "Halloumi grain bowl", "Lentil grain bowl"],
    desc: ["Quinoa, roasted veg, greens, chicken, tahini-lemon dressing.", "Quinoa, roasted veg, greens, salmon, tahini-lemon dressing.", "Quinoa, roasted veg, greens, halloumi, tahini-lemon dressing.", "Quinoa, roasted veg, greens, lentils & chickpeas, tahini-lemon."] },
  { title: ["Turkey & avocado wrap", "Tuna-avocado wrap", "Hummus & feta wrap", "Hummus & roasted veg wrap"],
    desc: ["Whole-wheat wrap with turkey, avocado, lettuce, tomato.", "Whole-wheat wrap with tuna, avocado, lettuce, tomato.", "Whole-wheat wrap with hummus, feta, cucumber, peppers.", "Whole-wheat wrap with hummus, roasted peppers, spinach."] },
  { title: ["Beef & broccoli stir-fry", "Shrimp & broccoli stir-fry", "Tempeh & broccoli stir-fry", "Tempeh & broccoli stir-fry"],
    desc: ["Lean beef, broccoli, garlic, ginger, soy over brown rice.", "Shrimp, broccoli, garlic, ginger, soy over brown rice.", "Tempeh, broccoli, garlic, ginger, soy over brown rice.", "Tempeh, broccoli, garlic, ginger, soy over brown rice."] },
  { title: ["Chicken Caesar salad", "Tuna Niçoise salad", "Halloumi Caesar salad", "Chickpea Caesar salad"],
    desc: ["Romaine, chicken, parmesan, croutons, light Caesar.", "Greens, tuna, egg, olives, green beans, vinaigrette.", "Romaine, halloumi, parmesan, croutons, light Caesar.", "Romaine, roasted chickpeas, vegan parmesan, croutons, cashew dressing."] },
  { title: ["Mediterranean chicken plate", "Mediterranean salmon plate", "Falafel mezze plate", "Falafel mezze plate"],
    desc: ["Chicken, hummus, tabbouleh, olives, pita, cucumber salad.", "Salmon, hummus, tabbouleh, olives, pita, cucumber salad.", "Falafel, hummus, tabbouleh, olives, pita, cucumber salad.", "Falafel, hummus, tabbouleh, olives, pita, cucumber salad."] },
  { title: ["Chicken tortilla soup", "Shrimp tortilla soup", "Black bean tortilla soup", "Black bean tortilla soup"],
    desc: ["Tomato-chili broth, chicken, beans, corn, avocado, lime.", "Tomato-chili broth, shrimp, beans, corn, avocado, lime.", "Tomato-chili broth, black beans, corn, avocado, lime.", "Tomato-chili broth, black beans, corn, avocado, lime."] },
  { title: ["Roast chicken & sweet potato", "Baked cod & sweet potato", "Stuffed peppers & sweet potato", "Stuffed peppers & sweet potato"],
    desc: ["Roast chicken, baked sweet potato, broccoli, olive oil.", "Baked cod, sweet potato, broccoli, lemon, olive oil.", "Quinoa-stuffed peppers, sweet potato, broccoli, olive oil.", "Quinoa-stuffed peppers, sweet potato, broccoli, olive oil."] },
];

const SNACKS: DayIdea[] = [
  { title: ["Apple & almond butter", "Apple & almond butter", "Apple & almond butter", "Apple & almond butter"],
    desc: ["Crisp apple with a tablespoon of almond butter.", "Crisp apple with a tablespoon of almond butter.", "Crisp apple with a tablespoon of almond butter.", "Crisp apple with a tablespoon of almond butter."] },
  { title: ["Greek yogurt & honey", "Greek yogurt & honey", "Greek yogurt & honey", "Soy yogurt & maple"],
    desc: ["Greek yogurt with honey and a few walnuts.", "Greek yogurt with honey and a few walnuts.", "Greek yogurt with honey and a few walnuts.", "Soy yogurt with maple syrup and walnuts."] },
  { title: ["Hummus & veg sticks", "Hummus & veg sticks", "Hummus & veg sticks", "Hummus & veg sticks"],
    desc: ["Carrot, cucumber, peppers with classic hummus.", "Carrot, cucumber, peppers with classic hummus.", "Carrot, cucumber, peppers with classic hummus.", "Carrot, cucumber, peppers with classic hummus."] },
  { title: ["Trail mix & dark chocolate", "Trail mix & dark chocolate", "Trail mix & dark chocolate", "Trail mix & dark chocolate"],
    desc: ["Mixed nuts, dried fruit, two squares of 70% chocolate.", "Mixed nuts, dried fruit, two squares of 70% chocolate.", "Mixed nuts, dried fruit, two squares of 70% chocolate.", "Mixed nuts, dried fruit, two squares of 70% chocolate."] },
  { title: ["Cottage cheese & berries", "Cottage cheese & berries", "Cottage cheese & berries", "Edamame & sea salt"],
    desc: ["Cottage cheese topped with raspberries and chia.", "Cottage cheese topped with raspberries and chia.", "Cottage cheese topped with raspberries and chia.", "Steamed edamame pods with sea salt — protein-rich."] },
  { title: ["Hard-boiled eggs & fruit", "Hard-boiled eggs & fruit", "Hard-boiled eggs & fruit", "Roasted chickpeas & fruit"],
    desc: ["Two eggs and a piece of seasonal fruit.", "Two eggs and a piece of seasonal fruit.", "Two eggs and a piece of seasonal fruit.", "Crunchy roasted chickpeas and a piece of fruit."] },
  { title: ["Banana & peanut butter", "Banana & peanut butter", "Banana & peanut butter", "Banana & peanut butter"],
    desc: ["Banana with a spoon of natural peanut butter.", "Banana with a spoon of natural peanut butter.", "Banana with a spoon of natural peanut butter.", "Banana with a spoon of natural peanut butter."] },
];

const DINNERS: DayIdea[] = [
  { title: ["Turkey stir-fry", "White fish stir-fry", "Tofu stir-fry", "Tofu stir-fry"],
    desc: ["Lean turkey, broccoli, peppers, ginger, sesame, soba noodles.", "Cod, broccoli, peppers, ginger, sesame, soba noodles.", "Tofu, broccoli, peppers, ginger, sesame, soba noodles.", "Tofu, broccoli, peppers, ginger, sesame, soba noodles."] },
  { title: ["Spaghetti bolognese", "Tuna pasta", "Lentil bolognese", "Lentil bolognese"],
    desc: ["Whole-wheat spaghetti, lean beef bolognese, side salad.", "Whole-wheat spaghetti with tuna, tomato, capers, side salad.", "Whole-wheat spaghetti with lentil bolognese, side salad.", "Whole-wheat spaghetti with lentil bolognese, side salad."] },
  { title: ["Sheet-pan chicken & veg", "Baked salmon & veg", "Halloumi tray bake", "Crispy chickpea tray bake"],
    desc: ["Chicken thighs, sweet potato, broccoli, peppers, herbs.", "Salmon, sweet potato, asparagus, peppers, lemon, dill.", "Halloumi, sweet potato, broccoli, peppers, herbs.", "Crispy chickpeas, sweet potato, broccoli, peppers, tahini drizzle."] },
  { title: ["Beef tacos", "Shrimp tacos", "Black bean tacos", "Black bean tacos"],
    desc: ["Soft tacos with lean beef, slaw, avocado, lime, salsa.", "Soft tacos with shrimp, slaw, avocado, lime, salsa.", "Soft tacos with black beans, slaw, avocado, lime, salsa.", "Soft tacos with black beans, slaw, avocado, lime, salsa."] },
  { title: ["Chicken curry & rice", "Prawn curry & rice", "Chickpea curry & rice", "Chickpea curry & rice"],
    desc: ["Chicken in tomato-coconut curry with basmati rice and spinach.", "Prawns in tomato-coconut curry with basmati rice and spinach.", "Chickpeas in tomato-coconut curry with basmati rice and spinach.", "Chickpeas in tomato-coconut curry with basmati rice and spinach."] },
  { title: ["Burger & sweet-potato fries", "Salmon burger & sweet-potato fries", "Halloumi burger & sweet-potato fries", "Black bean burger & sweet-potato fries"],
    desc: ["Lean beef burger on whole-wheat bun, baked fries, salad.", "Salmon patty on whole-wheat bun, baked fries, salad.", "Halloumi burger on whole-wheat bun, baked fries, salad.", "Black bean burger on whole-wheat bun, baked fries, salad."] },
  { title: ["Roast chicken Sunday plate", "Baked sea bass Sunday plate", "Mushroom Wellington Sunday plate", "Mushroom Wellington Sunday plate"],
    desc: ["Roast chicken, potatoes, carrots, greens, light gravy.", "Sea bass, potatoes, carrots, greens, lemon-caper sauce.", "Mushroom Wellington, potatoes, carrots, greens, light gravy.", "Mushroom Wellington, potatoes, carrots, greens, mushroom gravy.", ] },
];

function variantIndex(p: Profile): 0 | 1 | 2 | 3 {
  if (p.diet === "vegan") return 3;
  if (p.diet === "vegetarian") return 2;
  if (p.diet === "pescatarian") return 1;
  return 0;
}

export function getMealPlan(p: Profile, dayOffset = 0, allergies: string[] = []): MealIdea[] {
  const v = variantIndex(p);
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  const i = (today.getDay() + 7) % 7; // 0..6
  const meals: MealIdea[] = [
    { meal: "Breakfast", title: BREAKFASTS[i].title[v], desc: BREAKFASTS[i].desc[v] },
    { meal: "Lunch",     title: LUNCHES[i].title[v],    desc: LUNCHES[i].desc[v] },
    { meal: "Snack",     title: SNACKS[i].title[v],     desc: SNACKS[i].desc[v] },
    { meal: "Dinner",    title: DINNERS[i].title[v],    desc: DINNERS[i].desc[v] },
  ];
  if (!allergies.length) return meals;
  return meals.map((m) => ({
    ...m,
    title: substituteForAllergies(m.title, allergies),
    desc: substituteForAllergies(m.desc, allergies),
  }));
}

export interface DayMealPlan { dayLabel: string; dateLabel: string; isToday: boolean; meals: MealIdea[]; }

export function getWeekMealPlan(p: Profile, allergies: string[] = []): DayMealPlan[] {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return Array.from({ length: 7 }, (_, offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dayLabel: offset === 0 ? "Today" : dayNames[d.getDay()],
      dateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      isToday: offset === 0,
      meals: getMealPlan(p, offset, allergies),
    };
  });
}

export function dietGuidance(
  p: Profile,
  sports: SportPractice[] = [],
  allergies: string[] = [],
  allergyNotes = "",
): string[] {
  const tips: string[] = [];
  if (p.goal === "lose") tips.push("Aim for a gentle 300–500 kcal daily deficit; prioritize protein at each meal.");
  if (p.goal === "gain") tips.push("Eat every 3–4 hours; add an evening protein snack like cottage cheese or soy yogurt.");
  if (p.goal === "performance") tips.push("Carb-load 2 hours before hard sessions; rehydrate with electrolytes after.");
  if (p.lifestyle === "sedentary") tips.push("Smaller portions, lots of vegetables and fiber to feel satisfied at lower calories.");
  if (p.diet === "vegan") tips.push("Combine grains + legumes daily; supplement B12 and consider algae-based omega-3.");
  if (p.diet === "vegetarian") tips.push("Pair iron-rich foods (lentils, spinach) with vitamin C for absorption.");
  tips.push("Hydrate steadily through the day — thirst lags behind real need.");
  // Allergy-aware guidance
  for (const id of allergies) {
    const info = ALLERGEN_MAP.get(id);
    if (info) tips.push(`${info.emoji} ${info.tip}`);
  }
  if (allergyNotes.trim()) {
    tips.push(`⚠️ You also noted: ${allergyNotes.trim()} — swap those ingredients out and check labels before eating.`);
  }
  // Sport-specific nutrition (one bullet per selected sport, capped at 4)
  const infos = getSelectedSports(sports).slice(0, 4);
  for (const info of infos) {
    if (info.nutrition[0]) tips.push(`${info.emoji} ${info.name}: ${info.nutrition[0]}`);
  }
  return tips;
}


// ---------- Fatigue & recovery advice ----------
export interface RecoveryAdvice {
  status: "green" | "amber" | "red";
  headline: string;
  actions: string[];
}

export function recoveryAdvice(entry: FatigueEntry, recentWorkouts: Workout[]): RecoveryAdvice {
  const lastDays = recentWorkouts
    .filter((w) => Date.now() - new Date(w.date).getTime() < 1000 * 60 * 60 * 24 * 3)
    .filter((w) => w.intensity !== "low");
  const heavyLoad = lastDays.length >= 2;
  const hasInjury = entry.injuries.trim().length > 0;
  const score = entry.fatigueLevel - entry.sleepQuality + (entry.soreness.length > 2 ? 2 : 0) + (heavyLoad ? 2 : 0);

  if (hasInjury || score >= 8 || entry.fatigueLevel >= 8) {
    return {
      status: "red",
      headline: hasInjury ? "Treat the injury — full rest day" : "Body is overreaching — full rest",
      actions: [
        hasInjury
          ? "RICE protocol: Rest, Ice 15 min, Compression, Elevation. See a clinician if pain persists 48h."
          : "Skip training today; gentle walking only.",
        "Prioritize 8–9 hours of sleep tonight.",
        "Increase protein and carbohydrate intake to refuel and repair.",
        "Stretch lightly and consider a warm bath with magnesium salts.",
      ],
    };
  }
  if (score >= 4 || entry.fatigueLevel >= 6) {
    return {
      status: "amber",
      headline: "Active recovery recommended",
      actions: [
        "Swap intensity for mobility: yoga, easy swim, or 30-min walk.",
        "Foam-roll sore areas for 8–10 minutes.",
        "Add an extra 500 ml water and a banana for potassium.",
        "Aim to be in bed 30 minutes earlier tonight.",
      ],
    };
  }
  return {
    status: "green",
    headline: "You're recovered — train as planned",
    actions: [
      "Warm up thoroughly (8–10 min) before hitting target intensity.",
      "Hydrate before, during, and after the session.",
      "Log how you feel post-workout to keep tracking trends.",
    ],
  };
}

// ---------- Workout recommendations ----------
export interface WorkoutSuggestion {
  title: string;
  type: string;
  durationMin: number;
  intensity: "low" | "medium" | "high";
  why: string;
  steps: string[];
}

export function recommendWorkouts(
  p: Profile,
  recentWorkouts: Workout[],
  latestFatigue?: FatigueEntry,
): { headline: string; tone: "good" | "warning" | "alert"; suggestions: WorkoutSuggestion[] } {
  const recent = recentWorkouts.filter(
    (w) => Date.now() - new Date(w.date).getTime() < 1000 * 60 * 60 * 24 * 7,
  );
  const hardCount = recent.filter((w) => w.intensity === "high").length;
  const totalMin = recent.reduce((s, w) => s + w.durationMin, 0);
  const types = new Set(recent.map((w) => w.type));

  const injured = !!latestFatigue && latestFatigue.injuries.trim().length > 0;
  const fatigued = !!latestFatigue && (latestFatigue.fatigueLevel >= 7 || latestFatigue.sleepQuality <= 2);

  // Recovery-first override
  if (injured || fatigued) {
    return {
      headline: injured ? "Recovery week — protect the injury" : "You're under-recovered — go gentle",
      tone: "alert",
      suggestions: [
        {
          title: "Restorative yoga flow",
          type: "Yoga",
          durationMin: 25,
          intensity: "low",
          why: "Improves circulation and mobility without taxing the nervous system.",
          steps: [
            "5 min slow breathing in child's pose",
            "10 min gentle cat-cow, downward dog, low lunge",
            "10 min supine twists, legs-up-the-wall, savasana",
          ],
        },
        {
          title: "Easy outdoor walk",
          type: "Walk",
          durationMin: 30,
          intensity: "low",
          why: "Light movement boosts recovery blood flow and mood.",
          steps: [
            "Comfortable conversational pace",
            "Focus on nasal breathing",
            "Finish with 5 min of calf and hip stretches",
          ],
        },
      ],
    };
  }

  // Pick base intensity from lifestyle + goal
  const baseDur =
    p.lifestyle === "athlete" ? 60 : p.lifestyle === "active" ? 50 : p.lifestyle === "moderate" ? 40 : p.lifestyle === "light" ? 30 : 20;
  const wantStrength = p.goal === "gain" || p.goal === "performance" || p.goal === "maintain";
  const wantCardio = p.goal === "lose" || p.goal === "performance";

  const suggestions: WorkoutSuggestion[] = [];

  if (wantStrength && !types.has("Strength")) {
    suggestions.push({
      title: "Full-body strength circuit",
      type: "Strength",
      durationMin: baseDur,
      intensity: hardCount >= 2 ? "medium" : "high",
      why: p.goal === "gain" ? "Builds lean mass and supports your gain goal." : "Preserves muscle and boosts metabolism.",
      steps: [
        "Warm-up: 5 min dynamic mobility",
        "Squats 4×8, Push-ups or bench 4×8",
        "Romanian deadlift 3×10, Rows 3×10",
        "Plank 3×45s, finish with light stretching",
      ],
    });
  }

  if (wantCardio) {
    const isHIIT = p.lifestyle !== "sedentary" && hardCount < 2;
    suggestions.push(
      isHIIT
        ? {
            title: "Zone-2 + intervals run",
            type: "Run",
            durationMin: baseDur,
            intensity: "high",
            why: p.goal === "lose" ? "High calorie burn and improves cardio fitness." : "Develops aerobic + anaerobic capacity.",
            steps: [
              "10 min easy jog warm-up",
              "6 × (1 min fast / 2 min easy)",
              "10 min cool-down jog and stretch",
            ],
          }
        : {
            title: "Steady cycle or brisk walk",
            type: p.lifestyle === "sedentary" ? "Walk" : "Cycle",
            durationMin: baseDur,
            intensity: "medium",
            why: "Builds aerobic base safely — sustainable and joint-friendly.",
            steps: [
              "Keep heart rate conversational (zone 2)",
              "Maintain steady cadence the whole time",
              "Cool down 5 min with calf and hip stretches",
            ],
          },
    );
  }

  // Always include a mobility/active recovery day
  suggestions.push({
    title: "Mobility & core session",
    type: "Pilates",
    durationMin: 25,
    intensity: "low",
    why: "Balances stronger sessions and protects you from overuse injuries.",
    steps: [
      "Hip openers and thoracic rotations 8 min",
      "Dead bugs 3×10, bird dogs 3×10, side plank 3×30s",
      "Foam roll quads, glutes, upper back 5 min",
    ],
  });

  let headline = "Here's a balanced plan for the next few days";
  let tone: "good" | "warning" | "alert" = "good";
  if (totalMin === 0) {
    headline = "Let's build momentum — start light";
    tone = "warning";
  } else if (hardCount >= 3) {
    headline = "You've trained hard — emphasize recovery work";
    tone = "warning";
  }

  return { headline, tone, suggestions: suggestions.slice(0, 3) };
}

// ---------- Daily metric advice ----------
export function metricInsights(p: Profile, m: DailyMetrics) {
  const insights: { label: string; tone: "good" | "warning" | "alert"; msg: string }[] = [];
  const hydroTarget = hydrationTargetMl(p);
  if (m.waterMl < hydroTarget * 0.5) insights.push({ label: "Hydration", tone: "alert", msg: `Only ${m.waterMl} ml today — aim for ${hydroTarget} ml.` });
  else if (m.waterMl < hydroTarget) insights.push({ label: "Hydration", tone: "warning", msg: `Almost there — ${hydroTarget - m.waterMl} ml to go.` });
  else insights.push({ label: "Hydration", tone: "good", msg: "Hydration target reached. Beautiful." });

  if (m.sleepHours && m.sleepHours < 6) insights.push({ label: "Sleep", tone: "alert", msg: "Less than 6 h — recovery and immunity will suffer." });
  else if (m.sleepHours && m.sleepHours < 7) insights.push({ label: "Sleep", tone: "warning", msg: "A bit short — try winding down 30 min earlier tonight." });
  else if (m.sleepHours >= 7) insights.push({ label: "Sleep", tone: "good", msg: "Great sleep — your body will thank you." });

  if (m.steps && m.steps < 5000) insights.push({ label: "Movement", tone: "warning", msg: "Light movement day — a 20 min walk would help." });
  else if (m.steps >= 8000) insights.push({ label: "Movement", tone: "good", msg: "Solid step count — keep the rhythm." });

  return insights;
}
