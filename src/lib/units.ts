import { useStore, type Preferences } from "./store";

export type Units = Preferences["units"];

/**
 * Everything is stored in metric (kg, cm, ml, km). These helpers convert to
 * the user's preferred units only for display and input.
 */
const LB_PER_KG = 2.20462262;
const IN_PER_CM = 1 / 2.54;
const FLOZ_PER_ML = 1 / 29.5735;
const MI_PER_KM = 0.621371;

const round = (v: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
};

export const kgTo = (kg: number, u: Units) => (u === "imperial" ? kg * LB_PER_KG : kg);
export const kgFrom = (v: number, u: Units) => (u === "imperial" ? v / LB_PER_KG : v);
export const kmTo = (km: number, u: Units) => (u === "imperial" ? km * MI_PER_KM : km);
export const kmFrom = (v: number, u: Units) => (u === "imperial" ? v / MI_PER_KM : v);
/** Water is shown in litres (metric) or fluid ounces (imperial). */
export const mlTo = (ml: number, u: Units) => (u === "imperial" ? ml * FLOZ_PER_ML : ml / 1000);
export const mlFrom = (v: number, u: Units) => (u === "imperial" ? v / FLOZ_PER_ML : v * 1000);

/** Splits a height in cm into whole feet and inches. */
export function cmToFtIn(cm: number) {
  const totalIn = Math.round(cm * IN_PER_CM);
  return { ft: Math.floor(totalIn / 12), inch: totalIn % 12 };
}
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) / IN_PER_CM;

export function unitLabels(u: Units) {
  return u === "imperial"
    ? { weight: "lb", water: "fl oz", distance: "mi", height: "ft/in" }
    : { weight: "kg", water: "L", distance: "km", height: "cm" };
}

/** Rounds a stored metric value for display in the user's units. */
export function displayWeight(kg: number, u: Units, decimals = 1) {
  return round(kgTo(kg, u), decimals);
}
export function displayWater(ml: number, u: Units) {
  return u === "imperial" ? Math.round(mlTo(ml, u)) : round(mlTo(ml, u), 1);
}

export function formatWeight(kg: number, u: Units, decimals = 1) {
  return `${kgTo(kg, u).toFixed(decimals)} ${unitLabels(u).weight}`;
}
export function formatWater(ml: number, u: Units) {
  return u === "imperial" ? `${Math.round(mlTo(ml, u))} fl oz` : `${mlTo(ml, u).toFixed(1)} L`;
}
export function formatHeight(cm: number, u: Units) {
  if (u === "metric") return `${Math.round(cm)} cm`;
  const { ft, inch } = cmToFtIn(cm);
  return `${ft}′${inch}″`;
}

/**
 * Converts a chart series of a stored metric into display units. Only water
 * and weight differ between systems; other metrics pass through unchanged.
 */
export function seriesInUnits<T extends { value: number | null }>(key: string, series: T[], u: Units): T[] {
  const conv = key === "weightKg" ? (v: number) => kgTo(v, u) : key === "waterMl" ? (v: number) => mlTo(v, u) : null;
  return conv ? series.map((p) => ({ ...p, value: p.value === null ? null : conv(p.value) })) : series;
}

/** The user's chosen unit system plus bound helpers, for components. */
export function useUnits() {
  const { store } = useStore();
  const units: Units = store.preferences?.units ?? "metric";
  return {
    units,
    labels: unitLabels(units),
    weight: (kg: number, decimals = 1) => formatWeight(kg, units, decimals),
    water: (ml: number) => formatWater(ml, units),
    height: (cm: number) => formatHeight(cm, units),
  };
}
