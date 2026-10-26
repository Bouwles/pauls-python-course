// Take It Home (Section 10.5): the starter project a learner downloads, and the
// pytest report they bring back. Shared by the Job page, the server routes and
// the ppc CLI's endpoints, so the zip is the same whichever way it is fetched.
import type { Job, TakeHomeStep } from "./content/types";
import { BRAND } from "./brand";
import { withWorkshopStub } from "./export";
import type { Files } from "./python/protocol";

export interface TestCaseResult {
  name: string;
  outcome: "passed" | "failed" | "error" | "skipped";
  message: string | null;
}

export interface TestReport {
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
  total: number;
  cases: TestCaseResult[];
  /** Where it came from: pytest's JUnit XML, the summary line of its output, or the ppc CLI. */
  source: "junit" | "text" | "ppc";
  /** Python and platform, when the CLI sends them. */
  environment?: string;
}

const strip = (html: string) =>
  html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<li>/g, "- ")
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** Every file in the starter zip, under the project folder. */
export function starterFiles(job: Job, step: TakeHomeStep, site: string): Files {
  const ask = job.steps.find((s) => s.type === "ask");
  const brief = [
    `# ${job.title}`,
    "",
    ask && ask.type === "ask" ? strip(ask.specHtml) : job.summary,
    "",
    `## ${step.title}`,
    "",
    strip(step.html),
    "",
  ].join("\n");
  const readme = [
    `# ${job.title}: Take It Home`,
    "",
    `From ${BRAND.name} (${site}/job/${job.id}). The brief is in BRIEF.md.`,
    "",
    "## Set up (once)",
    "",
    `You need Python ${step.python} or newer.`,
    "",
    "macOS and Linux:",
    "",
    "    python3 -m venv .venv",
    "    source .venv/bin/activate",
    "    pip install -r requirements.txt",
    "",
    "Windows (PowerShell):",
    "",
    "    py -m venv .venv",
    "    .venv\\Scripts\\Activate.ps1",
    "    pip install -r requirements.txt",
    "",
    "## Check your work",
    "",
    "    pytest",
    "",
    `${step.minPassed === step.testCount ? `All ${step.testCount}` : `At least ${step.minPassed} of the ${step.testCount}`} tests need to pass.`,
    "",
    "## Hand it in",
    "",
    "With the ppc tool: `ppc check` in this folder runs the tests and sends the results to your account.",
    "",
    `Without it: run \`pytest --junitxml=report.xml\`, then upload report.xml (and, if you like, a zip of this folder) on the Job page.`,
    "",
  ].join("\n");
  const out: Files = {
    "BRIEF.md": brief,
    "README.md": readme,
    "requirements.txt": step.requirements.join("\n") + "\n",
    ".ppc.json": JSON.stringify({ job: job.id, step: step.id, site }, null, 2) + "\n",
    ".gitignore": ".venv/\n__pycache__/\n.pytest_cache/\nreport.xml\n",
  };
  for (const [name, content] of Object.entries(step.files)) out[name] = content;
  return Object.fromEntries(Object.entries(withWorkshopStub(out)).map(([name, content]) => [`${step.folder}/${name}`, content]));
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? decodeXml(m[1]!) : null;
}

function decodeXml(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, "\n")
    .replace(/&amp;/g, "&");
}

/** pytest --junitxml output. Returns null if this isn't a JUnit report. */
export function parseJUnit(xml: string): TestReport | null {
  if (!/<testsuites?[\s>]/.test(xml)) return null;
  const cases: TestCaseResult[] = [];
  const caseRe = /<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g;
  let m: RegExpExecArray | null;
  while ((m = caseRe.exec(xml))) {
    const head = m[1]!;
    const inner = m[3] ?? "";
    const name = [attr(` ${head}`, "classname"), attr(` ${head}`, "name")].filter(Boolean).join("::") || "test";
    let outcome: TestCaseResult["outcome"] = "passed";
    let message: string | null = null;
    const fail = /<(failure|error|skipped)\b([^>]*)/.exec(inner);
    if (fail) {
      outcome = fail[1] === "failure" ? "failed" : fail[1] === "error" ? "error" : "skipped";
      message = attr(` ${fail[2]}`, "message");
    }
    cases.push({ name, outcome, message: message ? message.slice(0, 500) : null });
  }
  if (!cases.length) return null;
  return summarise(cases, "junit");
}

/** The last line of pytest's output, e.g. "==== 2 failed, 9 passed in 0.31s ====". */
export function parsePytestText(text: string): TestReport | null {
  const lines = text.trim().split(/\r?\n/).reverse();
  for (const line of lines) {
    if (!/\b(passed|failed|error|errors)\b/.test(line) || !/\bin [\d.]+s/.test(line)) continue;
    const n = (word: string) => Number(new RegExp(`(\\d+) ${word}`).exec(line)?.[1] ?? 0);
    const passed = n("passed");
    const failed = n("failed");
    const errors = n("errors?");
    const skipped = n("skipped");
    return { passed, failed, errors, skipped, total: passed + failed + errors + skipped, cases: [], source: "text" };
  }
  return null;
}

export function summarise(cases: TestCaseResult[], source: TestReport["source"]): TestReport {
  const count = (o: TestCaseResult["outcome"]) => cases.filter((c) => c.outcome === o).length;
  return { passed: count("passed"), failed: count("failed"), errors: count("error"), skipped: count("skipped"), total: cases.length, cases: cases.slice(0, 200), source };
}

/** Read whatever the learner uploaded or pasted: JUnit XML first, then pytest's summary line. */
export function parseReport(text: string): TestReport | null {
  return parseJUnit(text) ?? parsePytestText(text);
}

/** Does this report finish the step? */
export function reportPasses(report: TestReport, step: Pick<TakeHomeStep, "minPassed">): boolean {
  return report.failed === 0 && report.errors === 0 && report.passed >= step.minPassed;
}
