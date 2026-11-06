// Every gesture a pixel person can make, by id. A gesture says which arms still hang at the sides,
// how many beats its loop has and how long each lasts, and draws the rest: lifted arms, hands,
// anything held (lib/pixel/props.ts). Gesture files (basic.ts, everyday.ts, signature.ts) add
// theirs with `defineGestures`; content names them in dialogue keys (`neil.thinking.glasses-push`).
import type { Grid } from "../kit";
import type { Expression, PersonLook } from "../people";

/** What a gesture is for, so the right one can be picked for a line or a moment (lib/pixel/variety.ts). */
export type GestureTag =
  | "greet" // hello, welcome, come in
  | "bye" // see you, off you go
  | "explain" // talking something through
  | "think" // working it out
  | "listen" // hearing you out
  | "celebrate" // it worked, shipped
  | "approve" // nice, good, right
  | "encourage" // you can do it, try again
  | "surprise" // whoa, wait
  | "worry" // uh-oh, broken
  | "confuse" // what, huh
  | "tease" // banter, a dig
  | "idle" // just there, between lines
  | "work" // at work in their room
  | "wait" // waiting for you
  | "sad"; // a miss, a loss

export interface GestureDef {
  id: string;
  /** What they're doing, for a screen reader or a list ("waves", "sips a coffee"). */
  label: string;
  /** Which arms still hang at the sides; a lifted arm leaves its side clear. */
  arms: { left: boolean; right: boolean };
  /** Beats in one loop, and how long each lasts. */
  beats: number;
  ms: number;
  /** What it's for. */
  tags: GestureTag[];
  /** Faces it goes with; the first is the one it brings when nothing else is said. */
  faces?: Expression[];
  /** Only these cast members make it (a signature move); everyone when left out. */
  who?: string[];
  /** Drawn behind the body and hair (a guitar's neck, an easel). */
  behind?: (g: Grid, p: PersonLook, beat: number) => void;
  /** Drawn over everything: arms, hands, what they hold. People always stand still and level:
   *  only arms, hands and props move (the owner asked for no bouncing). */
  draw: (g: Grid, p: PersonLook, beat: number) => void;
}

const REGISTRY = new Map<string, GestureDef>();

/** Add gestures. A file loaded again (hot reload in development) replaces its own; two files using
 *  the same id is caught by tests/unit/gestures.test.ts. */
export function defineGestures(list: GestureDef[]) {
  for (const g of list) REGISTRY.set(g.id, g);
}

/** A gesture by id; an unknown id is standing still. */
export function gestureOf(id: string | undefined): GestureDef {
  return REGISTRY.get(id ?? "idle") ?? REGISTRY.get("idle")!;
}

export const hasGesture = (id: string) => REGISTRY.has(id);

export function allGestures(): GestureDef[] {
  return [...REGISTRY.values()];
}

/** The gestures this cast member (or a learner, with no id) can make. */
export function gesturesFor(who?: string): GestureDef[] {
  return allGestures().filter((g) => !g.who || (who !== undefined && g.who.includes(who)));
}
