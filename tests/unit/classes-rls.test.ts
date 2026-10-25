import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/lib/server/db";

// Teacher and class mode against the real migrations on an in-memory PGlite:
// every query runs as one user, so these are the RLS policies at work.
let db: Db;
let teacher: string;
let alice: string;
let bob: string;
let carol: string;

beforeAll(async () => {
  process.env.PPC_DB_DIR = "memory";
  const mod = await import("@/lib/server/db");
  mod.resetDbForTests();
  db = await mod.getDb();
  const make = (who: string) => db.asService(async (q) => (await q<{ id: string }>("insert into auth.users (email) values ($1) returning id", [`${who}@x.test`]))[0]!.id);
  teacher = await make("teacher");
  alice = await make("alice");
  bob = await make("bob");
  carol = await make("carol");
  // Each learner has a profile, a shipped Job and some code.
  for (const [id, name] of [
    [alice, "Alice"],
    [bob, "Bob"],
    [carol, "Carol"],
  ] as const) {
    await db.asUser(id, async (q) => {
      await q("insert into public.profiles (id, display_name, updated_at) values ($1, $2, 1)", [id, name]);
      await q("insert into public.job_progress (user_id, job_id, status, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'shipped', 600, $2)", [id, Date.now()]);
      await q("insert into public.step_progress (user_id, job_id, step_id, status, attempts, hints_used, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'make', 'passed', 2, 1, 300, $2)", [id, Date.now()]);
      await q("insert into public.code_files (user_id, job_id, step_id, filename, content, updated_at) values ($1, 'shop-sign', 'make', 'main.py', $2, 1)", [id, `print("${name}")`]);
    });
  }
});

describe("teacher and class mode with row level security", async () => {
  const classes = await import("@/lib/server/classes");
  let classId = "";
  let code = "";

  it("only lets a teacher make a class, with an unambiguous join code", async () => {
    expect(await classes.createClass(db, teacher, "Year 10 Computing")).toBe("not-teacher");
    // The database refuses too, not only the route.
    await expect(db.asUser(alice, (q) => q("insert into public.classes (teacher_id, name, join_code) values ($1, 'Mine', 'BCDFGH')", [alice]))).rejects.toThrow(/row-level security/);
    await classes.setTeacher(db, teacher, true);
    const made = await classes.createClass(db, teacher, "Year 10 Computing");
    if (made === "not-teacher") throw new Error("expected a class");
    classId = made.id;
    code = made.joinCode;
    expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXZ2-9]{6}$/);
  });

  it("lets learners join with the code, typed any old way", async () => {
    expect(await classes.joinClass(db, alice, "ZZZZZZ")).toBeNull();
    const joined = await classes.joinClass(db, alice, ` ${code.slice(0, 3).toLowerCase()}-${code.slice(3)} `);
    expect(joined?.name).toBe("Year 10 Computing");
    await classes.joinClass(db, bob, code);
    expect((await classes.myClasses(db, alice)).map((c) => c.classId)).toEqual([classId]);
  });

  it("shows the teacher a member's progress and code", async () => {
    const students = await classes.roster(db, teacher, classId);
    expect(students.map((s) => s.name)).toEqual(["Alice", "Bob"]);
    expect(students[0]).toMatchObject({ shipped: 1, totalSeconds: 600, weekSeconds: 300 });
    const detail = await classes.studentDetail(db, teacher, classId, alice, "shop-sign");
    expect(detail?.jobs[0]).toMatchObject({ jobId: "shop-sign", status: "shipped", stepsPassed: 1, attempts: 2, hints: 1 });
    expect(detail?.files.map((f) => f.content)).toEqual(['print("Alice")']);
    const raw = await db.asUser(teacher, (q) => q("select content from public.code_files where user_id = $1", [alice]));
    expect(raw).toHaveLength(1);
  });

  it("shows the teacher nothing of a learner outside the class", async () => {
    for (const table of ["profiles", "job_progress", "step_progress", "code_files"]) {
      const col = table === "profiles" ? "id" : "user_id";
      const rows = await db.asUser(teacher, (q) => q(`select * from public.${table} where ${col} = $1`, [carol]));
      expect(rows, table).toHaveLength(0);
    }
    expect(await classes.studentDetail(db, teacher, classId, carol, null)).toBeNull();
  });

  it("never shows one member another member's rows", async () => {
    for (const table of ["profiles", "job_progress", "step_progress", "code_files"]) {
      const col = table === "profiles" ? "id" : "user_id";
      const rows = await db.asUser(alice, (q) => q(`select * from public.${table} where ${col} = $1`, [bob]));
      expect(rows, table).toHaveLength(0);
    }
    const members = await db.asUser(alice, (q) => q<{ user_id: string }>("select user_id from public.class_members"));
    expect(members.map((m) => m.user_id)).toEqual([alice]);
    // Nor can a member use the teacher's views.
    expect(await classes.roster(db, alice, classId)).toEqual([]);
    expect(await classes.studentDetail(db, alice, classId, bob, null)).toBeNull();
    expect(await classes.getClass(db, alice, classId)).toBeNull();
  });

  it("shows members their class's assignments, and only the teacher can set them", async () => {
    expect(await classes.assign(db, alice, classId, "bill-splitter", null)).toBe(false);
    expect(await classes.assign(db, teacher, classId, "bill-splitter", Date.UTC(2026, 10, 3, 12))).toBe(true);
    expect(await classes.assign(db, teacher, classId, "bill-splitter", null)).toBe(true); // changes the date, no duplicate
    const mine = await classes.myAssignments(db, alice);
    expect(mine).toEqual([expect.objectContaining({ className: "Year 10 Computing", jobId: "bill-splitter", dueAt: null })]);
    expect(await classes.myAssignments(db, carol)).toEqual([]);
  });

  it("ends the teacher's access when a learner leaves", async () => {
    expect(await classes.leaveClass(db, alice, classId)).toBe(true);
    const rows = await db.asUser(teacher, (q) => q("select * from public.code_files where user_id = $1", [alice]));
    expect(rows).toHaveLength(0);
    expect(await classes.studentDetail(db, teacher, classId, alice, null)).toBeNull();
    expect((await classes.roster(db, teacher, classId)).map((s) => s.name)).toEqual(["Bob"]);
    expect(await classes.myAssignments(db, alice)).toEqual([]);
  });

  it("lets the teacher remove a student, and delete the class", async () => {
    expect(await classes.removeStudent(db, teacher, classId, bob)).toBe(true);
    expect(await db.asUser(teacher, (q) => q("select * from public.job_progress where user_id = $1", [bob]))).toHaveLength(0);
    expect(await classes.deleteClass(db, alice, classId)).toBe(false);
    expect(await classes.deleteClass(db, teacher, classId)).toBe(true);
    expect(await classes.listClasses(db, teacher)).toEqual([]);
  });

  it("claims a public address once, and reports a taken one", async () => {
    expect(await classes.setPublicSlug(db, alice, "alice-at-the-harbour")).toBe("ok");
    expect(await classes.setPublicSlug(db, bob, "alice-at-the-harbour")).toBe("taken");
    expect(await classes.setPublicSlug(db, bob, "Not Valid")).toBe("invalid");
    // Private until the learner switches it on.
    const hidden = await db.asService((q) => q<{ p: unknown }>("select public.public_profile('alice-at-the-harbour') as p"));
    expect(hidden[0]!.p).toBeNull();
    await db.asUser(alice, (q) => q(`update public.profiles set settings = '{"publicProfile": true}'::jsonb where id = $1`, [alice]));
    const shown = await db.asService((q) => q<{ p: { displayName: string; shipped: unknown[] } }>("select public.public_profile('alice-at-the-harbour') as p"));
    expect(shown[0]!.p).toMatchObject({ displayName: "Alice", shipped: [expect.objectContaining({ jobId: "shop-sign" })] });
  });
});
