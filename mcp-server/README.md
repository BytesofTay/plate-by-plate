# Plate by Plate MCP server

An MCP server that runs a glute-priority 4-day upper/lower strength program built for a lighter lifter (about 88 lb) with some training experience and access to a full gym. It also has a quick morning routine: what to eat before lifting, tea, and simple supplements. Connect it to Claude Desktop (or any MCP client) and Claude can tell you today's workout, the plates to load, your warm-up sets, log what you did, and adjust next session's weights automatically.

## The program

Glutes are trained all 4 days (about 30 hard sets a week): heavy on both lower days, plus a short finisher at the end of each upper day.

| Day | Focus | Main lift | Accessories |
| --- | --- | --- | --- |
| Lower A (Mon) | Squat | Back Squat 3x5 | Romanian Deadlift, Bulgarian Split Squat, 45° Back Extension, Hip Abduction |
| Upper A (Tue) | Bench | Bench Press 3x5 | Chest-Supported Row, Lat Pulldown, Seated DB Press, Cable Glute Kickback (finisher) |
| Lower B (Thu) | Hip Thrust | Barbell Hip Thrust 3x8, Deadlift 3x5 | DB Step-Up, Frog Pump (finisher) |
| Upper B (Fri) | Press | Overhead Press 3x5 | Assisted Pull-Up, Incline DB Press, Cable Row, Single-Leg Hip Thrust (finisher), Plank |

Progression:

- **Main lifts**: hit every rep and the weight goes up next time (+5 lb hip thrust, squat and deadlift, +2.5 lb bench and press). Miss two sessions in a row at the same weight and it deloads about 10%.
- **Accessories**: double progression. Stay at a weight until you hit the top of the rep range on every set, then add the next jump.
- **Assisted pull-ups**: remove 5 lb of assistance each time you get 8 reps on every set.

Starting weights are conservative suggestions. Change any of them with `set_working_weight` after the first session.

## Tools

| Tool | What it does |
| --- | --- |
| `get_program` | Full program, rules, weekly glute volume and fueling note |
| `get_morning_routine` | Morning checklist: breakfast before lifting, water, tea, B-complex, creatine, with breakfast ideas |
| `get_next_workout` | Next workout in the rotation with weights, plates per side, warm-ups, rest and cues |
| `log_workout` | Save reps per set; returns what changes next time |
| `undo_last_workout` | Remove the last log and restore the weights from before it |
| `get_history` | Recent workouts, optionally for one exercise |
| `get_progress` | Start vs current weight, best estimated 1RM, consistency |
| `set_working_weight` | Manually set the next weight for an exercise |
| `update_settings` | Bar weight (45, 35 or 33 lb) and smallest plate (1.25 or 2.5 lb) |
| `plate_calculator` | Plates per side for any barbell weight |

There is also a prompt, `coach_todays_workout`, that starts with a quick morning check-in, walks you through the session set by set and logs it at the end.

## Install

Requires Node.js 18 or newer.

```bash
npm install
npm run build
npm test   # optional end-to-end check
```

## Connect to Claude Desktop

Open Claude Desktop settings, go to Developer, choose Edit Config, and add the server to `claude_desktop_config.json` (use the full path to this folder):

```json
{
  "mcpServers": {
    "plate-by-plate": {
      "command": "node",
      "args": ["/full/path/to/plate-by-plate/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, then try:

- "What should I have this morning before I lift?"
- "What's my workout today?"
- "Coach me through today's workout."
- "Log it: squat 5,5,5. RDL 10,10,9. Split squats 10,10,10. Back extensions 15,15,12. Abduction 20,20,18."
- "How are my hip thrusts going?"
- "How is my bench progressing?"
- "My gym has a 35 lb bar and 2.5 lb plates."

## Data

Workouts are saved to `~/.plate-by-plate/data.json`. Set the `PLATE_BY_PLATE_DATA` environment variable to store them somewhere else:

```json
"env": { "PLATE_BY_PLATE_DATA": "/Users/you/Documents/lifting.json" }
```

## A note on fueling

Muscle, glutes included, is built on food and sleep. At a lighter body weight, eating enough matters as much as the training: include protein at most meals and don't lift on an empty stomach. Check with a doctor before starting if there are any injuries or health concerns, and with a doctor or pharmacist before starting any supplement.
