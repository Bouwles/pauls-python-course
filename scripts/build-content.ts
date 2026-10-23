// Validates /content and compiles it into generated/content.
// Fails (exit 1) on any invalid file or broken reference (unless --allow-errors, for development).
import fs from "node:fs";
import path from "node:path";
import { loadContent } from "../lib/content/build";
import { NodePython } from "../lib/python/node/runner";

const root = process.cwd();
const write = !process.argv.includes("--check");

const py = new NodePython();
const result = await loadContent(path.join(root, "content"), { describe: (t) => py.describe(t) });
await py.close();

for (const w of result.warnings) console.warn(`warning  ${w}`);
for (const e of result.errors) console.error(`error    ${e}`);
const jobCount = Object.keys(result.jobs).length;
const outlineCount = result.index.acts.reduce((n, a) => n + a.jobs.filter((j) => j.status === "outline").length, 0);
const cardCount = Object.values(result.concepts).reduce((n, c) => n + c.cards.length, 0);
console.log(
  `content: ${result.index.acts.length} acts, ${jobCount} written jobs, ${outlineCount} outlines, ` +
    `${Object.keys(result.concepts).length} concepts, ${cardCount} cards, ${result.errors.length} errors, ${result.warnings.length} warnings`,
);
// --allow-errors is for development while content is being written; production builds never pass it.
if (result.errors.length && !process.argv.includes("--allow-errors")) process.exit(1);

if (write) {
  const out = path.join(root, "generated", "content");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "jobs"), { recursive: true });
  fs.mkdirSync(path.join(out, "server"), { recursive: true });
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(result.index));
  for (const job of Object.values(result.jobs)) fs.writeFileSync(path.join(out, "jobs", `${job.id}.json`), JSON.stringify(job));
  fs.writeFileSync(path.join(out, "concepts.json"), JSON.stringify(result.concepts));
  // Server-only: hidden tests are served one step at a time; solutions only when the hint rules allow.
  fs.writeFileSync(path.join(out, "server", "tests.json"), JSON.stringify(result.tests));
  fs.writeFileSync(path.join(out, "server", "solutions.json"), JSON.stringify(result.solutions));
  console.log(`wrote ${path.relative(root, out)}`);
}
