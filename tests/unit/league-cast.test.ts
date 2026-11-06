import { describe, expect, it } from "vitest";
import { bestPolicy, CAST_ENTRANTS, castEntries, castRows, expectedMoves, reachesFinish, tiersFor } from "@/lib/league/cast";
import { baselinePolicy, course, isoWeek, league, previousWeek, RACES } from "@/lib/league/course";

// A year of weeks, from the first of 2026.
const weeks = Array.from({ length: 52 }, (_, i) => `2026-W${String(i + 1).padStart(2, "0")}`);

describe("the cast's League entries", () => {
  it("are the same for the same week, whenever they're worked out", () => {
    const first = castEntries("2026-W45").map((e) => [e.id, e.score, e.finished]);
    castEntries("2026-W46");
    expect(castEntries("2026-W45").map((e) => [e.id, e.score, e.finished])).toEqual(first);
    // And a different week is a different table.
    expect(castEntries("2026-W46").map((e) => e.score)).not.toEqual(first.map((e) => e[1]));
  });

  it("has everyone in it: Aaesha and Caitlin host and race, and the rest take part", () => {
    expect(castEntries("2026-W45").map((e) => e.id)).toEqual([...CAST_ENTRANTS]);
    expect(CAST_ENTRANTS.slice(0, 2)).toEqual(["aaesha", "caitlin"]);
  });

  it("scores real races: each entry is its policy raced on the week's seeds", () => {
    for (const e of castEntries("2026-W45")) expect({ score: e.score, finished: e.finished, races: e.races }).toEqual(league(e.policy, "2026-W45"));
  });

  it("only enters policies that always get there: every tile leads to the finish, and every race finishes", () => {
    for (const week of weeks.slice(0, 12))
      for (const e of castEntries(week)) {
        expect(reachesFinish(e.policy), `${e.id} in ${week}`).toBe(true);
        expect(e.finished).toBe(RACES);
      }
  });

  it("starts from the best policy for the course, which beats the plain shortest line", () => {
    const best = bestPolicy();
    expect(reachesFinish(best)).toBe(true);
    expect(expectedMoves(best)).toBeCloseTo(15.64, 1);
    expect(expectedMoves(best)).toBeLessThan(expectedMoves(baselinePolicy()) - 1);
    // Worked out the same way every time (only adding and multiplying).
    expect(bestPolicy()).toEqual(best);
  });

  it("has a spread every week: someone hard to beat, and someone a decent crab beats", () => {
    for (const week of weeks) {
      const scores = castEntries(week).map((e) => e.score);
      const top = Math.min(...scores);
      const bottom = Math.max(...scores);
      // The top is within a whisker of the best policy for the course, on the same seeds.
      expect(top, week).toBeLessThanOrEqual(league(bestPolicy(), week).score + 0.4);
      expect(top, week).toBeLessThan(16.4);
      // A learner's Q-learning crab averages about 15.7: it beats the bottom of the table.
      expect(bottom, week).toBeGreaterThan(16.4);
      expect(bottom - top, week).toBeGreaterThanOrEqual(0.8);
      // Plausible for this course: nobody beats what the slips allow by much, or crawls round.
      for (const s of scores) {
        expect(s).toBeGreaterThan(14.5);
        expect(s).toBeLessThan(21);
      }
    }
  });

  it("takes turns: over a year everyone comes top sometimes, and nobody is always last", () => {
    const top = new Map<string, number>();
    const last = new Map<string, number>();
    for (const week of weeks) {
      const order = [...castEntries(week)].sort((a, b) => a.score - b.score);
      top.set(order[0]!.id, (top.get(order[0]!.id) ?? 0) + 1);
      last.set(order.at(-1)!.id, (last.get(order.at(-1)!.id) ?? 0) + 1);
    }
    for (const id of CAST_ENTRANTS) {
      expect(top.get(id) ?? 0, id).toBeGreaterThan(0);
      expect(last.get(id) ?? 0, id).toBeLessThan(weeks.length / 3);
    }
  });

  it("leaves out whoever you play as, since you race as them", () => {
    const names = { aaesha: "Aaesha", caitlin: "Caitlin", paul: "Paul", neil: "Neil", riya: "Riya", yahya: "Yahya" };
    expect(castRows("2026-W45", null, names).map((r) => r.name)).toEqual(["Aaesha", "Caitlin", "Paul", "Neil", "Riya", "Yahya"]);
    const asCaitlin = castRows("2026-W45", "caitlin", names);
    expect(asCaitlin.map((r) => r.key)).not.toContain("cast:caitlin");
    expect(asCaitlin).toHaveLength(5);
    expect(asCaitlin.every((r) => !r.mine)).toBe(true);
    expect(castRows("2026-W45", "someone-else", names)).toHaveLength(6);
  });

  it("shuffles who's in which tier per week", () => {
    const tiers = tiersFor("2026-W45");
    expect(Object.values(tiers).sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(weeks.some((w) => tiersFor(w).aaesha !== tiers.aaesha)).toBe(true);
  });

  it("has a table for this week and last week, whatever the date", () => {
    const now = isoWeek();
    expect(castEntries(now)).toHaveLength(6);
    expect(castEntries(previousWeek(now))).toHaveLength(6);
    expect(course().rows).toBe(7);
  });
});
