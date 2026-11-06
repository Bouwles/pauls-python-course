// Rows saved for a learner. Each mirrors a Postgres table (supabase/migrations),
// in camelCase. Every row carries `key` (unique per learner) and `updatedAt` (ms).

export type StepStatus = "not-started" | "in-progress" | "passed" | "seen-solution";
export type JobStatus = "not-started" | "in-progress" | "shipped" | "shipped-stretch" | "placed";
export type SelfRating = "had" | "partly" | "missed";

import type { AvatarLook } from "../avatar";

/** The old animal look, from before REDESIGN-2.md. Read through readAvatar(). */
export interface CharacterLook {
  species: Species;
  coat: string;
  jumper: string;
  accessory: Accessory;
}

export type Species = "otter" | "hare" | "badger" | "fox" | "heron" | "mole" | "seal" | "frog";
export type Accessory = "none" | "scarf" | "beanie" | "glasses" | "flat-cap" | "headphones";

export interface Settings {
  dialogue: "full" | "less";
  sound: boolean;
  theme: "system" | "light" | "dark";
  motion: "system" | "reduced";
  prose: "serif" | "hyperlegible";
  editorFontSize: number;
  dailyGoalMinutes: number | null;
  streaks: boolean;
  weeklyEmail: boolean;
  publicProfile: boolean;
  /** Who you're playing as: a cast id ("neil"), or null for someone of your own (lib/playas.ts). */
  playAs: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  dialogue: "full",
  sound: false,
  theme: "dark",
  motion: "system",
  prose: "serif",
  editorFontSize: 14,
  dailyGoalMinutes: null,
  streaks: false,
  weeklyEmail: false,
  publicProfile: false,
  playAs: null,
};

export interface Location {
  jobId: string;
  stepId: string;
  cursor?: number;
  file?: string;
}

export interface ProfileRow {
  key: "me";
  displayName: string;
  /** The learner's avatar (lib/avatar.ts). An old animal look may still be saved; read it with readAvatar(). */
  character: AvatarLook | CharacterLook | null;
  settings: Settings;
  experience: "none" | "some" | "lots" | null;
  lastLocation: Location | null;
  onboarded: boolean;
  updatedAt: number;
}

export interface JobProgressRow {
  key: string; // jobId
  jobId: string;
  status: JobStatus;
  startedAt: number | null;
  shippedAt: number | null;
  stretchDone: string[];
  timeSpent: number; // seconds
  updatedAt: number;
}

export interface StepProgressRow {
  key: string; // `${jobId}/${stepId}`
  jobId: string;
  stepId: string;
  status: StepStatus;
  attempts: number;
  hintsUsed: number;
  seenSolution: boolean;
  predictChoice: string | null;
  selfExplanation: string | null;
  selfRating: SelfRating | null;
  timeSpent: number; // seconds
  /** Step-specific state: investigate answers, Parsons arrangement, and so on. */
  data: Record<string, unknown>;
  updatedAt: number;
}

export interface CodeFileRow {
  key: string; // `${jobId}/${stepId}/${filename}`
  jobId: string;
  stepId: string;
  filename: string;
  content: string;
  cursor: number | null;
  /** The server's updatedAt this content was based on; used to spot edits on two devices. */
  baseUpdatedAt: number | null;
  /** Set when another device's version was kept in history. */
  conflictNote: boolean;
  updatedAt: number;
}

export type SnapshotReason = "run" | "check" | "manual" | "conflict" | "restore";

export interface SnapshotRow {
  key: string; // uuid
  jobId: string;
  stepId: string;
  filename: string;
  content: string;
  reason: SnapshotReason;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewCardRow {
  key: string; // cardId
  cardId: string;
  conceptId: string;
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number; // ts-fsrs State
  lastReview: number | null;
  updatedAt: number;
}

export interface ReviewLogRow {
  key: string; // uuid
  cardId: string;
  rating: number;
  reviewedAt: number;
  elapsedDays: number;
  scheduledDays: number;
  updatedAt: number;
}

export interface MisconceptionRow {
  key: string; // misconception id
  count: number;
  lastSeenAt: number;
  lastAddressedAt: number | null;
  updatedAt: number;
}

export interface DrillBestRow {
  key: string; // drill id
  bestMs: number;
  achievedAt: number;
  updatedAt: number;
}

export interface CollectibleRow {
  key: string; // item id
  foundAt: number;
  updatedAt: number;
}

export interface StoryFlagRow {
  key: string; // flag id
  setAt: number;
  updatedAt: number;
}

export interface EventRow {
  key: string; // uuid
  type: string;
  payload: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface Tables {
  profile: ProfileRow;
  job_progress: JobProgressRow;
  step_progress: StepProgressRow;
  code_files: CodeFileRow;
  code_snapshots: SnapshotRow;
  review_cards: ReviewCardRow;
  review_logs: ReviewLogRow;
  misconceptions: MisconceptionRow;
  drill_bests: DrillBestRow;
  collectibles: CollectibleRow;
  story_flags: StoryFlagRow;
  events: EventRow;
}

export type Table = keyof Tables;

export const TABLES: Table[] = [
  "profile",
  "job_progress",
  "step_progress",
  "code_files",
  "code_snapshots",
  "review_cards",
  "review_logs",
  "misconceptions",
  "drill_bests",
  "collectibles",
  "story_flags",
  "events",
];

export interface SyncChange<T extends Table = Table> {
  table: T;
  row: Tables[T];
}

export interface PullResponse {
  rows: { [T in Table]?: Tables[T][] };
  serverTime: number;
}

export interface PushResponse {
  ok: true;
  /** Code files where another device's version was saved to history. */
  conflicts: string[];
  serverTime: number;
}
