// The shape of the compiled content bundle the app reads (generated/content).
// Solutions and hidden tests are never part of these types.
import type { Files, TestMeta } from "../python/protocol";

export interface Line {
  who: string;
  text: string;
  /** The portrait expression for this line ("pleased", "worried"...). Neutral when missing. */
  face?: string;
}

export interface Hints {
  nudge: string;
  plan: string[];
  shape: string;
}

export interface Dataset {
  name: string;
  source: string;
  licence: string;
  file: string;
  notes?: string;
}

export interface JobSummary {
  id: string;
  title: string;
  /** The plain name of the real program: "Bill Splitter". */
  projectName: string;
  status: "written" | "outline";
  client: string;
  building: string;
  act: string;
  actNumber: number;
  number: number;
  estimatedMinutes: number;
  summary: string;
  conceptsIntroduced: string[];
  conceptsReviewed: string[];
  shelf: { object: string; label: string } | null;
  stepCount: number;
  /** Optional tooling sidequests: unnumbered (number 0), and never an Act's final Job. */
  sidequest: boolean;
  /** Set on placement Jobs: the Act a pass places the learner past. */
  placementFor: string | null;
  /** A timed Job (University Readiness): the suggested time, shown as a clock. Never enforced. */
  timedMinutes: number | null;
  /** Downloads from the Shelf as a runnable folder with a README. */
  downloadable: boolean;
  datasets: Dataset[];
}

export interface ActSummary {
  id: string;
  number: number;
  title: string;
  district: string;
  subject: string;
  hours: number;
  summary: string;
  lockedLine: string;
  intro: Line[];
  jobs: JobSummary[];
}

interface StepCommon {
  id: string;
  title: string;
  /** Prose, rendered to HTML at build time. */
  html: string;
  dialogue: Line[];
}

export interface AskStep extends StepCommon {
  type: "ask";
  specHtml: string;
  example: string | null;
}

export interface PredictOption {
  text: string;
  correct: boolean;
  misconception: string | null;
  feedback: string;
  error: string | null;
}

export interface PredictStep extends StepCommon {
  type: "predict";
  concept: string;
  code: string;
  inputs: string[];
  questionHtml: string;
  kind: "choice" | "typed" | "line" | "value";
  options: PredictOption[];
  accept: string[];
  afterHtml: string | null;
}

export interface InvestigateTask {
  id: string;
  promptHtml: string;
  kind: "answer" | "run";
  accept: string[];
  feedback: string | null;
  wrong: string | null;
  hasTests: boolean;
}

export interface InvestigateStep extends StepCommon {
  type: "investigate";
  concept: string | null;
  code: string;
  inputs: string[];
  tasks: InvestigateTask[];
}

export interface WorkedStep extends StepCommon {
  type: "worked";
  language: "python" | "text";
  code: string;
  inputs: string[];
  subgoals: { label: string; lines: [number, number] }[];
  explain: { promptHtml: string; answer: string; concept: string | null };
}

export interface CheckableFields {
  files: string[];
  entry: string;
  starter: Files;
  visibleTests: TestMeta[];
  requiredCount: number;
  stretchCount: number;
  hints: Hints | null;
  timeoutMs: number;
  starterFrom: string | null;
  onPass: Line | null;
  argvField: boolean;
}

export interface PipsStep extends StepCommon, CheckableFields {
  type: "pips";
  dialogueAfter: Line[];
}

export interface ModifyStep extends StepCommon, CheckableFields {
  type: "modify";
}

export interface FixStep extends StepCommon, CheckableFields {
  type: "fix";
}

export interface MakeStep extends StepCommon, CheckableFields {
  type: "make";
  stretch: boolean;
}

export interface ParsonsStep extends StepCommon {
  type: "parsons";
  /** Shuffled at build time with a fixed seed. Each block knows its correct position and indent. */
  blocks: { key: string; code: string }[];
  solutionOrder: { key: string; indent: number }[];
  distractors: { key: string; code: string; why: string }[];
  check: "run" | "order";
  hints: Hints | null;
  timeoutMs: number;
}

export interface ConceptStep extends StepCommon {
  type: "concept";
  widget: string;
  params: Record<string, unknown>;
  concept: string | null;
}

export interface ReadingStep extends StepCommon {
  type: "reading";
  code: string | null;
}

export interface ExplainStep extends StepCommon {
  type: "explain";
  code: string | null;
  promptHtml: string;
  answer: string;
  concept: string | null;
}

export interface GitStep extends StepCommon {
  type: "git";
  files: Files;
  tasks: { id: string; promptHtml: string; check: import("../gitsim").GitCheck[]; feedback: string | null }[];
}

/** Take It Home (Section 10.5): a project the learner runs on their own computer with pytest. */
export interface TakeHomeStep extends StepCommon {
  type: "takehome";
  /** The project: starter files and its pytest suite, as they go in the zip. */
  files: Files;
  requirements: string[];
  python: string;
  setupHtml: string;
  /** Test functions found in the suite. */
  testCount: number;
  minPassed: number;
  /** Heavy ML Jobs: the uploaded report is accepted with a note, never re-run. */
  heavy: boolean;
  /** The zip's top folder. */
  folder: string;
}

/** A capstone milestone (Act IX): the learner's test plan, evidence, and Paul's checklist. */
export interface MilestoneStep extends StepCommon {
  type: "milestone";
  checklist: { id: string; textHtml: string; whyHtml: string }[];
  testPlan: boolean;
  evidence: "none" | "link" | "zip";
}

export interface ShipStep extends StepCommon {
  type: "ship";
  shelf: { object: string; label: string } | null;
  cards: string[];
  /** Cosmetic unlocks this Job earns: "name-plate", "keeper-coat". */
  awards: string[];
  shipsFrom: string | null;
  /** Steps that must pass before the Job ships: shipsFrom, or every task in a placement section. */
  requires: string[];
  /** Placement Jobs: shipping places the learner past this Act (its Jobs become 'placed'; its concepts join the deck). */
  places: { act: string; actTitle: string; jobs: string[]; concepts: string[] } | null;
}

export type Step =
  | AskStep
  | PredictStep
  | InvestigateStep
  | WorkedStep
  | PipsStep
  | ModifyStep
  | FixStep
  | MakeStep
  | ParsonsStep
  | ConceptStep
  | ReadingStep
  | ExplainStep
  | GitStep
  | TakeHomeStep
  | MilestoneStep
  | ShipStep;

export type CheckableStep = PipsStep | ModifyStep | FixStep | MakeStep;

export interface StretchTask {
  id: string;
  title: string;
  promptHtml: string;
  hasTests: boolean;
}

export interface Job extends JobSummary {
  /** The scene strip's setting: "workshop" (with its night version) or "lamp-room". */
  scene: string;
  steps: Step[];
  stretch: StretchTask[];
  storyNote: string | null;
  data: Files;
  /** The README template for the learner's portfolio copy ({name}, {date}). */
  portfolioReadme: string | null;
}

export type Card = CardBody & { files: Files };

export type CardBody =
  | { id: string; concept: string; type: "predict"; promptHtml: string; code: string | null; inputs: string[]; answer: string; accept: string[] }
  | {
      id: string;
      concept: string;
      type: "choice";
      promptHtml: string;
      code: string | null;
      inputs: string[];
      options: { text: string; correct: boolean; misconception: string | null; feedback: string | null }[];
    }
  | { id: string; concept: string; type: "fix"; promptHtml: string; code: string; inputs: string[]; tests: string; solution: string }
  | { id: string; concept: string; type: "fill"; promptHtml: string; code: string; inputs: string[]; blanks: string[][]; tests: string }
  | { id: string; concept: string; type: "write"; promptHtml: string; code: string | null; inputs: string[]; starter: string; tests: string; solution: string };

export interface Concept {
  id: string;
  title: string;
  summaryHtml: string;
  /** The Python Handbook's longer page for this concept (content/handbook/<id>.md), when written. */
  handbookHtml?: string;
  /** The Handbook page's search title ("Python f-strings"), when set in content/handbook/titles.yaml. */
  handbookTitle?: string;
  example: string;
  exampleInputs: string[];
  misconceptions: string[];
  related: string[];
  drill: boolean;
  cards: Card[];
  introducedIn: string | null;
  usedIn: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  /** Signature colour, "#RRGGBB". */
  colour: string;
  /** Clocktower floor (Act number), 0 for none. */
  floor: number;
  /** Old pixel sprite name, kept while the old cast is replaced; the new cast has none. */
  sprite: string;
  pools: Record<string, string[]>;
}

export interface Misconception {
  id: string;
  concept: string;
  description: string;
}

export interface StoryNote {
  id: string;
  job: string;
  title: string;
  text: string;
  where: string;
}

export interface PlacementSummary {
  /** The Act this section places the learner past. */
  act: string;
  jobId: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
}

export interface ContentIndex {
  version: string;
  acts: ActSummary[];
  placements: PlacementSummary[];
  characters: Record<string, Character>;
  misconceptions: Record<string, Misconception>;
  story: StoryNote[];
}
