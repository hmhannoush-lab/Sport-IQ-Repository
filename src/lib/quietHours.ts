// Quiet hours: suppress alert sounds + push notifications during sleep time.

const KEY = "vital.quietHours.v1";

export interface QuietHoursPrefs {
  enabled: boolean;
  start: string; // HH:MM
  end: string; // HH:MM
  muteSound: boolean;
  muteNotifications: boolean;
}

export const defaultQuietHours: QuietHoursPrefs = {
  enabled: true,
  start: "22:00",
  end: "07:00",
  muteSound: true,
  muteNotifications: true,
};

export function getQuietHours(): QuietHoursPrefs {
  if (typeof window === "undefined") return defaultQuietHours;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultQuietHours;
    return { ...defaultQuietHours, ...JSON.parse(raw) };
  } catch {
    return defaultQuietHours;
  }
}

export function setQuietHours(patch: Partial<QuietHoursPrefs>): QuietHoursPrefs {
  const next = { ...getQuietHours(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vital-quiet-hours-update"));
  }
  return next;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

/** True when `date` falls inside the configured quiet window (handles overnight spans). */
export function isQuietNow(date: Date = new Date(), prefs = getQuietHours()): boolean {
  if (!prefs.enabled) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(prefs.start);
  const end = toMinutes(prefs.end);
  if (start === end) return false;
  return start < end ? now >= start && now < end : now >= start || now < end;
}

export function soundMuted(date?: Date): boolean {
  const prefs = getQuietHours();
  return prefs.muteSound && isQuietNow(date, prefs);
}

export function notificationsMuted(date?: Date): boolean {
  const prefs = getQuietHours();
  return prefs.muteNotifications && isQuietNow(date, prefs);
}
