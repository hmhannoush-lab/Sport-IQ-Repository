// Level system based on badge achievements.
// Reaching certain badge counts gives a level boost — more badges = higher tier.

export interface LevelInfo {
  level: number;
  title: string;
  badgeCount: number;
  nextAt: number | null; // badges required for next level, or null at top
  boost: number; // extra levels gained from milestone boosts
}

const TIERS: { title: string; min: number }[] = [
  { title: "Seedling", min: 0 },
  { title: "Sprout", min: 1 },
  { title: "Rooted", min: 3 },
  { title: "Grove", min: 5 }, // +1 boost milestone
  { title: "Summit", min: 7 }, // +1 boost milestone
  { title: "Legend", min: 9 }, // top — +1 boost milestone
];

// Milestone thresholds that grant a bonus level on top of the base tier
const BOOST_THRESHOLDS = [3, 5, 7];

export function computeLevel(badgeCount: number): LevelInfo {
  let tierIdx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (badgeCount >= TIERS[i].min) tierIdx = i;
  }
  const boost = BOOST_THRESHOLDS.filter((t) => badgeCount >= t).length;
  const next = TIERS[tierIdx + 1]?.min ?? null;
  return {
    level: tierIdx + 1 + boost,
    title: TIERS[tierIdx].title,
    badgeCount,
    nextAt: next,
    boost,
  };
}
