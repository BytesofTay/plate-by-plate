// Shared shapes for Plate by Plate program templates, plus lookups that work on any template.
// The templates themselves live in ./programs/. All weights are in pounds.

export type ExerciseKind = "barbell" | "dumbbell" | "machine" | "assisted" | "bodyweight";

export interface Exercise {
  /** Stable key that saved logs reference. Never rename one; add a new id instead. Shared across templates for the same movement. */
  id: string;
  name: string;
  kind: ExerciseKind;
  /** Primary strength lift: fixed reps, adds weight every time all reps are hit, deloads after two misses. */
  main: boolean;
  /** Counts toward weekly glute work. */
  glute: boolean;
  /** Short label shown above the name, e.g. "Glute finisher". */
  tag?: string;
  sets: number;
  repsMin: number;
  /** Equal to repsMin for fixed-rep lifts. Hitting this on every set earns progression. */
  repsMax: number;
  unit: "reps" | "sec";
  /** Reps are counted per leg or per arm. */
  perSide?: boolean;
  /** Weight is per dumbbell. */
  perHand?: boolean;
  /** Pounds added when progression is earned. For assisted lifts: pounds of assistance removed. */
  increment: number;
  /** Suggested starting weight in pounds (assistance pounds for assisted lifts). */
  start: number;
  restSec: number;
  cue: string;
}

export interface Day {
  /** Stable key: lower-a, upper-a, lower-b, upper-b. */
  id: string;
  name: string;
  focus: string;
  suggestedWeekday: string;
  exercises: Exercise[];
}

export type ProgramId = "glute-priority" | "balanced-strength";

export interface Program {
  id: ProgramId;
  name: string;
  summary: string;
  /** In rotation order. Finishing a day makes the one after it next. */
  days: Day[];
  rules: string[];
}

export const FUELING_NOTE =
  "Muscle, glutes included, is built on food and sleep. At a lighter body weight, eating enough matters as much as the training: include protein at most meals and don't lift on an empty stomach. Check with a doctor before starting if there are any injuries or health concerns.";

/** Day ids in rotation order. */
export function rotation(program: Program): string[] {
  return program.days.map((d) => d.id);
}

/** The day after `dayId` in the rotation, as an index. Used even when a different day than suggested was trained. */
export function nextDayIndex(program: Program, dayId: string): number {
  return (program.days.findIndex((d) => d.id === dayId) + 1) % program.days.length;
}

export function findDay(program: Program, id: string): Day | undefined {
  return program.days.find((d) => d.id === id);
}

export function findExercise(program: Program, id: string): { day: Day; exercise: Exercise } | undefined {
  for (const day of program.days) {
    const exercise = day.exercises.find((e) => e.id === id);
    if (exercise) return { day, exercise };
  }
  return undefined;
}

/** Hard sets a week that count as glute work. */
export function weeklyGluteSets(program: Program): number {
  return program.days.flatMap((d) => d.exercises).filter((e) => e.glute).reduce((n, e) => n + e.sets, 0);
}

/** Starting working weight for every exercise in the template. */
export function startingWeights(program: Program): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const day of program.days) for (const ex of day.exercises) weights[ex.id] = ex.start;
  return weights;
}
