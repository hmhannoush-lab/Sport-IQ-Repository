import squatVid from "../../public/exercises/squat.mp4.asset.json";
import pushupVid from "../../public/exercises/pushup.mp4.asset.json";
import rdlVid from "../../public/exercises/rdl.mp4.asset.json";
import rowVid from "../../public/exercises/row.mp4.asset.json";
import plankVid from "../../public/exercises/plank.mp4.asset.json";
import lungeVid from "../../public/exercises/lunge.mp4.asset.json";
import gobletSquatVid from "../../public/exercises/goblet-squat.mp4.asset.json";
import gluteBridgeVid from "../../public/exercises/glute-bridge.mp4.asset.json";
import shoulderPressVid from "../../public/exercises/shoulder-press.mp4.asset.json";
import calfRaiseVid from "../../public/exercises/calf-raise.mp4.asset.json";
import deadBugVid from "../../public/exercises/dead-bug.mp4.asset.json";
import birdDogVid from "../../public/exercises/bird-dog.mp4.asset.json";
import walkVid from "../../public/exercises/walk.mp4.asset.json";
import catCowVid from "../../public/exercises/cat-cow.mp4.asset.json";
import wgsVid from "../../public/exercises/world-greatest-stretch.mp4.asset.json";

export type ExerciseCategory = "Lower body" | "Upper body" | "Core" | "Cardio" | "Mobility";
export type ExerciseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ExerciseTiming {
  /** Seconds of work per round/set. */
  workSec: number;
  /** Seconds of rest between rounds. */
  restSec: number;
  /** Number of rounds (sets or sides). */
  rounds: number;
  /** Short label for one round (e.g. "set", "round", "side", "min"). */
  unit: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  level: ExerciseLevel;
  videoUrl: string;
  muscles: string[];
  /** Short paragraph explaining how the listed muscles work together in this movement. */
  muscleDetail?: string;
  /** Concrete benefits — what this exercise gives you if you train it consistently. */
  benefits?: string[];
  equipment: string;
  defaultSets: string;
  summary: string;
  /** A vivid, second-by-second walkthrough of one rep. */
  walkthrough?: string;
  /** What a good rep should *feel* like in the body. */
  feels?: string[];
  /** Breathing pattern for one rep. */
  breathing?: string;
  /** Suggested tempo, e.g. "3-1-1-0 (down-pause-up-pause)". */
  tempo?: string;
  cues: string[];
  mistakes: string[];
  /** Concrete fixes/regressions for the most common mistakes. */
  fixes?: string[];
  timing: ExerciseTiming;
}

export const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Bodyweight squat",
    category: "Lower body",
    level: "Beginner",
    videoUrl: squatVid.url,
    muscles: ["Quads", "Glutes", "Adductors", "Core", "Spinal erectors"],
    equipment: "None",
    defaultSets: "3 × 10–15",
    summary:
      "The blueprint of human movement. Done well, the squat builds quad and glute strength, opens the hips and ankles, and trains an upright, braced trunk you'll feel on every other lift.",
    muscleDetail:
      "Quads and glutes do most of the work standing you up. Adductors keep your knees in line. Core and lower back hold your torso upright.",
    benefits: [
      "Strengthens knees and hips",
      "Improves ankle and hip mobility",
      "Teaches full-body bracing",
      "Builds lower-body power",
    ],
    walkthrough:
      "Stand with feet just outside hip width, toes turned out 10–20°. Inhale into the belly, brace as if bracing for a poke. Break at the hips and knees together — imagine sliding your back down a wall behind you. Keep weight balanced from the ball of the big toe to the heel. Descend until thighs are at least parallel; the bottom should feel grounded, not collapsed. Push the floor away with the whole foot, knees pressing slightly out, and stand tall.",
    feels: [
      "A deep stretch through the front of the hips and a strong load on the quads.",
      "Glutes engaging hardest in the last third of the stand-up.",
      "Heels heavy, big toe pressing the floor.",
    ],
    breathing: "Inhale on the way down, brace, exhale through pursed lips as you stand.",
    tempo: "3-1-1-0 — three seconds down, one-second pause at the bottom, one second up.",
    cues: [
      "Feet shoulder-width, toes turned out 10–20°.",
      "Brace the core like you're about to be tickled.",
      "Hips and knees bend together — no hip-shoot.",
      "Knees track over the 2nd and 3rd toes.",
      "Drive the whole foot through the floor on the way up.",
    ],
    mistakes: [
      "Knees caving inward at the bottom.",
      "Heels lifting off the floor.",
      "Lower back rounding (\"butt wink\") in the deepest range.",
      "Chest collapsing forward as fatigue sets in.",
    ],
    fixes: [
      "Knees caving → consciously press them out toward the pinky toes; try a light band above the knees.",
      "Heels lifting → widen stance slightly or elevate heels on a 1 cm plate while you build ankle mobility.",
      "Butt wink → stop two finger-widths above your deepest range and earn depth over weeks.",
    ],
    timing: { workSec: 40, restSec: 45, rounds: 3, unit: "set" },
  },
  {
    id: "pushup",
    name: "Push-up",
    category: "Upper body",
    level: "Beginner",
    videoUrl: pushupVid.url,
    muscles: ["Pecs", "Anterior delts", "Triceps", "Serratus anterior", "Core"],
    equipment: "None",
    defaultSets: "3 × 8–12",
    summary:
      "A moving plank with a press on top. Trains real-world pushing strength while teaching the whole body to stay rigid under load.",
    muscleDetail:
      "Chest and front shoulders press you up. Triceps straighten the arms. Serratus and core keep your shoulders and body stable.",
    benefits: [
      "Builds pushing strength",
      "Stabilises shoulders",
      "Strengthens core",
      "Easy to scale up or down",
    ],
    walkthrough:
      "Set hands just outside shoulder width, fingers spread, middle finger pointing forward. Screw the hands into the floor (right hand clockwise, left counter-clockwise) to create shoulder tension. Squeeze glutes and quads — the body becomes one plank from crown to heels. Inhale, bend the elbows back at about 45° from the ribs, lowering until the chest is a fist's height from the floor. Exhale and push the floor away, pressing the ground down rather than your body up. Finish with the shoulder blades wide on the ribcage.",
    feels: [
      "Chest stretched at the bottom, tight under tension at the top.",
      "Whole midsection bracing, not just the arms working.",
      "Hands rooted, elbows tucked.",
    ],
    breathing: "Inhale lowering, exhale on the press.",
    tempo: "3-0-1-0 — slow descent, no bounce at the bottom.",
    cues: [
      "Hands just outside shoulders, fingers spread wide.",
      "Body forms one rigid line — head, hips, heels in plane.",
      "Elbows track ~45° from the ribs, not flared to 90°.",
      "Lower until chest is roughly a fist off the floor.",
      "Push the floor away, shoulder blades wrapping around the ribs at the top.",
    ],
    mistakes: [
      "Hips sagging or piking up.",
      "Elbows flaring straight out to the sides.",
      "Head poking forward, chin leading.",
      "Half-rep range from fatigue.",
    ],
    fixes: [
      "Sagging/piking hips → cue \"squeeze glutes, ribs down\" before every set, or regress to hands elevated on a bench.",
      "Flaring elbows → point thumbs slightly forward at the start.",
      "Half reps → drop volume by 30% and earn full range first.",
    ],
    timing: { workSec: 35, restSec: 60, rounds: 3, unit: "set" },
  },
  {
    id: "rdl",
    name: "Romanian deadlift",
    category: "Lower body",
    level: "Intermediate",
    videoUrl: rdlVid.url,
    muscles: ["Hamstrings", "Glutes", "Spinal erectors", "Lats"],
    equipment: "Barbell or dumbbells",
    defaultSets: "3 × 8–10",
    summary:
      "The gold standard of hip-hinge training. Builds hamstring length-strength, thick glutes, and a back that stays organised under load.",
    muscleDetail:
      "Hamstrings and glutes power the hip hinge. Lower back and lats keep your spine long and the weight close to your body.",
    benefits: [
      "Strengthens hamstrings and glutes",
      "Teaches safe lifting form",
      "Improves posture",
      "Builds a strong back",
    ],
    walkthrough:
      "Stand tall, weight at arm's length over the mid-foot. Set a soft, fixed knee bend — about 15°. Pull the bar into the body with the lats (\"oranges in the armpits\"), inhale and brace. Push the hips straight back as if closing a car door with your butt. The bar grazes the thighs on the way down; the chest tips forward with a flat back. When you feel a strong stretch in the hamstrings and can't go further without rounding, reverse: drive the hips forward, finishing with a hard glute squeeze. The knees never re-bend.",
    feels: [
      "A long, deep stretch in the hamstrings about halfway down.",
      "Bar light on the thighs, never drifting forward.",
      "Glutes finishing the lockout, not the lower back.",
    ],
    breathing: "Big inhale at the top, hold the brace through the lift, exhale at the top.",
    tempo: "3-1-X-0 — three down, one-second stretch, explode up.",
    cues: [
      "Soft, fixed knee bend — set it and keep it.",
      "Hinge at the hips; push them back, don't squat down.",
      "Bar / dumbbells stay in contact with the legs.",
      "Stop when hamstrings stretch hard — that's your range.",
      "Drive hips forward to stand; glutes finish the rep.",
    ],
    mistakes: [
      "Re-bending the knees on the way down (that's a squat).",
      "Letting the bar drift away from the body.",
      "Rounding the lower back at the bottom.",
      "Hyper-extending the lumbar spine at lockout.",
    ],
    fixes: [
      "Bar drifting → row it into your body before every rep; engage the lats.",
      "Rounding back → cut depth to where your back stays flat; range improves with hamstring length.",
      "Hyperextension → finish with a squeeze, not a backward lean.",
    ],
    timing: { workSec: 35, restSec: 90, rounds: 3, unit: "set" },
  },
  {
    id: "row",
    name: "Bent-over row",
    category: "Upper body",
    level: "Intermediate",
    videoUrl: rowVid.url,
    muscles: ["Lats", "Rhomboids", "Mid-traps", "Rear delts", "Biceps"],
    equipment: "Dumbbells or barbell",
    defaultSets: "3 × 10",
    summary:
      "The antidote to a desk-bound, hunched upper back. Builds dense lats and rhomboids and balances every press you do.",
    muscleDetail:
      "Lats, rhomboids and mid-traps pull the weight in. Rear delts and biceps assist. Hamstrings and lower back hold the hinge.",
    benefits: [
      "Balances pressing work",
      "Builds upper-back strength",
      "Improves posture",
      "Strengthens grip and arms",
    ],
    walkthrough:
      "Hinge to roughly 45° with a flat back, knees softly bent, weights hanging directly under the shoulders. Take a breath, set the lats. Pull the weights toward the lower ribs — elbows lead, wrists stay neutral. At the top, the shoulder blades come together as if pinching a pencil between them. Pause for a beat, then lower over two full seconds, feeling the lats stretch. The torso never bounces up and down — only the arms move.",
    feels: [
      "A squeeze between the shoulder blades at the top.",
      "Long stretch through the lats at the bottom.",
      "Hamstrings working isometrically to hold the hinge.",
    ],
    breathing: "Exhale on the pull, inhale on the lower.",
    tempo: "2-1-1-0 — two-second lower, one-second squeeze at the top.",
    cues: [
      "Hinge to ~45°, neutral spine, eyes a metre ahead.",
      "Pull to the lower ribs with elbows leading.",
      "Squeeze the shoulder blades together at the top.",
      "Two-second lower under control.",
    ],
    mistakes: [
      "Using momentum and jerking the weight up.",
      "Shrugging shoulders toward the ears.",
      "Torso popping up with each rep.",
      "Standing too upright — turns into a shrug.",
    ],
    fixes: [
      "Momentum → lower weight, count three on the descent.",
      "Shrugging → \"long neck, slide shoulders into back pockets\" before every set.",
      "Bouncing torso → brace against a bench or chest-supported row variation.",
    ],
    timing: { workSec: 35, restSec: 75, rounds: 3, unit: "set" },
  },
  {
    id: "plank",
    name: "Forearm plank",
    category: "Core",
    level: "Beginner",
    videoUrl: plankVid.url,
    muscles: ["Transverse abdominis", "Rectus abdominis", "Obliques", "Glutes", "Serratus"],
    equipment: "None",
    defaultSets: "3 × 30–60 s",
    summary:
      "The foundational anti-extension drill — teaches the core to resist movement, which is its real job under squats, deadlifts and life.",
    muscleDetail:
      "Deep core wraps the trunk. Abs and obliques stop the hips sagging. Glutes tuck the pelvis. Serratus stabilises the shoulders.",
    benefits: [
      "Protects the lower back",
      "Improves posture",
      "Strengthens shoulders and glutes",
      "No equipment needed",
    ],
    walkthrough:
      "Set elbows directly under the shoulders, forearms parallel, palms flat or fists stacked. Step the feet back to hip width. Tuck the pelvis lightly (think \"belt buckle toward chin\"). Squeeze the glutes, quads and abs simultaneously. The body forms one straight line from the crown of the head to the heels. Press the forearms hard into the floor to push the shoulder blades wide on the ribcage. Hold the position with smooth nasal breathing — the goal is tension, not endurance for endurance's sake.",
    feels: [
      "Whole midsection wrapped tight, not just the abs.",
      "Glutes and quads firing — surprising the first time.",
      "Shoulder blades wide and stable, not pinched.",
    ],
    breathing: "Slow nasal breaths — 4 seconds in, 6 out.",
    tempo: "Hold for quality time; stop the moment hips drop.",
    cues: [
      "Elbows under shoulders, forearms pressing into the floor.",
      "One straight line head-to-heels.",
      "Squeeze glutes hard, ribs pulled gently down.",
      "Slow nasal breathing the entire hold.",
      "End the set before form breaks, not after.",
    ],
    mistakes: [
      "Hips sagging toward the floor.",
      "Butt piking up into a tent.",
      "Holding breath.",
      "Looking up — neck cranks back.",
    ],
    fixes: [
      "Sagging hips → shorter holds (20 s × 4) with perfect form.",
      "Piking → cue \"chest forward over the hands.\"",
      "Holding breath → count breaths out loud for the first 15 seconds.",
    ],
    timing: { workSec: 45, restSec: 30, rounds: 3, unit: "hold" },
  },
  {
    id: "lunge",
    name: "Walking lunge",
    category: "Lower body",
    level: "Beginner",
    videoUrl: lungeVid.url,
    muscles: ["Quads", "Glutes", "Hamstrings", "Adductors", "Calves"],
    equipment: "Optional dumbbells",
    defaultSets: "3 × 8 / leg",
    summary:
      "Single-leg strength and balance. Exposes left/right imbalances and bulletproofs the hips and knees for running, hiking and sport.",
    muscleDetail:
      "Front-leg quads and glutes drive the stand-up. Hamstrings and adductors stabilise the knee. Calves and core keep you balanced.",
    benefits: [
      "Fixes left/right imbalances",
      "Strengthens knees and hips",
      "Improves balance",
      "Builds leg and glute strength",
    ],
    walkthrough:
      "Stand tall, brace the core. Step forward into a long stride — long enough that both knees can finish near 90°. Lower straight down, not forward; the back knee tracks toward the floor while the front shin stays roughly vertical. Pause an inch above the floor. Drive through the heel and mid-foot of the front leg, exhale, and step the back leg forward into the next rep. The torso stays tall throughout, as if walking under a low doorway.",
    feels: [
      "Front-leg glute and quad working hard on the stand-up.",
      "Back-leg hip flexor stretching at the bottom.",
      "Balance challenged side-to-side — that's the point.",
    ],
    breathing: "Inhale stepping out, exhale pushing back up.",
    tempo: "2-1-1-0 — controlled lower, brief pause, smooth drive.",
    cues: [
      "Step forward into a long stride.",
      "Lower until both knees are near 90°.",
      "Front shin stays roughly vertical.",
      "Drive through the front heel to stand.",
      "Torso tall the entire time.",
    ],
    mistakes: [
      "Steps too short — front knee jams forward over the toes.",
      "Leaning the torso forward as fatigue hits.",
      "Back knee crashing into the floor.",
      "Stepping like on a tightrope — feet too narrow side-to-side.",
    ],
    fixes: [
      "Short steps → place a marker (water bottle) where the front foot should land.",
      "Forward lean → reduce weight; brace ribs over hips.",
      "Crashing back knee → finish the rep one inch above the floor with control.",
    ],
    timing: { workSec: 40, restSec: 45, rounds: 3, unit: "set" },
  },
  {
    id: "goblet-squat",
    name: "Goblet squat",
    category: "Lower body",
    level: "Beginner",
    videoUrl: gobletSquatVid.url,
    muscles: ["Quads", "Glutes", "Adductors", "Upper back", "Core"],
    equipment: "Kettlebell or dumbbell",
    defaultSets: "3 × 10",
    summary:
      "The friendliest loaded squat. The front-loaded weight forces a tall chest and braced trunk — it almost coaches itself.",
    muscleDetail:
      "Quads and glutes squat the weight up. Adductors control depth. Upper back and core hold the weight at your chest.",
    benefits: [
      "Self-corrects squat form",
      "Safe leg loading",
      "Builds upper-back posture",
      "Bridge to barbell squats",
    ],
    walkthrough:
      "Hold a kettlebell by the horns (or a dumbbell vertically) at the centre of the chest, elbows tucked in. Set feet just outside shoulder width, toes turned out slightly. Inhale into the belly, brace. Sit straight down between the heels, letting the elbows brush the inside of the knees at the bottom. The weight cues a vertical torso. Drive the floor away with the whole foot, exhale, and stand tall — finish with a brief glute squeeze.",
    feels: [
      "Upper back working to keep the chest up.",
      "Hips opening at the bottom, glutes loaded.",
      "Heels rooted, full-foot drive on the way up.",
    ],
    breathing: "Inhale-brace down, exhale on the stand.",
    tempo: "3-1-1-0 — three down, one at the bottom.",
    cues: [
      "Weight at the chest, elbows tucked.",
      "Feet just outside shoulder width.",
      "Sit between the heels, elbows brushing the knees.",
      "Stand tall, glutes finish the rep.",
    ],
    mistakes: [
      "Weight drifting away from the chest.",
      "Heels lifting at the bottom.",
      "Cutting depth short — quarter squats.",
    ],
    fixes: [
      "Weight drifting → hug it harder; lighter bell for clean reps.",
      "Heels lifting → widen stance or use a 1 cm heel lift while ankle mobility improves.",
      "Short depth → reduce load and sit between the heels with a 2-second pause.",
    ],
    timing: { workSec: 35, restSec: 75, rounds: 3, unit: "set" },
  },
  {
    id: "glute-bridge",
    name: "Glute bridge",
    category: "Lower body",
    level: "Beginner",
    videoUrl: gluteBridgeVid.url,
    muscles: ["Glute max", "Hamstrings", "Core"],
    equipment: "None",
    defaultSets: "3 × 12–15",
    summary:
      "The simplest way to wake up sleepy glutes. A perfect warm-up before squats or deadlifts — and surprisingly hard when done with intent.",
    muscleDetail:
      "Glutes lift the hips. Hamstrings assist. Core keeps the ribs down so the lower back does not arch.",
    benefits: [
      "Activates glutes",
      "Reduces lower-back strain",
      "Improves sprint and jump power",
      "Joint-friendly",
    ],
    walkthrough:
      "Lie on your back, knees bent, feet flat with heels close enough to the glutes that you can brush them with your fingertips. Press the lower back lightly into the floor and exhale to flatten the ribs. Drive through the whole foot (especially the heel) and squeeze the glutes to lift the hips. At the top, the body forms a straight line from knees to shoulders. Pause for a hard squeeze of two seconds. Lower slowly, just kissing the floor before the next rep.",
    feels: [
      "Glutes — and only the glutes — doing the work at the top.",
      "Ribs staying down, no lower-back arch.",
      "Hamstrings firing as a backup, not as the boss.",
    ],
    breathing: "Inhale at the bottom, exhale as you lift and squeeze.",
    tempo: "1-2-2-0 — quick lift, two-second squeeze, two-second lower.",
    cues: [
      "Feet flat, heels close to the glutes.",
      "Push through the heels, glutes lift the hips.",
      "Top position: knee–hip–shoulder in a line.",
      "Two-second squeeze at the top.",
    ],
    mistakes: [
      "Pushing through the toes — hits quads instead of glutes.",
      "Hyper-extending the lower back at the top.",
      "Speeding through reps for a count rather than a contraction.",
    ],
    fixes: [
      "Toe push → lift the toes inside your shoes during the set.",
      "Lumbar overextension → tuck the pelvis slightly before lifting; stop when the body is a straight line.",
      "Rushed reps → add a 3-second hold at the top of every rep.",
    ],
    timing: { workSec: 45, restSec: 30, rounds: 3, unit: "set" },
  },
  {
    id: "shoulder-press",
    name: "Dumbbell shoulder press",
    category: "Upper body",
    level: "Intermediate",
    videoUrl: shoulderPressVid.url,
    muscles: ["Anterior & medial delts", "Triceps", "Upper traps", "Serratus", "Core"],
    equipment: "Dumbbells",
    defaultSets: "3 × 8",
    summary:
      "Builds capable, durable shoulders and overhead stability. Tests how well your ribs sit over your hips under load.",
    muscleDetail:
      "Front and side delts press overhead. Triceps lock out. Upper traps and serratus rotate the shoulder blades. Core keeps ribs down.",
    benefits: [
      "Builds shoulder strength",
      "Improves overhead stability",
      "Trains upright posture",
      "Strengthens triceps",
    ],
    walkthrough:
      "Sit on a bench with a slight backrest tilt, or stand tall with feet hip-width. Start with the dumbbells at shoulder height, palms facing forward, elbows roughly under the wrists. Brace the core — ribs stacked over hips, no flare. Inhale, then press up and slightly inward so the bells finish over the centre of the head, arms long but not locked-out hard. Pause, then lower over two seconds to ear height. The wrists stay neutral; the path is an arc, not a straight line.",
    feels: [
      "Shoulders working, triceps locking out.",
      "Core bracing hard to prevent a back arch.",
      "Bells meeting (almost) overhead, not flying apart.",
    ],
    breathing: "Inhale at the bottom, exhale on the press.",
    tempo: "2-0-1-1 — two-second lower, one-second hold at the top.",
    cues: [
      "Dumbbells at shoulder height, palms forward.",
      "Ribs stacked over hips — no lower-back arch.",
      "Press up and slightly in; bells finish over the head.",
      "Lower to ear height under control.",
    ],
    mistakes: [
      "Arching the lower back to press the weight up.",
      "Pressing the bells forward instead of up.",
      "Letting the wrists bend backwards.",
      "Going too heavy — single clean reps win.",
    ],
    fixes: [
      "Back arch → seated press with a back pad; squeeze glutes hard standing.",
      "Forward press path → film a set from the side; the bells should travel up, not out.",
      "Bent wrists → grip harder; stack the knuckles over the elbows.",
    ],
    timing: { workSec: 30, restSec: 75, rounds: 3, unit: "set" },
  },
  {
    id: "calf-raise",
    name: "Calf raise",
    category: "Lower body",
    level: "Beginner",
    videoUrl: calfRaiseVid.url,
    muscles: ["Gastrocnemius", "Soleus", "Tibialis posterior"],
    equipment: "None (optional step)",
    defaultSets: "3 × 15",
    summary:
      "Ankle and calf strength. Quietly protects knees, Achilles tendons and shins — the difference between resilient runners and injured ones.",
    muscleDetail:
      "Gastrocnemius lifts the heel when the knee is straight. Soleus controls the descent. Tibialis posterior stabilises the ankle.",
    benefits: [
      "Protects Achilles and knees",
      "Improves ankle stability",
      "Builds calf endurance",
      "Reduces shin splint risk",
    ],
    walkthrough:
      "Stand tall on the balls of the feet at the edge of a step, heels free to drop. Find a wall or rail for light balance only. Inhale, then rise as high as you can onto the big toes — feel the calf shorten completely. Hold one full second at the top, squeezing as if the calf were trying to touch the back of the knee. Lower over three seconds until the heels drop below the step, a long stretch through the Achilles. No bouncing.",
    feels: [
      "Full shortening of the calf at the top, then a long stretch at the bottom.",
      "Weight even across the big toe and second toe — not rolling out to the pinky.",
      "Burn between reps 8–12 if the tempo is honest.",
    ],
    breathing: "Exhale on the lift, inhale on the lower.",
    tempo: "1-1-3-0 — one up, one held at the top, three down.",
    cues: [
      "Weight through the balls of the feet, even across big and second toe.",
      "Rise as high as physically possible.",
      "Hold one second at the top.",
      "Lower slowly into a full stretch.",
    ],
    mistakes: [
      "Bouncing reps — eliminates the muscle work.",
      "Cutting range short at the top or bottom.",
      "Rolling onto the outside of the foot.",
    ],
    fixes: [
      "Bouncing → count \"one Mississippi\" at top and bottom every rep.",
      "Short range → use a step so heels can drop below the platform.",
      "Foot roll → press the big toe into the floor before lifting.",
    ],
    timing: { workSec: 45, restSec: 30, rounds: 3, unit: "set" },
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    category: "Core",
    level: "Beginner",
    videoUrl: deadBugVid.url,
    muscles: ["Transverse abdominis", "Rectus abdominis", "Hip flexors"],
    equipment: "None",
    defaultSets: "3 × 10 / side",
    summary:
      "Teaches the core to brace while the limbs move — the exact skill that protects the lower back during loaded lifts and daily life.",
    muscleDetail:
      "Deep core and obliques stabilise the pelvis. Abs pin the ribs down. Hip flexors move the leg without arching the back.",
    benefits: [
      "Protects the lower back",
      "Links breath to core control",
      "Safe for most people",
      "Improves limb coordination",
    ],
    walkthrough:
      "Lie on your back, arms straight above the shoulders, knees and hips bent to 90° (\"table top\"). Exhale fully to pull the ribs down and pin the lower back flat to the floor — no daylight under the lumbar. Slowly lower the opposite arm overhead and opposite leg toward the floor over three seconds. Stop just before the lower back wants to arch. Return with control and switch sides. The pelvis never wobbles; only the limbs move.",
    feels: [
      "Lower belly working hard to keep the back pinned.",
      "Back staying glued to the floor the entire set.",
      "Hip flexors of the moving leg loaded but not cramping.",
    ],
    breathing: "Exhale as you lower the limbs, inhale as you return.",
    tempo: "3-1-2-0 — three out, one held, two back.",
    cues: [
      "Low back pinned against the floor — keep it pinned.",
      "Slowly lower opposite arm and leg.",
      "Stop just before the back wants to arch.",
      "Exhale as the limbs lower; lock the ribs down.",
    ],
    mistakes: [
      "Lower back popping off the floor.",
      "Rushing through reps to get them done.",
      "Holding breath instead of exhaling.",
      "Limbs going too far for current strength.",
    ],
    fixes: [
      "Lumbar lifting → shorten the range; only lower as far as you can keep the back flat.",
      "Rushed reps → count out loud, three seconds out.",
      "Breath holding → forceful exhale through pursed lips on the way out.",
    ],
    timing: { workSec: 40, restSec: 30, rounds: 3, unit: "set" },
  },
  {
    id: "bird-dog",
    name: "Bird dog",
    category: "Core",
    level: "Beginner",
    videoUrl: birdDogVid.url,
    muscles: ["Multifidus", "Obliques", "Glute max", "Shoulder stabilisers"],
    equipment: "None",
    defaultSets: "3 × 10 / side",
    summary:
      "Anti-rotation core work on all fours. Bulletproofs the lower back and teaches the trunk to stay quiet while opposite limbs move.",
    muscleDetail:
      "Deep spinal muscles stabilise the lower back. Obliques resist rotation. Glute extends the leg. Shoulder stabilisers hold the arm.",
    benefits: [
      "Bulletproofs the lower back",
      "Improves opposite-limb coordination",
      "Strengthens deep core",
      "Joint-friendly",
    ],
    walkthrough:
      "Set up on hands and knees — hands directly under shoulders, knees under hips, spine long and neutral. Brace the core lightly. Extend the right arm straight forward and the left leg straight back, both reaching to parallel with the floor. Hips and shoulders stay square, as if a glass of water sat on your lower back. Hold for two seconds with a firm glute squeeze on the working leg. Return under control; alternate.",
    feels: [
      "A line of tension from fingertip to opposite toe.",
      "Hips locked square — no tipping to one side.",
      "Glute on the lifted leg working hard.",
    ],
    breathing: "Exhale on the reach, inhale on the return.",
    tempo: "2-2-2-0 — reach, two-second hold, return.",
    cues: [
      "Hands under shoulders, knees under hips.",
      "Extend opposite arm and leg to parallel.",
      "Hips and shoulders stay square — no tipping.",
      "Hold 2 sec at the top, then return slowly.",
    ],
    mistakes: [
      "Hips rotating to one side.",
      "Lifting the limbs above parallel — over-arches the back.",
      "Speeding through reps.",
      "Letting the head hang or crane up.",
    ],
    fixes: [
      "Hip rotation → place a foam roller on your lower back; keep it from rolling off.",
      "Over-extension → cap the leg at parallel; reach long, not high.",
      "Rushed reps → 2-second hold at the top of every rep.",
    ],
    timing: { workSec: 40, restSec: 30, rounds: 3, unit: "set" },
  },
  {
    id: "walk",
    name: "Brisk walk",
    category: "Cardio",
    level: "Beginner",
    videoUrl: walkVid.url,
    muscles: ["Whole body", "Cardiovascular system", "Mitochondria"],
    equipment: "None",
    defaultSets: "20–40 min",
    summary:
      "The most underrated workout on earth. Builds aerobic base, boosts recovery between hard sessions, regulates mood and digestion, and is sustainable for life.",
    muscleDetail:
      "Glutes and hamstrings push off. Calves absorb landing. Heart, lungs and mitochondria build aerobic fitness.",
    benefits: [
      "Builds aerobic base",
      "Regulates mood and recovery",
      "Low-impact and free",
      "Sustainable for life",
    ],
    walkthrough:
      "Stand tall, eyes on the horizon, shoulders relaxed and slightly back. Take a slightly longer stride than your usual amble, pushing off the back foot. Let the arms swing naturally from the shoulders, opposite arm to leg. Aim for a pace at which you can speak in short sentences but not sing — roughly 110–130 bpm of music. Breathe in through the nose for 3 steps, out for 4. On inclines, lean slightly from the ankles, not the waist.",
    feels: [
      "Heart rate elevated and steady, breath deep but conversational.",
      "Hips moving freely, glutes working on the push-off.",
      "Mood lifting after about 8–10 minutes.",
    ],
    breathing: "Nasal in for 3 steps, out for 4. Mouth-breathe only on hills.",
    tempo: "Conversational pace — \"talk test\" passes, singing doesn't.",
    cues: [
      "Stand tall, eyes on the horizon.",
      "Natural arm swing from the shoulders.",
      "Pace where you can talk in short sentences.",
      "Nasal breathing if possible.",
      "Add a slight incline for more challenge.",
    ],
    mistakes: [
      "Slouching forward over a phone.",
      "Walking too slowly to actually elevate the heart rate.",
      "Skipping it on rest days — it actively helps recovery.",
      "Stride too long, heel slamming the ground.",
    ],
    fixes: [
      "Phone slouch → pocket the phone for at least half the walk.",
      "Slow drift → set a step-cadence target (e.g. 110 spm) with music.",
      "Heel slam → shorten stride slightly; land under the hip, not in front of it.",
    ],
    timing: { workSec: 1800, restSec: 0, rounds: 1, unit: "walk" },
  },
  {
    id: "cat-cow",
    name: "Cat-cow",
    category: "Mobility",
    level: "Beginner",
    videoUrl: catCowVid.url,
    muscles: ["Spine (segment by segment)", "Deep core", "Shoulders"],
    equipment: "Mat",
    defaultSets: "1 × 10 reps",
    summary:
      "Wakes up every joint of the spine. A perfect first move of the day or transition between mobility and strength.",
    muscleDetail:
      "Small spinal muscles move each vertebra. Deep core links breath to motion. Shoulders support the trunk.",
    benefits: [
      "Loosens a stiff back",
      "Improves spinal mobility",
      "Calms the nervous system",
      "Great warm-up",
    ],
    walkthrough:
      "Begin on all fours, hands under shoulders, knees under hips, toes neutral. Inhale slowly through the nose: drop the belly, lift the chest forward, let the tailbone reach toward the ceiling — \"cow.\" Eyes lift gently. Exhale: tuck the chin, round the upper back toward the ceiling, draw the tailbone down — \"cat.\" Move one vertebra at a time, as if pouring the motion from tailbone to skull and back. Each round takes a full slow breath in and out.",
    feels: [
      "Spine articulating segment by segment, not in one block.",
      "Breath leading the movement, not the other way around.",
      "A subtle release in the lower back after 4–5 rounds.",
    ],
    breathing: "Inhale into cow, exhale into cat.",
    tempo: "5–6 seconds per breath; move with the breath, not the clock.",
    cues: [
      "Hands under shoulders, knees under hips.",
      "Inhale: belly drops, chest lifts, tail rises (cow).",
      "Exhale: round the spine, tuck chin and tail (cat).",
      "Move slowly with the breath.",
    ],
    mistakes: [
      "Forcing range instead of letting it open up gradually.",
      "Holding breath.",
      "Hyper-extending only the lower back instead of articulating the whole spine.",
    ],
    fixes: [
      "Forced range → cut the size of the movement in half; quality first.",
      "Breath holding → count breaths out loud.",
      "Lumbar dump → emphasise the upper-back rounding in the cat half.",
    ],
    timing: { workSec: 60, restSec: 0, rounds: 1, unit: "flow" },
  },
  {
    id: "wgs",
    name: "World's greatest stretch",
    category: "Mobility",
    level: "Intermediate",
    videoUrl: wgsVid.url,
    muscles: ["Hip flexors", "Adductors", "Hamstrings", "T-spine", "Shoulders"],
    equipment: "None",
    defaultSets: "1 × 5 / side",
    summary:
      "One flowing sequence that opens hips, thoracic spine and hamstrings — a complete warm-up in a single movement.",
    muscleDetail:
      "Hip flexors, adductors and hamstrings stretch. Thoracic spine and shoulders rotate open.",
    benefits: [
      "Opens hips, spine and shoulders",
      "Dynamic warm-up",
      "Restores upper-back rotation",
      "Improves squat and lunge depth",
    ],
    walkthrough:
      "Step the right foot forward into a long lunge, back knee hovering an inch off the floor. Place the left hand on the floor inside the right foot. Feel the right hip and left hip flexor stretch. From there, rotate the right arm up toward the ceiling, eyes following the hand — the chest opens fully to the side. Hold two seconds. Return the hand down, straighten the front leg into a hamstring stretch, then step back and switch sides.",
    feels: [
      "Deep stretch through the back hip flexor.",
      "Chest opening as the upper body rotates.",
      "Hamstring lengthening on the straightened front leg.",
    ],
    breathing: "Inhale into the rotation, exhale as you return and transition.",
    tempo: "Hold each position for 2 full seconds; flow, don't rush.",
    cues: [
      "Step into a long, low lunge.",
      "Opposite hand on the floor inside the front foot.",
      "Rotate the other arm up toward the ceiling — eyes follow the hand.",
      "Straighten the front leg for a hamstring stretch before switching.",
      "Move slow — feel the rotation.",
    ],
    mistakes: [
      "Back knee crashing into the floor.",
      "Rounding the upper back instead of rotating from the t-spine.",
      "Skipping the hamstring portion at the end.",
    ],
    fixes: [
      "Crashing knee → shorten the stride slightly; control the lower.",
      "Rounded rotation → reach the rotating hand back, not just up.",
      "Skipping hamstring → make it a deliberate beat of the flow each side.",
    ],
    timing: { workSec: 30, restSec: 15, rounds: 5, unit: "side" },
  },
];

export const CATEGORIES: ExerciseCategory[] = ["Lower body", "Upper body", "Core", "Cardio", "Mobility"];
