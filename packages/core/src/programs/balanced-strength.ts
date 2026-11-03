// Balanced Strength: the first Plate by Plate program, before the glute focus. Even upper/lower
// strength work on squat, bench, deadlift and press, with general accessories. A good default for
// anyone who doesn't want the glute emphasis. Exercise ids match Glute Priority wherever the
// movement is the same. All weights are in pounds. Dumbbell weights are per hand where `perHand` is set.

import type { Day, Program } from "../program.js";

const DAYS: Day[] = [
  {
    id: "lower-a",
    name: "Lower A",
    focus: "Squat",
    suggestedWeekday: "Monday",
    exercises: [
      { id: "back-squat", name: "Back Squat", kind: "barbell", main: true, glute: true, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 5, start: 65, restSec: 180, cue: "Brace, then sit deep, at least thighs parallel. Drive up through your whole foot." },
      { id: "romanian-deadlift", name: "Romanian Deadlift", kind: "barbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 55, restSec: 120, cue: "Soft knees, push your hips back until you feel a deep stretch, then squeeze your glutes to stand." },
      { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", kind: "dumbbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perSide: true, perHand: true, increment: 2.5, start: 10, restSec: 90, cue: "Rear foot on the bench, front shin roughly vertical, lower straight down." },
      { id: "leg-curl", name: "Lying Leg Curl", kind: "machine", main: false, glute: false, sets: 3, repsMin: 10, repsMax: 12, unit: "reps", increment: 5, start: 30, restSec: 75, cue: "Hips pressed into the pad, curl all the way up and lower slowly." },
      { id: "plank", name: "Plank", kind: "bodyweight", main: false, glute: false, sets: 3, repsMin: 30, repsMax: 45, unit: "sec", increment: 0, start: 0, restSec: 60, cue: "Squeeze glutes, ribs down, straight line from head to heels." },
    ],
  },
  {
    id: "upper-a",
    name: "Upper A",
    focus: "Bench",
    suggestedWeekday: "Tuesday",
    exercises: [
      { id: "bench-press", name: "Bench Press", kind: "barbell", main: true, glute: false, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 2.5, start: 45, restSec: 180, cue: "Shoulder blades pinched, feet planted, touch mid-chest, press up and slightly back." },
      { id: "chest-supported-row", name: "Chest-Supported DB Row", kind: "dumbbell", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perHand: true, increment: 2.5, start: 15, restSec: 90, cue: "Chest on an incline bench, pull elbows toward your hips." },
      { id: "seated-db-press", name: "Seated DB Shoulder Press", kind: "dumbbell", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perHand: true, increment: 2.5, start: 10, restSec: 90, cue: "Back on the pad, press straight up without flaring the ribs." },
      { id: "lat-pulldown", name: "Lat Pulldown", kind: "machine", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 40, restSec: 90, cue: "Pull the bar to your upper chest, elbows down and in." },
      { id: "db-curl", name: "DB Biceps Curl", kind: "dumbbell", main: false, glute: false, sets: 2, repsMin: 10, repsMax: 12, unit: "reps", perHand: true, increment: 2.5, start: 8, restSec: 60, cue: "Elbows pinned to your sides, no swinging, lower under control." },
      { id: "triceps-pushdown", name: "Triceps Rope Pushdown", kind: "machine", main: false, glute: false, sets: 2, repsMin: 10, repsMax: 12, unit: "reps", increment: 5, start: 20, restSec: 60, cue: "Elbows tucked, push down and spread the rope apart at the bottom." },
    ],
  },
  {
    id: "lower-b",
    name: "Lower B",
    focus: "Deadlift",
    suggestedWeekday: "Thursday",
    exercises: [
      { id: "deadlift", name: "Deadlift", kind: "barbell", main: true, glute: true, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 5, start: 85, restSec: 180, cue: "Bar over midfoot, chest up, push the floor away, finish by squeezing your glutes, not leaning back." },
      { id: "goblet-squat", name: "Goblet Squat", kind: "dumbbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 20, restSec: 90, cue: "Hold one dumbbell at your chest, elbows inside your knees at the bottom, stay tall." },
      { id: "hip-thrust", name: "Barbell Hip Thrust", kind: "barbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 65, restSec: 90, cue: "Upper back on the bench, bar pad on your hips, chin tucked. Drive through your heels and hold the top for 1 second." },
      { id: "walking-lunge", name: "Walking Lunge", kind: "dumbbell", main: false, glute: true, sets: 2, repsMin: 10, repsMax: 12, unit: "reps", perSide: true, perHand: true, increment: 2.5, start: 10, restSec: 75, cue: "Long steps, back knee just above the floor, push through the front heel." },
      { id: "hanging-knee-raise", name: "Hanging Knee Raise", kind: "bodyweight", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 12, unit: "reps", increment: 0, start: 0, restSec: 60, cue: "Hang still, curl your knees up toward your chest and lower slowly without swinging." },
    ],
  },
  {
    id: "upper-b",
    name: "Upper B",
    focus: "Press",
    suggestedWeekday: "Friday",
    exercises: [
      { id: "overhead-press", name: "Overhead Press", kind: "barbell", main: true, glute: false, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 2.5, start: 45, restSec: 180, cue: "Squeeze glutes, press straight up, move your head through at the top." },
      { id: "assisted-pull-up", name: "Assisted Pull-Up", kind: "assisted", main: false, glute: false, sets: 3, repsMin: 5, repsMax: 8, unit: "reps", increment: 5, start: 40, restSec: 120, cue: "Full hang to chin over the bar. Progress means less assistance." },
      { id: "incline-db-press", name: "Incline DB Press", kind: "dumbbell", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perHand: true, increment: 2.5, start: 15, restSec: 90, cue: "Bench at 30 degrees, lower to the upper chest." },
      { id: "seated-cable-row", name: "Seated Cable Row", kind: "machine", main: false, glute: false, sets: 3, repsMin: 10, repsMax: 12, unit: "reps", increment: 5, start: 40, restSec: 75, cue: "Sit tall, pull to your belly button, squeeze the shoulder blades." },
      { id: "face-pull", name: "Face Pull", kind: "machine", main: false, glute: false, sets: 2, repsMin: 12, repsMax: 15, unit: "reps", increment: 5, start: 15, restSec: 60, cue: "Rope at face height, pull toward your forehead and finish with your hands beside your ears." },
      { id: "lateral-raise", name: "DB Lateral Raise", kind: "dumbbell", main: false, glute: false, sets: 2, repsMin: 12, repsMax: 15, unit: "reps", perHand: true, increment: 2.5, start: 5, restSec: 60, cue: "Slight bend in the elbows, raise out to shoulder height, lead with the elbows." },
    ],
  },
];

const RULES = [
  "Train 4 days a week in order: Lower A, Upper A, Lower B, Upper B. A good week is Mon / Tue / Thu / Fri.",
  "Main lifts: squat, deadlift, bench and press are 3 sets of 5. Get every rep with good form and the weight goes up next time: +5 lb on squat and deadlift, +2.5 lb on bench and press.",
  "Miss reps at the same weight two sessions in a row and that lift drops about 10%, then climbs again.",
  "Accessories use a rep range (e.g. 8-10). Stay at a weight until you hit the top of the range on every set, then make the next small jump.",
  "Assisted pull-ups progress by removing 5 lb of assistance once you hit 8 reps on all sets.",
  "Warm up every main lift with the empty bar, then 2-3 lighter ramp-up sets.",
  "Rest 2-3 minutes between main-lift sets and 60-120 seconds between accessory sets.",
  "Use 1.25 lb plates on bench and press if the gym has them. Small jumps keep progress going for longer.",
];

export const BALANCED_STRENGTH: Program = {
  id: "balanced-strength",
  name: "Balanced Strength",
  summary: "Even upper/lower strength work on squat, bench, deadlift and press, with general accessories.",
  days: DAYS,
  rules: RULES,
};
