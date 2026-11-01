// Zod schemas for every content file in /content. scripts/validate-content.ts
// and scripts/build-content.ts both use these; an invalid file fails the build.
import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are lower-case words joined by hyphens");

export const FACES = ["neutral", "talking", "pleased", "proud", "thinking", "confused", "worried", "surprised", "laughing", "unimpressed"] as const;
export const GESTURES = ["idle", "wave", "cheer", "think", "point", "thumbs"] as const;

/**
 * A dialogue line is written in YAML as a one-key map: `- riya: "Six of us, one bill."`. The key
 * can also carry how they look saying it, an expression and then a gesture (REDESIGN3_PLAN.md):
 * `- riya.pleased: "..."`, `- neil.thinking.think: "..."`, `- caitlin.laughing.cheer: "..."`.
 */
export const dialogueLine = z
  .record(z.string(), z.string())
  .refine((v) => Object.keys(v).length === 1, "each dialogue line is one speaker and one line")
  .transform((v, ctx) => {
    const [key, text] = Object.entries(v)[0]!;
    const [who, face, gesture, ...rest] = key.split(".");
    if (rest.length) ctx.addIssue({ code: "custom", message: `"${key}": a speaker, then at most an expression and a gesture` });
    if (face && !(FACES as readonly string[]).includes(face)) ctx.addIssue({ code: "custom", message: `"${key}": "${face}" isn't an expression (${FACES.join(", ")})` });
    if (gesture && !(GESTURES as readonly string[]).includes(gesture)) ctx.addIssue({ code: "custom", message: `"${key}": "${gesture}" isn't a gesture (${GESTURES.join(", ")})` });
    return { who: who!, text: text.trim(), ...(face ? { face } : {}), ...(gesture ? { gesture } : {}) };
  });
export const dialogue = z.array(dialogueLine);

export const hints = z.object({
  nudge: z.string(),
  plan: z.array(z.string()).min(2),
  shape: z.string(),
});

const misconceptionId = id;

// ---------------------------------------------------------------------------
// Acts and jobs
// ---------------------------------------------------------------------------

export const actFile = z.object({
  id,
  number: z.number().int().min(1).max(9),
  title: z.string(),
  district: z.string(),
  subject: z.string(),
  hours: z.number().positive(),
  summary: z.string(),
  locked_line: z.string(),
  intro: dialogue.default([]),
  jobs: z.array(id).min(1),
});

export const stretchTask = z.object({
  id,
  title: z.string(),
  prompt: z.string(),
  /** Path (relative to the job folder) of a tests file. Needs a solution alongside. */
  tests: z.string().optional(),
  solution: z.string().optional(),
});

/** A real public dataset a project uses (REDESIGN.md 7.1), with its source and licence. */
export const dataset = z.object({
  name: z.string(),
  /** Where the original lives. */
  source: z.string().url(),
  licence: z.string().min(2),
  /** The cleaned copy bundled in this job's data folder. */
  file: z.string(),
  notes: z.string().optional(),
});

export const jobFile = z.object({
  id,
  title: z.string(),
  status: z.enum(["written", "outline"]).default("written"),
  /** The plain name of the real program (REDESIGN.md 7.1): "Bill Splitter", "Spam Filter". Shown first; the client second. */
  project_name: z.string().min(2),
  /** The README for the learner's portfolio copy (Markdown). {name} and {date} are filled in at download. */
  portfolio_readme: z.string().min(40).optional(),
  /** Downloads from the Shelf as a runnable folder with a README. */
  downloadable: z.boolean().default(true),
  /** Real public data the project uses, with licences. Every file listed here must exist in data/. */
  datasets: z.array(dataset).default([]),
  client: id,
  building: id,
  estimated_minutes: z.number().int().positive(),
  summary: z.string(),
  concepts_introduced: z.array(id).default([]),
  concepts_reviewed: z.array(id).default([]),
  ask: z
    .object({
      dialogue: dialogue.min(1),
      spec: z.string(),
      example: z.string().optional(),
    })
    .optional(),
  ship: z
    .object({
      dialogue: dialogue.min(1),
      /** Optional only for placement Jobs, which earn nothing for the Shelf. */
      shelf: z.object({ object: id, label: z.string() }).optional(),
      cards: z.array(id).default([]),
      /** Cosmetic unlocks earned by shipping this Job (Section 7.5): real milestones only. */
      awards: z.array(z.enum(["name-plate", "keeper-coat"])).default([]),
    })
    .optional(),
  stretch: z.array(stretchTask).default([]),
  story_note: id.optional(),
  /** A Take It Home sidequest (Section 5.1): optional, unnumbered, never blocks the next Act. */
  sidequest: z.boolean().default(false),
  /** Placement Jobs (content/placement): the Act a pass places the learner past. */
  placement_for: id.optional(),
  /** Old: where the pixel scene strip was set. Unused since REDESIGN-2.md; kept so older content still parses. */
  scene: z.enum(["workshop", "lamp-room"]).default("workshop"),
  /** University Readiness: a suggested time, shown as a clock, never enforced. */
  timed_minutes: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Steps (frontmatter of steps/*.md; the markdown body is the step's prose)
// ---------------------------------------------------------------------------

const stepBase = {
  id,
  title: z.string(),
  dialogue: dialogue.default([]),
};

const predictOption = z.object({
  text: z.string(),
  correct: z.boolean().default(false),
  misconception: misconceptionId.optional(),
  feedback: z.string(),
  /** For an option that claims the code crashes: the exception type. */
  error: z.string().optional(),
});

export const predictStep = z.object({
  ...stepBase,
  type: z.literal("predict"),
  concept: id,
  code: z.string(),
  inputs: z.array(z.string()).default([]),
  question: z.string(),
  kind: z.enum(["choice", "typed", "line", "value"]).default("choice"),
  options: z.array(predictOption).default([]),
  /** For typed answers: accepted answers, compared after trimming. */
  accept: z.array(z.string()).default([]),
  /** For kind=line: which executed line (1-based count) the question asks about. */
  nth: z.number().int().positive().optional(),
  /** For kind=value: the variable and the line it is read at (before that line runs). */
  variable: z.string().optional(),
  at_line: z.number().int().positive().optional(),
  /**
   * How the content tests confirm the correct answer by running the code:
   * output: the correct option's text is what the program prints
   * error: the program raises the correct option's `error` type
   * crash-line: the program crashes on the line number in the correct option
   * nth-line: the nth executed line is the one in the correct option
   * value: the variable's value at at_line is the correct option's text
   */
  verify: z.enum(["output", "error", "crash-line", "nth-line", "value"]).optional(),
  after: z.string().optional(),
});

const investigateTask = z.object({
  id,
  prompt: z.string(),
  kind: z.enum(["answer", "run"]),
  accept: z.array(z.string()).default([]),
  feedback: z.string().optional(),
  wrong: z.string().optional(),
  /** kind=run: inline tests (Python, same harness as tests.py). */
  tests: z.string().optional(),
  /** kind=run: a reference version of the code that passes. */
  solution: z.string().optional(),
});

export const investigateStep = z.object({
  ...stepBase,
  type: z.literal("investigate"),
  concept: id.optional(),
  code: z.string(),
  inputs: z.array(z.string()).default([]),
  tasks: z.array(investigateTask).min(1),
});

export const workedStep = z.object({
  ...stepBase,
  type: z.literal("worked"),
  language: z.enum(["python", "text"]).default("python"),
  code: z.string(),
  inputs: z.array(z.string()).default([]),
  subgoals: z.array(z.object({ label: z.string(), lines: z.tuple([z.number().int(), z.number().int()]) })).min(2),
  explain: z.object({ prompt: z.string(), answer: z.string(), concept: id.optional() }),
});

const checkable = {
  files: z.array(z.string()).default(["main.py"]),
  entry: z.string().default("main.py"),
  hints: hints.optional(),
  timeout_ms: z.number().int().positive().optional(),
  /** Copy the learner's latest code from another step as the starting point. */
  starter_from: id.optional(),
  /** One short, specific line when every check passes (Section 3.8). */
  on_pass: dialogueLine.optional(),
  /** Show an Arguments box next to Run, for command-line programs (sys.argv). */
  argv_field: z.boolean().default(false),
};

export const pipsStep = z.object({
  ...stepBase,
  type: z.literal("pips"),
  ...checkable,
  dialogue_after: dialogue.default([]),
});

export const modifyStep = z.object({
  ...stepBase,
  type: z.literal("modify"),
  ...checkable,
});

export const makeStep = z.object({
  ...stepBase,
  type: z.literal("make"),
  ...checkable,
  stretch: z.boolean().default(false),
});

export const fixStep = z.object({
  ...stepBase,
  type: z.literal("fix"),
  ...checkable,
});

export const parsonsStep = z.object({
  ...stepBase,
  type: z.literal("parsons"),
  blocks: z.array(z.object({ code: z.string(), indent: z.number().int().min(0).default(0) })).min(2),
  distractors: z.array(z.object({ code: z.string(), why: z.string() })).default([]),
  check: z.enum(["run", "order"]).default("run"),
  hints: hints.optional(),
  timeout_ms: z.number().int().positive().optional(),
});

export const conceptStep = z.object({
  ...stepBase,
  type: z.literal("concept"),
  widget: id,
  params: z.record(z.string(), z.unknown()).default({}),
  concept: id.optional(),
});

export const readingStep = z.object({
  ...stepBase,
  type: z.literal("reading"),
  code: z.string().optional(),
});

export const explainStep = z.object({
  ...stepBase,
  type: z.literal("explain"),
  code: z.string().optional(),
  prompt: z.string(),
  answer: z.string(),
  concept: id.optional(),
});

const gitCheck = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("initialised") }),
  z.object({ kind: z.literal("commits"), min: z.number().int().positive(), branch: z.string().optional() }),
  z.object({ kind: z.literal("branch-exists"), name: z.string() }),
  z.object({ kind: z.literal("on-branch"), name: z.string() }),
  z.object({ kind: z.literal("clean") }),
  z.object({ kind: z.literal("merged"), branch: z.string(), into: z.string().optional() }),
  z.object({ kind: z.literal("merge-commit") }),
  z.object({ kind: z.literal("file-contains"), file: z.string(), text: z.string(), committed: z.boolean().optional() }),
  z.object({ kind: z.literal("no-conflict-markers") }),
  z.object({ kind: z.literal("message-matches"), pattern: z.string() }),
]);

/** A terminal with the workshop's git; tasks are checked against the repository's state. */
export const gitStep = z.object({
  ...stepBase,
  type: z.literal("git"),
  tasks: z.array(z.object({ id, prompt: z.string(), check: z.array(gitCheck).min(1), feedback: z.string().optional() })).min(1),
});

/** Take It Home: the project lives in takehome/<step-id>/ (with a pytest suite in tests/); the reference in solutions/<step-id>/. */
export const takehomeStep = z.object({
  ...stepBase,
  type: z.literal("takehome"),
  /** pip requirements, written to requirements.txt (pytest is always added). */
  requirements: z.array(z.string()).default([]),
  python: z.string().default("3.12"),
  /** Extra setup notes (Markdown) after the standard guide. */
  setup: z.string().optional(),
  /** How many tests must pass; default all of them. */
  min_passed: z.number().int().positive().optional(),
  /** Heavy ML Jobs whose tests can't run in the browser: the report is accepted with a note. */
  heavy: z.boolean().default(false),
});

/** A capstone milestone: Paul's checklist, the learner's own test plan, and evidence. */
export const milestoneStep = z.object({
  ...stepBase,
  type: z.literal("milestone"),
  checklist: z.array(z.object({ id, text: z.string(), why: z.string() })).min(2),
  test_plan: z.boolean().default(false),
  evidence: z.enum(["none", "link", "zip"]).default("link"),
});

export const stepFile = z.discriminatedUnion("type", [
  takehomeStep,
  milestoneStep,
  gitStep,
  predictStep,
  investigateStep,
  workedStep,
  pipsStep,
  modifyStep,
  makeStep,
  fixStep,
  parsonsStep,
  conceptStep,
  readingStep,
  explainStep,
]);
export type StepFile = z.infer<typeof stepFile>;

// ---------------------------------------------------------------------------
// Concepts and their review cards
// ---------------------------------------------------------------------------

const cardBase = {
  prompt: z.string(),
  code: z.string().optional(),
  inputs: z.array(z.string()).default([]),
  /** Extra files the card's program can import or read, e.g. a small module. */
  files: z.record(z.string(), z.string()).default({}),
};

export const cardFile = z.discriminatedUnion("type", [
  z.object({ ...cardBase, type: z.literal("predict"), answer: z.string(), accept: z.array(z.string()).default([]) }),
  z.object({
    ...cardBase,
    type: z.literal("choice"),
    options: z
      .array(
        z.object({
          text: z.string(),
          correct: z.boolean().default(false),
          misconception: misconceptionId.optional(),
          feedback: z.string().optional(),
          error: z.string().optional(),
        }),
      )
      .min(2),
    /** output: correct option is the printed output; error: it names the exception; none: not about running code. */
    verify: z.enum(["output", "error", "crash-line", "none"]).optional(),
  }),
  z.object({ ...cardBase, type: z.literal("fix"), code: z.string(), tests: z.string(), solution: z.string() }),
  z.object({ ...cardBase, type: z.literal("fill"), code: z.string(), blanks: z.array(z.array(z.string()).min(1)).min(1), tests: z.string() }),
  z.object({ ...cardBase, type: z.literal("write"), starter: z.string().default(""), tests: z.string(), solution: z.string() }),
]);

export const conceptFile = z.object({
  id,
  title: z.string(),
  summary: z.string(),
  example: z.string(),
  example_inputs: z.array(z.string()).default([]),
  misconceptions: z.array(misconceptionId).default([]),
  related: z.array(id).default([]),
  drill: z.boolean().default(false),
  cards: z.array(cardFile).min(5, "every concept needs at least 5 card variants"),
});

export const misconceptionsFile = z.record(
  id,
  z.object({ concept: id, description: z.string() }),
);

// ---------------------------------------------------------------------------
// Characters and story
// ---------------------------------------------------------------------------

export const characterFile = z.object({
  id,
  name: z.string(),
  role: z.string(),
  /** The character's signature colour (REDESIGN-2.md 7.1): name tags, bubbles, their floor. */
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6E7584"),
  /** The Clocktower floor they live on, as an Act number (0 for none). */
  floor: z.number().int().min(0).max(9).default(0),
  /** Old pixel sprite name; unused by the new cast. */
  sprite: z.string().optional(),
  look: z.string(),
  voice: z.string(),
  pools: z.record(z.string(), z.array(z.string())).default({}),
});

export const storyFile = z.object({
  notes: z.array(z.object({ id, job: id, title: z.string(), text: z.string(), where: z.string() })),
});
