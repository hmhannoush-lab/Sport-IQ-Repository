import { useEffect, useState } from "react";
import { FONTS, findFont, loadFont } from "@/lib/fonts";

const STORAGE_KEY = "vital.fontPrefs.v1";
const DEFAULTS = { headingId: "baloo", bodyId: "nunito", scale: 1 };

type Prefs = { headingId: string; bodyId: string; scale: number };

const read = (): Prefs => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
};

const apply = (p: Prefs) => {
  const heading = findFont(p.headingId) ?? findFont(DEFAULTS.headingId)!;
  const body = findFont(p.bodyId) ?? findFont(DEFAULTS.bodyId)!;
  loadFont(heading);
  loadFont(body);
  const root = document.documentElement;
  root.style.setProperty("--font-display", heading.stack);
  root.style.setProperty("--font-body", body.stack);
  root.style.setProperty("--font-scale", String(p.scale));
};

export const useFontPrefs = () => {
  const [prefs, setPrefs] = useState<Prefs>(read);

  useEffect(() => {
    apply(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }, [prefs]);

  return {
    prefs,
    setHeading: (id: string) => setPrefs((p) => ({ ...p, headingId: id })),
    setBody: (id: string) => setPrefs((p) => ({ ...p, bodyId: id })),
    setScale: (scale: number) => setPrefs((p) => ({ ...p, scale })),
    reset: () => setPrefs(DEFAULTS),
    fonts: FONTS,
  };
};

// Eagerly apply saved prefs on module load so fonts persist on refresh.
if (typeof window !== "undefined") {
  apply(read());
}
