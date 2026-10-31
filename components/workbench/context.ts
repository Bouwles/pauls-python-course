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

/** Where a step's parts go: the instructions panel, the editor side, or one full-width panel (Ask, Ship). */
export interface Areas {
  panel: string;
  stage: string;
  full: string;
}

/** Why the coach is speaking. "Less talk" keeps only hints and errors. */
export type CoachKind = "step" | "react" | "hint" | "error" | "pass";

/** One thing the coach says: one or two short lines from one character. */
export interface Utterance {
  id: number;
  who: string;
  lines: string[];
  face?: string;
  kind: CoachKind;
}

export type Zone = "brief" | "code" | "output";

export interface WorkbenchContextValue {
  job: Job;
  characters: Record<string, Character>;
  conceptTitles: Record<string, string>;
  actTitle: string;
  store: LocalStore | null;
  runner: Runner;
  areas: Areas;
  progress: Record<string, StepProgressRow>;
  jobProgress: JobProgressRow | null;
  /** True on the landing page, where the Workbench is cut down and nobody is signed in. */
  landing: boolean;
  /** A Pro project's Ask, shown as a free preview: the rest of the project isn't here. */
  preview: boolean;
  /** The free Act's last project: the Acts the Pro gate offers once it ships. */
  gateActs: GateAct[] | null;
  /** The next project in the Act, for the Ship panel. */
  nextJob: { id: string; title: string } | null;
  guest: boolean;
  lessTalk: boolean;
  /** The Workbench is narrow (a phone, or the landing page's frame): three tabs instead of two panes. */
  compact: boolean;
  step: Step | null;
  /** The classmate whose version is being fixed on this step, when it's a "fix my version" step. */
  classmate: string | null;
  /** A character's name from content, or the id when content doesn't know them. */
  nameOf: (who: string) => string;
  updateStep: (stepId: string, patch: Partial<StepProgressRow> | ((r: StepProgressRow) => Partial<StepProgressRow>)) => Promise<StepProgressRow | null>;
  markPassed: (stepId: string, patch?: Partial<StepProgressRow>) => Promise<void>;
  /** The coach reacts to something that just happened. Who speaks comes from lib/cast.ts. */
  react: (event: string, opts?: { vars?: Record<string, string>; kind?: CoachKind }) => Promise<void>;
  /** The coach says a line from content (an onPass line, a sign-off). */
  say: (who: string, text: string | string[], opts?: { face?: string; kind?: CoachKind }) => void;
  /** React to the learner's code: the first cue with a fresh line is said. */
  cue: (cues: Cue[], kind?: CoachKind) => Promise<void>;
  /** What the coach has said on this step, and which one is showing. */
  coach: { said: Utterance[]; index: number };
  coachTo: (index: number) => void;
  goTo: (stepId: string) => void;
  goNext: () => void;
  nextStep: Step | null;
  /** The phone layout's tab. */
  zone: Zone;
  showZone: (zone: Zone) => void;
  /** A line the duck (or the visualiser) points at in the editor. */
  markLine: (line: number | null) => void;
  markedLine: number | null;
  /** Ships the project. True when this call shipped it (the first time). */
  shipJob: () => Promise<boolean>;
  logEvent: (type: string, payload?: Record<string, unknown>) => void;
  hintsOpen: boolean;
  setHintsOpen: (open: boolean) => void;
  duckOpen: boolean;
  setDuckOpen: (open: boolean) => void;
  /** The instructions panel, folded to a thin rail. */
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function useWorkbench(): WorkbenchContextValue {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench outside Workbench");
  return ctx;
}

/** The Workbench, or null outside it (the console is also used on the Shelf and Handbook pages). */
export function useMaybeWorkbench(): WorkbenchContextValue | null {
  return useContext(WorkbenchContext);
}

export type { Line };
