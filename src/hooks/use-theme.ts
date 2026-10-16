import { useEffect, useState } from "react";

export type Theme = {
  id: string;
  name: string;
  emoji: string;
  // HSL strings (no hsl() wrapper) for CSS variables
  vars: {
    background: string;
    foreground: string;
    card: string;
    primary: string;
    primarySoft: string;
    secondary: string;
    accent: string;
    accentSoft: string;
    highlight: string;
    muted: string;
    border: string;
    ring: string;
    heroA: string; // hero glow color A
    heroB: string;
    heroC: string;
    gradStart: string; // sage gradient start
    gradEnd: string;
  };
};

export const THEMES: Theme[] = [
  {
    id: "sage",
    name: "Calm Sage",
    emoji: "🌿",
    vars: {
      background: "140 30% 94%",
      foreground: "155 30% 16%",
      card: "140 35% 98%",
      primary: "145 45% 48%",
      primarySoft: "145 50% 88%",
      secondary: "165 40% 88%",
      accent: "330 85% 70%",
      accentSoft: "330 80% 92%",
      highlight: "50 95% 78%",
      muted: "140 20% 90%",
      border: "140 25% 86%",
      ring: "145 45% 48%",
      heroA: "145 50% 82%",
      heroB: "330 80% 85%",
      heroC: "165 55% 82%",
      gradStart: "145 55% 55%",
      gradEnd: "165 50% 42%",
    },
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    emoji: "🍬",
    vars: {
      background: "340 70% 97%",
      foreground: "320 40% 20%",
      card: "0 0% 100%",
      primary: "330 85% 65%",
      primarySoft: "330 90% 92%",
      secondary: "280 70% 92%",
      accent: "30 95% 65%",
      accentSoft: "30 100% 92%",
      highlight: "50 100% 78%",
      muted: "320 40% 94%",
      border: "320 50% 90%",
      ring: "330 85% 65%",
      heroA: "330 90% 85%",
      heroB: "280 80% 88%",
      heroC: "50 100% 85%",
      gradStart: "330 85% 70%",
      gradEnd: "280 75% 65%",
    },
  },
  {
    id: "peach",
    name: "Peach Fuzz",
    emoji: "🍑",
    vars: {
      background: "25 80% 95%",
      foreground: "15 35% 20%",
      card: "30 80% 98%",
      primary: "15 85% 65%",
      primarySoft: "20 90% 90%",
      secondary: "40 80% 88%",
      accent: "340 80% 68%",
      accentSoft: "340 80% 92%",
      highlight: "45 95% 78%",
      muted: "25 50% 92%",
      border: "20 50% 88%",
      ring: "15 85% 65%",
      heroA: "20 90% 85%",
      heroB: "340 80% 88%",
      heroC: "45 95% 85%",
      gradStart: "15 85% 68%",
      gradEnd: "340 80% 65%",
    },
  },
  {
    id: "sky",
    name: "Cotton Sky",
    emoji: "☁️",
    vars: {
      background: "200 70% 96%",
      foreground: "215 40% 20%",
      card: "200 80% 99%",
      primary: "210 85% 62%",
      primarySoft: "210 90% 92%",
      secondary: "190 70% 88%",
      accent: "330 80% 70%",
      accentSoft: "330 80% 92%",
      highlight: "50 95% 78%",
      muted: "210 40% 92%",
      border: "210 50% 88%",
      ring: "210 85% 62%",
      heroA: "210 90% 85%",
      heroB: "190 85% 85%",
      heroC: "330 80% 88%",
      gradStart: "210 85% 65%",
      gradEnd: "190 80% 55%",
    },
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    emoji: "💜",
    vars: {
      background: "270 50% 96%",
      foreground: "275 35% 20%",
      card: "270 60% 99%",
      primary: "275 65% 65%",
      primarySoft: "275 70% 92%",
      secondary: "300 50% 90%",
      accent: "340 80% 70%",
      accentSoft: "340 80% 92%",
      highlight: "50 95% 80%",
      muted: "270 30% 92%",
      border: "270 40% 88%",
      ring: "275 65% 65%",
      heroA: "275 70% 85%",
      heroB: "300 70% 88%",
      heroC: "210 80% 88%",
      gradStart: "275 65% 68%",
      gradEnd: "300 60% 60%",
    },
  },
  {
    id: "matcha",
    name: "Matcha Mint",
    emoji: "🍵",
    vars: {
      background: "85 35% 93%",
      foreground: "120 30% 16%",
      card: "85 40% 97%",
      primary: "95 45% 45%",
      primarySoft: "95 50% 88%",
      secondary: "165 45% 88%",
      accent: "20 80% 65%",
      accentSoft: "20 80% 92%",
      highlight: "50 95% 78%",
      muted: "85 25% 90%",
      border: "85 30% 85%",
      ring: "95 45% 45%",
      heroA: "95 50% 82%",
      heroB: "165 55% 82%",
      heroC: "50 95% 85%",
      gradStart: "95 50% 50%",
      gradEnd: "120 45% 38%",
    },
  },
  {
    id: "butter",
    name: "Butter Cream",
    emoji: "🌼",
    vars: {
      background: "50 80% 95%",
      foreground: "30 35% 20%",
      card: "50 90% 98%",
      primary: "40 90% 55%",
      primarySoft: "45 95% 88%",
      secondary: "30 70% 88%",
      accent: "330 80% 68%",
      accentSoft: "330 80% 92%",
      highlight: "85 60% 78%",
      muted: "50 50% 92%",
      border: "45 60% 86%",
      ring: "40 90% 55%",
      heroA: "45 95% 85%",
      heroB: "330 80% 88%",
      heroC: "85 60% 85%",
      gradStart: "40 90% 60%",
      gradEnd: "20 85% 55%",
    },
  },
];

const STORAGE_KEY = "vital.theme.v1";
const DEFAULT_ID = "sage";

const apply = (theme: Theme) => {
  const root = document.documentElement;
  const v = theme.vars;
  const set = (k: string, val: string) => root.style.setProperty(k, val);
  set("--background", v.background);
  set("--foreground", v.foreground);
  set("--card", v.card);
  set("--card-foreground", v.foreground);
  set("--popover", v.card);
  set("--popover-foreground", v.foreground);
  set("--primary", v.primary);
  set("--primary-soft", v.primarySoft);
  set("--secondary", v.secondary);
  set("--secondary-foreground", v.foreground);
  set("--accent", v.accent);
  set("--accent-soft", v.accentSoft);
  set("--highlight", v.highlight);
  set("--muted", v.muted);
  set("--border", v.border);
  set("--input", v.border);
  set("--ring", v.ring);
  set("--sidebar-background", v.background);
  set("--sidebar-foreground", v.foreground);
  set("--sidebar-primary", v.primary);
  set("--sidebar-accent", v.primarySoft);
  set("--sidebar-border", v.border);
  set("--sidebar-ring", v.ring);
  // Per-theme signature compositions — each theme gets its own arrangement of blobs and conics
  type Sig = { hero: string[]; mesh: string[] };
  const signatures: Record<string, Sig> = {
    sage: {
      hero: [
        `radial-gradient(ellipse 70% 55% at 12% -5%, hsl(${v.heroA} / 0.95), transparent 62%)`,
        `radial-gradient(ellipse 50% 45% at 88% 5%, hsl(${v.heroB} / 0.8), transparent 58%)`,
        `radial-gradient(ellipse 80% 60% at 50% 115%, hsl(${v.heroC} / 0.95), transparent 65%)`,
        `radial-gradient(circle 38% at 95% 55%, hsl(${v.primarySoft} / 0.75), transparent 60%)`,
        `radial-gradient(circle 32% at 5% 70%, hsl(${v.accentSoft} / 0.65), transparent 60%)`,
        `conic-gradient(from 200deg at 68% 28%, hsl(${v.heroB} / 0.28), hsl(${v.heroA} / 0.12), hsl(${v.heroC} / 0.22), hsl(${v.heroB} / 0.28))`,
      ],
      mesh: [
        `radial-gradient(at 10% 15%, hsl(${v.heroA} / 0.7), transparent 50%)`,
        `radial-gradient(at 90% 85%, hsl(${v.heroC} / 0.6), transparent 52%)`,
        `radial-gradient(at 60% 40%, hsl(${v.primarySoft} / 0.55), transparent 55%)`,
        `radial-gradient(at 25% 90%, hsl(${v.accentSoft} / 0.5), transparent 50%)`,
      ],
    },
    bubblegum: {
      hero: [
        `radial-gradient(ellipse 65% 55% at 20% 0%, hsl(${v.heroA} / 1), transparent 60%)`,
        `radial-gradient(ellipse 60% 50% at 90% 15%, hsl(${v.heroB} / 0.9), transparent 60%)`,
        `radial-gradient(ellipse 75% 55% at 50% 120%, hsl(${v.heroC} / 0.95), transparent 65%)`,
        `radial-gradient(circle 30% at 8% 50%, hsl(${v.accent} / 0.35), transparent 60%)`,
        `radial-gradient(circle 35% at 92% 65%, hsl(${v.primarySoft} / 0.85), transparent 60%)`,
        `conic-gradient(from 320deg at 50% 50%, hsl(${v.heroA} / 0.3), hsl(${v.heroB} / 0.22), hsl(${v.heroC} / 0.28), hsl(${v.heroA} / 0.3))`,
      ],
      mesh: [
        `radial-gradient(at 15% 20%, hsl(${v.heroA} / 0.75), transparent 50%)`,
        `radial-gradient(at 85% 80%, hsl(${v.heroB} / 0.65), transparent 50%)`,
        `radial-gradient(at 50% 50%, hsl(${v.heroC} / 0.55), transparent 55%)`,
        `radial-gradient(at 70% 15%, hsl(${v.accent} / 0.3), transparent 45%)`,
      ],
    },
    peach: {
      hero: [
        `radial-gradient(ellipse 60% 50% at 10% 5%, hsl(${v.heroA} / 0.95), transparent 60%)`,
        `radial-gradient(ellipse 55% 45% at 95% 0%, hsl(${v.highlight} / 0.7), transparent 60%)`,
        `radial-gradient(ellipse 70% 55% at 50% 110%, hsl(${v.heroB} / 0.9), transparent 65%)`,
        `radial-gradient(circle 40% at 80% 70%, hsl(${v.heroC} / 0.7), transparent 60%)`,
        `radial-gradient(circle 28% at 0% 50%, hsl(${v.primarySoft} / 0.75), transparent 60%)`,
        `conic-gradient(from 40deg at 30% 70%, hsl(${v.heroA} / 0.28), hsl(${v.heroB} / 0.2), hsl(${v.highlight} / 0.22), hsl(${v.heroA} / 0.28))`,
      ],
      mesh: [
        `radial-gradient(at 12% 22%, hsl(${v.heroA} / 0.7), transparent 50%)`,
        `radial-gradient(at 88% 78%, hsl(${v.heroB} / 0.6), transparent 50%)`,
        `radial-gradient(at 55% 55%, hsl(${v.highlight} / 0.45), transparent 55%)`,
        `radial-gradient(at 30% 85%, hsl(${v.primarySoft} / 0.55), transparent 50%)`,
      ],
    },
    sky: {
      hero: [
        `radial-gradient(ellipse 75% 55% at 50% -10%, hsl(${v.heroA} / 0.95), transparent 65%)`,
        `radial-gradient(ellipse 50% 40% at 10% 40%, hsl(${v.heroB} / 0.75), transparent 60%)`,
        `radial-gradient(ellipse 55% 45% at 90% 50%, hsl(${v.heroC} / 0.7), transparent 60%)`,
        `radial-gradient(ellipse 80% 50% at 50% 115%, hsl(${v.primarySoft} / 0.85), transparent 65%)`,
        `conic-gradient(from 180deg at 50% 30%, hsl(${v.heroA} / 0.25), hsl(${v.heroB} / 0.18), hsl(${v.heroC} / 0.2), hsl(${v.heroA} / 0.25))`,
      ],
      mesh: [
        `radial-gradient(at 20% 10%, hsl(${v.heroA} / 0.7), transparent 55%)`,
        `radial-gradient(at 80% 90%, hsl(${v.primarySoft} / 0.6), transparent 50%)`,
        `radial-gradient(at 50% 50%, hsl(${v.heroB} / 0.5), transparent 55%)`,
        `radial-gradient(at 90% 30%, hsl(${v.heroC} / 0.45), transparent 50%)`,
      ],
    },
    lavender: {
      hero: [
        `radial-gradient(ellipse 60% 50% at 15% 0%, hsl(${v.heroA} / 0.95), transparent 60%)`,
        `radial-gradient(ellipse 55% 45% at 85% 10%, hsl(${v.heroB} / 0.85), transparent 60%)`,
        `radial-gradient(ellipse 70% 60% at 50% 115%, hsl(${v.heroC} / 0.85), transparent 65%)`,
        `radial-gradient(circle 36% at 95% 60%, hsl(${v.accentSoft} / 0.7), transparent 60%)`,
        `radial-gradient(circle 32% at 5% 75%, hsl(${v.primarySoft} / 0.7), transparent 60%)`,
        `conic-gradient(from 260deg at 60% 40%, hsl(${v.heroA} / 0.3), hsl(${v.heroB} / 0.22), hsl(${v.heroC} / 0.2), hsl(${v.heroA} / 0.3))`,
      ],
      mesh: [
        `radial-gradient(at 12% 18%, hsl(${v.heroA} / 0.7), transparent 50%)`,
        `radial-gradient(at 88% 82%, hsl(${v.heroB} / 0.6), transparent 50%)`,
        `radial-gradient(at 50% 50%, hsl(${v.heroC} / 0.5), transparent 55%)`,
        `radial-gradient(at 30% 90%, hsl(${v.accentSoft} / 0.55), transparent 50%)`,
      ],
    },
    matcha: {
      hero: [
        `radial-gradient(ellipse 65% 55% at 18% -5%, hsl(${v.heroA} / 0.95), transparent 62%)`,
        `radial-gradient(ellipse 50% 45% at 90% 10%, hsl(${v.highlight} / 0.6), transparent 60%)`,
        `radial-gradient(ellipse 75% 60% at 50% 115%, hsl(${v.heroB} / 0.9), transparent 65%)`,
        `radial-gradient(circle 38% at 92% 60%, hsl(${v.primarySoft} / 0.75), transparent 60%)`,
        `radial-gradient(circle 30% at 8% 65%, hsl(${v.accentSoft} / 0.6), transparent 60%)`,
        `conic-gradient(from 150deg at 70% 35%, hsl(${v.heroA} / 0.28), hsl(${v.heroB} / 0.2), hsl(${v.highlight} / 0.18), hsl(${v.heroA} / 0.28))`,
      ],
      mesh: [
        `radial-gradient(at 10% 20%, hsl(${v.heroA} / 0.7), transparent 50%)`,
        `radial-gradient(at 90% 80%, hsl(${v.heroB} / 0.6), transparent 50%)`,
        `radial-gradient(at 55% 50%, hsl(${v.highlight} / 0.45), transparent 55%)`,
        `radial-gradient(at 25% 90%, hsl(${v.primarySoft} / 0.55), transparent 50%)`,
      ],
    },
    butter: {
      hero: [
        `radial-gradient(ellipse 65% 55% at 12% 0%, hsl(${v.heroA} / 1), transparent 62%)`,
        `radial-gradient(ellipse 55% 45% at 92% 8%, hsl(${v.heroB} / 0.85), transparent 60%)`,
        `radial-gradient(ellipse 75% 60% at 50% 115%, hsl(${v.heroC} / 0.85), transparent 65%)`,
        `radial-gradient(circle 40% at 95% 55%, hsl(${v.highlight} / 0.55), transparent 60%)`,
        `radial-gradient(circle 30% at 5% 75%, hsl(${v.accentSoft} / 0.7), transparent 60%)`,
        `conic-gradient(from 60deg at 50% 50%, hsl(${v.heroA} / 0.3), hsl(${v.highlight} / 0.22), hsl(${v.heroB} / 0.2), hsl(${v.heroA} / 0.3))`,
      ],
      mesh: [
        `radial-gradient(at 14% 18%, hsl(${v.heroA} / 0.75), transparent 50%)`,
        `radial-gradient(at 86% 82%, hsl(${v.heroB} / 0.6), transparent 50%)`,
        `radial-gradient(at 50% 50%, hsl(${v.highlight} / 0.5), transparent 55%)`,
        `radial-gradient(at 30% 88%, hsl(${v.heroC} / 0.5), transparent 50%)`,
      ],
    },
  };
  const sig = signatures[theme.id] ?? signatures.sage;
  set("--gradient-hero", [...sig.hero, `hsl(${v.background})`].join(", "));
  set("--gradient-mesh", sig.mesh.join(", "));
  set("--gradient-sage", `linear-gradient(135deg, hsl(${v.gradStart}) 0%, hsl(${v.gradEnd}) 100%)`);
  set(
    "--gradient-zen",
    `linear-gradient(135deg, hsl(${v.primarySoft}) 0%, hsl(${v.heroC}) 50%, hsl(${v.accentSoft}) 100%)`,
  );
  set(
    "--gradient-warm",
    `linear-gradient(135deg, hsl(${v.highlight}) 0%, hsl(${v.accent}) 60%, hsl(${v.primary}) 100%)`,
  );
  set(
    "--gradient-aurora",
    `linear-gradient(120deg, hsl(${v.gradStart}) 0%, hsl(${v.primary}) 28%, hsl(${v.accent}) 55%, hsl(${v.heroB}) 78%, hsl(${v.highlight}) 100%)`,
  );

};

const read = (): string => {
  if (typeof window === "undefined") return DEFAULT_ID;
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
};

export const useTheme = () => {
  const [id, setId] = useState<string>(read);

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
    const run = () => apply(theme);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(run);
    } else {
      run();
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { /* ignore */ }
  }, [id]);

  return { themes: THEMES, currentId: id, setTheme: setId };
};


if (typeof window !== "undefined") {
  const initial = THEMES.find((t) => t.id === read()) ?? THEMES[0];
  apply(initial);
}
