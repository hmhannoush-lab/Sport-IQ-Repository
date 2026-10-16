// Small Web Audio helpers for UI feedback sounds. No assets required.
import { soundMuted } from "@/lib/quietHours";

function ctxOrNull(): AudioContext | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch {
    return null;
  }
}

/**
 * A crisp two-note "ping" for notifications — bright, short and calm.
 */
export function playNotificationSound() {
  if (soundMuted()) return;
  const ctx = ctxOrNull();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [
    { freq: 987.77, start: 0, dur: 0.35, gain: 0.18, type: "sine" as OscillatorType },
    { freq: 1318.51, start: 0.11, dur: 0.5, gain: 0.14, type: "sine" as OscillatorType },
    { freq: 2637.02, start: 0.11, dur: 0.25, gain: 0.04, type: "triangle" as OscillatorType },
  ];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.type;
    osc.frequency.setValueAtTime(n.freq, now + n.start);
    gain.gain.setValueAtTime(0.0001, now + n.start);
    gain.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur);
  }

  setTimeout(() => ctx.close().catch(() => {}), 900);
}
