// Small, typed helpers over the local store. Everything the Workbench saves goes through here.
import type { LocalStore } from "./local";
import {
  DEFAULT_SETTINGS,
  type CodeFileRow,
  type JobProgressRow,
  type Location,
  type ProfileRow,
  type SnapshotReason,
  type SnapshotRow,
  type StepProgressRow,
} from "./types";

export const stepKey = (jobId: string, stepId: string) => `${jobId}/${stepId}`;
export const codeKey = (jobId: string, stepId: string, filename: string) => `${jobId}/${stepId}/${filename}`;

export function blankStep(jobId: string, stepId: string): StepProgressRow {
  return {
    key: stepKey(jobId, stepId),
    jobId,
    stepId,
    status: "not-started",
    attempts: 0,
    hintsUsed: 0,
    seenSolution: false,
    predictChoice: null,
    selfExplanation: null,
    selfRating: null,
    timeSpent: 0,
    data: {},
    updatedAt: 0,
  };
}

export function blankJob(jobId: string): JobProgressRow {
  return { key: jobId, jobId, status: "not-started", startedAt: null, shippedAt: null, stretchDone: [], timeSpent: 0, updatedAt: 0 };
}

export function blankProfile(): ProfileRow {
  return {
    key: "me",
    displayName: "",
    character: null,
    settings: { ...DEFAULT_SETTINGS },
    experience: null,
    lastLocation: null,
    onboarded: false,
    updatedAt: 0,
  };
}

export async function getStep(store: LocalStore, jobId: string, stepId: string): Promise<StepProgressRow> {
  return (await store.get("step_progress", stepKey(jobId, stepId))) ?? blankStep(jobId, stepId);
}

export async function updateStep(
  store: LocalStore,
  jobId: string,
  stepId: string,
  patch: Partial<StepProgressRow> | ((row: StepProgressRow) => Partial<StepProgressRow>),
): Promise<StepProgressRow> {
  const current = await getStep(store, jobId, stepId);
  const changes = typeof patch === "function" ? patch(current) : patch;
  const next: StepProgressRow = { ...current, ...changes, updatedAt: Date.now() };
  if (next.status === "not-started") next.status = "in-progress";
  await store.put("step_progress", next);
  return next;
}

export async function getJob(store: LocalStore, jobId: string): Promise<JobProgressRow> {
  return (await store.get("job_progress", jobId)) ?? blankJob(jobId);
}

export async function updateJob(store: LocalStore, jobId: string, patch: Partial<JobProgressRow>): Promise<JobProgressRow> {
  const current = await getJob(store, jobId);
  const next: JobProgressRow = { ...current, ...patch, updatedAt: Date.now() };
  if (next.startedAt === null) next.startedAt = Date.now();
  if (next.status === "not-started") next.status = "in-progress";
  await store.put("job_progress", next);
  return next;
}

export async function getProfile(store: LocalStore): Promise<ProfileRow> {
  const p = await store.get("profile", "me");
  return p ? { ...blankProfile(), ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } } : blankProfile();
}

export async function updateProfile(store: LocalStore, patch: Partial<ProfileRow>): Promise<ProfileRow> {
  const next = { ...(await getProfile(store)), ...patch, key: "me" as const, updatedAt: Date.now() };
  await store.put("profile", next);
  return next;
}

export async function setLocation(store: LocalStore, location: Location): Promise<void> {
  const p = await getProfile(store);
  const l = p.lastLocation;
  if (l && l.jobId === location.jobId && l.stepId === location.stepId && l.cursor === location.cursor && l.file === location.file) return;
  await updateProfile(store, { lastLocation: location });
}

export async function getCode(store: LocalStore, jobId: string, stepId: string, filename: string): Promise<CodeFileRow | undefined> {
  return store.get("code_files", codeKey(jobId, stepId, filename));
}

export async function saveCode(
  store: LocalStore,
  jobId: string,
  stepId: string,
  filename: string,
  content: string,
  cursor: number | null,
): Promise<void> {
  const current = await getCode(store, jobId, stepId, filename);
  if (current && current.content === content && current.cursor === cursor) return;
  await store.put("code_files", {
    key: codeKey(jobId, stepId, filename),
    jobId,
    stepId,
    filename,
    content,
    cursor,
    baseUpdatedAt: current?.baseUpdatedAt ?? null,
    conflictNote: current?.conflictNote ?? false,
    updatedAt: Date.now(),
  });
}

export async function clearConflictNote(store: LocalStore, jobId: string, stepId: string, filename: string) {
  const current = await getCode(store, jobId, stepId, filename);
  if (current?.conflictNote) await store.put("code_files", { ...current, conflictNote: false, updatedAt: Date.now() });
}

/** A snapshot on every Run and Check. Identical consecutive snapshots are skipped. */
export async function snapshot(
  store: LocalStore,
  jobId: string,
  stepId: string,
  filename: string,
  content: string,
  reason: SnapshotReason,
): Promise<void> {
  const existing = await listSnapshots(store, jobId, stepId, filename);
  if (existing[0]?.content === content && reason !== "restore") return;
  const row: SnapshotRow = {
    key: snapshotKey(jobId, stepId, filename),
    jobId,
    stepId,
    filename,
    content,
    reason,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await store.put("code_snapshots", row);
}

/** Snapshot keys sort by time within a file, so history is one range query. */
export function snapshotKey(jobId: string, stepId: string, filename: string, at = Date.now()): string {
  return `${codeKey(jobId, stepId, filename)}/${String(at).padStart(14, "0")}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSnapshots(store: LocalStore, jobId: string, stepId: string, filename: string): Promise<SnapshotRow[]> {
  const rows = await store.prefixed("code_snapshots", codeKey(jobId, stepId, filename) + "/");
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function recordMisconception(store: LocalStore, id: string): Promise<void> {
  const current = await store.get("misconceptions", id);
  await store.put("misconceptions", {
    key: id,
    count: (current?.count ?? 0) + 1,
    lastSeenAt: Date.now(),
    lastAddressedAt: current?.lastAddressedAt ?? null,
    updatedAt: Date.now(),
  });
}

export async function logEvent(store: LocalStore, type: string, payload: Record<string, unknown> = {}): Promise<void> {
  await store.put("events", { key: crypto.randomUUID(), type, payload, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function setFlag(store: LocalStore, table: "story_flags" | "collectibles", id: string): Promise<boolean> {
  if (await store.get(table, id)) return false;
  if (table === "story_flags") await store.put("story_flags", { key: id, setAt: Date.now(), updatedAt: Date.now() });
  else await store.put("collectibles", { key: id, foundAt: Date.now(), updatedAt: Date.now() });
  return true;
}
