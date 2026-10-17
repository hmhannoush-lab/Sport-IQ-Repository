import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { computeTrainingLoad } from "@/lib/trainingLoad";
import { localDateKey, useStore, type Workout } from "@/lib/store";
import { cmToFtIn, formatHeight, formatWater, formatWeight, ftInToCm, kgFrom } from "@/lib/units";
import { bestOneRepMaxes, estimateOneRepMax, formatSets, totalVolumeKg } from "@/lib/workoutSets";
import { csvCell, tournamentIcs, workoutsCsv } from "@/lib/exportFiles";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const TODAY = new Date(2026, 9, 15);
const daysAgo = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return localDateKey(d);
};
const session = (n: number, durationMin = 60, intensity: Workout["intensity"] = "medium"): Workout => ({
  id: String(n) + durationMin, date: daysAgo(n), type: "Run", durationMin, intensity,
});

describe("computeTrainingLoad", () => {
  it("stays in baseline mode without 3 weeks of history", () => {
    const load = computeTrainingLoad([session(0), session(3)], TODAY);
    expect(load.ratio).toBeNull();
    expect(load.zone).toBe("building");
    expect(load.acute).toBe(600);
  });

  it("reports the sweet spot for steady weekly load", () => {
    const steady = [0, 7, 14, 21].map((n) => session(n));
    const load = computeTrainingLoad(steady, TODAY);
    expect(load.weeks).toEqual([300, 300, 300, 300]);
    expect(load.ratio).toBe(1);
    expect(load.zone).toBe("optimal");
  });

  it("flags a sharp spike as high risk", () => {
    const spike = [session(7), session(14), session(21), session(0, 180, "high"), session(1, 120, "high")];
    expect(computeTrainingLoad(spike, TODAY).zone).toBe("high");
  });
});

describe("backup & restore", () => {
  afterEach(() => localStorage.clear());

  it("round-trips data and rejects invalid files", () => {
    const { result } = renderHook(() => useStore());
    act(() => result.current.addRecord({ exercise: "Squat", value: 100, unit: "kg", date: "2026-10-01" }));
    const backup = result.current.exportData();

    act(() => result.current.reset());
    expect(result.current.store.records).toHaveLength(0);

    let ok = false;
    act(() => { ok = result.current.importData(backup); });
    expect(ok).toBe(true);
    expect(result.current.store.records[0]).toMatchObject({ exercise: "Squat", value: 100 });

    expect(result.current.importData("not json")).toBe(false);
    expect(result.current.importData(JSON.stringify({ profile: null, workouts: "oops" }))).toBe(false);
  });
});

describe("units", () => {
  it("converts metric storage to imperial display and back", () => {
    expect(formatWeight(100, "imperial")).toBe("220.5 lb");
    expect(formatWeight(100, "metric")).toBe("100.0 kg");
    expect(kgFrom(220.462262, "imperial")).toBeCloseTo(100, 4);
    expect(formatWater(2000, "metric")).toBe("2.0 L");
    expect(formatWater(2000, "imperial")).toBe("68 fl oz");
    expect(formatHeight(180, "imperial")).toBe("5′11″");
    expect(cmToFtIn(ftInToCm(5, 11))).toEqual({ ft: 5, inch: 11 });
  });

  it("saves preference changes even before onboarding stored any", () => {
    const { result } = renderHook(() => useStore());
    act(() => result.current.updatePreferences({ units: "imperial" }));
    expect(result.current.store.preferences).toMatchObject({ units: "imperial", motivationStyle: "balanced" });
    localStorage.clear();
  });
});

describe("workout sets", () => {
  const sets = [
    { exercise: "Squat", reps: 5, weightKg: 100 },
    { exercise: "Squat", reps: 5, weightKg: 100 },
    { exercise: "Push-up", reps: 15 },
  ];

  it("summarises volume, estimated 1RM and grouped sets", () => {
    expect(totalVolumeKg(sets)).toBe(1000);
    expect(bestOneRepMaxes(sets).Squat).toBeCloseTo(116.67, 1);
    expect(estimateOneRepMax(60, 15)).toBe(0);
    expect(formatSets(sets, "metric")).toBe("Squat 2×5 @ 100 kg; Push-up 1×15");
  });
});

describe("exports", () => {
  it("escapes CSV cells and writes workouts oldest first", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    const csv = workoutsCsv([
      { id: "b", date: "2026-10-02", type: "Run", durationMin: 30, intensity: "low" },
      { id: "a", date: "2026-10-01", type: "Strength", durationMin: 45, intensity: "high", notes: "legs, heavy" },
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("date,type,durationMin,intensity,sets,notes");
    expect(lines[1]).toBe('2026-10-01,Strength,45,high,,"legs, heavy"');
  });

  it("builds an all-day calendar event", () => {
    const ics = tournamentIcs({ name: "City Open, Finals", date: "2026-12-31" }, new Date(Date.UTC(2026, 9, 17)));
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
    expect(ics).toContain(String.raw`SUMMARY:City Open\, Finals`);
  });
});
