// Choosing what someone does, so the cast don't do the same few things all day. Given what a
// moment is for (a greeting, a celebration, a line of explanation...), who it is and a seed, it
// picks one of the gestures that fit, from everyday ones and that person's own. The pick is the
// same for the same seed, so the server and the browser agree, and different seeds (each line,
// each card, each visit) give different gestures. Pass the last pick as `avoid` to never repeat
// it twice in a row.
import { gesturesFor, gestureOf, hasGesture, type GestureDef, type GestureTag } from "./gestures";
import type { Expression } from "./people";

/** A small, stable hash (FNV-1a), for picks that don't change between renders. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** What the first six gestures stand for, when content names one: a wave is "a greeting". */
const FAMILY: Record<string, GestureTag[]> = {
  idle: ["idle", "listen"],
  wave: ["greet"],
  cheer: ["celebrate"],
  think: ["think"],
  point: ["explain"],
  thumbs: ["approve", "encourage"],
};

/** The first six: a content line naming one of these gets a fitting variety, not always the same move. */
export const isFamily = (id: string) => id in FAMILY;

/**
 * Two kinds of moment. "talk": someone saying a line, where hand gestures fit and holding a
 * telemetry tablet mid-sentence doesn't. "moment": a celebration, a room at work, waiting, where
 * anything that fits goes, their own moves most of all (Neil's rocket when the project ships).
 */
export type PickMode = "talk" | "moment";

/** Their own moves that suit a conversation: hands, glasses, a cap, nothing to set up. */
const TALK_OWN = new Set(["cap-push", "finger-count", "pointer-stick", "specs-push", "duck-hold", "pixel-heart", "splat-thumbs", "double-peace", "bangle-turn", "controller-victory", "selfie-peace", "phone-time", "test-pass"]);
/** Never chosen by chance: kept for the moments that call for them by name. */
const NAMED_ONLY = new Set(["paper-crown", "nod-off", "thumbs-down", "slow-clap", "umbrella", "eat-sandwich", "eat-apple", "eat-noodles"]);
/** Not while talking: they need the mouth, or the hands for something else. */
const NOT_TALKING = new Set(["sip-mug", "sip-coffee", "drink-water", "stretch-yawn", "rub-eyes", "listen-headphones", "check-phone", "phone-call", "read-book", "write-notes", "type-laptop", "shush", "cover-laugh", "hands-behind-head", "dance"]);

function suits(g: GestureDef, mode: PickMode): boolean {
  if (NAMED_ONLY.has(g.id)) return false;
  if (mode === "moment") return true;
  if (NOT_TALKING.has(g.id) || g.tags.includes("work")) return false;
  return !g.who || TALK_OWN.has(g.id);
}

export interface PickOptions {
  /** A cast id; a learner (no id) only gets everyday gestures. */
  who?: string;
  /** What the moment is for: any gesture with one of these tags fits. */
  tags: GestureTag[];
  /** The face they're making: gestures that go with it are likelier. */
  face?: Expression;
  /** Anything stable that differs from moment to moment: the line, the card, the step. */
  seed: string;
  /** Gestures not to pick (the last one, so nothing repeats twice in a row). */
  avoid?: (string | undefined)[];
  /** Gestures that hold something or need room, left out where space is tight (a small portrait). */
  small?: boolean;
  /** "talk" (the default) or "moment". */
  mode?: PickMode;
}

/**
 * A gesture for a moment. Their own moves count three times as likely as everyday ones (they're
 * what makes them them), and gestures that go with the face twice as likely.
 */
export function pickGesture({ who, tags, face, seed, avoid = [], small = false, mode = "talk" }: PickOptions): string {
  const all = gesturesFor(who).filter((g) => g.tags.some((t) => tags.includes(t)) && suits(g, mode) && (!small || fitsSmall(g)));
  const fresh = all.filter((g) => !avoid.includes(g.id));
  const pool = fresh.length ? fresh : all;
  if (!pool.length) return "idle";
  const weight = (g: GestureDef) => (g.id === "idle" ? 0 : (g.who ? (mode === "moment" ? 3 : 1.5) : 1) * (face && g.faces?.includes(face) ? 2 : 1));
  // A plain line is often said standing still: nobody gestures at every word.
  const still = mode === "talk" && (tags.includes("explain") || tags.includes("idle") || tags.includes("listen")) ? pool.reduce((n, g) => n + weight(g), 0) * 0.6 : 0;
  if (still && !avoid.includes("idle") && (hash(`still|${who ?? "you"}|${seed}`) % 100) < 38) return "idle";
  const total = pool.reduce((n, g) => n + weight(g), 0);
  if (!total) return "idle";
  let r = (hash(`${who ?? "you"}|${seed}`) % 10_000) / 10_000 * total;
  for (const g of pool) {
    r -= weight(g);
    if (r < 0) return g.id;
  }
  return pool[pool.length - 1]!.id;
}

/** Gestures whose props reach outside the head crop (a rocket, an easel) don't suit a small portrait. */
function fitsSmall(g: GestureDef): boolean {
  return !g.behind && !["rocket-launch", "paint-palette", "chalk-write", "chequered-flag", "paper-plane", "drone-fly", "umbrella"].includes(g.id);
}

/**
 * The gesture for a line: one content named exactly is kept; one of the first six ("wave",
 * "point"...) or none becomes a fitting variety, chosen from what the line is for.
 */
export function gestureForLine({ who, text, face, given, seed, avoid, small, mode = "talk" }: { who?: string; text: string; face?: Expression; given?: string; seed?: string; avoid?: (string | undefined)[]; small?: boolean; mode?: PickMode }): string {
  if (given && !isFamily(given) && hasGesture(given)) return given;
  if (given === "idle") return "idle";
  const tags = given ? FAMILY[given]! : tagsForText(text);
  return pickGesture({ who, tags, face, seed: seed ?? text, avoid, small, mode });
}

const has = (text: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(text));

/** What a line is for, from its words. */
export function tagsForText(text: string): GestureTag[] {
  const t = text.trim();
  if (has(t, "hello", "hi", "hey", "welcome", "morning", "afternoon", "evening", "come in", "there you are")) return ["greet"];
  if (has(t, "bye", "see you", "later", "off you go", "goodnight")) return ["bye"];
  if (has(t, "shipped", "done it", "brilliant", "nailed", "perfect", "first try", "every one", "all of them", "it works", "it ran")) return ["celebrate", "approve"];
  if (has(t, "nice", "good", "great", "right", "yes", "lovely", "neat", "clean", "spot on", "exactly")) return ["approve"];
  if (has(t, "try", "nearly", "close", "almost", "again", "keep going", "you can", "one more")) return ["encourage"];
  if (has(t, "oops", "uh-oh", "broke", "broken", "wrong", "stuck", "error", "crash", "can't")) return ["worry"];
  if (has(t, "wait", "whoa", "really", "suddenly")) return ["surprise"];
  if (has(t, "hmm", "maybe", "perhaps", "wonder", "think", "which", "why", "how", "what if")) return ["think"];
  if (t.endsWith("?")) return ["confuse", "think"];
  if (has(t, "mine", "beat", "faster", "slow", "obviously", "sure")) return ["tease"];
  return ["explain", "idle"];
}

/** A label for what someone's doing, for a screen reader: "Neil, launching a model rocket". */
export const gestureLabel = (id: string) => gestureOf(id).label;
