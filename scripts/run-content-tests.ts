// Content tests (Section 21):
// - every reference solution passes its required tests
// - every starter fails at least one required test
// - every predict answer matches what the code really does
// - every review card's answer is confirmed by running it
import path from "node:path";
import os from "node:os";
import { brandText, loadContent } from "../lib/content/build";
import type { Card, Job } from "../lib/content/types";
import { NodePython } from "../lib/python/node/runner";
import type { CheckReport, Files } from "../lib/python/protocol";
import { normaliseAnswer } from "../lib/content/answers";

const root = process.cwd();
const filter = process.argv.slice(2).find((a) => !a.startsWith("-"));

interface Task {
  name: string;
  run: (py: NodePython) => Promise<string | null>;
}

const requiredResults = (r: CheckReport) => r.results.filter((t) => !t.stretch);
const passesAll = (r: CheckReport) => r.status === "ok" && requiredResults(r).every((t) => t.passed);
const describeFailures = (r: CheckReport) =>
  r.status === "syntax-error"
    ? `syntax error: ${r.syntaxError?.message}`
    : requiredResults(r)
        .filter((t) => !t.passed)
        .map((t) => `"${t.name}": ${t.message ?? ""} ${t.error ? t.error.type + ": " + t.error.message : ""} expected ${JSON.stringify(t.expected)} got ${JSON.stringify(t.actual)}`)
        .join("; ");

function verifyPrediction(
  label: string,
  mode: string,
  correctText: string,
  correctError: string | null,
  result: { status: string; printed: string; error: { type: string; line: number | null } | null },
): string | null {
  switch (mode) {
    case "output":
      if (result.status !== "ok" && !result.printed) return `${label}: the code crashed (${result.error?.type}) but the answer is an output`;
      if (normaliseAnswer(result.printed) !== normaliseAnswer(correctText)) {
        return `${label}: correct answer ${JSON.stringify(correctText)} but the code prints ${JSON.stringify(result.printed)}`;
      }
      return null;
    case "error":
      if (!correctError) {
        if (result.status === "error") return `${label}: the correct option says no error, but it raises ${result.error?.type}`;
        return null;
      }
      if (result.error?.type !== correctError) return `${label}: expected ${correctError}, got ${result.error?.type ?? "no error"}`;
      return null;
    case "crash-line": {
      const n = Number(/\d+/.exec(correctText)?.[0]);
      if (result.error?.line !== n) return `${label}: correct option says line ${n}, the crash is on line ${result.error?.line ?? "(none)"}`;
      return null;
    }
    default:
      return null;
  }
}

function jobTasks(job: Job, tests: Record<string, string>, solutions: Record<string, Files>, raw: Record<string, unknown>): Task[] {
  const tasks: Task[] = [];
  for (const step of job.steps) {
    const key = `${job.id}/${step.id}`;
    const where = `${job.id} / ${step.id}`;
    switch (step.type) {
      case "predict": {
        const r = raw[key] as { verify?: string; nth?: number; variable?: string; at_line?: number };
        tasks.push({
          name: `${where}: predict answer`,
          run: async (py) => {
            const result = await py.run({ files: { "main.py": step.code }, inputs: step.inputs });
            if (step.kind === "typed") {
              return verifyPrediction(where, "output", step.accept[0]!, null, result);
            }
            const correct = step.options.find((o) => o.correct)!;
            const mode = r.verify ?? (correct.error ? "error" : "output");
            if (mode === "nth-line" || mode === "value") {
              const trace = await py.trace({ files: { "main.py": step.code }, inputs: step.inputs });
              const lines = trace.steps.filter((s) => s.event === "line").map((s) => s.line);
              if (mode === "nth-line") {
                const n = Number(/\d+/.exec(correct.text)?.[0]);
                return lines[(r.nth ?? 1) - 1] === n ? null : `${where}: executed line ${r.nth} is ${lines[(r.nth ?? 1) - 1]}, not ${n}`;
              }
              const at = trace.steps.find((s) => s.event === "line" && s.line === r.at_line);
              const frame = at?.stack[at.stack.length - 1];
              const v = frame?.vars.find(([name]) => name === r.variable)?.[1];
              const shown = v && v.k === "prim" ? v.v.replace(/^'(.*)'$/, "$1") : null;
              return shown === correct.text ? null : `${where}: ${r.variable} at line ${r.at_line} is ${shown}, not ${correct.text}`;
            }
            // Wrong options that claim an error must not match what happens.
            for (const o of step.options.filter((x) => !x.correct)) {
              if (mode === "output" && result.status === "ok" && normaliseAnswer(result.printed) === normaliseAnswer(o.text)) {
                return `${where}: wrong option ${JSON.stringify(o.text)} is actually what the code prints`;
              }
            }
            return verifyPrediction(where, mode, correct.text, correct.error, result);
          },
        });
        break;
      }
      case "investigate":
        for (const t of step.tasks.filter((x) => x.kind === "run")) {
          const tkey = `${key}/${t.id}`;
          tasks.push({
            name: `${where} / ${t.id}: solution passes, original fails`,
            run: async (py) => {
              const good = await py.check({ files: { ...job.data, ...solutions[tkey]! }, tests: tests[tkey]! });
              if (!passesAll(good)) return `${where} / ${t.id}: solution fails: ${describeFailures(good)}`;
              const orig = await py.check({ files: { ...job.data, "main.py": step.code }, tests: tests[tkey]! });
              if (passesAll(orig)) return `${where} / ${t.id}: the unchanged code already passes`;
              return null;
            },
          });
        }
        break;
      case "worked":
        if (step.language === "python") {
          tasks.push({
            name: `${where}: worked example runs`,
            run: async (py) => {
              const r = await py.run({ files: { ...job.data, "main.py": step.code }, inputs: step.inputs });
              return r.status === "ok" ? null : `${where}: worked example crashes: ${r.error?.type}: ${r.error?.message}`;
            },
          });
        }
        break;
      case "pips":
      case "fix":
      case "modify":
      case "make":
        tasks.push({
          name: `${where}: solution passes, starter fails`,
          run: async (py) => {
            const good = await py.check({ files: { ...job.data, ...solutions[key]! }, entry: step.entry, tests: tests[key]!, timeoutMs: step.timeoutMs });
            if (!passesAll(good)) return `${where}: solution fails: ${describeFailures(good)}`;
            if (step.starterFrom) return null;
            const bad = await py.check({ files: { ...job.data, ...step.starter }, entry: step.entry, tests: tests[key]!, timeoutMs: step.timeoutMs });
            if (passesAll(bad)) return `${where}: the starter already passes every required test`;
            return null;
          },
        });
        break;
      case "parsons":
        if (step.check === "run") {
          tasks.push({
            name: `${where}: assembled blocks pass`,
            run: async (py) => {
              const good = await py.check({ files: { ...job.data, ...solutions[key]! }, tests: tests[key]! });
              return passesAll(good) ? null : `${where}: assembled solution fails: ${describeFailures(good)}`;
            },
          });
        }
        break;
      case "takehome": {
        if (step.heavy || !solutions[key]) break;
        // Run the project's own pytest suite in Pyodide, skipping tests marked `local` (they check the learner's computer).
        const runner = 'import pytest\ncode = pytest.main(["-q", "-p", "no:cacheprovider", "--capture=sys", "-m", "not local"])\nprint("PYTEST_EXIT", int(code))\n';
        const exitOf = (printed: string) => Number(/PYTEST_EXIT (\d+)/.exec(printed)?.[1] ?? -1);
        tasks.push({
          name: `${where}: pytest passes with the solution, fails with the starter`,
          run: async (py) => {
            const good = await py.run({ files: { ...step.files, ...solutions[key]!, "_ppc_pytest.py": runner }, entry: "_ppc_pytest.py" });
            if (exitOf(good.printed) !== 0) return `${where}: the solution doesn't pass its pytest suite: ${good.printed.slice(-600)} ${good.error?.message ?? ""}`;
            const bad = await py.run({ files: { ...step.files, "_ppc_pytest.py": runner }, entry: "_ppc_pytest.py" });
            if (exitOf(bad.printed) === 0) return `${where}: the starter already passes its pytest suite`;
            return null;
          },
        });
        break;
      }
      default:
        break;
    }
  }
  // Stretch tasks extend the program the Job ships from, so they run with that step's entry file.
  const ship = job.steps.find((st) => st.type === "ship");
  const shipFrom = ship?.type === "ship" ? job.steps.find((st) => st.id === ship.shipsFrom) : undefined;
  const stretchEntry = shipFrom && "entry" in shipFrom ? shipFrom.entry : "main.py";
  for (const s of job.stretch.filter((x) => x.hasTests)) {
    const key = `${job.id}/stretch-${s.id}`;
    tasks.push({
      name: `${job.id} / stretch ${s.id}: solution passes`,
      run: async (py) => {
        const sol = solutions[key]!;
        // A single-file stretch solution is the Make step's entry file, rewritten.
        const files = Object.keys(sol).length === 1 && "main.py" in sol && stretchEntry !== "main.py" ? { [stretchEntry]: sol["main.py"]! } : sol;
        const good = await py.check({ files: { ...job.data, ...files }, entry: stretchEntry, tests: tests[key]! });
        return passesAll(good) ? null : `${job.id} / stretch ${s.id}: solution fails: ${describeFailures(good)}`;
      },
    });
  }
  return tasks;
}

function cardTasks(card: Card, raw: { verify?: string; options?: { error?: string }[] } | undefined): Task[] {
  const where = `card ${card.id}`;
  switch (card.type) {
    case "predict":
      return [
        {
          name: `${where}: answer`,
          run: async (py) => {
            if (!card.code) return `${where}: a predict card needs code`;
            const r = await py.run({ files: { ...card.files, "main.py": card.code }, inputs: card.inputs });
            return verifyPrediction(where, "output", card.answer, null, r);
          },
        },
      ];
    case "choice": {
      const mode = raw?.verify ?? (card.code ? "output" : "none");
      if (mode === "none") return [];
      return [
        {
          name: `${where}: answer`,
          run: async (py) => {
            const r = await py.run({ files: { ...card.files, "main.py": card.code ?? "" }, inputs: card.inputs });
            const idx = card.options.findIndex((o) => o.correct);
            const correctError = raw?.options?.[idx]?.error ?? null;
            return verifyPrediction(where, mode, card.options[idx]!.text, correctError, r);
          },
        },
      ];
    }
    case "fix":
      return [
        {
          name: `${where}: solution passes, broken code fails`,
          run: async (py) => {
            const good = await py.check({ files: { ...card.files, "main.py": card.solution }, tests: card.tests });
            if (!passesAll(good)) return `${where}: solution fails: ${describeFailures(good)}`;
            const bad = await py.check({ files: { ...card.files, "main.py": card.code }, tests: card.tests });
            return passesAll(bad) ? `${where}: the broken code already passes` : null;
          },
        },
      ];
    case "fill":
      return [
        {
          name: `${where}: filled code passes`,
          run: async (py) => {
            let i = 0;
            const filled = card.code.replace(/___/g, () => card.blanks[i++]![0]!);
            const good = await py.check({ files: { ...card.files, "main.py": filled }, tests: card.tests });
            return passesAll(good) ? null : `${where}: filled code fails: ${describeFailures(good)}`;
          },
        },
      ];
    case "write":
      return [
        {
          name: `${where}: solution passes, starter fails`,
          run: async (py) => {
            const good = await py.check({ files: { ...card.files, "main.py": card.solution }, tests: card.tests });
            if (!passesAll(good)) return `${where}: solution fails: ${describeFailures(good)}`;
            const bad = await py.check({ files: { ...card.files, "main.py": card.starter }, tests: card.tests });
            return passesAll(bad) ? `${where}: the starter already passes` : null;
          },
        },
      ];
  }
}

const started = Date.now();
const describer = new NodePython();
const content = await loadContent(path.join(root, "content"), { describe: (t) => describer.describe(t) });
await describer.close();
if (content.errors.length) {
  for (const e of content.errors) console.error(`error  ${e}`);
  // With a filter (one author's jobs), report the errors but still run what can run.
  if (!filter) process.exit(1);
  console.error(`${content.errors.length} content errors above; running the filtered tests anyway.`);
}

// Raw card frontmatter (verify modes and option errors are not in the client bundle).
const YAML = (await import("yaml")).default;
const fs = await import("node:fs");
const rawCards: Record<string, { verify?: string; options?: { error?: string }[] }> = {};
for (const name of fs.readdirSync(path.join(root, "content", "concepts"))) {
  const c = YAML.parse(brandText(fs.readFileSync(path.join(root, "content", "concepts", name), "utf8"))) as { id: string; cards: { verify?: string; options?: { error?: string }[] }[] };
  c.cards.forEach((card, i) => (rawCards[`${c.id}-${i + 1}`] = card));
}

let tasks: Task[] = [];
for (const job of Object.values(content.jobs)) tasks.push(...jobTasks(job, content.tests, content.solutions, content.raw as Record<string, unknown>));
for (const concept of Object.values(content.concepts)) for (const card of concept.cards) tasks.push(...cardTasks(card, rawCards[card.id]));
if (filter) tasks = tasks.filter((t) => t.name.includes(filter));

const poolSize = Math.max(1, Math.min(4, os.cpus().length - 1));
const pool = Array.from({ length: poolSize }, () => new NodePython());
const failures: string[] = [];
let next = 0;
await Promise.all(
  pool.map(async (py) => {
    while (next < tasks.length) {
      const task = tasks[next++]!;
      try {
        const problem = await task.run(py);
        if (problem) failures.push(problem);
      } catch (err) {
        failures.push(`${task.name}: ${(err as Error).message.split("\n").slice(-3).join(" ")}`);
      }
    }
  }),
);
await Promise.all(pool.map((p) => p.close()));

for (const f of failures) console.error(`FAIL  ${f}`);
console.log(`${tasks.length - failures.length} of ${tasks.length} content tests passed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
if (failures.length) process.exit(1);
