import { useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, type LanguageCode } from "@/hooks/use-language";

/**
 * DOM-level auto-translator.
 *
 * When the user picks a non-English language, this provider walks the live
 * DOM and translates every visible text node via the `translate` edge
 * function (which uses Lovable AI). It re-runs on DOM mutations so newly
 * rendered content — Coach AI replies, instructions, dynamic lists — also
 * gets translated. Results are cached per-language in localStorage so we
 * don't re-translate the same string twice.
 */

type Cache = Record<string, string>;

const cacheKey = (lang: LanguageCode) => `vital.dom-i18n.${lang}.v1`;

const loadCache = (lang: LanguageCode): Cache => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCache = (lang: LanguageCode, cache: Cache) => {
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify(cache));
  } catch { /* ignore */ }
};

// Tags whose text content should never be translated.
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "INPUT",
  "SVG",
  "PATH",
  "CANVAS",
  "KBD",
  "SAMP",
  "VAR",
  "OUTPUT",
  "MATH",
  "ABBR",
  "TIME",
  "DATA",
]);

// Class-name patterns that signal code, numbers, or metrics.
const SKIP_CLASS_PATTERNS = /\b(code|hljs|prism|language-|math|formula|mono|number|stat|metric|value|unit|data-label|data-value)\b/;

// Strings we never bother sending to the model.
const isTranslatable = (s: string) => {
  const trimmed = s.trim();
  if (trimmed.length < 2) return false;

  // Pure numbers / units / symbols.
  if (/^[\d\s.,:/+\-%°]+$/.test(trimmed)) return false;

  // Must contain at least one letter.
  if (!/[A-Za-z\u00C0-\u024F]/.test(trimmed)) return false;

  // Skip code-like content: operators, brackets, semicolons, backticks, etc.
  if (/[{}[\]();=<>!&|]+\s*[{}[\]();=<>!&|]+/.test(trimmed)) return false;
  if (/`[^`]+`/.test(trimmed)) return false; // backtick code
  if (/^\$[\w_]+/.test(trimmed)) return false; // $variable
  if (/\b(function|const|let|var|return|import|export|class|if|else|for|while)\b/.test(trimmed)) return false;

  // Skip standalone measurement units and short metric abbreviations.
  if (/^(bpm|kg|ml|kcal|cal|g|mg|min|mins|h|hr|hrs|hours?|steps|%|°[CF]|oz|lb|lbs|ft|in|cm|mm|m|km|mi|yd|lb|reps?|sets?| laps?)$/i.test(trimmed)) return false;

  // Skip strings that look like measurement values (number + unit).
  // e.g., "120 bpm", "8,432 steps", "72.5 kg", "2,000 kcal", "7.5 h", "65 %"
  if (/^\d[\d\s.,]*\s*(bpm|kg|ml|kcal|cal|g|mg|min|mins|h|hr|hrs|hours?|steps|%|°[CF]|oz|lb|lbs|ft|in|cm|mm|m|km|mi|yd|reps?|sets?|laps?)\b/i.test(trimmed)) return false;

  // Skip if string is dominated by non-letters (more than 3× non-letters vs letters).
  const letters = (trimmed.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
  if (letters === 0) return false;
  const nonLetters = trimmed.length - letters;
  if (nonLetters > letters * 3) return false;

  return true;
};

const shouldSkipElement = (el: Element): boolean => {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.getAttribute("translate") === "no") return true;
  if (el.getAttribute("data-no-translate") !== null) return true;
  if ((el as HTMLElement).isContentEditable) return true;

  // Skip elements whose class indicates code, math, or metric values.
  const className = (el.className?.toString() ?? "").toLowerCase();
  if (className && SKIP_CLASS_PATTERNS.test(className)) return true;

  return false;
};

interface PendingNode {
  node: Text;
  original: string;
  leading: string;
  trailing: string;
  core: string;
}

const splitWhitespace = (text: string) => {
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.slice(leading.length, text.length - trailing.length);
  return { leading, trailing, core };
};

export const DomTranslator = ({ children }: { children: ReactNode }) => {
  const { code } = useLanguage();
  const codeRef = useRef<LanguageCode>(code);
  const cacheRef = useRef<Cache>(loadCache(code));
  // Track the original English text for every node we've touched so we can
  // restore / re-translate when the language changes.
  const originals = useRef<WeakMap<Text, string>>(new WeakMap());
  const pending = useRef<Map<string, Text[]>>(new Map());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);

  useEffect(() => {
    codeRef.current = code;
    cacheRef.current = loadCache(code);

    if (typeof window === "undefined") return;

    const applyToNode = (node: Text) => {
      const lang = codeRef.current;
      const original = originals.current.get(node) ?? node.nodeValue ?? "";
      if (!originals.current.has(node)) {
        originals.current.set(node, original);
      }

      if (lang === "en") {
        if (node.nodeValue !== original) node.nodeValue = original;
        return;
      }

      const { leading, trailing, core } = splitWhitespace(original);
      if (!isTranslatable(core)) return;

      const cached = cacheRef.current[core];
      if (cached) {
        const next = leading + cached + trailing;
        if (node.nodeValue !== next) node.nodeValue = next;
        return;
      }

      // Queue for translation.
      const list = pending.current.get(core) ?? [];
      list.push(node);
      pending.current.set(core, list);
      scheduleFlush();
    };

    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        const parent = (root as Text).parentElement;
        if (parent && !shouldSkipElement(parent)) {
          let p: Element | null = parent;
          while (p) {
            if (shouldSkipElement(p)) return;
            p = p.parentElement;
          }
          applyToNode(root as Text);
        }
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      if (shouldSkipElement(el)) return;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const parent = (n as Text).parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          let p: Element | null = parent;
          while (p) {
            if (shouldSkipElement(p)) return NodeFilter.FILTER_REJECT;
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      let n: Node | null;
      while ((n = walker.nextNode())) applyToNode(n as Text);
    };

    const scheduleFlush = () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, 180);
    };

    const flush = async () => {
      const lang = codeRef.current;
      if (lang === "en" || inflight.current) return;
      const entries = Array.from(pending.current.entries());
      if (entries.length === 0) return;
      pending.current.clear();

      // De-dupe and cap batch size to keep model latency reasonable.
      const batch = entries.slice(0, 60);
      const leftovers = entries.slice(60);
      leftovers.forEach(([k, v]) => pending.current.set(k, v));

      const texts = batch.map(([k]) => k);
      inflight.current = true;
      try {
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { texts, target: lang },
        });
        if (!error && data?.translations && Array.isArray(data.translations)) {
          const translations: string[] = data.translations;
          const nextCache = { ...cacheRef.current };
          batch.forEach(([source, nodes], i) => {
            const translated = translations[i] ?? source;
            nextCache[source] = translated;
            // Only update nodes still attached to the same English original.
            nodes.forEach((node) => {
              if (codeRef.current !== lang) return;
              const orig = originals.current.get(node);
              if (!orig) return;
              const { leading, trailing, core } = splitWhitespace(orig);
              if (core !== source) return;
              node.nodeValue = leading + translated + trailing;
            });
          });
          cacheRef.current = nextCache;
          saveCache(lang, nextCache);
        }
      } catch {
        // Re-queue on failure so a later mutation triggers another attempt.
        batch.forEach(([k, v]) => {
          const existing = pending.current.get(k) ?? [];
          pending.current.set(k, existing.concat(v));
        });
      } finally {
        inflight.current = false;
        if (pending.current.size > 0) scheduleFlush();
      }
    };

    // Initial pass.
    walk(document.body);

    // Observe future changes.
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") {
          const node = m.target as Text;
          // If the value changed for a reason other than our own edit,
          // refresh our recorded original.
          const recorded = originals.current.get(node);
          const current = node.nodeValue ?? "";
          if (!recorded || (codeRef.current === "en" && current !== recorded)) {
            originals.current.set(node, current);
          } else if (codeRef.current !== "en") {
            const { core } = splitWhitespace(current);
            // Heuristic: if we don't recognise this as a known translation,
            // treat it as a fresh English string.
            const known = Object.values(cacheRef.current).includes(current.trim());
            if (!known && current !== recorded) {
              originals.current.set(node, current);
            }
          }
          applyToNode(node);
        } else if (m.type === "childList") {
          m.addedNodes.forEach((n) => walk(n));
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [code]);

  return <>{children}</>;
};
