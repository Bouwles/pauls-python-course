// A save: everything this browser holds for the course, as one file or one line of text, so a
// student with no account can keep a copy and carry on in another browser or on another device.
// The file is JSON: { kind: "ppc-save", v: 1, savedAt, course, tables, classes }, where `tables`
// is every LocalStore table (lib/store/types.ts) row for row and `classes` is the class book as
// lib/classes/store.ts keeps it. The save code is the same JSON, deflated (fflate) and base64url,
// behind its version: "ppc-save.1.eJy...".
// A save arrives from anywhere (a chat, a note, a file someone hands over), so reading one trusts
// nothing: sizes are capped before anything is unpacked, every row is checked field by field and
// rebuilt from what checked out, keys are made again from the fields they stand for, text is
// capped, and a row that doesn't read is left out (and counted) rather than breaking the rest.
import { Inflate, deflateSync, strFromU8, strToU8 } from "fflate";
import { BRAND } from "../brand";
import { fromBase64Url, line, lookWire, readLook, toBase64Url } from "../classes/link";
import { EMPTY_BOOK, readBook, writeBook } from "../classes/store";
import type { ClassBook } from "../classes/types";
import { readEntries, writeEntries, type MyEntry } from "../league/local";
import { isCast } from "../playas";
import { codeKey, stepKey } from "../store/progress";
import {
  DEFAULT_SETTINGS,
  TABLES,
  type CodeFileRow,
  type CollectibleRow,
  type DrillBestRow,
  type EventRow,
  type JobProgressRow,
  type JobStatus,
  type Location,
  type MisconceptionRow,
  type ProfileRow,
  type ReviewCardRow,
  type ReviewLogRow,
  type Settings,
  type SnapshotReason,
  type SnapshotRow,
  type StepProgressRow,
  type StepStatus,
  type StoryFlagRow,
  type Table,
  type Tables,
} from "../store/types";

export const SAVE_KIND = "ppc-save";
export const SAVE_VERSION = 1;
/** What a save code starts with, before its version: "ppc-save.1.". */
export const CODE_PREFIX = "ppc-save";

/**
 * The most a save may hold. A year of heavy use comes to about 20 MB of JSON; anything past these
 * is refused or cut. History past its cap keeps its newest rows.
 */
export const SAVE_LIMITS = {
  /** A save file, in bytes. */
  fileBytes: 100_000_000,
  /** A pasted save code, in characters. */
  codeChars: 40_000_000,
  /** The JSON once a code is inflated, in bytes. */
  jsonBytes: 100_000_000,
  /** One file's code, in characters (the server keeps the same). */
  codeText: 200_000,
  /** A step's own state (investigate answers, a Parsons arrangement, a git repository), as JSON. */
  stepData: 2_000_000,
  /** An event's details, as JSON. */
  eventData: 20_000,
  /** Classes taught, and classes joined. */
  classes: 100,
  /** Rows per table. */
  rows: {
    profile: 1,
    job_progress: 2_000,
    step_progress: 20_000,
    code_files: 20_000,
    code_snapshots: 100_000,
    review_cards: 10_000,
    review_logs: 200_000,
    misconceptions: 5_000,
    drill_bests: 5_000,
    collectibles: 5_000,
    story_flags: 5_000,
    events: 400_000,
  } satisfies Record<Table, number>,
} as const;

export type SaveTables = { [T in Table]: Tables[T][] };

/** A save, read and checked. */
export interface SaveData {
  savedAt: number;
  tables: SaveTables;
  classes: ClassBook;
  /** Your Arcade League entries (lib/league/local.ts); older saves have none. */
  league?: MyEntry[];
}

/** Why a save didn't read, for the person holding it. */
export type SaveProblem = "empty" | "broken" | "newer" | "too-big" | "not-a-save" | "data-export" | "class-link";

export type SaveRead = { ok: true; save: SaveData; skipped: number } | { ok: false; problem: SaveProblem };

export function emptyTables(): SaveTables {
  return Object.fromEntries(TABLES.map((t) => [t, []])) as unknown as SaveTables;
}

// ---------------------------------------------------------------- writing

/** The save as it goes into the file. */
export function saveWire(save: SaveData): Record<string, unknown> {
  return {
    kind: SAVE_KIND,
    v: SAVE_VERSION,
    savedAt: save.savedAt,
    course: BRAND.name,
    tables: save.tables,
    classes: JSON.parse(writeBook(save.classes)) as unknown,
    league: writeEntries(save.league ?? []),
  };
}

/** The save file's text. */
export const saveJson = (save: SaveData) => JSON.stringify(saveWire(save));

/** The save code: the same JSON, deflated, base64url, with its version in front. */
export function encodeSaveCode(save: SaveData): string {
  return `${CODE_PREFIX}.${SAVE_VERSION}.${toBase64Url(deflateSync(strToU8(saveJson(save)), { level: 9 }))}`;
}

/** "ppc-save-caitlin-2026-11-06.json". */
export function saveFileName(save: SaveData): string {
  const name = (save.tables.profile[0]?.displayName ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const d = new Date(save.savedAt);
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${BRAND.shortName.toLowerCase()}-save${name ? `-${name}` : ""}-${day}.json`;
}

// ---------------------------------------------------------------- reading: the outside

/** Inflate, stopping as soon as the output passes `max` bytes, so a small code can't unpack into gigabytes. */
function inflateCapped(bytes: Uint8Array, max: number): Uint8Array | "too-big" | null {
  if (bytes.length === 0) return null;
  const parts: Uint8Array[] = [];
  let total = 0;
  let tooBig = false;
  const inflater = new Inflate((chunk) => {
    total += chunk.length;
    if (total > max) {
      tooBig = true;
      throw new Error("too big");
    }
    parts.push(chunk);
  });
  try {
    // Small pieces in, so no single push can produce much more than the cap.
    for (let i = 0; i < bytes.length; i += 4096) inflater.push(bytes.subarray(i, i + 4096), i + 4096 >= bytes.length);
  } catch {
    return tooBig ? "too-big" : null;
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/**
 * A save as someone pasted it or as a file's text: a save code (wrapped by a chat, in quotes, with
 * a full stop after it) or the file's JSON.
 */
export function decodeSaveText(raw: string): SaveRead {
  const text = raw.trim().replace(/^[`'"“”‘’]+|[`'"“”‘’]+$/g, "").trim();
  if (!text) return { ok: false, problem: "empty" };
  if (text.startsWith("{")) {
    if (text.length > SAVE_LIMITS.fileBytes) return { ok: false, problem: "too-big" };
    const got = parseJson(text);
    return got.ok ? readSave(got.value) : { ok: false, problem: "broken" };
  }
  const code = text.replace(/\s+/g, "").replace(/[^A-Za-z0-9_-]+$/, "");
  if (code.length > SAVE_LIMITS.codeChars) return { ok: false, problem: "too-big" };
  // A class link, or just its hash: those go in the address bar, not here.
  if (/\/class\/(join|report|teach)\//.test(code) || /^#?\d{1,4}\.[A-Za-z0-9_-]+$/.test(code)) return { ok: false, problem: "class-link" };
  const m = /^ppc-save\.(\d{1,4})\.([A-Za-z0-9_-]+)$/i.exec(code);
  if (!m) return { ok: false, problem: "not-a-save" };
  const version = Number(m[1]);
  if (version > SAVE_VERSION) return { ok: false, problem: "newer" };
  if (version < 1) return { ok: false, problem: "broken" };
  const bytes = fromBase64Url(m[2]!);
  if (!bytes) return { ok: false, problem: "broken" };
  const json = inflateCapped(bytes, SAVE_LIMITS.jsonBytes);
  if (json === "too-big") return { ok: false, problem: "too-big" };
  if (!json) return { ok: false, problem: "broken" };
  const got = parseJson(strFromU8(json));
  return got.ok ? readSave(got.value) : { ok: false, problem: "broken" };
}

// ---------------------------------------------------------------- reading: the save itself

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);

/** A job, step, card or drill id, as the course makes them ("shop-sign", "make"). */
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/;
const id = (x: unknown): string | null => (typeof x === "string" && ID.test(x) ? x : null);
/** A key made elsewhere (a review log's variant, a uuid): plain characters, no climbing out of folders. */
const KEY = /^[A-Za-z0-9][A-Za-z0-9_.:#/-]{0,199}$/;
const key = (x: unknown): string | null => (typeof x === "string" && KEY.test(x) && !x.includes("..") ? x : null);
/** A file's name in a project: "main.py", "finance/cli.py". */
const FILE = /^[A-Za-z0-9_][A-Za-z0-9_.\/-]{0,199}$/;
const fileName = (x: unknown): string | null => (typeof x === "string" && FILE.test(x) && !x.includes("..") && !x.includes("//") && !x.endsWith("/") ? x : null);

/** A moment, in ms since 1970, before the year 2286. */
const time = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x < 1e13 ? Math.floor(x) : null);
/** A whole number from 0, held to `max`. */
const count = (x: unknown, max: number): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.min(Math.floor(x), max) : null);
const real = (x: unknown, min: number, max: number): number | null => (typeof x === "number" && Number.isFinite(x) && x >= min && x <= max ? x : null);
const oneOf = <T extends string>(x: unknown, options: readonly T[]): T | null => (typeof x === "string" && (options as readonly string[]).includes(x) ? (x as T) : null);

/** Control characters, odd line breaks and direction marks: nothing written text needs. */
const HIDDEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200e\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069\ufeff]/g;
/** Written text that may run over several lines (a self-explanation): cleaned and capped, or null. */
const prose = (x: unknown, max: number): string | null => (typeof x === "string" ? [...x.replace(/\r\n?/g, "\n").replace(HIDDEN, "")].slice(0, max).join("") : null);
/** Code, as it was written: only refused when it isn't text or is too long to be real. */
const code = (x: unknown): string | null => (typeof x === "string" && x.length <= SAVE_LIMITS.codeText ? x : null);

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Plain JSON, copied: objects, lists, text, numbers, true, false and null, held to a size, a depth
 * and a count. Undefined when it goes past any of them.
 */
export function cleanJson(x: unknown, maxChars: number): unknown {
  const budget = { chars: maxChars, nodes: 100_000 };
  const walk = (v: unknown, depth: number): unknown => {
    if (--budget.nodes < 0) throw new Error("too many");
    if (v === null || typeof v === "boolean") return v;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      budget.chars -= v.length + 2;
      if (budget.chars < 0) throw new Error("too long");
      return v;
    }
    if (depth > 24) throw new Error("too deep");
    if (Array.isArray(v)) return v.map((item) => walk(item, depth + 1));
    if (isObj(v)) {
      const out: Obj = {};
      for (const [k, item] of Object.entries(v)) {
        if (UNSAFE_KEYS.has(k)) continue;
        budget.chars -= k.length + 3;
        if (budget.chars < 0) throw new Error("too long");
        out[k] = walk(item, depth + 1);
      }
      return out;
    }
    throw new Error("not JSON");
  };
  try {
    return walk(x, 0);
  } catch {
    return undefined;
  }
}

const JOB_STATUSES: readonly JobStatus[] = ["not-started", "in-progress", "shipped", "shipped-stretch", "placed"];
const STEP_STATUSES: readonly StepStatus[] = ["not-started", "in-progress", "passed", "seen-solution"];
const SNAPSHOT_REASONS: readonly SnapshotReason[] = ["run", "check", "manual", "conflict", "restore"];

// The settings, field by field; anything else the profile's settings carry (added after this was
// written) travels too when it's a plain value under a plain name.
function readSettings(x: unknown): Settings {
  const s: Obj = isObj(x) ? x : {};
  const out: Settings & Obj = { ...DEFAULT_SETTINGS };
  for (const [k, v] of Object.entries(s)) {
    if (k in DEFAULT_SETTINGS || UNSAFE_KEYS.has(k) || !/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(k)) continue;
    if (v === null || typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v))) out[k] = v;
    else if (typeof v === "string" && v.length <= 100) out[k] = line(v, 100);
  }
  out.dialogue = oneOf(s.dialogue, ["full", "less"] as const) ?? DEFAULT_SETTINGS.dialogue;
  out.theme = oneOf(s.theme, ["system", "light", "dark"] as const) ?? DEFAULT_SETTINGS.theme;
  out.motion = oneOf(s.motion, ["system", "reduced"] as const) ?? DEFAULT_SETTINGS.motion;
  out.prose = oneOf(s.prose, ["serif", "hyperlegible"] as const) ?? DEFAULT_SETTINGS.prose;
  const size = count(s.editorFontSize, 22);
  out.editorFontSize = size === null ? DEFAULT_SETTINGS.editorFontSize : Math.max(12, size);
  const goal = s.dailyGoalMinutes === null ? null : count(s.dailyGoalMinutes, 600);
  out.dailyGoalMinutes = goal === null || goal === 0 ? null : goal;
  for (const k of ["sound", "streaks", "weeklyEmail", "publicProfile"] as const) out[k] = typeof s[k] === "boolean" ? (s[k] as boolean) : DEFAULT_SETTINGS[k];
  out.playAs = typeof s.playAs === "string" && isCast(s.playAs) ? s.playAs : null;
  return out;
}

function readLocation(x: unknown): Location | null {
  if (!isObj(x)) return null;
  const jobId = id(x.jobId);
  const stepId = id(x.stepId);
  if (!jobId || !stepId) return null;
  const out: Location = { jobId, stepId };
  const cursor = count(x.cursor, SAVE_LIMITS.codeText);
  if (cursor !== null) out.cursor = cursor;
  const file = fileName(x.file);
  if (file) out.file = file;
  return out;
}

const READERS: { [T in Table]: (x: Obj) => Tables[T] | null } = {
  profile(x): ProfileRow | null {
    return {
      key: "me",
      displayName: line(x.displayName, 40) ?? "",
      // The look as its known options; an old animal look, or anything else, reads as none.
      character: readLook(lookWire(x.character)),
      settings: readSettings(x.settings),
      experience: oneOf(x.experience, ["none", "some", "lots"] as const),
      lastLocation: readLocation(x.lastLocation),
      onboarded: x.onboarded === true,
      updatedAt: time(x.updatedAt) ?? 0,
    };
  },

  job_progress(x): JobProgressRow | null {
    const jobId = id(x.jobId);
    const status = oneOf(x.status, JOB_STATUSES);
    if (!jobId || !status) return null;
    const stretch = Array.isArray(x.stretchDone) ? x.stretchDone.slice(0, 50).map(id).filter((s): s is string => s !== null) : [];
    return {
      key: jobId,
      jobId,
      status,
      startedAt: time(x.startedAt),
      shippedAt: time(x.shippedAt),
      stretchDone: [...new Set(stretch)],
      timeSpent: count(x.timeSpent, 100_000_000) ?? 0,
      updatedAt: time(x.updatedAt) ?? 0,
    };
  },

  step_progress(x): StepProgressRow | null {
    const jobId = id(x.jobId);
    const stepId = id(x.stepId);
    const status = oneOf(x.status, STEP_STATUSES);
    if (!jobId || !stepId || !status) return null;
    const data = x.data === undefined || x.data === null ? {} : cleanJson(x.data, SAVE_LIMITS.stepData);
    if (!isObj(data)) return null;
    return {
      key: stepKey(jobId, stepId),
      jobId,
      stepId,
      status,
      attempts: count(x.attempts, 1_000_000) ?? 0,
      hintsUsed: count(x.hintsUsed, 1_000) ?? 0,
      seenSolution: x.seenSolution === true,
      predictChoice: x.predictChoice === null || x.predictChoice === undefined ? null : key(x.predictChoice) ?? line(x.predictChoice, 200),
      selfExplanation: x.selfExplanation === null || x.selfExplanation === undefined ? null : prose(x.selfExplanation, 5_000),
      selfRating: oneOf(x.selfRating, ["had", "partly", "missed"] as const),
      timeSpent: count(x.timeSpent, 100_000_000) ?? 0,
      data,
      updatedAt: time(x.updatedAt) ?? 0,
    };
  },

  code_files(x): CodeFileRow | null {
    const jobId = id(x.jobId);
    const stepId = id(x.stepId);
    const filename = fileName(x.filename);
    const content = code(x.content);
    if (!jobId || !stepId || !filename || content === null) return null;
    return {
      key: codeKey(jobId, stepId, filename),
      jobId,
      stepId,
      filename,
      content,
      cursor: x.cursor === null ? null : count(x.cursor, content.length),
      // Both are about one account's server copy, which a save doesn't carry.
      baseUpdatedAt: null,
      conflictNote: false,
      updatedAt: time(x.updatedAt) ?? 0,
    };
  },

  code_snapshots(x): SnapshotRow | null {
    const jobId = id(x.jobId);
    const stepId = id(x.stepId);
    const filename = fileName(x.filename);
    const content = code(x.content);
    const createdAt = time(x.createdAt);
    if (!jobId || !stepId || !filename || content === null || createdAt === null) return null;
    // A snapshot's key is its file's, then when it was taken: history is read by that prefix.
    const prefix = `${codeKey(jobId, stepId, filename)}/`;
    const given = typeof x.key === "string" && x.key.startsWith(prefix) && /^\d{1,16}-[a-z0-9]{0,16}$/.test(x.key.slice(prefix.length)) ? x.key : null;
    return {
      key: given ?? `${prefix}${String(createdAt).padStart(14, "0")}-s${createdAt.toString(36).slice(-6)}`,
      jobId,
      stepId,
      filename,
      content,
      reason: oneOf(x.reason, SNAPSHOT_REASONS) ?? "manual",
      createdAt,
      updatedAt: time(x.updatedAt) ?? createdAt,
    };
  },

  review_cards(x): ReviewCardRow | null {
    const cardId = id(x.cardId);
    const due = time(x.due);
    const state = count(x.state, 3);
    if (!cardId || due === null || state === null) return null;
    const conceptId = id(x.conceptId) ?? cardId;
    return {
      // One card per concept: its key is its id.
      key: cardId,
      cardId,
      conceptId,
      due,
      stability: real(x.stability, 0, 1e7) ?? 0,
      difficulty: real(x.difficulty, 0, 100) ?? 0,
      elapsedDays: count(x.elapsedDays, 100_000) ?? 0,
      scheduledDays: count(x.scheduledDays, 100_000) ?? 0,
      learningSteps: count(x.learningSteps, 1_000) ?? 0,
      reps: count(x.reps, 1_000_000) ?? 0,
      lapses: count(x.lapses, 1_000_000) ?? 0,
      state,
      lastReview: time(x.lastReview),
      updatedAt: time(x.updatedAt) ?? 0,
    };
  },

  review_logs(x): ReviewLogRow | null {
    const k = key(x.key);
    const cardId = key(x.cardId);
    const rating = count(x.rating, 4);
    const reviewedAt = time(x.reviewedAt);
    if (!k || !cardId || rating === null || reviewedAt === null) return null;
    return {
      key: k,
      cardId,
      rating,
      reviewedAt,
      elapsedDays: count(x.elapsedDays, 100_000) ?? 0,
      scheduledDays: count(x.scheduledDays, 100_000) ?? 0,
      updatedAt: time(x.updatedAt) ?? reviewedAt,
    };
  },

  misconceptions(x): MisconceptionRow | null {
    const k = key(x.key);
    const lastSeenAt = time(x.lastSeenAt);
    if (!k || lastSeenAt === null) return null;
    return { key: k, count: count(x.count, 1_000_000) ?? 1, lastSeenAt, lastAddressedAt: time(x.lastAddressedAt), updatedAt: time(x.updatedAt) ?? lastSeenAt };
  },

  drill_bests(x): DrillBestRow | null {
    const k = key(x.key);
    const bestMs = count(x.bestMs, 1e9);
    const achievedAt = time(x.achievedAt);
    if (!k || bestMs === null || achievedAt === null) return null;
    return { key: k, bestMs, achievedAt, updatedAt: time(x.updatedAt) ?? achievedAt };
  },

  collectibles(x): CollectibleRow | null {
    const k = key(x.key);
    const foundAt = time(x.foundAt);
    if (!k || foundAt === null) return null;
    return { key: k, foundAt, updatedAt: time(x.updatedAt) ?? foundAt };
  },

  story_flags(x): StoryFlagRow | null {
    const k = key(x.key);
    const setAt = time(x.setAt);
    if (!k || setAt === null) return null;
    return { key: k, setAt, updatedAt: time(x.updatedAt) ?? setAt };
  },

  events(x): EventRow | null {
    const k = key(x.key);
    const type = key(x.type);
    const createdAt = time(x.createdAt);
    const payload = x.payload === undefined || x.payload === null ? {} : cleanJson(x.payload, SAVE_LIMITS.eventData);
    if (!k || !type || createdAt === null || !isObj(payload)) return null;
    return { key: k, type, payload, createdAt, updatedAt: time(x.updatedAt) ?? createdAt };
  },
};

/** The class book in a save: capped, then read through the class store's own checks. */
function readClasses(x: unknown): ClassBook {
  if (!isObj(x)) return EMPTY_BOOK;
  const capped = {
    ...x,
    teaching: Array.isArray(x.teaching) ? x.teaching.slice(0, SAVE_LIMITS.classes) : [],
    joined: Array.isArray(x.joined) ? x.joined.slice(0, SAVE_LIMITS.classes) : [],
  };
  return readBook(JSON.stringify(capped));
}

/** Tables that only ever grow: past their cap, the oldest rows go first. */
const HISTORY = new Set<Table>(["code_snapshots", "review_logs", "events"]);
const happened = (x: unknown): number => {
  if (!isObj(x)) return 0;
  const t = x.createdAt ?? x.reviewedAt;
  return typeof t === "number" && Number.isFinite(t) ? t : 0;
};

/** Check a save, already parsed from JSON. Rows that don't read are left out and counted in `skipped`. */
export function readSave(value: unknown): SaveRead {
  if (!isObj(value)) return { ok: false, problem: "broken" };
  if (value.kind !== SAVE_KIND) {
    // "Download all my data" makes a file that looks a little like this; it isn't one.
    if ("exportedAt" in value && ("job_progress" in value || "code_files" in value)) return { ok: false, problem: "data-export" };
    return { ok: false, problem: "not-a-save" };
  }
  const version = value.v;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) return { ok: false, problem: "broken" };
  if (version > SAVE_VERSION) return { ok: false, problem: "newer" };
  const savedAt = time(value.savedAt);
  if (savedAt === null || !isObj(value.tables)) return { ok: false, problem: "broken" };

  const tables = emptyTables();
  let skipped = 0;
  for (const table of TABLES) {
    const given = value.tables[table];
    if (given === undefined) continue;
    if (!Array.isArray(given)) {
      skipped += 1;
      continue;
    }
    const cap = SAVE_LIMITS.rows[table];
    skipped += Math.max(0, given.length - cap);
    const read = READERS[table] as (x: Obj) => Tables[Table] | null;
    // Too much history: the newest of it.
    const rows = given.length > cap && HISTORY.has(table) ? [...given].sort((a, b) => happened(b) - happened(a)).slice(0, cap) : given.slice(0, cap);
    // One row per key: if a key comes twice, the newer row stays.
    const byKey = new Map<string, Tables[Table]>();
    for (const raw of rows) {
      const row = isObj(raw) ? read(raw) : null;
      if (!row) {
        skipped += 1;
        continue;
      }
      const before = byKey.get(row.key);
      if (before) skipped += 1;
      if (!before || row.updatedAt >= before.updatedAt) byKey.set(row.key, row);
    }
    (tables as Record<Table, Tables[Table][]>)[table] = [...byKey.values()];
  }
  // League entries are checked by the League's own reader, which keeps only well-formed weeks.
  const league = readEntries(typeof value.league === "string" ? value.league.slice(0, 200_000) : null);
  return { ok: true, save: { savedAt, tables, classes: readClasses(value.classes), league }, skipped };
}

/** What to tell someone whose save didn't read. */
export function problemText(problem: SaveProblem): string {
  switch (problem) {
    case "empty":
      return "There's nothing there yet. Choose a save file or paste a save code.";
    case "too-big":
      return "That's far too big to be a save from this course.";
    case "newer":
      return "That save is from a newer version of the course. Reload the page and try again.";
    case "data-export":
      return "That's the data download, which is for reading. To load your work, use the file from Download my save.";
    case "class-link":
      return "That looks like a class link. Open it in the address bar instead.";
    case "not-a-save":
      return "That isn't a save from this course. A save code starts with ppc-save.";
    case "broken":
      return "That save doesn't read. It may have been cut short when it was copied: try copying all of it again.";
  }
}
