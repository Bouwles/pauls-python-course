"use client";

import type { ConceptStep, ExplainStep, ReadingStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { CodeBlock } from "../CodeBlock";
import { Instructions } from "../Instructions";
import { SelfExplain } from "../SelfExplain";
import { Pigeonholes } from "../widgets/Pigeonholes";
import { TwoLabels } from "../widgets/TwoLabels";
import { LampLoop } from "../widgets/LampLoop";
import { Growth } from "../widgets/Growth";
import { HillWalker } from "../widgets/HillWalker";
import { useWorkbench } from "../context";
import { NextRow } from "./common";
import styles from "./steps.module.css";

function Widget({ step, done, onDone }: { step: ConceptStep; done: boolean; onDone: () => void }) {
  const params = step.params as Record<string, never>;
  switch (step.widget) {
    case "pigeonholes":
      return <Pigeonholes params={params} done={done} onDone={onDone} />;
    case "two-labels":
      return <TwoLabels done={done} onDone={onDone} />;
    case "lamp-loop":
      return <LampLoop params={params} done={done} onDone={onDone} />;
    case "growth":
      return <Growth params={params} done={done} onDone={onDone} />;
    case "hill-walker":
      return <HillWalker params={params} done={done} onDone={onDone} />;
    default:
      return null;
  }
}

/** Reading, explain and concept steps: no editor. With nothing to show beside them, they take the full width. */
export function SimpleStepView({ step, row }: { step: ReadingStep | ExplainStep | ConceptStep; row: StepProgressRow }) {
  const { areas, markPassed } = useWorkbench();
  const done = row.status === "passed";
  const beside = step.type === "concept" || Boolean(step.code);
  const body =
    step.type === "explain" ? (
      <SelfExplain stepId={step.id} promptHtml={step.promptHtml} answer={step.answer} concept={step.concept} row={row} />
    ) : step.type === "reading" && !done ? (
      <div>
        <Button variant="primary" icon="check" onClick={() => void markPassed(step.id)}>
          Done reading
        </Button>
      </div>
    ) : null;
  return (
    <>
      <Instructions step={step} wide={!beside} footer={<NextRow row={row} />}>
        {body}
      </Instructions>
      {beside ? (
        <div className={areas.stage}>
          <div className={styles.stagePad}>
            {step.type === "concept" ? <Widget step={step} done={done} onDone={() => void markPassed(step.id)} /> : step.code ? <CodeBlock code={step.code} /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
