// The class links (app/class): a join link, a progress link and a co-teacher link, each carrying
// its data in the hash, since a static export has one page per path and no server to ask. The
// data is JSON, deflated (fflate), then base64url, behind a version number: "#1.eJy...". Links
// arrive from anywhere, so decoding trusts nothing: every field is checked, text is cleaned and
// capped, lists are capped, and a link that doesn't read says why (broken, old or newer). Nothing
// decoded here is ever treated as HTML; the pages show it as text.
import { Inflate, deflateSync, strFromU8, strToU8 } from "fflate";
import { ACCESSORIES, AVATAR_COLOURS, BROWS, FACES, HAIR_COLOURS, HAIR_STYLES, SKIN_TONES, TOPS, TOP_COLOURS, defaultAvatar, type AvatarLook } from "../avatar";
import { isCast } from "../playas";
import type { JobStatus } from "../store/types";
import type { Assignment, ClassInfo, CodeFile, ProjectReport, Report, Student } from "./types";

export const LINK_VERSION = 1;

/** What a decoded link may hold. Longer text is cut to these; longer lists lose their tail. */
export const LIMITS = {
  /** Characters in the hash. */
  hash: 200_000,
  /** Bytes once inflated. */
  json: 1_000_000,
  className: 80,
  teacher: 40,
  studentName: 40,
  note: 280,
  assignments: 50,
  projects: 50,
  files: 10,
  fileName: 80,
  fileChars: 20_000,
  register: 100,
  count: 10_000,
  seconds: 100_000_000,
} as const;

/** Each file's code is cut to this before a progress link is made. */
export const CODE_CAP = 6_000;
/** A progress link's hash aims to stay under this; code is left out, biggest first, until it does. */
export const REPORT_TARGET = 8_000;
/** The same for a co-teacher link, which carries the whole register. */
export const TEACH_TARGET = 30_000;

export type LinkKind = "join" | "report" | "teach";
export type LinkProblem = "empty" | "broken" | "old" | "newer" | "too-long" | "wrong-kind";
export type Decoded<T> = { ok: true; value: T } | { ok: false; problem: LinkProblem; kind?: LinkKind };

/** Where each kind of link opens, under the site's base path. */
export const LINK_PATH: Record<LinkKind, string> = { join: "/class/join/", report: "/class/report/", teach: "/class/teach/" };

/** An absolute link to share: `origin` and `base` from the page that makes it (location.origin, BASE). */
export const linkUrl = (origin: string, base: string, kind: LinkKind, hash: string) => `${origin}${base}${LINK_PATH[kind]}#${hash}`;

// ---------------------------------------------------------------- base64url

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const LOOKUP = new Map([...ALPHABET].map((c, i) => [c, i]));

export function toBase64Url(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += ALPHABET[a >> 2]! + ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)]!;
    if (b !== undefined) out += ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)]!;
    if (c !== undefined) out += ALPHABET[c & 63]!;
  }
  return out;
}

export function fromBase64Url(text: string): Uint8Array | null {
  if (text.length % 4 === 1) return null;
  const out = new Uint8Array(Math.floor((text.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < text.length; i += 4) {
    const n = [0, 1, 2, 3].map((k) => (i + k < text.length ? LOOKUP.get(text[i + k]!) : 0));
    if (n.some((x) => x === undefined)) return null;
    const [a, b, c, d] = n as number[];
    out[o++] = (a! << 2) | (b! >> 4);
    if (i + 2 < text.length) out[o++] = ((b! & 15) << 4) | (c! >> 2);
    if (i + 3 < text.length) out[o++] = ((c! & 3) << 6) | d!;
  }
  return out;
}

// ---------------------------------------------------------------- packing

/** JSON, deflated, base64url, with the version in front. */
export function pack(value: unknown): string {
  return `${LINK_VERSION}.${toBase64Url(deflateSync(strToU8(JSON.stringify(value)), { level: 9 }))}`;
}

/** Inflate, stopping as soon as the output passes `max` bytes (so a tiny link can't unpack into gigabytes). */
function inflateCapped(bytes: Uint8Array, max: number): Uint8Array | null {
  if (bytes.length === 0) return null;
  const parts: Uint8Array[] = [];
  let total = 0;
  const inflater = new Inflate((chunk) => {
    total += chunk.length;
    if (total > max) throw new Error("too big");
    parts.push(chunk);
  });
  try {
    // Small pieces in, so no single push can produce much more than the cap.
    for (let i = 0; i < bytes.length; i += 256) inflater.push(bytes.subarray(i, i + 256), i + 256 >= bytes.length);
  } catch {
    // Too big, cut short, or not deflate at all.
    return null;
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** The hash as it arrives: with or without "#", maybe wrapped by an email or with a full stop after it. */
export function cleanHash(raw: string): string {
  return raw
    .replace(/^#/, "")
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9_-]+$/, "");
}

export function unpack(raw: string): { ok: true; value: unknown } | { ok: false; problem: LinkProblem } {
  const hash = cleanHash(raw);
  if (!hash) return { ok: false, problem: "empty" };
  if (hash.length > LIMITS.hash) return { ok: false, problem: "too-long" };
  const m = /^(\d{1,4})\.([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return { ok: false, problem: "broken" };
  const version = Number(m[1]);
  if (version > LINK_VERSION) return { ok: false, problem: "newer" };
  if (version < LINK_VERSION) return { ok: false, problem: "old" };
  const bytes = fromBase64Url(m[2]!);
  if (!bytes) return { ok: false, problem: "broken" };
  const json = inflateCapped(bytes, LIMITS.json);
  if (!json) return { ok: false, problem: "broken" };
  try {
    return { ok: true, value: JSON.parse(strFromU8(json)) as unknown };
  } catch {
    return { ok: false, problem: "broken" };
  }
}

// ---------------------------------------------------------------- checking what came in

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);

/** Control characters, zero-width and direction marks: nothing a name or a note needs. */
const HIDDEN = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g;

const cut = (s: string, max: number) => (s.length <= max ? s : [...s].slice(0, max).join(""));

/** One line of text: cleaned, spaces squeezed, cut to `max`. Null when it isn't text at all. */
export function line(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  return cut(x.replace(HIDDEN, "").replace(/\s+/g, " ").trim(), max).trim();
}

/** Code: tabs and new lines kept, hidden characters gone, cut to `max`. */
function codeText(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  return cut(x.replace(/\r\n?/g, "\n").replace(HIDDEN, ""), max);
}

export const ID = /^[A-Za-z0-9_-]{8,40}$/;
export const isId = (x: unknown): x is string => typeof x === "string" && ID.test(x);
export const isJobId = (x: unknown): x is string => typeof x === "string" && x.length <= 60 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(x);
const isFileName = (x: unknown): x is string => typeof x === "string" && x.length <= LIMITS.fileName && /^[A-Za-z0-9_][A-Za-z0-9_.\/-]*$/.test(x) && !x.includes("..");

/** "2026-11-20", a real day. */
export function isDay(x: unknown): x is string {
  if (typeof x !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return y >= 2000 && y <= 2100 && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** A due day as the ms that lib/teaching.ts reads: midday UTC. */
export const dayMs = (day: string) => Date.parse(`${day}T12:00:00Z`);

const time = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x < 1e13 ? Math.floor(x) : null);
/** A whole number from 0, held to `max`. Null when it isn't a number. */
const count = (x: unknown, max: number): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.min(Math.floor(x), max) : null);

const STATUSES: JobStatus[] = ["not-started", "in-progress", "shipped", "shipped-stretch", "placed"];
const isStatus = (x: unknown): x is JobStatus => typeof x === "string" && (STATUSES as string[]).includes(x);

// The look travels as its option ids in order; anything that isn't a known option reads as the default.
const LOOK_FIELDS: { key: keyof AvatarLook; options?: { id: string }[] }[] = [
  { key: "colour", options: AVATAR_COLOURS },
  { key: "face", options: FACES },
  { key: "skin", options: SKIN_TONES },
  { key: "hair", options: HAIR_STYLES },
  { key: "hairColour", options: HAIR_COLOURS },
  { key: "brows", options: BROWS },
  { key: "glasses" },
  { key: "facialHair" },
  { key: "top", options: TOPS },
  { key: "topColour", options: TOP_COLOURS },
  { key: "accessory", options: ACCESSORIES },
];

/** A saved look (profile.character) as a list of option ids, or 0 for none. */
export function lookWire(look: unknown): (string | number)[] | 0 {
  if (!isObj(look) || look.kind !== "human") return 0;
  return LOOK_FIELDS.map((f) => (f.options ? (typeof look[f.key] === "string" ? (look[f.key] as string) : "") : look[f.key] ? 1 : 0));
}

export function readLook(x: unknown): AvatarLook | null {
  if (!Array.isArray(x) || x.length !== LOOK_FIELDS.length) return null;
  const look: AvatarLook = defaultAvatar();
  const out = look as unknown as Record<string, unknown>;
  LOOK_FIELDS.forEach((f, i) => {
    const v = x[i];
    if (f.options) {
      if (typeof v === "string" && f.options.some((o) => o.id === v)) out[f.key] = v;
    } else out[f.key] = v === 1 || v === true;
  });
  return look;
}

// ---------------------------------------------------------------- the class

export type ClassWire = { i: string; n: string; t: string; u: number; a: [string, string | null, string][] };

export function classWire(c: ClassInfo): ClassWire {
  return { i: c.id, n: c.name, t: c.teacher, u: c.updatedAt, a: c.assignments.map((a) => [a.jobId, a.due, a.note]) };
}

export function readClass(x: unknown): ClassInfo | null {
  if (!isObj(x) || !isId(x.i) || !Array.isArray(x.a)) return null;
  const name = line(x.n, LIMITS.className);
  const teacher = line(x.t, LIMITS.teacher);
  if (!name || !teacher) return null;
  const assignments: Assignment[] = [];
  const seen = new Set<string>();
  for (const a of x.a.slice(0, LIMITS.assignments)) {
    if (!Array.isArray(a)) return null;
    const [jobId, due, note] = a as unknown[];
    if (!isJobId(jobId)) return null;
    if (due !== null && due !== undefined && !isDay(due)) return null;
    const words = note === undefined || note === null ? "" : line(note, LIMITS.note);
    if (words === null) return null;
    if (seen.has(jobId)) continue;
    seen.add(jobId);
    assignments.push({ jobId, due: due ?? null, note: words });
  }
  return { id: x.i, name, teacher, assignments, updatedAt: time(x.u) ?? 0 };
}

// ---------------------------------------------------------------- a student's progress

type ProjectWire = [string, JobStatus, number, number, number, number, number, number | null, 0 | 1, [string, string][]];
export type ReportWire = { c: string; cn: string; t: string; s: [string, string, (string | number)[] | 0, string | 0]; at: number; sh: number; p: ProjectWire[] };

export function reportWire(r: Report): ReportWire {
  return {
    c: r.classId,
    cn: r.className,
    t: r.teacher,
    s: [r.student.id, r.student.name, lookWire(r.student.character), r.student.playAs ?? 0],
    at: r.sentAt,
    sh: r.shipped,
    p: r.projects.map((p) => [p.jobId, p.status, p.passed, p.seen, p.total, p.hints, p.seconds, p.lastWorked, p.codeLeftOut ? 1 : 0, p.code.map((f) => [f.name, f.content])]),
  };
}

function readStudent(x: unknown): Student | null {
  if (!Array.isArray(x) || x.length !== 4) return null;
  const [id, name, look, playAs] = x as unknown[];
  if (!isId(id)) return null;
  const shown = line(name, LIMITS.studentName);
  if (shown === null) return null;
  return { id, name: shown || "A student", character: readLook(look), playAs: typeof playAs === "string" && isCast(playAs) ? playAs : null };
}

function readProject(x: unknown): ProjectReport | null {
  if (!Array.isArray(x) || x.length !== 10) return null;
  const [jobId, status, passed, seen, total, hints, seconds, last, leftOut, files] = x as unknown[];
  if (!isJobId(jobId) || !isStatus(status) || !Array.isArray(files)) return null;
  const nums = [count(passed, 500), count(seen, 500), count(total, 500), count(hints, LIMITS.count), count(seconds, LIMITS.seconds)];
  if (nums.some((n) => n === null)) return null;
  const [p, s, t, h, secs] = nums as number[];
  const code: CodeFile[] = [];
  for (const f of files.slice(0, LIMITS.files)) {
    if (!Array.isArray(f) || f.length !== 2 || !isFileName(f[0])) return null;
    const content = codeText(f[1], LIMITS.fileChars);
    if (content === null) return null;
    code.push({ name: f[0], content });
  }
  return {
    jobId,
    status,
    // Never more passed than there are steps (when the total is known).
    passed: t! > 0 ? Math.min(p!, t!) : p!,
    seen: s!,
    total: t!,
    hints: h!,
    seconds: secs!,
    lastWorked: last === null || last === undefined || last === 0 ? null : time(last),
    code,
    codeLeftOut: leftOut === 1 || leftOut === true,
  };
}

export function readReport(x: unknown): Report | null {
  if (!isObj(x) || !isId(x.c) || !Array.isArray(x.p)) return null;
  const className = line(x.cn, LIMITS.className);
  const teacher = line(x.t, LIMITS.teacher);
  const student = readStudent(x.s);
  const sentAt = time(x.at);
  const shipped = count(x.sh, LIMITS.count);
  if (!className || !teacher || !student || sentAt === null || shipped === null) return null;
  const projects: ProjectReport[] = [];
  const seen = new Set<string>();
  for (const p of x.p.slice(0, LIMITS.projects)) {
    const read = readProject(p);
    if (!read) return null;
    if (seen.has(read.jobId)) continue;
    seen.add(read.jobId);
    projects.push(read);
  }
  return { classId: x.c, className, teacher, student, sentAt, shipped, projects };
}

// ---------------------------------------------------------------- the three links

function decode<T>(raw: string, kind: LinkKind, read: (body: Obj) => T | null): Decoded<T> {
  const got = unpack(raw);
  if (!got.ok) return got;
  if (!isObj(got.value)) return { ok: false, problem: "broken" };
  const k = got.value.k;
  if (k !== kind) return k === "join" || k === "report" || k === "teach" ? { ok: false, problem: "wrong-kind", kind: k } : { ok: false, problem: "broken" };
  const value = read(got.value);
  return value === null ? { ok: false, problem: "broken" } : { ok: true, value };
}

export const encodeJoin = (c: ClassInfo) => pack({ k: "join", c: classWire(c) });
export const decodeJoin = (raw: string): Decoded<ClassInfo> => decode(raw, "join", (b) => readClass(b.c));

export const encodeReport = (r: Report) => pack({ k: "report", r: reportWire(r) });
export const decodeReport = (raw: string): Decoded<Report> => decode(raw, "report", (b) => readReport(b.r));

export interface CoTeach {
  cls: ClassInfo;
  register: Report[];
}

export const encodeTeach = (cls: ClassInfo, register: Report[]) => pack({ k: "teach", c: classWire(cls), r: register.map(reportWire) });
export const decodeTeach = (raw: string): Decoded<CoTeach> =>
  decode(raw, "teach", (b) => {
    const cls = readClass(b.c);
    if (!cls || !Array.isArray(b.r)) return null;
    const register: Report[] = [];
    for (const r of b.r.slice(0, LIMITS.register)) {
      const read = readReport(r);
      if (!read) return null;
      // A register belongs to its class: anything else in it is dropped.
      if (read.classId === cls.id && !register.some((x) => x.student.id === read.student.id)) register.push(read);
    }
    return { cls, register };
  });

// ---------------------------------------------------------------- keeping links short

/** Code cut to `max` characters, with a line saying so. */
export function capCode(content: string, max = CODE_CAP): string {
  if (content.length <= max) return content;
  return `${content.slice(0, max)}\n\n# (Cut short here to keep the link a sensible length.)`;
}

const codeSize = (p: ProjectReport) => p.code.reduce((n, f) => n + f.content.length, 0);

/** Leave out code, biggest first, until the link fits `target`. */
function fit(projects: ProjectReport[][], make: (projects: ProjectReport[][]) => string, target: number): { hash: string; projects: ProjectReport[][]; leftOut: number } {
  const current = projects.map((list) => list.map((p) => ({ ...p, code: p.code.map((f) => ({ ...f, content: capCode(f.content) })) })));
  let hash = make(current);
  let leftOut = 0;
  while (hash.length > target) {
    let at: [number, number] | null = null;
    let size = 0;
    for (let i = 0; i < current.length; i++)
      for (let j = 0; j < current[i]!.length; j++) {
        const p = current[i]![j]!;
        if (p.code.length && (at === null || codeSize(p) > size)) {
          at = [i, j];
          size = codeSize(p);
        }
      }
    if (at === null) break;
    const [i, j] = at;
    current[i]![j] = { ...current[i]![j]!, code: [], codeLeftOut: true };
    leftOut += 1;
    hash = make(current);
  }
  return { hash, projects: current, leftOut };
}

/** A progress link's hash, with code cut or left out to keep it a sensible length. `leftOut` lists the projects whose code didn't fit. */
export function fitReport(report: Report, target = REPORT_TARGET): { hash: string; report: Report; leftOut: string[] } {
  const done = fit([report.projects], ([projects]) => encodeReport({ ...report, projects: projects! }), target);
  const projects = done.projects[0]!;
  return { hash: done.hash, report: { ...report, projects }, leftOut: projects.filter((p, i) => p.codeLeftOut && !report.projects[i]!.codeLeftOut).map((p) => p.jobId) };
}

/** A co-teacher link's hash, with students' code left out, biggest first, if the register is too long. */
export function fitTeach(cls: ClassInfo, register: Report[], target = TEACH_TARGET): { hash: string; leftOut: number } {
  const done = fit(
    register.map((r) => r.projects),
    (lists) => encodeTeach(cls, register.map((r, i) => ({ ...r, projects: lists[i]! }))),
    target,
  );
  return { hash: done.hash, leftOut: done.leftOut };
}

/** A link's kind without checking the rest: for pointing a link opened on the wrong page to the right one. */
export function kindOf(raw: string): LinkKind | null {
  const got = unpack(raw);
  if (!got.ok || !isObj(got.value)) return null;
  const k = got.value.k;
  return k === "join" || k === "report" || k === "teach" ? k : null;
}
