# Plate by Plate

A strength-training app built for one main user: a lighter lifter (about 88 lb) with some training experience who trains at a full gym. She runs a glute-priority 4-day upper/lower program. Tayllor owns the project. **The next milestone** is letting the main user, her boyfriend and other friends follow each other's workouts on Next.js + Supabase. The full plan is in `docs/friends-plan.md`. Confirm its open questions with Tayllor before building milestone 3.

## Repo layout

- `mcp-server/` is a TypeScript MCP server (stdio, `@modelcontextprotocol/sdk` + zod). **It's the source of truth for the program:**
  - `src/program.ts`: days, exercises and rules
  - `src/morning.ts`: morning routine and breakfast ideas
  - `src/logic.ts`: progression, plate math, warm-ups and e1RM
  - `src/store.ts`: JSON file storage at `~/.plate-by-plate/data.json`, overridable with `PLATE_BY_PLATE_DATA`
  - `src/index.ts`: 10 tools and 1 prompt
- `web-prototype/` holds the single-file web app.
  - `app.html` is the claude.ai artifact source.
  - `index.html` is a standalone copy generated from it. It runs in any browser and saves to localStorage.
  - Never edit `index.html` by hand.
- `scripts/sync-prototype.mjs` copies the program and morning data from the built server into `app.html` (between the `<generated:program>` markers), then regenerates `index.html`.
- `docs/programs.md` describes both templates: Glute Priority (current) and Balanced Strength (the first version, not in code yet).
- `docs/friends-plan.md` is the build plan: monorepo and shared core, the Supabase app, crews and feed, and RLS.

## Commands

```bash
cd mcp-server && npm install && npm run build && npm test   # build + end-to-end MCP test
node scripts/sync-prototype.mjs                             # after changing program.ts or morning.ts (build first)
open web-prototype/index.html                               # run the prototype locally
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

## Keeping things in sync (until milestone 1 lands)

- The prototype's program data is generated, so run the sync script after editing `program.ts` or `morning.ts`.
- The prototype's `progress()`, `plates()`, `warmups()`, `loadable()` and `e1rm()` functions are **hand-ported** from `logic.ts`. A logic change must be made in both places. Milestone 1 removes this duplication by moving the logic into `packages/core`.

## Where things live

- The live claude.ai version of the prototype is https://claude.ai/artifact/4f1NyxRXddCVx4FfUfp7dY. It's private to Tayllor and uses claude.ai's per-user `db` storage under `data/users/<id>/profile`.
- This isn't a git repo yet. Run `git init` before the milestone 1 restructure.
