# Plate by Plate

A strength-training app built for one main user: a lighter lifter (about 88 lb) with some training experience who trains at a full gym. She runs a glute-priority 4-day upper/lower program. Tayllor owns the project. **The next milestone** is letting the main user, her boyfriend and other friends follow each other's workouts on Next.js + Supabase. The full plan is in `docs/friends-plan.md`. Confirm its open questions with Tayllor before building milestone 3.

## Repo layout

This is an npm workspaces monorepo (`packages/*`, `apps/*`).

- `packages/core/` (`@plate-by-plate/core`) is pure TypeScript with no Node or browser APIs. **It's the source of truth for the program:**
  - `src/program.ts`: the `Exercise`, `Day` and `Program` types, plus lookups that take a program (`findDay`, `findExercise`, `rotation`, `nextDayIndex`, `startingWeights`)
  - `src/programs/`: the templates, `glute-priority.ts` and `balanced-strength.ts`, and the `PROGRAMS` registry keyed by template id (`getProgram(id)` falls back to `DEFAULT_PROGRAM_ID`)
  - `src/morning.ts`: morning routine and breakfast ideas
  - `src/logic.ts`: progression, plate math, warm-ups, e1RM and `weightStep`. It must stay free of runtime imports, because the prototype inlines its compiled output.
  - `test/`: vitest unit tests
- `apps/mcp-server/` is a TypeScript MCP server (stdio, `@modelcontextprotocol/sdk` + zod) that imports core and runs the Glute Priority template.
  - `src/store.ts`: JSON file storage at `~/.plate-by-plate/data.json`, overridable with `PLATE_BY_PLATE_DATA`
  - `src/index.ts`: 10 tools and 1 prompt
  - `test/smoke.mjs`: end-to-end test over stdio
- `apps/web/` is the Next.js app (milestone 2, not created yet).
- `web-prototype/` holds the single-file web app.
  - `app.html` is the claude.ai artifact source.
  - `index.html` is a standalone copy generated from it. It runs in any browser and saves to localStorage.
  - Never edit `index.html` by hand.
- `scripts/sync-prototype.mjs` copies the Glute Priority program, the morning data and the compiled `logic.js` from the built core package into `app.html` (between the `<generated:program>` and `<generated:logic>` markers), then regenerates `index.html`.
- `docs/programs.md` describes both templates: Glute Priority (current) and Balanced Strength (the first version).
- `docs/friends-plan.md` is the build plan: monorepo and shared core, the Supabase app, crews and feed, and RLS.

## Commands

```bash
npm install && npm test          # build everything, core unit tests, MCP end-to-end test
npm test -w @plate-by-plate/core # core unit tests only
npm run sync-prototype           # after changing anything in packages/core
open web-prototype/index.html    # run the prototype locally
```

## Domain rules (keep these when porting)

- **Units:** everything is in pounds. `perHand` means the weight is per dumbbell. `perSide` means reps are per leg or arm.
- **Assisted pull-ups** store the *assistance* in lb, so progress makes the number go down.
- **Ids:** exercise and day ids are stable keys that saved logs reference. Never rename one; add a new id instead.
- **Rotation:** `lower-a` → `upper-a` → `lower-b` → `upper-b`. Finishing a day sets the next one to the day after it, even if she picked a different day than suggested.
- **Main lifts** have fixed reps: squat, deadlift, bench and press are 3×5; hip thrust is 3×8. If every set hits the target, add `increment`; a barbell jump is never smaller than two of the smallest plate. After 2 consecutive misses, drop to 90%, rounded down to a loadable weight and never below the bar.
- **Accessories** use double progression: stay at a weight until every set reaches `repsMax`.
- **Bodyweight moves** are logged only, with no automatic progression.
- **Gym settings:** bar is 45, 35 or 33 lb; smallest plate is 1.25 or 2.5 lb. These drive plate math and warm-ups.
- **e1RM** uses the Epley formula, capped at 10 reps.

## Product decisions so far

- **Focus:** strength with glute priority. Glutes are trained all 4 days, about 30 hard sets a week. Hip thrust is the featured lift on Progress.
- **No body tracking:** there's no body-weight, calorie or weight-loss tracking, and none was asked for. Fueling copy encourages eating enough: protein at most meals and always eating before lifting.
- **Morning routine:** breakfast with protein, water, tea (between meals, because it reduces iron absorption), optional B-complex, and optional creatine at 3 g/day. It's general guidance, not medical advice. Keep the "check with a doctor or pharmacist" note anywhere supplements appear. The routine is private and never shown to friends.
- **Visual identity:** chalk and iron neutrals with a competition-red accent. Plate colors follow plate size: 45 blue, 35 yellow, 25 green, 10 white, 5 black, 2.5 red, 1.25 chrome. Fonts are Big Shoulders Display, Public Sans and IBM Plex Mono. There are light and dark themes. The tokens are at the top of `web-prototype/app.html`; reuse them in the Next.js app.

## Keeping the prototype in sync

- The prototype's program data and progression functions are generated from core, so run `npm run sync-prototype` after changing anything in `packages/core`. Never hand-edit between the `<generated:…>` markers.
- The prototype only shows the Glute Priority template. Program choice arrives with the Next.js app.
- Republishing the live claude.ai artifact is a separate, manual step.

## Where things live

- The live claude.ai version of the prototype is https://claude.ai/artifact/4f1NyxRXddCVx4FfUfp7dY. It's private to Tayllor and uses claude.ai's per-user `db` storage under `data/users/<id>/profile`.
- Git history starts with an "Initial import" commit of the pre-monorepo layout; files were moved with `git mv`, so `git log --follow` works across the restructure.
