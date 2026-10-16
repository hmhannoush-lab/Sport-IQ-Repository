import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, type LanguageCode } from "@/hooks/use-language";

type Cache = Record<string, string>;

const cacheKey = (lang: LanguageCode) => `vital.i18n.${lang}.v1`;

const loadCache = (lang: LanguageCode): Cache => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveCache = (lang: LanguageCode, cache: Cache) => {
  try { localStorage.setItem(cacheKey(lang), JSON.stringify(cache)); } catch { /* ignore */ }
};

interface Ctx {
  t: (text: string) => string;
  lang: LanguageCode;
  ready: boolean;
}

const I18nContext = createContext<Ctx>({ t: (s) => s, lang: "en", ready: true });

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { code } = useLanguage();
  const [cache, setCache] = useState<Cache>(() => loadCache(code));
  const [version, setVersion] = useState(0);
  const pending = useRef<Set<string>>(new Set());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);

  // Reload cache when language changes
  useEffect(() => {
    setCache(loadCache(code));
    pending.current.clear();
  }, [code]);

  const flush = useCallback(async () => {
    if (code === "en") { pending.current.clear(); return; }
    if (inflight.current) return;
    const batch = Array.from(pending.current);
    if (batch.length === 0) return;
    pending.current.clear();
    inflight.current = true;
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: batch, target: code },
      });
      if (!error && data?.translations) {
        const translations: string[] = data.translations;
        const next = { ...loadCache(code) };
        batch.forEach((src, i) => { next[src] = translations[i] ?? src; });
        saveCache(code, next);
        setCache(next);
        setVersion((v) => v + 1);
      }
    } catch {
      // swallow; will retry next render
    } finally {
      inflight.current = false;
      if (pending.current.size > 0) scheduleFlush();
    }
  }, [code]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, 120);
  }, [flush]);

  const t = useCallback((text: string): string => {
    if (!text) return text;
    if (code === "en") return text;
    if (cache[text]) return cache[text];
    if (!pending.current.has(text)) {
      pending.current.add(text);
      scheduleFlush();
    }
    return text; // show English while loading
  }, [cache, code, scheduleFlush]);

  // Force consumers to re-render when version bumps
  useEffect(() => {}, [version]);

  const value = useMemo<Ctx>(() => ({ t, lang: code, ready: true }), [t, code, version]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useT = () => useContext(I18nContext).t;

export const T = ({ children }: { children: string }) => {
  const t = useT();
  return <>{t(children)}</>;
};
