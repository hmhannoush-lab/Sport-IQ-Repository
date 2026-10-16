// Minimal front/back anatomy diagram that highlights major muscle groups.

type Region =
  | "chest" | "shoulders" | "arms_front" | "arms_back" | "core"
  | "quads" | "adductors" | "shins"
  | "back" | "glutes" | "hamstrings" | "calves";

const KEYWORDS: Record<Region, string[]> = {
  chest: ["pec", "chest"],
  shoulders: ["delt", "shoulder"],
  arms_front: ["bicep", "forearm"],
  arms_back: ["tricep", "forearm"],
  core: ["abs", "core", "oblique", "abdomin", "transverse", "rectus"],
  quads: ["quad"],
  adductors: ["adductor", "groin", "inner thigh"],
  shins: ["shin", "tibialis"],
  back: ["lat", "rhomboid", "trap", "mid-back", "upper back", "lower back", "erector", "spinal"],
  glutes: ["glute"],
  hamstrings: ["hamstring"],
  calves: ["calf", "calves", "gastroc", "soleus"],
};

function activeRegions(muscles: string[]): Set<Region> {
  const lower = muscles.map((m) => m.toLowerCase());
  const active = new Set<Region>();
  (Object.keys(KEYWORDS) as Region[]).forEach((r) => {
    if (KEYWORDS[r].some((kw) => lower.some((m) => m.includes(kw)))) active.add(r);
  });
  return active;
}

export const MuscleMap = ({ muscles }: { muscles: string[] }) => {
  const active = activeRegions(muscles);
  const on = "hsl(var(--primary))";
  const off = "hsl(var(--muted) / 0.45)";
  const outline = "hsl(var(--border))";
  const skin = "hsl(var(--muted) / 0.22)";
  const fill = (r: Region) => (active.has(r) ? on : off);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* FRONT */}
      <figure className="flex flex-col items-center">
        <svg viewBox="0 0 100 220" className="w-full h-auto max-h-48" aria-label="Front view">
          {/* head */}
          <circle cx="50" cy="16" r="11" fill={skin} stroke={outline} />
          {/* torso */}
          <path d="M30 34 Q50 28 70 34 L78 78 Q76 110 68 128 L32 128 Q24 110 22 78 Z"
                fill={skin} stroke={outline} />
          {/* shoulders */}
          <circle cx="28" cy="42" r="9" fill={fill("shoulders")} stroke={outline} />
          <circle cx="72" cy="42" r="9" fill={fill("shoulders")} stroke={outline} />
          {/* chest */}
          <path d="M36 48 Q50 56 64 48 L64 72 Q50 78 36 72 Z" fill={fill("chest")} stroke={outline} />
          {/* arms front */}
          <rect x="17" y="52" width="12" height="38" rx="6" fill={fill("arms_front")} stroke={outline} />
          <rect x="71" y="52" width="12" height="38" rx="6" fill={fill("arms_front")} stroke={outline} />
          {/* core */}
          <rect x="40" y="74" width="20" height="42" rx="5" fill={fill("core")} stroke={outline} />
          {/* hips */}
          <path d="M32 128 L68 128 L64 146 L36 146 Z" fill={skin} stroke={outline} />
          {/* quads */}
          <rect x="35" y="146" width="12" height="48" rx="4" fill={fill("quads")} stroke={outline} />
          <rect x="53" y="146" width="12" height="48" rx="4" fill={fill("quads")} stroke={outline} />
          {/* adductors */}
          <rect x="47" y="146" width="6" height="36" rx="2" fill={fill("adductors")} stroke={outline} />
          {/* shins */}
          <rect x="37" y="196" width="9" height="22" rx="3" fill={fill("shins")} stroke={outline} />
          <rect x="54" y="196" width="9" height="22" rx="3" fill={fill("shins")} stroke={outline} />

        </svg>
        <figcaption className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Front</figcaption>
      </figure>

      {/* BACK */}
      <figure className="flex flex-col items-center">
        <svg viewBox="0 0 100 220" className="w-full h-auto max-h-48" aria-label="Back view">
          <circle cx="50" cy="16" r="11" fill={skin} stroke={outline} />
          <path d="M30 34 Q50 28 70 34 L78 78 Q76 110 68 128 L32 128 Q24 110 22 78 Z"
                fill={skin} stroke={outline} />
          {/* shoulders */}
          <circle cx="28" cy="42" r="9" fill={fill("shoulders")} stroke={outline} />
          <circle cx="72" cy="42" r="9" fill={fill("shoulders")} stroke={outline} />
          {/* back */}
          <rect x="38" y="48" width="24" height="52" rx="5" fill={fill("back")} stroke={outline} />
          {/* arms back */}
          <rect x="17" y="52" width="12" height="38" rx="6" fill={fill("arms_back")} stroke={outline} />
          <rect x="71" y="52" width="12" height="38" rx="6" fill={fill("arms_back")} stroke={outline} />
          {/* hips */}
          <path d="M32 128 L68 128 L64 146 L36 146 Z" fill={skin} stroke={outline} />
          {/* glutes */}
          <path d="M34 146 L50 146 L48 172 L36 172 Z" fill={fill("glutes")} stroke={outline} />
          <path d="M50 146 L66 146 L64 172 L52 172 Z" fill={fill("glutes")} stroke={outline} />
          {/* hamstrings */}
          <rect x="35" y="172" width="12" height="42" rx="4" fill={fill("hamstrings")} stroke={outline} />
          <rect x="53" y="172" width="12" height="42" rx="4" fill={fill("hamstrings")} stroke={outline} />
          {/* calves */}
          <ellipse cx="41" cy="220" rx="6" ry="12" fill={fill("calves")} stroke={outline} />
          <ellipse cx="59" cy="220" rx="6" ry="12" fill={fill("calves")} stroke={outline} />
        </svg>
        <figcaption className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Back</figcaption>
      </figure>
    </div>
  );
};

