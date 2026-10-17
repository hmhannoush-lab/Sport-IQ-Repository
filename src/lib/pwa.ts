import { useEffect, useState } from "react";

/** Chrome/Edge/Android fire this before showing their own install banner. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/**
 * Registers the offline service worker and starts listening for the browser's
 * install prompt. Call once at startup. Skipped in dev so Vite's hot reload
 * isn't served stale files from the cache.
 */
export function initPwa() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Offline support is optional — the app still works without it. */
      });
    });
  }
}

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

/** Whether the app can be installed right now, and a function that shows the prompt. */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(Boolean(deferredPrompt));
  useEffect(() => {
    const update = () => setCanInstall(Boolean(deferredPrompt));
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return outcome === "accepted";
  };

  return { canInstall, install, installed: isStandalone() };
}
