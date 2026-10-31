// Types shared by the browser worker, the Node runner and the Workbench.
// They mirror the JSON produced by lib/python/py/ppc_runtime.py.

export type Files = Record<string, string>;

export interface PyError {
  type: string;
  message: string;
  file: string | null;
  line: number | null;
  column: number | null;
  text: string | null;
  frames: { file: string; line: number; name: string }[];
  traceback: string;
  inputsExhausted?: boolean;
}

export type RunStatus = "ok" | "error" | "stopped" | "output-limit";

export interface RunResult {
  status: RunStatus;
  error: PyError | null;
  exitCode: number;
  filesOut: Files;
  /** Everything a terminal would show: prompts, typed input, output. */
  output: string;
  /** Only what print() wrote. */
  printed: string;
  inputsRequested: number;
  /** matplotlib figures, base64 PNG. */
  figures?: string[];
  /** Frames the program drew with the workshop module (Living Visualisations). */
  visuals?: Visuals;
  /** Set by the host when the worker had to be restarted to stop the run. */
  restarted?: boolean;
  /** Static facts about the entry file (f-strings, names, loops), for characters' reactions. */
  events?: CodeEvent[];
}

export interface CodeEvent {
  event: string;
  name?: string;
}

export type TraceValue =
  | { k: "prim"; t: string; v: string }
  | { k: "ref"; id: string };

export type HeapObject =
  | { t: "list" | "tuple" | "set" | "frozenset"; items: TraceValue[]; more: number }
  | { t: "dict"; pairs: [TraceValue, TraceValue][]; more: number }
  | { t: "function"; name: string; params: string[] }
  | { t: "class" | "module"; name: string }
  | { t: "instance"; cls: string; attrs: [string, TraceValue][] }
  | { t: string; repr: string };

export interface TraceFrame {
  name: string;
  line: number;
  file: string;
  vars: [string, TraceValue][];
}

export interface TraceStep {
  event: "line" | "return" | "exception";
  line: number;
  file: string;
  stack: TraceFrame[];
  heap: Record<string, HeapObject>;
  out: number;
  ret?: TraceValue;
  exc?: string;
}

export interface TraceResult {
  status: "ok" | "error" | "limit" | "stopped" | "output-limit";
  error: PyError | null;
  steps: TraceStep[];
  limit: number;
  loops: { line: number; end: number; kind: "for" | "while" }[];
  entry: string;
  output: string;
}

export interface TestMeta {
  name: string;
  kind: "output" | "function" | "structure" | "variable" | "custom";
  visible: boolean;
  stretch: boolean;
  hint: string | null;
  inputs?: string[];
  expect?: string;
  match?: string;
  call?: string;
}

export interface TestResult extends TestMeta {
  passed: boolean;
  message: string | null;
  error: PyError | null;
  expected?: string;
  actual?: string;
  terminal?: string;
  timedOut?: boolean;
  notRun?: boolean;
  ms?: number;
}

export interface CheckReport {
  status: "ok" | "syntax-error" | "crashed";
  results: TestResult[];
  syntaxError: PyError | null;
  tests?: TestMeta[];
}

// Living Visualisations sent by the learner's code (lib/python/py/workshop.py).
export type Cell = [number, number];
export type Move = "^" | "v" | "<" | ">" | null;

export interface GridFrame {
  kind: "grid";
  values: (number | null)[][];
  policy?: Move[][];
  q?: ((number | null)[] | null)[][];
  crab?: Cell;
  walls?: Cell[];
  goal?: Cell[];
  title?: string;
  /** False to hide the value printed in each tile (course maps, race replays). */
  numbers?: boolean;
}

export interface GraphFrame {
  kind: "graph";
  edges: [string, string, number | null][];
  nodes: string[];
  positions?: Record<string, [number, number]>;
  visited: string[];
  frontier: string[];
  path: string[];
  current?: string;
  distances?: Record<string, number | null>;
  title?: string;
}

export interface HillFrame {
  kind: "hill";
  x: number | null;
  loss: number | null;
  title?: string;
}

export type VisualFrame = GridFrame | GraphFrame | HillFrame;

export interface Visuals {
  frames: VisualFrame[];
  /** How many frames the program sent; fewer are kept when it sends a lot. */
  total: number;
  /** The hill, sampled from the curve passed to show_hill. */
  curve?: [number, number | null][];
}

/** Paul's style notes on a shipped project (ppc_runtime.review). */
export interface StyleNote {
  rule: string;
  title: string;
  file: string;
  line: number;
  message: string;
  /** How many times the rule came up; only the first is shown. */
  count: number;
}

export interface ReviewResult {
  notes: StyleNote[];
  total: number;
}
