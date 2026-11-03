import type { Exercise } from "./program.js";

export interface Settings {
  /** Empty barbell weight in lb: 45 (standard), 35, or 33 (15 kg women's bar). */
  barWeight: number;
  /** Smallest plate the gym has, in lb: 1.25 or 2.5. */
  smallestPlate: number;
}

export type Result = "progress" | "repeat" | "deload" | "logged";

const PLATES = [45, 35, 25, 10, 5, 2.5, 1.25];

const round = (n: number) => Math.round(n * 100) / 100;

/** Smallest total jump a barbell can make (one small plate per side). */
export function barStep(s: Settings): number {
  return s.smallestPlate * 2;
}

/** Round a barbell weight down to something loadable with the available plates. */
export function loadable(weight: number, s: Settings): number {
  const step = barStep(s);
  if (weight <= s.barWeight) return s.barWeight;
  return round(s.barWeight + Math.floor((weight - s.barWeight) / step + 1e-9) * step);
}

export function effectiveIncrement(ex: Exercise, s: Settings): number {
  if (ex.kind === "barbell") return Math.max(ex.increment, barStep(s));
  return ex.increment;
}

export interface Progression {
  nextWeight: number;
  result: Result;
  failStreak: number;
  message: string;
}

/**
 * Decide next session's weight from what was done today.
 * reps: one entry per set actually performed (seconds for timed holds).
 */
export function progress(ex: Exercise, weight: number, reps: number[], failStreak: number, s: Settings): Progression {
  const done = reps.slice(0, ex.sets);
  const allHit = done.length >= ex.sets && done.every((r) => r >= ex.repsMax);

  if (ex.kind === "bodyweight") {
    return {
      nextWeight: 0,
      result: allHit ? "progress" : "logged",
      failStreak: 0,
      message: allHit
        ? `Top of the range on every set. Slow the tempo or ${ex.unit === "sec" ? "hold a plate on your back" : "hold a light dumbbell"} next time.`
        : `Logged. Aim for ${ex.repsMax} ${ex.unit === "sec" ? "seconds" : "reps"} on every set.`,
    };
  }

  if (ex.kind === "assisted") {
    if (allHit) {
      const next = Math.max(0, round(weight - ex.increment));
      return { nextWeight: next, result: "progress", failStreak: 0, message: next === 0 ? "Next time: unassisted pull-ups." : `Next time: ${next} lb of assistance (5 lb less help).` };
    }
    return { nextWeight: weight, result: "repeat", failStreak: 0, message: `Stay at ${weight} lb of assistance until you get ${ex.repsMax} reps on every set.` };
  }

  const inc = effectiveIncrement(ex, s);

  if (allHit) {
    const next = round(weight + inc);
    return { nextWeight: next, result: "progress", failStreak: 0, message: `All reps done. Next time: ${next} lb (+${inc}).` };
  }

  if (ex.main) {
    const streak = failStreak + 1;
    if (streak >= 2) {
      const next = loadable(weight * 0.9, s);
      return { nextWeight: next, result: "deload", failStreak: 0, message: `Second miss at ${weight} lb. Deload to ${next} lb and build back up.` };
    }
    return { nextWeight: weight, result: "repeat", failStreak: streak, message: `Missed some reps. Repeat ${weight} lb next time.` };
  }

  return { nextWeight: weight, result: "repeat", failStreak: 0, message: `Stay at ${weight} lb until you hit ${ex.repsMax} reps on every set.` };
}

/** Estimated one-rep max (Epley). Only meaningful for loaded lifts with 1-10 reps. */
export function e1rm(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + Math.min(reps, 10) / 30));
}

export interface PlateLoad {
  target: number;
  loaded: number;
  perSide: number[];
  exact: boolean;
  note?: string;
}

/** Plates to put on each side of the bar. */
export function plates(target: number, s: Settings): PlateLoad {
  const avail = PLATES.filter((p) => p >= s.smallestPlate);
  if (target <= s.barWeight) {
    return { target, loaded: s.barWeight, perSide: [], exact: target === s.barWeight, note: target < s.barWeight ? `Below the ${s.barWeight} lb bar. Use a lighter bar or dumbbells.` : undefined };
  }
  let side = round((target - s.barWeight) / 2);
  const perSide: number[] = [];
  for (const p of avail) {
    while (side + 1e-9 >= p) {
      perSide.push(p);
      side = round(side - p);
    }
  }
  const loaded = round(s.barWeight + 2 * perSide.reduce((a, b) => a + b, 0));
  const exact = Math.abs(loaded - target) < 1e-6;
  return { target, loaded, perSide, exact, note: exact ? undefined : `Closest loadable weight is ${loaded} lb.` };
}

/** Ramp-up sets for a main barbell lift. */
export function warmups(work: number, s: Settings): { weight: number; reps: number }[] {
  const sets: { weight: number; reps: number }[] = [{ weight: s.barWeight, reps: 10 }];
  for (const [pct, reps] of [[0.5, 5], [0.7, 3], [0.85, 2]] as const) {
    const w = loadable(work * pct, s);
    if (w > sets[sets.length - 1].weight && w < work) sets.push({ weight: w, reps });
  }
  // Light lifts get a second empty-bar set so there are always a few ramp-ups.
  if (sets.length < 3 && work > s.barWeight) sets.splice(1, 0, { weight: s.barWeight, reps: 5 });
  return sets;
}

/** Step for nudging a working weight by hand: one bar jump for barbells, 2.5 lb per dumbbell, 5 lb otherwise. */
export function weightStep(ex: Exercise, s: Settings): number {
  if (ex.kind === "barbell") return barStep(s);
  if (ex.kind === "dumbbell") return 2.5;
  return 5;
}
