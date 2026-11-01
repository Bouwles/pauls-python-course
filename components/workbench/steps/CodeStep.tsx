"use client";

import { useRef } from "react";
import type { CheckableStep } from "@/lib/content/types";
import type { CheckReport, Files, RunResult } from "@/lib/python/protocol";
import type { StepProgressRow } from "@/lib/store/types";
import { cuesFromCheck, cuesFromRun } from "@/lib/reactions";
import { CodeWorkspace } from "../CodeWorkspace";
import { DuckPanel } from "../DuckPanel";
import { Hints } from "../Hints";
import { Instructions } from "../Instructions";
import { useWorkbench } from "../context";
import { NextRow, isDone } from "./common";
import styles from "./steps.module.css";

/** Lines that do something: not blank, not a comment. */
function codeLines(source: string | undefined): number {
  return (source ?? "").split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).length;
}

function allRequiredPassed(report: CheckReport) {
  return report.status === "ok" && report.results.length > 0 && report.results.filter((r) => !r.stretch).every((r) => r.passed);
}

/** Fix a classmate's version, Fix, Modify and Build: write code, Check it against real tests. */
export function CodeStepView({ step, row }: { step: CheckableStep; row: StepProgressRow }) {
  const { areas, job, updateStep, markPassed, react, say, cue, classmate } = useWorkbench();
  const filesRef = useRef<(() => Files) | null>(null);
  const passed = row.status === "passed";
  const seen = row.status === "seen-solution";

  // The classmate says their piece again when their version is fixed.
  const after = step.type === "pips" ? step.dialogueAfter : [];

  const onCheck = async (report: CheckReport, files: Files) => {
    const ok = allRequiredPassed(report);
    const attemptsBefore = row.attempts;
    await updateStep(step.id, (r) => ({ attempts: r.attempts + 1 }));
    const cues = cuesFromCheck(report, attemptsBefore, ok, {
      classmateStep: step.type === "pips",
      shorterThanTheirs: codeLines(files[step.entry]) < codeLines(step.starter[step.entry]),
      hintsUsed: row.hintsUsed,
      classmate,
    });
    if (ok) {
      await markPassed(step.id);
      // One line when it passes: the step's own, or the classmate's thanks, or a reaction. A pass
      // is said pleased with a thumbs up unless the line says how.
      if (step.onPass) say(step.onPass.who, step.onPass.text, { face: step.onPass.face ?? "pleased", gesture: step.onPass.gesture ?? "thumbs", kind: "pass" });
      else if (after[0]) say(after[0].who, after.filter((l) => l.who === after[0]!.who), { face: "pleased", gesture: "cheer", kind: "pass" });
      else void cue(cues);
    } else if (attemptsBefore >= 1 || report.status === "syntax-error") {
      // The coach stays quiet on a first miss: the checks already say what happened.
      void cue(cues, "error");
    }
  };

  const onRun = (result: RunResult) => {
    if (result.status === "stopped") void react("stopped-loop");
    else void cue(cuesFromRun(result));
  };

  return (
    <>
      <Instructions
        step={step}
        hints={step.hints ? <Hints stepId={step.id} hints={step.hints} row={row} /> : null}
        duck={<DuckPanel stepId={step.id} row={row} source={() => filesRef.current?.()[step.entry] ?? ""} />}
        checks={step.visibleTests.length ? { tests: step.visibleTests, required: step.requiredCount } : null}
        footer={<NextRow row={row} editor doneText={passed && step.type === "make" ? "Next is the Ship." : undefined} />}
      >
        {seen ? <p className={styles.note}>You&apos;ve seen the solution for this one. A fresh version will turn up in your review.</p> : null}
      </Instructions>
      <div className={areas.stage}>
        <CodeWorkspace
          stepId={step.id}
          files={step.files}
          entry={step.entry}
          starter={step.starter}
          starterFrom={step.starterFrom}
          checkKey={`${job.id}/${step.id}`}
          checkCount={step.requiredCount}
          timeoutMs={step.timeoutMs}
          onCheck={(r, files) => void onCheck(r, files)}
          onRun={onRun}
          filesRef={filesRef}
          argvField={step.argvField}
          done={isDone(row)}
        />
      </div>
    </>
  );
}
