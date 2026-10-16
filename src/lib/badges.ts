import { DailyMetrics, Profile, Workout } from "./store";
import { hydrationTargetMl } from "./health";
import { calcStreak } from "./motivation";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji for calm, hand-drawn feel
  achieved: boolean;
  progress: number; // 0..1
  hint?: string;
}

export function computeBadges(
  profile: Profile | null,
  metrics: Record<string, DailyMetrics>,
  workouts: Workout[],
): Badge[] {
  const days = Object.values(metrics);
  const hydroTarget = profile ? hydrationTargetMl(profile) : 2000;

  const hydrationDays = days.filter((d) => d.waterMl >= hydroTarget).length;
  const sleepDays = days.filter((d) => d.sleepHours >= 7).length;
  const stepDays = days.filter((d) => d.steps >= 8000).length;
  const loggedDays = days.length;
  const workoutCount = workouts.length;
  const streak = calcStreak(metrics, workouts);
  const hasGoal = !!profile?.targetWeightKg;

  const pct = (cur: number, target: number) => Math.max(0, Math.min(1, cur / target));

  // --- Goal-reached detection ---------------------------------------------
  // Unlocks whenever the user hits a personal milestone: target weight,
  // a 7- or 30-day streak, hydration/sleep/step consistency, or logging
  // consistency. Individual habit milestones are already covered by their
  // own badges; this one specifically celebrates hitting the *weight* goal.
  let weightGoalReached = false;
  let weightGoalProgress = 0;
  if (profile?.targetWeightKg) {
    // Find latest logged weight in the last 60 days
    const sorted = Object.values(metrics)
      .filter((m) => typeof m.weightKg === "number")
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const currentWeight = sorted[0]?.weightKg ?? profile.weightKg;
    const start = profile.startWeightKg ?? profile.weightKg;
    const target = profile.targetWeightKg;
    const totalDelta = target - start;
    const doneDelta = currentWeight - start;
    weightGoalProgress = totalDelta === 0 ? 1 : Math.max(0, Math.min(1, doneDelta / totalDelta));
    if (profile.goal === "lose") {
      weightGoalReached = currentWeight <= target;
    } else if (profile.goal === "gain") {
      weightGoalReached = currentWeight >= target;
    } else {
      weightGoalReached = Math.abs(currentWeight - target) <= 0.5;
    }
  }

  const list: Badge[] = [
    {
      id: "first-step",
      title: "First Step",
      description: "Log your very first day.",
      icon: "🌱",
      achieved: loggedDays >= 1,
      progress: pct(loggedDays, 1),
    },
    {
      id: "hydration-hero",
      title: "Hydration Hero",
      description: "Hit your water target on 5 days.",
      icon: "💧",
      achieved: hydrationDays >= 5,
      progress: pct(hydrationDays, 5),
      hint: `${hydrationDays} / 5 days`,
    },
    {
      id: "sleep-champion",
      title: "Restful Nights",
      description: "Sleep 7+ hours on 5 nights.",
      icon: "🌙",
      achieved: sleepDays >= 5,
      progress: pct(sleepDays, 5),
      hint: `${sleepDays} / 5 nights`,
    },
    {
      id: "step-master",
      title: "Quiet Strider",
      description: "Reach 8 000 steps on 5 days.",
      icon: "👣",
      achieved: stepDays >= 5,
      progress: pct(stepDays, 5),
      hint: `${stepDays} / 5 days`,
    },
    {
      id: "workout-warrior",
      title: "Steady Athlete",
      description: "Log 10 training sessions.",
      icon: "🏃",
      achieved: workoutCount >= 10,
      progress: pct(workoutCount, 10),
      hint: `${workoutCount} / 10 sessions`,
    },
    {
      id: "streak-7",
      title: "Seven Day Flow",
      description: "Stay active 7 days in a row.",
      icon: "🔥",
      achieved: streak >= 7,
      progress: pct(streak, 7),
      hint: `${streak} / 7 day streak`,
    },
    {
      id: "streak-30",
      title: "Monthly Devotion",
      description: "A 30-day active streak.",
      icon: "🏆",
      achieved: streak >= 30,
      progress: pct(streak, 30),
      hint: `${streak} / 30 day streak`,
    },
    {
      id: "goal-setter",
      title: "Goal Setter",
      description: "Set a personal target weight.",
      icon: "🎯",
      achieved: hasGoal,
      progress: hasGoal ? 1 : 0,
    },
    {
      id: "goal-reached",
      title: "Goal Reached",
      description: "Hit your personal target weight.",
      icon: "🥇",
      achieved: weightGoalReached,
      progress: weightGoalReached ? 1 : weightGoalProgress,
      hint: hasGoal
        ? weightGoalReached
          ? "Milestone unlocked"
          : `${Math.round(weightGoalProgress * 100)}% of the way there`
        : "Set a target weight to begin",
    },
    {
      id: "consistent",
      title: "Consistent",
      description: "Log 14 different days.",
      icon: "🪴",
      achieved: loggedDays >= 14,
      progress: pct(loggedDays, 14),
      hint: `${loggedDays} / 14 days`,
    },
  ];

  return list;
}

export const AVATAR_OPTIONS: { id: string; emoji: string; label: string; gradient: string; ring: string }[] = [
  { id: "leaf",      emoji: "🌿", label: "Sage",      gradient: "linear-gradient(135deg, #a8e6a3 0%, #4ea674 100%)", ring: "#7bc77a" },
  { id: "wave",      emoji: "🌊", label: "Wave",      gradient: "linear-gradient(135deg, #93d8f0 0%, #2a7fb8 100%)", ring: "#5ab0d8" },
  { id: "sun",       emoji: "☀️", label: "Sun",       gradient: "linear-gradient(135deg, #ffe27a 0%, #ff9a3c 100%)", ring: "#ffbf5e" },
  { id: "mountain",  emoji: "🏔️", label: "Mountain",  gradient: "linear-gradient(135deg, #c9d6e8 0%, #5a6d8a 100%)", ring: "#8a9bb5" },
  { id: "flame",     emoji: "🔥", label: "Flame",     gradient: "linear-gradient(135deg, #ffb37a 0%, #e8463a 100%)", ring: "#ff7a5e" },
  { id: "blossom",   emoji: "🌸", label: "Blossom",   gradient: "linear-gradient(135deg, #ffd6e7 0%, #ff7eb6 100%)", ring: "#ffa5cd" },
  { id: "bolt",      emoji: "⚡", label: "Spark",     gradient: "linear-gradient(135deg, #fff19a 0%, #f59e0b 100%)", ring: "#ffd34a" },
  { id: "moon",      emoji: "🌙", label: "Moon",      gradient: "linear-gradient(135deg, #d6c8f5 0%, #5a4b9e 100%)", ring: "#9a8ad8" },
  { id: "tree",      emoji: "🌲", label: "Pine",      gradient: "linear-gradient(135deg, #8fc89a 0%, #1f5a3a 100%)", ring: "#4f9466" },
  { id: "star",      emoji: "✨", label: "Stardust",  gradient: "linear-gradient(135deg, #fef0a8 0%, #b577ff 100%)", ring: "#e3a8ff" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly", gradient: "linear-gradient(135deg, #b8e4ff 0%, #c084fc 100%)", ring: "#a4c6ff" },
  { id: "flower",    emoji: "🪷", label: "Lotus",     gradient: "linear-gradient(135deg, #ffd0e3 0%, #c084fc 100%)", ring: "#e8a8d8" },
  { id: "rocket",    emoji: "🚀", label: "Rocket",    gradient: "linear-gradient(135deg, #ffb4a8 0%, #6366f1 100%)", ring: "#a8aaff" },
  { id: "trophy",    emoji: "🏆", label: "Champion",  gradient: "linear-gradient(135deg, #ffe08a 0%, #c47a16 100%)", ring: "#e8b34a" },
  { id: "heart",     emoji: "💚", label: "Heart",     gradient: "linear-gradient(135deg, #b6f0c8 0%, #2a9d6a 100%)", ring: "#6dc99a" },
  
];

export const getAvatarStyle = (emoji: string) => {
  return AVATAR_OPTIONS.find((a) => a.emoji === emoji) ?? AVATAR_OPTIONS[0];
};
