/**
 * Food allergy / intolerance handling.
 * Selected at onboarding and applied across the whole diet plan
 * (meal titles, descriptions, recipe ingredients and steps).
 */

export interface AllergenInfo {
  id: string;
  label: string;
  emoji: string;
  /** Ordered [pattern, replacement] pairs used to swap unsafe foods for safe ones. */
  swaps: [RegExp, string][];
  /** Short guidance shown in the diet tips. */
  tip: string;
}

export const ALLERGENS: AllergenInfo[] = [
  {
    id: "gluten",
    label: "Gluten",
    emoji: "🌾",
    tip: "Gluten-free: oats are swapped for certified GF oats, and breads/pasta/wraps for GF versions. Always check labels on sauces (soy sauce, stock cubes).",
    swaps: [
      [/whole-wheat spaghetti/gi, "gluten-free spaghetti"],
      [/whole-wheat tortilla/gi, "corn tortilla"],
      [/whole-wheat wrap/gi, "gluten-free wrap"],
      [/whole-wheat bun/gi, "gluten-free bun"],
      [/soba noodles/gi, "100% buckwheat (GF) noodles"],
      [/sourdough/gi, "gluten-free sourdough"],
      [/rye toast/gi, "gluten-free toast"],
      [/\bpita\b/gi, "gluten-free flatbread"],
      [/croutons/gi, "toasted GF croutons"],
      [/granola/gi, "gluten-free granola"],
      [/rolled oats/gi, "certified gluten-free oats"],
      [/\boats?\b/gi, "gluten-free oats"],
      [/\bsoy\b(?! (milk|yogurt))/gi, "tamari (GF soy sauce)"],
      [/\btoast\b/gi, "gluten-free toast"],
      [/\bbread\b/gi, "gluten-free bread"],
      [/\bpasta\b/gi, "gluten-free pasta"],
      [/Wellington/gi, "gluten-free Wellington"],
    ],
  },
  {
    id: "dairy",
    label: "Dairy / lactose",
    emoji: "🥛",
    tip: "Dairy-free: yogurt, milk and cheese are swapped for plant versions. Add a calcium-fortified drink and check vitamin D intake.",
    swaps: [
      [/Greek yogurt/gi, "coconut yogurt"],
      [/Cottage cheese/gi, "silken tofu"],
      [/cottage cheese/gi, "silken tofu"],
      [/cashew cheese/gi, "cashew cheese"],
      [/halloumi/gi, "grilled firm tofu"],
      [/Halloumi/g, "Grilled firm tofu"],
      [/parmesan/gi, "nutritional yeast"],
      [/\bfeta\b/gi, "marinated tofu"],
      [/\bwhey\b/gi, "pea protein"],
      [/\bbutter\b(?! )/gi, "olive oil"],
      [/almond butter/gi, "almond butter"],
      [/peanut butter/gi, "peanut butter"],
      [/\bmilk\b/gi, "oat milk"],
      [/\byogurt\b/gi, "coconut yogurt"],
      [/\bcheese\b/gi, "dairy-free cheese"],
      [/light Caesar/gi, "dairy-free Caesar"],
    ],
  },
  {
    id: "eggs",
    label: "Eggs",
    emoji: "🥚",
    tip: "Egg-free: eggs are replaced with tofu or chickpea-flour alternatives — keep protein up with legumes, fish or dairy.",
    swaps: [
      [/3-egg omelette/gi, "chickpea-flour omelette"],
      [/Veggie omelette/gi, "Veggie chickpea omelette"],
      [/Hard-boiled eggs/gi, "Roasted chickpeas"],
      [/Two eggs/gi, "A handful of roasted chickpeas"],
      [/banana-egg/gi, "banana-flax"],
      [/with eggs/gi, "with scrambled tofu"],
      [/\beggs?\b/gi, "tofu scramble"],
    ],
  },
  {
    id: "nuts",
    label: "Tree nuts",
    emoji: "🌰",
    tip: "Nut-free: nuts and nut butters are swapped for seeds (pumpkin, sunflower) and seed butters — same healthy fats, no risk.",
    swaps: [
      [/almond butter/gi, "sunflower seed butter"],
      [/cashew cheese/gi, "sunflower-seed cheese"],
      [/cashew dressing/gi, "tahini dressing"],
      [/\bwalnuts\b/gi, "pumpkin seeds"],
      [/Mixed nuts/gi, "Mixed seeds"],
      [/mixed nuts/gi, "mixed seeds"],
      [/Trail mix/gi, "Seed mix"],
      [/\bnuts\b/gi, "seeds"],
      [/\balmonds?\b/gi, "sunflower seeds"],
    ],
  },
  {
    id: "peanuts",
    label: "Peanuts",
    emoji: "🥜",
    tip: "Peanut-free: peanut butter is swapped for sunflower seed butter. Watch out for peanut oil in Asian-style dishes.",
    swaps: [
      [/natural peanut butter/gi, "natural sunflower seed butter"],
      [/peanut butter/gi, "sunflower seed butter"],
      [/\bpeanuts?\b/gi, "sunflower seeds"],
    ],
  },
  {
    id: "soy",
    label: "Soy",
    emoji: "🫘",
    tip: "Soy-free: tofu/tempeh/soy sauce are replaced with legumes and coconut aminos. Check protein powders for soy isolate.",
    swaps: [
      [/silken tofu/gi, "thick coconut yogurt"],
      [/Silken tofu/g, "Coconut yogurt"],
      [/firm tofu/gi, "seasoned chickpeas"],
      [/Tofu scramble/g, "Chickpea scramble"],
      [/tofu scramble/gi, "chickpea scramble"],
      [/\btofu\b/gi, "chickpeas"],
      [/\btempeh\b/gi, "seasoned chickpeas"],
      [/\bedamame\b/gi, "green peas"],
      [/soy yogurt/gi, "coconut yogurt"],
      [/soy milk/gi, "oat milk"],
      [/\bsoy\b/gi, "coconut aminos"],
    ],
  },
  {
    id: "fish",
    label: "Fish",
    emoji: "🐟",
    tip: "Fish-free: fish dishes are swapped for chicken or plant proteins. Consider algae-based omega-3 to keep EPA/DHA up.",
    swaps: [
      [/Smoked salmon/gi, "Grilled chicken"],
      [/smoked salmon/gi, "grilled chicken"],
      [/\bsalmon\b/gi, "chicken"],
      [/Salmon/g, "Chicken"],
      [/sea bass/gi, "chicken breast"],
      [/Sea bass/g, "Chicken breast"],
      [/\btuna\b/gi, "chickpeas"],
      [/Tuna/g, "Chickpea"],
      [/\bcod\b/gi, "chicken"],
      [/Cod/g, "Chicken"],
      [/White fish/gi, "Chicken"],
      [/\bfish\b/gi, "chicken"],
      [/Niçoise/gi, "garden"],
    ],
  },
  {
    id: "shellfish",
    label: "Shellfish",
    emoji: "🦐",
    tip: "Shellfish-free: prawns and shrimp are replaced with chicken or white fish — avoid shared fryers when eating out.",
    swaps: [
      [/\bshrimp\b/gi, "chicken"],
      [/Shrimp/g, "Chicken"],
      [/\bprawns?\b/gi, "chicken"],
      [/Prawn/g, "Chicken"],
    ],
  },
  {
    id: "sesame",
    label: "Sesame",
    emoji: "🫓",
    tip: "Sesame-free: tahini and sesame oil are swapped for olive-oil-based dressings. Hummus is made without tahini.",
    swaps: [
      [/tahini-lemon dressing/gi, "olive-oil-lemon dressing"],
      [/tahini-lemon/gi, "olive-oil-lemon"],
      [/tahini drizzle/gi, "olive oil drizzle"],
      [/\btahini\b/gi, "olive oil"],
      [/\bsesame\b/gi, "sunflower seeds"],
      [/classic hummus/gi, "tahini-free hummus"],
      [/\bhummus\b/gi, "tahini-free hummus"],
    ],
  },
];

export const ALLERGEN_MAP = new Map(ALLERGENS.map((a) => [a.id, a]));

/** Apply every selected allergen's swaps to a piece of menu text. */
export function substituteForAllergies(text: string, allergies: string[] = []): string {
  if (!allergies.length || !text) return text;
  let out = text;
  for (const id of allergies) {
    const info = ALLERGEN_MAP.get(id);
    if (!info) continue;
    for (const [pattern, replacement] of info.swaps) {
      out = out.replace(pattern, replacement);
    }
  }
  return out;
}

/** Does the text still mention something the user is allergic to? */
export function hasAllergenConflict(text: string, allergies: string[] = []): boolean {
  return allergies.some((id) => {
    const info = ALLERGEN_MAP.get(id);
    if (!info) return false;
    return info.swaps.some(([pattern]) => {
      const re = new RegExp(pattern.source, pattern.flags.replace("g", ""));
      return re.test(text);
    });
  });
}

export function allergenLabels(allergies: string[] = []): string[] {
  return allergies.map((id) => ALLERGEN_MAP.get(id)?.label ?? id).filter(Boolean);
}
