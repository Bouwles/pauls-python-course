"use client";

import type { LearnStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { CodeWorkspace } from "../CodeWorkspace";
import { Instructions } from "../Instructions";
import { useWorkbench } from "../context";
import { NextRow, isDone } from "./common";

/**
 * Learn: one new idea in plain words, before anything asks about it. Beside it, a small example
 * to run, change and run again: nothing is checked, it's there to play with. "Got it" moves on.
 */
export function LearnStepView({ step, row }: { step: LearnStep; row: StepProgressRow }) {
  const { areas, markPassed } = useWorkbench();
  const done = isDone(row);
  const got = () => void markPassed(step.id);
  return (
    <>
      <Instructions
        step={step}
        wide={!step.code}
        footer={<NextRow row={row} editor={Boolean(step.code)} />}
        action={
          done ? null : (
            <Button variant="primary" icon="check" onClick={got}>
              Got it
            </Button>
          )
        }
      />
      {step.code ? (
        <div className={areas.stage}>
          <CodeWorkspace stepId={step.id} files={["main.py"]} starter={{ "main.py": step.code }} done={done} />
        </div>
      ) : null}
    </>
  );
}
