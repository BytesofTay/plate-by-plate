// Glute Priority: the current Plate by Plate program. A glute-priority 4-day upper/lower strength split
// built for a lighter lifter (about 88 lb) with some training experience and a full gym.
// Glutes are trained all four days: heavy on both lower days, a short finisher on each upper day.
// All weights are in pounds. Dumbbell weights are per hand where `perHand` is set.

import type { Day, Program } from "../program.js";

const DAYS: Day[] = [
  {
    id: "lower-a",
    name: "Lower A",
    focus: "Squat",
    suggestedWeekday: "Monday",
    exercises: [
      { id: "back-squat", name: "Back Squat", kind: "barbell", main: true, glute: true, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 5, start: 65, restSec: 180, cue: "Brace, then sit deep, at least thighs parallel. Full depth is what works the glutes. Drive up through your whole foot." },
      { id: "romanian-deadlift", name: "Romanian Deadlift", kind: "barbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 55, restSec: 120, cue: "Soft knees, push your hips back until you feel a deep stretch, then squeeze your glutes to stand." },
      { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", kind: "dumbbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perSide: true, perHand: true, increment: 2.5, start: 10, restSec: 90, cue: "Front foot a little farther out, lean your chest slightly forward. That shifts the work into the glute." },
      { id: "back-extension", name: "45° Back Extension", kind: "dumbbell", main: false, glute: true, sets: 3, repsMin: 12, repsMax: 15, unit: "reps", increment: 5, start: 10, restSec: 75, cue: "Hold a plate or dumbbell at your chest, toes turned out, round your upper back slightly and lift with your glutes. Pause at the top." },
      { id: "hip-abduction", name: "Hip Abduction Machine", kind: "machine", main: false, glute: true, sets: 3, repsMin: 15, repsMax: 20, unit: "reps", increment: 5, start: 45, restSec: 60, cue: "Lean forward a little, push your knees out and hold the widest point for a second." },
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
      { id: "lat-pulldown", name: "Lat Pulldown", kind: "machine", main: false, glute: false, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", increment: 5, start: 40, restSec: 90, cue: "Pull the bar to your upper chest, elbows down and in." },
      { id: "seated-db-press", name: "Seated DB Shoulder Press", kind: "dumbbell", main: false, glute: false, sets: 2, repsMin: 8, repsMax: 10, unit: "reps", perHand: true, increment: 2.5, start: 10, restSec: 90, cue: "Back on the pad, press straight up without flaring the ribs." },
      { id: "cable-kickback", name: "Cable Glute Kickback", kind: "machine", main: false, glute: true, tag: "Glute finisher", sets: 2, repsMin: 12, repsMax: 15, unit: "reps", perSide: true, increment: 5, start: 10, restSec: 45, cue: "Ankle strap on, hinge forward slightly, kick back and up. Squeeze at the top and don't arch your lower back." },
    ],
  },
  {
    id: "lower-b",
    name: "Lower B",
    focus: "Hip Thrust",
    suggestedWeekday: "Thursday",
    exercises: [
      { id: "hip-thrust", name: "Barbell Hip Thrust", kind: "barbell", main: true, glute: true, sets: 3, repsMin: 8, repsMax: 8, unit: "reps", increment: 5, start: 85, restSec: 150, cue: "Upper back on the bench, bar pad on your hips, chin tucked. Drive through your heels and hold the top for 1 second." },
      { id: "deadlift", name: "Deadlift", kind: "barbell", main: true, glute: true, sets: 3, repsMin: 5, repsMax: 5, unit: "reps", increment: 5, start: 85, restSec: 180, cue: "Bar over midfoot, chest up, push the floor away, finish by squeezing your glutes, not leaning back." },
      { id: "db-step-up", name: "DB Step-Up", kind: "dumbbell", main: false, glute: true, sets: 3, repsMin: 8, repsMax: 10, unit: "reps", perSide: true, perHand: true, increment: 2.5, start: 10, restSec: 90, cue: "Knee-height box. Push through the heel of the top foot and don't push off the back foot." },
      { id: "frog-pump", name: "Frog Pump", kind: "bodyweight", main: false, glute: true, tag: "Glute finisher", sets: 2, repsMin: 20, repsMax: 30, unit: "reps", increment: 0, start: 0, restSec: 45, cue: "Soles of your feet together, knees out, short fast bridges with a hard squeeze each rep." },
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
      { id: "single-leg-hip-thrust", name: "Single-Leg Hip Thrust", kind: "bodyweight", main: false, glute: true, tag: "Glute finisher", sets: 2, repsMin: 10, repsMax: 15, unit: "reps", perSide: true, increment: 0, start: 0, restSec: 45, cue: "Upper back on the bench, one foot planted, other knee pulled in. Pause 1 second at the top." },
      { id: "plank", name: "Plank", kind: "bodyweight", main: false, glute: false, sets: 2, repsMin: 30, repsMax: 45, unit: "sec", increment: 0, start: 0, restSec: 45, cue: "Squeeze glutes, ribs down, straight line from head to heels." },
    ],
  },
];

const RULES = [
  "Train 4 days a week in order: Lower A, Upper A, Lower B, Upper B. A good week is Mon / Tue / Thu / Fri.",
  "Glutes get trained all 4 days: heavy on both lower days and a short finisher at the end of each upper day.",
  "Main lifts: squat, deadlift, bench and press are 3 sets of 5, and hip thrust is 3 sets of 8. Get every rep with good form and the weight goes up next time: +5 lb on hip thrust, squat and deadlift, +2.5 lb on bench and press.",
  "Miss reps at the same weight two sessions in a row and that lift drops about 10%, then climbs again.",
  "Accessories use a rep range (e.g. 8-10). Stay at a weight until you hit the top of the range on every set, then make the next small jump.",
  "Pause and squeeze at the top of every hip thrust, back extension and kickback. If you feel it in your lower back or hamstrings instead of your glutes, go lighter and slow down.",
  "Assisted pull-ups progress by removing 5 lb of assistance once you hit 8 reps on all sets.",
  "Warm up every main lift with the empty bar, then 2-3 lighter ramp-up sets.",
  "Rest 2-3 minutes between main-lift sets and 45-120 seconds between accessory sets.",
  "Use 1.25 lb plates on bench and press if the gym has them. Small jumps keep progress going for longer.",
];

export const GLUTE_PRIORITY: Program = {
  id: "glute-priority",
  name: "Glute Priority",
  summary: "Strength on the main barbell lifts, with glutes trained all four days (about 30 hard sets a week).",
  days: DAYS,
  rules: RULES,
};
