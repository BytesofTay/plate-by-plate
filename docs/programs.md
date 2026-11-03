# Program templates

Both templates are 4 days a week, run in order: Lower A, Upper A, Lower B, Upper B. Weights are in pounds; "each" means per dumbbell. Start weights were picked for the main user (a lighter lifter, about 88 lb, with some experience). Anyone else should set their own after a first easy session.

Progression is the same for both templates (see `mcp-server/src/logic.ts`):

- **Main lifts** (fixed reps): every set hits the target, the weight goes up next session. Barbell jumps are never smaller than two of the smallest plates.
- **Two misses in a row** at the same weight on a main lift: drop about 10%, rounded down to a loadable weight, never below the bar.
- **Accessories** (rep range): stay at a weight until every set reaches the top of the range, then add the increment.
- **Assisted pull-ups**: the stored number is assistance, so progress removes 5 lb.
- **Bodyweight moves**: logged only, no automatic progression.

## Glute Priority (current, id `glute-priority`)

Glutes are trained all four days, about 30 hard sets a week. This is the program in `mcp-server/src/program.ts` today.

### Lower A · Squat (Monday)

| Exercise | Sets × reps | Start | Glutes |
| --- | --- | --- | --- |
| **Back Squat** (main) | 3 × 5 | 65 lb | yes |
| Romanian Deadlift | 3 × 8–10 | 55 lb | yes |
| Bulgarian Split Squat | 3 × 8–10 each side | 10 lb each | yes |
| 45° Back Extension | 3 × 12–15 | 10 lb | yes |
| Hip Abduction Machine | 3 × 15–20 | 45 lb | yes |

### Upper A · Bench (Tuesday)

| Exercise | Sets × reps | Start | Glutes |
| --- | --- | --- | --- |
| **Bench Press** (main) | 3 × 5 | 45 lb |  |
| Chest-Supported DB Row | 3 × 8–10 | 15 lb each |  |
| Lat Pulldown | 3 × 8–10 | 40 lb |  |
| Seated DB Shoulder Press | 2 × 8–10 | 10 lb each |  |
| Cable Glute Kickback (glute finisher) | 2 × 12–15 each side | 10 lb | yes |

### Lower B · Hip Thrust (Thursday)

| Exercise | Sets × reps | Start | Glutes |
| --- | --- | --- | --- |
| **Barbell Hip Thrust** (main) | 3 × 8 | 85 lb | yes |
| **Deadlift** (main) | 3 × 5 | 85 lb | yes |
| DB Step-Up | 3 × 8–10 each side | 10 lb each | yes |
| Frog Pump (glute finisher) | 2 × 20–30 | bodyweight | yes |

### Upper B · Press (Friday)

| Exercise | Sets × reps | Start | Glutes |
| --- | --- | --- | --- |
| **Overhead Press** (main) | 3 × 5 | 45 lb |  |
| Assisted Pull-Up | 3 × 5–8 | 40 lb assist |  |
| Incline DB Press | 3 × 8–10 | 15 lb each |  |
| Seated Cable Row | 3 × 10–12 | 40 lb |  |
| Single-Leg Hip Thrust (glute finisher) | 2 × 10–15 each side | bodyweight | yes |
| Plank | 2 × 30–45 sec | bodyweight |  |

## Balanced Strength (the first version, id `balanced-strength`)

The original program before the glute focus. It isn't in code anymore; recreate it as a second template when programs become selectable (see `docs/friends-plan.md`, milestone 1). It's a good default for her boyfriend or other friends. Keep the same exercise ids where the movement is the same.

### Lower A · Squat (Monday)

| Exercise | Sets × reps | Start | Rest | Id |
| --- | --- | --- | --- | --- |
| **Back Squat** (main) | 3 × 5 | 65 lb | 3 min | `back-squat` |
| Romanian Deadlift | 3 × 8–10 | 55 lb | 2 min | `romanian-deadlift` |
| Bulgarian Split Squat | 3 × 8–10 each side | 10 lb each | 90 sec | `bulgarian-split-squat` |
| Lying Leg Curl | 3 × 10–12 | 30 lb | 75 sec | `leg-curl` |
| Plank | 3 × 30–45 sec | bodyweight | 60 sec | `plank` |

### Upper A · Bench (Tuesday)

| Exercise | Sets × reps | Start | Rest | Id |
| --- | --- | --- | --- | --- |
| **Bench Press** (main) | 3 × 5 | 45 lb | 3 min | `bench-press` |
| Chest-Supported DB Row | 3 × 8–10 | 15 lb each | 90 sec | `chest-supported-row` |
| Seated DB Shoulder Press | 3 × 8–10 | 10 lb each | 90 sec | `seated-db-press` |
| Lat Pulldown | 3 × 8–10 | 40 lb | 90 sec | `lat-pulldown` |
| DB Biceps Curl | 2 × 10–12 | 8 lb each | 60 sec | `db-curl` |
| Triceps Rope Pushdown | 2 × 10–12 | 20 lb | 60 sec | `triceps-pushdown` |

### Lower B · Deadlift (Thursday)

| Exercise | Sets × reps | Start | Rest | Id |
| --- | --- | --- | --- | --- |
| **Deadlift** (main) | 3 × 5 | 85 lb | 3 min | `deadlift` |
| Goblet Squat | 3 × 8–10 | 20 lb (one dumbbell) | 90 sec | `goblet-squat` |
| Barbell Hip Thrust | 3 × 8–10 (accessory here, not a main lift) | 65 lb | 90 sec | `hip-thrust` |
| Walking Lunge | 2 × 10–12 each side | 10 lb each | 75 sec | `walking-lunge` |
| Hanging Knee Raise | 3 × 8–12 | bodyweight | 60 sec | `hanging-knee-raise` |

### Upper B · Press (Friday)

| Exercise | Sets × reps | Start | Rest | Id |
| --- | --- | --- | --- | --- |
| **Overhead Press** (main) | 3 × 5 | 45 lb | 3 min | `overhead-press` |
| Assisted Pull-Up | 3 × 5–8 | 40 lb assist | 2 min | `assisted-pull-up` |
| Incline DB Press | 3 × 8–10 | 15 lb each | 90 sec | `incline-db-press` |
| Seated Cable Row | 3 × 10–12 | 40 lb | 75 sec | `seated-cable-row` |
| Face Pull | 2 × 12–15 | 15 lb | 60 sec | `face-pull` |
| DB Lateral Raise | 2 × 12–15 | 5 lb each | 60 sec | `lateral-raise` |

Increments: +5 lb on squat, deadlift, RDL, hip thrust, goblet squat and machines; +2.5 lb on bench, press and per-hand dumbbells.
