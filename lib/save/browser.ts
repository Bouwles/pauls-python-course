// The save and this browser: making one from what's here, loading one in (replacing what's here,
// or merged with it), remembering when the last one was made, and clearing it all away. The class
// book is passed in (`BookIO`) so this can be tested without a browser's localStorage.
import { loadBook, saveBook } from "../classes/store";
import { loadEntries, saveEntries, type MyEntry } from "../league/local";
import type { ClassBook } from "../classes/types";
import type { LocalStore } from "../store/local";
import { TABLES, type Table, type Tables } from "../store/types";
import { isShipped } from "../progress-rules";
import { emptyTables, type SaveData } from "./format";
import { mergeSaves } from "./merge";
import { summarise } from "./summary";

export interface BookIO {
  load: () => ClassBook;
  save: (book: ClassBook) => boolean;
}

export const BROWSER_BOOK: BookIO = { load: loadBook, save: saveBook };

/** Everything this browser holds, as a save. */
export async function collectSave(store: LocalStore, book: ClassBook = BROWSER_BOOK.load(), now = Date.now()): Promise<SaveData> {
  const tables = emptyTables();
  for (const t of TABLES) (tables as Record<Table, unknown[]>)[t] = await store.all(t);
  return { savedAt: now, tables, classes: book, league: loadEntries() };
}

export type LoadMode = "replace" | "merge";

/** Tables whose rows the server keeps the newest of (lib/server/tables.ts): a merged row there is a new write. */
const VERSIONED = new Set<Table>(["profile", "job_progress", "step_progress", "code_files", "review_cards", "misconceptions", "drill_bests"]);

/** The same row, whatever order its fields were written in. */
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  const stable = (x: unknown): string =>
    x && typeof x === "object" && !Array.isArray(x)
      ? `{${Object.keys(x)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${stable((x as Record<string, unknown>)[k])}`)
          .join(",")}}`
      : Array.isArray(x)
        ? `[${x.map(stable).join(",")}]`
        : JSON.stringify(x);
  return stable(a) === stable(b);
}

/**
 * Load a save into this browser. "replace": this browser ends up holding exactly the save.
 * "merge": the two as one (lib/save/merge.ts), writing only the rows that change.
 */
export async function applySave(store: LocalStore, incoming: SaveData, mode: LoadMode, { book = BROWSER_BOOK, now = Date.now() }: { book?: BookIO; now?: number } = {}): Promise<{ written: number; removed: number }> {
  const here = await collectSave(store, book.load(), now);
  let written = 0;
  let removed = 0;
  if (mode === "replace") {
    for (const t of TABLES) {
      const keep = new Set(incoming.tables[t].map((r) => r.key));
      const gone = here.tables[t].filter((r) => !keep.has(r.key));
      await Promise.all(gone.map((r) => store.delete(t, r.key)));
      await store.putMany(t, incoming.tables[t] as Tables[typeof t][]);
      removed += gone.length;
      written += incoming.tables[t].length;
    }
    book.save(incoming.classes);
    saveEntries(incoming.league ?? []);
    await markSaved(store, incoming);
  } else {
    const merged = mergeSaves(here, incoming);
    for (const t of TABLES) {
      const mine = new Map<string, Tables[Table]>(here.tables[t].map((r) => [r.key, r]));
      const changed = (merged.tables[t] as Tables[Table][])
        .filter((r) => !same(mine.get(r.key), r))
        .map((r) => {
          const before = mine.get(r.key);
          // Written now, so the account (when there is one) takes it as the newest.
          const next = VERSIONED.has(t) ? { ...r, updatedAt: Math.max(now, r.updatedAt) } : r;
          // Code keeps this browser's note of the server copy it was based on.
          return t === "code_files" ? { ...next, baseUpdatedAt: (before as Tables["code_files"] | undefined)?.baseUpdatedAt ?? null, conflictNote: false } : next;
        });
      await store.putMany(t, changed as Tables[typeof t][]);
      written += changed.length;
    }
    book.save(merged.classes);
    // League entries: one per week, the newer entry wins.
    const weeks = new Map<string, MyEntry>();
    for (const e of [...(here.league ?? []), ...(incoming.league ?? [])]) {
      const before = weeks.get(e.week);
      if (!before || e.enteredAt > before.enteredAt) weeks.set(e.week, e);
    }
    saveEntries([...weeks.values()]);
  }
  return { written, removed };
}

// ---------------------------------------------------------------- when the last save was made

/** When a save was last made here (downloaded, copied or loaded), and how many projects had shipped then. */
export interface SaveMark {
  at: number;
  shipped: number;
}

const LAST_SAVE = "save-last";
const LAST_REMINDER = "save-reminded";

const readMark = (x: unknown): SaveMark | null =>
  x && typeof x === "object" && typeof (x as SaveMark).at === "number" && typeof (x as SaveMark).shipped === "number" ? { at: (x as SaveMark).at, shipped: (x as SaveMark).shipped } : null;

export async function lastSaved(store: LocalStore): Promise<SaveMark | null> {
  return readMark(await store.kvGet(LAST_SAVE).catch(() => null));
}

export async function markSaved(store: LocalStore, save: SaveData): Promise<void> {
  await store.kvSet(LAST_SAVE, { at: save.savedAt, shipped: summarise(save).shipped } satisfies SaveMark).catch(() => undefined);
}

const DAY = 24 * 3600_000;
export const REMIND_AFTER = { days: 3, ships: 3 };

/**
 * After a Ship: is it time for "Keep your work safe"? Counted from the last save or the last
 * reminder, whichever came later: 3 Ships since, or a Ship more than 3 days after it. Never
 * saved and never reminded, the first Ship is the moment.
 */
export function reminderDue({ saved, reminded, shipped, now }: { saved: SaveMark | null; reminded: SaveMark | null; shipped: number; now: number }): boolean {
  if (shipped === 0) return false;
  const marks = [saved, reminded].filter((m): m is SaveMark => m !== null);
  if (!marks.length) return true;
  const base = marks.reduce((a, b) => (b.at > a.at ? b : a));
  const since = shipped - base.shipped;
  if (since <= 0) return false;
  return since >= REMIND_AFTER.ships || now - base.at >= REMIND_AFTER.days * DAY;
}

/** Whether to show the reminder now, and a way to note that it was shown. */
export async function checkReminder(store: LocalStore, now = Date.now()): Promise<{ due: boolean; shown: () => Promise<void> }> {
  const [saved, reminded, jobs] = await Promise.all([lastSaved(store), store.kvGet(LAST_REMINDER).catch(() => null), store.all("job_progress")]);
  const shipped = jobs.filter((j) => isShipped(j)).length;
  return {
    due: reminderDue({ saved, reminded: readMark(reminded), shipped, now }),
    shown: () => store.kvSet(LAST_REMINDER, { at: now, shipped } satisfies SaveMark).catch(() => undefined),
  };
}

// ---------------------------------------------------------------- clearing it all

/** Everything the course keeps in this browser: the store, the classes, the display settings. */
export async function deleteBrowserData(store: LocalStore | null): Promise<void> {
  if (store) await store.destroy();
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith("ppc-")) keys.push(k);
    }
    for (const k of keys) window.localStorage.removeItem(k);
  } catch {
    // Storage was refused: there was nothing kept there.
  }
}
