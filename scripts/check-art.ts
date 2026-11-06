// The art check. Looks at every PNG in art/final/, checks it against its
// entry in art/manifest.json (the exact canvas size, and a transparent background where one is
// required), marks the good ones final, and writes components/art/final.generated.ts so <Art>
// shows them. Then reports which images are still placeholders. Exits 1 on any problem.
//   npx tsx scripts/check-art.ts           check, update the manifest and the generated module
//   npx tsx scripts/check-art.ts --check   check only, and fail if anything is out of date (CI)
//   npx tsx scripts/check-art.ts --list    also list every placeholder by id
import fs from "node:fs";
import path from "node:path";
import { decodePng, pngInfo, type Bitmap } from "../components/art/png";
import { KINDS, canvasFor, fileFor, type ArtKind, type Manifest, type ManifestEntry } from "../components/art/spec";

const root = process.cwd();
const MANIFEST = path.join(root, "art", "manifest.json");
const FINAL_DIR = path.join(root, "art", "final");
const GENERATED = path.join(root, "components", "art", "final.generated.ts");

/** An alpha this low counts as see-through (anti-aliasing leaves a little noise). */
const CLEAR_ALPHA = 8;
/** The top corners, this many pixels square, must be clear on a transparent image. */
const CORNER = 8;
/** And at least this share of the whole canvas. */
const MIN_CLEAR = 0.1;

export interface Transparency {
  /** Both top corners are see-through. */
  cornersClear: boolean;
  /** The share of the canvas that's see-through, 0 to 1. */
  clear: number;
}

export function transparency({ width, height, rgba }: Bitmap): Transparency {
  let clear = 0;
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i]! < CLEAR_ALPHA) clear++;
  const size = Math.min(CORNER, width, height);
  let cornersClear = true;
  for (let y = 0; y < size && cornersClear; y++)
    for (let x = 0; x < size; x++) {
      const left = rgba[(y * width + x) * 4 + 3]!;
      const right = rgba[(y * width + (width - 1 - x)) * 4 + 3]!;
      if (left >= CLEAR_ALPHA || right >= CLEAR_ALPHA) {
        cornersClear = false;
        break;
      }
    }
  return { cornersClear, clear: clear / (width * height) };
}

/** What's wrong with one exported image, or nothing. */
export function checkImage(entry: Pick<ManifestEntry, "size" | "transparent">, png: Uint8Array): string[] {
  let info;
  try {
    info = pngInfo(png);
  } catch (e) {
    return [`can't be read as a PNG (${(e as Error).message})`];
  }
  const problems: string[] = [];
  const { width, height } = entry.size;
  if (info.width !== width || info.height !== height) problems.push(`is ${info.width}x${info.height} pixels; it should be ${width}x${height}`);
  if (entry.transparent) {
    if (!info.hasAlpha) problems.push("has no transparency; export it as a PNG with a transparent background");
    else {
      const t = transparency(decodePng(png));
      if (!t.cornersClear) problems.push("has a background; the top corners should be fully transparent");
      else if (t.clear < MIN_CLEAR) problems.push(`is ${Math.round((1 - t.clear) * 100)}% opaque; everything but the drawing should be transparent`);
    }
  }
  return problems;
}

export interface SyncResult {
  manifest: Manifest;
  /** Problems, each starting with the file or id it's about. */
  problems: string[];
  /** Entries that changed status, as "id: placeholder -> final". */
  changes: string[];
}

/**
 * Brings the manifest up to date with the files in art/final/: a file that passes its checks
 * makes its entry final, and an entry whose file has gone (or now fails) goes back to being a
 * placeholder. `files` maps each file name in art/final/ to its bytes.
 */
export function syncManifest(manifest: Manifest, files: Map<string, Uint8Array>): SyncResult {
  const problems: string[] = [];
  const changes: string[] = [];
  const byFile = new Map(manifest.entries.map((e) => [e.file, e]));
  for (const name of files.keys()) {
    if (!/\.png$/i.test(name)) problems.push(`art/final/${name}: only the PNG exports go in art/final/ (keep the layered sources elsewhere)`);
    else if (!byFile.has(name)) {
      const near = byFile.has(name.toLowerCase()) ? `; did you mean ${name.toLowerCase()}?` : "";
      problems.push(`art/final/${name}: no image in the manifest has this name${near} (see the naming rule in art/README.md)`);
    }
  }
  const entries = manifest.entries.map((e) => {
    const canvas = canvasFor(e.id);
    if (!canvas) problems.push(`${e.id}: not a valid art id`);
    else if (canvas.width !== e.size.width || canvas.height !== e.size.height || e.file !== fileFor(e.id) || e.transparent !== KINDS[e.kind].transparent)
      problems.push(`${e.id}: the manifest is out of date; run npx tsx scripts/build-art-manifest.ts`);
    const png = files.get(e.file);
    let status: ManifestEntry["status"] = "placeholder";
    if (png) {
      const wrong = checkImage(e, png);
      for (const w of wrong) problems.push(`art/final/${e.file} ${w}`);
      if (!wrong.length) status = "final";
    }
    if (status !== e.status) changes.push(`${e.id}: ${e.status} -> ${status}`);
    return { ...e, status };
  });
  return { manifest: { ...manifest, entries }, problems, changes };
}

/** components/art/final.generated.ts: a static import for every final image, so Next.js can optimise it. */
export function generatedModule(entries: ManifestEntry[]): string {
  const finals = entries.filter((e) => e.status === "final").sort((a, b) => a.id.localeCompare(b.id));
  const lines = [
    "// GENERATED by scripts/check-art.ts from art/manifest.json and art/final/. Don't edit: add the",
    "// artist's PNG to art/final/ and run `npx tsx scripts/check-art.ts` (see art/README.md).",
    'import type { StaticImageData } from "next/image";',
    ...finals.map((e, i) => `import img${i} from "@/art/final/${e.file}";`),
    "",
    "/** Every image whose final art has arrived, by art id. */",
    `export const FINAL: Readonly<Record<string, StaticImageData>> = {${finals.length ? "" : "};"}`,
    ...(finals.length ? [...finals.map((e, i) => `  "${e.id}": img${i},`), "};"] : []),
    "",
  ];
  return lines.join("\n");
}

/** The report: what's still a placeholder, kind by kind. */
export function report(entries: ManifestEntry[], list: boolean): string {
  const out: string[] = [];
  const required = entries.filter((e) => e.required);
  const optional = entries.filter((e) => !e.required);
  const done = (xs: ManifestEntry[]) => xs.filter((e) => e.status === "final").length;
  out.push(`Art: ${done(required)} of ${required.length} required images are final, and ${done(optional)} of ${optional.length} optional ones.`);
  for (const kind of Object.keys(KINDS) as ArtKind[]) {
    const all = entries.filter((e) => e.kind === kind);
    const waiting = all.filter((e) => e.status === "placeholder");
    if (!all.length) continue;
    out.push(`  ${KINDS[kind].label}: ${all.length - waiting.length} of ${all.length} final${waiting.length === 1 ? ", 1 still a placeholder" : waiting.length ? `, ${waiting.length} still placeholders` : ""}`);
    if (list && waiting.length) {
      const ids = waiting.map((e) => (e.required ? e.id : `${e.id} (optional)`));
      for (let i = 0; i < ids.length; i += 4) out.push(`      ${ids.slice(i, i + 4).join(", ")}`);
    }
  }
  if (!list && entries.some((e) => e.status === "placeholder")) out.push("  Run with --list to see every placeholder by id.");
  return out.join("\n");
}

function readFinals(): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();
  if (!fs.existsSync(FINAL_DIR)) return files;
  for (const name of fs.readdirSync(FINAL_DIR).sort()) {
    if (name.startsWith(".")) continue;
    const p = path.join(FINAL_DIR, name);
    if (fs.statSync(p).isFile()) files.set(name, fs.readFileSync(p));
  }
  return files;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const checkOnly = args.has("--check");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Manifest;
  const { manifest: next, problems, changes } = syncManifest(manifest, readFinals());
  const generated = generatedModule(next.entries);
  const current = fs.existsSync(GENERATED) ? fs.readFileSync(GENERATED, "utf8") : "";
  if (checkOnly) {
    if (changes.length) problems.push(`art/manifest.json is out of date (${changes.length} statuses); run npx tsx scripts/check-art.ts`);
    if (generated !== current) problems.push("components/art/final.generated.ts is out of date; run npx tsx scripts/check-art.ts");
  } else {
    if (changes.length) fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + "\n");
    if (generated !== current) fs.writeFileSync(GENERATED, generated);
    for (const c of changes) console.log(`  ${c}`);
  }
  console.log(report(next.entries, args.has("--list")));
  if (problems.length) {
    console.log(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
    for (const p of problems) console.log(`  ${p}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) main();
