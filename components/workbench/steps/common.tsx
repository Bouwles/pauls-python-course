"use client";

import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { stepKind } from "../StepNav";
import { useWorkbench } from "../context";
import styles from "./steps.module.css";

export function Prose({ html }: { html: string }) {
  if (!html) return null;
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function StepHeading({ step }: { step: Step }) {
  return (
    <>
      {stepKind(step) !== step.title ? <p className={`label ${styles.kind}`}>{stepKind(step)}</p> : null}
      <h2 className={styles.heading}>{step.title}</h2>
    </>
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

/** The job's Ask, kept to hand in the brief for every later step. */
export function JobSummary() {
  const { job } = useWorkbench();
  const ask = job.steps.find((s) => s.type === "ask");
  if (!ask || ask.type !== "ask") return null;
  return (
    <details className={styles.job}>
      <summary>The job</summary>
      <div className={`${styles.jobBody} prose`}>
        <div dangerouslySetInnerHTML={{ __html: ask.specHtml }} />
        {ask.example ? <pre className={styles.terminal}>{ask.example}</pre> : null}
      </div>
    </details>
  );
}
