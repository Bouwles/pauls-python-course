import { describe, expect, it } from "vitest";
import { baselinePolicy, course, isWeek, isoWeek, league, movesWithoutSlips, policyText, previousWeek, race, raceFrames, readEntry, readPolicyText, scoreOf, weekName, weekStart, MOVES } from "@/lib/league/course";
import { dropEntry, entryFor, KEEP_WEEKS, putEntry, raceEntry, readEntries, writeEntries } from "@/lib/league/local";

describe("the Crab League", () => {
  it("races the same way for the same seed", () => {
    const p = baselinePolicy();
    expect(race(p, 42)).toEqual(race(p, 42));
    expect(league(p, "2026-W43")).toEqual(league(p, "2026-W43"));
  });

  it("finishes nearly every race with the shortest-path policy, and a random one doesn't", () => {
    const good = league(baselinePolicy(), "2026-W43");
    expect(good.finished).toBeGreaterThanOrEqual(45);
    expect(good.score).toBeLessThan(25);
    const c = course();
    const lazy = Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => "up" as const));
    expect(league(lazy, "2026-W43").finished).toBe(0);
  });

  it("reads policies and Q-tables, and explains bad entries", () => {
    const c = course();
    const p = baselinePolicy();
    expect(readEntry({ format: "ppc-league-1", policy: p })).toEqual({ policy: p });
    // A Q-table whose best action is the baseline's move gives the same policy.
    const q = p.map((row) => row.map((m) => MOVES.map((a) => (a === m ? 1 : 0))));
    expect(readEntry({ q })).toEqual({ policy: p });
    expect(readEntry({ policy: [["up"]] })).toHaveProperty("error");
    expect(readEntry({ policy: Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => "sideways")) })).toHaveProperty("error");
    expect(readEntry({ format: "something-else", policy: p })).toHaveProperty("error");
  });

  it("names ISO weeks, Monday first", () => {
    expect(isoWeek(new Date(Date.UTC(2026, 9, 23)))).toBe("2026-W43");
    expect(isoWeek(new Date(Date.UTC(2027, 0, 1)))).toBe("2026-W53");
    expect(isoWeek(new Date(Date.UTC(2026, 0, 1)))).toBe("2026-W01");
  });

  it("makes replay frames that end where the race ends", () => {
    const frames = raceFrames(baselinePolicy(), 7);
    const c = course();
    expect(frames.at(-1)!.crab).toEqual(c.finish);
    expect(frames[0]!.crab).toEqual(c.start);
  });
});

describe("racing an entry in the browser", () => {
  // Thursday of week 45, 2026.
  const now = Date.UTC(2026, 10, 5, 18, 30);
  const policy = baselinePolicy();
  const file = JSON.stringify({ format: "ppc-league-1", policy });

  it("races league.json for this week, there and then, with the same score the server would give", () => {
    const got = raceEntry(file, now);
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(got.entry.week).toBe("2026-W45");
    expect(got.entry.enteredAt).toBe(now);
    expect(got.entry.policy).toEqual(policy);
    expect(got.result).toEqual(league(policy, "2026-W45"));
  });

  it("takes a Q-table as its greedy policy", () => {
    const q = policy.map((row) => row.map((m) => MOVES.map((a) => (a === m ? 0.5 : -1))));
    const got = raceEntry(JSON.stringify({ format: "ppc-league-1", q }), now);
    expect(got.ok && got.entry.policy).toEqual(policy);
  });

  it("says what's wrong with a file that isn't an entry", () => {
    expect(raceEntry("not json", now)).toEqual({ ok: false, error: expect.stringMatching(/isn't JSON/) });
    expect(raceEntry(JSON.stringify({ policy: [["up"]] }), now)).toEqual({ ok: false, error: expect.stringMatching(/7 rows of 9/) });
    expect(raceEntry(JSON.stringify({ format: "other", policy }), now)).toEqual({ ok: false, error: expect.stringMatching(/Unknown format/) });
    expect(raceEntry("[]", now).ok).toBe(false);
  });

  it("keeps one entry a week, the newest, newest week first", () => {
    const a = { week: "2026-W44", policy, enteredAt: 1 };
    const b = { week: "2026-W45", policy, enteredAt: 2 };
    const c = { week: "2026-W45", policy: policy.map((row) => row.map(() => "down" as const)), enteredAt: 3 };
    let list = putEntry(putEntry([], a), b);
    expect(list.map((e) => e.week)).toEqual(["2026-W45", "2026-W44"]);
    list = putEntry(list, c);
    expect(list).toHaveLength(2);
    expect(entryFor(list, "2026-W45")!.enteredAt).toBe(3);
    expect(dropEntry(list, "2026-W45").map((e) => e.week)).toEqual(["2026-W44"]);
    // Only about a term is kept.
    let many: typeof list = [];
    for (let w = 1; w <= 30; w++) many = putEntry(many, { week: `2026-W${String(w).padStart(2, "0")}`, policy, enteredAt: w });
    expect(many).toHaveLength(KEEP_WEEKS);
    expect(many[0]!.week).toBe("2026-W30");
  });

  it("reads back what it keeps, and shrugs off anything it can't read", () => {
    const list = putEntry([], { week: "2026-W45", policy, enteredAt: now });
    expect(readEntries(writeEntries(list))).toEqual(list);
    expect(readEntries(null)).toEqual([]);
    expect(readEntries("not json")).toEqual([]);
    expect(readEntries(JSON.stringify({ v: 1, e: [{ w: "2026-W45", p: "nope", at: 1 }, { w: "someday", p: policyText(policy), at: 1 }, null, 7] }))).toEqual([]);
  });

  it("gives the same score however often it's asked", () => {
    expect(scoreOf(policy, "2026-W45")).toEqual(league(policy, "2026-W45"));
    expect(scoreOf(policy, "2026-W45")).toBe(scoreOf(policy, "2026-W45"));
  });

  it("writes a policy as 63 letters, and reads only a whole one back", () => {
    const text = policyText(policy);
    expect(text).toMatch(/^[udlr]{63}$/);
    expect(readPolicyText(text)).toEqual(policy);
    expect(readPolicyText(text.slice(1))).toBeNull();
    expect(readPolicyText(`${text.slice(1)}x`)).toBeNull();
    expect(readPolicyText(42)).toBeNull();
  });

  it("knows the weeks around this one", () => {
    expect(previousWeek("2026-W45")).toBe("2026-W44");
    expect(previousWeek("2027-W01")).toBe("2026-W53");
    expect(previousWeek("2026-W01")).toBe("2025-W52");
    expect(isoWeek(new Date(weekStart("2026-W45")))).toBe("2026-W45");
    expect(new Date(weekStart("2026-W01")).toISOString()).toBe("2025-12-29T00:00:00.000Z");
    expect(weekName("2026-W05")).toBe("Week 5, 2026");
    expect(isWeek("2026-W45")).toBe(true);
    expect(isWeek("2026-W54")).toBe(false);
    expect(isWeek("2026-45")).toBe(false);
  });

  it("counts the shortest path's moves when nothing slips", () => {
    expect(movesWithoutSlips(baselinePolicy())).toBe(14);
    const c = course();
    expect(movesWithoutSlips(Array.from({ length: c.rows }, () => Array.from({ length: c.cols }, () => "up" as const)))).toBeNull();
  });
});
