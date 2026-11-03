#!/usr/bin/env node
// Copies the Glute Priority program, the morning routine and the progression logic from
// packages/core (the source of truth) into web-prototype/app.html, between the
// <generated:program> and <generated:logic> markers, then rebuilds web-prototype/index.html:
// a standalone copy you can open directly in a browser.
//
// Usage (from the repo root):
//   npm run sync-prototype        # builds core, then runs this script

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "packages", "core", "dist");
if (!fs.existsSync(path.join(dist, "index.js")) || !fs.existsSync(path.join(dist, "logic.js"))) {
  console.error("Build the core package first: npm install && npm run build -w @plate-by-plate/core");
  process.exit(1);
}
const { PROGRAMS, MORNING, BREAKFAST_IDEAS, MORNING_NOTE } = await import(pathToFileURL(path.join(dist, "index.js")).href);
const PROGRAM = PROGRAMS["glute-priority"].days;

// One exercise per line keeps diffs readable.
const program = ["const PROGRAM = ["];
for (const day of PROGRAM) {
  const { exercises, ...rest } = day;
  program.push(`  { ${JSON.stringify(rest).slice(1, -1)}, exercises: [`);
  for (const ex of exercises) program.push(`    ${JSON.stringify(ex)},`);
  program.push("  ]},");
}
program.push("];", "const MORNING = [");
for (const item of MORNING) program.push(`  ${JSON.stringify(item)},`);
program.push("];");
program.push(`const BREAKFAST_IDEAS = ${JSON.stringify(BREAKFAST_IDEAS)};`);
program.push(`const MORNING_NOTE = ${JSON.stringify(MORNING_NOTE)};`);

// logic.js compiles to plain functions with no runtime imports, so the prototype can inline it
// as a classic script once the `export` keywords are gone.
const logicSrc = fs.readFileSync(path.join(dist, "logic.js"), "utf8");
if (/^\s*import\s/m.test(logicSrc)) throw new Error("packages/core/src/logic.ts must not import anything at runtime; the prototype inlines it.");
const logic = logicSrc
  .split("\n")
  .filter((l) => !l.startsWith("//# sourceMappingURL"))
  .map((l) => l.replace(/^export /, ""))
  .join("\n")
  .trim()
  .split("\n");

function replaceBetween(text, name, lines) {
  const START = `// <generated:${name}>`;
  const END = `// </generated:${name}>`;
  const a = text.indexOf(START);
  const b = text.indexOf(END);
  if (a < 0 || b < a) throw new Error(`Couldn't find the ${START} ... ${END} markers in web-prototype/app.html`);
  const afterStartLine = text.indexOf("\n", a) + 1;
  return text.slice(0, afterStartLine) + lines.join("\n") + "\n" + text.slice(b);
}

const appPath = path.join(root, "web-prototype", "app.html");
let app = fs.readFileSync(appPath, "utf8");
const next = replaceBetween(replaceBetween(app, "program", program), "logic", logic);
const changed = next !== app;
if (changed) fs.writeFileSync(appPath, next);
app = next;

// app.html is written for claude.ai, which wraps it in a document skeleton at publish time.
// For the standalone copy, put everything before the page header into <head>.
const split = app.indexOf('<header class="top">');
const head = split > 0 ? app.slice(0, split) : "";
const body = split > 0 ? app.slice(split) : app;
const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
<!-- Generated from app.html by scripts/sync-prototype.mjs. Edit app.html, not this file. -->
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(root, "web-prototype", "index.html"), standalone);
console.log(`${changed ? "Updated" : "No program or logic changes in"} web-prototype/app.html; rebuilt web-prototype/index.html`);
