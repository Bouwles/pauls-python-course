"use client";

// Step-through visualiser (Section 9.4): the current line, the variables in
// each frame, and objects drawn as boxes with arrows. Living Visualisations
// (Section 7.6) read the same trace: lists become Mira's pigeonholes (or
// Nell's piles, for numbers), dictionaries the post office drawers, recursive
// calls Nell's junk tower, and Old Tom's lamp sweeps once for each loop pass.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HeapObject, TraceResult, TraceStep, TraceValue } from "@/lib/python/protocol";
import { Button } from "../ui/Button";
import { CodeBlock } from "./CodeBlock";
import styles from "./Visualiser.module.css";

function primText(v: TraceValue) {
  return v.k === "prim" ? v.v : "";
}

export function Visualiser({ trace, source, startLine, onLine }: { trace: TraceResult; source: string; startLine?: number | null; onLine?: (line: number) => void }) {
  const steps = trace.steps.filter((s) => s.file === trace.entry);
  const first = startLine ? Math.max(0, steps.findIndex((s) => s.line === startLine)) : 0;
  const [i, setI] = useState(first);
  const step = steps[Math.min(i, steps.length - 1)];
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step) onLine?.(step.line);
  }, [step, onLine]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setI((x) => Math.min(steps.length - 1, x + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setI((x) => Math.max(0, x - 1));
    } else if (e.key === "Home") setI(0);
    else if (e.key === "End") setI(steps.length - 1);
  };

  if (!step) {
    return <p className={styles.empty}>{trace.error ? `It stopped before the first line: ${trace.error.type}.` : "Nothing ran."}</p>;
  }

  return (
    <div className={styles.vis} ref={host} tabIndex={0} onKeyDown={onKey} aria-label="Step-through visualiser. Use the arrow keys to move between steps.">
      <div className={styles.bar}>
        <Button size="sm" variant="secondary" onClick={() => setI(0)} disabled={i === 0}>
          First
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          Back
        </Button>
        <Button size="sm" variant="primary" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>
          Forward
        </Button>
        <input className={styles.slider} type="range" min={0} max={steps.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="Step" />
        <span className={styles.count}>
          Step {i + 1} of {steps.length}
        </span>
      </div>
      {trace.status === "limit" ? <p className={styles.note}>Stopped after {trace.limit} steps. That is as far as the visualiser goes; a long loop is the usual reason.</p> : null}
      <p className={styles.where} aria-live="polite">
        {step.event === "return" ? `Line ${step.line}: returning ${step.ret ? describe(step.ret, step.heap) : "None"}.` : step.event === "exception" ? `Line ${step.line}: ${step.exc}.` : `About to run line ${step.line}.`}
      </p>
      <div className={styles.grid}>
        <div className={styles.code}>
          <CodeBlock code={source} highlight={step.line} label="The program, with the current line marked" />
        </div>
        <Memory step={step} />
      </div>
      <Living steps={steps} index={i} trace={trace} />
      <OutputSoFar trace={trace} step={step} />
    </div>
  );
}

function describe(v: TraceValue, heap: Record<string, HeapObject>): string {
  if (v.k === "prim") return v.v;
  const o = heap[v.id];
  if (!o) return "an object";
  if ("items" in o) return `a ${o.t} of ${o.items.length}`;
  if ("pairs" in o) return `a dict of ${o.pairs.length}`;
  if ("name" in o) return `${o.t} ${o.name}`;
  if ("cls" in o) return `a ${o.cls}`;
  return o.t;
}

function Memory({ step }: { step: TraceStep }) {
  const box = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const objects = Object.entries(step.heap);

  // Arrows from each reference dot to its object, measured after layout.
  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const r0 = root.getBoundingClientRect();
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    root.querySelectorAll<HTMLElement>("[data-ref]").forEach((dot) => {
      const target = root.querySelector<HTMLElement>(`[data-obj="${dot.dataset.ref}"]`);
      if (!target) return;
      const a = dot.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      out.push({ x1: a.left + a.width / 2 - r0.left, y1: a.top + a.height / 2 - r0.top, x2: b.left - r0.left, y2: b.top + 12 - r0.top });
    });
    setLines(out);
  }, [step]);

  return (
    <div className={styles.memory} ref={box}>
      <div className={styles.frames}>
        <p className="label">Frames</p>
        {step.stack.map((f, fi) => (
          <div key={fi} className={[styles.frame, fi === step.stack.length - 1 ? styles.top : ""].join(" ")}>
            <p className={styles.frameName}>{f.name === "global" ? "The program" : `${f.name}()`}</p>
            {f.vars.length === 0 ? <p className={styles.dim}>No variables yet.</p> : null}
            <table className={styles.vars}>
              <tbody>
                {f.vars.map(([name, v]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{v.k === "prim" ? <span className={styles.prim}>{v.v}</span> : <span className={styles.dot} data-ref={v.id} aria-label={`points to ${describe(v, step.heap)}`} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className={styles.objects}>
        <p className="label">Objects</p>
        {objects.length === 0 ? <p className={styles.dim}>None yet.</p> : null}
        {objects.map(([id, o]) => (
          <div key={id} className={styles.obj} data-obj={id}>
            <p className={styles.objType}>{"cls" in o ? o.cls : o.t}</p>
            <ObjectBody o={o} />
          </div>
        ))}
      </div>
      <svg className={styles.arrows} aria-hidden="true">
        <defs>
          <marker id="vis-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
          </marker>
        </defs>
        {lines.map((l, k) => (
          <path key={k} d={`M ${l.x1} ${l.y1} C ${l.x1 + 60} ${l.y1}, ${l.x2 - 60} ${l.y2}, ${l.x2} ${l.y2}`} fill="none" stroke="currentColor" strokeWidth="1.4" markerEnd="url(#vis-head)" />
        ))}
      </svg>
    </div>
  );
}

function ObjectBody({ o }: { o: HeapObject }) {
  if ("items" in o) {
    return (
      <div className={styles.cells}>
        {o.items.map((v, k) => (
          <span key={k} className={styles.cell}>
            <span className={styles.idx}>{k}</span>
            {v.k === "prim" ? v.v : <span className={styles.dot} data-ref={v.id} />}
          </span>
        ))}
        {o.items.length === 0 ? <span className={styles.dim}>empty</span> : null}
        {o.more ? <span className={styles.dim}>and {o.more} more</span> : null}
      </div>
    );
  }
  if ("pairs" in o) {
    return (
      <table className={styles.vars}>
        <tbody>
          {o.pairs.map(([k, v], n) => (
            <tr key={n}>
              <th scope="row">{primText(k) || "key"}</th>
              <td>{v.k === "prim" ? v.v : <span className={styles.dot} data-ref={v.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if ("attrs" in o) {
    return (
      <table className={styles.vars}>
        <tbody>
          {o.attrs.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v.k === "prim" ? v.v : <span className={styles.dot} data-ref={v.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if ("name" in o) return <p className={styles.prim}>{"params" in o ? `${o.name}(${o.params.join(", ")})` : o.name}</p>;
  return <p className={styles.prim}>{"repr" in o ? o.repr : ""}</p>;
}

/** Find the first variable (innermost frame first) that refers to a heap object of a given type. */
function findRef(step: TraceStep, test: (o: HeapObject) => boolean): [string, HeapObject] | null {
  for (let f = step.stack.length - 1; f >= 0; f--) {
    for (const [name, v] of step.stack[f]!.vars) {
      if (v.k !== "ref") continue;
      const o = step.heap[v.id];
      if (o && test(o)) return [name, o];
    }
  }
  return null;
}

function short(v: TraceValue, heap: Record<string, HeapObject>) {
  const text = describe(v, heap);
  return text.length > 24 ? `${text.slice(0, 23)}...` : text;
}

/** Old Tom's lamp, Mira's pigeonholes, Nell's piles and junk tower, and the post office drawers, drawn from the same steps. */
function Living({ steps, index, trace }: { steps: TraceStep[]; index: number; trace: TraceResult }) {
  const step = steps[index]!;
  const loop = trace.loops[0];
  const passes = useMemo(() => {
    if (!loop) return 0;
    let n = 0;
    for (let k = 0; k <= index; k++) {
      const s = steps[k]!;
      const prev = steps[k - 1];
      if (s.line > loop.line && s.line <= loop.end && (!prev || prev.line === loop.line)) n++;
    }
    return n;
  }, [steps, index, loop]);
  const listFound = findRef(step, (o) => o.t === "list");
  const listVar = listFound?.[0];
  const list = listFound ? (listFound[1] as { items: TraceValue[] }) : null;
  const dictFound = findRef(step, (o) => o.t === "dict" && (o as { pairs: unknown[] }).pairs.length > 0);
  const calls = step.stack.slice(1);
  const counts = new Map<string, number>();
  for (const f of calls) counts.set(f.name, (counts.get(f.name) ?? 0) + 1);
  const recursive = [...counts.values()].some((n) => n > 1);
  const numeric = list && list.items.length > 1 && list.items.every((v) => v.k === "prim" && /^-?\d+(\.\d+)?$/.test(v.v));
  if (!loop && !list && !dictFound && !recursive) return null;
  return (
    <div className={styles.living}>
      {loop ? (
        <div className={styles.lamp} aria-label={`Old Tom's lamp: ${passes} ${passes === 1 ? "pass" : "passes"} of the loop on line ${loop.line}`}>
          <div className={styles.lampTower} aria-hidden="true">
            <div className={styles.beam} data-pass={passes % 2} />
          </div>
          <p>
            Old Tom&apos;s lamp: {passes} {passes === 1 ? "pass" : "passes"} of the {loop.kind} loop on line {loop.line}.
          </p>
        </div>
      ) : null}
      {recursive ? (
        <div className={styles.holesWrap}>
          <p>Nell&apos;s junk tower: {calls.length} {calls.length === 1 ? "call" : "calls"} waiting</p>
          <div className={styles.tower}>
            {calls.map((f, k) => {
              const top = k === calls.length - 1;
              return (
                <span key={k} className={styles.crate} data-top={top}>
                  {f.name}({f.vars.slice(0, 3).map(([n, v]) => `${n}=${short(v, step.heap)}`).join(", ")})
                  {top && step.event === "return" && step.ret ? <span className={styles.crateGives}> gives {short(step.ret, step.heap)}</span> : null}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      {numeric && listVar ? (
        <div className={styles.holesWrap}>
          <p>Nell&apos;s piles: {listVar}</p>
          <div className={styles.bars} aria-label={`${listVar}: ${list!.items.map((v) => primText(v)).join(", ")}`}>
            {(() => {
              const nums = list!.items.map((v) => Number(primText(v) || 0));
              const top = Math.max(1, ...nums.map((n) => Math.abs(n)));
              return nums.map((n, k) => (
                <span key={k} className={styles.pile} style={{ height: `${Math.max(4, (Math.abs(n) / top) * 90)}px` }} title={String(n)}>
                  <span className={styles.pileLabel}>{n}</span>
                </span>
              ));
            })()}
          </div>
        </div>
      ) : list && listVar ? (
        <div className={styles.holesWrap}>
          <p>Mira&apos;s pigeonholes: {listVar}</p>
          <div className={styles.holes}>
            {list.items.length === 0 ? <span className={styles.dim}>All empty.</span> : null}
            {list.items.map((v, k) => (
              <span key={k} className={styles.hole}>
                <span className={styles.parcel}>{v.k === "prim" ? v.v : "..."}</span>
                <span className={styles.holeNo}>{k}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {dictFound ? (
        <div className={styles.holesWrap}>
          <p>The post office drawers: {dictFound[0]}</p>
          <div className={styles.drawers}>
            {(dictFound[1] as { pairs: [TraceValue, TraceValue][]; more: number }).pairs.slice(0, 24).map(([k, v], n) => (
              <span key={n} className={styles.drawer}>
                <span className={styles.drawerKey}>{short(k, step.heap)}</span>
                <span>{short(v, step.heap)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OutputSoFar({ trace, step }: { trace: TraceResult; step: TraceStep }) {
  const text = trace.output.slice(0, step.out);
  return (
    <div className={styles.out}>
      <p className="label">Printed so far</p>
      <pre>{text || " "}</pre>
    </div>
  );
}
