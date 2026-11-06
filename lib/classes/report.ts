// A student's progress on their class's set projects, read from their own browser (the local
// store), for a progress link (lib/classes/link.ts). The same sums as the teacher's view of an
// account class (lib/server/classes.ts): steps passed, solutions seen, hints, the longer of the
// project's and its steps' time, and the latest change. With it goes their Arcade League entry
// for the week, if they've entered (lib/classes/league.ts).
import type { Files } from "../python/protocol";
import type { LocalStore } from "../store/local";
import type { ProfileRow, StepProgressRow } from "../store/types";
import { isShipped } from "../progress-rules";
import { loadEntries } from "../league/local";
import { isCast } from "../playas";
import { leagueForReport } from "./league";
import { line, lookWire, readLook, LIMITS } from "./link";
import type { ClassInfo, CodeFile, HandIn, LeagueEntryReport, ProjectReport, Report } from "./types";

export interface ProjectFacts {
  /** Steps in the project. */
  total: number;
  /** Its main Build step, whose code goes in the link. */
  build: string | null;
}

/** The student's code for a project's Build step: the saved files, or a terminal step's repository. */
async function buildCode(store: LocalStore, jobId: string, build: string | null): Promise<CodeFile[]> {
  if (!build) return [];
  const step = await store.get("step_progress", `${jobId}/${build}`);
  const repo = (step?.data?.git as { repo?: { files?: Files } } | undefined)?.repo?.files;
  const files: CodeFile[] = repo
    ? Object.entries(repo).map(([name, content]) => ({ name, content: String(content) }))
    : (await store.prefixed("code_files", `${jobId}/${build}/`)).map((f) => ({ name: f.filename, content: f.content }));
  return files
    .filter((f) => /^[A-Za-z0-9_][A-Za-z0-9_./-]*$/.test(f.name) && f.name.length <= LIMITS.fileName && !f.name.includes(".."))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, LIMITS.files);
}

/** How far the student is with one project; `withCode` false skips reading the code. */
export async function projectReport(store: LocalStore, jobId: string, facts: ProjectFacts, withCode = true): Promise<ProjectReport> {
  const job = await store.get("job_progress", jobId);
  const steps = await store.prefixed("step_progress", `${jobId}/`);
  const passed = steps.filter((s) => s.status === "passed").length;
  const seen = steps.filter((s) => s.seenSolution || s.status === "seen-solution").length;
  const hints = steps.reduce((n, s) => n + (s.hintsUsed || 0), 0);
  const stepTime = steps.reduce((n, s) => n + (s.timeSpent || 0), 0);
  const last = Math.max(job?.updatedAt ?? 0, ...steps.map((s) => s.updatedAt || 0));
  return {
    jobId,
    status: job?.status ?? (steps.length ? "in-progress" : "not-started"),
    passed: facts.total > 0 ? Math.min(passed, facts.total) : passed,
    seen,
    total: facts.total,
    hints,
    seconds: Math.round(Math.max(job?.timeSpent ?? 0, stepTime)),
    lastWorked: last > 0 ? last : null,
    code: withCode ? await buildCode(store, jobId, facts.build) : [],
    codeLeftOut: false,
    ...withHandIns(steps),
  };
}

/**
 * What a step's saved state says was handed in from the learner's computer: a Take It Home step
 * keeps its test results (`report`, from pytest or ppc test, components/workbench/steps/
 * TakeHomeStep.tsx), and a milestone signed off keeps when (`reviewedAt`), the link it showed and
 * any test results (MilestoneStep.tsx). A milestone still being drafted isn't a hand-in yet.
 */
export function handInOf(row: StepProgressRow): HandIn | null {
  const d = (row.data ?? {}) as Record<string, unknown>;
  const tests = (r: unknown) => (r && typeof r === "object" && typeof (r as { passed?: unknown }).passed === "number" && typeof (r as { total?: unknown }).total === "number" ? (r as { passed: number; total: number }) : null);
  const at = (x: unknown) => (typeof x === "number" && x > 0 ? x : row.updatedAt || null);
  const report = tests(d.report);
  if (report) return { stepId: row.stepId, kind: "tests", done: row.status === "passed", passed: report.passed, total: report.total, link: null, at: at(d.reportAt) };
  if (typeof d.reviewedAt === "number" && row.status === "passed") {
    const results = tests(d.results);
    const link = typeof d.link === "string" && /^https:\/\/\S+$/.test(d.link.trim()) ? d.link.trim() : null;
    return { stepId: row.stepId, kind: "milestone", done: true, passed: results?.passed ?? null, total: results?.total ?? null, link, at: at(d.reviewedAt) };
  }
  return null;
}

const withHandIns = (steps: StepProgressRow[]): { handIns?: HandIn[] } => {
  const handIns = steps.map(handInOf).filter((h): h is HandIn => h !== null);
  return handIns.length ? { handIns } : {};
};

/** Everything a progress link says: who, each set project, and this week's League entry (by default, the one kept in this browser). */
export async function gatherReport(
  store: LocalStore,
  profile: ProfileRow,
  cls: ClassInfo,
  me: string,
  facts: (jobId: string) => ProjectFacts,
  now = Date.now(),
  league: LeagueEntryReport | undefined = leagueForReport(loadEntries(), now),
): Promise<Report> {
  const projects: ProjectReport[] = [];
  for (const a of cls.assignments) projects.push(await projectReport(store, a.jobId, facts(a.jobId)));
  const shipped = (await store.all("job_progress")).filter((r) => isShipped(r)).length;
  const playAs = profile.settings?.playAs ?? null;
  return {
    classId: cls.id,
    className: cls.name,
    teacher: cls.teacher,
    student: {
      id: me,
      name: line(profile.displayName, LIMITS.studentName) || "A student",
      character: readLook(lookWire(profile.character)),
      playAs: isCast(playAs) ? playAs : null,
    },
    sentAt: now,
    shipped,
    projects,
    ...(league ? { league } : {}),
  };
}
