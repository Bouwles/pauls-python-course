"use client";

// Living Visualisations the learner's own code sends with the workshop module (Section 7.6):
// a racing grid with the crab on it, a graph of nodes and edges, and a point rolling down a
// loss curve. One frame per call, played back sped up, with pause and step. Drawn cleanly:
// no sprites.
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphFrame, GridFrame, HillFrame, Move, Visuals } from "@/lib/python/protocol";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./LivingPlayer.module.css";

const SPEEDS = [
  { label: "Slow", fps: 3 },
  { label: "Quick", fps: 10 },
  { label: "Fast", fps: 30 },
];

function reducedMotion() {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion === "reduced" || Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function fmt(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined) return "none";
  if (Math.abs(n) >= 1e6) return n.toExponential(1);
  return Number(n.toFixed(digits)).toString();
}

export function LivingPlayer({ visuals }: { visuals: Visuals }) {
  const frames = visuals.frames;
  const last = frames.length - 1;
  const [i, setI] = useState(() => (frames.length > 1 && !reducedMotion() ? 0 : last));
  const [playing, setPlaying] = useState(() => frames.length > 1 && !reducedMotion());
  const [speed, setSpeed] = useState(1);

  // A new run starts from its first frame.
  const seen = useRef(visuals);
  useEffect(() => {
    if (seen.current === visuals) return;
    seen.current = visuals;
    const animate = visuals.frames.length > 1 && !reducedMotion();
    setI(animate ? 0 : visuals.frames.length - 1);
    setPlaying(animate);
  }, [visuals]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setI((x) => {
        if (x >= last) {
          setPlaying(false);
          return x;
        }
        return x + 1;
      });
    }, 1000 / SPEEDS[speed]!.fps);
    return () => clearInterval(t);
  }, [playing, speed, last]);

  const frame = frames[Math.min(i, last)]!;
  const prev = i > 0 ? frames[i - 1] : undefined;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setPlaying(false);
      setI((x) => Math.min(last, x + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPlaying(false);
      setI((x) => Math.max(0, x - 1));
    } else if (e.key === " ") {
      e.preventDefault();
      setPlaying((p) => !p);
    }
  };

  const heading = frame.kind === "grid" ? "The grid" : frame.kind === "graph" ? "The graph" : "The loss curve";

  return (
    <section className={styles.player} aria-label={`${heading}, drawn by your program`} tabIndex={0} onKeyDown={onKey}>
      <header className={styles.head}>
        <p className={styles.title}>
          {heading}
          {frame.title ? <span className={styles.sub}>{frame.title}</span> : null}
        </p>
        {frames.length > 1 ? (
          <div className={styles.controls}>
            <Button
              size="sm"
              variant="secondary"
              icon={playing ? "stop" : i >= last ? "reset" : "run"}
              onClick={() => {
                if (!playing && i >= last) setI(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : i >= last ? "Replay" : "Play"}
            </Button>
            <Button size="sm" variant="ghost" icon="caretLeft" onClick={() => (setPlaying(false), setI((x) => Math.max(0, x - 1)))} disabled={i === 0}>
              Back
            </Button>
            <Button size="sm" variant="ghost" icon="caretRight" onClick={() => (setPlaying(false), setI((x) => Math.min(last, x + 1)))} disabled={i >= last}>
              Forward
            </Button>
            <input className={styles.slider} type="range" min={0} max={last} value={i} onChange={(e) => (setPlaying(false), setI(Number(e.target.value)))} aria-label="Frame" />
            <label className={styles.speed}>
              <span className="visually-hidden">Speed</span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                {SPEEDS.map((s, k) => (
                  <option key={s.label} value={k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </header>
      {frame.kind === "grid" ? (
        <GridView frame={frame} prev={prev?.kind === "grid" ? prev : undefined} frames={frames.filter((f): f is GridFrame => f.kind === "grid")} />
      ) : frame.kind === "graph" ? (
        <GraphView frame={frame} />
      ) : (
        <HillView frames={frames.filter((f): f is HillFrame => f.kind === "hill")} index={frames.slice(0, i + 1).filter((f) => f.kind === "hill").length - 1} curve={visuals.curve} />
      )}
      {frames.length > 1 ? (
        <p className={styles.count}>
          Frame {i + 1} of {frames.length}
          {visuals.total > frames.length ? `, spread over the ${visuals.total.toLocaleString("en-GB")} your program sent` : ""}.
        </p>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// The racing grid: clean cells tinted by value, arrows for the policy, the crab
// ---------------------------------------------------------------------------

const ARROW: Record<Exclude<Move, null>, number> = { "^": -90, v: 90, "<": 180, ">": 0 };
const ACTION_NAMES = ["up", "down", "left", "right"];

/** Positive values in one cast colour, negative in another, never stronger than half so the numbers read. */
function tint(t: number): string | undefined {
  if (!t) return undefined;
  const pct = Math.round(Math.min(1, Math.abs(t)) * 50);
  return `color-mix(in srgb, var(${t > 0 ? "--c-neil" : "--c-caitlin"}) ${pct}%, var(--surface-2))`;
}

function GridView({ frame, prev, frames }: { frame: GridFrame; prev?: GridFrame; frames: GridFrame[] }) {
  const rows = frame.values.length;
  const cols = Math.max(...frame.values.map((r) => r.length));
  const [sel, setSel] = useState<[number, number] | null>(null);
  const maxAbs = useMemo(() => {
    let m = 0;
    for (const f of frames) for (const r of f.values) for (const v of r) if (v !== null && Number.isFinite(v)) m = Math.max(m, Math.abs(v));
    return m || 1;
  }, [frames]);
  const small = cols > 10 || rows > 10;
  const tile = small ? 28 : 48;
  const isAt = (cells: [number, number][] | undefined, r: number, c: number) => cells?.some(([a, b]) => a === r && b === c) ?? false;
  const moved = prev?.crab && frame.crab && (prev.crab[0] !== frame.crab[0] || prev.crab[1] !== frame.crab[1]);

  const describeTile = (r: number, c: number) => {
    const v = frame.values[r]?.[c];
    const parts = [`Row ${r}, column ${c}.`];
    if (isAt(frame.walls, r, c)) parts.push("A wall.");
    else parts.push(`Value ${fmt(v)}.`);
    if (isAt(frame.goal, r, c)) parts.push("The finish.");
    if (frame.crab && frame.crab[0] === r && frame.crab[1] === c) parts.push("The crab is here.");
    const move = frame.policy?.[r]?.[c];
    if (move) parts.push(`Policy: ${ACTION_NAMES[["^", "v", "<", ">"].indexOf(move)]}.`);
    const q = frame.q?.[r]?.[c];
    if (q) parts.push(`Q: ${q.map((x, k) => `${ACTION_NAMES[k] ?? k} ${fmt(x)}`).join(", ")}.`);
    return parts.join(" ");
  };

  const onKey = (e: React.KeyboardEvent) => {
    const [r, c] = sel ?? [0, 0];
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const d = moves[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    setSel([Math.min(rows - 1, Math.max(0, r + d[0])), Math.min(cols - 1, Math.max(0, c + d[1]))]);
  };

  const crabText = frame.crab ? `The crab is at row ${frame.crab[0]}, column ${frame.crab[1]}.` : "";

  return (
    <div className={styles.gridWrap}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gridAutoRows: `${tile}px` }}
        role="group"
        aria-label={`The grid, ${rows} rows by ${cols} columns. ${crabText} Use the arrow keys to read each tile; the line below says what's there.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setSel((s) => s ?? [0, 0])}
        onMouseLeave={() => setSel(null)}
      >
        {frame.values.map((row, r) =>
          row.map((v, c) => {
            const wall = isAt(frame.walls, r, c) || v === null;
            const goal = isAt(frame.goal, r, c);
            const t = !wall && v !== null ? Math.max(-1, Math.min(1, v / maxAbs)) : 0;
            const move = frame.policy?.[r]?.[c];
            const crab = frame.crab && frame.crab[0] === r && frame.crab[1] === c;
            const selected = sel && sel[0] === r && sel[1] === c;
            return (
              <div
                key={`${r}-${c}`}
                className={[styles.tile, wall ? styles.wall : "", goal ? styles.goal : "", selected ? styles.selected : ""].join(" ")}
                style={wall ? undefined : { background: tint(t) }}
                onMouseEnter={() => setSel([r, c])}
                aria-hidden="true"
              >
                {!small && frame.numbers !== false && !wall && v !== null && !crab ? <span className={styles.value}>{fmt(v, Math.abs(v) >= 10 ? 0 : 1)}</span> : null}
                {move && !wall && !crab ? (
                  <svg className={styles.arrow} width={small ? 12 : 16} height={small ? 12 : 16} viewBox="0 0 16 16" style={{ transform: `rotate(${ARROW[move]}deg)` }}>
                    <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                {goal && !crab ? <Icon name="flag" size={small ? 14 : 18} className={styles.flag} /> : null}
                {crab ? (
                  <span className={[styles.crab, moved ? styles.scuttle : ""].join(" ")}>
                    <Icon name="crab" size={small ? 20 : 32} />
                  </span>
                ) : null}
              </div>
            );
          }),
        )}
      </div>
      <p className={styles.readout} aria-live="polite">
        {sel ? describeTile(sel[0], sel[1]) : crabText || "Point at a tile to read its value."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A graph: the learner's positions, or laid out automatically
// ---------------------------------------------------------------------------

const GW = 640;
const GH = 380;
const MARGIN = 48;

/** A small force layout: nodes start on a circle, edges pull, everything pushes apart. Deterministic. */
function layout(nodes: string[], edges: [string, string, number | null][]): Record<string, [number, number]> {
  const n = nodes.length;
  const pos: Record<string, [number, number]> = {};
  nodes.forEach((name, k) => {
    const a = (k / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    pos[name] = [Math.cos(a), Math.sin(a)];
  });
  if (n <= 2) return pos;
  const ideal = 1.6 / Math.sqrt(n);
  const links = edges.filter(([a, b]) => a !== b && pos[a] && pos[b]);
  for (let it = 0; it < 240; it++) {
    const step = 0.08 * (1 - it / 240) + 0.004;
    const force: Record<string, [number, number]> = Object.fromEntries(nodes.map((m) => [m, [0, 0]]));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos[nodes[i]!]!;
        const b = pos[nodes[j]!]!;
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const d2 = Math.max(1e-4, dx * dx + dy * dy);
        const f = (ideal * ideal) / d2;
        force[nodes[i]!]![0] += dx * f;
        force[nodes[i]!]![1] += dy * f;
        force[nodes[j]!]![0] -= dx * f;
        force[nodes[j]!]![1] -= dy * f;
      }
    }
    for (const [a, b] of links) {
      const pa = pos[a]!;
      const pb = pos[b]!;
      const dx = pa[0] - pb[0];
      const dy = pa[1] - pb[1];
      const d = Math.max(1e-3, Math.hypot(dx, dy));
      const f = d / ideal;
      force[a]![0] -= (dx / d) * f * d;
      force[a]![1] -= (dy / d) * f * d;
      force[b]![0] += (dx / d) * f * d;
      force[b]![1] += (dy / d) * f * d;
    }
    for (const m of nodes) {
      const [fx, fy] = force[m]!;
      const len = Math.hypot(fx, fy) || 1;
      const move = Math.min(len, 1) * step;
      pos[m] = [pos[m]![0] + (fx / len) * move, pos[m]![1] + (fy / len) * move];
    }
  }
  return pos;
}

/** Fit any set of points into the drawing, keeping the shape. */
function fit(points: Record<string, [number, number]>): Record<string, [number, number]> {
  const names = Object.keys(points);
  if (!names.length) return points;
  const xs = names.map((n) => points[n]![0]);
  const ys = names.map((n) => points[n]![1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = (GW - MARGIN * 2) / (x1 - x0 || 1);
  const sy = (GH - MARGIN * 2) / (y1 - y0 || 1);
  const s = Math.min(sx, sy);
  const ox = (GW - (x1 - x0) * s) / 2;
  const oy = (GH - (y1 - y0) * s) / 2;
  return Object.fromEntries(names.map((n) => [n, [ox + (points[n]![0] - x0) * s, oy + (points[n]![1] - y0) * s] as [number, number]]));
}

function GraphView({ frame }: { frame: GraphFrame }) {
  const nodesKey = frame.nodes.join("|");
  const edgesKey = frame.edges.map((e) => `${e[0]}>${e[1]}`).join("|");
  const pos = useMemo(() => {
    if (frame.positions && frame.nodes.every((n) => frame.positions![n])) {
      // The learner's own positions: y grows downwards on screen, as in most drawing code.
      return fit(Object.fromEntries(frame.nodes.map((n) => [n, frame.positions![n]!])));
    }
    return fit(layout(frame.nodes, frame.edges));
    // The layout only depends on the shape of the graph, not on which nodes are visited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesKey, edgesKey, frame.positions]);

  const onPath = new Set<string>();
  for (let p = 0; p + 1 < frame.path.length; p++) onPath.add(`${frame.path[p]}|${frame.path[p + 1]}`), onPath.add(`${frame.path[p + 1]}|${frame.path[p]}`);
  const pathNodes = new Set(frame.path);
  const visited = new Set(frame.visited);
  const frontier = new Set(frame.frontier);
  const seen = new Set<string>();
  const edges = frame.edges.filter(([a, b]) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const summary = [
    frame.current ? `At ${frame.current}.` : "",
    frame.visited.length ? `Visited: ${frame.visited.join(", ")}.` : "",
    frame.frontier.length ? `Waiting: ${frame.frontier.join(", ")}.` : "",
    frame.path.length ? `Path: ${frame.path.join(" to ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const r = frame.nodes.length > 24 ? 9 : 13;

  return (
    <div className={styles.graphWrap}>
      <svg viewBox={`0 0 ${GW} ${GH}`} className={styles.graph} role="img" aria-label={`${frame.nodes.length} nodes and ${edges.length} edges. ${summary}`}>
        {edges.map(([a, b, w]) => {
          const pa = pos[a];
          const pb = pos[b];
          if (!pa || !pb) return null;
          const hot = onPath.has(`${a}|${b}`);
          return (
            <g key={`${a}|${b}`}>
              <line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} className={hot ? styles.edgeHot : styles.edge} />
              {w !== null ? (
                <text x={(pa[0] + pb[0]) / 2} y={(pa[1] + pb[1]) / 2} className={styles.weight} textAnchor="middle" dominantBaseline="middle">
                  {fmt(w)}
                </text>
              ) : null}
            </g>
          );
        })}
        {frame.nodes.map((n) => {
          const p = pos[n];
          if (!p) return null;
          const cls = n === frame.current ? styles.nodeCurrent : pathNodes.has(n) ? styles.nodePath : visited.has(n) ? styles.nodeVisited : frontier.has(n) ? styles.nodeFrontier : styles.node;
          const d = frame.distances?.[n];
          const below = p[1] < GH - MARGIN / 2 - 4;
          return (
            <g key={n}>
              <circle cx={p[0]} cy={p[1]} r={r} className={cls} />
              <text x={p[0]} y={below ? p[1] + r + 14 : p[1] - r - 6} className={styles.nodeLabel} textAnchor="middle">
                {n}
                {d !== undefined ? ` (${d === null ? "?" : fmt(d)})` : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className={styles.legend} aria-hidden="true">
        <li>
          <span className={[styles.swatch, styles.nodeCurrent].join(" ")} />
          Current
        </li>
        <li>
          <span className={[styles.swatch, styles.nodeVisited].join(" ")} />
          Visited
        </li>
        <li>
          <span className={[styles.swatch, styles.nodeFrontier].join(" ")} />
          Waiting
        </li>
        <li>
          <span className={[styles.swatch, styles.swatchPath].join(" ")} />
          Path
        </li>
      </ul>
      <p className={styles.readout} aria-live="polite">
        {summary || "Nothing visited yet."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A point rolling down a loss curve
// ---------------------------------------------------------------------------

const HW = 520;
const HH = 260;
const PAD = 32;

function HillView({ frames, index, curve }: { frames: HillFrame[]; index: number; curve?: [number, number | null][] }) {
  const points = frames.map((f) => [f.x, f.loss] as const).filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
  const shown = frames.slice(0, index + 1);
  const all = [...(curve ?? []).filter((p): p is [number, number] => p[1] !== null), ...points];
  if (!all.length) return <p className={styles.readout}>There&apos;s nothing to draw: every position or loss was not a number.</p>;
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  // Clip very tall curves so the interesting part of the valley stays visible.
  const sortedY = [...ys].sort((a, b) => a - b);
  const yTop = Math.min(Math.max(...ys), sortedY[Math.floor(sortedY.length * 0.9)]! * 1.5 + 1e-9);
  const y0 = Math.min(...ys);
  const sx = (x: number) => PAD + ((x - x0) / (x1 - x0 || 1)) * (HW - PAD * 2);
  const sy = (y: number) => HH - PAD - ((Math.min(y, yTop) - y0) / (yTop - y0 || 1)) * (HH - PAD * 2);
  const here = shown[shown.length - 1];
  const path = curve
    ?.filter((p) => p[1] !== null)
    .map((p, k) => `${k ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]!).toFixed(1)}`)
    .join(" ");
  const trail = shown.filter((f) => f.x !== null && f.loss !== null);

  return (
    <div className={styles.hillWrap}>
      <svg viewBox={`0 0 ${HW} ${HH}`} className={styles.hill} aria-hidden="true">
        <line x1={PAD} y1={HH - PAD} x2={HW - PAD} y2={HH - PAD} className={styles.axis} />
        <line x1={PAD} y1={PAD / 2} x2={PAD} y2={HH - PAD} className={styles.axis} />
        {path ? <path d={path} className={styles.curve} /> : null}
        {trail.length > 1 ? <polyline points={trail.map((f) => `${sx(f.x!).toFixed(1)},${sy(f.loss!).toFixed(1)}`).join(" ")} className={styles.trailLine} /> : null}
        {trail.slice(0, -1).map((f, k) => (
          <circle key={k} cx={sx(f.x!)} cy={sy(f.loss!)} r={3} className={styles.trail} />
        ))}
        {here && here.x !== null && here.loss !== null ? (
          <>
            <circle cx={sx(here.x)} cy={sy(here.loss)} r={12} className={styles.ballRing} />
            <circle cx={sx(here.x)} cy={sy(here.loss)} r={7} className={styles.ball} />
          </>
        ) : null}
        <text x={PAD} y={HH - 10} className={styles.tick}>
          {fmt(x0)}
        </text>
        <text x={HW - PAD} y={HH - 10} className={styles.tick} textAnchor="end">
          {fmt(x1)}
        </text>
        <text x={PAD + 6} y={PAD / 2 + 10} className={styles.tick}>
          loss
        </text>
      </svg>
      <p className={styles.readout} aria-live="polite">
        {here ? `Step ${index}: x = ${fmt(here.x, 4)}, loss = ${fmt(here.loss, 4)}.` : ""}
        {here?.loss !== null && here?.loss !== undefined && here.loss > yTop ? " Off the top of the drawing: the steps are too big." : ""}
      </p>
    </div>
  );
}
