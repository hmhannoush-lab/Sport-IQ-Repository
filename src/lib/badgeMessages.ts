// Athlete-themed unlock messages per badge id, with a fallback pool.
export const BADGE_UNLOCK_MESSAGES: Record<string, { title: string; message: string }> = {
  "first-step": {
    title: "First Step unlocked",
    message: "“A journey of a thousand miles begins with a single step.” — Lao Tzu",
  },
  "hydration-hero": {
    title: "Hydration Hero unlocked",
    message: "“Take care of your body. It's the only place you have to live.” — Jim Rohn",
  },
  "sleep-champion": {
    title: "Restful Nights unlocked",
    message: "“Sleep is the best meditation.” — Roger Federer swears by 12 hours; you're on the path.",
  },
  "step-master": {
    title: "Quiet Strider unlocked",
    message: "“It's not the will to win that matters — it's the will to prepare to win.” — Paul Bryant",
  },
  "workout-warrior": {
    title: "Steady Athlete unlocked",
    message: "“Excellence is not a singular act, but a habit.” — Shaquille O'Neal",
  },
  "streak-7": {
    title: "Seven Day Flow unlocked",
    message: "“Hard work beats talent when talent doesn't work hard.” — Tim Notke",
  },
  "streak-30": {
    title: "Monthly Devotion unlocked",
    message: "“Champions keep playing until they get it right.” — Billie Jean King",
  },
  "goal-setter": {
    title: "Goal Setter unlocked",
    message: "“You have to expect things of yourself before you can do them.” — Michael Jordan",
  },
  "goal-reached": {
    title: "Goal Reached unlocked",
    message: "“You hit your target — savour it. Now set the next one.” Beautiful work.",
  },
  "consistent": {
    title: "Consistent unlocked",
    message: "“Discipline is the bridge between goals and accomplishment.” — Jim Rohn",
  },
};

export function messageForBadge(id: string, title: string) {
  return (
    BADGE_UNLOCK_MESSAGES[id] ?? {
      title: `${title} unlocked`,
      message: "“Pain is temporary. Quitting lasts forever.” — Lance Armstrong",
    }
  );
}
