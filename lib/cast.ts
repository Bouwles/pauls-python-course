// The cast (REDESIGN-2.md 7): who speaks for what. Interface code asks here instead of
// naming a character, so the cast lives in content/characters/ and this one table.

export const PROFESSOR = "paul";
export const ASSISTANT = "neil";
export const CLASSMATES = ["aaesha", "caitlin", "riya", "yahya"] as const;
export const RIVAL = "yahya";
export const CAST_IDS = [PROFESSOR, ASSISTANT, ...CLASSMATES] as const;
export type CastId = (typeof CAST_IDS)[number];

/** Who says the line for each reaction event. "classmate" and "client" are filled in per step. */
const SPEAKER: Record<string, string> = {
  // Paul: introductions, worked examples, reviews, good names and readable code.
  "first-fstring": PROFESSOR,
  "converts-input": PROFESSOR,
  "first-function": PROFESSOR,
  "good-name": PROFESSOR,
  "letter-name": PROFESSOR,
  "long-function": PROFESSOR,
  "long-line": PROFESSOR,
  "check-passed": PROFESSOR,
  "pass-no-hints": PROFESSOR,
  "predict-right": PROFESSOR,
  "predict-wrong": PROFESSOR,
  returning: PROFESSOR,
  "solution-seen": PROFESSOR,
  "rounds-start": PROFESSOR,
  "rounds-done": PROFESSOR,
  // Neil: hints, errors and debugging.
  "check-failed": ASSISTANT,
  "third-fail": ASSISTANT,
  "third-hint": ASSISTANT,
  "pass-after-many": ASSISTANT,
  "run-error": ASSISTANT,
  "error-name": ASSISTANT,
  "error-text-number": ASSISTANT,
  "error-zero": ASSISTANT,
  "error-index": ASSISTANT,
  "error-int-text": ASSISTANT,
  "error-indent": ASSISTANT,
  "stopped-loop": ASSISTANT,
  "ran-nothing": ASSISTANT,
  "loop-never-runs": ASSISTANT,
  idle: ASSISTANT,
  "after-explain": ASSISTANT,
  // Yahya: speed, loops inside loops, the last check, the Drills.
  "nested-loop": RIVAL,
  "one-left": RIVAL,
  "drill-start": RIVAL,
  "drill-beaten": RIVAL,
  // Caitlin: twenty lines where a loop would do.
  "long-no-loop": "caitlin",
  // The classmate whose version the learner is fixing, and the project's client.
  "fixed-by-learner": "classmate",
  "shorter-than-mine": "classmate",
  waiting: "client",
  recap: "client",
};

/** Who says `event`. `classmate` is the step's classmate, `client` the project's client. */
export function speakerFor(event: string, ctx: { classmate?: string | null; client?: string | null } = {}): string {
  const who = SPEAKER[event] ?? PROFESSOR;
  if (who === "classmate") return ctx.classmate ?? PROFESSOR;
  if (who === "client") return ctx.client ?? PROFESSOR;
  return who;
}

/** A first try that passes: Yahya or Caitlin, whoever has something fresh to say. */
export const FIRST_TRY = [RIVAL, "caitlin"] as const;

/** The reaction events and which pools in content/characters/ must hold lines for them. */
export const REACTION_EVENTS = Object.keys(SPEAKER);

/** A character's signature colour, and the text colour that reads on it (REDESIGN-2.md 7.1). */
export interface CastColour {
  face: string;
  ink: string;
}

const DARK_INK = "#14171D";
const COLOURS: Record<string, CastColour> = {
  paul: { face: "#FFB627", ink: "#2A1E00" },
  neil: { face: "#1FB5A8", ink: DARK_INK },
  aaesha: { face: "#FF7A6B", ink: DARK_INK },
  caitlin: { face: "#8C6BF2", ink: DARK_INK },
  riya: { face: "#4CC36F", ink: DARK_INK },
  yahya: { face: "#3B6FD8", ink: "#FFFFFF" },
};
const OTHER: CastColour = { face: "#6E7584", ink: "#FFFFFF" };

export function castColour(id: string): CastColour {
  return COLOURS[id] ?? OTHER;
}

/** The narrator speaks without a name tag. */
export function hasNamePlate(id: string): boolean {
  return id !== "narrator" && id !== "duck";
}

/**
 * The Clocktower's floors, bottom to top (REDESIGN-2.md 5.1): each Act is a floor, with a room,
 * who lives there, and a Phosphor icon for the room in placeholder art.
 */
export interface Floor {
  act: number;
  label: string;
  room: string;
  residents: string[];
  icon: "chalkboard" | "notebook" | "wrench" | "puzzle" | "archive" | "chartLine" | "cpu" | "gamepad" | "clock";
  /** What's in the room, for the art and for alt text. */
  props: string;
}

export const FLOORS: Floor[] = [
  { act: 1, label: "Ground floor", room: "The Workshop", residents: [PROFESSOR], icon: "chalkboard", props: "Paul's classroom: a big desk, a chalkboard, the duck" },
  { act: 2, label: "Floor 1", room: "The Studio", residents: [ASSISTANT], icon: "notebook", props: "desks, shelves of notebooks, a kettle" },
  { act: 3, label: "Floor 2", room: "The Makerspace", residents: ["caitlin"], icon: "wrench", props: "a soldering bench, a small arcade cabinet, a server under the desk" },
  { act: 4, label: "Floor 3", room: "The Puzzle Room", residents: ["yahya"], icon: "puzzle", props: "a wall of sticky notes and string, a chess table" },
  { act: 5, label: "Floor 4", room: "The Archive", residents: ["aaesha"], icon: "archive", props: "filing cabinets, a huge wall chart, a weather station outside the window" },
  { act: 6, label: "Floor 5", room: "The Model Room", residents: ["riya"], icon: "chartLine", props: "whiteboards full of graphs, a coffee machine" },
  { act: 7, label: "Floor 6", room: "The Engine Room", residents: ["aaesha", ASSISTANT], icon: "cpu", props: "the clock's gears behind glass, a rack of glowing servers" },
  { act: 8, label: "Floor 7", room: "The Arcade", residents: ["yahya", "caitlin"], icon: "gamepad", props: "a row of cabinets, a leaderboard, a prize shelf" },
  { act: 9, label: "The roof", room: "The Roof Terrace", residents: [PROFESSOR, ASSISTANT, ...CLASSMATES], icon: "clock", props: "the clock face, the city skyline at night, string lights" },
];

export function floorFor(act: number): Floor | undefined {
  return FLOORS.find((f) => f.act === act);
}
