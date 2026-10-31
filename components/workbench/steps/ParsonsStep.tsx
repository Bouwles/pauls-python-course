"use client";

import { useRef, useState } from "react";
import type { ParsonsStep } from "@/lib/content/types";
import type { CheckReport } from "@/lib/python/protocol";
import type { StepProgressRow } from "@/lib/store/types";
import { PROFESSOR } from "@/lib/cast";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { highlightLines } from "../CodeBlock";
import cb from "../CodeBlock.module.css";
import { Hints } from "../Hints";
import { Instructions } from "../Instructions";
import { TestReport } from "../TestReport";
import { useWorkbench } from "../context";
import { NextRow } from "./common";
import styles from "./parsons.module.css";
import s from "./steps.module.css";

interface Placed {
  key: string;
  indent: number;
  locked?: boolean;
}

interface Arrangement {
  program: Placed[];
  fails: number;
}

const MAX_INDENT = 4;

function Code({ text }: { text: string }) {
  const segs = highlightLines(text)[0] ?? [];
  return (
    <code className={styles.code}>
      {segs.map((g, i) => (g.cls ? <span key={i} className={g.cls.split(" ").map((c) => cb[c] ?? "").join(" ")}>{g.text}</span> : g.text))}
    </code>
  );
}

export function ParsonsStepView({ step, row }: { step: ParsonsStep; row: StepProgressRow }) {
  const { areas, updateStep, markPassed, runner, job, react, logEvent, nameOf } = useWorkbench();
  const saved = row.data.parsons as Arrangement | undefined;
  const [arr, setArr] = useState<Arrangement>(saved ?? { program: [], fails: 0 });
  const [result, setResult] = useState<{ ok: boolean; message: string; report?: CheckReport } | null>(null);
  const [lockNote, setLockNote] = useState(false);
  const focusKey = useRef<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const dragging = useRef<{ key: string; from: "pool" | "program" } | null>(null);
  const passed = row.status === "passed";

  const codeOf = (key: string) => step.blocks.find((b) => b.key === key)?.code ?? "";
  const placedKeys = new Set(arr.program.map((p) => p.key));
  const pool = step.blocks.filter((b) => !placedKeys.has(b.key));

  const save = (next: Arrangement) => {
    setArr(next);
    setResult(null);
    void updateStep(step.id, (r) => ({ data: { ...r.data, parsons: next } }));
  };

  const refocus = (key: string) => {
    focusKey.current = key;
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-key="${key}"]`)?.focus());
  };

  const add = (key: string, at = arr.program.length, indent = 0) => {
    const program = arr.program.filter((p) => p.key !== key);
    program.splice(Math.min(at, program.length), 0, { key, indent });
    save({ ...arr, program });
    refocus(key);
  };
  const remove = (key: string) => save({ ...arr, program: arr.program.filter((p) => p.key !== key || p.locked) });
  const move = (key: string, delta: number) => {
    const i = arr.program.findIndex((p) => p.key === key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= arr.program.length || arr.program[i]!.locked || arr.program[j]!.locked) return;
    const program = arr.program.slice();
    [program[i], program[j]] = [program[j]!, program[i]!];
    save({ ...arr, program });
    refocus(key);
  };
  const indent = (key: string, delta: number) => {
    save({ ...arr, program: arr.program.map((p) => (p.key === key && !p.locked ? { ...p, indent: Math.max(0, Math.min(MAX_INDENT, p.indent + delta)) } : p)) });
    refocus(key);
  };

  const onKey = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Tab") {
      e.preventDefault();
      indent(key, e.shiftKey ? -1 : 1);
    } else if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      move(key, -1);
    } else if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      move(key, 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const i = arr.program.findIndex((p) => p.key === key);
      const next = arr.program[i + (e.key === "ArrowUp" ? -1 : 1)];
      if (next) refocus(next.key);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove(key);
    } else if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const d = dragging.current;
    if (!d || !listRef.current) return;
    const items = [...listRef.current.querySelectorAll<HTMLElement>("[data-key]")];
    let at = items.length;
    for (let i = 0; i < items.length; i++) {
      const r = items[i]!.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        at = i;
        break;
      }
    }
    const left = listRef.current.getBoundingClientRect().left;
    const ind = Math.max(0, Math.min(MAX_INDENT, Math.round((e.clientX - left - 24) / 28)));
    if (d.from === "program") {
      const from = arr.program.findIndex((p) => p.key === d.key);
      if (from >= 0 && from < at) at -= 1;
    }
    add(d.key, at, ind);
    dragging.current = null;
  };

  const assembled = arr.program.map((p) => "    ".repeat(p.indent) + codeOf(p.key)).join("\n") + "\n";

  const check = async () => {
    if (arr.program.length === 0) return;
    let ok: boolean;
    let report: CheckReport | undefined;
    if (step.check === "run") {
      report = (await runner.check({ ...job.data, "main.py": assembled }, `${job.id}/${step.id}`, "main.py", step.timeoutMs)) ?? undefined;
      ok = Boolean(report && report.status === "ok" && report.results.filter((r) => !r.stretch).every((r) => r.passed));
    } else {
      ok = arr.program.length === step.solutionOrder.length && arr.program.every((p, i) => p.key === step.solutionOrder[i]!.key && p.indent === step.solutionOrder[i]!.indent);
    }
    await updateStep(step.id, (r) => ({ attempts: r.attempts + 1 }));
    logEvent("parsons-check", { ok });
    if (ok) {
      setResult({ ok: true, message: "That runs, and it does the job." });
      await markPassed(step.id, { data: { ...row.data, parsons: arr } });
      void react("check-passed");
      return;
    }
    const fails = arr.fails + 1;
    let next: Arrangement = { ...arr, fails };
    let locked = false;
    if (fails >= 2 && fails % 2 === 0) {
      // Adaptive help: fix the first misplaced block in its correct place.
      const i = step.solutionOrder.findIndex((sol, idx) => arr.program[idx]?.key !== sol.key || arr.program[idx]?.indent !== sol.indent);
      if (i >= 0) {
        const sol = step.solutionOrder[i]!;
        const program = arr.program.filter((p) => p.key !== sol.key);
        program.splice(Math.min(i, program.length), 0, { key: sol.key, indent: sol.indent, locked: true });
        next = { program, fails };
        locked = true;
      }
    }
    setArr(next);
    await updateStep(step.id, (r) => ({ data: { ...r.data, parsons: next } }));
    setLockNote(locked);
    const hasDistractor = arr.program.some((p) => p.key.startsWith("d"));
    setResult({
      ok: false,
      message: hasDistractor ? "One of the blocks you used doesn't belong in this program." : step.check === "order" ? "Not in the right order yet. Watch the indentation too." : "Not yet. The report below shows what happened when it ran.",
      report,
    });
    if (fails >= 2) void react("check-failed");
  };

  const allBlocks = [...step.blocks, ...step.distractors];
  const poolBlocks = allBlocks.filter((b) => !placedKeys.has(b.key));

  return (
    <>
      <Instructions step={step} hints={step.hints ? <Hints stepId={step.id} hints={step.hints} row={row} /> : null} footer={<NextRow row={row} />}>
        <p className={s.note}>
          <Icon name="keys" size={16} />
          Drag blocks across, or use the buttons. On a block: Alt and the arrow keys move it, Tab and Shift+Tab indent it, Delete puts it back.
        </p>
      </Instructions>
      <div className={areas.stage}>
        <div className={styles.board}>
          <section className={styles.column} aria-labelledby="pool-title">
            <h2 id="pool-title" className="label">
              Blocks
            </h2>
            <ul className={styles.pool} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault();
              if (dragging.current?.from === "program") remove(dragging.current.key);
              dragging.current = null;
            }}>
              {poolBlocks.length === 0 ? <li className={styles.empty}>All the blocks are in your program.</li> : null}
              {poolBlocks.map((b) => (
                <li key={b.key}>
                  <button className={styles.block} draggable onDragStart={() => (dragging.current = { key: b.key, from: "pool" })} onClick={() => add(b.key)} aria-label={`Add: ${b.code}`}>
                    <Code text={b.code} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.column} aria-labelledby="program-title">
            <h2 id="program-title" className="label">
              Your program
            </h2>
            <ol ref={listRef} className={styles.program} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
              {arr.program.length === 0 ? <li className={styles.empty}>Drop blocks here, top to bottom.</li> : null}
              {arr.program.map((p, i) => (
                <li key={p.key} className={styles.placed} style={{ paddingLeft: `calc(${p.indent} * 28px)` }}>
                  <div
                    className={[styles.block, styles.inProgram, p.locked ? styles.locked : ""].join(" ")}
                    tabIndex={0}
                    data-key={p.key}
                    draggable={!p.locked}
                    onDragStart={() => (dragging.current = { key: p.key, from: "program" })}
                    onKeyDown={(e) => onKey(e, p.key)}
                    aria-label={`Line ${i + 1}, indent ${p.indent}: ${codeOf(p.key) || allBlocks.find((b) => b.key === p.key)?.code}${p.locked ? ", fixed in place" : ""}`}
                  >
                    <Code text={codeOf(p.key) || allBlocks.find((b) => b.key === p.key)?.code || ""} />
                    {!p.locked ? (
                      <span className={styles.controls}>
                        <button onClick={() => indent(p.key, -1)} aria-label="Outdent" disabled={p.indent === 0}>
                          <Icon name="caretLeft" size={16} />
                        </button>
                        <button onClick={() => indent(p.key, 1)} aria-label="Indent" disabled={p.indent === MAX_INDENT}>
                          <Icon name="caretRight" size={16} />
                        </button>
                        <button onClick={() => move(p.key, -1)} aria-label="Move up" disabled={i === 0}>
                          <Icon name="caretUp" size={16} />
                        </button>
                        <button onClick={() => move(p.key, 1)} aria-label="Move down" disabled={i === arr.program.length - 1}>
                          <Icon name="caretDown" size={16} />
                        </button>
                        <button onClick={() => remove(p.key)} aria-label="Put back">
                          <Icon name="close" size={16} />
                        </button>
                      </span>
                    ) : (
                      <span className={styles.lockMark}>fixed</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.actions}>
              <Button variant="primary" icon="check" onClick={() => void check()} disabled={arr.program.length === 0 || runner.state.phase !== "idle" || passed}>
                Check
              </Button>
              {lockNote ? <p className={styles.note}>{nameOf(PROFESSOR)} has fixed one block in its place.</p> : null}
            </div>
          </section>
        </div>
        {result ? (
          <div className={styles.result} aria-live="polite">
            <p className={result.ok ? styles.ok : styles.bad}>{result.message}</p>
            {result.report && !result.ok ? <TestReport report={result.report} progress={null} source={assembled} /> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
