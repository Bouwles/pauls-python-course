// What's in a save, in a line: "Caitlin, 12 projects shipped, 1 class, saved 6 Nov".
import type { AvatarLook } from "../avatar";
import { readAvatar } from "../avatar";
import { playingAs, type CastId } from "../playas";
import { isShipped } from "../progress-rules";
import type { SaveData } from "./format";

export interface SaveSummary {
  name: string;
  playAs: CastId | null;
  character: AvatarLook;
  shipped: number;
  /** Steps passed, or done by seeing the solution. */
  stepsDone: number;
  /** Steps with code in them. */
  codeSteps: number;
  reviewCards: number;
  classes: number;
  savedAt: number;
  /** Nothing anyone would miss: no progress, no code, no classes, and nobody chosen yet. */
  empty: boolean;
}

export function summarise(save: SaveData): SaveSummary {
  const t = save.tables;
  const profile = t.profile[0];
  const stepsDone = t.step_progress.filter((s) => s.status === "passed" || s.status === "seen-solution").length;
  const codeSteps = new Set(t.code_files.map((c) => `${c.jobId}/${c.stepId}`)).size;
  const classes = save.classes.teaching.length + save.classes.joined.length;
  return {
    name: profile?.displayName ?? "",
    playAs: playingAs(profile?.settings.playAs),
    character: readAvatar(profile?.character),
    shipped: t.job_progress.filter((j) => isShipped(j)).length,
    stepsDone,
    codeSteps,
    reviewCards: t.review_cards.length,
    classes,
    savedAt: save.savedAt,
    empty: !profile?.onboarded && t.job_progress.length === 0 && t.step_progress.length === 0 && t.code_files.length === 0 && classes === 0,
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "6 Nov", or "6 Nov 2025" in another year. */
export function shortDay(ms: number, now = Date.now()): string {
  const d = new Date(ms);
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

/** "Caitlin, 12 projects shipped, 1 class, saved 6 Nov". Without `saved`, the date is left off (this browser, now). */
export function describeSave(s: SaveSummary, { saved = true, now = Date.now() }: { saved?: boolean; now?: number } = {}): string {
  const parts = [
    s.name || "No name yet",
    s.shipped ? `${plural(s.shipped, "project", "projects")} shipped` : "no projects shipped yet",
    s.classes ? plural(s.classes, "class", "classes") : "no classes",
  ];
  if (saved) parts.push(`saved ${shortDay(s.savedAt, now)}`);
  return parts.join(", ");
}

/** "48 steps done, code for 30 steps and 25 review cards." */
export function describeDetail(s: SaveSummary): string {
  const parts = [plural(s.stepsDone, "step done", "steps done"), `code for ${plural(s.codeSteps, "step", "steps")}`, plural(s.reviewCards, "review card", "review cards")];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
}
