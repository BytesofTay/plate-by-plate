import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROGRAM_ID,
  PROGRAMS,
  PROGRAM_IDS,
  findExercise,
  getProgram,
  nextDayIndex,
  rotation,
  startingWeights,
  weeklyGluteSets,
} from "../src/index.js";

describe("PROGRAMS registry", () => {
  it("has both templates keyed by id", () => {
    expect(PROGRAM_IDS).toEqual(["glute-priority", "balanced-strength"]);
    for (const id of PROGRAM_IDS) expect(PROGRAMS[id].id).toBe(id);
    expect(DEFAULT_PROGRAM_ID).toBe("glute-priority");
  });

  it("falls back to the default for unknown ids", () => {
    expect(getProgram("balanced-strength").id).toBe("balanced-strength");
    expect(getProgram("nope").id).toBe("glute-priority");
    expect(getProgram(undefined).id).toBe("glute-priority");
    expect(getProgram("toString").id).toBe("glute-priority");
  });
});

describe.each(PROGRAM_IDS)("%s", (id) => {
  const program = PROGRAMS[id];
  const all = program.days.flatMap((d) => d.exercises);

  it("rotates lower-a, upper-a, lower-b, upper-b", () => {
    expect(rotation(program)).toEqual(["lower-a", "upper-a", "lower-b", "upper-b"]);
  });

  it("uses each exercise id once", () => {
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
  });

  it("has valid rep schemes and settings", () => {
    for (const e of all) {
      expect(e.repsMin, e.id).toBeLessThanOrEqual(e.repsMax);
      expect(e.sets, e.id).toBeGreaterThan(0);
      if (e.main) {
        expect(e.kind, e.id).toBe("barbell");
        expect(e.repsMin, e.id).toBe(e.repsMax);
      }
      if (e.kind === "bodyweight") expect([e.start, e.increment], e.id).toEqual([0, 0]);
      if (e.kind === "barbell") expect(e.start, e.id).toBeGreaterThanOrEqual(45);
    }
  });

  it("has squat, bench, deadlift and press as 3x5 main lifts", () => {
    for (const lift of ["back-squat", "bench-press", "deadlift", "overhead-press"]) {
      expect(findExercise(program, lift)?.exercise, lift).toMatchObject({ main: true, sets: 3, repsMin: 5, repsMax: 5 });
    }
  });
});

describe("Glute Priority", () => {
  const program = PROGRAMS["glute-priority"];

  it("trains glutes all four days, about 30 hard sets a week", () => {
    for (const day of program.days) expect(day.exercises.some((e) => e.glute), day.id).toBe(true);
    expect(weeklyGluteSets(program)).toBe(30);
  });

  it("makes hip thrust a 3x8 main lift", () => {
    expect(findExercise(program, "hip-thrust")?.exercise).toMatchObject({ main: true, sets: 3, repsMin: 8, repsMax: 8, start: 85 });
  });
});

describe("Balanced Strength", () => {
  const program = PROGRAMS["balanced-strength"];

  it("matches docs/programs.md", () => {
    expect(program.days.map((d) => d.exercises.map((e) => e.id))).toEqual([
      ["back-squat", "romanian-deadlift", "bulgarian-split-squat", "leg-curl", "plank"],
      ["bench-press", "chest-supported-row", "seated-db-press", "lat-pulldown", "db-curl", "triceps-pushdown"],
      ["deadlift", "goblet-squat", "hip-thrust", "walking-lunge", "hanging-knee-raise"],
      ["overhead-press", "assisted-pull-up", "incline-db-press", "seated-cable-row", "face-pull", "lateral-raise"],
    ]);
    expect(program.days[2].focus).toBe("Deadlift");
  });

  it("makes hip thrust an accessory", () => {
    expect(findExercise(program, "hip-thrust")?.exercise).toMatchObject({ main: false, sets: 3, repsMin: 8, repsMax: 10, start: 65 });
  });

  it("uses the documented increments", () => {
    for (const e of program.days.flatMap((d) => d.exercises)) {
      if (e.kind === "bodyweight" || e.kind === "assisted") continue;
      const expected = ["bench-press", "overhead-press"].includes(e.id) || e.perHand ? 2.5 : 5;
      expect(e.increment, e.id).toBe(expected);
    }
  });
});

describe("shared exercise ids", () => {
  it("name the same movement in both templates", () => {
    const glute = startingWeights(PROGRAMS["glute-priority"]);
    const balanced = startingWeights(PROGRAMS["balanced-strength"]);
    const shared = Object.keys(glute).filter((id) => id in balanced);
    expect(shared.length).toBeGreaterThanOrEqual(12);
    for (const id of shared) {
      const a = findExercise(PROGRAMS["glute-priority"], id)!.exercise;
      const b = findExercise(PROGRAMS["balanced-strength"], id)!.exercise;
      expect([b.name, b.kind, b.unit, !!b.perHand, !!b.perSide], id).toEqual([a.name, a.kind, a.unit, !!a.perHand, !!a.perSide]);
    }
  });
});

describe("nextDayIndex", () => {
  it("moves to the day after the one trained, wrapping around", () => {
    const program = PROGRAMS["glute-priority"];
    expect(nextDayIndex(program, "lower-a")).toBe(1);
    expect(nextDayIndex(program, "lower-b")).toBe(3);
    expect(nextDayIndex(program, "upper-b")).toBe(0);
  });
});
