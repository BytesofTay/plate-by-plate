# Plate by Plate

A glute-priority strength-training app for 4 days a week. It gives you today's workout with plate math and warm-ups, lets you log sets with a tap, runs a rest timer, raises weights automatically, charts progress, and has a quick morning routine.

| Part | What it is | Status |
| --- | --- | --- |
| `mcp-server/` | MCP server so Claude can coach and log workouts | Working, tested |
| `web-prototype/` | Single-file web app (also live as a private claude.ai artifact) | Working |
| `docs/friends-plan.md` | Plan for Next.js + Supabase with accounts and a friends feed | Next step |
| `docs/programs.md` | Glute Priority and Balanced Strength program templates | Reference |

## Quick start

```bash
# MCP server
cd mcp-server
npm install
npm run build
npm test

# Web prototype: open it in a browser
open ../web-prototype/index.html
```

To connect the MCP server to Claude Desktop, see `mcp-server/README.md`.

## Continue in Claude Code

1. Unzip this folder somewhere you keep projects.
2. In the Claude desktop app, open the **Code** tab and choose this folder. In a terminal, `cd plate-by-plate && claude` works too.
3. Claude Code reads `CLAUDE.md` automatically. A good first prompt:

   > Read CLAUDE.md and docs/friends-plan.md. Set up git, then do milestone 1: the monorepo with a shared core package and tests.

## The program at a glance

| Day | Main lift | Glute work |
| --- | --- | --- |
| Lower A (Mon) | Back Squat 3×5 | RDL, Bulgarian split squat, 45° back extension, hip abduction |
| Upper A (Tue) | Bench Press 3×5 | Cable kickback finisher |
| Lower B (Thu) | Hip Thrust 3×8, Deadlift 3×5 | Step-up, frog pump finisher |
| Upper B (Fri) | Overhead Press 3×5 | Single-leg hip thrust finisher |

Full details are in `docs/programs.md`. The morning routine is general guidance, not medical advice: check with a doctor or pharmacist before starting a supplement.
