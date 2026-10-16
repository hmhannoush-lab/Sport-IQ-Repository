import { DailyMetrics, Workout, localDateKey } from "./store";

export const QUOTES: { text: string; author: string; funFact: string; source: string }[] = [
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
    funFact: "NHL all-time leader in career goals (894) and points (2,857) — records that still stand. Nicknamed 'The Great One'.",
    source: "https://www.nhl.com/gretzky99/wayne-gretzky-stats",
  },
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
    funFact: "6× NBA champion and 6× Finals MVP — yet he was famously cut from his high school varsity team (Emsley A. Laney High) as a sophomore.",
    source: "https://en.wikipedia.org/wiki/Michael_Jordan",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    funFact: "An amateur boxer in his youth, Mandela trained in the sport's early mornings for years and credited its discipline with building the focus he carried into every challenge.",
    source: "https://en.wikipedia.org/wiki/Nelson_Mandela",
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King",
    funFact: "Winner of 39 Grand Slam titles across singles, doubles and mixed doubles, and a member of the International Tennis Hall of Fame.",
    source: "https://www.bbc.com/sport/tennis/articles/cy95g0q9qrzo",
  },
  {
    text: "The more difficult the victory, the greater the happiness in winning.",
    author: "Pelé",
    funFact: "The only footballer to win three FIFA World Cups (1958, 1962, 1970), with a widely cited career tally of around 1,281 goals across all matches.",
    source: "https://en.wikipedia.org/wiki/Pel%C3%A9",
  },
  {
    text: "You have to expect things of yourself before you can do them.",
    author: "Michael Jordan",
    funFact: "The Air Jordan line launched in 1984 and Jordan Brand now generates over $6 billion a year for Nike — decades after his last NBA game.",
    source: "https://www.sportico.com/business/commerce/2024/nike-revenue-jordan-brand-billion-1234785967/",
  },
  {
    text: "I am building a fire, and every day I train, I add more fuel.",
    author: "Mia Hamm",
    funFact: "2× FIFA Women's World Cup champion (1991, 1999) and 2× Olympic gold medalist (1996, 2004); she held the international scoring record with 158 goals.",
    source: "https://www.nationalsoccerhof.com/players/mia-hamm.html",
  },
  {
    text: "Most people never run far enough on their first wind to find out they've got a second.",
    author: "William James",
    funFact: "A pioneering American psychologist and philosopher, James popularized the idea of a 'second wind' in his early-1900s writings on human energy and effort.",
    source: "https://en.wikipedia.org/wiki/William_James",
  },
  {
    text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.",
    author: "Shaquille O'Neal",
    funFact: "4× NBA champion and 15× All-Star. Listed at 7'1\" and 325 lbs, he later earned a doctorate in education (EdD) from Barry University in 2012.",
    source: "https://www.espn.com/nba/story/_/id/7895681/shaquille-oneal-receives-doctoral-degree-education",
  },
  {
    text: "It's not whether you get knocked down; it's whether you get up.",
    author: "Vince Lombardi",
    funFact: "Led the Green Bay Packers to 5 NFL Championships in 7 years, including the first two Super Bowls — the Super Bowl trophy is named after him.",
    source: "https://www.packers.com/history/vince-lombardi",
  },
  {
    text: "I can accept failure, everyone fails at something. But I can't accept not trying.",
    author: "Michael Jordan",
    funFact: "His career regular-season scoring average of 30.1 points per game is the highest in NBA history.",
    source: "https://www.nba.com/history/leaders/ppg-career",
  },
  {
    text: "If you fail to prepare, you're prepared to fail.",
    author: "Mark Spitz",
    funFact: "Won 7 gold medals at the 1972 Munich Olympics — each in world-record time, a feat unmatched until Michael Phelps in 2008.",
    source: "https://olympics.com/en/athletes/mark-spitz",
  },
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke",
    funFact: "A high school basketball coach whose locker-room saying was later popularized by NBA stars like Kevin Durant and Derek Jeter.",
    source: "https://quoteinvestigator.com/2014/12/25/talent-work/",
  },
  {
    text: "The only one who can tell you 'you can't win' is you, and you don't have to listen.",
    author: "Jessica Ennis-Hill",
    funFact: "Olympic heptathlon gold medalist (London 2012) who returned to win the world title in 2015 — about 13 months after giving birth to her son.",
    source: "https://olympics.com/en/athletes/jessica-ennis-hill",
  },
  {
    text: "Don't let what you cannot do interfere with what you can do.",
    author: "John Wooden",
    funFact: "Won 10 NCAA basketball championships in 12 years at UCLA (1964–1975), including 7 in a row (1967–1973) — a record that still stands.",
    source: "https://en.wikipedia.org/wiki/John_Wooden",
  },
  {
    text: "Pain is temporary. Quitting lasts forever.",
    author: "Lance Armstrong",
    funFact: "Survived advanced testicular cancer at age 25 in 1996 (spread to his lungs and brain), then returned to cycling and founded Livestrong, which has raised roughly $500 million for cancer support.",
    source: "https://en.wikipedia.org/wiki/Lance_Armstrong",
  },
  {
    text: "There may be people that have more talent than you, but there's no excuse for anyone to work harder than you.",
    author: "Derek Jeter",
    funFact: "5× World Series champion with the New York Yankees and the only player in MLB history to reach his 3,000th hit with a home run (July 9, 2011).",
    source: "https://www.mlb.com/news/derek-jeter-3000th-hit-a-home-run",
  },
  {
    text: "I always loved running… it was something you could do by yourself, under your own power.",
    author: "Jesse Owens",
    funFact: "Won 4 gold medals at the 1936 Berlin Olympics in the 100m, 200m, long jump and 4×100m relay — a sprint-and-jump double that stood unmatched for decades.",
    source: "https://olympics.com/en/athletes/jesse-owens",
  },
];


export function quoteOfTheDay() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[day % QUOTES.length];
}

const dayKey = localDateKey;

function shiftDay(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * A day "counts" toward a streak if the user did anything intentional:
 * logged a workout, hit ≥50% hydration, slept ≥6h, or walked ≥3000 steps.
 */
function isActiveDay(key: string, metrics: Record<string, DailyMetrics>, workouts: Workout[]) {
  const m = metrics[key];
  const hasWorkout = workouts.some((w) => w.date === key);
  if (hasWorkout) return true;
  if (!m) return false;
  return m.waterMl >= 1000 || m.sleepHours >= 6 || m.steps >= 3000;
}

export function calcStreak(metrics: Record<string, DailyMetrics>, workouts: Workout[]) {
  let streak = 0;
  const today = new Date();
  // Allow today to not yet be active without breaking streak
  let cursor = isActiveDay(dayKey(today), metrics, workouts) ? today : shiftDay(today, -1);
  for (let i = 0; i < 365; i++) {
    if (isActiveDay(dayKey(cursor), metrics, workouts)) {
      streak += 1;
      cursor = shiftDay(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function weeklyActiveDays(metrics: Record<string, DailyMetrics>, workouts: Workout[]) {
  const today = new Date();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const k = dayKey(shiftDay(today, -i));
    if (isActiveDay(k, metrics, workouts)) count += 1;
  }
  return count;
}

export function streakMessage(streak: number) {
  if (streak === 0) return "Today is a great day to begin.";
  if (streak === 1) return "You've started — keep the momentum.";
  if (streak < 4) return "Building a rhythm. Stay with it.";
  if (streak < 8) return "You're in a groove. Beautiful.";
  if (streak < 21) return "Real consistency. Your body is noticing.";
  return "Extraordinary discipline. You're an inspiration.";
}
