"use client";

// Classes with accounts, on GitHub Pages: everything the class pages do, as the signed-in user,
// straight to Supabase. Reads go through the functions in supabase/migrations/0008, which run as
// the caller, so row level security decides what each person sees: a teacher, their own classes'
// students only, read only; a student, the classes they're in and what's set there. The same
// sums as the local version's server (lib/server/classes.ts).
import type { JobStatus, Location } from "../store/types";
import { supabase } from "../supabase/client";

export const WEEK_MS = 7 * 24 * 3600_000;

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};
const ms = (v: unknown): number | null => (v === null || v === undefined ? null : Date.parse(String(v)) || null);
const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v) || 0);

/** What a learner types: any case, spaces and hyphens ignored. */
export const normaliseCode = (raw: string) => raw.toUpperCase().replace(/[\s-]/g, "");

// ---------------------------------------------------------------- teaching

export interface TaughtClass {
  id: string;
  name: string;
  joinCode: string;
  createdAt: number;
  students: number;
  assignments: number;
}

export async function teacherClasses(): Promise<TaughtClass[]> {
  const { data, error } = await supabase().rpc("teacher_classes");
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({ id: String(r.id), name: String(r.name), joinCode: String(r.join_code), createdAt: ms(r.created_at) ?? 0, students: num(r.students), assignments: num(r.assignments) }));
}

export async function createClass(name: string): Promise<string> {
  const { data, error } = await supabase().rpc("create_class", { class_name: name.trim().slice(0, 80) });
  fail(error);
  return String(data);
}

/** Deleting a class takes its members and set projects with it; students keep their own work. */
export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase().from("classes").delete().eq("id", id);
  fail(error);
}

export interface Student {
  id: string;
  username: string;
  name: string;
  character: unknown;
  playAs: string | null;
  joinedAt: number;
  shipped: number;
  currentJobId: string | null;
  weekSeconds: number;
  totalSeconds: number;
  lastActive: number | null;
}

/** The Job they were last at, unless it has shipped; otherwise the Job in progress they touched last. */
function currentJob(last: Location | null, jobs: { jobId: string; status: JobStatus; updatedAt: number }[]): string | null {
  const done = (s: JobStatus) => s === "shipped" || s === "shipped-stretch" || s === "placed";
  if (last?.jobId) {
    const row = jobs.find((j) => j.jobId === last.jobId);
    if (!row || !done(row.status)) return last.jobId;
  }
  const open = jobs.filter((j) => j.status === "in-progress").sort((a, b) => b.updatedAt - a.updatedAt);
  return open[0]?.jobId ?? null;
}

export async function roster(classId: string, now = Date.now()): Promise<Student[]> {
  const { data, error } = await supabase().rpc("class_roster", { cls: classId, since: now - WEEK_MS });
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const jobs = ((r.jobs as Record<string, unknown>[] | null) ?? []).map((j) => ({ jobId: String(j.jobId), status: j.status as JobStatus, updatedAt: num(j.updatedAt) }));
    const total = Math.max(num(r.job_time), num(r.step_time));
    return {
      id: String(r.id),
      username: String(r.username ?? ""),
      name: String(r.name ?? "") || String(r.username ?? "") || "A student",
      character: r.character ?? null,
      playAs: (r.play_as as string | null) ?? null,
      joinedAt: ms(r.joined_at) ?? 0,
      shipped: num(r.shipped),
      currentJobId: currentJob((r.last_location as Location | null) ?? null, jobs),
      weekSeconds: Math.min(num(r.week_time), total),
      totalSeconds: total,
      lastActive: Math.max(num(r.last_job), num(r.last_step), num(r.last_code)) || null,
    };
  });
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  const { error } = await supabase().from("class_members").delete().eq("class_id", classId).eq("user_id", studentId);
  fail(error);
}

export interface SetProject {
  id: string;
  jobId: string;
  dueAt: number | null;
  shipped: number;
}

export async function classAssignments(classId: string): Promise<SetProject[]> {
  const { data, error } = await supabase().rpc("class_assignments", { cls: classId });
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({ id: String(r.id), jobId: String(r.job_id), dueAt: ms(r.due_at), shipped: num(r.shipped) }));
}

/** Set a project, or change its due date. `due` is a day, "2026-11-20", due at midday UTC. */
export async function setAssignment(classId: string, jobId: string, due: string | null): Promise<boolean> {
  const { data, error } = await supabase().rpc("set_assignment", { cls: classId, job: jobId, due: due ? `${due}T12:00:00Z` : null });
  fail(error);
  return Boolean(data);
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase().from("assignments").delete().eq("id", assignmentId);
  fail(error);
}

export interface StudentJob {
  jobId: string;
  status: JobStatus;
  shippedAt: number | null;
  stepsPassed: number;
  stepsSeenSolution: number;
  attempts: number;
  hints: number;
  seconds: number;
  updatedAt: number;
}

export interface StudentDetail {
  id: string;
  username: string;
  name: string;
  character: unknown;
  playAs: string | null;
  joinedAt: number;
  jobs: StudentJob[];
  jobId: string | null;
  files: { stepId: string; filename: string; content: string; updatedAt: number }[];
  submission: { stepId: string | null; kind: string; results: Record<string, unknown>; createdAt: number } | null;
}

export async function studentDetail(classId: string, studentId: string, jobId: string | null): Promise<StudentDetail | null> {
  const { data, error } = await supabase().rpc("student_detail", { cls: classId, student: studentId, job: jobId });
  fail(error);
  if (!data) return null;
  const d = data as Record<string, unknown>;
  const jobRows = (d.jobs as Record<string, unknown>[] | null) ?? [];
  const steps = (d.steps as Record<string, unknown>[] | null) ?? [];
  const ids = [...new Set([...jobRows.map((j) => String(j.job_id)), ...steps.map((s) => String(s.jobId))])];
  const jobs = ids.map((id) => {
    const j = jobRows.find((x) => String(x.job_id) === id);
    const s = steps.find((x) => String(x.jobId) === id);
    return {
      jobId: id,
      status: ((j?.status as JobStatus | undefined) ?? "in-progress") as JobStatus,
      shippedAt: j?.shipped_at === null || j?.shipped_at === undefined ? null : num(j.shipped_at),
      stepsPassed: num(s?.passed),
      stepsSeenSolution: num(s?.seen),
      attempts: num(s?.attempts),
      hints: num(s?.hints),
      seconds: Math.max(num(j?.time_spent_seconds), num(s?.secs)),
      updatedAt: Math.max(num(j?.updated_at), num(s?.updated)),
    };
  });
  const sub = d.submission as Record<string, unknown> | null;
  return {
    id: String(d.id),
    username: String(d.username ?? ""),
    name: String(d.name ?? "") || String(d.username ?? "") || "A student",
    character: d.character ?? null,
    playAs: (d.playAs as string | null) ?? null,
    joinedAt: num(d.joinedAt),
    jobs,
    jobId: (d.jobId as string | null) ?? null,
    files: ((d.files as Record<string, unknown>[] | null) ?? []).map((f) => ({ stepId: String(f.stepId), filename: String(f.filename), content: String(f.content ?? ""), updatedAt: num(f.updatedAt) })),
    submission: sub ? { stepId: (sub.stepId as string | null) ?? null, kind: String(sub.kind), results: (sub.results as Record<string, unknown>) ?? {}, createdAt: num(sub.createdAt) } : null,
  };
}

// ---------------------------------------------------------------- learning

export interface Membership {
  classId: string;
  name: string;
  teacher: string;
  joinedAt: number;
}

/** Join with a code. Null when no class has it. */
export async function joinClass(code: string): Promise<string | null> {
  const { data, error } = await supabase().rpc("join_class", { code: normaliseCode(code) });
  if (error && /No class with that code/.test(error.message)) return null;
  fail(error);
  return String(data);
}

export async function myClasses(): Promise<Membership[]> {
  const { data, error } = await supabase().rpc("my_classes");
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({ classId: String(r.class_id), name: String(r.name), teacher: String(r.teacher_name ?? ""), joinedAt: ms(r.joined_at) ?? 0 }));
}

export async function leaveClass(classId: string, userId: string): Promise<void> {
  const { error } = await supabase().from("class_members").delete().eq("class_id", classId).eq("user_id", userId);
  fail(error);
}

export interface MySet {
  id: string;
  classId: string;
  className: string;
  jobId: string;
  dueAt: number | null;
}

export async function myAssignments(): Promise<MySet[]> {
  const { data, error } = await supabase().rpc("my_assignments");
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({ id: String(r.id), classId: String(r.class_id), className: String(r.class_name), jobId: String(r.job_id), dueAt: ms(r.due_at) }));
}
