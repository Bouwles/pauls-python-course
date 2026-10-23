"use client";

import { createContext, useContext } from "react";
import type { Character, Job, Line, Step } from "@/lib/content/types";
import type { LocalStore } from "@/lib/store/local";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import type { Runner } from "./useRunner";

export interface Areas {
  brief: string;
  stage: string;
  output: string;
  side: string;
}

export interface WorkbenchContextValue {
  job: Job;
  characters: Record<string, Character>;
  conceptTitles: Record<string, string>;
  store: LocalStore | null;
  runner: Runner;
  areas: Areas;
  progress: Record<string, StepProgressRow>;
  jobProgress: JobProgressRow | null;
  /** True on the landing page, where the Workbench is cut down and nobody is signed in. */
  landing: boolean;
  guest: boolean;
  lessTalk: boolean;
  updateStep: (stepId: string, patch: Partial<StepProgressRow> | ((r: StepProgressRow) => Partial<StepProgressRow>)) => Promise<StepProgressRow | null>;
  markPassed: (stepId: string, patch?: Partial<StepProgressRow>) => Promise<void>;
  /** Show a character's line in the scene strip (a reaction to something that just happened). */
  react: (who: string, event: string) => Promise<void>;
  sayLine: (who: string, text: string) => void;
  goTo: (stepId: string) => void;
  goNext: () => void;
  nextStep: Step | null;
  /** Ask the phone layout to show a zone. */
  showZone: (zone: "brief" | "code" | "output") => void;
  /** Lines from the current step that Dennis can point at. */
  markLine: (line: number | null) => void;
  markedLine: number | null;
  shipJob: () => Promise<void>;
  logEvent: (type: string, payload?: Record<string, unknown>) => void;
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function useWorkbench(): WorkbenchContextValue {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench outside Workbench");
  return ctx;
}

export type { Line };
