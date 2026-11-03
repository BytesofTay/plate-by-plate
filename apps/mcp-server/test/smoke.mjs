// End-to-end check: starts the built server over stdio and exercises every tool.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pbp-")), "data.json");
const transport = new StdioClientTransport({ command: "node", args: ["dist/index.js"], env: { ...process.env, PLATE_BY_PLATE_DATA: dataFile } });
const client = new Client({ name: "smoke", version: "1.0.0" });
await client.connect(transport);

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return { text: r.content.map((c) => c.text).join("\n"), isError: r.isError };
};

const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name).join(", "));
assert.equal(tools.length, 10);

let r = await call("get_next_workout");
assert.match(r.text, /Lower A/);
assert.match(r.text, /Back Squat: 3 x 5 @ 65 lb/);
assert.match(r.text, /45 lb bar \+ 10 per side/);
console.log("\n--- next workout ---\n" + r.text);

// Lower A: hit all squat reps, miss RDL top of range
r = await call("log_workout", { exercises: [
  { exercise_id: "back-squat", reps: [5, 5, 5] },
  { exercise_id: "romanian-deadlift", reps: [10, 9, 8] },
  { exercise_id: "hip-abduction", reps: [20, 20, 18] },
]});
console.log("\n--- log ---\n" + r.text);
assert.match(r.text, /Next time: 70 lb/);
assert.match(r.text, /Next workout: Upper A/);

// Upper A: miss bench twice -> deload
for (let i = 0; i < 2; i++) {
  r = await call("log_workout", { day_id: "upper-a", exercises: [{ exercise_id: "bench-press", weight: 60, reps: [5, 4, 3] }] });
}
assert.match(r.text, /Deload to 52.5 lb/);

r = await call("undo_last_workout");
assert.match(r.text, /Weights restored/);
r = await call("get_next_workout", { day_id: "upper-a" });
assert.match(r.text, /Bench Press: 3 x 5 @ 60 lb/);

r = await call("plate_calculator", { weight: 72.5 });
assert.match(r.text, /10 \+ 2.5 \+ 1.25/);
r = await call("update_settings", { bar_weight: 33, smallest_plate: 2.5 });
r = await call("plate_calculator", { weight: 50 });
console.log("\n" + r.text);
assert.match(r.text, /Closest loadable weight is 48 lb/);

// Lower B: hip thrust is a 3x8 main lift
r = await call("get_next_workout", { day_id: "lower-b" });
assert.match(r.text, /Barbell Hip Thrust: 3 x 8 @ 85 lb/);
r = await call("log_workout", { day_id: "lower-b", exercises: [{ exercise_id: "hip-thrust", reps: [8, 8, 8] }, { exercise_id: "frog-pump", reps: [30, 25] }] });
assert.match(r.text, /Barbell Hip Thrust: 8\/8\/8 @ 85 lb\. All reps done\. Next time: 90 lb/);
r = await call("get_program");
assert.match(r.text, /Glute work: trained 4 days a week, \d+ hard sets a week/);
console.log("\n" + r.text.split("\n").find((l) => l.startsWith("Glute work")));

r = await call("set_working_weight", { exercise_id: "assisted-pull-up", weight: 50 });
r = await call("log_workout", { day_id: "upper-b", exercises: [{ exercise_id: "assisted-pull-up", reps: [8, 8, 8] }] });
assert.match(r.text, /45 lb of assistance/);

r = await call("get_progress");
console.log("\n--- progress ---\n" + r.text);
assert.match(r.text, /Back Squat: 65 lb -> 70 lb/);

r = await call("get_history", { limit: 2 });
console.log("\n--- history ---\n" + r.text);

r = await call("log_workout", { exercises: [{ exercise_id: "nope", reps: [1] }] });
assert.equal(r.isError, true);

r = await call("get_morning_routine", { training_day: true });
assert.match(r.text, /Breakfast with protein/);
assert.match(r.text, /Lifting today/);
assert.match(r.text, /Creatine monohydrate \(optional\)/);
console.log("\n--- morning ---\n" + r.text.split("\n").filter((l) => l.startsWith("[ ]")).join("\n"));

const { prompts } = await client.listPrompts();
assert.equal(prompts[0].name, "coach_todays_workout");

await client.close();
console.log("\nAll checks passed.");
