import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { evaluateAlerts, resolveAlertRules, formatAlertValue, toAlertEvent } from "@/lib/alerts";
import { sendBadgeNotification } from "@/lib/pushNotifications";
import { playNotificationSound } from "@/lib/sounds";
import { notificationsMuted } from "@/lib/quietHours";

const STORAGE_KEY = "vital.metricAlerts.notified.v1";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSeen(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set].slice(-100)));
  } catch {
    /* ignore */
  }
}

/** Fires one toast + optional push per crossed threshold, once per day. */
export function useMetricAlertNotifier() {
  const { store, logAlertEvents } = useStore();
  const firstRun = useRef(true);

  useEffect(() => {
    const rules = resolveAlertRules(store.alertRules);
    const triggered = evaluateAlerts(rules, store.metrics, store.workouts);
    const seen = loadSeen();

    if (firstRun.current) {
      firstRun.current = false;
      // Still notify on load — thresholds matter even if the page just opened.
    }

    let changed = false;
    logAlertEvents(triggered.map(toAlertEvent));
    // During quiet hours nothing is surfaced and nothing is marked as seen,
    // so the alert re-fires once quiet hours end.
    if (notificationsMuted()) return;

    for (const a of triggered) {
      if (seen.has(a.id)) continue;
      const dir = a.rule.direction === "above" ? "above" : "below";
      const title = `${a.def.label} ${dir} your threshold`;
      const body = `${formatAlertValue(a.def, a.value)} vs ${formatAlertValue(a.def, a.rule.threshold)} — see Coach notes on the dashboard.`;
      if (!notificationsMuted()) toast(title, { description: body, duration: 8000 });
      sendBadgeNotification(title, body);
      seen.add(a.id);
      changed = true;
    }
    if (changed) {
      saveSeen(seen);
      playNotificationSound();
    }
  }, [store.alertRules, store.metrics, store.workouts]);
}
