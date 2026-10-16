/**
 * Credible, subject-matched sources used across the app.
 *
 * Rules for anything added here:
 *  - Peer-reviewed journals, systematic reviews/meta-analyses, or official
 *    public-health / professional-body guidance only.
 *  - Nutrition claims cite nutrition or sports-nutrition bodies.
 *  - Training claims cite sports medicine / strength & conditioning bodies.
 *  - Every entry must have a working, stable public URL (DOI where possible).
 */

export interface Source {
  /** Short label shown inline. */
  label: string;
  /** Full citation. */
  citation: string;
  url: string;
}

/* ---------------------------------------------------------------- */
/* Nutrition                                                         */
/* ---------------------------------------------------------------- */

export const NUTRITION_SOURCES = {
  dietaryGuidelines: {
    label: "Dietary Guidelines for Americans",
    citation:
      "U.S. Departments of Agriculture & Health and Human Services (2020). Dietary Guidelines for Americans, 2020–2025 (9th ed.).",
    url: "https://www.dietaryguidelines.gov/",
  },
  whoHealthyDiet: {
    label: "WHO — Healthy diet",
    citation: "World Health Organization (2020). Healthy diet — fact sheet.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  },
  issnProtein: {
    label: "ISSN protein position stand",
    citation:
      "Jäger, R. et al. (2017). International Society of Sports Nutrition Position Stand: Protein and exercise. J Int Soc Sports Nutr, 14:20.",
    url: "https://doi.org/10.1186/s12970-017-0177-8",
  },
  acsmNutrition: {
    label: "ACSM/AND/DC joint position",
    citation:
      "Thomas, D.T., Erdman, K.A. & Burke, L.M. (2016). Nutrition and Athletic Performance — Joint Position Statement (ACSM, AND, Dietitians of Canada). Med Sci Sports Exerc, 48(3):543–568.",
    url: "https://doi.org/10.1249/MSS.0000000000000852",
  },
  carbsForTraining: {
    label: "Carbohydrates for training",
    citation:
      "Burke, L.M., Hawley, J.A., Wong, S.H.S. & Jeukendrup, A.E. (2011). Carbohydrates for training and competition. J Sports Sci, 29(sup1):S17–S27.",
    url: "https://doi.org/10.1080/02640414.2011.585473",
  },
  fibreMeta: {
    label: "Dietary fibre meta-analysis",
    citation:
      "Reynolds, A. et al. (2019). Carbohydrate quality and human health: a series of systematic reviews and meta-analyses. The Lancet, 393(10170):434–445.",
    url: "https://doi.org/10.1016/S0140-6736(18)31809-9",
  },
  mediterranean: {
    label: "PREDIMED trial",
    citation:
      "Estruch, R. et al. (2018). Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts. N Engl J Med, 378:e34.",
    url: "https://doi.org/10.1056/NEJMoa1800389",
  },
  sugarWho: {
    label: "WHO sugars guideline",
    citation: "World Health Organization (2015). Guideline: Sugars intake for adults and children.",
    url: "https://www.who.int/publications/i/item/9789241549028",
  },
  omega3: {
    label: "Omega-3 & inflammation review",
    citation:
      "Calder, P.C. (2017). Omega-3 fatty acids and inflammatory processes: from molecules to man. Biochem Soc Trans, 45(5):1105–1115.",
    url: "https://doi.org/10.1042/BST20160474",
  },
  probiotics: {
    label: "Fermented foods & gut health",
    citation:
      "Marco, M.L. et al. (2021). The International Scientific Association for Probiotics and Prebiotics (ISAPP) consensus statement on fermented foods. Nat Rev Gastroenterol Hepatol, 18:196–208.",
    url: "https://doi.org/10.1038/s41575-020-00390-5",
  },
  nutsCvd: {
    label: "Nuts & cardiovascular risk",
    citation:
      "Aune, D. et al. (2016). Nut consumption and risk of cardiovascular disease, total cancer, all-cause and cause-specific mortality: a systematic review and dose-response meta-analysis. BMC Medicine, 14:207.",
    url: "https://doi.org/10.1186/s12916-016-0730-3",
  },
  legumes: {
    label: "Legumes & metabolic health",
    citation:
      "Viguiliouk, E. et al. (2019). Effect of dietary pulses on metabolic risk: a systematic review and meta-analysis of randomised controlled trials. Adv Nutr, 10(Suppl 4):S308–S319.",
    url: "https://doi.org/10.1093/advances/nmz078",
  },
  hydration: {
    label: "ACSM hydration stand",
    citation:
      "Sawka, M.N. et al. (2007). American College of Sports Medicine Position Stand: Exercise and Fluid Replacement. Med Sci Sports Exerc, 39(2):377–390.",
    url: "https://doi.org/10.1249/mss.0b013e31802ca597",
  },
} satisfies Record<string, Source>;

type NutritionKey = keyof typeof NUTRITION_SOURCES;

const NUTRITION_TOPIC_RULES: { match: RegExp; keys: NutritionKey[] }[] = [
  { match: /oats|porridge|whole-?grain|pasta|rice|quinoa|grain bowl|bread|toast/i, keys: ["fibreMeta", "carbsForTraining"] },
  { match: /omelette|scramble|egg|chicken|beef|turkey|fish|salmon|tuna|cod|shrimp|prawn|tofu|tempeh|protein/i, keys: ["issnProtein", "acsmNutrition"] },
  { match: /avocado|olive oil|mezze|mediterranean|nut butter|almond|walnut|trail mix|nuts/i, keys: ["mediterranean", "nutsCvd"] },
  { match: /salmon|mackerel|sardine|omega|chia|flax/i, keys: ["omega3"] },
  { match: /yogurt|parfait|kefir|kimchi|miso|sauerkraut/i, keys: ["probiotics"] },
  { match: /lentil|bean|chickpea|hummus|edamame|pulse|legume/i, keys: ["legumes", "fibreMeta"] },
  { match: /smoothie|banana|honey|maple|granola|dried fruit|chocolate|dessert/i, keys: ["sugarWho", "carbsForTraining"] },
  { match: /salad|veg|greens|spinach|broccoli|stir-?fry|soup|curry|tacos/i, keys: ["whoHealthyDiet", "fibreMeta"] },
];

/** Sources that back the "why it matters" text for a given meal. */
export function getMealSources(text: string): Source[] {
  const keys = new Set<NutritionKey>();
  for (const rule of NUTRITION_TOPIC_RULES) {
    if (rule.match.test(text)) rule.keys.forEach((k) => keys.add(k));
  }
  if (keys.size === 0) {
    keys.add("dietaryGuidelines");
    keys.add("whoHealthyDiet");
  }
  return [...keys].slice(0, 3).map((k) => NUTRITION_SOURCES[k]);
}

/** Sources behind the calorie / macro targets and the overall plan. */
export const PLAN_SOURCES: Source[] = [
  NUTRITION_SOURCES.dietaryGuidelines,
  NUTRITION_SOURCES.acsmNutrition,
  NUTRITION_SOURCES.issnProtein,
  NUTRITION_SOURCES.whoHealthyDiet,
  NUTRITION_SOURCES.hydration,
];

/* ---------------------------------------------------------------- */
/* Training & exercise                                               */
/* ---------------------------------------------------------------- */

export const TRAINING_SOURCES: Source[] = [
  {
    label: "ACSM exercise prescription",
    citation:
      "Garber, C.E. et al. (2011). ACSM Position Stand: Quantity and Quality of Exercise for Developing and Maintaining Fitness in Apparently Healthy Adults. Med Sci Sports Exerc, 43(7):1334–1359.",
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb",
  },
  {
    label: "NSCA resistance training progression",
    citation:
      "Ratamess, N.A. et al. (2009). Progression Models in Resistance Training for Healthy Adults (ACSM/NSCA guidance). Med Sci Sports Exerc, 41(3):687–708.",
    url: "https://doi.org/10.1249/MSS.0b013e3181915670",
  },
  {
    label: "WHO physical activity guidelines",
    citation:
      "Bull, F.C. et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med, 54:1451–1462.",
    url: "https://doi.org/10.1136/bjsports-2020-102955",
  },
  {
    label: "Training load & injury (BJSM)",
    citation:
      "Gabbett, T.J. (2016). The training—injury prevention paradox: should athletes be training smarter and harder? Br J Sports Med, 50:273–280.",
    url: "https://doi.org/10.1136/bjsports-2015-095788",
  },
  {
    label: "Strength training & injury prevention",
    citation:
      "Lauersen, J.B., Bertelsen, D.M. & Andersen, L.B. (2014). The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis. Br J Sports Med, 48:871–877.",
    url: "https://doi.org/10.1136/bjsports-2013-092538",
  },
];

/* ---------------------------------------------------------------- */
/* Fatigue, recovery & injury                                        */
/* ---------------------------------------------------------------- */

export const RECOVERY_SOURCES = {
  loadInjury: {
    label: "Training load & injury risk",
    citation:
      "Gabbett, T.J. (2016). The training—injury prevention paradox: should athletes be training smarter and harder? Br J Sports Med, 50:273–280.",
    url: "https://doi.org/10.1136/bjsports-2015-095788",
  },
  loadConsensus: {
    label: "IOC load-management consensus",
    citation:
      "Soligard, T. et al. (2016). How much is too much? (Part 1) IOC consensus statement on load in sport and risk of injury. Br J Sports Med, 50:1030–1041.",
    url: "https://doi.org/10.1136/bjsports-2016-096581",
  },
  overtraining: {
    label: "Overtraining syndrome consensus",
    citation:
      "Meeusen, R. et al. (2013). Prevention, diagnosis and treatment of the overtraining syndrome: ECSS/ACSM joint consensus statement. Med Sci Sports Exerc, 45(1):186–205.",
    url: "https://doi.org/10.1249/MSS.0b013e318279a10a",
  },
  sleepAthletes: {
    label: "Sleep & athletic recovery",
    citation:
      "Walsh, N.P. et al. (2021). Sleep and the athlete: narrative review and 2021 expert consensus recommendations. Br J Sports Med, 55:356–368.",
    url: "https://doi.org/10.1136/bjsports-2020-102025",
  },
  doms: {
    label: "Muscle soreness recovery",
    citation:
      "Dupuy, O. et al. (2018). An evidence-based approach for choosing post-exercise recovery techniques to reduce markers of muscle damage, soreness, fatigue and inflammation: a systematic review with meta-analysis. Front Physiol, 9:403.",
    url: "https://doi.org/10.3389/fphys.2018.00403",
  },
  peaceLove: {
    label: "Soft-tissue injury care (PEACE & LOVE)",
    citation:
      "Dubois, B. & Esculier, J.-F. (2020). Soft-tissue injuries simply need PEACE and LOVE. Br J Sports Med, 54:72–73.",
    url: "https://doi.org/10.1136/bjsports-2019-101253",
  },
  exercisePrevention: {
    label: "Exercise-based injury prevention",
    citation:
      "Lauersen, J.B., Bertelsen, D.M. & Andersen, L.B. (2014). The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis. Br J Sports Med, 48:871–877.",
    url: "https://doi.org/10.1136/bjsports-2013-092538",
  },
  returnToPlay: {
    label: "Return-to-sport decisions",
    citation:
      "Ardern, C.L. et al. (2016). 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med, 50:853–864.",
    url: "https://doi.org/10.1136/bjsports-2016-096278",
  },
  monitoring: {
    label: "Athlete self-report monitoring",
    citation:
      "Saw, A.E., Main, L.C. & Gastin, P.B. (2016). Monitoring the athlete training response: subjective self-reported measures trump commonly used objective measures — a systematic review. Br J Sports Med, 50:281–291.",
    url: "https://doi.org/10.1136/bjsports-2015-094758",
  },
} satisfies Record<string, Source>;

export type RecoveryKey = keyof typeof RECOVERY_SOURCES;

export interface RecoveryCitation {
  /** The recommendation this evidence backs. */
  advice: string;
  sources: Source[];
}

export interface RecoveryState {
  fatigueLevel?: number;
  sleepQuality?: number;
  soreness?: string[];
  injuries?: string;
  weeklySessions?: number;
}

/**
 * Maps the app's fatigue/injury rules engine to the literature behind each rule,
 * so every piece of recovery advice can link to its supporting sources.
 */
export function getRecoveryCitations(state: RecoveryState): RecoveryCitation[] {
  const out: RecoveryCitation[] = [];
  const fatigue = state.fatigueLevel ?? 0;
  const sleep = state.sleepQuality ?? 5;
  const sore = state.soreness ?? [];
  const injured = !!state.injuries?.trim();

  if (fatigue >= 7) {
    out.push({
      advice: "High fatigue — cut intensity and volume until it settles",
      sources: [RECOVERY_SOURCES.overtraining, RECOVERY_SOURCES.loadConsensus],
    });
  } else if (fatigue >= 4) {
    out.push({
      advice: "Moderate fatigue — keep load steady rather than spiking it",
      sources: [RECOVERY_SOURCES.loadInjury, RECOVERY_SOURCES.monitoring],
    });
  }

  if (sleep <= 3) {
    out.push({
      advice: "Poor sleep — prioritise sleep duration before adding training",
      sources: [RECOVERY_SOURCES.sleepAthletes],
    });
  }

  if (sore.length) {
    out.push({
      advice: `Soreness (${sore.join(", ")}) — active recovery, not full rest`,
      sources: [RECOVERY_SOURCES.doms],
    });
  }

  if (injured) {
    out.push({
      advice: "Reported injury — protect, load gradually, and clear return-to-sport",
      sources: [RECOVERY_SOURCES.peaceLove, RECOVERY_SOURCES.returnToPlay],
    });
  }

  if ((state.weeklySessions ?? 0) >= 5) {
    out.push({
      advice: "High weekly session count — watch acute:chronic load spikes",
      sources: [RECOVERY_SOURCES.loadInjury, RECOVERY_SOURCES.loadConsensus],
    });
  }

  if (out.length === 0) {
    out.push({
      advice: "Baseline prevention — keep strength work in the week",
      sources: [RECOVERY_SOURCES.exercisePrevention, RECOVERY_SOURCES.monitoring],
    });
  }

  return out;
}
