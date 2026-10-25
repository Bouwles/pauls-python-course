// Characters react to real events with lines from small pools (REDESIGN.md 6.3, 6.5).
// The last 30 lines shown to this learner are remembered and not repeated. Lines may
// name something from the learner's code: "{name}" is filled in from `vars`.
import type { Character } from "./content/types";
import type { LocalStore } from "./store/local";
import type { CheckReport, RunResult } from "./python/protocol";

const KEY = "recent-lines";
const SEEN = "seen-events";
const REMEMBER = 30;

export async function pickLine(store: LocalStore | null, characters: Record<string, Character>, who: string, event: string, vars: Record<string, string> = {}): Promise<string | null> {
  const pool = characters[who]?.pools[event];
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
  const err = result.error;
  if (result.status === "error" && err) {
    const msg = err.message ?? "";
    if (err.type === "NameError") cues.push({ who: "moss", event: "error-name", perStep: true });
    else if (err.type === "TypeError" && /concatenate str|'int' and 'str'|'str' and 'int'|can't multiply sequence/.test(msg)) cues.push({ who: "moss", event: "error-text-number", perStep: true });
    else if (err.type === "ZeroDivisionError") cues.push({ who: "moss", event: "error-zero", perStep: true });
    else if (err.type === "IndexError") cues.push({ who: "moss", event: "error-index", perStep: true });
    else if (err.type === "ValueError" && /invalid literal for int/.test(msg)) cues.push({ who: "moss", event: "error-int-text", perStep: true });
    else if (err.type === "IndentationError") cues.push({ who: "pip", event: "error-indent", perStep: true });
  }
  if (result.status === "ok" && !result.printed && !result.figures?.length && !result.visuals) cues.push({ who: "moss", event: "ran-nothing", perStep: true });
  for (const e of result.events ?? []) {
    const vars = e.name ? { name: e.name } : undefined;
    if (e.event === "loop-never-runs") cues.push({ who: "moss", event: "loop-never-runs", perStep: true });
    else if (e.event === "fstring") cues.push({ who: "moss", event: "first-fstring", once: true });
    else if (e.event === "converts-input") cues.push({ who: "moss", event: "converts-input", once: true });
    else if (e.event === "function") cues.push({ who: "moss", event: "first-function", once: true });
    else if (e.event === "nested-loop") cues.push({ who: "pip", event: "nested-loop", once: true });
    else if (e.event === "good-name") cues.push({ who: "moss", event: "good-name", vars, perStep: true });
    else if (e.event === "letter-name") cues.push({ who: "moss", event: "letter-name", vars, perStep: true });
    else if (e.event === "long-function") cues.push({ who: "moss", event: "long-function", vars, perStep: true });
    else if (e.event === "long-line") cues.push({ who: "moss", event: "long-line", perStep: true });
    else if (e.event === "long-no-loop") cues.push({ who: "pip", event: "long-no-loop", perStep: true });
  }
  return cues;
}

/** What a Check says: first-try passes, the third miss in a row, a long fight won. */
export function cuesFromCheck(report: CheckReport, attemptsBefore: number, passed: boolean, opts: { pipsStep: boolean; shorterThanPip: boolean; hintsUsed: number }): Cue[] {
  const cues: Cue[] = [];
  if (report.status === "syntax-error") return [{ who: "moss", event: "run-error" }];
  if (passed) {
    if (opts.pipsStep && opts.shorterThanPip) cues.push({ who: "pip", event: "shorter-than-pip", perStep: true });
    if (attemptsBefore === 0) cues.push(Math.random() < 0.5 ? { who: "pip", event: "pass-first-try" } : { who: "moss", event: "pass-first-try" });
    else if (attemptsBefore >= 4) cues.push({ who: "moss", event: "pass-after-many" });
    else if (opts.hintsUsed === 0 && attemptsBefore >= 1) cues.push({ who: "moss", event: "pass-no-hints" });
    cues.push({ who: "moss", event: "check-passed" });
  } else {
    if (attemptsBefore + 1 === 3) cues.push({ who: "moss", event: "third-fail" });
    const required = report.results.filter((r) => !r.stretch);
    if (required.length > 1 && required.filter((r) => r.passed).length === required.length - 1) cues.push({ who: "pip", event: "one-left" });
    cues.push({ who: "moss", event: "check-failed" });
  }
  return cues;
}
