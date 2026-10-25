// Loads, validates and compiles everything in /content.
// Used by scripts/build-content.ts, scripts/validate-content.ts and the content tests.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import YAML from "yaml";
import { marked } from "marked";
import type { z } from "zod";
import {
  actFile,
  characterFile,
  conceptFile,
  jobFile,
  misconceptionsFile,
  stepFile,
  storyFile,
  type StepFile,
} from "./schema";
import type {
  ActSummary,
  Card,
  CardBody,
  Character,
  CheckableFields,
  Concept,
  ContentIndex,
  Job,
  JobSummary,
  Line,
  Misconception,
  PlacementSummary,
  Step,
  StoryNote,
} from "./types";
import type { Files, TestMeta } from "../python/protocol";
import { lintText } from "./lint";
import { BRAND } from "../brand";

/**
 * Content writes {{town}} where the town's name goes (REDESIGN.md 1.2), so a rebrand is one edit in
 * lib/brand.ts. {{TOWN}} is the name in capitals (signs, headlines) and {{town_id}} the lowercase
 * form for file names and Python identifiers.
 */
export function brandText(text: string): string {
  return text
    .replace(/\{\{town\}\}/g, BRAND.townName)
    .replace(/\{\{TOWN\}\}/g, BRAND.townName.toUpperCase())
    .replace(/\{\{town_id\}\}/g, BRAND.townName.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
}

const read = (file: string): string => brandText(fs.readFileSync(file, "utf8"));

export interface BuildResult {
  index: ContentIndex;
  jobs: Record<string, Job>;
  concepts: Record<string, Concept>;
  /** Python test sources, keyed `${jobId}/${stepId}` (plus `/${taskId}` for investigate tasks). */
  tests: Record<string, string>;
  /** Reference solutions, keyed like tests. Server-only. */
  solutions: Record<string, Files>;
  /** Raw step frontmatter, for content tests that need fields the client never sees. */
  raw: Record<string, StepFile>;
  errors: string[];
  warnings: string[];
}

export interface LoadOptions {
  /** Lists the tests in a tests.py source. Provided by the Pyodide runner. */
  describe?: (tests: string) => Promise<TestMeta[]>;
}

const DEFAULT_TIMEOUT = 10_000;
/** Concept-step widgets the Workbench can draw (components/workbench/widgets). */
export const WIDGETS = ["pigeonholes", "two-labels", "lamp-loop", "growth", "hill-walker"];
const PROSE_WARN = 150;
const PROSE_MAX = 175;

marked.setOptions({ gfm: true, breaks: false });

export function md(text: string | undefined | null): string {
  if (!text) return "";
  return (marked.parse(text.trim(), { async: false }) as string).trim();
}

export function mdInline(text: string | undefined | null): string {
  if (!text) return "";
  return (marked.parseInline(text.trim(), { async: false }) as string).trim();
}

function proseWords(body: string): number {
  const withoutCode = body.replace(/```[\s\S]*?```/g, " ");
  return withoutCode.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

/** Stands in for a file whose YAML didn't parse; the error is reported once and the file skipped. */
const BROKEN = Symbol("broken yaml");

function readYaml(file: string): unknown {
  return YAML.parse(read(file));
}

function yamlProblem(err: unknown): string {
  return String((err as Error).message ?? err).split("\n")[0]!;
}

function splitFrontmatter(text: string): { data: unknown; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text };
  return { data: YAML.parse(m[1]!), body: m[2]!.trim() };
}

function listDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((n) => !n.startsWith(".")).sort();
}

function readFilesUnder(dir: string): Files {
  const out: Files = {};
  if (!fs.existsSync(dir)) return out;
  const walk = (d: string) => {
    for (const name of listDir(d)) {
      const p = path.join(d, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else out[path.relative(dir, p).split(path.sep).join("/")] = read(p);
    }
  };
  walk(dir);
  return out;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = createHash("sha256").update(seed).digest().readUInt32LE(0) || 1;
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1_000_000) / 1_000_000;
  };
  const out = items.slice();
  for (let attempt = 0; attempt < 20; attempt++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    if (out.some((v, i) => v !== items[i])) break;
  }
  return out;
}

function zodIssues(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

export async function loadContent(root: string, opts: LoadOptions = {}): Promise<BuildResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rel = (p: string) => path.relative(root, p);
  // One malformed file is an error to fix, not a reason to stop checking everything else.
  const yaml = (file: string): unknown => {
    try {
      return readYaml(file);
    } catch (err) {
      errors.push(`${rel(file)}: the YAML doesn't parse: ${yamlProblem(err)}`);
      return BROKEN;
    }
  };
  const parse = <S extends z.ZodTypeAny>(schema: S, value: unknown, where: string): z.infer<S> | null => {
    if (value === BROKEN) return null;
    const r = schema.safeParse(value);
    if (!r.success) {
      errors.push(`${where}: ${zodIssues(r.error)}`);
      return null;
    }
    return r.data;
  };
  const lint = (text: string | undefined | null, where: string, ui = true) => {
    if (!text) return;
    for (const problem of lintText(text, { ui })) errors.push(`${where}: ${problem}`);
  };
  const lintLines = (lines: Line[], where: string) => {
    for (const l of lines) {
      lint(l.text, where, false);
      const words = l.text.split(/\s+/).length;
      if (words > 26) warnings.push(`${where}: a ${l.who} line has ${words} words; most lines should be under 20`);
    }
  };

  // -- characters --------------------------------------------------------------
  const characters: Record<string, Character> = {};
  for (const name of listDir(path.join(root, "characters"))) {
    const file = path.join(root, "characters", name);
    const c = parse(characterFile, yaml(file), rel(file));
    if (!c) continue;
    characters[c.id] = { id: c.id, name: c.name, role: c.role, sprite: c.sprite, pools: c.pools };
    for (const [event, lines] of Object.entries(c.pools)) for (const l of lines) lint(l, `${rel(file)} pools.${event}`, false);
  }
  const knownSpeakers = new Set([...Object.keys(characters), "narrator", "you"]);
  const checkSpeakers = (lines: Line[], where: string) => {
    for (const l of lines) if (!knownSpeakers.has(l.who)) errors.push(`${where}: unknown speaker "${l.who}"`);
  };

  // -- misconceptions ----------------------------------------------------------
  const misconceptions: Record<string, Misconception> = {};
  // misconceptions.yaml plus any files in misconceptions/ (so several authors never edit one file).
  const mFiles = [path.join(root, "misconceptions.yaml"), ...listDir(path.join(root, "misconceptions")).filter((n) => n.endsWith(".yaml")).map((n) => path.join(root, "misconceptions", n))];
  for (const mFile of mFiles) {
    if (!fs.existsSync(mFile)) continue;
    const m = parse(misconceptionsFile, yaml(mFile), rel(mFile));
    if (m) {
      for (const [mid, v] of Object.entries(m)) {
        if (misconceptions[mid]) errors.push(`${rel(mFile)}: misconception "${mid}" is defined twice`);
        misconceptions[mid] = { id: mid, ...v };
      }
    }
  }

  // -- concepts ----------------------------------------------------------------
  const concepts: Record<string, Concept> = {};
  for (const name of listDir(path.join(root, "concepts"))) {
    const file = path.join(root, "concepts", name);
    const c = parse(conceptFile, yaml(file), rel(file));
    if (!c) continue;
    if (`${c.id}.yaml` !== name) errors.push(`${rel(file)}: file name must be ${c.id}.yaml`);
    lint(c.summary, `${rel(file)} summary`);
    const cards: Card[] = c.cards.map((card, i): Card => ({ files: card.files, ...((): CardBody => {
      const cid = `${c.id}-${i + 1}`;
      lint(card.prompt, `${rel(file)} cards[${i}]`);
      const promptHtml = mdInline(card.prompt);
      switch (card.type) {
        case "predict":
          return { id: cid, concept: c.id, type: "predict", promptHtml, code: card.code ?? null, inputs: card.inputs, answer: card.answer, accept: card.accept };
        case "choice":
          if (card.options.filter((o) => o.correct).length !== 1) errors.push(`${rel(file)} cards[${i}]: a choice card needs exactly one correct option`);
          return {
            id: cid,
            concept: c.id,
            type: "choice",
            promptHtml,
            code: card.code ?? null,
            inputs: card.inputs,
            options: card.options.map((o) => ({ text: o.text, correct: o.correct, misconception: o.misconception ?? null, feedback: o.feedback ? mdInline(o.feedback) : null })),
          };
        case "fix":
          return { id: cid, concept: c.id, type: "fix", promptHtml, code: card.code, inputs: card.inputs, tests: card.tests, solution: card.solution };
        case "fill":
          if ((card.code.match(/___/g) ?? []).length !== card.blanks.length) errors.push(`${rel(file)} cards[${i}]: number of ___ gaps must equal number of blanks`);
          return { id: cid, concept: c.id, type: "fill", promptHtml, code: card.code, inputs: card.inputs, blanks: card.blanks, tests: card.tests };
        case "write":
          return { id: cid, concept: c.id, type: "write", promptHtml, code: card.code ?? null, inputs: card.inputs, starter: card.starter, tests: card.tests, solution: card.solution };
      }
    })() } as Card));
    for (const mid of c.misconceptions) if (!misconceptions[mid]) errors.push(`${rel(file)}: unknown misconception "${mid}"`);
    concepts[c.id] = {
      id: c.id,
      title: c.title,
      summaryHtml: md(c.summary),
      example: c.example,
      exampleInputs: c.example_inputs,
      misconceptions: c.misconceptions,
      related: c.related,
      drill: c.drill,
      cards,
      introducedIn: null,
      usedIn: [],
    };
  }
  for (const c of Object.values(concepts)) for (const r of c.related) if (!concepts[r]) errors.push(`concepts/${c.id}.yaml: unknown related concept "${r}"`);

  // -- the Python Handbook's long-form pages (REDESIGN.md 9.1): content/handbook/<concept-id>.md,
  // with search titles in content/handbook/titles.yaml.
  const titlesFile = path.join(root, "handbook", "titles.yaml");
  const titles = fs.existsSync(titlesFile) ? ((yaml(titlesFile) ?? {}) as Record<string, string>) : {};
  for (const [id, t] of Object.entries(titles)) {
    if (!concepts[id]) errors.push(`handbook/titles.yaml: no concept "${id}"`);
    else {
      lint(t, `handbook/titles.yaml ${id}`, true);
      concepts[id]!.handbookTitle = t;
    }
  }
  for (const name of listDir(path.join(root, "handbook")).filter((n) => n.endsWith(".md"))) {
    const id = name.replace(/\.md$/, "");
    const hFile = path.join(root, "handbook", name);
    if (!concepts[id]) {
      errors.push(`${rel(hFile)}: no concept "${id}"`);
      continue;
    }
    const text = read(hFile);
    lint(text, rel(hFile), true);
    concepts[id]!.handbookHtml = md(text);
  }
  for (const m of Object.values(misconceptions)) if (!concepts[m.concept]) errors.push(`misconceptions.yaml ${m.id}: unknown concept "${m.concept}"`);

  // -- story -------------------------------------------------------------------
  const story: StoryNote[] = [];
  for (const name of listDir(path.join(root, "story")).filter((n) => n.endsWith(".yaml"))) {
    const sFile = path.join(root, "story", name);
    const s = parse(storyFile, yaml(sFile), rel(sFile));
    if (s) story.push(...s.notes);
  }

  // -- acts and jobs -----------------------------------------------------------
  const acts: ActSummary[] = [];
  const jobs: Record<string, Job> = {};
  const tests: Record<string, string> = {};
  const solutions: Record<string, Files> = {};
  const raw: Record<string, StepFile> = {};

  const describe = async (source: string, where: string): Promise<TestMeta[]> => {
    if (!opts.describe) return [];
    try {
      const meta = await opts.describe(source);
      if (meta.length === 0) errors.push(`${where}: defines no tests`);
      return meta;
    } catch (err) {
      errors.push(`${where}: tests do not load: ${String((err as Error).message).split("\n").slice(-2).join(" ")}`);
      return [];
    }
  };

  const loadJob = async (jobPath: string, actId: string, actNumber: number, jobIndex: number): Promise<JobSummary | null> => {
    const jy = path.join(jobPath, "job.yaml");
    const job = parse(jobFile, yaml(jy), rel(jy));
    if (!job) return null;
    if (jobs[job.id]) errors.push(`${rel(jy)}: duplicate job id "${job.id}"`);
    if (!characters[job.client]) errors.push(`${rel(jy)}: unknown client "${job.client}"`);
    for (const cid of [...job.concepts_introduced, ...job.concepts_reviewed]) {
      if (!concepts[cid]) errors.push(`${rel(jy)}: unknown concept "${cid}"`);
    }
    lint(job.summary, rel(jy));
    const summary: JobSummary = {
      id: job.id,
      title: job.title,
      projectName: job.project_name,
      downloadable: job.downloadable,
      datasets: job.datasets,
      status: job.status,
      client: job.client,
      building: job.building,
      act: actId,
      actNumber,
      number: job.sidequest || job.placement_for ? 0 : jobIndex + 1,
      estimatedMinutes: job.estimated_minutes,
      summary: job.summary,
      conceptsIntroduced: job.concepts_introduced,
      conceptsReviewed: job.concepts_reviewed,
      shelf: job.ship?.shelf ?? null,
      stepCount: 0,
      sidequest: job.sidequest,
      placementFor: job.placement_for ?? null,
      timedMinutes: job.timed_minutes ?? null,
    };

    if (job.status === "outline") return summary;
    if (!job.ask || !job.ship) {
      errors.push(`${rel(jy)}: a written job needs ask and ship`);
      return null;
    }
    // REDESIGN.md 7.3: every written project has a portfolio README, and its datasets are real files with licences.
    if (!job.portfolio_readme && !job.placement_for) errors.push(`${rel(jy)}: a written project needs a portfolio_readme`);
    for (const d of job.datasets) if (!fs.existsSync(path.join(jobPath, "data", d.file))) errors.push(`${rel(jy)}: dataset ${d.name} names data/${d.file}, which isn't there`);
    if (!job.ship.shelf && !job.placement_for) errors.push(`${rel(jy)}: ship needs a shelf object`);
    for (const cid of job.concepts_introduced) {
      const c = concepts[cid];
      if (!c) continue;
      if (c.introducedIn && c.introducedIn !== job.id) errors.push(`${rel(jy)}: concept "${cid}" is already introduced in ${c.introducedIn}`);
      c.introducedIn = job.id;
    }
    if (job.placement_for && job.concepts_introduced.length) errors.push(`${rel(jy)}: a placement Job introduces no concepts`);
    if (!job.placement_for) for (const cid of [...job.concepts_introduced, ...job.concepts_reviewed]) concepts[cid]?.usedIn.push(job.id);
    for (const cid of job.ship.cards) if (!concepts[cid]) errors.push(`${rel(jy)}: ship card "${cid}" is not a concept`);

    lintLines(job.ask.dialogue, `${rel(jy)} ask`);
    lintLines(job.ship.dialogue, `${rel(jy)} ship`);
    checkSpeakers(job.ask.dialogue, `${rel(jy)} ask`);
    checkSpeakers(job.ship.dialogue, `${rel(jy)} ship`);
    lint(job.ask.spec, `${rel(jy)} ask.spec`);

    const steps: Step[] = [];
    steps.push({
      id: "ask",
      type: "ask",
      title: "The Ask",
      html: "",
      dialogue: job.ask.dialogue,
      specHtml: md(job.ask.spec),
      example: job.ask.example?.replace(/\n$/, "") ?? null,
    });

    const stepIds = new Set<string>(["ask", "ship"]);
    let lastCheckable: string | null = null;
    let lastGate: string | null = null;
    const dialogueAll: Line[] = [...job.ask.dialogue, ...job.ship.dialogue];
    const stepsDir = path.join(jobPath, "steps");
    for (const stepName of listDir(stepsDir)) {
      const stepPathFile = path.join(stepsDir, stepName);
      const where = rel(stepPathFile);
      let data: unknown;
      let body: string;
      try {
        ({ data, body } = splitFrontmatter(read(stepPathFile)));
      } catch (err) {
        errors.push(`${rel(stepPathFile)}: the frontmatter YAML doesn't parse: ${yamlProblem(err)}`);
        continue;
      }
      const s = parse(stepFile, data, where);
      if (!s) continue;
      if (stepIds.has(s.id)) errors.push(`${where}: duplicate step id "${s.id}"`);
      stepIds.add(s.id);
      raw[`${job.id}/${s.id}`] = s;
      lint(body, where);
      lintLines(s.dialogue, where);
      checkSpeakers(s.dialogue, where);
      dialogueAll.push(...s.dialogue);
      const words = proseWords(body);
      if (words > PROSE_MAX) errors.push(`${where}: ${words} words of prose; the limit is about ${PROSE_WARN}`);
      else if (words > PROSE_WARN) warnings.push(`${where}: ${words} words of prose; aim for ${PROSE_WARN} or fewer`);
      const common = { id: s.id, title: s.title, html: md(body), dialogue: s.dialogue };
      const key = `${job.id}/${s.id}`;

      const checkableFields = async (st: Extract<StepFile, { files: string[] }>): Promise<CheckableFields | null> => {
        const testFile = path.join(jobPath, "tests", `${st.id}.py`);
        if (!fs.existsSync(testFile)) {
          errors.push(`${where}: missing tests/${st.id}.py`);
          return null;
        }
        const testSource = read(testFile);
        tests[key] = testSource;
        const meta = await describe(testSource, rel(testFile));
        for (const m of meta) if (m.hint) lint(m.hint, `${rel(testFile)} ${m.name}`);
        const solution = readFilesUnder(path.join(jobPath, "solutions", st.id));
        if (Object.keys(solution).length === 0) errors.push(`${where}: missing solutions/${st.id}/`);
        solutions[key] = solution;
        const starter = readFilesUnder(path.join(jobPath, "starter", st.id));
        if (st.starter_from && !stepIds.has(st.starter_from)) errors.push(`${where}: starter_from "${st.starter_from}" is not an earlier step`);
        for (const f of st.files) if (!(f in starter) && !st.starter_from) starter[f] = "";
        if (!st.files.includes(st.entry)) errors.push(`${where}: entry ${st.entry} is not in files`);
        if (st.hints) {
          lint(st.hints.nudge, `${where} hints.nudge`);
          st.hints.plan.forEach((p) => lint(p, `${where} hints.plan`));
        } else if ((st.type === "make" || st.type === "modify") && !job.placement_for) {
          // Placement tasks are the exception: they test what the learner already knows.
          errors.push(`${where}: Make and Modify steps need hints (nudge, plan, shape)`);
        }
        lastCheckable = st.id;
        if (st.on_pass) {
          lintLines([st.on_pass], where);
          checkSpeakers([st.on_pass], where);
          dialogueAll.push(st.on_pass);
        }
        return {
          files: st.files,
          entry: st.entry,
          starter,
          visibleTests: meta.filter((m) => m.visible),
          requiredCount: meta.filter((m) => !m.stretch).length,
          stretchCount: meta.filter((m) => m.stretch).length,
          hints: st.hints ?? null,
          timeoutMs: st.timeout_ms ?? DEFAULT_TIMEOUT,
          starterFrom: st.starter_from ?? null,
          onPass: st.on_pass ?? null,
          argvField: st.argv_field,
        };
      };

      switch (s.type) {
        case "predict": {
          if (!concepts[s.concept]) errors.push(`${where}: unknown concept "${s.concept}"`);
          if (s.kind === "choice" || s.kind === "line" || s.kind === "value") {
            if (s.options.filter((o) => o.correct).length !== 1) errors.push(`${where}: needs exactly one correct option`);
            for (const o of s.options) {
              if (!o.correct && !o.misconception) errors.push(`${where}: wrong option "${o.text}" needs a misconception`);
              if (o.misconception && !misconceptions[o.misconception]) errors.push(`${where}: unknown misconception "${o.misconception}"`);
              lint(o.feedback, `${where} option "${o.text}"`);
            }
          }
          if (s.kind === "typed" && s.accept.length === 0) errors.push(`${where}: typed predict needs accept answers`);
          steps.push({
            ...common,
            type: "predict",
            concept: s.concept,
            code: s.code,
            inputs: s.inputs,
            questionHtml: mdInline(s.question),
            kind: s.kind,
            options: s.options.map((o) => ({ text: o.text, correct: o.correct, misconception: o.misconception ?? null, feedback: mdInline(o.feedback), error: o.error ?? null })),
            accept: s.accept,
            afterHtml: s.after ? md(s.after) : null,
          });
          break;
        }
        case "investigate": {
          for (const t of s.tasks) {
            if (t.kind === "run") {
              if (!t.tests || !t.solution) errors.push(`${where}: run task "${t.id}" needs tests and solution`);
              else {
                tests[`${key}/${t.id}`] = t.tests;
                solutions[`${key}/${t.id}`] = { "main.py": t.solution };
                await describe(t.tests, `${where} task ${t.id}`);
              }
            } else if (t.accept.length === 0) errors.push(`${where}: answer task "${t.id}" needs accept answers`);
            lint(t.prompt, `${where} task ${t.id}`);
          }
          steps.push({
            ...common,
            type: "investigate",
            concept: s.concept ?? null,
            code: s.code,
            inputs: s.inputs,
            tasks: s.tasks.map((t) => ({ id: t.id, promptHtml: mdInline(t.prompt), kind: t.kind, accept: t.accept, feedback: t.feedback ? mdInline(t.feedback) : null, wrong: t.wrong ? mdInline(t.wrong) : null, hasTests: Boolean(t.tests) })),
          });
          break;
        }
        case "worked": {
          const lineCount = s.code.replace(/\n$/, "").split("\n").length;
          for (const g of s.subgoals) {
            if (g.lines[0] < 1 || g.lines[1] > lineCount || g.lines[0] > g.lines[1]) errors.push(`${where}: subgoal "${g.label}" has lines outside the code`);
          }
          lint(s.explain.prompt, where);
          lint(s.explain.answer, where);
          steps.push({
            ...common,
            type: "worked",
            language: s.language,
            code: s.code,
            inputs: s.inputs,
            subgoals: s.subgoals,
            explain: { promptHtml: mdInline(s.explain.prompt), answer: mdInline(s.explain.answer), concept: s.explain.concept ?? null },
          });
          break;
        }
        case "pips":
        case "modify":
        case "fix":
        case "make": {
          const fields = await checkableFields(s);
          if (!fields) break;
          if (s.type === "pips") {
            lintLines(s.dialogue_after, where);
            checkSpeakers(s.dialogue_after, where);
            dialogueAll.push(...s.dialogue_after);
            steps.push({ ...common, ...fields, type: "pips", dialogueAfter: s.dialogue_after });
          } else if (s.type === "make") {
            steps.push({ ...common, ...fields, type: "make", stretch: s.stretch });
          } else {
            steps.push({ ...common, ...fields, type: s.type });
          }
          break;
        }
        case "parsons": {
          const keyed = s.blocks.map((b, i) => ({ key: `b${i + 1}`, code: b.code, indent: b.indent }));
          const distractors = s.distractors.map((d, i) => ({ key: `d${i + 1}`, code: d.code, why: d.why }));
          const shuffled = seededShuffle([...keyed.map((b) => ({ key: b.key, code: b.code })), ...distractors.map((d) => ({ key: d.key, code: d.code }))], key);
          if (s.check === "run") {
            const testFile = path.join(jobPath, "tests", `${s.id}.py`);
            if (!fs.existsSync(testFile)) errors.push(`${where}: missing tests/${s.id}.py`);
            else {
              tests[key] = read(testFile);
              await describe(tests[key]!, rel(testFile));
            }
            solutions[key] = { "main.py": keyed.map((b) => "    ".repeat(b.indent) + b.code).join("\n") + "\n" };
          }
          steps.push({
            ...common,
            type: "parsons",
            blocks: shuffled,
            solutionOrder: keyed.map((b) => ({ key: b.key, indent: b.indent })),
            distractors,
            check: s.check,
            hints: s.hints ?? null,
            timeoutMs: s.timeout_ms ?? DEFAULT_TIMEOUT,
          });
          break;
        }
        case "concept":
          if (!WIDGETS.includes(s.widget)) errors.push(`${where}: unknown widget "${s.widget}"`);
          steps.push({ ...common, type: "concept", widget: s.widget, params: s.params, concept: s.concept ?? null });
          break;
        case "reading":
          steps.push({ ...common, type: "reading", code: s.code ?? null });
          break;
        case "git": {
          const files = readFilesUnder(path.join(jobPath, "starter", s.id));
          for (const t of s.tasks) lint(t.prompt, `${where} task ${t.id}`);
          steps.push({
            ...common,
            type: "git",
            files,
            tasks: s.tasks.map((t) => ({ id: t.id, promptHtml: mdInline(t.prompt), check: t.check, feedback: t.feedback ? mdInline(t.feedback) : null })),
          });
          break;
        }
        case "explain":
          lint(s.prompt, where);
          lint(s.answer, where);
          steps.push({ ...common, type: "explain", code: s.code ?? null, promptHtml: mdInline(s.prompt), answer: mdInline(s.answer), concept: s.concept ?? null });
          break;
        case "takehome": {
          const files = readFilesUnder(path.join(jobPath, "takehome", s.id));
          const testFiles = Object.keys(files).filter((f) => /(^|\/)test_[^/]*\.py$/.test(f));
          if (testFiles.length === 0) errors.push(`${where}: takehome/${s.id}/ needs a pytest suite (tests/test_*.py)`);
          const testCount = testFiles.reduce((n, f) => n + (files[f]!.match(/^def test_\w+/gm) ?? []).length, 0);
          if (s.min_passed && s.min_passed > testCount) errors.push(`${where}: min_passed is ${s.min_passed} but the suite has ${testCount} tests`);
          const solution = readFilesUnder(path.join(jobPath, "solutions", s.id));
          if (Object.keys(solution).length) solutions[key] = solution;
          else if (!s.heavy) errors.push(`${where}: missing solutions/${s.id}/ (only heavy Take It Home steps may go without)`);
          lint(s.setup, `${where} setup`);
          steps.push({
            ...common,
            type: "takehome",
            files,
            requirements: [...new Set([...s.requirements, "pytest"])],
            python: s.python,
            setupHtml: md(s.setup),
            testCount,
            minPassed: s.min_passed ?? testCount,
            heavy: s.heavy,
            folder: `${BRAND.townName.toLowerCase()}-${job.id}`,
          });
          lastGate = s.id;
          break;
        }
        case "milestone":
          for (const c of s.checklist) {
            lint(c.text, `${where} checklist ${c.id}`);
            lint(c.why, `${where} checklist ${c.id}`);
          }
          steps.push({
            ...common,
            type: "milestone",
            checklist: s.checklist.map((c) => ({ id: c.id, textHtml: mdInline(c.text), whyHtml: mdInline(c.why) })),
            testPlan: s.test_plan,
            evidence: s.evidence,
          });
          lastGate = s.id;
          break;
      }
    }

    const makeSteps = steps.filter((st) => st.type === "make" && !st.stretch);
    if (makeSteps.length === 0 && !steps.some((st) => ["fix", "git", "takehome", "milestone"].includes(st.type))) warnings.push(`${rel(jy)}: no Make step`);
    const gitSteps = steps.filter((st) => st.type === "git");
    // Take It Home and milestone steps come last in their Jobs, so they gate Ship when present.
    const shipsFrom = lastGate ?? (makeSteps.length ? makeSteps[makeSteps.length - 1]!.id : (lastCheckable ?? (gitSteps.length ? gitSteps[gitSteps.length - 1]!.id : null)));
    steps.push({
      id: "ship",
      type: "ship",
      title: "Ship it",
      html: "",
      dialogue: job.ship.dialogue,
      shelf: job.ship.shelf ?? null,
      cards: job.ship.cards,
      awards: job.ship.awards,
      shipsFrom,
      // Ship waits for the Job's gate, for every Take It Home and milestone step, and, in a
      // placement section or a timed problem set, for every task (not just the last).
      requires: [
        ...new Set([
          ...(job.placement_for || job.timed_minutes ? steps.filter((st) => (st.type === "make" && !st.stretch) || ["fix", "modify", "pips"].includes(st.type)).map((st) => st.id) : []),
          ...steps.filter((st) => st.type === "takehome" || st.type === "milestone").map((st) => st.id),
          ...(shipsFrom ? [shipsFrom] : []),
        ]),
      ],
      places: null,
    });

    const exclamations = dialogueAll.filter((l) => l.text.includes("!")).length;
    if (exclamations > 1) errors.push(`${rel(jy)}: ${exclamations} exclamation marks in dialogue; the limit is one per Job`);

    const stretch = job.stretch.map((t) => {
      lint(t.prompt, `${rel(jy)} stretch ${t.id}`);
      if (t.tests) {
        const tf = path.join(jobPath, t.tests);
        if (!fs.existsSync(tf)) errors.push(`${rel(jy)}: stretch ${t.id} tests file ${t.tests} not found`);
        else tests[`${job.id}/stretch-${t.id}`] = read(tf);
        if (!t.solution) errors.push(`${rel(jy)}: stretch ${t.id} has tests but no solution`);
        else {
          const sf = path.join(jobPath, t.solution);
          if (!fs.existsSync(sf)) errors.push(`${rel(jy)}: stretch ${t.id} solution ${t.solution} not found`);
          else solutions[`${job.id}/stretch-${t.id}`] = fs.statSync(sf).isDirectory() ? readFilesUnder(sf) : { "main.py": read(sf) };
        }
      }
      return { id: t.id, title: t.title, promptHtml: md(t.prompt), hasTests: Boolean(t.tests) };
    });

    summary.stepCount = steps.length;
    if (job.story_note && !story.some((n) => n.id === job.story_note)) errors.push(`${rel(jy)}: unknown story note "${job.story_note}"`);
    jobs[job.id] = {
      ...summary,
      scene: job.scene,
      steps,
      stretch,
      storyNote: job.story_note ?? null,
      portfolioReadme: job.portfolio_readme ?? null,
      data: readFilesUnder(path.join(jobPath, "data")),
    };
    return summary;
  };

  for (const actDir of listDir(path.join(root, "acts"))) {
    const actPath = path.join(root, "acts", actDir);
    const actYaml = path.join(actPath, "act.yaml");
    if (!fs.existsSync(actYaml)) {
      errors.push(`${rel(actPath)}: missing act.yaml`);
      continue;
    }
    const act = parse(actFile, yaml(actYaml), rel(actYaml));
    if (!act) continue;
    lint(act.summary, rel(actYaml));
    lint(act.locked_line, rel(actYaml));
    lintLines(act.intro, rel(actYaml));
    checkSpeakers(act.intro, rel(actYaml));

    const jobDirs = listDir(actPath).filter((n) => fs.statSync(path.join(actPath, n)).isDirectory());
    const byId = new Map<string, string>();
    for (const d of jobDirs) {
      const jy = path.join(actPath, d, "job.yaml");
      if (!fs.existsSync(jy)) {
        errors.push(`${rel(path.join(actPath, d))}: missing job.yaml`);
        continue;
      }
      let jid: string | undefined;
      try {
        jid = (YAML.parse(read(jy)) as { id?: string })?.id;
      } catch {
        jid = undefined; // reported when the job is loaded
      }
      if (jid) byId.set(jid, d);
    }
    for (const jid of byId.keys()) if (!act.jobs.includes(jid)) errors.push(`${rel(actYaml)}: job "${jid}" has a folder but is not listed in jobs`);

    const summaries: JobSummary[] = [];
    let numbered = 0;
    for (const jobId of act.jobs) {
      const dirName = byId.get(jobId);
      if (!dirName) {
        errors.push(`${rel(actYaml)}: job "${jobId}" is listed but has no folder`);
        continue;
      }
      const loaded = await loadJob(path.join(actPath, dirName), act.id, act.number, numbered);
      if (loaded) {
        summaries.push(loaded);
        if (!loaded.sidequest) numbered++;
      }
    }

    acts.push({
      id: act.id,
      number: act.number,
      title: act.title,
      district: act.district,
      subject: act.subject,
      hours: act.hours,
      summary: act.summary,
      lockedLine: act.locked_line,
      intro: act.intro,
      jobs: summaries,
    });
  }
  acts.sort((a, b) => a.number - b.number);

  // -- placement (Section 8.2): Jobs that place an experienced learner past an Act ----
  const placements: PlacementSummary[] = [];
  for (const dir of listDir(path.join(root, "placement"))) {
    const dirPath = path.join(root, "placement", dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const loaded = await loadJob(dirPath, "placement", 0, placements.length);
    if (!loaded) continue;
    if (!loaded.placementFor) {
      errors.push(`placement/${dir}/job.yaml: needs placement_for`);
      continue;
    }
    const target = acts.find((a) => a.id === loaded.placementFor);
    if (!target) errors.push(`placement/${dir}/job.yaml: unknown act "${loaded.placementFor}"`);
    const ship = jobs[loaded.id]?.steps.find((st) => st.type === "ship");
    if (target && ship?.type === "ship") {
      const written = target.jobs.filter((j) => j.status === "written");
      ship.places = { act: target.id, actTitle: target.title, jobs: written.map((j) => j.id), concepts: [...new Set(written.flatMap((j) => j.conceptsIntroduced))] };
    }
    placements.push({ act: loaded.placementFor, jobId: loaded.id, title: loaded.title, summary: loaded.summary, estimatedMinutes: loaded.estimatedMinutes });
  }
  placements.sort((a, b) => (acts.find((x) => x.id === a.act)?.number ?? 0) - (acts.find((x) => x.id === b.act)?.number ?? 0));

  for (const c of Object.values(concepts)) {
    if (!c.introducedIn) warnings.push(`concepts/${c.id}.yaml: not introduced by any written job yet`);
  }
  for (const n of story) if (!jobs[n.job] && !acts.some((a) => a.jobs.some((j) => j.id === n.job))) errors.push(`story/notes.yaml ${n.id}: unknown job "${n.job}"`);

  const version = createHash("sha256").update(JSON.stringify({ acts, placements, jobs: Object.keys(jobs), c: Object.keys(concepts) })).digest("hex").slice(0, 12);
  return {
    index: { version, acts, placements, characters, misconceptions, story },
    jobs,
    concepts,
    tests,
    solutions,
    raw,
    errors,
    warnings,
  };
}
