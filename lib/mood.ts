// How a character looks while saying a line (REDESIGN3_PLAN.md). Content can say it outright
// (`- riya.pleased.wave: "..."`); when it doesn't, the words are a good guide, so nobody says
// "That's the one." with the same face as "Something's off."
import type { Expression, Pose } from "./pixel/people";

const has = (text: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(text));

export function moodOf(text: string, given?: { face?: string; gesture?: string }): { face: Expression; gesture: Pose } {
  const face = (given?.face as Expression | undefined) ?? guessFace(text);
  const gesture = (given?.gesture as Pose | undefined) ?? "idle";
  return { face, gesture };
}

function guessFace(text: string): Expression {
  const t = text.trim();
  if (/\bha(ha)+\b|\bhah\b/i.test(t)) return "laughing";
  if (has(t, "oops", "uh-oh", "broke", "broken", "wrong", "stuck", "worried", "sorry", "can't", "won't work", "off")) return "worried";
  if (t.endsWith("!") || has(t, "wait", "what", "really", "whoa", "suddenly")) return "surprised";
  if (has(t, "hmm", "maybe", "perhaps", "wonder", "think", "which", "why", "how")) return "thinking";
  if (t.endsWith("?")) return "confused";
  if (has(t, "fine", "sure", "obviously", "slow", "again")) return "unimpressed";
  if (has(t, "good", "great", "nice", "perfect", "lovely", "works", "done", "shipped", "right", "yes", "thanks", "brilliant", "neat", "clean")) return "pleased";
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
