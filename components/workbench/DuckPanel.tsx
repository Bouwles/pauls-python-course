"use client";

import { useState } from "react";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { useWorkbench } from "./context";
import styles from "./DuckPanel.module.css";

/**
 * Explain it to the duck (Section 9.6). The duck never answers. That's the point: saying what the
 * code should do and what it does is usually enough to see the gap. Then the line that surprised
 * you is marked, and the step-through starts there.
 */
export function DuckPanel({ stepId, row, source }: { stepId: string; row: StepProgressRow; source: () => string }) {
  const { updateStep, markLine, logEvent, setDuckOpen, react, compact } = useWorkbench();
  // Saved under the old key too, so explanations written before the rename still come back.
  const saved = (row.data.duck ?? row.data.dennis ?? {}) as { should?: string; does?: string; line?: number };
  const [should, setShould] = useState(saved.should ?? "");
  const [does, setDoes] = useState(saved.does ?? "");
  const [line, setLine] = useState<number>(saved.line ?? 1);
  const [told, setTold] = useState(false);

  const lines = source().split("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStep(stepId, (r) => ({ data: { ...r.data, duck: { should, does, line } } }));
    markLine(line);
    setTold(true);
    void react("after-explain");
    window.dispatchEvent(new CustomEvent("ppc:visualise", { detail: line }));
    logEvent("duck", { line });
  };

  return (
    <form className={styles.panel} onSubmit={submit} aria-label="Explain it to the duck">
      <p className={styles.intro}>Say it out loud, or type it. The duck won&apos;t answer. That&apos;s the point.</p>
      <label className={styles.field}>
        <span>What should this do?</span>
        <textarea rows={3} value={should} onChange={(e) => setShould(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>What does it actually do?</span>
        <textarea rows={3} value={does} onChange={(e) => setDoes(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>Which line is the first one that surprises you?</span>
        <select value={line} onChange={(e) => setLine(Number(e.target.value))}>
          {lines.map((l, i) => (
            <option key={i} value={i + 1}>
              {`${i + 1}: ${l.trim().slice(0, 48) || "(empty)"}`}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.row}>
        <Button type="submit" variant="primary" disabled={!should.trim() || !does.trim()}>
          Tell the duck
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setDuckOpen(false);
            markLine(null);
            setTold(false);
          }}
        >
          Close
        </Button>
      </div>
      {told ? (
        <p className={styles.status} role="status">
          The duck listens. Line {line} is marked in the editor, and the step-through {compact ? "in Output" : "below it"} starts there.
        </p>
      ) : null}
    </form>
  );
}
