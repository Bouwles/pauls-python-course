// Builds the GitHub Pages version of the course: plain files in pages-out/, served from
// https://<user>.github.io/<repo>/. There's no server there, so:
// - the pages that need one (accounts, account classes, certificates, admin, the API) are left
//   out of this build; the League races entries in the browser, so it stays;
// - everyone is a guest, with their progress kept in their browser;
// - each step's checks and solution are written as files under /data for the browser to read
//   (lib/static-data.ts);
// - the service worker adds the headers that input() and Stop need (lib/sw/sw-template.js).
// The left-out pages are set aside while it builds and always put back, even if the build fails.
// The workflow in .github/workflows/deploy.yml runs this on every push to main.
//   npx tsx scripts/build-pages.ts [--base /pauls-python-course]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ppcZip } from "../lib/ppc-zip";

const root = process.cwd();
const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const base = (arg("--base") ?? "/pauls-python-course").replace(/\/$/, "");
const OUT = path.join(root, "pages-out");
const STASH = path.join(root, ".pages-stash");

/** Everything under app/ that needs a server. */
const SERVER_ONLY = ["api", "admin", "teach", "u", "certificates", "auth", "login", "signup", "device", "dev", "ppc.zip"];

function restore() {
  if (!fs.existsSync(STASH)) return;
  for (const name of fs.readdirSync(STASH)) {
    const to = path.join(root, "app", name);
    if (!fs.existsSync(to)) fs.renameSync(path.join(STASH, name), to);
  }
  fs.rmSync(STASH, { recursive: true, force: true });
}

// A build stopped half way last time leaves its stash: put it back first.
restore();
const run = (cmd: string, env: Record<string, string> = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });
const env = { NEXT_PUBLIC_PPC_STATIC: "1", NEXT_PUBLIC_BASE_PATH: base, NEXT_TELEMETRY_DISABLED: "1" };

// Python, the tokens and the content, as for any build (the service worker with isolation on).
run("npx tsx scripts/copy-pyodide.ts", env);
run("npx tsx scripts/build-tokens.ts", env);
run("npx tsx scripts/build-content.ts", env);

// The checks and solutions, as files.
const server = path.join(root, "generated", "content", "server");
const data = path.join(root, "public", "data");
fs.rmSync(data, { recursive: true, force: true });
for (const [kind, file] of [["tests", "tests.json"], ["solutions", "solutions.json"]] as const) {
  const all = JSON.parse(fs.readFileSync(path.join(server, file), "utf8")) as Record<string, unknown>;
  fs.mkdirSync(path.join(data, kind), { recursive: true });
  for (const [key, value] of Object.entries(all)) {
    fs.writeFileSync(path.join(data, kind, `${key.replace(/\//g, "__")}.json`), JSON.stringify(kind === "tests" ? { tests: value } : value));
  }
  console.log(`public/data/${kind}: ${Object.keys(all).length} files`);
}

// The ppc tool, as a plain file at <site>/ppc.zip (app/ppc.zip makes it on request locally, and is
// set aside here). Marked as the copy for a course with no accounts, so it prints a result to paste.
const ppcFile = path.join(root, "public", "ppc.zip");
const ppcSite = arg("--site") ?? process.env.NEXT_PUBLIC_SITE_URL ?? `https://bouwles.github.io${base}`;
fs.writeFileSync(ppcFile, ppcZip(ppcSite, { pages: true }).bytes);
console.log(`public/ppc.zip for ${ppcSite}`);

const stop = () => {
  restore();
  fs.rmSync(ppcFile, { force: true });
  process.exit(1);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
try {
  fs.mkdirSync(STASH, { recursive: true });
  for (const name of SERVER_ONLY) {
    const from = path.join(root, "app", name);
    if (fs.existsSync(from)) fs.renameSync(from, path.join(STASH, name));
  }
  run("npx next build", env);
} finally {
  restore();
  fs.rmSync(data, { recursive: true, force: true });
  fs.rmSync(ppcFile, { force: true });
  // Put the local service worker back (isolation off) for the local version.
  run("npx tsx scripts/copy-pyodide.ts", { NEXT_PUBLIC_PPC_STATIC: "" });
  // A running dev server may have rewritten its route list while pages were set aside.
  run("npx next typegen", { NEXT_PUBLIC_PPC_STATIC: "" });
}

fs.rmSync(OUT, { recursive: true, force: true });
// With its own build folder (next.config.ts), the export is written into that folder.
fs.renameSync(path.join(root, ".next-pages"), OUT);
// GitHub Pages runs Jekyll unless told not to, and Jekyll hides folders that start with "_" (_next).
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
// A missing page on Pages shows 404.html: the course's own not-found page.
if (fs.existsSync(path.join(OUT, "404", "index.html"))) fs.copyFileSync(path.join(OUT, "404", "index.html"), path.join(OUT, "404.html"));
console.log(`GitHub Pages build in pages-out/ for ${base || "/"}`);
