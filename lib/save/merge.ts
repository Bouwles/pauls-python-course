// Two saves as one: what this browser has and a save brought in, for someone who worked in two
// places. Each step and each project keeps the furthest anyone got with it (a pass beats seeing
// the solution, which beats being under way; a tie goes to the newer), each file keeps its newest
// code, history and review logs are put together, and a drill keeps its best time. Plain functions
// over plain data, so they can be tested without a browser.
import { mergeRegister } from "../classes/store";
import type { ClassBook, JoinedClass, TaughtClass } from "../classes/types";
import { TABLES, type JobProgressRow, type JobStatus, type StepProgressRow, type StepStatus, type Table, type Tables } from "../store/types";
import { emptyTables, type SaveData, type SaveTables } from "./format";

const STEP_RANK: Record<StepStatus, number> = { "not-started": 0, "in-progress": 1, "seen-solution": 2, passed: 3 };
const JOB_RANK: Record<JobStatus, number> = { "not-started": 0, "in-progress": 1, placed: 2, shipped: 3, "shipped-stretch": 4 };

type Chooser<R> = (here: R, there: R) => R;

const newer = <R extends { updatedAt: number }>(here: R, there: R) => (there.updatedAt > here.updatedAt ? there : here);
/** Kept from whichever came first: history doesn't change once written. */
const first = <R,>(here: R) => here;

function furthestStep(here: StepProgressRow, there: StepProgressRow): StepProgressRow {
  const a = STEP_RANK[here.status];
  const b = STEP_RANK[there.status];
  return a === b ? newer(here, there) : b > a ? there : here;
}

function furthestJob(here: JobProgressRow, there: JobProgressRow): JobProgressRow {
  const a = JOB_RANK[here.status];
  const b = JOB_RANK[there.status];
  const win = a === b ? newer(here, there) : b > a ? there : here;
  const lose = win === here ? there : here;
  const stretchDone = [...new Set([...win.stretchDone, ...lose.stretchDone])].sort();
  const started = [here.startedAt, there.startedAt].filter((t): t is number => t !== null);
  return {
    ...win,
    // A stretch task done in either place is done.
    status: win.status === "shipped" && stretchDone.length ? "shipped-stretch" : win.status,
    stretchDone,
    startedAt: started.length ? Math.min(...started) : null,
    shippedAt: win.shippedAt ?? lose.shippedAt,
    timeSpent: Math.max(here.timeSpent, there.timeSpent),
  };
}

const PICK: { [T in Table]: Chooser<Tables[T]> } = {
  profile: (here, there) => {
    const win = newer(here, there);
    return { ...win, onboarded: here.onboarded || there.onboarded };
  },
  job_progress: furthestJob,
  step_progress: furthestStep,
  code_files: newer,
  code_snapshots: first,
  review_cards: newer,
  review_logs: first,
  misconceptions: newer,
  drill_bests: (here, there) => (there.bestMs < here.bestMs ? there : here),
  collectibles: (here, there) => (there.foundAt < here.foundAt ? there : here),
  story_flags: (here, there) => (there.setAt < here.setAt ? there : here),
  events: first,
};

function mergeRows<T extends Table>(table: T, here: Tables[T][], there: Tables[T][]): Tables[T][] {
  const pick = PICK[table] as Chooser<Tables[T]>;
  const out = new Map<string, Tables[T]>(here.map((r) => [r.key, r]));
  for (const r of there) {
    const mine = out.get(r.key);
    out.set(r.key, mine ? pick(mine, r) : r);
  }
  return [...out.values()];
}

const earliest = (a: number, b: number) => (a && b ? Math.min(a, b) : a || b);

/** Two class books as one: every class from either, the newer copy of what's set, and every student's latest report. */
export function mergeBooks(here: ClassBook, there: ClassBook): ClassBook {
  const teaching = new Map<string, TaughtClass>(here.teaching.map((t) => [t.id, t]));
  for (const t of there.teaching) {
    const mine = teaching.get(t.id);
    if (!mine) {
      teaching.set(t.id, t);
      continue;
    }
    const info = t.updatedAt > mine.updatedAt ? t : mine;
    teaching.set(t.id, {
      ...mine,
      id: info.id,
      name: info.name,
      teacher: info.teacher,
      assignments: info.assignments,
      updatedAt: info.updatedAt,
      // Whoever made the class stays its teacher.
      role: mine.role === "teacher" || t.role === "teacher" ? "teacher" : "co-teacher",
      createdAt: earliest(mine.createdAt, t.createdAt),
      register: mergeRegister(mine.register, t.register),
    });
  }
  const joined = new Map<string, JoinedClass>(here.joined.map((j) => [j.id, j]));
  for (const j of there.joined) {
    const mine = joined.get(j.id);
    if (!mine) {
      joined.set(j.id, j);
      continue;
    }
    const later = j.updatedAt > mine.updatedAt ? j : mine;
    const earlier = later === j ? mine : j;
    // Anything else kept with the class (a shared League table) comes from the newer copy when it has it.
    joined.set(j.id, { ...earlier, ...later, joinedAt: earliest(mine.joinedAt, j.joinedAt), build: { ...earlier.build, ...later.build } });
  }
  // The student id the teacher knows them by: this browser's, unless only the save has been in a class.
  const me = here.me && (here.joined.length > 0 || !there.me || there.joined.length === 0) ? here.me : there.me || here.me;
  return {
    me,
    teaching: [...teaching.values()].sort((a, b) => a.createdAt - b.createdAt),
    joined: [...joined.values()].sort((a, b) => a.joinedAt - b.joinedAt),
  };
}

/** This browser's save and another, as one. */
export function mergeSaves(here: SaveData, there: SaveData): SaveData {
  const tables = emptyTables();
  for (const t of TABLES) (tables as Record<Table, unknown[]>)[t] = mergeRows(t, here.tables[t] as never[], there.tables[t] as never[]);
  return { savedAt: Math.max(here.savedAt, there.savedAt), tables: tables as SaveTables, classes: mergeBooks(here.classes, there.classes) };
}
