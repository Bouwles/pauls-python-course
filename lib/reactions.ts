// Characters react to real events with lines from small pools (REDESIGN-2.md 7.4); lib/cast.ts
// says who speaks for each event, and LOOKS below how they look saying it.
// The last 30 lines shown to this learner are remembered and not repeated. Lines may
// name something from the learner's code: "{name}" is filled in from `vars`.
import type { Character } from "./content/types";
import type { LocalStore } from "./store/local";
import type { CheckReport, RunResult } from "./python/protocol";
import type { Expression } from "./pixel/people";
import type { GestureTag } from "./pixel/gestures";
import { FIRST_TRY, speakerFor } from "./cast";

/** What kind of gesture fits each sort of reaction: a pass approves or celebrates, a miss encourages or thinks, an error worries or explains, a hint explains. */
export const PASS_TAGS: GestureTag[] = ["approve", "celebrate"];
export const MISS_TAGS: GestureTag[] = ["encourage", "think"];
export const ERROR_TAGS: GestureTag[] = ["worry", "explain"];
export const HINT_TAGS: GestureTag[] = ["explain"];

/** How the speaker looks saying a reaction: a face, and the kinds of gesture that fit it. */
export interface ReactionLook {
  face: Expression;
  tags: GestureTag[];
}

/**
 * How the speaker looks saying each reaction. The gesture itself is chosen for the moment from
 * these tags (lib/pixel/variety.ts), with the speaker's own moves among them, so the third pass of
 * the day doesn't look like the first. The words come from content/characters/.
 */
const LOOKS: Record<string, ReactionLook> = {
  "check-passed": { face: "pleased", tags: PASS_TAGS },
  "pass-no-hints": { face: "pleased", tags: PASS_TAGS },
  "pass-first-try": { face: "proud", tags: ["celebrate", "approve"] },
  "pass-after-many": { face: "proud", tags: ["celebrate", "approve"] },
  "fixed-by-learner": { face: "pleased", tags: PASS_TAGS },
  "predict-right": { face: "pleased", tags: PASS_TAGS },
  "first-fstring": { face: "pleased", tags: PASS_TAGS },
  "converts-input": { face: "pleased", tags: PASS_TAGS },
  "first-function": { face: "proud", tags: ["celebrate", "approve"] },
  "good-name": { face: "pleased", tags: ["approve"] },
  "check-failed": { face: "thinking", tags: MISS_TAGS },
  "third-fail": { face: "worried", tags: MISS_TAGS },
  "one-left": { face: "proud", tags: MISS_TAGS },
  "predict-wrong": { face: "thinking", tags: MISS_TAGS },
  "run-error": { face: "thinking", tags: ERROR_TAGS },
  "error-name": { face: "thinking", tags: ERROR_TAGS },
  "error-text-number": { face: "thinking", tags: ERROR_TAGS },
  "error-zero": { face: "surprised", tags: ERROR_TAGS },
  "error-index": { face: "thinking", tags: ERROR_TAGS },
  "error-int-text": { face: "thinking", tags: ERROR_TAGS },
  "error-indent": { face: "laughing", tags: ERROR_TAGS },
  "stopped-loop": { face: "surprised", tags: ["surprise", ...ERROR_TAGS] },
  "ran-nothing": { face: "confused", tags: ["confuse", "think"] },
  "loop-never-runs": { face: "confused", tags: ["confuse", "think"] },
  "third-hint": { face: "thinking", tags: HINT_TAGS },
  "solution-seen": { face: "neutral", tags: HINT_TAGS },
  "after-explain": { face: "thinking", tags: HINT_TAGS },
  idle: { face: "neutral", tags: ["encourage", "explain"] },
  returning: { face: "pleased", tags: ["greet"] },
  recap: { face: "neutral", tags: ["explain"] },
  "nested-loop": { face: "surprised", tags: ["surprise", "explain"] },
  "letter-name": { face: "unimpressed", tags: ["tease", "explain"] },
  "long-function": { face: "unimpressed", tags: ["explain", "think"] },
  "long-line": { face: "thinking", tags: ["explain", "think"] },
  "long-no-loop": { face: "laughing", tags: ["tease"] },
  "shorter-than-mine": { face: "surprised", tags: ["surprise", "approve"] },
};

/** How the speaker looks saying the line for `event`, when it has a look of its own. */
export function reactionLook(event: string): ReactionLook | undefined {
  return LOOKS[event];
}

const KEY = "recent-lines";
const SEEN = "seen-events";
const REMEMBER = 30;

/**
 * A fresh line from `who`'s pool for `event`. `by` is who says it when that's someone else: a
 * stand-in, when you're playing as `who` (lib/playas.ts). They say `who`'s line, but never one
 * that names them, so Paul doesn't say Neil's "Including Paul."
 */
export async function pickLine(store: LocalStore | null, characters: Record<string, Character>, who: string, event: string, vars: Record<string, string> = {}, { by }: { by?: string } = {}): Promise<string | null> {
  const name = by && by !== who ? (characters[by]?.name ?? by).split(" ")[0]! : null;
  const pool = characters[who]?.pools[event]?.filter((l) => !name || !new RegExp(`\\b${name}\\b`, "i").test(l));
  if (!pool || pool.length === 0) return null;
  const recent = ((store ? await store.kvGet<string[]>(KEY) : null) ?? []).slice(-REMEMBER);
  const fresh = pool.filter((l) => !recent.includes(l));
  // Every line in the pool has been said lately: say nothing rather than repeat one.
  if (!fresh.length) return null;
  const line = fresh[Math.floor(Math.random() * fresh.length)]!;
  if (store) await store.kvSet(KEY, [...recent, line].slice(-REMEMBER));
  return line.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}

/** True the first time this learner does something (their first f-string, say); false after. */
export async function firstTime(store: LocalStore | null, event: string): Promise<boolean> {
  if (!store) return false;
  const seen = (await store.kvGet<string[]>(SEEN)) ?? [];
  if (seen.includes(event)) return false;
  await store.kvSet(SEEN, [...seen, event]);
  return true;
}

export interface Cue {
  who: string;
  event: string;
  vars?: Record<string, string>;
  /** Only ever said once to a learner. */
  once?: boolean;
  /** Said at most once per step. */
  perStep?: boolean;
}

// What a run says about the learner's code, most telling first. Errors come before style.
export function cuesFromRun(result: RunResult): Cue[] {
  const cues: Cue[] = [];
  const say = (event: string, extra: Omit<Cue, "who" | "event"> = {}) => cues.push({ who: speakerFor(event), event, ...extra });
  const err = result.error;
  if (result.status === "error" && err) {
    const msg = err.message ?? "";
    if (err.type === "NameError") say("error-name", { perStep: true });
    else if (err.type === "TypeError" && /concatenate str|'int' and 'str'|'str' and 'int'|can't multiply sequence/.test(msg)) say("error-text-number", { perStep: true });
    else if (err.type === "ZeroDivisionError") say("error-zero", { perStep: true });
    else if (err.type === "IndexError") say("error-index", { perStep: true });
    else if (err.type === "ValueError" && /invalid literal for int/.test(msg)) say("error-int-text", { perStep: true });
    else if (err.type === "IndentationError") say("error-indent", { perStep: true });
  }
  if (result.status === "ok" && !result.printed && !result.figures?.length && !result.visuals) say("ran-nothing", { perStep: true });
  for (const e of result.events ?? []) {
    const vars = e.name ? { name: e.name } : undefined;
    if (e.event === "loop-never-runs") say("loop-never-runs", { perStep: true });
    else if (e.event === "fstring") say("first-fstring", { once: true });
    else if (e.event === "converts-input") say("converts-input", { once: true });
    else if (e.event === "function") say("first-function", { once: true });
    else if (e.event === "nested-loop") say("nested-loop", { once: true });
    else if (e.event === "good-name") say("good-name", { vars, perStep: true });
    else if (e.event === "letter-name") say("letter-name", { vars, perStep: true });
    else if (e.event === "long-function") say("long-function", { vars, perStep: true });
    else if (e.event === "long-line") say("long-line", { perStep: true });
    else if (e.event === "long-no-loop") say("long-no-loop", { perStep: true });
  }
  return cues;
}

/**
 * What a Check says: first-try passes, the third miss in a row, a long fight won.
 * `classmate` is whose version the learner is fixing, on a "fix my version" step.
 */
export function cuesFromCheck(report: CheckReport, attemptsBefore: number, passed: boolean, opts: { classmateStep: boolean; shorterThanTheirs: boolean; hintsUsed: number; classmate?: string | null }): Cue[] {
  const cues: Cue[] = [];
  const say = (event: string) => cues.push({ who: speakerFor(event, { classmate: opts.classmate }), event });
  if (report.status === "syntax-error") return [{ who: speakerFor("run-error"), event: "run-error" }];
  if (passed) {
    if (opts.classmateStep && opts.shorterThanTheirs && opts.classmate) say("shorter-than-mine");
    if (opts.classmateStep && opts.classmate) say("fixed-by-learner");
    if (attemptsBefore === 0) cues.push({ who: FIRST_TRY[Math.random() < 0.5 ? 0 : 1], event: "pass-first-try" });
    else if (attemptsBefore >= 4) say("pass-after-many");
    else if (opts.hintsUsed === 0 && attemptsBefore >= 1) say("pass-no-hints");
    say("check-passed");
  } else {
    if (attemptsBefore + 1 === 3) say("third-fail");
    const required = report.results.filter((r) => !r.stretch);
    if (required.length > 1 && required.filter((r) => r.passed).length === required.length - 1) say("one-left");
    say("check-failed");
  }
  return cues;
}
