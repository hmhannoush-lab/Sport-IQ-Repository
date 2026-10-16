import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { computeBadges } from "@/lib/badges";
import { messageForBadge } from "@/lib/badgeMessages";
import { sendBadgeNotification } from "@/lib/pushNotifications";
import { soundMuted } from "@/lib/quietHours";

function playChime() {
  if (soundMuted()) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Fundamental bell tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now); // E6
    osc2.frequency.exponentialRampToValueAtTime(660, now + 1.2);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 1.2);

    // Higher shimmer
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1760, now); // A6
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now);
    osc3.stop(now + 0.6);

    // Auto-close context when done
    setTimeout(() => ctx.close(), 1600);
  } catch {
    /* ignore audio errors */
  }
}


const STORAGE_KEY = "vital.unlockedBadges.v1";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSeen(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/**
 * Watches achievements and fires a friendly toast whenever a new badge
 * is unlocked. Tracks previously-seen badges in localStorage so toasts
 * fire only once per achievement.
 */
export function useBadgeUnlockNotifier() {
  const { store } = useStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    const badges = computeBadges(store.profile, store.metrics, store.workouts);
    const seen = loadSeen();
    const achievedIds = badges.filter((b) => b.achieved).map((b) => b.id);

    // On first run, treat any already-achieved badges as already seen
    // so we don't blast the user with old unlocks.
    if (!initializedRef.current) {
      initializedRef.current = true;
      let changed = false;
      for (const id of achievedIds) {
        if (!seen.has(id)) {
          seen.add(id);
          changed = true;
        }
      }
      if (changed) saveSeen(seen);
      return;
    }

    const newlyUnlocked = badges.filter((b) => b.achieved && !seen.has(b.id));
    if (newlyUnlocked.length === 0) return;

    for (const b of newlyUnlocked) {
      const { title, message } = messageForBadge(b.id, b.title);
      toast(`${b.icon}  ${title}`, {
        description: message,
        duration: 6000,
      });
      sendBadgeNotification(`${b.icon}  Badge unlocked: ${title}`, message);
      seen.add(b.id);
    }
    saveSeen(seen);
    playChime();
  }, [store.profile, store.metrics, store.workouts]);
}
