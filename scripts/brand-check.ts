// The rebrand test (REDESIGN.md 1.2): fails if either old name survives in what ships.
// Scans the production build (.next), the compiled content and everything in public/
// (Pyodide's own files excepted). Run after `npm run build`:  npx tsx scripts/brand-check.ts
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const OLD = /saltmarsh|paul('|&apos;|&#x27;|&#39;|’|\\u0027)?s python course|pauls-python-course/i;
const TARGETS = [".next/server", ".next/static", "generated", "public"];
const SKIP = [path.join("public", "pyodide"), path.join(".next", "cache")];
const TEXT = /\.(js|mjs|cjs|json|html|css|txt|rsc|map|py|md|svg|xml|webmanifest)$/;

const hits: string[] = [];
let scanned = 0;

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(root, p);
    if (SKIP.some((s) => rel.startsWith(s))) continue;
    if (e.isDirectory()) walk(p);
    else if (TEXT.test(e.name) || !path.extname(e.name)) {
      const text = fs.readFileSync(p, "utf8");
      scanned++;
      const m = text.match(OLD);
      if (m) {
        const at = m.index ?? 0;
        hits.push(`${rel}: "${text.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ")}"`);
      }
    }
  }
}

if (!fs.existsSync(path.join(root, ".next", "server"))) {
  console.error("No production build found. Run `npm run build` first.");
  process.exit(1);
}
for (const t of TARGETS) walk(path.join(root, t));

if (hits.length) {
  console.log(hits.slice(0, 50).join("\n"));
  console.log(`\nOld names found in ${hits.length} built files.`);
  process.exit(1);
}
console.log(`Brand check: ${scanned} built files, no old names.`);
