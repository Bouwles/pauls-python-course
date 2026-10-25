"use client";

import type { ConceptStep, ExplainStep, ReadingStep } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { Button } from "../../ui/Button";
import { CodeBlock } from "../CodeBlock";
import { SelfExplain } from "../SelfExplain";
import { Pigeonholes } from "../widgets/Pigeonholes";
import { TwoLabels } from "../widgets/TwoLabels";
import { LampLoop } from "../widgets/LampLoop";
import { Growth } from "../widgets/Growth";
import { HillWalker } from "../widgets/HillWalker";
import { useWorkbench } from "../context";
import { NextRow, Prose, StepHeading } from "./common";
import { Ticket } from "../Ticket";
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

/** Reading, explain and concept (non-code activity) steps. */
export function SimpleStepView({ step, row }: { step: ReadingStep | ExplainStep | ConceptStep; row: StepProgressRow }) {
  const { areas, markPassed } = useWorkbench();
  const done = row.status === "passed";
  return (
    <>
      <Ticket>
        <StepHeading step={step} />
        <Prose html={step.html} />
        {step.type === "explain" ? (
          <SelfExplain stepId={step.id} promptHtml={step.promptHtml} answer={step.answer} concept={step.concept} row={row} />
        ) : step.type === "reading" && !done ? (
          <div className={styles.next}>
            <Button variant="primary" onClick={() => void markPassed(step.id)}>
              Done reading
            </Button>
          </div>
        ) : null}
        <NextRow row={row} />
      </Ticket>
      <div className={areas.stage}>
        <div className={styles.stagePad}>
          {step.type === "concept" ? (
            <Widget step={step} done={done} onDone={() => void markPassed(step.id)} />
          ) : step.code ? (
            <CodeBlock code={step.code} />
          ) : (
            <Prose html={step.html} />
          )}
        </div>
      </div>
    </>
  );
}
