"use client";

import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { useWorkbench } from "../context";
import styles from "./steps.module.css";

export { Prose } from "../Instructions";

export function isDone(row: StepProgressRow) {
  return row.status === "passed" || row.status === "seen-solution";
}

/**
 * The end of the instructions on steps without the editor: "Next step" once the step is done,
 * a quiet skip before then. Steps with the editor show "Next step" in its toolbar instead (and
 * here as well on a phone, where the toolbar is in the Code tab).
 */
export function NextRow({ row, doneText, allowSkip = true, editor = false }: { row: StepProgressRow; doneText?: string; allowSkip?: boolean; editor?: boolean }) {
  const { nextStep, goNext, compact } = useWorkbench();
  const done = isDone(row);
  if (!nextStep) return null;
  if (done) {
    // On a phone the editor's toolbar is in another tab, so the instructions carry Next step too.
    return (
      <>
        {editor && !compact ? null : (
          <Button variant="primary" icon="next" onClick={goNext}>
            Next step
          </Button>
        )}
        {doneText ? <p className={styles.note}>{doneText}</p> : null}
      </>
    );
  }
  return allowSkip ? (
    <Button variant="ghost" size="sm" onClick={goNext} className={styles.skip}>
      Skip this step
    </Button>
  ) : null;
}
