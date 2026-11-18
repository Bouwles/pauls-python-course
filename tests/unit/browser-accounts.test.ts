import { beforeAll, describe, expect, it } from "vitest";
import type { Db, Query } from "@/lib/server/db";

// supabase/migrations/0008 against the real migrations on an in-memory PGlite. The browser talks
// to the database directly, so these are the only rules there are: each query runs as one user
// (or as nobody, for the sign-up form), and RLS and the functions decide what it gets.
let db: Db;
const ids: Record<string, string> = {};

/** As someone not signed in, like the sign-up form before there's an account. */
const asAnon = <T,>(fn: (q: Query) => Promise<T>) =>
  db.asService(async (q) => {
    await q("select set_config('request.jwt.claims', '', true)");
    await q("set local role anon");
    return fn(q);
  });

const signUp = (email: string, username: string | null) =>
  db.asService(async (q) => (await q<{ id: string }>("insert into auth.users (email, raw_user_meta_data) values ($1, $2::jsonb) returning id", [email, JSON.stringify(username ? { username } : {})]))[0]!.id);

beforeAll(async () => {
  process.env.PPC_DB_DIR = "memory";
  const mod = await import("@/lib/server/db");
  mod.resetDbForTests();
  db = await mod.getDb();
  for (const who of ["ruth", "sam", "paul", "zara"]) ids[who] = await signUp(`${who}@x.test`, who === "ruth" ? "Ruth_O" : who);
  // Ruth has shipped Course Sign, with code in two steps, and has a project under way.
  await db.asUser(ids.ruth!, async (q) => {
    await q("insert into public.job_progress (user_id, job_id, status, shipped_at, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'shipped', 5, 600, 10)", [ids.ruth]);
    await q("insert into public.job_progress (user_id, job_id, status, time_spent_seconds, updated_at) values ($1, 'bill-splitter', 'in-progress', 60, 11)", [ids.ruth]);
    await q("insert into public.code_files (user_id, job_id, step_id, filename, content, updated_at) values ($1, 'shop-sign', 'make', 'main.py', 'print(1)', 10)", [ids.ruth]);
    await q("insert into public.code_files (user_id, job_id, step_id, filename, content, updated_at) values ($1, 'bill-splitter', 'make', 'main.py', 'secret', 11)", [ids.ruth]);
    await q("insert into public.step_progress (user_id, job_id, step_id, status, attempts, hints_used, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'make', 'passed', 2, 1, 300, 10)", [ids.ruth]);
  });
});

describe("usernames", () => {
  it("makes the profile, with its username, when the account is made", async () => {
    const rows = await db.asUser(ids.ruth!, (q) => q<{ username: string; display_name: string }>("select username, display_name from public.profiles where id = $1", [ids.ruth]));
    expect(rows[0]).toEqual({ username: "ruth_o", display_name: "ruth_o" });
  });

  it("refuses a name that's taken, so the sign-up fails rather than sharing it", async () => {
    await expect(signUp("other@x.test", "RUTH_O")).rejects.toThrow(/unique|duplicate/i);
  });

  it("tells the sign-up form whether a name is free, and nothing else", async () => {
    const free = (name: string) => asAnon(async (q) => (await q<{ ok: boolean }>("select public.username_available($1) as ok", [name]))[0]!.ok);
    expect(await free("ruth_o")).toBe(false);
    expect(await free(" Ruth_O ")).toBe(false);
    expect(await free("newcomer")).toBe(true);
    expect(await free("no")).toBe(false);
    expect(await free("has space")).toBe(false);
    // Signed out, nothing else is readable.
    await expect(asAnon((q) => q("select username from public.profiles"))).rejects.toThrow(/permission denied/);
  });
});

describe("saving from two devices", () => {
  it("keeps the newer row when an older copy arrives late", async () => {
    await db.asUser(ids.sam!, async (q) => {
      await q("insert into public.job_progress (user_id, job_id, status, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'shipped', 900, 200)", [ids.sam]);
      // The other device, offline since before it shipped, saves its copy.
      await q(
        `insert into public.job_progress (user_id, job_id, status, time_spent_seconds, updated_at) values ($1, 'shop-sign', 'in-progress', 100, 150)
         on conflict (user_id, job_id) do update set status = excluded.status, time_spent_seconds = excluded.time_spent_seconds, updated_at = excluded.updated_at`,
        [ids.sam],
      );
    });
    const rows = await db.asUser(ids.sam!, (q) => q<{ status: string; updated_at: string }>("select status, updated_at from public.job_progress where user_id = $1", [ids.sam]));
    expect(rows[0]!.status).toBe("shipped");
    expect(Number(rows[0]!.updated_at)).toBe(200);
  });

  it("pulls only your own rows", async () => {
    const all = await db.asUser(ids.ruth!, async (q) => (await q<{ data: Record<string, unknown[]> }>("select public.sync_pull() as data"))[0]!.data);
    expect(all.profiles).toHaveLength(1);
    expect((all.job_progress as { user_id: string }[]).every((r) => r.user_id === ids.ruth)).toBe(true);
    expect(all.code_files).toHaveLength(2);
  });
});

describe("friends", () => {
  const call = <T,>(who: string, sql: string, params: unknown[] = []) => db.asUser(ids[who]!, async (q) => (await q<{ r: T }>(sql, params))[0]!.r);
  const friendProfile = (who: string, name: string) => call<Record<string, unknown> | null>(who, "select public.friend_profile($1) as r", [name]);

  it("sees nothing of someone who isn't a friend", async () => {
    expect(await friendProfile("sam", "ruth_o")).toBeNull();
    expect(await db.asUser(ids.sam!, (q) => q("select * from public.friend_code('ruth_o', 'shop-sign')"))).toEqual([]);
    // The table itself is closed: only the functions read it.
    await expect(db.asUser(ids.sam!, (q) => q("select * from public.friendships"))).rejects.toThrow(/permission denied/);
  });

  it("asks by username, and both people see the request", async () => {
    expect(await call("sam", "select public.request_friend($1) as r", ["RUTH_O"])).toBe("sent");
    expect(await call("sam", "select public.request_friend($1) as r", ["ruth_o"])).toBe("pending");
    expect(await call("sam", "select public.request_friend($1) as r", ["nobody_here"])).toBe("not-found");
    expect(await call("sam", "select public.request_friend($1) as r", ["sam"])).toBe("self");
    const ruths = await db.asUser(ids.ruth!, (q) => q<{ username: string; status: string; incoming: boolean }>("select username, status, incoming from public.my_friends()"));
    expect(ruths).toEqual([{ username: "sam", status: "pending", incoming: true }]);
    // Still not friends: nothing to see yet.
    expect(await friendProfile("sam", "ruth_o")).toBeNull();
  });

  it("once accepted, shows a friend's profile and Shelf, and only shipped work", async () => {
    expect(await call("ruth", "select public.answer_friend($1, true) as r", [ids.sam])).toBe("accepted");
    const seen = await friendProfile("sam", "ruth_o");
    expect(seen).toMatchObject({ username: "ruth_o", shipped: [{ jobId: "shop-sign", status: "shipped" }] });
    expect(JSON.stringify(seen)).not.toContain("bill-splitter");
    const code = await db.asUser(ids.sam!, (q) => q<{ content: string }>("select content from public.friend_code('ruth_o', 'shop-sign')"));
    expect(code.map((c) => c.content)).toEqual(["print(1)"]);
    // Unfinished work stays private, even to friends.
    expect(await db.asUser(ids.sam!, (q) => q("select * from public.friend_code('ruth_o', 'bill-splitter')"))).toEqual([]);
    // And friends still can't read each other's tables directly.
    expect(await db.asUser(ids.sam!, (q) => q("select * from public.code_files where user_id = $1", [ids.ruth]))).toEqual([]);
  });

  it("a request someone already sent you is accepted by asking back", async () => {
    expect(await call("zara", "select public.request_friend($1) as r", ["paul"])).toBe("sent");
    expect(await call("paul", "select public.request_friend($1) as r", ["zara"])).toBe("accepted");
  });

  it("unfriends, and turns down requests", async () => {
    expect(await call("sam", "select public.remove_friend($1) as r", [ids.ruth])).toBe(true);
    expect(await friendProfile("sam", "ruth_o")).toBeNull();
    expect(await call("zara", "select public.request_friend($1) as r", ["sam"])).toBe("sent");
    expect(await call("sam", "select public.answer_friend($1, false) as r", [ids.zara])).toBe("declined");
    expect(await db.asUser(ids.sam!, (q) => q("select * from public.my_friends()"))).toEqual([]);
  });

  it("does nothing for someone signed out", async () => {
    await expect(asAnon((q) => q("select public.request_friend('ruth_o')"))).rejects.toThrow(/permission denied/);
    await expect(asAnon((q) => q("select public.friend_profile('ruth_o')"))).rejects.toThrow(/permission denied/);
  });
});

describe("classes from the browser", () => {
  let cls = "";
  let code = "";

  it("makes a class, which makes you a teacher, with a readable code", async () => {
    cls = await db.asUser(ids.paul!, async (q) => (await q<{ id: string }>("select public.create_class('Thursday Python') as id"))[0]!.id);
    const mine = await db.asUser(ids.paul!, (q) => q<{ name: string; join_code: string; students: number }>("select * from public.teacher_classes()"));
    expect(mine).toHaveLength(1);
    code = mine[0]!.join_code;
    expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXZ2-9]{6}$/);
    expect(await db.asUser(ids.paul!, (q) => q<{ role: string }>("select role from public.profiles where id = $1", [ids.paul]))).toEqual([{ role: "teacher" }]);
  });

  it("lets students join with the code however they type it, and see what's set", async () => {
    await db.asUser(ids.paul!, (q) => q("select public.set_assignment($1, 'shop-sign', null)", [cls]));
    await db.asUser(ids.ruth!, (q) => q("select public.join_class($1)", [`${code.slice(0, 3).toLowerCase()}-${code.slice(3)}`]));
    const classes = await db.asUser(ids.ruth!, (q) => q<{ name: string; teacher_name: string }>("select name, teacher_name from public.my_classes()"));
    expect(classes).toEqual([{ name: "Thursday Python", teacher_name: "paul" }]);
    const set = await db.asUser(ids.ruth!, (q) => q<{ job_id: string; class_name: string }>("select job_id, class_name from public.my_assignments()"));
    expect(set).toEqual([{ job_id: "shop-sign", class_name: "Thursday Python" }]);
    await expect(db.asUser(ids.ruth!, (q) => q("select public.join_class('ZZZZZZ')"))).rejects.toThrow(/No class with that code/);
  });

  it("shows the teacher the register and one student's work, under their username", async () => {
    const roster = await db.asUser(ids.paul!, (q) => q<{ username: string; shipped: number }>("select username, shipped from public.class_roster($1, 0)", [cls]));
    expect(roster).toEqual([{ username: "ruth_o", shipped: 1 }]);
    const detail = await db.asUser(ids.paul!, async (q) => (await q<{ r: { username: string; jobId: string; files: { content: string }[] } }>("select public.student_detail($1, $2, 'shop-sign') as r", [cls, ids.ruth]))[0]!.r);
    expect(detail.username).toBe("ruth_o");
    expect(detail.files.map((f) => f.content)).toEqual(["print(1)"]);
    const sets = await db.asUser(ids.paul!, (q) => q<{ job_id: string; shipped: number }>("select job_id, shipped from public.class_assignments($1)", [cls]));
    expect(sets).toEqual([{ job_id: "shop-sign", shipped: 1 }]);
  });

  it("shows nobody else's class to anyone but its teacher", async () => {
    expect(await db.asUser(ids.sam!, (q) => q("select * from public.class_roster($1, 0)", [cls]))).toEqual([]);
    expect(await db.asUser(ids.sam!, async (q) => (await q<{ r: unknown }>("select public.student_detail($1, $2, null) as r", [cls, ids.ruth]))[0]!.r)).toBeNull();
    expect(await db.asUser(ids.ruth!, (q) => q("select * from public.class_roster($1, 0)", [cls]))).toEqual([]);
    expect(await db.asUser(ids.sam!, async (q) => (await q<{ r: boolean }>("select public.set_assignment($1, 'bill-splitter', null) as r", [cls]))[0]!.r)).toBe(false);
  });
});
