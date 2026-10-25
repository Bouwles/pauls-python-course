"use client";

import { useRef } from "react";
import type { CheckableStep } from "@/lib/content/types";
import type { CheckReport, Files, RunResult } from "@/lib/python/protocol";
import type { StepProgressRow } from "@/lib/store/types";
import { CodeWorkspace } from "../CodeWorkspace";
import { DennisPanel } from "../DennisPanel";
import { Hints } from "../Hints";
import { InDialogue, InDrawer } from "../Slots";
import { useWorkbench } from "../context";
import { cuesFromCheck, cuesFromRun } from "@/lib/reactions";
import { NextRow, Prose, StepHeading } from "./common";
import { Ticket } from "../Ticket";
import styles from "./steps.module.css";

/** Lines that do something: not blank, not a comment. */
function codeLines(source: string | undefined): number {
  return (source ?? "").split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).length;
}

function allRequiredPassed(report: CheckReport) {
  return report.status === "ok" && report.results.length > 0 && report.results.filter((r) => !r.stretch).every((r) => r.passed);
}

/** Pip's Version, Fix, Modify and Make: write code, Check it against real tests. */
export function CodeStepView({ step, row }: { step: CheckableStep; row: StepProgressRow }) {
  const { areas, job, updateStep, markPassed, react, sayLine, cue, characters } = useWorkbench();
  const filesRef = useRef<(() => Files) | null>(null);
  const passed = row.status === "passed";
  const seen = row.status === "seen-solution";

  // Pip says his piece again when the bug is fixed.
  const pipAfter = step.type === "pips" ? step.dialogueAfter : [];

  const onCheck = async (report: CheckReport, files: Files) => {
    const ok = allRequiredPassed(report);
    const attemptsBefore = row.attempts;
    await updateStep(step.id, (r) => ({ attempts: r.attempts + 1 }));
    const cues = cuesFromCheck(report, attemptsBefore, ok, {
      pipsStep: step.type === "pips",
      shorterThanPip: codeLines(files[step.entry]) < codeLines(step.starter[step.entry]),
      hintsUsed: row.hintsUsed,
    });
    if (ok) {
      await markPassed(step.id);
      // The step's own line comes first; a reaction to how it went follows it.
      if (step.onPass) sayLine(step.onPass.who, step.onPass.text, "pleased");
      else if (pipAfter[0]) sayLine(pipAfter[0].who, pipAfter[0].text, "proud");
      void cue(step.onPass || pipAfter[0] ? cues.filter((c) => c.event !== "check-passed") : cues, { after: Boolean(step.onPass || pipAfter[0]) });
    } else {
      void cue(cues);
    }
  };

  const onRun = (result: RunResult) => {
    if (result.status === "stopped") void react("moss", "stopped-loop");
    else void cue(cuesFromRun(result));
  };

  const passLine = passed ? (step.onPass ? `${characters[step.onPass.who]?.name ?? step.onPass.who}: ${step.onPass.text}` : pipAfter[0] ? `Pip: ${pipAfter[0].text}` : null) : null;

  return (
    <>
      <Ticket>
        <StepHeading step={step} />
        <Prose html={step.html} />
        {step.visibleTests.length ? (
          <section className={styles.visible} aria-labelledby={`visible-${step.id}`}>
            <h3 id={`visible-${step.id}`} className="label">
              Checks you can see
            </h3>
            <ul className={styles.visibleList}>
              {step.visibleTests.map((t) => (
                <li key={t.name} className={styles.visibleItem}>
                  <span className={styles.visibleName}>{t.name}</span>
                  {t.kind === "output" && t.inputs && t.inputs.length ? <pre aria-label="Typed in">{t.inputs.join("\n")}</pre> : null}
                  {t.kind === "output" && t.expect !== undefined && t.match !== "regex" ? <pre aria-label="Prints">{t.expect}</pre> : null}
                  {(t.kind === "function" || t.kind === "variable") && t.call ? <pre aria-label="Call">{`${t.call}  gives  ${t.expect}`}</pre> : null}
                </li>
              ))}
            </ul>
            {step.requiredCount > step.visibleTests.length ? (
              <p className={styles.nextNote}>
                Plus {step.requiredCount - step.visibleTests.filter((t) => !t.stretch).length} more with different values when you press Check.
              </p>
            ) : null}
          </section>
        ) : null}
        {seen ? <p className={styles.nextNote}>You&apos;ve seen the solution for this one. A fresh version will turn up in your review.</p> : null}
        <NextRow row={row} doneText={passed && step.type === "make" ? "Next is the Ship." : undefined} />
      </Ticket>
      <div className={areas.stage}>
        <CodeWorkspace
          stepId={step.id}
          files={step.files}
          entry={step.entry}
          starter={step.starter}
          starterFrom={step.starterFrom}
          checkKey={`${job.id}/${step.id}`}
          timeoutMs={step.timeoutMs}
          onCheck={(r, files) => void onCheck(r, files)}
          onRun={onRun}
          passLine={passLine}
          filesRef={filesRef}
          argvField={step.argvField}
        />
      </div>
      {step.hints ? (
        <InDialogue>
          <Hints step={step} hints={step.hints} row={row} />
        </InDialogue>
      ) : null}
      <InDrawer>
        <DennisPanel stepId={step.id} row={row} source={() => filesRef.current?.()[step.entry] ?? ""} />
      </InDrawer>
    </>
  );
}
