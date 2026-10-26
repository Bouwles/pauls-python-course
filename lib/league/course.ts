// The Arcade League (Section 13.5): the Club Course, the entry format, and the races.
// The same code scores entries on the server and replays them in the browser, so
// a replay always matches the score on the leaderboard.
import type { GridFrame, Move } from "../python/protocol";

/** The Club Course. S start, F finish, # rock, ~ rock pool (slippery), . sand. Rows top to bottom. */
export const COURSE_ROWS = [
  "S...#....",
  ".#..#.~..",
  ".#....~..",
  "...##...#",
  ".~....#..",
  ".~#...#..",
  "....#...F",
];

export const MOVES = ["up", "down", "left", "right"] as const;
export type MoveName = (typeof MOVES)[number];
const DELTA: Record<MoveName, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ARROW: Record<MoveName, Exclude<Move, null>> = { up: "^", down: "v", left: "<", right: ">" };

export const SLIP_SAND = 0.1;
export const SLIP_POOL = 0.35;
export const MAX_STEPS = 100;
export const RACES = 50;
export const FORMAT = "ppc-league-1";

export interface Course {
  rows: number;
  cols: number;
  start: [number, number];
  finish: [number, number];
  rocks: [number, number][];
  pools: [number, number][];
}

export function course(): Course {
  const rocks: [number, number][] = [];
  const pools: [number, number][] = [];
  let start: [number, number] = [0, 0];
  let finish: [number, number] = [0, 0];
  COURSE_ROWS.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === "#") rocks.push([r, c]);
      if (ch === "~") pools.push([r, c]);
      if (ch === "S") start = [r, c];
      if (ch === "F") finish = [r, c];
    }),
  );
  return { rows: COURSE_ROWS.length, cols: COURSE_ROWS[0]!.length, start, finish, rocks, pools };
}

/** The course as learners get it: the same JSON the League page offers to download. */
export function courseJson() {
  const c = course();
  return {
    format: FORMAT,
    layout: COURSE_ROWS,
    key: { S: "start", F: "finish", "#": "rock (can't enter)", "~": "rock pool (slips more)", ".": "sand" },
    moves: MOVES,
    slip: { sand: SLIP_SAND, pool: SLIP_POOL, note: "A slip moves the crab sideways to the intended move, either way with equal chance. Into a rock or off the course, he stays put." },
    max_steps: MAX_STEPS,
    start: c.start,
    finish: c.finish,
    entry: { format: FORMAT, policy: "a list of 7 rows of 9 moves (up, down, left, right), or q: 7 rows of 9 lists of 4 action values in that order" },
  };
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export type Policy = MoveName[][];

/** Read an entry: a policy grid, or a Q-table turned into its greedy policy. */
export function readEntry(raw: unknown): { policy: Policy } | { error: string } {
  const c = course();
  if (!raw || typeof raw !== "object") return { error: "The entry should be a JSON object." };
  const obj = raw as { format?: unknown; policy?: unknown; q?: unknown };
  if (obj.format !== undefined && obj.format !== FORMAT) return { error: `Unknown format "${String(obj.format)}". Use "${FORMAT}".` };
  const toMove = (m: unknown): MoveName | null => {
    if (typeof m === "number" && Number.isInteger(m) && m >= 0 && m < 4) return MOVES[m]!;
    if (typeof m !== "string") return null;
    const k = m.trim().toLowerCase();
    const map: Record<string, MoveName> = { up: "up", down: "down", left: "left", right: "right", "^": "up", v: "down", "<": "left", ">": "right", u: "up", d: "down", l: "left", r: "right" };
    return map[k] ?? null;
  };
  if (Array.isArray(obj.policy)) {
    const p = obj.policy as unknown[];
    if (p.length !== c.rows || !p.every((row) => Array.isArray(row) && row.length === c.cols)) return { error: `The policy should be ${c.rows} rows of ${c.cols} moves.` };
    const policy: Policy = [];
    for (let r = 0; r < c.rows; r++) {
      const row: MoveName[] = [];
      for (let col = 0; col < c.cols; col++) {
        const m = toMove((p[r] as unknown[])[col]);
        // Rocks and the finish don't need a move; anything there is ignored.
        row.push(m ?? "right");
        if (!m && !isRock(c, r, col) && !(r === c.finish[0] && col === c.finish[1])) return { error: `Row ${r}, column ${col}: "${String((p[r] as unknown[])[col])}" isn't a move. Use up, down, left or right.` };
      }
      policy.push(row);
    }
    return { policy };
  }
  if (Array.isArray(obj.q)) {
    const q = obj.q as unknown[];
    if (q.length !== c.rows || !q.every((row) => Array.isArray(row) && row.length === c.cols && row.every((a) => Array.isArray(a) && a.length === 4 && a.every((x) => typeof x === "number" && Number.isFinite(x))))) {
      return { error: `The Q-table should be ${c.rows} rows of ${c.cols} lists of 4 numbers (up, down, left, right).` };
    }
    // Greedy, first best on ties (the same rule as numpy's argmax).
    const policy = (q as number[][][]).map((row) => row.map((a) => MOVES[a.indexOf(Math.max(...a))]!));
    return { policy };
  }
  return { error: "The entry needs a policy (a grid of moves) or a q (a grid of action values)." };
}

const isRock = (c: Course, r: number, col: number) => c.rocks.some(([a, b]) => a === r && b === col);
const isPool = (c: Course, r: number, col: number) => c.pools.some(([a, b]) => a === r && b === col);

// ---------------------------------------------------------------------------
// Races
// ---------------------------------------------------------------------------

/** A small, fast, seeded generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SIDEWAYS: Record<MoveName, [MoveName, MoveName]> = { up: ["left", "right"], down: ["left", "right"], left: ["up", "down"], right: ["up", "down"] };

export interface RaceResult {
  steps: number;
  finished: boolean;
  path: [number, number][];
}

export function race(policy: Policy, seed: number): RaceResult {
  const c = course();
  const rand = rng(seed);
  let [r, col] = c.start;
  const path: [number, number][] = [[r, col]];
  for (let step = 1; step <= MAX_STEPS; step++) {
    let move = policy[r]![col]!;
    const slip = isPool(c, r, col) ? SLIP_POOL : SLIP_SAND;
    if (rand() < slip) move = SIDEWAYS[move][rand() < 0.5 ? 0 : 1];
    const [dr, dc] = DELTA[move];
    const nr = r + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < c.rows && nc >= 0 && nc < c.cols && !isRock(c, nr, nc)) [r, col] = [nr, nc];
    path.push([r, col]);
    if (r === c.finish[0] && col === c.finish[1]) return { steps: step, finished: true, path };
  }
  return { steps: MAX_STEPS, finished: false, path };
}

/** The week's races: mean steps (lower is better) and how many finished. */
export function league(policy: Policy, week: string, races = RACES): { score: number; finished: number; races: number } {
  let total = 0;
  let finished = 0;
  for (let i = 0; i < races; i++) {
    const r = race(policy, hash(`${week}/${i}`));
    total += r.steps;
    if (r.finished) finished++;
  }
  return { score: Math.round((total / races) * 100) / 100, finished, races };
}

/** ISO 8601 week, e.g. "2026-W43". Weeks start on Monday. */
export function isoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Frames of one race for the Living player: Sir Reginald's path over the course. */
export function raceFrames(policy: Policy, seed: number): GridFrame[] {
  const c = course();
  const result = race(policy, seed);
  const visits = Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => 0));
  const arrows = policy.map((row) => row.map((m) => ARROW[m]));
  return result.path.map(([r, col], i) => {
    visits[r]![col]! += 1;
    return {
      kind: "grid" as const,
      values: visits.map((row, rr) => row.map((v, cc) => (isRock(c, rr, cc) ? null : isPool(c, rr, cc) ? -0.3 : Math.min(1, v / 3)))),
      policy: arrows.map((row, rr) => row.map((m, cc) => (isRock(c, rr, cc) || (rr === c.finish[0] && cc === c.finish[1]) ? null : m))),
      crab: [r, col] as [number, number],
      walls: c.rocks,
      goal: [c.finish],
      numbers: false,
      title: i === result.path.length - 1 ? (result.finished ? `Finished in ${result.steps} moves` : `Still racing after ${MAX_STEPS} moves`) : `Move ${i}`,
    };
  });
}

/** The shortest-path policy by breadth-first search from the finish: a decent baseline, not the best under slips. */
export function baselinePolicy(): Policy {
  const c = course();
  const dist = Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => Infinity));
  const queue: [number, number][] = [c.finish];
  dist[c.finish[0]]![c.finish[1]] = 0;
  while (queue.length) {
    const [r, col] = queue.shift()!;
    for (const m of MOVES) {
      const [dr, dc] = DELTA[m];
      const nr = r - dr;
      const nc = col - dc;
      if (nr >= 0 && nr < c.rows && nc >= 0 && nc < c.cols && !isRock(c, nr, nc) && dist[nr]![nc] === Infinity) {
        dist[nr]![nc] = dist[r]![col]! + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist.map((row, r) =>
    row.map((_, col) => {
      let best: MoveName = "right";
      let bestD = Infinity;
      for (const m of MOVES) {
        const [dr, dc] = DELTA[m];
        const d = dist[r + dr]?.[col + dc] ?? Infinity;
        if (d < bestD) [best, bestD] = [m, d];
      }
      return best;
    }),
  );
}
