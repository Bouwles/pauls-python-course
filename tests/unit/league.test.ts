import { describe, expect, it } from "vitest";
import { baselinePolicy, course, isoWeek, league, race, raceFrames, readEntry, MOVES } from "@/lib/league/course";

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
