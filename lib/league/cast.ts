// The cast's entries in the Arcade League, so a table always has someone on it. Aaesha and Caitlin
// host and race, and the rest of the class take part. Nothing here is made up after the fact:
// each of them has a real policy, and it's raced on the week's seeds like anyone's entry, so the
// scores are what the course says.
//
// Each policy starts as one of two:
// - the best policy for the course, found by value iteration with the slips counted in: about
//   15.6 moves on average, and hard to beat (a learner's Q-learning crab gets about 15.7);
// - the shortest line, breadth-first from the finish, which ignores the slips: about 17.1.
// Then tiles are changed to another move, the way a crab trained on a budget gets the odd tile
// wrong. Tiles the crab often visits are likelier to change, and a change is only kept if:
// - every tile still leads to the finish when nothing slips (no tile points the crab into a rock
//   for ever, and no two tiles send it back and forth), so every race finishes;
// - it really is a mistake: the expected moves from the start, slips and all, go up;
// - the policy stays within its tier's range of expected moves.
//
// Each week (and each course: a new layout or rule makes new policies) the six are shuffled into
// six tiers, from the best policy itself (or nearly) to a shortest line gone a little wrong. Then
// they race the week's seeds, so luck moves things a little, as it does for everyone. Who comes
// top changes from week to week, and nobody is always last.
import type { TableRow } from "./table";
import { baselinePolicy, course, courseKey, hash, league, MOVES, race, rng, SLIP_POOL, SLIP_SAND, weekStart, type Course, type MoveName, type Policy } from "./course";

/** Everyone in the League from the Clocktower: the hosts first. */
export const CAST_ENTRANTS = ["aaesha", "caitlin", "paul", "neil", "riya", "yahya"] as const;
export type CastEntrant = (typeof CAST_ENTRANTS)[number];

export interface CastEntry {
  id: CastEntrant;
  policy: Policy;
  score: number;
  finished: number;
  races: number;
  /** When they entered: the Monday morning the week starts, so a tie goes to them. */
  enteredAt: number;
}

/** Best first: where each tier's policy starts, and how many more moves a race than the best policy it expects (from, to). */
export const TIERS: { from: "best" | "shortest"; worse: [number, number] }[] = [
  { from: "best", worse: [0, 0.08] },
  { from: "best", worse: [0.08, 0.3] },
  { from: "best", worse: [0.25, 0.55] },
  { from: "best", worse: [0.5, 0.9] },
  { from: "best", worse: [0.8, 1.3] },
  { from: "shortest", worse: [1.5, 2.2] },
];

const DELTA: Record<MoveName, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const SIDEWAYS: Record<MoveName, [MoveName, MoveName]> = { up: ["left", "right"], down: ["left", "right"], left: ["up", "down"], right: ["up", "down"] };

const isRock = (c: Course, r: number, col: number) => c.rocks.some(([a, b]) => a === r && b === col);
const isPool = (c: Course, r: number, col: number) => c.pools.some(([a, b]) => a === r && b === col);
const isFinish = (c: Course, r: number, col: number) => r === c.finish[0] && col === c.finish[1];

/** Where a move lands: into a rock or off the course, the crab stays put. */
function land(c: Course, r: number, col: number, m: MoveName): [number, number] {
  const [dr, dc] = DELTA[m];
  const nr = r + dr;
  const nc = col + dc;
  return nr >= 0 && nr < c.rows && nc >= 0 && nc < c.cols && !isRock(c, nr, nc) ? [nr, nc] : [r, col];
}

/** Every tile the crab can stand on and has to choose a move on. */
function tiles(c: Course): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < c.rows; r++) for (let col = 0; col < c.cols; col++) if (!isRock(c, r, col) && !isFinish(c, r, col)) out.push([r, col]);
  return out;
}

/** Expected moves to the finish from a tile, making move `m` and then going on as `v` says. */
function expected(c: Course, r: number, col: number, m: MoveName, v: number[][]): number {
  const slip = isPool(c, r, col) ? SLIP_POOL : SLIP_SAND;
  const [a, b] = SIDEWAYS[m];
  let total = 1;
  for (const [p, move] of [[1 - slip, m], [slip / 2, a], [slip / 2, b]] as const) {
    const [nr, nc] = land(c, r, col, move);
    total += p * v[nr]![nc]!;
  }
  return total;
}

/**
 * The best policy for the course: value iteration on the expected moves to the finish, slips
 * included. Only adding and multiplying, so every browser works out the same policy.
 */
export function bestPolicy(): Policy {
  const c = course();
  let v = Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => 0));
  for (let i = 0; i < 2000; i++) {
    let change = 0;
    const next = v.map((row, r) =>
      row.map((was, col) => {
        if (isRock(c, r, col) || isFinish(c, r, col)) return 0;
        const now = Math.min(...MOVES.map((m) => expected(c, r, col, m, v)));
        change = Math.max(change, Math.abs(now - was));
        return now;
      }),
    );
    v = next;
    if (change < 1e-10) break;
  }
  return v.map((row, r) =>
    row.map((_, col) => {
      let best: MoveName = "right";
      let bestValue = Infinity;
      for (const m of MOVES) {
        const e = expected(c, r, col, m, v);
        // First best on ties, the same rule as readEntry's argmax.
        if (e < bestValue - 1e-9) [best, bestValue] = [m, e];
      }
      return best;
    }),
  );
}

/** Expected moves from the start to the finish with this policy, slips and all (it must reach the finish: see reachesFinish). */
export function expectedMoves(policy: Policy): number {
  const c = course();
  return evaluate(policy, null)[c.start[0]]![c.start[1]]!;
}

/** Expected moves to the finish from every tile, starting from `from` (the values of a policy one tile different settle quickly). */
function evaluate(policy: Policy, from: number[][] | null): number[][] {
  const c = course();
  const v = from ? from.map((row) => [...row]) : Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => 0));
  for (let i = 0; i < 5000; i++) {
    let change = 0;
    // In place (Gauss-Seidel), which settles in fewer sweeps.
    for (let r = 0; r < c.rows; r++)
      for (let col = 0; col < c.cols; col++) {
        if (isRock(c, r, col) || isFinish(c, r, col)) continue;
        const now = expected(c, r, col, policy[r]![col]!, v);
        change = Math.max(change, Math.abs(now - v[r]![col]!));
        v[r]![col] = now;
      }
    if (change < 1e-8) break;
  }
  return v;
}

/** True when every tile leads to the finish if nothing slips. Each tile is walked once. */
export function reachesFinish(policy: Policy): boolean {
  const c = course();
  // 0 not seen yet, 1 on the walk now, 2 known to reach the finish.
  const state = Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => 0));
  state[c.finish[0]]![c.finish[1]] = 2;
  for (const [r0, c0] of tiles(c)) {
    const walk: [number, number][] = [];
    let [r, col] = [r0, c0];
    while (state[r]![col] === 0) {
      state[r]![col] = 1;
      walk.push([r, col]);
      [r, col] = land(c, r, col, policy[r]![col]!);
    }
    // Back onto this walk (or stuck where it is): it goes round for ever.
    if (state[r]![col] === 1) return false;
    for (const [a, b] of walk) state[a]![b] = 2;
  }
  return true;
}

let cached: { key: number; best: Policy; bestMoves: number; values: Record<"best" | "shortest", number[][]>; policies: Record<"best" | "shortest", Policy>; visits: Map<string, number> } | null = null;

/** The best policy, its expected moves, and how often it visits each tile in a race. Worked out once per course. */
function basics() {
  const key = courseKey();
  if (cached && cached.key === key) return cached;
  const best = bestPolicy();
  const visits = new Map<string, number>();
  const RUNS = 300;
  for (let i = 0; i < RUNS; i++) for (const [r, col] of race(best, hash(`visits/${i}`)).path) visits.set(`${r}-${col}`, (visits.get(`${r}-${col}`) ?? 0) + 1 / RUNS);
  const shortest = baselinePolicy();
  const values = { best: evaluate(best, null), shortest: evaluate(shortest, null) };
  const c = course();
  cached = { key, best, bestMoves: values.best[c.start[0]]![c.start[1]]!, values, policies: { best, shortest }, visits };
  return cached;
}

/**
 * The best policy with tiles changed to other moves until it expects about `target` more moves a
 * race than the best (and never more than `most`). Each change has to keep every tile reaching the
 * finish and make the policy worse. Each round tries a few changes and keeps the one that lands
 * nearest the target.
 */
function withWrongTiles(from: "best" | "shortest", target: number, most: number, rand: () => number): Policy {
  const { policies, values: startValues, bestMoves, visits } = basics();
  const start = policies[from];
  const c = course();
  const all = tiles(c);
  const weight = all.map(([r, col]) => 0.2 + (visits.get(`${r}-${col}`) ?? 0));
  const total = weight.reduce((a, b) => a + b, 0);
  const policy = start.map((row) => [...row]);
  const at = (v: number[][]) => v[c.start[0]]![c.start[1]]!;
  let values = startValues[from];
  let moves = at(values);
  const pickTile = () => {
    let x = rand() * total;
    for (let i = 0; i < all.length; i++) {
      x -= weight[i]!;
      if (x <= 0) return all[i]!;
    }
    return all[all.length - 1]!;
  };
  for (let round = 0; moves - bestMoves < target - 0.02 && round < 30; round++) {
    let chosen: { r: number; col: number; m: MoveName; values: number[][]; moves: number } | null = null;
    for (let k = 0; k < 6; k++) {
      const [r, col] = pickTile();
      const was = start[r]![col]!;
      if (policy[r]![col] !== was) continue;
      const others = MOVES.filter((m) => m !== was);
      const m = others[Math.floor(rand() * others.length)]!;
      policy[r]![col] = m;
      const next = reachesFinish(policy) ? evaluate(policy, values) : null;
      policy[r]![col] = was;
      const after = next ? at(next) : Infinity;
      if (!next || after <= moves + 1e-6 || after - bestMoves > most) continue;
      if (!chosen || Math.abs(after - bestMoves - target) < Math.abs(chosen.moves - bestMoves - target)) chosen = { r, col, m, values: next, moves: after };
    }
    if (!chosen) continue;
    policy[chosen.r]![chosen.col] = chosen.m;
    [values, moves] = [chosen.values, chosen.moves];
  }
  return policy;
}

/** The six, shuffled into the tiers for a week: the same order for the same week and course. */
export function tiersFor(week: string): Record<CastEntrant, number> {
  const rand = rng(hash(`cast-order/${week}/${courseKey()}`));
  const order: CastEntrant[] = [...CAST_ENTRANTS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return Object.fromEntries(order.map((id, tier) => [id, tier])) as Record<CastEntrant, number>;
}

const made = new Map<string, CastEntry[]>();

/** The cast's entries for a week, each raced on that week's seeds. */
export function castEntries(week: string): CastEntry[] {
  const key = `${week}/${courseKey()}`;
  const have = made.get(key);
  if (have) return have;
  const tiers = tiersFor(week);
  const entries = CAST_ENTRANTS.map((id): CastEntry => {
    const { from, worse } = TIERS[tiers[id]]!;
    const [lo, hi] = worse;
    const rand = rng(hash(`cast/${id}/${week}/${courseKey()}`));
    const policy = withWrongTiles(from, lo + rand() * (hi - lo), hi, rand);
    return { id, policy, ...league(policy, week), enteredAt: weekStart(week) + 9 * 3600_000 };
  });
  if (made.size > 20) made.clear();
  made.set(key, entries);
  return entries;
}

/**
 * The cast's rows on the Arcade's table for a week. Whoever you play as races as you, so their
 * entry is left out rather than shown twice.
 */
export function castRows(week: string, playAs: string | null | undefined, names: Record<string, string>): TableRow[] {
  return castEntries(week)
    .filter((e) => e.id !== playAs)
    .map((e) => ({ key: `cast:${e.id}`, name: names[e.id] ?? e.id.charAt(0).toUpperCase() + e.id.slice(1), score: e.score, finished: e.finished, races: e.races, enteredAt: e.enteredAt, mine: false }));
}
