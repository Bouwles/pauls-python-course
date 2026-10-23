"use client";

// Living Visualisations the learner's own code sends with the saltmarsh module
// (Section 7.6): Sir Reginald on his racing grid, the town map as a graph, and
// the hiker on the observatory hill. One frame per call, played back sped up,
// with pause and step.
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphFrame, GridFrame, HillFrame, Move, Visuals } from "@/lib/python/protocol";
import { BUILDINGS, MAP_H, MAP_W } from "@/lib/world/map";
import { loadIndex, integerScale, type SheetMeta } from "../world/sprites";
import { SpriteFrame } from "../world/SpriteFrame";
import { Button } from "../ui/Button";
import styles from "./LivingPlayer.module.css";

const SPEEDS = [
  { label: "Slow", fps: 3 },
  { label: "Quick", fps: 10 },
  { label: "Fast", fps: 30 },
];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
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

  const heading = frame.kind === "grid" ? "Sir Reginald's track" : frame.kind === "graph" ? "The town as a graph" : "The observatory hill";

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
              onClick={() => {
                if (!playing && i >= last) setI(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : i >= last ? "Replay" : "Play"}
            </Button>
            <Button size="sm" variant="quiet" onClick={() => (setPlaying(false), setI((x) => Math.max(0, x - 1)))} disabled={i === 0}>
              Back
            </Button>
            <Button size="sm" variant="quiet" onClick={() => (setPlaying(false), setI((x) => Math.min(last, x + 1)))} disabled={i >= last}>
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
// Sir Reginald's racing grid
// ---------------------------------------------------------------------------

const ARROW: Record<Exclude<Move, null>, string> = { "^": "↑", v: "↓", "<": "←", ">": "→" };
const ACTION_NAMES = ["up", "down", "left", "right"];

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
  const tile = small ? 26 : 40;
  const isAt = (cells: [number, number][] | undefined, r: number, c: number) => cells?.some(([a, b]) => a === r && b === c) ?? false;
  const moved = prev?.crab && frame.crab && (prev.crab[0] !== frame.crab[0] || prev.crab[1] !== frame.crab[1]);

  const describeTile = (r: number, c: number) => {
    const v = frame.values[r]?.[c];
    const parts = [`Row ${r}, column ${c}.`];
    if (isAt(frame.walls, r, c)) parts.push("A wall.");
    else parts.push(`Value ${fmt(v)}.`);
    if (isAt(frame.goal, r, c)) parts.push("The finish.");
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

  const crabText = frame.crab ? `Sir Reginald is at row ${frame.crab[0]}, column ${frame.crab[1]}.` : "";

  return (
    <div className={styles.gridWrap}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gridAutoRows: `${tile}px` }}
        role="group"
        aria-label={`The track, ${rows} rows by ${cols} columns. ${crabText} Use the arrow keys to read each tile; the line below says what's there.`}
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
                style={wall ? undefined : ({ "--tint": t > 0 ? `rgba(81, 128, 120, ${t * 0.75})` : `rgba(155, 68, 58, ${-t * 0.6})` } as React.CSSProperties)}
                onMouseEnter={() => setSel([r, c])}
                aria-hidden="true"
              >
                {!small && frame.numbers !== false && !wall && v !== null ? <span className={styles.value}>{fmt(v, Math.abs(v) >= 10 ? 0 : 1)}</span> : null}
                {move && !wall ? <span className={styles.arrow}>{ARROW[move]}</span> : null}
                {crab ? <SpriteFrame sprite="reginald" frame={moved ? "scuttle" : "idle"} scale={small ? 1 : 2} className={styles.crab} /> : null}
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
// The town map as a graph
// ---------------------------------------------------------------------------

const ALIASES: Record<string, string> = {
  harbour: "harbour-office",
  "harbour-master": "harbour-office",
  "harbour-masters-hut": "harbour-office",
  ferry: "ferry-dock",
  anchor: "pub",
  "drowned-anchor": "pub",
  "mosss-workshop": "workshop",
  moss: "workshop",
  okonjo: "tailor",
  sanjay: "greengrocer",
  "sanjays-greengrocer": "greengrocer",
  "brannigans-scrapyard": "scrapyard",
  "crab-racing-club": "crab-club",
  "hollis-bakery": "bakery",
  "okonjo-tailor": "tailor",
  "bike-hire-shed": "bike-shed",
  records: "records-office",
  weather: "weather-station",
};

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/^the[\s_-]+/, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildingFor(name: string) {
  const s = slug(name);
  const id = ALIASES[s] ?? s;
  return BUILDINGS.find((b) => b.x >= 0 && (b.id === id || slug(b.name) === s));
}

function GraphView({ frame }: { frame: GraphFrame }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);
  const [metas, setMetas] = useState<Record<string, SheetMeta> | null>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const onMap = frame.nodes.length > 0 && frame.nodes.every((n) => buildingFor(n));
  useEffect(() => {
    if (onMap) void loadIndex().then((idx) => setMetas(idx.sprites));
  }, [onMap]);

  const pos = useMemo(() => {
    const out: Record<string, [number, number]> = {};
    if (onMap) {
      for (const n of frame.nodes) {
        const b = buildingFor(n)!;
        const m = metas?.[b.sprite];
        out[n] = [b.x + (m ? m.w / 2 : 12), b.y + (m ? m.h + 3 : 24)];
      }
      return out;
    }
    if (frame.positions && frame.nodes.every((n) => frame.positions![n])) {
      const xs = frame.nodes.map((n) => frame.positions![n]![0]);
      const ys = frame.nodes.map((n) => frame.positions![n]![1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      for (const n of frame.nodes) {
        const [x, y] = frame.positions![n]!;
        out[n] = [30 + ((x - x0) / (x1 - x0 || 1)) * (MAP_W - 60), 24 + ((y - y0) / (y1 - y0 || 1)) * (MAP_H - 48)];
      }
      return out;
    }
    frame.nodes.forEach((n, k) => {
      const a = (k / frame.nodes.length) * Math.PI * 2 - Math.PI / 2;
      out[n] = [MAP_W / 2 + Math.cos(a) * (MAP_W / 2 - 50), MAP_H / 2 + Math.sin(a) * (MAP_H / 2 - 28)];
    });
    return out;
  }, [frame, onMap, metas]);

  // Frame the part of the map the graph uses, then scale it by a whole number.
  const box = useMemo(() => {
    const ps = Object.values(pos);
    if (!ps.length) return { x: 0, y: 0, w: MAP_W, h: MAP_H };
    const margin = 34;
    let x0 = Math.max(0, Math.min(...ps.map((q) => q[0])) - margin);
    let x1 = Math.min(MAP_W, Math.max(...ps.map((q) => q[0])) + margin);
    let y0 = Math.max(0, Math.min(...ps.map((q) => q[1])) - margin);
    let y1 = Math.min(MAP_H, Math.max(...ps.map((q) => q[1])) + margin);
    if (x1 - x0 < 180) [x0, x1] = [Math.max(0, (x0 + x1) / 2 - 90), Math.min(MAP_W, (x0 + x1) / 2 + 90)];
    if (y1 - y0 < 110) [y0, y1] = [Math.max(0, (y0 + y1) / 2 - 55), Math.min(MAP_H, (y0 + y1) / 2 + 55)];
    return { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) };
  }, [pos]);
  const k = integerScale(box.w, width, 3);
  const u = 1 / k; // one screen pixel, in map units

  // Each label goes below its node, or above when that would overlap a label already placed.
  const labelAbove = useMemo(() => {
    const placed: { x0: number; x1: number; y: number; above: boolean }[] = [];
    const out: Record<string, boolean> = {};
    const order = [...frame.nodes].sort((a, b) => (pos[a]?.[0] ?? 0) - (pos[b]?.[0] ?? 0));
    for (const n of order) {
      const p = pos[n];
      if (!p) continue;
      const d = frame.distances?.[n];
      const chars = n.length + (d !== undefined ? 4 : 0);
      const half = (chars * 6.8 * u) / 2;
      const clash = (above: boolean) => placed.some((q) => q.above === above && Math.abs(q.y - p[1]) < 18 * u && q.x0 < p[0] + half + 3 * u && q.x1 > p[0] - half - 3 * u);
      const above = clash(false) && !clash(true);
      out[n] = above;
      placed.push({ x0: p[0] - half, x1: p[0] + half, y: p[1], above });
    }
    return out;
  }, [frame.nodes, frame.distances, pos, u]);
  const onPath = new Set<string>();
  for (let p = 0; p + 1 < frame.path.length; p++) onPath.add(`${frame.path[p]}|${frame.path[p + 1]}`), onPath.add(`${frame.path[p + 1]}|${frame.path[p]}`);
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

  return (
    <div className={styles.graphWrap} ref={host}>
      <svg width={box.w * k} height={box.h * k} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} className={styles.graph} role="img" aria-label={`${frame.nodes.length} places and ${edges.length} roads. ${summary}`}>
        {onMap ? (
          <>
            <image href="/sprites/map-terrain.png" x={0} y={0} width={MAP_W * 2} height={MAP_H} clipPath="url(#ppc-map-clip)" style={{ imageRendering: "pixelated" }} opacity={0.55} />
            <clipPath id="ppc-map-clip">
              <rect x={0} y={0} width={MAP_W} height={MAP_H} />
            </clipPath>
            {metas
              ? BUILDINGS.filter((b) => b.x >= 0 && metas[b.sprite]).map((b) => {
                  const m = metas[b.sprite]!;
                  const count = Math.max(0, ...Object.values(m.frames)) + 1;
                  const f = m.frames.open ?? 0;
                  return (
                    <svg key={b.id} x={b.x} y={b.y} width={m.w} height={m.h} viewBox={`${f * m.w} 0 ${m.w} ${m.h}`} opacity={0.7}>
                      <image href={`/sprites/${b.sprite}.png`} width={m.w * count} height={m.h} style={{ imageRendering: "pixelated" }} />
                    </svg>
                  );
                })
              : null}
          </>
        ) : (
          <rect x={0} y={0} width={MAP_W} height={MAP_H} className={styles.paper} />
        )}
        {edges.map(([a, b, w]) => {
          const pa = pos[a];
          const pb = pos[b];
          if (!pa || !pb) return null;
          const hot = onPath.has(`${a}|${b}`);
          return (
            <g key={`${a}|${b}`}>
              <line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} className={hot ? styles.edgeHot : styles.edge} strokeWidth={(hot ? 3 : 1.5) * u} />
              {w !== null ? (
                <text x={(pa[0] + pb[0]) / 2} y={(pa[1] + pb[1]) / 2} fontSize={11 * u} className={styles.weight} strokeWidth={3 * u} textAnchor="middle" dominantBaseline="middle">
                  {fmt(w)}
                </text>
              ) : null}
            </g>
          );
        })}
        {frame.nodes.map((n) => {
          const p = pos[n];
          if (!p) return null;
          const cls = n === frame.current ? styles.nodeCurrent : visited.has(n) ? styles.nodeVisited : frontier.has(n) ? styles.nodeFrontier : styles.node;
          const d = frame.distances?.[n];
          return (
            <g key={n}>
              <circle cx={p[0]} cy={p[1]} r={6 * u} className={cls} strokeWidth={2 * u} />
              <text x={p[0]} y={labelAbove[n] ? p[1] - 10 * u : p[1] + 10 * u} fontSize={11 * u} className={styles.nodeLabel} strokeWidth={3 * u} textAnchor="middle" dominantBaseline={labelAbove[n] ? "auto" : "hanging"}>
                {n}
                {d !== undefined ? ` (${d === null ? "?" : fmt(d)})` : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <p className={styles.readout} aria-live="polite">
        {summary || "Nothing visited yet."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The hiker on the observatory hill
// ---------------------------------------------------------------------------

const HW = 340;
const HH = 200;
const PAD = 24;

function HillView({ frames, index, curve }: { frames: HillFrame[]; index: number; curve?: [number, number | null][] }) {
  const points = frames.map((f) => [f.x, f.loss] as const).filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
  const shown = frames.slice(0, index + 1);
  const all = [...(curve ?? []).filter((p): p is [number, number] => p[1] !== null), ...points];
  if (!all.length) return <p className={styles.readout}>The hiker has nowhere to stand: every position or loss was not a number.</p>;
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
  const prevX = shown.length > 1 ? shown[shown.length - 2]!.x : null;
  const walking = here && prevX !== null && here.x !== prevX;
  const path = curve
    ?.filter((p) => p[1] !== null)
    .map((p, k) => `${k ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]!).toFixed(1)}`)
    .join(" ");

  return (
    <div className={styles.hillWrap}>
      <div className={styles.hill} style={{ width: HW, height: HH }}>
        <svg width={HW} height={HH} viewBox={`0 0 ${HW} ${HH}`} aria-hidden="true">
          <line x1={PAD} y1={HH - PAD} x2={HW - PAD} y2={HH - PAD} className={styles.axis} />
          {path ? <path d={path} className={styles.curve} /> : null}
          {shown.map((f, k) =>
            f.x !== null && f.loss !== null ? <circle key={k} cx={sx(f.x)} cy={sy(f.loss)} r={k === shown.length - 1 ? 0 : 2} className={styles.trail} /> : null,
          )}
          <text x={PAD} y={HH - 6} className={styles.tick}>
            {fmt(x0)}
          </text>
          <text x={HW - PAD} y={HH - 6} className={styles.tick} textAnchor="end">
            {fmt(x1)}
          </text>
          <text x={4} y={14} className={styles.tick}>
            loss
          </text>
        </svg>
        {here && here.x !== null && here.loss !== null ? (
          <SpriteFrame sprite="hiker" frame={walking ? "walk" : "stand"} scale={2} className={styles.hiker} style={{ left: Math.round(sx(here.x)) - 8, top: Math.round(sy(here.loss)) - 22 }} />
        ) : null}
      </div>
      <p className={styles.readout} aria-live="polite">
        {here ? `Step ${index}: x = ${fmt(here.x, 4)}, loss = ${fmt(here.loss, 4)}.` : ""}
        {here?.loss !== null && here?.loss !== undefined && here.loss > yTop ? " Off the top of the drawing: the steps are too big." : ""}
      </p>
    </div>
  );
}
