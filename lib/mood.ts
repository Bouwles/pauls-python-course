// How a character looks while saying a line. Content can say it outright
// (`- riya.pleased.paint-palette: "..."`); when it doesn't, the words are a good guide, so nobody
// says "That's the one." with the same face as "Something's off." The gesture comes from
// lib/pixel/variety.ts: a fitting one for the line and the person, different from line to line.
import type { Expression, Pose } from "./pixel/people";
import { gestureForLine } from "./pixel/variety";

const has = (text: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(text));

export interface MoodOptions {
  /** Who's saying it: their own moves join the choice. */
  who?: string;
  /** What makes this moment different from others with the same words (the step, the line's place). */
  seed?: string;
  /** The gesture just before, so the same one never comes twice in a row. */
  avoid?: (string | undefined)[];
  /** A small portrait: leave out gestures that reach outside the head. */
  small?: boolean;
  /** "talk" for a line (the default), "moment" for a celebration or a scene. */
  mode?: "talk" | "moment";
}

export function moodOf(text: string, given?: { face?: string; gesture?: string }, opts: MoodOptions = {}): { face: Expression; gesture: Pose } {
  const face = (given?.face as Expression | undefined) ?? guessFace(text);
  const gesture = gestureForLine({ who: opts.who, text, face, given: given?.gesture, seed: opts.seed ? `${opts.seed}|${text}` : text, avoid: opts.avoid, small: opts.small, mode: opts.mode });
  return { face, gesture };
}

function guessFace(text: string): Expression {
  const t = text.trim();
  if (/\bha(ha)+\b|\bhah\b/i.test(t)) return "laughing";
  if (has(t, "sorry", "my fault", "embarrassing")) return "embarrassed";
  if (has(t, "uh-oh", "nervous", "hope this", "fingers crossed")) return "nervous";
  if (has(t, "oops", "broke", "broken", "wrong", "stuck", "worried", "can't", "won't work", "off")) return "worried";
  if (has(t, "finally", "phew", "at last")) return "relieved";
  if (has(t, "ugh", "seriously")) return "annoyed";
  if (has(t, "tired", "late", "yawn", "sleep")) return "sleepy";
  if (has(t, "watch this", "sneaky", "secret")) return "mischievous";
  if (has(t, "of course", "obviously", "told you", "mine runs")) return "smug";
  if (has(t, "let's do this", "right then", "this time", "properly")) return "determined";
  if (has(t, "focus", "carefully", "look closely", "line by line")) return "focused";
  if (has(t, "can't wait", "amazing", "brilliant", "love it", "so good")) return "excited";
  if (t.endsWith("!") || has(t, "wait", "whoa", "suddenly")) return "surprised";
  if (has(t, "what if", "i wonder", "curious", "interesting")) return "curious";
  if (has(t, "hmm", "maybe", "perhaps", "wonder", "think", "which", "why", "how")) return "thinking";
  if (t.endsWith("?")) return "confused";
  if (has(t, "fine", "sure", "slow")) return "unimpressed";
  if (has(t, "good", "great", "nice", "nicely", "perfect", "lovely", "works", "done", "shipped", "right", "yes", "thanks", "neat", "clean", "close", "nearly")) return "pleased";
  if (has(t, "mine", "best", "fastest", "beat", "record")) return "proud";
  return "neutral";
}

/** A sound's shape for the mouth: wide on a and o, a little on the other vowels, shut otherwise. */
export function mouthFor(ch: string | undefined): 0 | 1 | 2 {
  if (!ch) return 0;
  if (/[aoAO]/.test(ch)) return 2;
  if (/[eiuyEIUY0-9]/.test(ch)) return 1;
  if (/[mbp]/i.test(ch)) return 0;
  return /[a-z]/i.test(ch) ? 1 : 0;
}

/** How long to hold after a character, in ms: a beat at commas, longer at the end of a sentence. */
export function pauseAfter(ch: string | undefined): number {
  if (!ch) return 0;
  if (/[.!?]/.test(ch)) return 260;
  if (/[,;:]/.test(ch)) return 140;
  return 0;
}
