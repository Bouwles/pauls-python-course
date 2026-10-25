"use client";

import { useState } from "react";
import type { StepProgressRow } from "@/lib/store/types";
import { pickLine } from "@/lib/reactions";
import { Button } from "../ui/Button";
import { useWorkbench } from "./context";
import styles from "./DennisPanel.module.css";

/** Explain it to Dennis (Section 9.6). Dennis never answers. That's the point. */
export function DennisPanel({ stepId, row, source }: { stepId: string; row: StepProgressRow; source: () => string }) {
  const { characters, store, updateStep, markLine, logEvent, setDennisOpen } = useWorkbench();
  const saved = (row.data.dennis ?? {}) as { should?: string; does?: string; line?: number };
  const [should, setShould] = useState(saved.should ?? "");
  const [does, setDoes] = useState(saved.does ?? "");
  const [line, setLine] = useState<number>(saved.line ?? 1);
  const [narration, setNarration] = useState<string | null>(null);

  const lines = source().split("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStep(stepId, (r) => ({ data: { ...r.data, dennis: { should, does, line } } }));
    markLine(line);
    setNarration((await pickLine(store, characters, "dennis", "after-explain")) ?? "Dennis waits.");
    window.dispatchEvent(new CustomEvent("ppc:visualise", { detail: line }));
    logEvent("dennis", { line });
  };

  return (
    <form className={styles.panel} onSubmit={submit} aria-label="Explain it to Dennis">
      <p className={styles.intro}>Say it out loud, or type it. Dennis won&apos;t answer. That&apos;s the point.</p>
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
          Tell Dennis
        </Button>
        <Button
          type="button"
          variant="quiet"
          onClick={() => {
            setDennisOpen(false);
            markLine(null);
            setNarration(null);
          }}
        >
          Close
        </Button>
      </div>
      {narration ? (
        <p className={styles.narration} role="status">
          {narration} Line {line} is marked in the editor, and the step-through below starts there.
        </p>
      ) : null}
    </form>
  );
}
