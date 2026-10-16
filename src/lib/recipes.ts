import type { MealIdea } from "./health";
import type { Profile } from "./store";
import { calcMacros } from "./health";

export interface Recipe {
  ingredients: string[];
  steps: string[];
  timeMin: number;
  servings: number;
}

export interface MealNutrition {
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
}

const MEAL_SPLIT: Record<MealIdea["meal"], number> = {
  Breakfast: 0.25,
  Lunch: 0.32,
  Snack: 0.13,
  Dinner: 0.30,
};

export function getMealNutrition(meal: MealIdea, profile: Profile): MealNutrition {
  const macros = calcMacros(profile);
  const share = MEAL_SPLIT[meal.meal];
  const calories = Math.round(macros.calories * share);
  const proteinG = Math.round(macros.proteinG * share);
  const carbG = Math.round(macros.carbG * share);
  const fatG = Math.round(macros.fatG * share);
  // Rough fiber estimate: ~1.4 g per 100 kcal for plant-forward meals
  const fiberBoost = /vegan|vegetarian|lentil|bean|chickpea|tofu|salad|veg/i.test(`${meal.title} ${meal.desc}`) ? 1.7 : 1.2;
  const fiberG = Math.round((calories / 100) * fiberBoost);
  return { calories, proteinG, carbG, fatG, fiberG };
}

interface WhyEntry { match: RegExp; why: string; benefits: string[]; }

const WHY_BY_KEYWORD: WhyEntry[] = [
  { match: /oats|porridge/i, why: "Slow-release carbs to power your morning without a sugar crash.", benefits: ["Beta-glucan fibre supports heart & gut health", "Steady energy for 3–4 hours", "Banana adds potassium for muscle function"] },
  { match: /omelette|scramble/i, why: "Complete protein first thing keeps you fuller and protects lean mass.", benefits: ["~20 g high-quality protein", "Choline supports brain & memory", "Spinach adds iron and folate"] },
  { match: /avocado toast/i, why: "Healthy fats + fibre to stabilise blood sugar all morning.", benefits: ["Monounsaturated fats for heart health", "Omega-3s (from salmon) reduce inflammation", "Whole-grain fibre feeds gut microbiome"] },
  { match: /parfait|yogurt/i, why: "Probiotics + protein — a gut-friendly start that supports immunity.", benefits: ["Live cultures support digestion", "Berries deliver antioxidants", "Calcium for bones & teeth"] },
  { match: /pancakes/i, why: "Balanced pre-training fuel with protein baked into the batter.", benefits: ["Carbs top up glycogen for workouts", "Protein powder aids recovery", "Berries add vitamin C & polyphenols"] },
  { match: /burrito|wrap/i, why: "Portable balance of protein, carbs and fats — great mid-day fuel.", benefits: ["Sustained energy release", "Avocado provides potassium & healthy fats", "Fibre keeps you satisfied"] },
  { match: /cottage cheese|silken tofu fruit/i, why: "Slow-digesting protein that steadies appetite for hours.", benefits: ["Casein protein for prolonged amino acid supply", "Low in sugar, high in satiety", "Fruit adds micronutrients"] },
  { match: /smoothie/i, why: "Fast-absorbing nutrients — ideal post-workout or on busy mornings.", benefits: ["Quick glycogen replenishment", "Spinach adds nitrates for blood flow", "Protein kick-starts recovery"] },
  { match: /grain bowl/i, why: "The gold-standard build: lean protein, complex carbs, colourful veg.", benefits: ["Full amino-acid profile", "Fibre-rich for gut health", "Diverse micronutrients from mixed veg"] },
  { match: /stir-fry|stir fry/i, why: "Quick, low-oil cooking preserves vitamins in the vegetables.", benefits: ["High vegetable intake in one bowl", "Ginger & garlic have anti-inflammatory effects", "Lean protein for muscle repair"] },
  { match: /caesar|niçoise|nicoise|salad/i, why: "Cool, hydrating and loaded with leafy greens for micronutrient density.", benefits: ["Vitamin K & folate from greens", "Protein keeps a salad satiating", "Olive oil supports heart health"] },
  { match: /mezze|mediterranean/i, why: "Mediterranean pattern — repeatedly linked to longevity & heart health.", benefits: ["Olive oil & legumes for cardiovascular support", "High fibre from tabbouleh & pita", "Anti-inflammatory herbs and olives"] },
  { match: /soup/i, why: "Warming, hydrating and easy to digest — great on lower-appetite days.", benefits: ["High water content aids hydration", "Beans & corn add plant protein and fibre", "Lycopene from tomatoes supports skin"] },
  { match: /sweet potato|sheet-pan|tray bake|roast chicken|baked cod|sea bass|wellington|sunday/i, why: "One-tray comfort meal that hits protein, complex carbs and colourful veg.", benefits: ["Beta-carotene from sweet potato", "Cruciferous veg support detox pathways", "Roasting concentrates natural sweetness — less sauce needed"] },
  { match: /bolognese|spaghetti|pasta/i, why: "Classic comfort food built around lean protein and whole-grain carbs.", benefits: ["Whole-grain pasta = slower carb release", "Tomato sauce adds lycopene", "Lentils/beef supply iron for oxygen delivery"] },
  { match: /tacos/i, why: "Handheld balance of protein, healthy fats and fibre — fun and satisfying.", benefits: ["Avocado provides heart-healthy fats", "Lime & salsa add vitamin C", "Slaw delivers gut-friendly fibre"] },
  { match: /curry/i, why: "Spice-forward meal — turmeric and ginger are natural anti-inflammatories.", benefits: ["Curcumin supports joint & recovery", "Coconut milk provides medium-chain fats", "Chickpeas/protein for satiety"] },
  { match: /burger/i, why: "A smarter take on a classic — lean protein, whole-grain bun, baked fries.", benefits: ["Baked (not fried) fries cut saturated fat", "Sweet potato adds vitamin A", "Protein patty rebuilds muscle post-training"] },
  { match: /apple.*almond|banana.*peanut|nut butter/i, why: "Fibre + fat + a little natural sugar — beats an energy crash cleanly.", benefits: ["Nut butter provides magnesium & vitamin E", "Fruit fibre steadies blood sugar", "Simple to prep — no cooking needed"] },
  { match: /hummus/i, why: "Chickpeas + veg — plant protein and fibre in every dip.", benefits: ["Tahini adds calcium & healthy fats", "Raw veg supply crunchy micronutrients", "Low glycaemic — steady energy"] },
  { match: /trail mix|dark chocolate/i, why: "Portable energy with antioxidants — perfect for training days.", benefits: ["Nuts deliver healthy fats & magnesium", "Dark chocolate provides polyphenols", "Dried fruit for quick-access carbs"] },
  { match: /edamame/i, why: "Complete plant protein in a snack-sized package.", benefits: ["9 g protein per cup", "Isoflavones support hormonal balance", "Fibre for gut health"] },
  { match: /hard-boiled|eggs/i, why: "Nature's protein pod — cheap, portable and highly bioavailable.", benefits: ["Complete amino-acid profile", "Choline for brain function", "Fruit adds vitamin C"] },
  { match: /roasted chickpeas/i, why: "Crunchy plant protein alternative to chips — high fibre, no fry.", benefits: ["Slow-release carbs", "Plant protein & fibre", "Iron and folate from legumes"] },
];

const DEFAULT_WHY: WhyEntry = {
  match: /.*/,
  why: "Balanced mix of protein, carbs and fats to keep your energy and recovery on track.",
  benefits: ["Steady blood sugar", "Supports muscle recovery", "Provides key vitamins & minerals"],
};

export function getWhyItMatters(meal: MealIdea): { why: string; benefits: string[] } {
  const key = `${meal.title} ${meal.desc}`;
  const entry = WHY_BY_KEYWORD.find((e) => e.match.test(key)) ?? DEFAULT_WHY;
  return { why: entry.why, benefits: entry.benefits };
}


// Parse the meal description into a clean ingredient list.
function parseIngredients(desc: string): string[] {
  // Strip trailing period, split on commas, "and", "with", "&", "over"
  const cleaned = desc.replace(/\.$/, "").replace(/\s+&\s+/g, ", ").replace(/\s+with\s+/gi, ", ").replace(/\s+over\s+/gi, ", ").replace(/\s+and\s+/gi, ", ");
  return cleaned
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

export type MacroLevel = "high" | "moderate" | "low";
export interface MacroTag { label: string; level: MacroLevel; note: string; }

export function getMacroPresence(meal: MealIdea, nutrition: MealNutrition): MacroTag[] {
  const text = `${meal.title} ${meal.desc}`.toLowerCase();
  const kcal = Math.max(nutrition.calories, 1);
  const proteinPct = (nutrition.proteinG * 4) / kcal;
  const carbPct = (nutrition.carbG * 4) / kcal;

  const proteinLevel: MacroLevel = proteinPct >= 0.28 ? "high" : proteinPct >= 0.15 ? "moderate" : "low";
  const carbLevel: MacroLevel = carbPct >= 0.45 ? "high" : carbPct >= 0.25 ? "moderate" : "low";

  // Glucose = quickly digested sugars. Score by ingredient keywords.
  const highSugar = /honey|maple|granola|banana|berries|fruit|dried fruit|chocolate|salsa|apple|peach|raspberr|smoothie/;
  const lowSugar = /egg|tofu|chicken|beef|fish|salmon|tuna|cod|shrimp|prawn|turkey|halloumi|feta|cottage|hummus|lentil|chickpea|bean|edamame|nut|seed/;
  const hasHighSugar = highSugar.test(text);
  const hasLowSugar = lowSugar.test(text);
  const glucoseLevel: MacroLevel = hasHighSugar && !hasLowSugar ? "high" : hasHighSugar ? "moderate" : "low";

  return [
    {
      label: "Protein",
      level: proteinLevel,
      note: `${nutrition.proteinG} g · ${proteinLevel === "high" ? "great for muscle repair" : proteinLevel === "moderate" ? "solid protein hit" : "light on protein"}`,
    },
    {
      label: "Carbs",
      level: carbLevel,
      note: `${nutrition.carbG} g · ${carbLevel === "high" ? "big energy source" : carbLevel === "moderate" ? "steady fuel" : "low-carb meal"}`,
    },
    {
      label: "Glucose",
      level: glucoseLevel,
      note: glucoseLevel === "high"
        ? "quick sugars — expect a faster blood-sugar rise"
        : glucoseLevel === "moderate"
          ? "some natural sugars, buffered by protein & fibre"
          : "minimal added sugar — very steady glucose",
    },
  ];
}

interface Template { match: RegExp; time: number; steps: (ing: string[]) => string[]; }

const TEMPLATES: Template[] = [
  { match: /oats|porridge/i, time: 10, steps: () => [
    "Bring 250 ml milk (or water) to a gentle simmer in a small pot.",
    "Stir in ½ cup rolled oats and cook 5 min, stirring, until creamy.",
    "Pour into a bowl and top with sliced banana, chia seeds and a spoon of almond butter.",
    "Finish with a light drizzle of honey or maple syrup and serve warm.",
  ]},
  { match: /omelette/i, time: 12, steps: () => [
    "Whisk 3 eggs with a pinch of salt and pepper.",
    "Sauté chopped spinach and peppers in a non-stick pan with a little olive oil for 2 min.",
    "Pour the eggs in, tilt to spread, and cook on low for 2–3 min until almost set.",
    "Crumble feta on one half, fold, and slide onto rye toast.",
  ]},
  { match: /avocado toast|avocado.*toast/i, time: 8, steps: () => [
    "Toast 2 slices of sourdough until deeply golden.",
    "Mash ½ ripe avocado with lemon juice, salt and chili flakes.",
    "Spread on toast; top with smoked salmon (or tofu) and capers.",
    "Finish with a squeeze of lemon and cracked pepper.",
  ]},
  { match: /tofu scramble/i, time: 12, steps: () => [
    "Crumble 200 g firm tofu into a hot oiled pan.",
    "Add ½ tsp turmeric, salt, pepper and a splash of plant milk; stir 4 min.",
    "Toss in spinach and diced tomato until wilted.",
    "Serve over toasted sourdough.",
  ]},
  { match: /parfait/i, time: 5, steps: (ing) => [
    "Spoon a third of the yogurt into a glass.",
    "Layer with granola and mixed berries.",
    "Repeat the layers, finishing with berries on top.",
    "Drizzle with honey (or maple) and scatter walnuts. Serve immediately.",
  ]},
  { match: /pancakes/i, time: 20, steps: () => [
    "Mash 1 ripe banana in a bowl; whisk in 1 egg (or 1 tbsp flax + 3 tbsp water).",
    "Stir in ½ cup oats, 1 scoop protein powder and a splash of milk to loosen.",
    "Cook small pancakes in a lightly oiled non-stick pan, 2 min each side.",
    "Stack, top with berries and a spoon of nut butter.",
  ]},
  { match: /burrito|wrap/i, time: 15, steps: (ing) => [
    "Warm a whole-wheat tortilla in a dry pan for 20 sec each side.",
    "Layer the filling down the middle: protein first, then vegetables and sauce.",
    "Top with avocado, a spoon of salsa (and cheese if using).",
    "Fold in the sides, roll tightly, and slice in half.",
  ]},
  { match: /cottage cheese/i, time: 5, steps: () => [
    "Spoon 200 g cottage cheese into a bowl.",
    "Top with sliced peach (or raspberries) and pumpkin seeds.",
    "Drizzle honey (or maple) over the top.",
    "Serve chilled.",
  ]},
  { match: /silken tofu fruit/i, time: 5, steps: () => [
    "Blend 200 g silken tofu with a splash of plant milk until smooth.",
    "Pour into a bowl and top with peach slices and pumpkin seeds.",
    "Drizzle with maple syrup.",
    "Serve immediately.",
  ]},
  { match: /smoothie/i, time: 5, steps: () => [
    "Add banana, mixed berries, a handful of spinach, 1 scoop protein and 200 ml oat milk to a blender.",
    "Blend until thick and smooth (add a splash more milk if needed).",
    "Pour into a bowl and top with granola.",
    "Eat with a spoon straight away.",
  ]},
  { match: /grain bowl/i, time: 25, steps: (ing) => [
    "Cook ½ cup quinoa in 1 cup water for 12 min; fluff and set aside.",
    "Roast chopped vegetables at 200°C / 400°F for 20 min with olive oil, salt, pepper.",
    "Cook or sear the protein separately until just done.",
    "Assemble: quinoa base, greens, roasted veg, protein; drizzle with tahini-lemon dressing.",
  ]},
  { match: /stir-fry|stir fry/i, time: 20, steps: (ing) => [
    "Cook noodles or rice according to the pack; drain and set aside.",
    "Heat 1 tbsp oil in a wok; sear the protein for 3–4 min and remove.",
    "Stir-fry broccoli, peppers, garlic and ginger for 3 min on high heat.",
    "Return the protein, add 2 tbsp soy sauce, toss with the noodles/rice and finish with sesame seeds.",
  ]},
  { match: /caesar/i, time: 15, steps: () => [
    "Chop romaine and place in a large bowl.",
    "Toss with 2 tbsp light Caesar dressing until leaves are lightly coated.",
    "Top with the cooked protein (or roasted chickpeas), croutons and shaved parmesan.",
    "Finish with cracked black pepper and a squeeze of lemon.",
  ]},
  { match: /niçoise|nicoise/i, time: 20, steps: () => [
    "Boil 1 egg for 8 min; cool, peel and halve.",
    "Blanch green beans for 3 min; refresh in cold water.",
    "Arrange greens on a plate with tuna, egg, olives and green beans.",
    "Dress with olive oil, red wine vinegar, mustard, salt and pepper.",
  ]},
  { match: /mezze|mediterranean/i, time: 20, steps: (ing) => [
    "Warm the pita in a dry pan or oven for 2 min.",
    "Cook the protein (or fry falafel) until golden and heated through.",
    "Arrange hummus, tabbouleh, olives and cucumber salad on a plate.",
    "Add the protein and pita alongside; drizzle everything with olive oil.",
  ]},
  { match: /tortilla soup|soup/i, time: 25, steps: () => [
    "Sauté onion and garlic in a pot with olive oil for 3 min.",
    "Add 1 tsp chili powder, a can of chopped tomatoes and 500 ml stock; simmer 10 min.",
    "Stir in the protein, beans and corn; simmer 5 min more.",
    "Ladle into bowls; top with avocado, lime and crushed tortilla chips.",
  ]},
  { match: /sweet potato|roast|baked cod|sheet-pan|tray bake/i, time: 40, steps: (ing) => [
    "Preheat the oven to 200°C / 400°F.",
    "Chop sweet potato and broccoli; toss with olive oil, salt and pepper on a tray.",
    "Roast 20 min, then add the protein to the same tray and roast a further 15 min.",
    "Rest 2 min, plate up and finish with a squeeze of lemon.",
  ]},
  { match: /bolognese|spaghetti|pasta/i, time: 30, steps: () => [
    "Boil whole-wheat spaghetti in salted water until al dente; drain.",
    "Sauté onion, carrot and garlic in olive oil for 5 min.",
    "Add the protein (beef, lentils or tuna) and brown for 3 min.",
    "Pour in a can of chopped tomatoes, simmer 10 min, season, and toss with the pasta.",
  ]},
  { match: /tacos/i, time: 20, steps: (ing) => [
    "Warm soft tortillas in a dry pan for 20 sec each side.",
    "Cook the protein in a hot pan with 1 tsp cumin, paprika, salt and lime juice.",
    "Shred cabbage into a slaw with lime juice and a pinch of salt.",
    "Fill tortillas with protein, slaw, avocado slices and salsa.",
  ]},
  { match: /curry/i, time: 30, steps: (ing) => [
    "Cook basmati rice according to the pack.",
    "Sauté onion, garlic and ginger in oil for 3 min; add 2 tbsp curry paste and cook 1 min.",
    "Add chopped tomatoes and 200 ml coconut milk; simmer 5 min.",
    "Stir in the protein and spinach; simmer 8 min more and serve over rice.",
  ]},
  { match: /burger/i, time: 25, steps: (ing) => [
    "Preheat oven to 220°C / 425°F; toss sweet-potato fries with oil and bake 25 min.",
    "Shape the patty (beef, black bean, salmon or halloumi) and season well.",
    "Pan-fry the patty 3–4 min per side until cooked through.",
    "Toast the bun, layer with patty, salad leaves and sauce; serve with the fries.",
  ]},
  { match: /wellington|sunday|roast chicken|sea bass/i, time: 60, steps: (ing) => [
    "Preheat oven to 200°C / 400°F.",
    "Season the main (chicken, fish or Wellington) and roast per weight until cooked through.",
    "Boil potatoes 10 min, then roast 25 min with the carrots in olive oil.",
    "Steam greens 3 min; carve and plate with a light gravy or lemon-caper sauce.",
  ]},
  { match: /apple.*almond|banana.*peanut|nut butter/i, time: 2, steps: () => [
    "Slice the fruit into wedges.",
    "Serve alongside a tablespoon of nut butter for dipping.",
  ]},
  { match: /yogurt/i, time: 3, steps: () => [
    "Spoon the yogurt into a small bowl.",
    "Drizzle with honey or maple syrup.",
    "Scatter walnuts on top and eat immediately.",
  ]},
  { match: /hummus/i, time: 5, steps: () => [
    "Cut carrot, cucumber and peppers into sticks.",
    "Spoon hummus into a small bowl.",
    "Serve the veg sticks alongside for dipping.",
  ]},
  { match: /trail mix|dark chocolate/i, time: 1, steps: () => [
    "Combine mixed nuts and dried fruit in a small bowl.",
    "Add two squares of 70% dark chocolate on the side.",
  ]},
  { match: /edamame/i, time: 5, steps: () => [
    "Steam edamame pods for 4 min until bright green.",
    "Drain and sprinkle generously with flaky sea salt.",
    "Pop the beans out of the pods as you eat.",
  ]},
  { match: /hard-boiled|eggs/i, time: 10, steps: () => [
    "Lower 2 eggs into boiling water and cook for 8 min.",
    "Transfer to iced water for 2 min, then peel.",
    "Season with salt and pepper; serve with a piece of fruit.",
  ]},
  { match: /roasted chickpeas/i, time: 25, steps: () => [
    "Drain and dry a can of chickpeas thoroughly.",
    "Toss with 1 tbsp olive oil, salt and paprika.",
    "Roast at 200°C / 400°F for 22 min, shaking halfway, until crisp.",
    "Cool 2 min and serve with fresh fruit on the side.",
  ]},
];

const GENERIC: Template["steps"] = (ing) => [
  "Prep all ingredients: wash, chop and measure before you start.",
  ing.length > 1 ? `Cook the main components (${ing.slice(0, 2).join(", ")}) until just done.` : "Cook the main component until just done.",
  "Combine everything in a bowl or on a plate, seasoning to taste.",
  "Finish with a drizzle of olive oil, a squeeze of lemon and fresh herbs.",
];

export function getRecipe(meal: MealIdea): Recipe {
  const ingredients = parseIngredients(meal.desc);
  const key = `${meal.title} ${meal.desc}`;
  const template = TEMPLATES.find((t) => t.match.test(key));
  const steps = template ? template.steps(ingredients) : GENERIC(ingredients);
  const timeMin = template?.time ?? 15;
  return { ingredients, steps, timeMin, servings: 1 };
}
