import { useEffect } from "react";
import { useStore, todayKey } from "@/lib/store";
import {
  notificationsSupported,
  sendBadgeNotification,
  notificationsEnabled,
} from "@/lib/pushNotifications";

const FIRED_KEY = "vital.morningReminder.lastFiredDate";

/**
 * Fires a single morning push notification per day, at or after the user's
 * configured `reminderTime`, prompting them to log their daily recovery /
 * wellness data if they haven't already.
 *
 * Browser notifications require the page to be open — this hook schedules a
 * check on mount and again at the reminder time.
 */
export function useMorningReminder() {
  const { store } = useStore();
  const reminderTime = store.preferences?.reminderTime ?? "08:00";
  const enabled = store.preferences?.notifications ?? false;

  useEffect(() => {
    if (!enabled) return;
    if (!notificationsSupported()) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const tryFire = () => {
      const today = todayKey();
      if (typeof localStorage !== "undefined" && localStorage.getItem(FIRED_KEY) === today) return;

      const now = new Date();
      const [h, m] = reminderTime.split(":").map(Number);
      const target = new Date();
      target.setHours(h || 8, m || 0, 0, 0);

      // Already past reminder time today? Check whether user logged anything.
      if (now >= target) {
        const loggedToday =
          store.metrics[today] !== undefined ||
          store.fatigue.some((f) => f.date === today);
        if (!loggedToday && notificationsEnabled()) {
          sendBadgeNotification(
            "Good morning ☀️",
            "Take 30 seconds to log how you slept and how you're feeling today.",
          );
        }
        try { localStorage.setItem(FIRED_KEY, today); } catch { /* ignore */ }
      } else {
        // Schedule for exact reminder time
        const ms = target.getTime() - now.getTime();
        timer = setTimeout(tryFire, ms + 500);
      }
    };

    tryFire();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, reminderTime, store.metrics, store.fatigue]);
}
