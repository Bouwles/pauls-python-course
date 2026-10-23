import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/lib/server/db";

let db: Db;
let alice: string;
let bob: string;

beforeAll(async () => {
  process.env.PPC_DB_DIR = "memory";
  const mod = await import("@/lib/server/db");
  mod.resetDbForTests();
  db = await mod.getDb();
  [alice, bob] = await db.asService(async (q) => {
    const a = await q<{ id: string }>("insert into auth.users (email) values ('alice@x.test') returning id");
    const b = await q<{ id: string }>("insert into auth.users (email) values ('bob@x.test') returning id");
    return [a[0]!.id, b[0]!.id];
  });
});

const code = (content: string, updatedAt: number, baseUpdatedAt: number | null = null) => ({
  table: "code_files" as const,
  row: { key: "j/make/main.py", jobId: "j", stepId: "make", filename: "main.py", content, cursor: 0, baseUpdatedAt, conflictNote: false, updatedAt },
});

describe("server sync with row level security", async () => {
  const { pullAll, pushChanges } = await import("@/lib/server/sync");

  it("saves and returns a learner's rows, and nobody else's", async () => {
    await pushChanges(db, alice, [code("print('alice')", 100)]);
    const mine = await pullAll(db, alice);
    const theirs = await pullAll(db, bob);
    expect((mine.code_files as { content: string }[])[0]!.content).toBe("print('alice')");
    expect(theirs.code_files).toHaveLength(0);
  });

  it("keeps the newest version, and the other in history, when two devices disagree", async () => {
    await pushChanges(db, alice, [code("from laptop", 200, 100)]);
    const { conflicts } = await pushChanges(db, alice, [code("from phone", 150, 100)]);
    expect(conflicts).toEqual(["j/make/main.py"]);
    const rows = await pullAll(db, alice);
    expect((rows.code_files as { content: string }[])[0]!.content).toBe("from laptop");
    expect((rows.code_snapshots as { content: string; reason: string }[]).some((s) => s.content === "from phone" && s.reason === "conflict")).toBe(true);
  });

  it("rejects one bad row without losing the rest", async () => {
    const { rejected } = await pushChanges(db, alice, [
      { table: "step_progress", row: { key: "j/x", jobId: "j", stepId: "x", status: "nonsense", attempts: 0, hintsUsed: 0, seenSolution: false, timeSpent: 0, data: {}, updatedAt: 1 } },
      { table: "story_flags", row: { key: "the-hill-is-harder", setAt: 5 } },
    ]);
    expect(rejected).toEqual(["step_progress:j/x"]);
    expect((await pullAll(db, alice)).story_flags).toHaveLength(1);
  });

  it("does not let one learner write another's rows", async () => {
    await expect(db.asUser(bob, (q) => q("insert into public.story_flags (user_id, flag_id, set_at) values ($1, 'x', 1)", [alice]))).rejects.toThrow(/row-level security/);
  });

  it("deletes everything when the account goes", async () => {
    await db.asService((q) => q("delete from auth.users where id = $1", [alice]));
    const left = await db.asService((q) => q<{ n: number }>("select count(*)::int as n from public.code_files where user_id = $1", [alice]));
    expect(left[0]!.n).toBe(0);
  });
});
