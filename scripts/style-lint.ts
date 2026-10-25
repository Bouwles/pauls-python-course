// The Look rules from REDESIGN.md, checked on every stylesheet (Sections 2.2, 3.3, 11):
// no rounded corners, no gradients, glows, blurred shadows or backdrop filters, no uppercase
// tracked labels, no 1px hairline borders, no serif fonts, and no raw colours in components
// (they come from tokens.css, which is generated from palette.json).
//   npx tsx scripts/style-lint.ts
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const DIRS = ["app", "components"];
// Generated from the palette, or the one place frames are defined.
const RAW_COLOUR_OK = new Set(["tokens.css"]);

interface Rule {
  name: string;
  test: (decl: string, file: string) => boolean;
}

const prop = (d: string) => d.slice(0, d.indexOf(":")).trim();
const value = (d: string) => d.slice(d.indexOf(":") + 1).trim();

const RULES: Rule[] = [
  { name: "rounded corner", test: (d) => /radius$/.test(prop(d)) && !/^(0|0px|var\(--r-[12]\))$/.test(value(d)) },
  { name: "gradient", test: (d) => /gradient\(/.test(d) },
  { name: "backdrop filter", test: (d) => /^backdrop-filter\s*:/.test(d) },
  { name: "blur", test: (d) => /blur\(/.test(d) },
  { name: "uppercase label", test: (d) => /^text-transform\s*:\s*uppercase/.test(d) },
  { name: "letter-spacing", test: (d) => prop(d) === "letter-spacing" && !/^(normal|0|var\(--prose-letter-spacing\))$/.test(value(d)) },
  { name: "1px hairline border", test: (d) => /^(border|outline)(-[a-z]+)?\s*:\s*1px\s+(solid|dashed|dotted)/.test(d) },
  {
    // Blurred shadows: a third length that isn't zero (offset-x offset-y BLUR).
    name: "soft shadow",
    test: (d) => /^box-shadow\s*:/.test(d) && d.split(/,(?![^(]*\))/).some((part) => /(-?\d+px)\s+(-?\d+px)\s+([1-9]\d*px)/.test(part.replace(/inset\s+/, ""))),
  },
  { name: "serif font", test: (d) => /^font-family\s*:/.test(d) && /(?<!sans-)serif|Source Serif|Literata|Georgia|Times/i.test(d) },
  { name: "raw colour", test: (d, f) => !RAW_COLOUR_OK.has(path.basename(f)) && /^(?!--)[a-z-]+\s*:.*(#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d)/.test(d) && !/^(mask|-webkit-mask)/.test(d) },
];

function files(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...files(p));
    else if (e.name.endsWith(".css")) out.push(p);
  }
  return out;
}

const all = [...DIRS.flatMap((d) => files(path.join(root, d))), path.join(root, "tokens.css")];
const problems: string[] = [];
for (const f of all) {
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
        for (const r of RULES) if (r.test(decl, f)) problems.push(`${path.relative(root, f)}:${startLine}  ${r.name}: ${decl}`);
        buf = "";
      } else buf += ch;
    }
  });
}

if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`\n${problems.length} style problems.`);
  process.exit(1);
}
console.log(`Style lint: ${all.length} stylesheets clean.`);
