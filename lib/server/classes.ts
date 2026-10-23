// Teacher and class mode (Section 8.10), and the public profile address.
// Every query runs as the signed-in user, so the RLS policies in
// supabase/migrations decide what a teacher or a learner can see:
// a teacher reads learners in their own classes only, read-only;
// a learner reads their own memberships and their classes' assignments.
import { randomInt } from "node:crypto";
import type { Db, Query } from "./db";
import type { CharacterLook, JobStatus, Location } from "../store/types";

/** Consonants without Y, and 2 to 9: nothing that reads as another character, nothing that spells a word. */
export const CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ23456789";
export const CODE_LENGTH = 6;

export function makeJoinCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

/** What a learner types: any case, spaces and hyphens ignored. */
export const normaliseCode = (raw: string) => raw.toUpperCase().replace(/[\s-]/g, "");

export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/** Lower-case words joined by hyphens, 3 to 30 characters (the same rule as the database's check). */
export const validSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length >= 3 && s.length <= 30;

const ms = (v: unknown): number | null => (v === null || v === undefined ? null : v instanceof Date ? v.getTime() : new Date(v as string).getTime());
const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));
const pgCode = (e: unknown) => (e as { code?: string })?.code;

export const WEEK_MS = 7 * 24 * 3600_000;

// ---------------------------------------------------------------------------
// Profile flags: role and public address
// ---------------------------------------------------------------------------

export async function profileFlags(db: Db, userId: string): Promise<{ teacher: boolean; slug: string | null }> {
  const rows = await db.asUser(userId, (q) => q<{ role: string; public_slug: string | null }>("select role, public_slug from public.profiles where id = $1", [userId]));
  return { teacher: rows[0]?.role === "teacher", slug: rows[0]?.public_slug ?? null };
}

/**
 * The profile row may not have reached the server yet (it syncs in the background),
 * so these insert it if needed. Sync's upsert never touches role or public_slug,
 * and the inserted row's updated_at of 0 lets the learner's own copy win everything else.
 */
export async function setTeacher(db: Db, userId: string, on: boolean): Promise<void> {
  await db.asUser(userId, (q) =>
    q("insert into public.profiles (id, role) values ($1, $2) on conflict (id) do update set role = excluded.role", [userId, on ? "teacher" : "learner"]),
  );
}

export async function setPublicSlug(db: Db, userId: string, slug: string | null): Promise<"ok" | "taken" | "invalid"> {
  if (slug !== null && !validSlug(slug)) return "invalid";
  try {
    await db.asUser(userId, (q) =>
      q("insert into public.profiles (id, public_slug) values ($1, $2) on conflict (id) do update set public_slug = excluded.public_slug", [userId, slug]),
    );
    return "ok";
  } catch (e) {
    if (pgCode(e) === "23505") return "taken";
    if (pgCode(e) === "23514") return "invalid";
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Teacher: classes
// ---------------------------------------------------------------------------

export interface TeacherClass {
  id: string;
  name: string;
  joinCode: string;
  createdAt: number;
  students: number;
  assignments: number;
}

const classColumns = `c.id, c.name, c.join_code, c.created_at,
  (select count(*)::int from public.class_members m where m.class_id = c.id) as students,
  (select count(*)::int from public.assignments a where a.class_id = c.id) as assignments`;

type ClassDbRow = { id: string; name: string; join_code: string; created_at: unknown; students: number; assignments: number };
const toClass = (r: ClassDbRow): TeacherClass => ({ id: r.id, name: r.name, joinCode: r.join_code, createdAt: ms(r.created_at)!, students: num(r.students), assignments: num(r.assignments) });

export async function listClasses(db: Db, userId: string): Promise<TeacherClass[]> {
  const rows = await db.asUser(userId, (q) => q<ClassDbRow>(`select ${classColumns} from public.classes c where c.teacher_id = $1 order by c.created_at`, [userId]));
  return rows.map(toClass);
}

export async function getClass(db: Db, userId: string, classId: string): Promise<TeacherClass | null> {
  if (!isUuid(classId)) return null;
  // Members can read their class too; the teacher_id test keeps this to the teacher.
  const rows = await db.asUser(userId, (q) => q<ClassDbRow>(`select ${classColumns} from public.classes c where c.id = $1 and c.teacher_id = $2`, [classId, userId]));
  return rows[0] ? toClass(rows[0]) : null;
}

export async function createClass(db: Db, userId: string, name: string): Promise<TeacherClass | "not-teacher"> {
  const clean = name.trim().slice(0, 80);
  // A clash on a random code is unlikely (28^6 codes); try again a few times if it happens.
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const rows = await db.asUser(userId, async (q) => {
        const role = await q<{ role: string }>("select role from public.profiles where id = $1", [userId]);
        if (role[0]?.role !== "teacher") return null;
        const made = await q<{ id: string }>("insert into public.classes (teacher_id, name, join_code) values ($1, $2, $3) returning id", [userId, clean, makeJoinCode()]);
        return q<ClassDbRow>(`select ${classColumns} from public.classes c where c.id = $1`, [made[0]!.id]);
      });
      if (!rows) return "not-teacher";
      return toClass(rows[0]!);
    } catch (e) {
      if (pgCode(e) !== "23505") throw e;
    }
  }
  throw new Error("Could not find a free join code.");
}

/** Deleting a class removes its members and assignments with it (on delete cascade). */
export async function deleteClass(db: Db, userId: string, classId: string): Promise<boolean> {
  if (!isUuid(classId)) return false;
  const rows = await db.asUser(userId, (q) => q<{ id: string }>("delete from public.classes where id = $1 and teacher_id = $2 returning id", [classId, userId]));
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Teacher: the roster
// ---------------------------------------------------------------------------

export interface StudentSummary {
  id: string;
  name: string;
  character: CharacterLook | null;
  joinedAt: number;
  shipped: number;
  currentJobId: string | null;
  weekSeconds: number;
  totalSeconds: number;
  lastActive: number | null;
}

const SHIPPED = "('shipped', 'shipped-stretch')";

export async function roster(db: Db, userId: string, classId: string, now = Date.now()): Promise<StudentSummary[]> {
  if (!isUuid(classId)) return [];
  return db.asUser(userId, async (q) => {
    const rows = await q<{
      id: string;
      joined_at: unknown;
      name: string | null;
      character: CharacterLook | null;
      last_location: Location | null;
      shipped: number;
      job_time: number;
      last_job: number | null;
      step_time: number;
      week_time: number;
      last_step: number | null;
      last_code: number | null;
    }>(
      `select m.user_id as id, m.joined_at, p.display_name as name, p.character, p.last_location,
              coalesce(j.shipped, 0) as shipped, coalesce(j.job_time, 0) as job_time, j.last_job,
              coalesce(s.step_time, 0) as step_time, coalesce(s.week_time, 0) as week_time, s.last_step, c.last_code
       from public.class_members m
       join public.classes cl on cl.id = m.class_id and cl.teacher_id = $3
       left join public.profiles p on p.id = m.user_id
       left join lateral (
         select count(*) filter (where status in ${SHIPPED})::int as shipped,
                coalesce(sum(time_spent_seconds), 0)::float8 as job_time, max(updated_at)::float8 as last_job
         from public.job_progress where user_id = m.user_id) j on true
       left join lateral (
         select coalesce(sum(time_spent_seconds), 0)::float8 as step_time,
                coalesce(sum(time_spent_seconds) filter (where updated_at >= $2), 0)::float8 as week_time,
                max(updated_at)::float8 as last_step
         from public.step_progress where user_id = m.user_id) s on true
       left join lateral (select max(updated_at)::float8 as last_code from public.code_files where user_id = m.user_id) c on true
       where m.class_id = $1
       order by lower(coalesce(p.display_name, '')), m.joined_at`,
      [classId, now - WEEK_MS, userId],
    );
    const jobs = await q<{ user_id: string; job_id: string; status: JobStatus; updated_at: number }>(
      `select user_id, job_id, status, updated_at::float8 as updated_at from public.job_progress
       where user_id in (select m.user_id from public.class_members m join public.classes c on c.id = m.class_id
                         where m.class_id = $1 and c.teacher_id = $2)`,
      [classId, userId],
    );
    return rows.map((r) => {
      const mine = jobs.filter((j) => j.user_id === r.id);
      const total = Math.max(num(r.job_time), num(r.step_time));
      return {
        id: r.id,
        name: r.name || "Unnamed apprentice",
        character: r.character ?? null,
        joinedAt: ms(r.joined_at)!,
        shipped: num(r.shipped),
        currentJobId: currentJob(r.last_location, mine),
        weekSeconds: Math.min(num(r.week_time), total),
        totalSeconds: total,
        lastActive: Math.max(num(r.last_job), num(r.last_step), num(r.last_code)) || null,
      };
    });
  });
}

/** The Job they were last at, unless it has shipped; otherwise the Job in progress they touched last. */
function currentJob(last: Location | null, jobs: { job_id: string; status: JobStatus; updated_at: number }[]): string | null {
  const done = (s: JobStatus) => s === "shipped" || s === "shipped-stretch" || s === "placed";
  if (last?.jobId) {
    const row = jobs.find((j) => j.job_id === last.jobId);
    if (!row || !done(row.status)) return last.jobId;
  }
  const open = jobs.filter((j) => j.status === "in-progress").sort((a, b) => num(b.updated_at) - num(a.updated_at));
  return open[0]?.job_id ?? null;
}

export async function removeStudent(db: Db, userId: string, classId: string, studentId: string): Promise<boolean> {
  if (!isUuid(classId) || !isUuid(studentId)) return false;
  const rows = await db.asUser(userId, (q) =>
    q<{ user_id: string }>(
      "delete from public.class_members where class_id = $1 and user_id = $2 and class_id in (select id from public.classes where teacher_id = $3) returning user_id",
      [classId, studentId, userId],
    ),
  );
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Teacher: assignments
// ---------------------------------------------------------------------------

export interface Assignment {
  id: string;
  jobId: string;
  dueAt: number | null;
  createdAt: number;
  /** Members of the class who have shipped it. */
  shipped: number;
}

export async function classAssignments(db: Db, userId: string, classId: string): Promise<Assignment[]> {
  if (!isUuid(classId)) return [];
  const rows = await db.asUser(userId, (q) =>
    q<{ id: string; job_id: string; due_at: unknown; created_at: unknown; shipped: number }>(
      `select a.id, a.job_id, a.due_at, a.created_at,
              (select count(*)::int from public.job_progress j
               join public.class_members m on m.user_id = j.user_id and m.class_id = a.class_id
               where j.job_id = a.job_id and j.status in ${SHIPPED}) as shipped
       from public.assignments a
       where a.class_id = $1 and a.class_id in (select id from public.classes where teacher_id = $2)
       order by a.due_at asc nulls last, a.created_at`,
      [classId, userId],
    ),
  );
  return rows.map((r) => ({ id: r.id, jobId: r.job_id, dueAt: ms(r.due_at), createdAt: ms(r.created_at)!, shipped: num(r.shipped) }));
}

/** Assign a Job, or change its due date if it is already assigned. */
export async function assign(db: Db, userId: string, classId: string, jobId: string, dueAt: number | null): Promise<boolean> {
  if (!isUuid(classId)) return false;
  const due = dueAt === null ? null : new Date(dueAt).toISOString();
  return db.asUser(userId, async (q) => {
    const updated = await q("update public.assignments set due_at = $3::timestamptz where class_id = $1 and job_id = $2 returning id", [classId, jobId, due]);
    if (updated.length) return true;
    const made = await q("insert into public.assignments (class_id, job_id, due_at) select $1::uuid, $2::text, $3::timestamptz where public.owns_class($1::uuid) returning id", [classId, jobId, due]);
    return made.length > 0;
  });
}

export async function unassign(db: Db, userId: string, classId: string, assignmentId: string): Promise<boolean> {
  if (!isUuid(classId) || !isUuid(assignmentId)) return false;
  const rows = await db.asUser(userId, (q) => q("delete from public.assignments where id = $1 and class_id = $2 returning id", [assignmentId, classId]));
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Teacher: one student
// ---------------------------------------------------------------------------

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

export interface StudentFile {
  stepId: string;
  filename: string;
  content: string;
  updatedAt: number;
}

export interface StudentSubmission {
  stepId: string | null;
  kind: string;
  results: Record<string, unknown>;
  createdAt: number;
}

export interface StudentDetail {
  id: string;
  name: string;
  character: CharacterLook | null;
  joinedAt: number;
  jobs: StudentJob[];
  /** The chosen Job's saved code and latest hand-in. */
  jobId: string | null;
  files: StudentFile[];
  submission: StudentSubmission | null;
}

export async function studentDetail(db: Db, userId: string, classId: string, studentId: string, jobId: string | null): Promise<StudentDetail | null> {
  if (!isUuid(classId) || !isUuid(studentId)) return null;
  return db.asUser(userId, async (q) => {
    const member = await q<{ joined_at: unknown; name: string | null; character: CharacterLook | null }>(
      `select m.joined_at, p.display_name as name, p.character
       from public.class_members m
       join public.classes c on c.id = m.class_id and c.teacher_id = $3
       left join public.profiles p on p.id = m.user_id
       where m.class_id = $1 and m.user_id = $2`,
      [classId, studentId, userId],
    );
    if (!member[0]) return null;
    const jobs = await studentJobs(q, studentId);
    const chosen = jobId && /^[a-z0-9-]+$/.test(jobId) ? jobId : ([...jobs].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.jobId ?? null);
    let files: StudentFile[] = [];
    let submission: StudentSubmission | null = null;
    if (chosen) {
      files = (
        await q<{ step_id: string; filename: string; content: string; updated_at: number }>(
          "select step_id, filename, content, updated_at::float8 as updated_at from public.code_files where user_id = $1 and job_id = $2 order by step_id, filename",
          [studentId, chosen],
        )
      ).map((f) => ({ stepId: f.step_id, filename: f.filename, content: f.content, updatedAt: num(f.updated_at) }));
      const sub = await q<{ step_id: string | null; kind: string; results: Record<string, unknown>; created_at: unknown }>(
        "select step_id, kind, results, created_at from public.submissions where user_id = $1 and job_id = $2 order by created_at desc limit 1",
        [studentId, chosen],
      );
      submission = sub[0] ? { stepId: sub[0].step_id, kind: sub[0].kind, results: sub[0].results ?? {}, createdAt: ms(sub[0].created_at)! } : null;
    }
    return {
      id: studentId,
      name: member[0].name || "Unnamed apprentice",
      character: member[0].character ?? null,
      joinedAt: ms(member[0].joined_at)!,
      jobs,
      jobId: chosen,
      files,
      submission,
    };
  });
}

async function studentJobs(q: Query, studentId: string): Promise<StudentJob[]> {
  const jobs = await q<{ job_id: string; status: JobStatus; shipped_at: number | null; time_spent_seconds: number; updated_at: number }>(
    "select job_id, status, shipped_at::float8 as shipped_at, time_spent_seconds, updated_at::float8 as updated_at from public.job_progress where user_id = $1",
    [studentId],
  );
  const steps = await q<{ job_id: string; passed: number; seen: number; attempts: number; hints: number; secs: number; updated: number }>(
    `select job_id, count(*) filter (where status = 'passed')::int as passed,
            count(*) filter (where seen_solution or status = 'seen-solution')::int as seen,
            coalesce(sum(attempts), 0)::int as attempts, coalesce(sum(hints_used), 0)::int as hints,
            coalesce(sum(time_spent_seconds), 0)::float8 as secs, max(updated_at)::float8 as updated
     from public.step_progress where user_id = $1 group by job_id`,
    [studentId],
  );
  const ids = [...new Set([...jobs.map((j) => j.job_id), ...steps.map((s) => s.job_id)])];
  return ids.map((id) => {
    const j = jobs.find((x) => x.job_id === id);
    const s = steps.find((x) => x.job_id === id);
    return {
      jobId: id,
      status: j?.status ?? "in-progress",
      shippedAt: j?.shipped_at === null || j?.shipped_at === undefined ? null : num(j.shipped_at),
      stepsPassed: num(s?.passed),
      stepsSeenSolution: num(s?.seen),
      attempts: num(s?.attempts),
      hints: num(s?.hints),
      seconds: Math.max(num(j?.time_spent_seconds), num(s?.secs)),
      updatedAt: Math.max(num(j?.updated_at), num(s?.updated)),
    };
  });
}

// ---------------------------------------------------------------------------
// Learner: joining, leaving, assignments
// ---------------------------------------------------------------------------

export interface Membership {
  classId: string;
  name: string;
  joinedAt: number;
}

export async function joinClass(db: Db, userId: string, rawCode: string): Promise<Membership | null> {
  const code = normaliseCode(rawCode);
  if (code.length !== CODE_LENGTH) return null;
  try {
    return await db.asUser(userId, async (q) => {
      const joined = await q<{ id: string }>("select public.join_class($1) as id", [code]);
      const rows = await q<{ name: string; joined_at: unknown }>(
        "select c.name, m.joined_at from public.classes c join public.class_members m on m.class_id = c.id and m.user_id = $2 where c.id = $1",
        [joined[0]!.id, userId],
      );
      return { classId: joined[0]!.id, name: rows[0]!.name, joinedAt: ms(rows[0]!.joined_at)! };
    });
  } catch (e) {
    if (/No class with that code/.test(String((e as Error)?.message))) return null;
    throw e;
  }
}

export async function myClasses(db: Db, userId: string): Promise<Membership[]> {
  const rows = await db.asUser(userId, (q) =>
    q<{ id: string; name: string; joined_at: unknown }>(
      "select c.id, c.name, m.joined_at from public.class_members m join public.classes c on c.id = m.class_id where m.user_id = $1 order by m.joined_at",
      [userId],
    ),
  );
  return rows.map((r) => ({ classId: r.id, name: r.name, joinedAt: ms(r.joined_at)! }));
}

export async function leaveClass(db: Db, userId: string, classId: string): Promise<boolean> {
  if (!isUuid(classId)) return false;
  const rows = await db.asUser(userId, (q) => q("delete from public.class_members where class_id = $1 and user_id = $2 returning class_id", [classId, userId]));
  return rows.length > 0;
}

export interface MyAssignment {
  id: string;
  className: string;
  jobId: string;
  dueAt: number | null;
}

/** Assignments from the classes this learner is in (not from classes they teach). */
export async function myAssignments(db: Db, userId: string): Promise<MyAssignment[]> {
  const rows = await db.asUser(userId, (q) =>
    q<{ id: string; class_name: string; job_id: string; due_at: unknown }>(
      `select a.id, c.name as class_name, a.job_id, a.due_at
       from public.assignments a
       join public.classes c on c.id = a.class_id
       join public.class_members m on m.class_id = a.class_id and m.user_id = $1
       order by a.due_at asc nulls last, a.created_at`,
      [userId],
    ),
  );
  return rows.map((r) => ({ id: r.id, className: r.class_name, jobId: r.job_id, dueAt: ms(r.due_at) }));
}
