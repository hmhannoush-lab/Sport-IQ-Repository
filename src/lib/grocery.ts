import type { Profile } from "./store";
import { getWeekMealPlan } from "./health";
import { getRecipe } from "./recipes";
import { substituteForAllergies, hasAllergenConflict } from "./allergies";

export interface GroceryItem {
  /** Canonical shopping name, e.g. "Rolled oats" */
  name: string;
  /** Aggregated quantity, e.g. 240 */
  qty: number;
  /** Unit, e.g. "g", "ml", "pcs", "tbsp", "portion" */
  unit: string;
  /** Which meals it comes from, e.g. ["Breakfast · Today"] */
  usedIn: string[];
  /** Original (unsafe) ingredient this replaced, if a swap happened. */
  swappedFrom?: string;
  category: string;
}

export interface GroceryList {
  days: number;
  categories: { name: string; items: GroceryItem[] }[];
  swaps: { from: string; to: string }[];
  flagged: string[];
  totalItems: number;
}

interface Rule {
  match: RegExp;
  name: string;
  /** amount per single serving */
  per: number;
  unit: string;
  category: string;
}

const CATEGORIES = [
  "Produce",
  "Protein & fish",
  "Dairy & alternatives",
  "Grains & bakery",
  "Pantry & spices",
  "Nuts, seeds & snacks",
  "Other",
];

/** Per-serving quantities for the ingredients that appear in the meal plan. */
const RULES: Rule[] = [
  // Grains & bakery
  { match: /gluten-free oats|certified gluten-free oats|rolled oats|\boats?\b|porridge/i, name: "Oats", per: 60, unit: "g", category: "Grains & bakery" },
  { match: /gluten-free granola|granola/i, name: "Granola", per: 40, unit: "g", category: "Grains & bakery" },
  { match: /quinoa/i, name: "Quinoa", per: 70, unit: "g (dry)", category: "Grains & bakery" },
  { match: /basmati rice|brown rice|\brice\b/i, name: "Rice", per: 75, unit: "g (dry)", category: "Grains & bakery" },
  { match: /gluten-free spaghetti|whole-wheat spaghetti|spaghetti|gluten-free pasta|\bpasta\b/i, name: "Pasta / spaghetti", per: 90, unit: "g (dry)", category: "Grains & bakery" },
  { match: /buckwheat.*noodles|soba noodles|noodles/i, name: "Noodles", per: 90, unit: "g (dry)", category: "Grains & bakery" },
  { match: /corn tortilla|soft tortillas?|tortillas?/i, name: "Tortillas", per: 3, unit: "pcs", category: "Grains & bakery" },
  { match: /gluten-free wrap|whole-wheat wrap|\bwrap\b/i, name: "Wraps", per: 1, unit: "pcs", category: "Grains & bakery" },
  { match: /gluten-free flatbread|\bpita\b/i, name: "Pita / flatbread", per: 2, unit: "pcs", category: "Grains & bakery" },
  { match: /gluten-free bun|whole-wheat bun|\bbun\b/i, name: "Burger buns", per: 1, unit: "pcs", category: "Grains & bakery" },
  { match: /gluten-free (sourdough|toast|bread)|sourdough|rye toast|\btoast\b|\bbread\b/i, name: "Bread", per: 2, unit: "slices", category: "Grains & bakery" },
  { match: /croutons/i, name: "Croutons", per: 20, unit: "g", category: "Grains & bakery" },
  { match: /tortilla chips/i, name: "Tortilla chips", per: 20, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /pancakes/i, name: "Pancake mix / flour", per: 60, unit: "g", category: "Grains & bakery" },
  { match: /chickpea flour|chickpea-flour/i, name: "Chickpea flour", per: 60, unit: "g", category: "Pantry & spices" },

  // Protein & fish
  { match: /chicken breast|grilled chicken|roast chicken|\bchicken\b/i, name: "Chicken breast", per: 150, unit: "g", category: "Protein & fish" },
  { match: /\bturkey\b/i, name: "Turkey", per: 150, unit: "g", category: "Protein & fish" },
  { match: /lean beef|\bbeef\b|steak|patty|burger/i, name: "Lean beef mince / steak", per: 150, unit: "g", category: "Protein & fish" },
  { match: /smoked salmon|\bsalmon\b/i, name: "Salmon fillet", per: 140, unit: "g", category: "Protein & fish" },
  { match: /sea bass|\bcod\b|white fish|\bfish\b/i, name: "White fish fillet", per: 150, unit: "g", category: "Protein & fish" },
  { match: /\btuna\b/i, name: "Tuna", per: 1, unit: "can", category: "Protein & fish" },
  { match: /shrimp|prawns?/i, name: "Prawns", per: 140, unit: "g", category: "Protein & fish" },
  { match: /silken tofu|firm tofu|tofu scramble|\btofu\b/i, name: "Tofu", per: 150, unit: "g", category: "Protein & fish" },
  { match: /\btempeh\b/i, name: "Tempeh", per: 120, unit: "g", category: "Protein & fish" },
  { match: /roasted chickpeas|chickpeas?/i, name: "Chickpeas", per: 1, unit: "can", category: "Pantry & spices" },
  { match: /black beans|\bbeans?\b(?! sprouts)/i, name: "Beans", per: 1, unit: "can", category: "Pantry & spices" },
  { match: /\blentils?\b/i, name: "Lentils", per: 80, unit: "g (dry)", category: "Pantry & spices" },
  { match: /\beggs?\b|omelette|hard-boiled/i, name: "Eggs", per: 2, unit: "pcs", category: "Protein & fish" },
  { match: /edamame/i, name: "Edamame", per: 100, unit: "g", category: "Produce" },
  { match: /falafel/i, name: "Falafel", per: 4, unit: "pcs", category: "Protein & fish" },

  // Dairy & alternatives
  { match: /coconut yogurt|greek yogurt|soy yogurt|\byogurt\b/i, name: "Yogurt", per: 170, unit: "g", category: "Dairy & alternatives" },
  { match: /cottage cheese/i, name: "Cottage cheese", per: 150, unit: "g", category: "Dairy & alternatives" },
  { match: /halloumi/i, name: "Halloumi", per: 100, unit: "g", category: "Dairy & alternatives" },
  { match: /\bfeta\b|marinated tofu/i, name: "Feta", per: 50, unit: "g", category: "Dairy & alternatives" },
  { match: /parmesan|nutritional yeast/i, name: "Parmesan / nutritional yeast", per: 15, unit: "g", category: "Dairy & alternatives" },
  { match: /dairy-free cheese|cashew cheese|\bcheese\b/i, name: "Cheese", per: 40, unit: "g", category: "Dairy & alternatives" },
  { match: /oat milk|soy milk|almond milk|\bmilk\b/i, name: "Milk (or plant milk)", per: 200, unit: "ml", category: "Dairy & alternatives" },
  { match: /pea protein|protein powder|\bwhey\b/i, name: "Protein powder", per: 30, unit: "g", category: "Pantry & spices" },

  // Produce
  { match: /bananas?/i, name: "Banana", per: 1, unit: "pcs", category: "Produce" },
  { match: /\bapples?\b/i, name: "Apple", per: 1, unit: "pcs", category: "Produce" },
  { match: /berries|raspberr|blueberr|strawberr/i, name: "Mixed berries", per: 80, unit: "g", category: "Produce" },
  { match: /\bpeach|\bmango|\bfruit\b/i, name: "Fresh fruit", per: 1, unit: "pcs", category: "Produce" },
  { match: /avocado/i, name: "Avocado", per: 1, unit: "pcs", category: "Produce" },
  { match: /spinach/i, name: "Spinach", per: 80, unit: "g", category: "Produce" },
  { match: /romaine|salad leaves|mixed greens|\bgreens\b|\bsalad\b/i, name: "Salad leaves", per: 80, unit: "g", category: "Produce" },
  { match: /broccoli/i, name: "Broccoli", per: 150, unit: "g", category: "Produce" },
  { match: /sweet potato/i, name: "Sweet potato", per: 250, unit: "g", category: "Produce" },
  { match: /potatoes?/i, name: "Potatoes", per: 250, unit: "g", category: "Produce" },
  { match: /carrots?/i, name: "Carrots", per: 100, unit: "g", category: "Produce" },
  { match: /peppers?|capsicum/i, name: "Bell peppers", per: 1, unit: "pcs", category: "Produce" },
  { match: /cucumber/i, name: "Cucumber", per: 0.5, unit: "pcs", category: "Produce" },
  { match: /tomato(es)?|salsa/i, name: "Tomatoes", per: 150, unit: "g", category: "Produce" },
  { match: /cabbage|slaw/i, name: "Cabbage (for slaw)", per: 100, unit: "g", category: "Produce" },
  { match: /green beans/i, name: "Green beans", per: 100, unit: "g", category: "Produce" },
  { match: /\bonion/i, name: "Onion", per: 1, unit: "pcs", category: "Produce" },
  { match: /\bgarlic\b/i, name: "Garlic", per: 2, unit: "cloves", category: "Produce" },
  { match: /\bginger\b/i, name: "Ginger", per: 10, unit: "g", category: "Produce" },
  { match: /\blime\b/i, name: "Lime", per: 1, unit: "pcs", category: "Produce" },
  { match: /\blemon\b/i, name: "Lemon", per: 1, unit: "pcs", category: "Produce" },
  { match: /\bveg(etables)?\b|mixed veg|roasted veg/i, name: "Mixed vegetables", per: 200, unit: "g", category: "Produce" },
  { match: /\bherbs?\b|parsley|tabbouleh/i, name: "Fresh herbs", per: 1, unit: "bunch", category: "Produce" },
  { match: /\bolives\b/i, name: "Olives", per: 40, unit: "g", category: "Pantry & spices" },

  // Nuts, seeds & snacks
  { match: /sunflower seed butter|almond butter|peanut butter|nut butter|seed butter/i, name: "Nut / seed butter", per: 20, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /mixed nuts|walnuts|almonds|pumpkin seeds|mixed seeds|\bnuts\b|\bseeds\b/i, name: "Nuts / seeds", per: 30, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /\bchia\b/i, name: "Chia seeds", per: 10, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /dark chocolate/i, name: "Dark chocolate (70%)", per: 20, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /dried fruit|trail mix|raisins/i, name: "Dried fruit", per: 30, unit: "g", category: "Nuts, seeds & snacks" },
  { match: /tahini-free hummus|hummus/i, name: "Hummus", per: 80, unit: "g", category: "Nuts, seeds & snacks" },

  // Pantry & spices
  { match: /\btahini\b/i, name: "Tahini", per: 15, unit: "g", category: "Pantry & spices" },
  { match: /olive oil|\boil\b/i, name: "Olive oil", per: 15, unit: "ml", category: "Pantry & spices" },
  { match: /coconut milk/i, name: "Coconut milk", per: 200, unit: "ml", category: "Pantry & spices" },
  { match: /curry paste|curry/i, name: "Curry paste", per: 30, unit: "g", category: "Pantry & spices" },
  { match: /tamari|coconut aminos|soy sauce|\bsoy\b/i, name: "Soy sauce / tamari", per: 15, unit: "ml", category: "Pantry & spices" },
  { match: /caesar dressing|caesar|dressing|vinaigrette/i, name: "Dressing", per: 30, unit: "ml", category: "Pantry & spices" },
  { match: /\bhoney\b|maple/i, name: "Honey / maple syrup", per: 15, unit: "ml", category: "Pantry & spices" },
  { match: /\bstock\b|\bbroth\b/i, name: "Stock", per: 500, unit: "ml", category: "Pantry & spices" },
  { match: /paprika|cumin|chili|spice|pepper\b|\bsalt\b/i, name: "Spices (cumin, paprika, chili)", per: 1, unit: "tsp", category: "Pantry & spices" },
];

function classify(raw: string): Rule | null {
  return RULES.find((r) => r.match.test(raw)) ?? null;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Build an aggregated, allergy-safe grocery list from the user's meal plan.
 * `days` = 1 for today only, 7 for the whole week.
 */
export function buildGroceryList(profile: Profile, allergies: string[] = [], days = 1): GroceryList {
  const safeWeek = getWeekMealPlan(profile, allergies).slice(0, days);
  const rawWeek = getWeekMealPlan(profile, []).slice(0, days);

  const items = new Map<string, GroceryItem>();
  const swaps = new Map<string, string>();
  const flagged = new Set<string>();

  safeWeek.forEach((day, dayIndex) => {
    day.meals.forEach((meal, mealIndex) => {
      const safeIngredients = getRecipe(meal).ingredients.map((i) => substituteForAllergies(i, allergies));
      const rawIngredients = getRecipe(rawWeek[dayIndex].meals[mealIndex]).ingredients;
      const label = `${meal.meal} · ${day.dayLabel}`;

      safeIngredients.forEach((ing, i) => {
        const rule = classify(ing);
        const original = rawIngredients[i];
        const isSwap = original && original.toLowerCase() !== ing.toLowerCase();
        if (isSwap) swaps.set(original, ing);
        if (hasAllergenConflict(ing, allergies)) flagged.add(ing);

        const name = rule?.name ?? ing;
        const key = name.toLowerCase();
        const existing = items.get(key);
        if (existing) {
          existing.qty = round(existing.qty + (rule?.per ?? 1));
          if (!existing.usedIn.includes(label)) existing.usedIn.push(label);
          if (isSwap && !existing.swappedFrom) existing.swappedFrom = original;
        } else {
          items.set(key, {
            name,
            qty: round(rule?.per ?? 1),
            unit: rule?.unit ?? "portion",
            usedIn: [label],
            swappedFrom: isSwap ? original : undefined,
            category: rule?.category ?? "Other",
          });
        }
      });
    });
  });

  const all = [...items.values()];
  const categories = CATEGORIES.map((name) => ({
    name,
    items: all.filter((i) => i.category === name).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((c) => c.items.length > 0);

  return {
    days,
    categories,
    swaps: [...swaps.entries()].map(([from, to]) => ({ from, to })),
    flagged: [...flagged],
    totalItems: all.length,
  };
}

export function groceryListToText(list: GroceryList, allergyLabels: string[] = []): string {
  const lines: string[] = [];
  lines.push(`Grocery list — ${list.days === 1 ? "today" : `${list.days} days`}`);
  if (allergyLabels.length) lines.push(`Allergy-safe: no ${allergyLabels.join(", ")}`);
  lines.push("");
  for (const cat of list.categories) {
    lines.push(cat.name.toUpperCase());
    for (const item of cat.items) {
      const swap = item.swappedFrom ? `  (instead of ${item.swappedFrom})` : "";
      lines.push(`  [ ] ${item.name} — ${item.qty} ${item.unit}${swap}`);
    }
    lines.push("");
  }
  if (list.swaps.length) {
    lines.push("SUBSTITUTIONS");
    for (const s of list.swaps) lines.push(`  ${s.from} -> ${s.to}`);
  }
  return lines.join("\n");
}
