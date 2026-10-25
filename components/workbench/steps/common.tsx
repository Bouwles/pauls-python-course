"use client";

import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { stepKind } from "../StepPath";
import { useWorkbench } from "../context";
import styles from "./steps.module.css";

export function Prose({ html }: { html: string }) {
  if (!html) return null;
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** "This step: Fix Pip's version", under the ticket's torn edge. No eyebrow label above it. */
export function StepHeading({ step }: { step: Step }) {
  const kind = stepKind(step);
  return (
    <h2 className={styles.heading}>
      <span className={styles.thisStep}>This step:</span> {step.title}
      {kind !== step.title && !step.title.toLowerCase().includes(kind.toLowerCase()) ? <span className="visually-hidden"> ({kind})</span> : null}
    </h2>
  );
}

/** The "Next step" row. Always available once the step is done; a quiet skip otherwise. */
export function NextRow({ row, doneText, allowSkip = true }: { row: StepProgressRow; doneText?: string; allowSkip?: boolean }) {
  const { nextStep, goNext } = useWorkbench();
  const done = row.status === "passed" || row.status === "seen-solution";
  if (!nextStep) return null;
  return (
    <div className={styles.next}>
      {done ? (
        <Button variant="primary" onClick={goNext}>
          Next step
        </Button>
      ) : allowSkip ? (
        <Button variant="quiet" onClick={goNext}>
          Skip to {stepKind(nextStep)}
        </Button>
      ) : null}
      {done && doneText ? <p className={styles.nextNote}>{doneText}</p> : null}
    </div>
  );
}
