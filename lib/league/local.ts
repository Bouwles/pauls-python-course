"use client";

// Your Arcade League entries, raced and kept in this browser: no server needed, so it works the
// same on GitHub Pages as in the local version. Entering reads league.json (pasted, uploaded or
// written by your own program in the Workbench), races it there and then on the week's seeds with
// lib/league/course.ts, and keeps the policy for the week; your newest entry counts. Only the
// policy and when it went in are kept: the score is raced again from the policy whenever it's
// read, so it's always what the course says. A progress link carries this week's entry to your
// teacher (lib/classes/report.ts).
import { useSyncExternalStore } from "react";
import { isoWeek, isWeek, policyText, readEntry, readPolicyText, scoreOf, type Policy } from "./course";

export { scoreOf };

const KEY = "ppc-league";
/** Weeks kept: about a term. */
export const KEEP_WEEKS = 16;

export interface MyEntry {
  week: string;
  policy: Policy;
  enteredAt: number;
}

export interface Scored {
  score: number;
  finished: number;
  races: number;
}

interface Stored {
  v: 1;
  e: { w: string; p: string; at: number }[];
}

// ---------------------------------------------------------------- racing an entry

export type Entered = { ok: true; entry: MyEntry; result: Scored } | { ok: false; error: string };

/**
 * Race league.json's contents for this week: what the Enter button does. `text` is the file as
 * text; the result is the entry to keep and its score, or what's wrong with it.
 */
export function raceEntry(text: string, now = Date.now()): Entered {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That isn't JSON. Save it with json.dump, as above." };
  }
  const read = readEntry(parsed);
  if ("error" in read) return { ok: false, error: read.error };
  const week = isoWeek(new Date(now));
  return { ok: true, entry: { week, policy: read.policy, enteredAt: now }, result: scoreOf(read.policy, week) };
}

// ---------------------------------------------------------------- the list of entries

/** Keep an entry: it replaces any other for its week. Newest weeks first, and only so many. */
export function putEntry(list: MyEntry[], entry: MyEntry): MyEntry[] {
  return [entry, ...list.filter((e) => e.week !== entry.week)].sort((a, b) => b.week.localeCompare(a.week)).slice(0, KEEP_WEEKS);
}

export const dropEntry = (list: MyEntry[], week: string) => list.filter((e) => e.week !== week);

export const entryFor = (list: MyEntry[], week: string) => list.find((e) => e.week === week) ?? null;

export function readEntries(raw: string | null): MyEntry[] {
  if (!raw) return [];
  let data: Partial<Stored>;
  try {
    data = JSON.parse(raw) as Partial<Stored>;
  } catch {
    return [];
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.e)) return [];
  let list: MyEntry[] = [];
  for (const e of data.e.slice(0, KEEP_WEEKS * 2)) {
    if (!e || typeof e !== "object" || !isWeek(e.w)) continue;
    const policy = readPolicyText(e.p);
    const at = typeof e.at === "number" && Number.isFinite(e.at) && e.at > 0 ? e.at : 0;
    if (policy && !list.some((x) => x.week === e.w)) list = putEntry(list, { week: e.w, policy, enteredAt: at });
  }
  return list;
}

export function writeEntries(list: MyEntry[]): string {
  const stored: Stored = { v: 1, e: list.map((e) => ({ w: e.week, p: policyText(e.policy), at: e.enteredAt })) };
  return JSON.stringify(stored);
}

// ---------------------------------------------------------------- the browser's copy

const EMPTY: MyEntry[] = [];
let cache: { raw: string | null; list: MyEntry[] } | null = null;
const listeners = new Set<() => void>();

function rawNow(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The entries as saved now: the same array until something changes, as useSyncExternalStore needs. */
export function loadEntries(): MyEntry[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = rawNow();
  if (cache && cache.raw === raw) return cache.list;
  cache = { raw, list: readEntries(raw) };
  return cache.list;
}

/** Save the entries. False when the browser wouldn't keep them (a private window, site data off). */
export function saveEntries(list: MyEntry[]): boolean {
  const raw = writeEntries(list);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    return false;
  }
  cache = { raw, list: readEntries(raw) };
  listeners.forEach((l) => l());
  return true;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Your entries, live: empty on the server and while hydrating. */
export function useMyEntries(): MyEntry[] {
  return useSyncExternalStore(subscribe, loadEntries, () => EMPTY);
}
