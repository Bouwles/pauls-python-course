// The step bar's names (REDESIGN-2.md 4.2): a short name for what kind of step it is. The
// step's own title is in the instructions panel and is each pill's accessible description.
import type { Character, Line, Step } from "@/lib/content/types";
import type { CoachKind, Utterance } from "./context";

const KIND: Record<Step["type"], string> = {
  ask: "Ask",
  predict: "Predict",
  investigate: "Investigate",
  worked: "Example",
  pips: "Fix their version",
  parsons: "Arrange",
  modify: "Modify",
  make: "Build",
  fix: "Fix",
  ship: "Ship",
  concept: "Picture it",
  reading: "Read",
  explain: "Explain",
  git: "Terminal",
  takehome: "Take it home",
  milestone: "Milestone",
};

/** Lines nobody says aloud: the old narrator and the duck. */
export function isSpoken(who: string): boolean {
  return who !== "narrator" && who !== "duck";
}

/** On a "fix my version" step, the classmate is whoever speaks first. */
export function classmateOf(step: Step | null): string | null {
  if (!step || step.type !== "pips") return null;
  return step.dialogue.find((l) => isSpoken(l.who))?.who ?? null;
}

/** "Predict", "Example", "Fix Caitlin's version", "Build". */
export function stepLabel(step: Step, characters: Record<string, Character>): string {
  if (step.type === "make" && step.stretch) return "Stretch";
  if (step.type === "pips") {
    const who = classmateOf(step);
    const name = who ? (characters[who]?.name ?? who) : null;
    return name ? `Fix ${name.split(" ")[0]}'s version` : KIND.pips;
  }
  return KIND[step.type];
}

/** Steps whose right-hand side is the code editor (and so get the Code and Output tabs on a phone). */
export function usesEditor(step: Step | null): boolean {
  return Boolean(step && ["predict", "investigate", "pips", "fix", "modify", "make"].includes(step.type));
}

let said = 0;
export const nextId = () => Date.now() * 100 + (said++ % 100);

/** A step's dialogue as the coach says it: a line at a time, each with its own face and gesture. */
export function utterancesFor(lines: Line[], kind: CoachKind = "step"): Utterance[] {
  return lines.filter((l) => isSpoken(l.who)).map((l) => ({ id: nextId(), who: l.who, text: l.text, face: l.face, gesture: l.gesture, kind }));
}
