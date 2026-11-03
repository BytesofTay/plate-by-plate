# Plan: Plate by Plate on Next.js + Supabase, with friends

**Goal.** Tayllor, her boyfriend and other friends each log their own workouts in Plate by Plate and can follow each other: recent sessions, PRs, weekly consistency, and a one-tap cheer.

**Decided.** Next.js (App Router, TypeScript) deployed on Vercel. Supabase for sign-in (Auth), the database (Postgres) and access rules (row-level security, RLS).

**Starting point.** Everything in this repo works today:

- `mcp-server/src/` holds the program, morning routine and progression logic. These are the source of truth.
- `web-prototype/app.html` is the finished UI and interaction design to port. Its design tokens are at the top of the file.
- `docs/programs.md` describes both program templates.

## Open questions to confirm with Tayllor before milestone 3

1. Can friends see exact weights by default, or only "finished Lower B" plus PRs? Proposed: weights are shared by default, with a per-person "hide my weights" toggle.
2. Can one person be in several crews (say, a couple crew plus a gym-friends crew)? Proposed: yes, with a crew switcher on the feed.
3. Does her boyfriend run Glute Priority or Balanced Strength? Proposed: everyone picks a program in Setup.
4. Should there be notifications, like "Tayllor finished Lower B"? Proposed: not in v1. Consider an email digest or web push later.

The morning routine (supplement checklist) stays private. It never appears in the feed.

## Milestone 1: monorepo and shared core

- Convert to npm workspaces with `packages/core`, `apps/web` and `apps/mcp-server`. Use `git mv` so history survives once this is a git repo.
- Move `program.ts`, `morning.ts` and `logic.ts` into `packages/core`. The MCP server and the web app both import them, so no more hand-ported copies.
- Add a `PROGRAMS` registry keyed by template id: `glute-priority` (current) and `balanced-strength` (recreate it from `docs/programs.md`). Exercise ids stay stable and are shared across templates when the movement is the same.
- Add unit tests for core with vitest: progression up, repeat, deload after two misses (rounded down, never below the bar), assisted progression, plate math with 1.25 and 2.5 lb plates and 33/35/45 lb bars, warm-ups, and e1RM.
- **Done when** `npm test` passes at the root, and the MCP server smoke test still passes when it imports from core.

## Milestone 2: solo app on Supabase (parity with the prototype)

- Scaffold `apps/web` with create-next-app (TypeScript, App Router). Use `@supabase/ssr` for server and client Supabase clients.
- Auth: email magic link. Sign in with Apple can come later.
- Pages `/today`, `/program`, `/progress` and `/setup` match the prototype: morning checklist, day picker, exercise cards with plate loadout and warm-ups, tap-to-log set circles, rest timer, summary after finishing, hip-thrust-first progress tiles, chart, consistency pips, history with undo, and gym settings.
- Keep the in-progress workout draft in localStorage, like the prototype does. Only finished sessions go to the database.
- **Finish workout** is a server action. It computes progression with `packages/core` on the server and never trusts weights the client computed. Then it calls one SQL function, `save_workout(...)`, so the session, its exercises, the new working weights and `next_day` are written in a single transaction.
- **Undo** restores from the session's `before` snapshot, also in one SQL function.
- **Done when** a new user can sign in, pick a program, log a full rotation and see the same progression results the prototype gives. Port the prototype's flows into Playwright tests.

## Milestone 3: friends ("crews")

- A crew is a small group of 2 to 20 people.
  - **Create a crew:** gets a name and a random invite code.
  - **Invite:** share the code or a `/crew/join/[code]` link.
  - **Leave:** anyone can leave. The owner can remove members.
- **Feed** (`/crew`): crew members' recent sessions, newest first. Each item shows the person, the day, the main-lift sets (weight hidden if they turned sharing off), PR badges, a cheer count and a cheer button. Show each member's consistency pips for the last 8 weeks.
- **Profile** (`/u/[id]`): a friend's recent sessions and main-lift charts. Charts only appear if that friend shares weights.
- **PRs:** when saving a session, mark a main-lift entry as a PR if its best e1RM beats every earlier entry for that exercise. Store the flag, so the feed doesn't recompute history.
- **Done when** two test users in one crew see each other's sessions and cheers, and a third user outside the crew sees nothing. Prove this with RLS tests, not just the UI.

## Milestone 4 (optional): MCP server on the same data

Right now the MCP server keeps its own JSON log. Two options for later:

- **Remote MCP endpoint.** Serve it from the Next.js app at `/api/mcp` using the Streamable HTTP transport, authenticated per user. Claude would then read and write the same log as the web app.
- **Personal token.** Keep the local stdio server, but let it call the web app's API with a personal access token generated in `/setup`.

## Data model (draft: implement as Supabase migrations and test the RLS)

```sql
-- Needs pgcrypto for gen_random_bytes (enabled by default on Supabase, in the extensions schema).

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  program_id text not null default 'glute-priority',
  bar_weight numeric not null default 45 check (bar_weight in (33, 35, 45)),
  smallest_plate numeric not null default 1.25 check (smallest_plate in (1.25, 2.5)),
  next_day smallint not null default 0 check (next_day between 0 and 3),
  share_weights boolean not null default true,
  morning_items text[] not null default array['eat','water','tea','b-complex','creatine'],
  created_at timestamptz not null default now()
);

create table public.working_weights (
  user_id uuid not null references public.profiles on delete cascade,
  exercise_id text not null,
  weight numeric not null check (weight >= 0),
  fail_streak smallint not null default 0,
  primary key (user_id, exercise_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  program_id text not null,
  day_id text not null,
  performed_at timestamptz not null default now(),
  notes text,
  before jsonb not null -- working weights, fail streaks and next_day before this session, for undo
);
create index sessions_user_time on public.sessions (user_id, performed_at desc);

create table public.session_exercises (
  session_id uuid not null references public.sessions on delete cascade,
  exercise_id text not null,
  position smallint not null,
  weight numeric not null,
  reps smallint[] not null,
  result text not null check (result in ('progress', 'repeat', 'deload', 'logged')),
  is_pr boolean not null default false,
  primary key (session_id, exercise_id)
);

create table public.morning_checks (
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  item_id text not null,
  primary key (user_id, day, item_id)
);

create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique default encode(extensions.gen_random_bytes(5), 'hex'),
  owner_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now()
);

create table public.crew_members (
  crew_id uuid not null references public.crews on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);

create table public.cheers (
  session_id uuid not null references public.sessions on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
```

### Access rules (RLS) to implement

Turn RLS on for every table. To avoid recursive policies on `crew_members`, use `security definer` helper functions with `set search_path = public`:

- `is_crew_member(crew uuid)`: is the current user in that crew?
- `shares_crew(other uuid)`: do the current user and `other` share any crew?

Table rules:

- **profiles:** read your own or a crewmate's (`id = auth.uid() or shares_crew(id)`). Insert and update only your own.
- **working_weights:** your own only. Friends see weights through sessions, never here.
- **sessions:** read your own or a crewmate's. Write only your own.
- **session_exercises:** read and write your own only. Friends read through the feed function below, which hides weights for people with `share_weights = false`. RLS can't hide single columns, so the function does it.
- **morning_checks:** your own only.
- **crews:** read if you're a member. Update or delete only if you're the owner. Create through `create_crew(name)`, which inserts the crew and the owner's membership together.
- **crew_members:** read if you're in the same crew. Delete yourself (leave), or anyone if you're the owner. No direct insert; joining goes through `join_crew(code)`, which checks the code and the 20-member limit.
- **cheers:** insert or delete your own, and only on a session you can read. Read cheers on sessions you can read.

Feed function: `crew_feed(crew uuid, before timestamptz default now(), lim int default 30)`. It's `security definer`, checks `is_crew_member(crew)` first, and returns one row per session:

- person and day
- main-lift summary, with weights nulled when that person doesn't share them
- PR flags
- cheer count, and whether the current user cheered

### RLS tests (required)

Use the local Supabase stack with pgTAP (`supabase test db`) or an equivalent script that signs in as three users:

- A and B share a crew, so each sees the other's sessions, profile and cheers.
- C is outside the crew and sees none of them.
- B sets `share_weights = false`, so A's feed shows B's sessions without weights.
- Nobody can read anyone else's `working_weights` or `morning_checks`.
- `join_crew` refuses a bad code and a full crew.

## Moving data over from the prototype

There isn't much data yet, so this is low priority. The prototype stores `{ profile, sessions }`:

- in claude.ai's per-user storage at `data/users/<id>/profile` and `.../profile/sessions/<id>`
- or in localStorage under `pbp-local-v1`

The session shape is `{ id, ts, date, dayId, exercises: [{ exerciseId, weight, reps, result, message }], before }`. If needed, add a one-time JSON import on `/setup`.

## Configuration

- `apps/web/.env.local` holds the Supabase project URL and the public (anon or publishable) key. The secret service key is never used in the browser and isn't needed for this plan; RLS plus `security definer` functions cover everything.
- Deploy `apps/web` to Vercel with the same two environment variables.
