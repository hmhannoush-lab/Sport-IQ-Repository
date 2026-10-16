import { useEffect, useState } from "react";

export type LanguageCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "sv"
  | "ja"
  | "zh"
  | "ko"
  | "ar";

export interface Language {
  code: LanguageCode;
  name: string;
  native: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
];

const STORAGE_KEY = "vital.language.v1";
const DEFAULT: LanguageCode = "en";

const read = (): LanguageCode => {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && LANGUAGES.some((l) => l.code === raw)) return raw as LanguageCode;
  } catch { /* ignore */ }
  return DEFAULT;
};

const apply = (code: LanguageCode) => {
  document.documentElement.lang = code;
  document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
};

export const useLanguage = () => {
  const [code, setCode] = useState<LanguageCode>(read);

  useEffect(() => {
    apply(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch { /* ignore */ }
    window.dispatchEvent(new Event("vital-language-update"));
  }, [code]);

  useEffect(() => {
    const handler = () => setCode(read());
    window.addEventListener("vital-language-update", handler);
    return () => window.removeEventListener("vital-language-update", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

  return { code, current, languages: LANGUAGES, setLanguage: setCode };
};

if (typeof window !== "undefined") {
  apply(read());
}
