#!/usr/bin/env node
// Copies the program and morning-routine data from the MCP server (the source of truth)
// into web-prototype/app.html, between the <generated:program> markers, then rebuilds
// web-prototype/index.html: a standalone copy you can open directly in a browser.
//
// Usage (from the repo root, after building the server):
//   cd mcp-server && npm install && npm run build && cd ..
//   node scripts/sync-prototype.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "mcp-server", "dist");
if (!fs.existsSync(path.join(dist, "program.js")) || !fs.existsSync(path.join(dist, "morning.js"))) {
  console.error("Build the MCP server first: cd mcp-server && npm install && npm run build");
  process.exit(1);
}
const { PROGRAM } = await import(pathToFileURL(path.join(dist, "program.js")).href);
const { MORNING, BREAKFAST_IDEAS, MORNING_NOTE } = await import(pathToFileURL(path.join(dist, "morning.js")).href);

// One exercise per line keeps diffs readable.
const lines = ["const PROGRAM = ["];
for (const day of PROGRAM) {
  const { exercises, ...rest } = day;
  lines.push(`  { ${JSON.stringify(rest).slice(1, -1)}, exercises: [`);
  for (const ex of exercises) lines.push(`    ${JSON.stringify(ex)},`);
  lines.push("  ]},");
}
lines.push("];", "const MORNING = [");
for (const item of MORNING) lines.push(`  ${JSON.stringify(item)},`);
lines.push("];");
lines.push(`const BREAKFAST_IDEAS = ${JSON.stringify(BREAKFAST_IDEAS)};`);
lines.push(`const MORNING_NOTE = ${JSON.stringify(MORNING_NOTE)};`);

const appPath = path.join(root, "web-prototype", "app.html");
let app = fs.readFileSync(appPath, "utf8");
const START = "// <generated:program>";
const END = "// </generated:program>";
const a = app.indexOf(START);
const b = app.indexOf(END);
if (a < 0 || b < a) throw new Error(`Couldn't find the ${START} ... ${END} markers in web-prototype/app.html`);
const afterStartLine = app.indexOf("\n", a) + 1;
const next = app.slice(0, afterStartLine) + lines.join("\n") + "\n" + app.slice(b);
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
console.log(`${changed ? "Updated" : "No program changes in"} web-prototype/app.html; rebuilt web-prototype/index.html`);
