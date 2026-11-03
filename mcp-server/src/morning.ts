// A short morning routine: what to eat before lifting and a few simple, well-studied supplements.
// General guidance, not medical advice.

export interface MorningItem {
  id: string;
  name: string;
  optional: boolean;
  /** One-line instruction shown on the checklist. */
  how: string;
  /** Why it's there, and any caveats. */
  why: string;
  /** Extra line for days with a workout. */
  trainingDay?: string;
}

export const MORNING: MorningItem[] = [
  {
    id: "eat",
    name: "Breakfast with protein",
    optional: false,
    how: "Yes, eat before you lift. Aim for about 20–25 g of protein plus some carbs.",
    trainingDay: "Lifting today: have a meal 1–3 hours before, or a small snack like a banana or yogurt 30–60 minutes before.",
    why: "Lifting on an empty stomach makes it harder to finish your reps, and at a lighter body weight your body needs the fuel to build muscle, glutes included.",
  },
  {
    id: "water",
    name: "Big glass of water",
    optional: false,
    how: "12–16 oz when you wake up. Bring a bottle to the gym.",
    why: "Even mild dehydration makes training feel harder.",
  },
  {
    id: "tea",
    name: "Tea",
    optional: true,
    how: "Green or black. About 30–50 mg of caffeine a cup, a gentle lift.",
    why: "For a boost, drink it 30–60 minutes before lifting. Have it between meals rather than with breakfast, because tea reduces how much iron you absorb from food. Skip caffeine within 6–8 hours of bedtime.",
  },
  {
    id: "b-complex",
    name: "B-complex",
    optional: true,
    how: "Take it with breakfast, not on an empty stomach.",
    why: "B vitamins help turn food into energy, but extra won't boost workouts unless you're low. Bright yellow urine afterward is normal. It matters most if you eat little meat, fish, dairy or eggs (B12).",
  },
  {
    id: "creatine",
    name: "Creatine monohydrate",
    optional: true,
    how: "3 g a day in any drink, every day, training or not.",
    why: "The most researched supplement for strength and muscle, studied in women too. It takes 3–4 weeks to build up. The scale may go up a pound or two from water stored in muscle, which is expected.",
  },
];

export const BREAKFAST_IDEAS = [
  "Greek yogurt with granola and berries",
  "2–3 eggs on toast with fruit",
  "Oatmeal made with milk, topped with peanut butter and banana",
  "Smoothie: milk, banana, oats and a scoop of protein powder",
  "Short on time: toast with peanut butter and a banana",
];

export const MORNING_NOTE =
  "Food comes first; supplements only fill gaps. Check with a doctor or pharmacist before starting a supplement, especially if you take any medication. This is general guidance, not medical advice.";
