// The step bar's names: a plain name for what you do on each kind of step, never teaching jargon
// (the owner found "Predict" and "Investigate" confusing). The step's own title is in the
// instructions panel and is each pill's accessible description.
import type { Character, Line, Step } from "@/lib/content/types";
import { isYou } from "@/lib/playas";
import type { CoachKind, Utterance } from "./context";

const KIND: Record<Step["type"], string> = {
  ask: "The brief",
  learn: "Learn",
  predict: "Quick check",
  investigate: "Try it",
  worked: "Example",
  pips: "Fix their code",
  parsons: "Put in order",
  modify: "Change it",
  make: "Build it",
  fix: "Fix it",
  ship: "Ship it",
  concept: "See it",
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

/** "Learn", "Quick check", "Fix Caitlin's code" (or "Fix your old code" when you're Caitlin), "Build it". */
export function stepLabel(step: Step, characters: Record<string, Character>, playAs?: string | null): string {
  if (step.type === "make" && step.stretch) return "Stretch";
  if (step.type === "pips") {
    const who = classmateOf(step);
    if (who && isYou(who, playAs)) return "Fix your old code";
    const name = who ? (characters[who]?.name ?? who) : null;
    return name ? `Fix ${name.split(" ")[0]}'s code` : KIND.pips;
  }
  return KIND[step.type];
}

/**
 * What to do on a step, in two or three short plain actions, shown under its title on every step
 * of that kind, so nobody has to work out what a step wants from its name. Short enough to sit on
 * a line or two above the explanation. `compact` is the phone layout, where the code is in its own
 * tab rather than on the right.
 */
export function howTo(step: Step, characters: Record<string, Character>, { compact = false, playAs }: { compact?: boolean; playAs?: string | null } = {}): string[] {
  const there = compact ? "in the Code tab" : "on the right";
  switch (step.type) {
    case "learn":
      return step.code ? ["Read this.", `Run the example ${there}, and change it if you like.`, "Press Got it."] : ["Read this.", "Press Got it."];
    case "predict":
      return [`Read the code ${there}.`, "Pick what it prints and lock it in.", "Run it to see."];
    case "investigate":
      return ["Do the tasks in order.", "Run or change the code as each one asks.", "Type what you see and check it."];
    case "worked":
      // Some examples aren't Python (a traceback, say): nothing to run, only to read.
      return step.language === "python" ? ["Read it label by label.", "Press Run to see it work.", "Answer the question underneath."] : ["Read it from the top, label by label.", "Answer the question underneath."];
    case "pips": {
      const who = classmateOf(step);
      if (who && isYou(who, playAs)) return ["Run your old code.", "Find the mistake and fix it.", "Press Check."];
      const name = who ? (characters[who]?.name ?? who).split(" ")[0] : null;
      return [name ? `Run ${name}'s code.` : "Run their code.", "Find the mistake and fix it.", "Press Check."];
    }
    case "fix":
      return ["Run it and see what goes wrong.", "Fix the mistake.", "Press Check."];
    case "modify":
      return ["Run it to see what it does now.", "Make the change below.", "Press Check."];
    case "make":
      return ["Write the program.", "Run it as you go.", "Press Check when it's done, or Hint if you're stuck."];
    case "parsons":
      return ["Put the lines in order.", "Indent the ones that go inside another.", "Press Check."];
    default:
      return [];
  }
}

/** Steps whose right-hand side is the code editor (and so get the Code and Output tabs on a phone). */
export function usesEditor(step: Step | null): boolean {
  return Boolean(step && (["predict", "investigate", "pips", "fix", "modify", "make"].includes(step.type) || (step.type === "learn" && step.code)));
}

let said = 0;
export const nextId = () => Date.now() * 100 + (said++ % 100);

/** A step's dialogue as the coach says it: a line at a time, each with its own face and gesture. */
export function utterancesFor(lines: Line[], kind: CoachKind = "step"): Utterance[] {
  return lines.filter((l) => isSpoken(l.who)).map((l) => ({ id: nextId(), who: l.who, text: l.text, face: l.face, gesture: l.gesture, kind }));
}
