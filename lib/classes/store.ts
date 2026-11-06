"use client";

// The classes this browser teaches and has joined, kept in localStorage under one key. Stored in
// the same shape the links use (lib/classes/link.ts) and read back through the same checks, so a
// hand-edited or half-written entry can't break a page. Storage can be refused (a private window,
// site data blocked): reads then come back empty and writes say they didn't stick.
// The operations are plain functions from one book to the next, so they can be tested without a
// browser: load the book, apply one, save what comes back.
import { useSyncExternalStore } from "react";
import { classWire, isId, isJobId, readClass, readReport, reportWire, toBase64Url, LIMITS, type ClassWire, type ReportWire } from "./link";
import type { ClassBook, ClassInfo, JoinedClass, Report, TaughtClass } from "./types";

const KEY = "ppc-classes";

interface Stored {
  v: 1;
  me: string;
  teaching: { role: TaughtClass["role"]; createdAt: number; c: ClassWire; r: ReportWire[] }[];
  joined: { joinedAt: number; build: Record<string, string>; c: ClassWire }[];
}

export const EMPTY_BOOK: ClassBook = Object.freeze({ me: "", teaching: [], joined: [] }) as ClassBook;

/** A random id for a class or a student: 16 base64url characters (96 random bits). */
export function newId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

const stamp = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x > 0 ? x : 0);

// ---------------------------------------------------------------- reading and writing

export function readBook(raw: string | null): ClassBook {
  if (!raw) return EMPTY_BOOK;
  let data: Partial<Stored>;
  try {
    data = JSON.parse(raw) as Partial<Stored>;
  } catch {
    return EMPTY_BOOK;
  }
  if (!data || typeof data !== "object") return EMPTY_BOOK;
  const teaching: TaughtClass[] = [];
  for (const t of Array.isArray(data.teaching) ? data.teaching : []) {
    const cls = readClass(t?.c);
    if (!cls || teaching.some((x) => x.id === cls.id)) continue;
    const register = (Array.isArray(t.r) ? t.r : [])
      .slice(0, LIMITS.register)
      .map(readReport)
      .filter((r): r is Report => r !== null && r.classId === cls.id);
    teaching.push({ ...cls, role: t.role === "co-teacher" ? "co-teacher" : "teacher", createdAt: stamp(t.createdAt), register });
  }
  const joined: JoinedClass[] = [];
  for (const j of Array.isArray(data.joined) ? data.joined : []) {
    const cls = readClass(j?.c);
    if (!cls || joined.some((x) => x.id === cls.id)) continue;
    const build: Record<string, string> = {};
    if (j.build && typeof j.build === "object")
      for (const [jobId, step] of Object.entries(j.build)) if (isJobId(jobId) && typeof step === "string" && /^[a-z0-9-]{1,60}$/.test(step)) build[jobId] = step;
    joined.push({ ...cls, joinedAt: stamp(j.joinedAt), build });
  }
  return { me: isId(data.me) ? data.me : "", teaching, joined };
}

export function writeBook(book: ClassBook): string {
  const stored: Stored = {
    v: 1,
    me: book.me,
    teaching: book.teaching.map((t) => ({ role: t.role, createdAt: t.createdAt, c: classWire(t), r: t.register.map(reportWire) })),
    joined: book.joined.map((j) => ({ joinedAt: j.joinedAt, build: j.build, c: classWire(j) })),
  };
  return JSON.stringify(stored);
}

// ---------------------------------------------------------------- operations

const info = (c: ClassInfo): ClassInfo => ({ id: c.id, name: c.name, teacher: c.teacher, assignments: c.assignments, updatedAt: c.updatedAt });

/** Add or replace a class this browser teaches. */
export function putTaught(book: ClassBook, cls: TaughtClass): ClassBook {
  const others = book.teaching.filter((t) => t.id !== cls.id);
  return { ...book, teaching: [...others, cls].sort((a, b) => a.createdAt - b.createdAt) };
}

export function dropTaught(book: ClassBook, id: string): ClassBook {
  return { ...book, teaching: book.teaching.filter((t) => t.id !== id) };
}

/** Join a class, or bring in its newer projects if already in it. */
export function putJoined(book: ClassBook, cls: ClassInfo, build: Record<string, string>, now = Date.now()): { book: ClassBook; result: "joined" | "updated" } {
  const before = book.joined.find((j) => j.id === cls.id);
  const next: JoinedClass = { ...info(cls), joinedAt: before?.joinedAt || now, build };
  const others = book.joined.filter((j) => j.id !== cls.id);
  return { book: { ...book, joined: [...others, next].sort((a, b) => a.joinedAt - b.joinedAt) }, result: before ? "updated" : "joined" };
}

export function dropJoined(book: ClassBook, id: string): ClassBook {
  return { ...book, joined: book.joined.filter((j) => j.id !== id) };
}

export type AddResult = "added" | "replaced" | "same" | "older" | "no-class";

/** Keep a report in its class's register: the latest one from each student replaces the one before. */
export function putReport(book: ClassBook, report: Report): { book: ClassBook; result: AddResult } {
  const cls = book.teaching.find((t) => t.id === report.classId);
  if (!cls) return { book, result: "no-class" };
  const before = cls.register.find((r) => r.student.id === report.student.id);
  if (before && before.sentAt === report.sentAt) return { book, result: "same" };
  if (before && before.sentAt > report.sentAt) return { book, result: "older" };
  const register = [...cls.register.filter((r) => r.student.id !== report.student.id), report].slice(-LIMITS.register);
  return { book: putTaught(book, { ...cls, register }), result: before ? "replaced" : "added" };
}

export function dropStudent(book: ClassBook, classId: string, studentId: string): ClassBook {
  const cls = book.teaching.find((t) => t.id === classId);
  return cls ? putTaught(book, { ...cls, register: cls.register.filter((r) => r.student.id !== studentId) }) : book;
}

/** Two registers as one: each student's latest report. */
export function mergeRegister(a: Report[], b: Report[]): Report[] {
  const out = new Map<string, Report>();
  for (const r of [...a, ...b]) {
    const have = out.get(r.student.id);
    if (!have || r.sentAt > have.sentAt) out.set(r.student.id, r);
  }
  return [...out.values()].slice(-LIMITS.register);
}

/** A class from a co-teacher link: added, or merged with the copy already here (the newer projects, every student's latest report). */
export function putCoTeach(book: ClassBook, cls: ClassInfo, register: Report[], now = Date.now()): { book: ClassBook; result: "added" | "merged" } {
  const before = book.teaching.find((t) => t.id === cls.id);
  if (!before) return { book: putTaught(book, { ...info(cls), role: "co-teacher", createdAt: now, register: mergeRegister([], register) }), result: "added" };
  const newer = cls.updatedAt > before.updatedAt ? info(cls) : info(before);
  return { book: putTaught(book, { ...before, ...newer, register: mergeRegister(before.register, register) }), result: "merged" };
}

/** This browser's student id, made the first time. */
export function withMe(book: ClassBook): ClassBook {
  return book.me ? book : { ...book, me: newId() };
}

// ---------------------------------------------------------------- the browser's copy

let cache: { raw: string | null; book: ClassBook } | null = null;
const listeners = new Set<() => void>();

function rawNow(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The book as saved now. The same object until something changes, as useSyncExternalStore needs. */
export function loadBook(): ClassBook {
  if (typeof window === "undefined") return EMPTY_BOOK;
  const raw = rawNow();
  if (cache && cache.raw === raw) return cache.book;
  cache = { raw, book: readBook(raw) };
  return cache.book;
}

/** Save the book (the result of one of the operations above). False when the browser wouldn't keep it. */
export function saveBook(book: ClassBook): boolean {
  const raw = writeBook(book);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    return false;
  }
  cache = { raw, book: readBook(raw) };
  listeners.forEach((l) => l());
  return true;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  // Another tab changed it.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** The classes, live: empty on the server and while hydrating, then this browser's. */
export function useClassBook(): ClassBook {
  return useSyncExternalStore(subscribe, loadBook, () => EMPTY_BOOK);
}

/** This browser's student id, saved the first time it's asked for. */
export function myId(): string {
  const book = loadBook();
  if (book.me) return book.me;
  const next = withMe(book);
  saveBook(next);
  return next.me;
}
