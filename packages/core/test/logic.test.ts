import { describe, expect, it } from "vitest";
import { GLUTE_PRIORITY, e1rm, findExercise, loadable, plates, progress, warmups, weightStep, type Exercise, type Settings } from "../src/index.js";

const ex = (id: string): Exercise => findExercise(GLUTE_PRIORITY, id)!.exercise;
const STD: Settings = { barWeight: 45, smallestPlate: 1.25 };
const BIG_PLATES: Settings = { barWeight: 45, smallestPlate: 2.5 };
const BAR35: Settings = { barWeight: 35, smallestPlate: 1.25 };
const BAR33: Settings = { barWeight: 33, smallestPlate: 2.5 };

describe("progress: main lifts", () => {
  it("adds the increment when every set hits the target", () => {
    const p = progress(ex("back-squat"), 65, [5, 5, 5], 0, STD);
    expect(p).toMatchObject({ nextWeight: 70, result: "progress", failStreak: 0 });
    expect(p.message).toContain("Next time: 70 lb");
  });

  it("treats hip thrust as a 3x8 main lift", () => {
    expect(progress(ex("hip-thrust"), 85, [8, 8, 8], 0, STD)).toMatchObject({ nextWeight: 90, result: "progress" });
    expect(progress(ex("hip-thrust"), 85, [8, 8, 7], 0, STD)).toMatchObject({ nextWeight: 85, result: "repeat", failStreak: 1 });
  });

  it("uses the 2.5 lb bench increment with 1.25 lb plates", () => {
    expect(progress(ex("bench-press"), 45, [5, 5, 5], 0, STD).nextWeight).toBe(47.5);
  });

  it("never jumps a barbell by less than two of the smallest plate", () => {
    expect(progress(ex("bench-press"), 45, [5, 5, 5], 0, BIG_PLATES).nextWeight).toBe(50);
    expect(progress(ex("overhead-press"), 45, [5, 5, 5], 0, BAR33).nextWeight).toBe(50);
  });

  it("repeats the weight after one miss and counts the streak", () => {
    expect(progress(ex("back-squat"), 65, [5, 5, 4], 0, STD)).toMatchObject({ nextWeight: 65, result: "repeat", failStreak: 1 });
  });

  it("needs every set: fewer sets than prescribed is a miss, extra sets are ignored", () => {
    expect(progress(ex("back-squat"), 65, [5, 5], 0, STD).result).toBe("repeat");
    expect(progress(ex("back-squat"), 65, [5, 5, 5, 2], 0, STD).result).toBe("progress");
  });

  it("deloads to 90% after two consecutive misses, rounded down to a loadable weight", () => {
    // 65 * 0.9 = 58.5 -> 57.5 with 1.25 lb plates, 55 with 2.5 lb plates.
    expect(progress(ex("back-squat"), 65, [5, 4, 4], 1, STD)).toMatchObject({ nextWeight: 57.5, result: "deload", failStreak: 0 });
    expect(progress(ex("back-squat"), 65, [5, 4, 4], 1, BIG_PLATES).nextWeight).toBe(55);
    // Matches the MCP smoke test: bench 60 -> 54 -> 52.5.
    expect(progress(ex("bench-press"), 60, [5, 4, 3], 1, STD).nextWeight).toBe(52.5);
  });

  it("never deloads below the bar", () => {
    expect(progress(ex("bench-press"), 47.5, [3, 3, 3], 1, STD).nextWeight).toBe(45);
    expect(progress(ex("overhead-press"), 35, [3, 3, 3], 1, BAR33).nextWeight).toBe(33);
    expect(progress(ex("overhead-press"), 35, [3, 3, 3], 1, BAR35).nextWeight).toBe(35);
  });
});

describe("progress: accessories (double progression)", () => {
  it("stays at the weight until every set reaches repsMax", () => {
    expect(progress(ex("romanian-deadlift"), 55, [10, 9, 8], 0, STD)).toMatchObject({ nextWeight: 55, result: "repeat", failStreak: 0 });
  });

  it("adds the increment once every set reaches repsMax", () => {
    expect(progress(ex("romanian-deadlift"), 55, [10, 10, 10], 0, STD).nextWeight).toBe(60);
    expect(progress(ex("bulgarian-split-squat"), 10, [10, 10, 10], 0, STD).nextWeight).toBe(12.5);
  });

  it("never deloads, however many misses", () => {
    expect(progress(ex("romanian-deadlift"), 55, [8, 8, 8], 5, STD)).toMatchObject({ nextWeight: 55, result: "repeat", failStreak: 0 });
  });
});

describe("progress: assisted pull-ups", () => {
  const pullUp = ex("assisted-pull-up");

  it("removes assistance when every set hits 8", () => {
    const p = progress(pullUp, 40, [8, 8, 8], 0, STD);
    expect(p).toMatchObject({ nextWeight: 35, result: "progress" });
    expect(p.message).toContain("35 lb of assistance");
  });

  it("keeps the assistance after a miss", () => {
    expect(progress(pullUp, 40, [8, 8, 7], 0, STD)).toMatchObject({ nextWeight: 40, result: "repeat" });
  });

  it("bottoms out at unassisted", () => {
    expect(progress(pullUp, 5, [8, 8, 8], 0, STD)).toMatchObject({ nextWeight: 0, message: "Next time: unassisted pull-ups." });
    expect(progress(pullUp, 0, [8, 8, 8], 0, STD).nextWeight).toBe(0);
  });
});

describe("progress: bodyweight moves", () => {
  it("only logs, with no weight change", () => {
    expect(progress(ex("frog-pump"), 0, [30, 25], 0, STD)).toMatchObject({ nextWeight: 0, result: "logged" });
    expect(progress(ex("frog-pump"), 0, [30, 30], 0, STD)).toMatchObject({ nextWeight: 0, result: "progress" });
    expect(progress(ex("plank"), 0, [45, 45], 0, STD).message).toContain("hold a plate");
  });
});

describe("loadable", () => {
  it("rounds down to the next loadable weight", () => {
    expect(loadable(58.5, STD)).toBe(57.5);
    expect(loadable(58.5, BIG_PLATES)).toBe(55);
    expect(loadable(59.5, BAR33)).toBe(58);
    expect(loadable(59.5, BAR35)).toBe(57.5);
  });

  it("keeps weights that are already loadable", () => {
    expect(loadable(72.5, STD)).toBe(72.5);
    expect(loadable(53, BAR33)).toBe(53);
  });

  it("never goes below the bar", () => {
    expect(loadable(20, STD)).toBe(45);
    expect(loadable(20, BAR33)).toBe(33);
  });
});

describe("plates", () => {
  it("loads 1.25 lb plates when the gym has them", () => {
    expect(plates(72.5, STD)).toMatchObject({ loaded: 72.5, perSide: [10, 2.5, 1.25], exact: true });
  });

  it("uses big plates first", () => {
    expect(plates(225, STD)).toMatchObject({ loaded: 225, perSide: [45, 45], exact: true });
    expect(plates(205, STD).perSide).toEqual([45, 35]);
  });

  it("reports the closest loadable weight when 1.25s aren't available", () => {
    const p = plates(72.5, BIG_PLATES);
    expect(p).toMatchObject({ loaded: 70, perSide: [10, 2.5], exact: false });
    expect(p.note).toBe("Closest loadable weight is 70 lb.");
  });

  it("works with a 35 lb bar", () => {
    expect(plates(60, BAR35)).toMatchObject({ loaded: 60, perSide: [10, 2.5], exact: true });
  });

  it("works with a 33 lb (15 kg) bar", () => {
    expect(plates(53, BAR33)).toMatchObject({ loaded: 53, perSide: [10], exact: true });
    expect(plates(50, BAR33)).toMatchObject({ loaded: 48, perSide: [5, 2.5], exact: false, note: "Closest loadable weight is 48 lb." });
  });

  it("handles the empty bar and weights below it", () => {
    expect(plates(45, STD)).toMatchObject({ loaded: 45, perSide: [], exact: true, note: undefined });
    const light = plates(30, STD);
    expect(light).toMatchObject({ loaded: 45, perSide: [], exact: false });
    expect(light.note).toContain("Below the 45 lb bar");
  });
});

describe("warmups", () => {
  it("ramps a heavier lift up in four sets", () => {
    expect(warmups(135, STD)).toEqual([
      { weight: 45, reps: 10 },
      { weight: 67.5, reps: 5 },
      { weight: 92.5, reps: 3 },
      { weight: 112.5, reps: 2 },
    ]);
  });

  it("adds a second empty-bar set for light lifts", () => {
    expect(warmups(65, STD)).toEqual([
      { weight: 45, reps: 10 },
      { weight: 45, reps: 5 },
      { weight: 55, reps: 2 },
    ]);
  });

  it("is only the empty bar when the work weight is the bar", () => {
    expect(warmups(45, STD)).toEqual([{ weight: 45, reps: 10 }]);
  });

  it("follows the bar and plate settings", () => {
    expect(warmups(85, BAR33)).toEqual([
      { weight: 33, reps: 10 },
      { weight: 38, reps: 5 },
      { weight: 58, reps: 3 },
      { weight: 68, reps: 2 },
    ]);
    expect(warmups(85, BAR35)).toEqual([
      { weight: 35, reps: 10 },
      { weight: 42.5, reps: 5 },
      { weight: 57.5, reps: 3 },
      { weight: 70, reps: 2 },
    ]);
  });

  it("always climbs, stays below the work weight and is loadable", () => {
    for (const s of [STD, BIG_PLATES, BAR35, BAR33]) {
      for (let work = s.barWeight; work <= 225; work += 2.5) {
        const sets = warmups(work, s);
        for (let i = 1; i < sets.length; i++) expect(sets[i].weight).toBeGreaterThanOrEqual(sets[i - 1].weight);
        for (const set of sets) {
          expect(set.weight).toBeLessThanOrEqual(work);
          expect(loadable(set.weight, s)).toBe(set.weight);
        }
      }
    }
  });
});

describe("e1rm (Epley)", () => {
  it("estimates a one-rep max", () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 5)).toBe(117);
    expect(e1rm(85, 8)).toBe(108);
    expect(e1rm(100, 10)).toBe(133);
  });

  it("caps reps at 10", () => {
    expect(e1rm(100, 15)).toBe(e1rm(100, 10));
  });

  it("is 0 for no reps or no weight", () => {
    expect(e1rm(100, 0)).toBe(0);
    expect(e1rm(0, 5)).toBe(0);
  });
});

describe("weightStep", () => {
  it("matches the bar jump for barbells and fixed steps otherwise", () => {
    expect(weightStep(ex("back-squat"), STD)).toBe(2.5);
    expect(weightStep(ex("back-squat"), BIG_PLATES)).toBe(5);
    expect(weightStep(ex("bulgarian-split-squat"), STD)).toBe(2.5);
    expect(weightStep(ex("lat-pulldown"), STD)).toBe(5);
    expect(weightStep(ex("assisted-pull-up"), STD)).toBe(5);
  });
});
