"use client";

import type { WorkedStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { PROFESSOR } from "@/lib/cast";
import { Button } from "../../ui/Button";
import { Console } from "../Console";
import { Instructions } from "../Instructions";
import { SelfExplain } from "../SelfExplain";
import { WorkedCode } from "../WorkedCode";
import { useWorkbench } from "../context";
import { NextRow } from "./common";
import styles from "./steps.module.css";

/** A worked example: Paul's code with its subgoals labelled, runnable, then a question about it. */
export function WorkedStepView({ step, row }: { step: WorkedStep; row: StepProgressRow }) {
  const { areas, runner, job, nameOf } = useWorkbench();
  const { state } = runner;
  const running = state.phase === "running";
  const ran = state.output.length > 0 || state.result !== null || state.phase !== "idle";
  return (
    <>
      <Instructions step={step} footer={<NextRow row={row} doneText="The labels beside the code are worth remembering. You'll use them next." />}>
        <SelfExplain stepId={step.id} promptHtml={step.explain.promptHtml} answer={step.explain.answer} concept={step.explain.concept} row={row} />
      </Instructions>
      <div className={areas.stage}>
        <div className={styles.workedStage}>
          <div className={styles.workedTop}>
            <WorkedCode code={step.code} subgoals={step.subgoals} language={step.language} />
          </div>
          {step.language === "python" ? (
            <div className={styles.workedRun} data-ran={ran || undefined}>
              <div className={styles.workedBar}>
                {running ? (
                  <Button size="sm" variant="danger" icon="stop" onClick={runner.stop}>
                    Stop
                  </Button>
                ) : (
                  <Button size="sm" variant="run" onClick={() => void runner.run({ ...job.data, "main.py": step.code })} disabled={state.phase !== "idle"}>
                    Run {nameOf(PROFESSOR)}&apos;s version
                  </Button>
                )}
                {step.inputs.length ? <span className={styles.workedTip}>Try typing {step.inputs.map((i) => `"${i}"`).join(", then ")}.</span> : null}
              </div>
              {ran ? (
                <div className={styles.workedConsole}>
                  <Console state={state} source={step.code} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
