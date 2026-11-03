import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PROGRAM } from "./program.js";
import type { Result, Settings } from "./logic.js";

export interface LoggedExercise {
  exerciseId: string;
  weight: number;
  reps: number[];
  result: Result;
  message: string;
}

export interface Session {
  id: string;
  date: string;
  dayId: string;
  exercises: LoggedExercise[];
  notes?: string;
}

export interface State {
  version: 1;
  settings: Settings;
  /** Working weight per exercise id for the next session. */
  weights: Record<string, number>;
  /** Consecutive missed sessions per main lift. */
  failStreak: Record<string, number>;
  /** Index into the rotation for the next workout. */
  nextDay: number;
  sessions: Session[];
}

export const DATA_FILE = process.env.PLATE_BY_PLATE_DATA ?? path.join(os.homedir(), ".plate-by-plate", "data.json");

export function freshState(): State {
  const weights: Record<string, number> = {};
  for (const day of PROGRAM) for (const ex of day.exercises) weights[ex.id] = ex.start;
  return { version: 1, settings: { barWeight: 45, smallestPlate: 1.25 }, weights, failStreak: {}, nextDay: 0, sessions: [] };
}

export async function load(): Promise<State> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as State;
    const base = freshState();
    // Fill in any exercise added to the program after the file was created.
    return { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings }, weights: { ...base.weights, ...parsed.weights } };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return freshState();
    throw err;
  }
}

export async function save(state: State): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}
