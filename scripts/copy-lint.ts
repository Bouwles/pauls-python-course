// Copy lint: scans UI strings in components and pages, and all
// content, for em dashes, emoji, banned phrases, exclamation marks in UI copy
// and American spellings. Fails (exit 1) on any finding.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { lintText } from "../lib/content/lint";

const root = process.cwd();
const findings: string[] = [];

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

/** A string literal is checked when it reads like prose: a space, letters, and nothing code-shaped. */
function looksLikeProse(text: string): boolean {
  if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(text)) return false;
  if (/^(\/|\.\/|@\/|https?:|#|var\(|calc\()/.test(text.trim())) return false;
  if (/[{}=;<>]|=>|\bfunction\b|\bimport\b|var\(--|color-mix\(|rgb\(/.test(text)) return false;
  return true;
}

function attributeName(node: ts.Node): string | null {
  let n: ts.Node | undefined = node.parent;
  while (n && !ts.isJsxAttribute(n) && !ts.isSourceFile(n) && !ts.isPropertyAssignment(n)) n = n.parent;
  if (n && ts.isJsxAttribute(n)) return n.name.getText();
  if (n && ts.isPropertyAssignment(n)) return n.name.getText();
  return null;
}

const SKIP_ATTRS = new Set(["className", "href", "src", "id", "key", "type", "name", "role", "rel", "htmlFor", "autoComplete", "inputMode", "d", "viewBox", "fill", "stroke", "keys", "shortcut", "data-key"]);

for (const file of [...walk(path.join(root, "app"), [".tsx", ".ts"]), ...walk(path.join(root, "components"), [".tsx", ".ts"]), path.join(root, "lib", "errors.ts")]) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const rel = path.relative(root, file);
  const check = (text: string, node: ts.Node) => {
    const problems = lintText(text, { ui: true });
    if (problems.length) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart());
      findings.push(`${rel}:${line + 1}: ${problems.join(", ")}: ${JSON.stringify(text.trim().slice(0, 80))}`);
    }
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isJsxText(node)) {
      const text = node.getText().trim();
      if (text) check(text, node);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const attr = attributeName(node);
      if (!(attr && SKIP_ATTRS.has(attr)) && looksLikeProse(node.text)) check(node.text, node);
    } else if (ts.isTemplateExpression(node)) {
      const text = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" x ");
      if (looksLikeProse(text)) check(text, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

for (const file of walk(path.join(root, "content"), [".md", ".yaml"])) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  // Dialogue may carry one exclamation mark per job; the build counts those, so only the rest is checked here.
  for (const problem of lintText(text, { ui: false })) findings.push(`${rel}: ${problem}`);
}

for (const f of findings) console.error(f);
console.log(`copy lint: ${findings.length} finding${findings.length === 1 ? "" : "s"}`);
if (findings.length) process.exit(1);
