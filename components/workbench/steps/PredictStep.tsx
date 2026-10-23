"use client";

import { useState } from "react";
import type { PredictStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { outputMatches } from "@/lib/content/answers";
import { recordMisconception } from "@/lib/store/progress";
import { Button } from "../../ui/Button";
import { FailIcon, PassIcon } from "../../ui/Icons";
import { CodeWorkspace } from "../CodeWorkspace";
import { useWorkbench } from "../context";
import { JobSummary, NextRow, Prose, StepHeading } from "./common";
import styles from "./steps.module.css";

/** Screen readers can't hear a line break, so say how many lines an output option has. */
export function optionLabel(text: string, prose: boolean): string {
  if (prose) return text;
  const lines = text.split("\n");
  if (lines.length === 1) return `One line: ${text}`;
  const words = ["", "One", "Two", "Three", "Four", "Five", "Six"];
  return `${words[lines.length] ?? lines.length} lines: ${lines.join(", then ")}`;
}

export function PredictStepView({ step, row }: { step: PredictStep; row: StepProgressRow }) {
  const { areas, updateStep, markPassed, store, react, logEvent } = useWorkbench();
  const committed = Boolean(row.data.committed);
  const [choice, setChoice] = useState<string>(row.predictChoice ?? "");
  const [typed, setTyped] = useState<string>(row.predictChoice ?? "");

  const chosenOption = step.options.find((o) => o.text === (committed ? row.predictChoice : choice));
  const correct = committed ? (step.kind === "typed" ? outputMatches(row.predictChoice ?? "", step.accept) : Boolean(chosenOption?.correct)) : null;

  const commit = async () => {
    const answer = step.kind === "typed" ? typed : choice;
    if (!answer) return;
    const option = step.options.find((o) => o.text === answer);
    const isRight = step.kind === "typed" ? outputMatches(answer, step.accept) : Boolean(option?.correct);
    await updateStep(step.id, (r) => ({ predictChoice: answer, attempts: r.attempts + 1, data: { ...r.data, committed: true } }));
    if (!isRight && option?.misconception && store) await recordMisconception(store, option.misconception);
    logEvent("predict", { correct: isRight, misconception: option?.misconception ?? null });
    void react("moss", isRight ? "predict-right" : "predict-wrong");
  };

  const onRun = async () => {
    if (!committed) return;
    await markPassed(step.id, { data: { ...row.data, committed: true, ran: true } });
  };

  return (
    <>
      <div className={areas.brief}>
        <JobSummary />
        <StepHeading step={step} />
        <Prose html={step.html} />
        <p className={styles.question} id={`q-${step.id}`} dangerouslySetInnerHTML={{ __html: step.questionHtml }} />
        {step.kind === "typed" ? (
          <div className={styles.row}>
            <textarea
              className={styles.field}
              rows={Math.max(1, (step.accept[0] ?? "").split("\n").length)}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={committed}
              aria-labelledby={`q-${step.id}`}
              spellCheck={false}
            />
          </div>
        ) : (
          <fieldset className={styles.options} aria-labelledby={`q-${step.id}`} disabled={committed}>
            {step.options.map((o) => {
              const picked = (committed ? row.predictChoice : choice) === o.text;
              const cls = [styles.option, picked ? styles.chosen : "", committed && picked ? (o.correct ? styles.right : styles.wrong) : "", committed && !picked && o.correct ? styles.right : "", committed ? styles.locked : ""].join(" ");
              // Options that are program output are set in the code font; sentences ("An error") in the UI font.
              const prose = o.error !== null || /^(An? |It |Line \d+$|The |Nothing|Only )/.test(o.text);
              return (
                <label key={o.text} className={cls}>
                  <input type="radio" name={`predict-${step.id}`} value={o.text} checked={picked} onChange={() => setChoice(o.text)} aria-label={optionLabel(o.text, prose)} />
                  {prose ? <span className={styles.optionText}>{o.text}</span> : <pre>{o.text}</pre>}
                </label>
              );
            })}
          </fieldset>
        )}
        {!committed ? (
          <div className={styles.row}>
            <Button variant="primary" onClick={() => void commit()} disabled={step.kind === "typed" ? !typed.trim() : !choice}>
              Commit to this answer
            </Button>
          </div>
        ) : (
          <div className={[styles.feedback, correct ? styles.feedbackGood : styles.feedbackBad].join(" ")} role="status">
            <p className={styles.feedbackTitle}>
              {correct ? <PassIcon /> : <FailIcon />}
              {correct ? "Right." : "Not quite."}
            </p>
            {step.kind === "typed" ? <p>{correct ? "That's exactly what it prints." : `It prints ${JSON.stringify(step.accept[0])}. Run it to see.`}</p> : <p dangerouslySetInnerHTML={{ __html: chosenOption?.feedback ?? "" }} />}
            {!correct && step.kind !== "typed" ? (
              <p>The answer is marked in green. Run it and watch.</p>
            ) : null}
          </div>
        )}
        {committed && step.afterHtml ? <Prose html={step.afterHtml} /> : null}
        {committed && !row.data.ran ? <p className={styles.nextNote}>Press Run to see it happen.</p> : null}
        <NextRow row={row} />
      </div>
      <div className={areas.stage}>
        <CodeWorkspace
          stepId={step.id}
          files={["main.py"]}
          starter={{ "main.py": step.code }}
          readOnly
          showReset={false}
          runDisabledReason={committed ? null : "Commit to an answer first. Then run it."}
          onRun={() => void onRun()}
        />
      </div>
    </>
  );
}
