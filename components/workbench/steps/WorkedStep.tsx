"use client";

import type { WorkedStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { RunIcon, StopIcon } from "../../ui/Icons";
import { Console } from "../Console";
import { SelfExplain } from "../SelfExplain";
import { WorkedCode } from "../WorkedCode";
import { useWorkbench } from "../context";
import { NextRow, Prose, StepHeading } from "./common";
import { Ticket } from "../Ticket";
import styles from "./steps.module.css";

export function WorkedStepView({ step, row }: { step: WorkedStep; row: StepProgressRow }) {
  const { areas, runner, job } = useWorkbench();
  const { state } = runner;
  const running = state.phase === "running";
  return (
    <>
      <Ticket>
        <StepHeading step={step} />
        <Prose html={step.html} />
        <SelfExplain stepId={step.id} promptHtml={step.explain.promptHtml} answer={step.explain.answer} concept={step.explain.concept} row={row} />
        <NextRow row={row} doneText="The labels on the left are worth remembering. You'll use them next." />
      </Ticket>
      <div className={areas.stage}>
        <div className={styles.workedStage}>
          <div className={styles.workedTop}>
            <WorkedCode code={step.code} subgoals={step.subgoals} language={step.language} />
          </div>
          {step.language === "python" ? (
            <div className={styles.workedRun}>
              <div className={styles.workedBar}>
                {running ? (
                  <Button size="sm" variant="danger" icon={<StopIcon />} onClick={runner.stop}>
                    Stop
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" icon={<RunIcon />} onClick={() => void runner.run({ ...job.data, "main.py": step.code })} disabled={state.phase !== "idle"}>
                    Run Moss&apos;s version
                  </Button>
                )}
                {step.inputs.length ? <span>Try typing {step.inputs.map((i) => `"${i}"`).join(", then ")}.</span> : null}
              </div>
              <div className={styles.workedConsole}>
                <Console state={state} source={step.code} onInput={runner.provideInput} onRetry={() => void runner.retryLoad()} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
