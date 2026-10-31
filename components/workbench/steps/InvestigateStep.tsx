"use client";

import { useRef, useState } from "react";
import type { InvestigateStep, InvestigateTask } from "@/lib/content/types";
import type { CheckReport, Files, RunResult } from "@/lib/python/protocol";
import type { StepProgressRow } from "@/lib/store/types";
import { looseMatches } from "@/lib/content/answers";
import { cuesFromRun } from "@/lib/reactions";
import { Button } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { CodeWorkspace } from "../CodeWorkspace";
import { Instructions } from "../Instructions";
import { useWorkbench } from "../context";
import { NextRow, isDone } from "./common";
import styles from "./steps.module.css";

/** Investigate: run the code, answer questions about it, change it and check the change. */
export function InvestigateStepView({ step, row }: { step: InvestigateStep; row: StepProgressRow }) {
  const { areas, updateStep, markPassed, job, cue } = useWorkbench();
  const done = (row.data.tasks ?? {}) as Record<string, boolean>;
  const answers = (row.data.answers ?? {}) as Record<string, string>;
  const checkRef = useRef<((key: string) => Promise<CheckReport | null>) | null>(null);
  const filesRef = useRef<(() => Files) | null>(null);

  const complete = async (taskId: string, answer?: string) => {
    const tasks = { ...done, [taskId]: true };
    const all = step.tasks.every((t) => tasks[t.id]);
    const patch = { data: { ...row.data, tasks, answers: answer !== undefined ? { ...answers, [taskId]: answer } : answers } };
    if (all) await markPassed(step.id, patch);
    else await updateStep(step.id, patch);
  };

  return (
    <>
      <Instructions step={step} footer={<NextRow row={row} editor />}>
        <ol className={styles.tasks}>
          {step.tasks.map((t) => (
            <Task
              key={t.id}
              task={t}
              done={Boolean(done[t.id])}
              saved={answers[t.id] ?? ""}
              onDone={(a) => void complete(t.id, a)}
              check={() => checkRef.current?.(`${job.id}/${step.id}/${t.id}`) ?? Promise.resolve(null)}
              onAttempt={() => void updateStep(step.id, (r) => ({ attempts: r.attempts + 1 }))}
            />
          ))}
        </ol>
      </Instructions>
      <div className={areas.stage}>
        <CodeWorkspace stepId={step.id} files={["main.py"]} starter={{ "main.py": step.code }} checkRef={checkRef} filesRef={filesRef} onRun={(r: RunResult) => void cue(cuesFromRun(r))} done={isDone(row)} />
      </div>
    </>
  );
}

function Task({ task, done, saved, onDone, check, onAttempt }: { task: InvestigateTask; done: boolean; saved: string; onDone: (answer?: string) => void; check: () => Promise<CheckReport | null>; onAttempt: () => void }) {
  const [answer, setAnswer] = useState(saved);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(done && task.feedback ? { good: true, text: task.feedback } : null);
  const [checking, setChecking] = useState(false);

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    onAttempt();
    if (looseMatches(answer, task.accept)) {
      setFeedback({ good: true, text: task.feedback ?? "Right." });
      onDone(answer);
    } else {
      setFeedback({ good: false, text: task.wrong ?? "Not that. Run the code and look again." });
    }
  };

  const runCheck = async () => {
    setChecking(true);
    onAttempt();
    const report = await check();
    setChecking(false);
    if (!report) return;
    const ok = report.status === "ok" && report.results.filter((r) => !r.stretch).every((r) => r.passed);
    if (ok) {
      setFeedback({ good: true, text: task.feedback ?? "That works." });
      onDone();
    } else {
      const first = report.results.find((r) => !r.passed);
      setFeedback({ good: false, text: first?.hint ?? first?.message ?? "Not yet. The Checks tab shows what happened." });
    }
  };

  return (
    <li className={[styles.task, done ? styles.taskDone : ""].join(" ")}>
      <span className={styles.taskMark} aria-hidden="true">
        {done ? <Icon name="check" size={16} /> : null}
      </span>
      <div className={styles.taskBody}>
        <p className={styles.taskPrompt} dangerouslySetInnerHTML={{ __html: task.promptHtml }} />
        {task.kind === "answer" ? (
          <form className={styles.answerRow} onSubmit={submitAnswer}>
            <label className="visually-hidden" htmlFor={`a-${task.id}`}>
              Your answer
            </label>
            <input id={`a-${task.id}`} className={styles.answer} value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={done} autoComplete="off" spellCheck={false} />
            {!done ? (
              <Button type="submit" size="sm" variant="secondary" disabled={!answer.trim()}>
                Check answer
              </Button>
            ) : null}
          </form>
        ) : !done ? (
          <div>
            <Button size="sm" variant="secondary" icon="check" onClick={() => void runCheck()} disabled={checking}>
              {checking ? "Checking" : "Check my change"}
            </Button>
          </div>
        ) : null}
        {done ? <span className="visually-hidden">Done.</span> : null}
        {feedback ? <p className={[styles.taskFeedback, feedback.good ? styles.good : styles.bad].join(" ")} role="status" dangerouslySetInnerHTML={{ __html: feedback.text }} /> : null}
      </div>
    </li>
  );
}
