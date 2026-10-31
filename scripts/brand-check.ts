// The rebrand test (REDESIGN-2.md 1): fails if the old town or cast survives in what ships.
// "Fixwick", "Saltmarsh" and "Penhallow" anywhere; "Moss" and "Pip" as names (capitalised, so
// `pip` the installer and moss the plant are fine); and old cast ids as speakers or clients in
// the compiled content. Scans the production build (.next), the compiled content and public/
// (Pyodide's own files excepted). Run after `npm run build`:  npx tsx scripts/brand-check.ts
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const OLD = /fixwick|saltmarsh|penhallow/i;
const OLD_CAST = /\b(Moss|Pip)\b|"(who|client)":"(moss|pip|bea|ferro|mira|agnes|gwen|tom|nell|priya|wendt|penhallow|committee|reginald|dennis|kat|dev|ashby|okonjo|sanjay|vance)"/;
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
      const m = text.match(OLD) ?? text.match(OLD_CAST);
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
