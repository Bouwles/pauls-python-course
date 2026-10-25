"use client";

import { createContext, useContext } from "react";
import type { Character, Job, Line, Step } from "@/lib/content/types";
import type { LocalStore } from "@/lib/store/local";
import type { JobProgressRow, StepProgressRow } from "@/lib/store/types";
import type { Runner } from "./useRunner";
import type { Cue } from "@/lib/reactions";

export interface GateAct {
  id: string;
  number: number;
  title: string;
  subject: string;
}

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
  /** A Pro project's Ask, shown as a free preview: the rest of the project isn't here. */
  preview: boolean;
  /** The free Act's last project: the Acts the gate scene offers once it ships. */
  gateActs: GateAct[] | null;
  guest: boolean;
  lessTalk: boolean;
  updateStep: (stepId: string, patch: Partial<StepProgressRow> | ((r: StepProgressRow) => Partial<StepProgressRow>)) => Promise<StepProgressRow | null>;
  markPassed: (stepId: string, patch?: Partial<StepProgressRow>) => Promise<void>;
  /** Show a character's line in the scene strip (a reaction to something that just happened). */
  react: (who: string, event: string) => Promise<void>;
  sayLine: (who: string, text: string, face?: string) => void;
  /** React to the learner's code: the first cue with a fresh line is said. `after` queues it behind the current line. */
  cue: (cues: Cue[], opts?: { after?: boolean }) => Promise<void>;
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
  /** The job ticket column, folded away to give the editor more room. */
  ticketFolded: boolean;
  setTicketFolded: (folded: boolean) => void;
  /** Moss's hints, shown in the dialogue box while the Hint button is down. */
  hintsOpen: boolean;
  setHintsOpen: (open: boolean) => void;
  hintSlot: HTMLElement | null;
  /** The "Explain it to Dennis" drawer. */
  dennisOpen: boolean;
  setDennisOpen: (open: boolean) => void;
  drawerSlot: HTMLElement | null;
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function useWorkbench(): WorkbenchContextValue {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench outside Workbench");
  return ctx;
}

export type { Line };
