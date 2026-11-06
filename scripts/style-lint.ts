// The look rules, checked on every
// stylesheet and component: square pixel corners only, hard shadows only (no blur), no gradients,
// glows or backdrop filters, no uppercase tracked labels, no 9-slice frames, no raw colours
// outside tokens.css, and none of the first redesign's old tokens.
//   npx tsx scripts/style-lint.ts              every file
//   npx tsx scripts/style-lint.ts components/x only files under a folder (or several)
import fs from "node:fs";
import path from "node:path";
import { LEGACY } from "./build-tokens";

const root = process.cwd();
const DIRS = ["app", "components"];
const RAW_COLOUR_OK = new Set(["tokens.css"]);
// The temporary aliases for old frames; it goes once nothing uses them.
const SKIP = new Set(["app/legacy.css"]);
const OLD_TOKENS = new Set([...Object.keys(LEGACY), "mask-dots-8", "mask-vline-48", "mask-vline-24", "mask-vline-28", "mask-hband-16", "mask-hband-40", "mask-diag-8", "mask-dot-6"]);

interface Rule {
  name: string;
  test: (decl: string, file: string) => boolean;
}

const prop = (d: string) => d.slice(0, d.indexOf(":")).trim();
const value = (d: string) => d.slice(d.indexOf(":") + 1).trim();

const RULES: Rule[] = [
  { name: "rounded corner (pixel corners are square)", test: (d) => /radius$/.test(prop(d)) && !/^(0|0px|inherit|var\(--r-(sm|md|lg)\))(\s+(0|var\(--r-(sm|md|lg)\)))*$/.test(value(d)) },
  { name: "gradient", test: (d) => /gradient\(/.test(d) },
  { name: "backdrop filter", test: (d) => /^backdrop-filter\s*:/.test(d) },
  { name: "blur or glow", test: (d) => /blur\(|drop-shadow\(/.test(d) },
  { name: "uppercase label", test: (d) => /^text-transform\s*:\s*uppercase/.test(d) },
  { name: "letter-spacing", test: (d) => prop(d) === "letter-spacing" && !/^(normal|0|var\(--tracking-display\)|var\(--prose-letter-spacing\))$/.test(value(d)) },
  {
    // Pixel depth is hard: every shadow's blur is zero.
    name: "soft shadow (pixel shadows have no blur)",
    test: (d) => /^box-shadow\s*:/.test(d) && d.split(/,(?![^(]*\))/).some((part) => /(-?\d+px)\s+(-?\d+px)\s+([1-9]\d*px)/.test(part.replace(/inset\s+/, ""))),
  },
  { name: "serif font", test: (d) => /^font-family\s*:/.test(d) && /(?<!sans-)serif|Source Serif|Literata|Georgia|Times/i.test(d) },
  { name: "9-slice frame (border-image)", test: (d) => /^border-image/.test(d) },
  { name: "raw colour", test: (d, f) => !RAW_COLOUR_OK.has(path.basename(f)) && /^(?!--)[a-z-]+\s*:.*(#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d)/.test(d) },
  {
    name: "old token",
    test: (d) => [...d.matchAll(/var\(--([a-z0-9-]+)/g)].some((m) => OLD_TOKENS.has(m[1]!)),
  },
];

function files(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...files(p, ext));
    else if (ext.test(e.name)) out.push(p);
  }
  return out;
}

const only = process.argv.slice(2).map((a) => path.resolve(root, a));
const inScope = (f: string) => !SKIP.has(path.relative(root, f)) && (!only.length || only.some((o) => f === o || f.startsWith(o + path.sep)));

const sheets = [...DIRS.flatMap((d) => files(path.join(root, d), /\.css$/)), path.join(root, "tokens.css")].filter(inScope);
const problems: string[] = [];
for (const f of sheets) {
  const text = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const lines = text.split("\n");
  // Join each declaration onto one line (box-shadow lists run over several).
  let buf = "";
  let startLine = 0;
  lines.forEach((line, i) => {
    for (const ch of line + "\n") {
      if (ch === "{" || ch === "}") {
        buf = "";
        continue;
      }
      if (!buf.trim()) startLine = i + 1;
      if (ch === ";") {
        const decl = buf.trim().replace(/\s+/g, " ");
        // tokens.css defines the old aliases on purpose, for now.
        for (const r of RULES) if (!(path.basename(f) === "tokens.css" && /old token/.test(r.name)) && r.test(decl, f)) problems.push(`${path.relative(root, f)}:${startLine}  ${r.name}: ${decl}`);
        buf = "";
      } else buf += ch;
    }
  });
}

// Components: no pixel frame classes, no pixel scenes or sprites, no old tokens in inline styles.
const TSX_RULES: { name: string; re: RegExp }[] = [
  { name: "pixel frame class", re: /frame-(panel|paper|dialogue)\b/ },
  { name: "pixel text class", re: /\bpixel-text\b/ },
  { name: "pixel art component", re: /<(SceneCanvas|SpriteFrame|CharacterPortrait|LearnerSprite|LearnerHead|TownMap)\b/ },
  { name: "old token", re: /var\(--(night-[0-4]|chalk|fog|lamp|kelp|brick|sea|plum|day-[a-z0-9]+|font-pixel|pixel-[123]|art-[a-z-]+|shadow-hard|paper[a-z-]*|ink(-[23])?)\)/ },
];
for (const f of DIRS.flatMap((d) => files(path.join(root, d), /\.tsx$/)).filter(inScope)) {
  fs.readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const r of TSX_RULES) if (r.re.test(line)) problems.push(`${path.relative(root, f)}:${i + 1}  ${r.name}: ${line.trim().slice(0, 120)}`);
    });
}

if (problems.length) {
  console.log(problems.join("\n"));
  const byFile = new Map<string, number>();
  for (const p of problems) byFile.set(p.split(":")[0]!, (byFile.get(p.split(":")[0]!) ?? 0) + 1);
  console.log(`\n${problems.length} style problems in ${byFile.size} files.`);
  process.exit(1);
}
console.log(`Style lint: ${sheets.length} stylesheets and the components clean.`);
