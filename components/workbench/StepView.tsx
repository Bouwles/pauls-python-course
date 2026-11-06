"use client";

import type { Step } from "@/lib/content/types";
import type { StepProgressRow } from "@/lib/store/types";
import { AskStepView } from "./steps/AskStep";
import { PredictStepView } from "./steps/PredictStep";
import { InvestigateStepView } from "./steps/InvestigateStep";
import { WorkedStepView } from "./steps/WorkedStep";
import { CodeStepView } from "./steps/CodeStep";
import { ParsonsStepView } from "./steps/ParsonsStep";
import { ShipStepView } from "./steps/ShipStep";
import { SimpleStepView } from "./steps/SimpleStep";
import { GitStepView } from "./steps/GitStep";
import { TakeHomeStepView } from "./steps/TakeHomeStep";
import { MilestoneStepView } from "./steps/MilestoneStep";
import { LearnStepView } from "./steps/LearnStep";

export function StepView({ step, row }: { step: Step; row: StepProgressRow }) {
  switch (step.type) {
    case "ask":
      return <AskStepView step={step} row={row} />;
    case "predict":
      return <PredictStepView step={step} row={row} />;
    case "investigate":
      return <InvestigateStepView step={step} row={row} />;
    case "worked":
      return <WorkedStepView step={step} row={row} />;
    case "pips":
    case "fix":
    case "modify":
    case "make":
      return <CodeStepView step={step} row={row} />;
    case "parsons":
      return <ParsonsStepView step={step} row={row} />;
    case "ship":
      return <ShipStepView step={step} row={row} />;
    case "git":
      return <GitStepView step={step} row={row} />;
    case "takehome":
      return <TakeHomeStepView step={step} row={row} />;
    case "milestone":
      return <MilestoneStepView step={step} row={row} />;
    case "learn":
      return <LearnStepView step={step} row={row} />;
    default:
      return <SimpleStepView step={step} row={row} />;
  }
}
