#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { FUELING_NOTE, PROGRAM, ROTATION, RULES, findDay, findExercise, type Exercise } from "./program.js";
import { e1rm, plates, progress, warmups, type Settings } from "./logic.js";
import { BREAKFAST_IDEAS, MORNING, MORNING_NOTE } from "./morning.js";
import { DATA_FILE, load, save, type LoggedExercise, type Session, type State } from "./store.js";

const server = new McpServer({ name: "plate-by-plate", version: "1.0.0" });

const DAY_IDS = ROTATION as [string, ...string[]];
const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const fail = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true });

function scheme(ex: Exercise): string {
  const reps = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}-${ex.repsMax}`;
  const unit = ex.unit === "sec" ? " sec" : "";
  return `${ex.sets} x ${reps}${unit}${ex.perSide ? " per side" : ""}`;
}

function weightLabel(ex: Exercise, w: number): string {
  if (ex.kind === "bodyweight") return "bodyweight";
  if (ex.kind === "assisted") return w === 0 ? "no assistance" : `${w} lb assistance`;
  return `${w} lb${ex.perHand ? " per hand" : ""}`;
}

function plateLine(w: number, s: Settings): string {
  const p = plates(w, s);
  if (p.note && !p.perSide.length) return p.note;
  const side = p.perSide.length ? p.perSide.join(" + ") : "nothing";
  return `${s.barWeight} lb bar + ${side} per side${p.note ? ` (${p.note})` : ""}`;
}

function describeWorkout(state: State, dayId: string): string {
  const day = findDay(dayId)!;
  const s = state.settings;
  const lines = [`${day.name} (${day.focus} day)`, ""];
  day.exercises.forEach((ex, i) => {
    const w = state.weights[ex.id] ?? ex.start;
    lines.push(`${i + 1}. ${ex.tag ? `${ex.tag}: ` : ""}${ex.name}: ${scheme(ex)} @ ${weightLabel(ex, w)}  [${ex.id}]`);
    if (ex.kind === "barbell") lines.push(`   Load: ${plateLine(w, s)}`);
    if (ex.main) lines.push(`   Warm-up: ${warmups(w, s).map((x) => `${x.weight}x${x.reps}`).join(", ")}`);
    const rest = ex.restSec >= 120 && ex.restSec % 60 === 0 ? `${ex.restSec / 60} min` : `${ex.restSec} sec`;
    lines.push(`   Rest ${rest}. Cue: ${ex.cue}`);
  });
  return lines.join("\n");
}

server.registerTool(
  "get_program",
  {
    title: "Get program",
    description: "The full glute-priority 4-day upper/lower strength program (exercises, sets, reps, progression rules) built for an ~88 lb lifter with some experience and a full gym.",
    annotations: { readOnlyHint: true },
  },
  async () => {
    const lines: string[] = ["PLATE BY PLATE: glute-priority 4-day upper/lower strength program", ""];
    for (const day of PROGRAM) {
      lines.push(`${day.name} (${day.focus}) [${day.id}], suggested ${day.suggestedWeekday}`);
      for (const ex of day.exercises) lines.push(`  - ${ex.name}: ${scheme(ex)}${ex.main ? " (main lift)" : ""}${ex.tag ? ` (${ex.tag.toLowerCase()})` : ""}${ex.glute ? " [glutes]" : ""}`);
      lines.push("");
    }
    const gluteSets = PROGRAM.flatMap((d) => d.exercises).filter((e) => e.glute).reduce((n, e) => n + e.sets, 0);
    lines.push(`Glute work: trained 4 days a week, ${gluteSets} hard sets a week.`, "");
    lines.push("Rules:", ...RULES.map((r) => `  - ${r}`), "", `Fueling: ${FUELING_NOTE}`);
    return text(lines.join("\n"));
  },
);

server.registerTool(
  "get_next_workout",
  {
    title: "Get next workout",
    description: "Today's workout with prescribed weights, plate loading, warm-up sets, rest times and form cues. Defaults to the next day in the rotation.",
    inputSchema: { day_id: z.enum(DAY_IDS).optional().describe("Override which day to show") },
    annotations: { readOnlyHint: true },
  },
  async ({ day_id }) => {
    const state = await load();
    const dayId = day_id ?? ROTATION[state.nextDay % ROTATION.length];
    const header = day_id ? "" : `Next up in the rotation (${state.sessions.length} workouts logged so far):\n\n`;
    return text(header + describeWorkout(state, dayId));
  },
);

server.registerTool(
  "log_workout",
  {
    title: "Log workout",
    description:
      "Save a finished workout and work out next session's weights. Give reps actually done for each set (seconds for planks). Weight defaults to the prescribed weight. Exercises you leave out are not logged and keep their weight.",
    inputSchema: {
      day_id: z.enum(DAY_IDS).optional().describe("Which day was trained. Defaults to the next day in the rotation."),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD, defaults to today"),
      exercises: z
        .array(
          z.object({
            exercise_id: z.string().describe("Exercise id, e.g. back-squat"),
            weight: z.number().min(0).optional().describe("Pounds used (per hand for dumbbells, assistance for assisted pull-ups)"),
            reps: z.array(z.number().int().min(0)).min(1).describe("Reps per set, e.g. [5,5,4]"),
          }),
        )
        .min(1),
      notes: z.string().optional(),
    },
  },
  async ({ day_id, date, exercises, notes }) => {
    const state = await load();
    const dayId = day_id ?? ROTATION[state.nextDay % ROTATION.length];
    const before = { weights: { ...state.weights }, failStreak: { ...state.failStreak }, nextDay: state.nextDay };
    const logged: LoggedExercise[] = [];
    const out: string[] = [];

    for (const item of exercises) {
      const found = findExercise(item.exercise_id);
      if (!found) return fail(`Unknown exercise "${item.exercise_id}". Call get_program to see valid ids.`);
      const ex = found.exercise;
      const weight = item.weight ?? state.weights[ex.id] ?? ex.start;
      const p = progress(ex, weight, item.reps, state.failStreak[ex.id] ?? 0, state.settings);
      state.weights[ex.id] = p.nextWeight;
      state.failStreak[ex.id] = p.failStreak;
      logged.push({ exerciseId: ex.id, weight, reps: item.reps, result: p.result, message: p.message });
      out.push(`- ${ex.name}: ${item.reps.join("/")} @ ${weightLabel(ex, weight)}. ${p.message}`);
    }

    const session: Session & { before: typeof before } = {
      id: `s_${Date.now().toString(36)}`,
      date: date ?? new Date().toISOString().slice(0, 10),
      dayId,
      exercises: logged,
      notes,
      before,
    };
    state.sessions.push(session);
    state.nextDay = (ROTATION.indexOf(dayId) + 1) % ROTATION.length;
    await save(state);

    const next = findDay(ROTATION[state.nextDay])!;
    return text([`Saved ${findDay(dayId)!.name} on ${session.date}.`, ...out, "", `Next workout: ${next.name} (${next.focus}).`].join("\n"));
  },
);

server.registerTool(
  "undo_last_workout",
  {
    title: "Undo last workout",
    description: "Remove the most recently logged workout and restore the weights and rotation from before it.",
    annotations: { destructiveHint: true },
  },
  async () => {
    const state = await load();
    const last = state.sessions.pop() as (Session & { before?: { weights: Record<string, number>; failStreak: Record<string, number>; nextDay: number } }) | undefined;
    if (!last) return fail("There are no logged workouts to undo.");
    if (last.before) {
      state.weights = last.before.weights;
      state.failStreak = last.before.failStreak;
      state.nextDay = last.before.nextDay;
    }
    await save(state);
    return text(`Removed ${findDay(last.dayId)?.name ?? last.dayId} from ${last.date}. Weights restored.`);
  },
);

server.registerTool(
  "get_history",
  {
    title: "Get history",
    description: "Recent logged workouts, newest first. Optionally filter to one exercise.",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional().describe("How many workouts, default 10"),
      exercise_id: z.string().optional(),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ limit, exercise_id }) => {
    const state = await load();
    if (exercise_id && !findExercise(exercise_id)) return fail(`Unknown exercise "${exercise_id}".`);
    const sessions = [...state.sessions].reverse().filter((s) => !exercise_id || s.exercises.some((e) => e.exerciseId === exercise_id)).slice(0, limit ?? 10);
    if (!sessions.length) return text("No workouts logged yet.");
    const lines: string[] = [];
    for (const s of sessions) {
      lines.push(`${s.date}  ${findDay(s.dayId)?.name ?? s.dayId}${s.notes ? `  (${s.notes})` : ""}`);
      for (const e of s.exercises) {
        if (exercise_id && e.exerciseId !== exercise_id) continue;
        const ex = findExercise(e.exerciseId)?.exercise;
        lines.push(`  ${ex?.name ?? e.exerciseId}: ${e.reps.join("/")} @ ${ex ? weightLabel(ex, e.weight) : `${e.weight} lb`} [${e.result}]`);
      }
    }
    return text(lines.join("\n"));
  },
);

server.registerTool(
  "get_progress",
  {
    title: "Get progress",
    description: "Strength progress: starting vs current weight and best estimated 1-rep max for each lift, plus training consistency.",
    annotations: { readOnlyHint: true },
  },
  async () => {
    const state = await load();
    const n = state.sessions.length;
    if (!n) return text("No workouts logged yet. Current starting weights:\n" + PROGRAM.flatMap((d) => d.exercises.filter((e) => e.main).map((e) => `  ${e.name}: ${state.weights[e.id]} lb`)).join("\n"));
    const today = Date.now();
    const within = (days: number) => state.sessions.filter((s) => today - Date.parse(s.date) <= days * 86400000).length;
    const lines = [`Workouts logged: ${n}  (last 7 days: ${within(7)}, last 28 days: ${within(28)} of 16 planned)`, ""];
    for (const day of PROGRAM) {
      for (const ex of day.exercises) {
        const logs = state.sessions.flatMap((s) => s.exercises.filter((e) => e.exerciseId === ex.id).map((e) => ({ ...e, date: s.date })));
        if (!logs.length) continue;
        const first = logs[0].weight;
        const now = state.weights[ex.id];
        let line = `${ex.name}: ${weightLabel(ex, first)} -> ${weightLabel(ex, now)}`;
        if (ex.kind !== "bodyweight" && ex.kind !== "assisted") {
          const best = logs.reduce((b, l) => Math.max(b, ...l.reps.map((r) => e1rm(l.weight, r))), 0);
          if (ex.main && best) line += `  | best est. 1RM ${best} lb`;
        }
        if (ex.kind === "bodyweight") line = `${ex.name}: best set ${Math.max(...logs.flatMap((l) => l.reps))}${ex.unit === "sec" ? " sec" : " reps"}`;
        lines.push(`${ex.main ? "* " : "  "}${line}  (${logs.length} session${logs.length === 1 ? "" : "s"})`);
      }
    }
    return text(lines.join("\n"));
  },
);

server.registerTool(
  "set_working_weight",
  {
    title: "Set working weight",
    description: "Manually set the weight for an exercise's next session (e.g. after a test session, or if a suggested start is too heavy).",
    inputSchema: {
      exercise_id: z.string(),
      weight: z.number().min(0).describe("Pounds (per hand for dumbbells, assistance for assisted pull-ups)"),
    },
  },
  async ({ exercise_id, weight }) => {
    const found = findExercise(exercise_id);
    if (!found) return fail(`Unknown exercise "${exercise_id}".`);
    const state = await load();
    state.weights[exercise_id] = weight;
    state.failStreak[exercise_id] = 0;
    await save(state);
    return text(`${found.exercise.name} set to ${weightLabel(found.exercise, weight)} for next session.`);
  },
);

server.registerTool(
  "update_settings",
  {
    title: "Update gym settings",
    description: "Set the barbell weight and the smallest plate the gym has. These drive plate math, warm-ups and how small each jump can be.",
    inputSchema: {
      bar_weight: z.union([z.literal(45), z.literal(35), z.literal(33)]).optional().describe("45 standard, 35 or 33 (15 kg) women's bar"),
      smallest_plate: z.union([z.literal(1.25), z.literal(2.5)]).optional(),
    },
  },
  async ({ bar_weight, smallest_plate }) => {
    const state = await load();
    if (bar_weight !== undefined) state.settings.barWeight = bar_weight;
    if (smallest_plate !== undefined) state.settings.smallestPlate = smallest_plate;
    await save(state);
    return text(`Settings: ${state.settings.barWeight} lb bar, smallest plate ${state.settings.smallestPlate} lb.`);
  },
);

server.registerTool(
  "plate_calculator",
  {
    title: "Plate calculator",
    description: "Which plates to load on each side of the bar for a target weight, using the saved bar and plate settings.",
    inputSchema: { weight: z.number().min(0).describe("Total barbell weight in lb") },
    annotations: { readOnlyHint: true },
  },
  async ({ weight }) => {
    const state = await load();
    return text(`${weight} lb: ${plateLine(weight, state.settings)}`);
  },
);

server.registerTool(
  "get_morning_routine",
  {
    title: "Get morning routine",
    description: "A quick morning checklist: whether and what to eat before lifting, water, tea, and simple supplements (B-complex, creatine), with breakfast ideas. General guidance, not medical advice.",
    inputSchema: { training_day: z.boolean().optional().describe("True if there's a workout today; adds pre-lift meal timing") },
    annotations: { readOnlyHint: true },
  },
  async ({ training_day }) => {
    const lines = ["MORNING ROUTINE", ""];
    for (const item of MORNING) {
      lines.push(`[ ] ${item.name}${item.optional ? " (optional)" : ""}: ${item.how}`);
      if (training_day !== false && item.trainingDay) lines.push(`    ${item.trainingDay}`);
      lines.push(`    Why: ${item.why}`);
    }
    lines.push("", "Breakfast ideas:", ...BREAKFAST_IDEAS.map((b) => `  - ${b}`), "", MORNING_NOTE);
    return text(lines.join("\n"));
  },
);

server.registerPrompt(
  "coach_todays_workout",
  {
    title: "Coach today's workout",
    description: "Walk through today's session one exercise at a time, then log it.",
  },
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Call get_morning_routine with training_day true and give me a quick 3-line morning check-in first. Then call get_next_workout and coach me through today's session one exercise at a time: warm-ups, plate loading, then each work set. Ask me how many reps I got after each exercise. When I'm done, log everything with log_workout and tell me what changes next time.",
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`plate-by-plate MCP server running. Data file: ${DATA_FILE}`);
