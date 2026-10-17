import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Lifestyle = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Diet = "omnivore" | "vegetarian" | "vegan" | "pescatarian";
export type Goal = "lose" | "maintain" | "gain" | "performance";
export type Sex = "male" | "female";

export interface Profile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  lifestyle: Lifestyle;
  diet: Diet;
  goal: Goal;
  /** Optional secondary goal, layered on top of the primary one. */
  secondaryGoal?: Goal;
  // Avatar emoji chosen during onboarding (e.g. "🌿")
  avatar?: string;
  // Optional profile picture as a data URL (stored locally)
  avatarImage?: string;
  // Personal goal details — used by ProgressCompare to gauge how close the user is
  targetWeightKg?: number;
  goalDetail?: string;
  goalTimeframeWeeks?: number;
  // Snapshot of starting weight at onboarding, so progress is measured from a fixed baseline
  startWeightKg?: number;
  goalStartedAt?: string; // ISO date
  /** ISO timestamp when the user accepted the medical disclaimer at sign-up. */
  medicalDisclaimerAcceptedAt?: string;
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  waterMl: number;
  sleepHours: number;
  steps: number;
  restingHr: number;
  mood: number; // 1-5
  // Extended tracking
  weightKg?: number;
  activeMinutes?: number;
  calories?: number;
  proteinG?: number;
  carbG?: number;
  fatG?: number;
  fatigueLevel?: number; // 1-10
  soreness?: number; // 1-10
}

export interface Workout {
  id: string;
  date: string;
  type: string;
  durationMin: number;
  intensity: "low" | "medium" | "high";
  notes?: string;
  /** Strength sets logged during the session, in the order performed. */
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  exercise: string;
  reps: number;
  /** Load in kg; omitted for bodyweight sets. */
  weightKg?: number;
}

/** A saved session the user can re-log in one tap. */
export interface WorkoutTemplate {
  id: string;
  name: string;
  type: string;
  durationMin: number;
  intensity: Workout["intensity"];
  sets?: WorkoutSet[];
}

export interface FatigueEntry {
  id: string;
  date: string;
  fatigueLevel: number; // 1-10
  soreness: string[];
  injuries: string;
  sleepQuality: number; // 1-5
}

export interface SportPractice {
  sportId: string;
  level: "beginner" | "intermediate" | "advanced" | "competitive";
  sessionsPerWeek: number;
  notes?: string;
  /** Display name for custom (user-added) sports that aren't in the built-in list. */
  customName?: string;
}

export interface HealthBaseline {
  avgSleepHours: number;
  restingHr: number;
  injuries: string;
  fatigueLevel: number; // 1-10
  stressLevel: number; // 1-10
  dailyWaterMl: number;
  currentPain: string;
  moldExposure: "none" | "suspected" | "confirmed";
  medicalConditions: string;
  /** Food allergies / intolerances selected at onboarding (allergen ids, see lib/allergies). */
  allergies?: string[];
  /** Free-text extra allergies or intolerances. */
  allergyNotes?: string;
}


export interface Preferences {
  units: "metric" | "imperial";
  reminderTime: string; // HH:MM
  motivationStyle: "gentle" | "balanced" | "intense";
  notifications: boolean;
}

export type FriendRelationship =
  | "training-partner"
  | "coach"
  | "family"
  | "friend"
  | "rival";

export interface Friend {
  id: string;
  addedAt: number;
  relationship?: FriendRelationship;
  // Stored snapshot — kept minimal, decoded from a share code
  snapshot: import("./shareCode").FriendSnapshot;
}

export interface Tournament {
  name: string;
  /** ISO date YYYY-MM-DD of the event. */
  date: string;
  /** Optional sport this event belongs to. */
  sport?: string;
}

export type RecordUnit = "kg" | "reps" | "km" | "min" | "s";

export interface PersonalRecord {
  id: string;
  exercise: string;
  value: number;
  unit: RecordUnit;
  /** ISO date YYYY-MM-DD. */
  date: string;
}

/** Time-based records improve when the number goes down. */
export const lowerIsBetter = (unit: RecordUnit) => unit === "min" || unit === "s";

interface Store {
  profile: Profile | null;
  metrics: Record<string, DailyMetrics>;
  workouts: Workout[];
  fatigue: FatigueEntry[];
  sports: SportPractice[];
  healthBaseline: HealthBaseline | null;
  preferences: Preferences | null;
  hasSeenRoadmap: boolean;
  friends: Friend[];
  alertRules: import("./alerts").AlertRule[];
  alertHistory: import("./alerts").AlertEvent[];
  tournament: Tournament | null;
  records: PersonalRecord[];
  templates: WorkoutTemplate[];
}

const KEY = "vital-store-v1";

export const defaultPreferences: Preferences = {
  units: "metric", reminderTime: "08:00", motivationStyle: "balanced", notifications: true,
};

const defaultStore: Store = {
  profile: null,
  metrics: {},
  workouts: [],
  fatigue: [],
  sports: [],
  healthBaseline: null,
  preferences: null,
  hasSeenRoadmap: false,
  friends: [],
  alertRules: [],
  alertHistory: [],
  tournament: null,
  records: [],
  templates: [],
};

const ARRAY_KEYS = ["workouts", "fatigue", "sports", "friends", "alertRules", "alertHistory", "records", "templates"] as const;

/** Checks that a parsed backup file has the shape of a store before restoring it. */
function isStoreBackup(data: unknown): data is Partial<Store> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const d = data as Record<string, unknown>;
  if (d.profile !== null && (typeof d.profile !== "object" || typeof (d.profile as Profile)?.name !== "string")) return false;
  if (d.metrics !== undefined && (typeof d.metrics !== "object" || d.metrics === null)) return false;
  return ARRAY_KEYS.every((k) => d[k] === undefined || Array.isArray(d[k]));
}


function read(): Store {
  if (typeof window === "undefined") return defaultStore;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore;
    return { ...defaultStore, ...JSON.parse(raw) };
  } catch {
    return defaultStore;
  }
}

function write(s: Store): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // The browser's storage is full (usually because of a large profile photo).
    // Tell the user instead of failing silently. Their previous data stays intact.
    toast.error("Couldn't save your changes", {
      description: "Your device storage for this app is full. Try a smaller profile photo or remove it in the avatar editor.",
    });
    return false;
  }
  window.dispatchEvent(new Event("vital-store-update"));
  return true;
}

export function useStore() {
  const [store, setStore] = useState<Store>(read);

  useEffect(() => {
    const handler = () => setStore(read());
    window.addEventListener("vital-store-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("vital-store-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    store,
    setProfile: (p: Profile) => write({ ...read(), profile: p }),
    upsertMetrics: (date: string, patch: Partial<DailyMetrics>) => {
      const s = read();
      const cur = s.metrics[date] ?? { date, waterMl: 0, sleepHours: 0, steps: 0, restingHr: 0, mood: 3 };
      // Strip undefined so we don't blow away existing values when partially logging
      const clean: Partial<DailyMetrics> = {};
      (Object.keys(patch) as (keyof DailyMetrics)[]).forEach((k) => {
        const v = patch[k];
        if (v !== undefined && v !== null && !(typeof v === "number" && Number.isNaN(v))) {
          (clean as Record<string, unknown>)[k] = v;
        }
      });
      write({ ...s, metrics: { ...s.metrics, [date]: { ...cur, ...clean } } });
    },
    addWorkout: (w: Omit<Workout, "id">) => {
      const s = read();
      write({ ...s, workouts: [{ ...w, id: crypto.randomUUID() }, ...s.workouts].slice(0, 100) });
    },
    deleteWorkout: (id: string) => {
      const s = read();
      write({ ...s, workouts: s.workouts.filter((w) => w.id !== id) });
    },
    addFatigue: (f: Omit<FatigueEntry, "id">) => {
      const s = read();
      write({ ...s, fatigue: [{ ...f, id: crypto.randomUUID() }, ...s.fatigue].slice(0, 50) });
    },
    addSport: (sp: SportPractice) => {
      const s = read();
      const filtered = s.sports.filter((x) => x.sportId !== sp.sportId);
      write({ ...s, sports: [sp, ...filtered].slice(0, 12) });
    },
    removeSport: (sportId: string) => {
      const s = read();
      write({ ...s, sports: s.sports.filter((x) => x.sportId !== sportId) });
    },
    setHealthBaseline: (h: HealthBaseline) => write({ ...read(), healthBaseline: h }),
    setPreferences: (p: Preferences) => write({ ...read(), preferences: p }),
    /** Changes individual preferences, filling defaults if onboarding never saved any. */
    updatePreferences: (patch: Partial<Preferences>) => {
      const s = read();
      write({ ...s, preferences: { ...defaultPreferences, ...s.preferences, ...patch } });
    },
    completeOnboarding: (data: {
      profile: Profile;
      sports: SportPractice[];
      healthBaseline: HealthBaseline;
      preferences: Preferences;
    }) => {
      const s = read();
      const isFirstTime = !s.profile;
      const today = todayKey();
      const mergedProfile: Profile = {
        ...data.profile,
        startWeightKg: s.profile?.startWeightKg ?? data.profile.startWeightKg ?? data.profile.weightKg,
        goalStartedAt: s.profile?.goalStartedAt ?? data.profile.goalStartedAt ?? today,
      };
      write({
        ...s,
        profile: mergedProfile,
        sports: data.sports,
        healthBaseline: data.healthBaseline,
        preferences: data.preferences,
        hasSeenRoadmap: isFirstTime ? false : s.hasSeenRoadmap,
      });
    },
    dismissRoadmap: () => write({ ...read(), hasSeenRoadmap: true }),
    addFriend: (f: Omit<Friend, "id" | "addedAt">) => {
      const s = read();
      // De-dupe by name+createdAt so re-pasting the same code replaces
      const filtered = s.friends.filter(
        (x) => !(x.snapshot.name === f.snapshot.name && x.snapshot.createdAt === f.snapshot.createdAt),
      );
      write({
        ...s,
        friends: [{ ...f, id: crypto.randomUUID(), addedAt: Date.now() }, ...filtered].slice(0, 20),
      });
    },
    removeFriend: (id: string) => {
      const s = read();
      write({ ...s, friends: s.friends.filter((x) => x.id !== id) });
    },
    updateFriend: (id: string, patch: Partial<Omit<Friend, "id">>) => {
      const s = read();
      write({
        ...s,
        friends: s.friends.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      });
    },
    setAlertRules: (rules: import("./alerts").AlertRule[]) => write({ ...read(), alertRules: rules }),
    logAlertEvents: (events: import("./alerts").AlertEvent[]) => {
      if (events.length === 0) return;
      const s = read();
      const existing = new Set(s.alertHistory.map((e) => e.id));
      const fresh = events.filter((e) => !existing.has(e.id));
      if (fresh.length === 0) return;
      write({ ...s, alertHistory: [...fresh, ...s.alertHistory].slice(0, 200) });
    },
    clearAlertHistory: () => write({ ...read(), alertHistory: [] }),
    setTournament: (t: Tournament | null) => write({ ...read(), tournament: t }),
    addRecord: (r: Omit<PersonalRecord, "id">) => {
      const s = read();
      write({ ...s, records: [{ ...r, id: crypto.randomUUID() }, ...s.records].slice(0, 300) });
    },
    deleteRecord: (id: string) => {
      const s = read();
      write({ ...s, records: s.records.filter((r) => r.id !== id) });
    },
    addTemplate: (t: Omit<WorkoutTemplate, "id">) => {
      const s = read();
      // Saving under an existing name replaces that template.
      const others = s.templates.filter((x) => x.name.toLowerCase() !== t.name.toLowerCase());
      write({ ...s, templates: [{ ...t, id: crypto.randomUUID() }, ...others].slice(0, 30) });
    },
    deleteTemplate: (id: string) => {
      const s = read();
      write({ ...s, templates: s.templates.filter((t) => t.id !== id) });
    },
    exportData: () => JSON.stringify({ app: "sport-iq", version: 1, exportedAt: new Date().toISOString(), data: read() }, null, 2),
    /** Restores a backup made by exportData. Returns false if the file isn't a valid backup. */
    importData: (json: string): boolean => {
      try {
        const parsed = JSON.parse(json);
        const data = parsed?.app === "sport-iq" ? parsed.data : parsed;
        if (!isStoreBackup(data)) return false;
        return write({ ...defaultStore, ...data });
      } catch {
        return false;
      }
    },

    reset: () => write(defaultStore),

  };
}

/**
 * Turns a date into a "YYYY-MM-DD" key using the device's local clock.
 * (Using toISOString() would use UTC time, which saves evening logs under tomorrow's date.)
 */
export const localDateKey = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayKey = () => localDateKey();
