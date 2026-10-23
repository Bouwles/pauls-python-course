// Self-hosts Pyodide and the Workbench runtime under /public, so the app
// works under Cross-Origin-Embedder-Policy: require-corp and offline once cached.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const from = path.join(root, "node_modules", "pyodide");
const to = path.join(root, "public", "pyodide");
const files = ["pyodide.js", "pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
fs.mkdirSync(to, { recursive: true });
for (const f of files) {
  const src = path.join(from, f);
  const dst = path.join(to, f);
  if (!fs.existsSync(dst) || fs.statSync(dst).size !== fs.statSync(src).size) fs.copyFileSync(src, dst);
}
const pyOut = path.join(root, "public", "python");
fs.mkdirSync(pyOut, { recursive: true });
for (const f of fs.readdirSync(path.join(root, "lib", "python", "py"))) {
  if (f.endsWith(".py")) fs.copyFileSync(path.join(root, "lib", "python", "py", f), path.join(pyOut, f));
}
const version = JSON.parse(fs.readFileSync(path.join(from, "package.json"), "utf8")).version;
fs.writeFileSync(
  path.join(pyOut, "config.json"),
  JSON.stringify({ version, packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${version}/full/` }),
);
const sw = fs.readFileSync(path.join(root, "lib", "sw", "sw-template.js"), "utf8").replace("__PYODIDE_VERSION__", version);
fs.writeFileSync(path.join(root, "public", "sw.js"), sw);
console.log(`pyodide ${version} copied to public/pyodide; service worker written`);
