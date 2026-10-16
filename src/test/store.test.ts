import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { localDateKey, todayKey, useStore, type Profile } from "@/lib/store";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const originalTZ = process.env.TZ;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  process.env.TZ = originalTZ;
});

describe("todayKey", () => {
  it("uses the local date, not UTC, late in the evening", () => {
    process.env.TZ = "America/New_York";
    vi.useFakeTimers({ toFake: ["Date"] });
    // 11:30 PM on Oct 12 in New York is already Oct 13 in UTC.
    vi.setSystemTime(new Date("2026-10-13T03:30:00Z"));
    expect(todayKey()).toBe("2026-10-12");
  });

  it("formats any date as YYYY-MM-DD with zero padding", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("saving when storage is full", () => {
  it("shows an error message instead of crashing", () => {
    // A fake browser storage that is empty and always "full" when saving.
    const setItem = vi.fn(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    const { result } = renderHook(() => useStore());
    const profile = { name: "Test" } as Profile;

    expect(() => act(() => result.current.setProfile(profile))).not.toThrow();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(result.current.store.profile).toBeNull();
  });
});
