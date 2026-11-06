// Links that carry something someone made, for anyone to open, with no server to ask: a
// certificate (/certificate/#...), one shipped project or the whole Shelf (/share/#...). Like the
// class links (lib/classes/link.ts) the data is JSON, deflated, then base64url, behind a version
// number ("#1.eJy..."), and decoding trusts nothing: every field is checked, text is cleaned and
// capped, and a link that doesn't read says why. These links have a version of their own, so a
// change to the class links never breaks a certificate someone printed. Nothing here is signed:
// a link shows what it says, and the pages that open them say so.
import { Inflate, deflateSync, strFromU8, strToU8 } from "fflate";
import type { AvatarLook } from "./avatar";
import { isCast, type CastId } from "./playas";
import { capCode, cleanHash, fromBase64Url, isDay, isJobId, line, lookWire, readLook, toBase64Url } from "./classes/link";

export const SHARE_VERSION = 1;

export type ShareKind = "cert" | "project" | "shelf";
export type ShareProblem = "empty" | "broken" | "newer" | "too-long" | "wrong-kind";
export type ShareDecoded<T> = { ok: true; value: T } | { ok: false; problem: ShareProblem; kind?: ShareKind };

/** Where each kind opens, under the site's base path. */
export const SHARE_PATH: Record<ShareKind, string> = { cert: "/certificate/", project: "/share/", shelf: "/share/" };

/** An absolute link to share: `origin` and `base` from the page that makes it (location.origin, BASE). */
export const shareUrl = (origin: string, base: string, kind: ShareKind, hash: string) => `${origin}${base}${SHARE_PATH[kind]}#${hash}`;

export const SHARE_LIMITS = {
  /** Characters in the hash. */
  hash: 120_000,
  /** Bytes once inflated. */
  json: 600_000,
  name: 60,
  files: 10,
  fileName: 80,
  fileChars: 20_000,
  shelf: 200,
  act: 20,
  projects: 500,
} as const;

/** A shared project's link aims to stay under this many characters; its code is cut until it does. */
export const PROJECT_TARGET = 16_000;
/** The same for a whole Shelf: code is left out, biggest first, until it fits. */
export const SHELF_TARGET = 16_000;

// ---------------------------------------------------------------- packing

export function packShare(value: unknown): string {
  return `${SHARE_VERSION}.${toBase64Url(deflateSync(strToU8(JSON.stringify(value)), { level: 9 }))}`;
}

/** Inflate, stopping as soon as the output passes `max` bytes, so a tiny link can't unpack into gigabytes. */
export function inflateCapped(bytes: Uint8Array, max: number): Uint8Array | null {
  if (bytes.length === 0) return null;
  const parts: Uint8Array[] = [];
  let total = 0;
  const inflater = new Inflate((chunk) => {
    total += chunk.length;
    if (total > max) throw new Error("too big");
    parts.push(chunk);
  });
  try {
    for (let i = 0; i < bytes.length; i += 256) inflater.push(bytes.subarray(i, i + 256), i + 256 >= bytes.length);
  } catch {
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

export function unpackShare(raw: string): { ok: true; value: unknown } | { ok: false; problem: ShareProblem } {
  const hash = cleanHash(raw);
  if (!hash) return { ok: false, problem: "empty" };
  if (hash.length > SHARE_LIMITS.hash) return { ok: false, problem: "too-long" };
  const m = /^(\d{1,4})\.([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return { ok: false, problem: "broken" };
  const version = Number(m[1]);
  if (version > SHARE_VERSION) return { ok: false, problem: "newer" };
  if (version < 1) return { ok: false, problem: "broken" };
  const bytes = fromBase64Url(m[2]!);
  if (!bytes) return { ok: false, problem: "broken" };
  const json = inflateCapped(bytes, SHARE_LIMITS.json);
  if (!json) return { ok: false, problem: "broken" };
  try {
    return { ok: true, value: JSON.parse(strFromU8(json)) as unknown };
  } catch {
    return { ok: false, problem: "broken" };
  }
}

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);
const HIDDEN = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g;
const cut = (s: string, max: number) => (s.length <= max ? s : [...s].slice(0, max).join(""));
const time = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) && x > 0 && x < 1e13 ? Math.floor(x) : null);
const whole = (x: unknown, min: number, max: number): number | null => (typeof x === "number" && Number.isInteger(x) && x >= min && x <= max ? x : null);

function codeText(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  return cut(x.replace(/\r\n?/g, "\n").replace(HIDDEN, ""), max);
}

const isFileName = (x: unknown): x is string => typeof x === "string" && x.length <= SHARE_LIMITS.fileName && /^[A-Za-z0-9_][A-Za-z0-9_.\/-]*$/.test(x) && !x.includes("..");

// ---------------------------------------------------------------- who made it

/** Who made it: their name, who they play as (a cast id, or null for someone of their own), and their own look. */
export interface Maker {
  name: string;
  playAs: CastId | null;
  look: AvatarLook | null;
}

type MakerWire = [string, string | 0, (string | number)[] | 0];

export function makerWire(m: Maker): MakerWire {
  // Playing as one of the class, they're drawn as that classmate: their own look isn't needed.
  return [line(m.name, SHARE_LIMITS.name) ?? "", m.playAs ?? 0, m.playAs ? 0 : lookWire(m.look)];
}

function readMaker(x: unknown): Maker | null {
  if (!Array.isArray(x) || x.length !== 3) return null;
  const [name, playAs, look] = x as unknown[];
  const shown = line(name, SHARE_LIMITS.name);
  if (shown === null) return null;
  return { name: shown || "A learner", playAs: typeof playAs === "string" && isCast(playAs) ? playAs : null, look: readLook(look) };
}

/** "Playing as Neil" for someone playing as one of the class under another name; null when it's just them. */
export function playingAsLine(m: Maker, names: Record<string, string>): string | null {
  if (!m.playAs) return null;
  const cast = names[m.playAs] ?? m.playAs.charAt(0).toUpperCase() + m.playAs.slice(1);
  return cast.toLowerCase() === m.name.toLowerCase() ? null : `Playing as ${cast}`;
}

// ---------------------------------------------------------------- certificates

export interface CertificateLink {
  maker: Maker;
  /** The Act's number, 1 to 9. */
  act: number;
  /** The Act's main projects, all shipped. */
  projects: number;
  /** The day the Act was finished: "2026-11-06". */
  day: string;
}

export const encodeCertificate = (c: CertificateLink) => packShare({ k: "cert", m: makerWire(c.maker), a: c.act, p: c.projects, d: c.day });

function readCertificate(b: Obj): CertificateLink | null {
  const maker = readMaker(b.m);
  const act = whole(b.a, 1, SHARE_LIMITS.act);
  const projects = whole(b.p, 1, SHARE_LIMITS.projects);
  if (!maker || act === null || projects === null || !isDay(b.d)) return null;
  return { maker, act, projects, day: b.d };
}

// ---------------------------------------------------------------- a project, and the Shelf

export interface SharedFile {
  name: string;
  content: string;
}

export interface ProjectLink {
  maker: Maker;
  jobId: string;
  shippedAt: number | null;
  files: SharedFile[];
  /** Some of the code was cut short to keep the link a sensible length. */
  cut: boolean;
}

export interface ShelfEntry {
  jobId: string;
  shippedAt: number | null;
  /** The code, when it fitted in the link. */
  files: SharedFile[] | null;
}

export interface ShelfLink {
  maker: Maker;
  items: ShelfEntry[];
}

type FileWire = [string, string];
const filesWire = (files: SharedFile[]): FileWire[] => files.map((f) => [f.name, f.content]);

function readFiles(x: unknown): SharedFile[] | null {
  if (!Array.isArray(x)) return null;
  const out: SharedFile[] = [];
  for (const f of x.slice(0, SHARE_LIMITS.files)) {
    if (!Array.isArray(f) || f.length !== 2 || !isFileName(f[0])) return null;
    const content = codeText(f[1], SHARE_LIMITS.fileChars);
    if (content === null) return null;
    if (!out.some((o) => o.name === f[0])) out.push({ name: f[0], content });
  }
  return out;
}

const projectWire = (p: ProjectLink) => ({ k: "project", m: makerWire(p.maker), j: p.jobId, t: p.shippedAt ?? 0, f: filesWire(p.files), c: p.cut ? 1 : 0 });

function readProject(b: Obj): ProjectLink | null {
  const maker = readMaker(b.m);
  const files = readFiles(b.f);
  if (!maker || !isJobId(b.j) || !files) return null;
  return { maker, jobId: b.j, shippedAt: time(b.t), files, cut: b.c === 1 };
}

const size = (files: SharedFile[]) => files.reduce((n, f) => n + f.content.length, 0);

/** A shared project's hash: each file capped, then the biggest cut by half until the link fits `target`. */
export function encodeProject(p: ProjectLink, target = PROJECT_TARGET): { hash: string; cut: boolean } {
  let files = p.files.slice(0, SHARE_LIMITS.files).map((f) => ({ ...f, content: capCode(f.content) }));
  let cutShort = p.cut || files.some((f, i) => f.content !== p.files[i]!.content);
  let hash = packShare(projectWire({ ...p, files, cut: cutShort }));
  while (hash.length > target) {
    const biggest = files.reduce((a, f, i) => (f.content.length > files[a]!.content.length ? i : a), 0);
    const f = files[biggest];
    if (!f || f.content.length < 400) break;
    files = files.map((x, i) => (i === biggest ? { ...x, content: capCode(x.content, Math.floor(x.content.length / 2)) } : x));
    cutShort = true;
    hash = packShare(projectWire({ ...p, files, cut: cutShort }));
  }
  return { hash, cut: cutShort };
}

const shelfWire = (s: ShelfLink) => ({ k: "shelf", m: makerWire(s.maker), s: s.items.map((i) => [i.jobId, i.shippedAt ?? 0, i.files ? filesWire(i.files) : 0]) });

function readShelf(b: Obj): ShelfLink | null {
  const maker = readMaker(b.m);
  if (!maker || !Array.isArray(b.s)) return null;
  const items: ShelfEntry[] = [];
  for (const x of b.s.slice(0, SHARE_LIMITS.shelf)) {
    if (!Array.isArray(x) || x.length !== 3 || !isJobId(x[0])) return null;
    const files = x[2] === 0 || x[2] === null ? null : readFiles(x[2]);
    if (x[2] !== 0 && x[2] !== null && files === null) return null;
    if (!items.some((i) => i.jobId === x[0])) items.push({ jobId: x[0], shippedAt: time(x[1]), files });
  }
  return { maker, items };
}

/** The whole Shelf's hash: every project listed, with code where it fits, leaving out the biggest first. `leftOut` counts the projects whose code didn't fit. */
export function encodeShelf(s: ShelfLink, target = SHELF_TARGET): { hash: string; leftOut: number } {
  const items = s.items.slice(0, SHARE_LIMITS.shelf).map((i) => ({ ...i, files: i.files ? i.files.slice(0, SHARE_LIMITS.files).map((f) => ({ ...f, content: capCode(f.content) })) : null }));
  let hash = packShare(shelfWire({ ...s, items }));
  while (hash.length > target) {
    let at = -1;
    for (let i = 0; i < items.length; i++) if (items[i]!.files && (at < 0 || size(items[i]!.files!) > size(items[at]!.files!))) at = i;
    if (at < 0) break;
    items[at] = { ...items[at]!, files: null };
    hash = packShare(shelfWire({ ...s, items }));
  }
  return { hash, leftOut: items.filter((i, k) => !i.files && s.items[k]!.files).length };
}

// ---------------------------------------------------------------- reading a link

export type Shared = { kind: "cert"; value: CertificateLink } | { kind: "project"; value: ProjectLink } | { kind: "shelf"; value: ShelfLink };

/** Any of the three. `want` says which kinds the page opens; another kind reads as "wrong-kind". */
export function decodeShare(raw: string, want: ShareKind[]): ShareDecoded<Shared> {
  const got = unpackShare(raw);
  if (!got.ok) return got;
  if (!isObj(got.value)) return { ok: false, problem: "broken" };
  const k = got.value.k;
  if (k !== "cert" && k !== "project" && k !== "shelf") return { ok: false, problem: "broken" };
  if (!want.includes(k)) return { ok: false, problem: "wrong-kind", kind: k };
  const b = got.value;
  const value = k === "cert" ? readCertificate(b) : k === "project" ? readProject(b) : readShelf(b);
  if (!value) return { ok: false, problem: "broken" };
  return { ok: true, value: { kind: k, value } as Shared };
}
