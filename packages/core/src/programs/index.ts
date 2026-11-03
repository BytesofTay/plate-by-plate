import type { Program, ProgramId } from "../program.js";
import { BALANCED_STRENGTH } from "./balanced-strength.js";
import { GLUTE_PRIORITY } from "./glute-priority.js";

export { BALANCED_STRENGTH, GLUTE_PRIORITY };

/** Every program template, keyed by its id. Profiles store the id. */
export const PROGRAMS: Record<ProgramId, Program> = {
  "glute-priority": GLUTE_PRIORITY,
  "balanced-strength": BALANCED_STRENGTH,
};

export const DEFAULT_PROGRAM_ID: ProgramId = "glute-priority";

export const PROGRAM_IDS = Object.keys(PROGRAMS) as ProgramId[];

export function isProgramId(id: string): id is ProgramId {
  return Object.hasOwn(PROGRAMS, id);
}

/** The template for an id, falling back to the default for unknown ids (e.g. old saved data). */
export function getProgram(id: string | undefined): Program {
  return id && isProgramId(id) ? PROGRAMS[id] : PROGRAMS[DEFAULT_PROGRAM_ID];
}
