import { describe, expect, it } from "vitest";
import { nextJob, openActs, openBuildings } from "@/lib/progress-rules";
import type { ActSummary, JobSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";

const job = (id: string, act: string, building: string, status: "written" | "outline" = "written"): JobSummary => ({
  id, title: id, status, client: "moss", building, act, actNumber: 1, number: 1, estimatedMinutes: 10, summary: "", conceptsIntroduced: [], conceptsReviewed: [], shelf: null, stepCount: 3, sidequest: false, placementFor: null, timedMinutes: null,
});
const act = (id: string, number: number, jobs: JobSummary[]): ActSummary => ({ id, number, title: id, district: id, subject: "", hours: 1, summary: "", lockedLine: "", intro: [], jobs });
const shipped = (jobId: string): JobProgressRow => ({ key: jobId, jobId, status: "shipped", startedAt: 1, shippedAt: 2, stretchDone: [], timeSpent: 0, updatedAt: 2 });

const acts = [act("one", 1, [job("a", "one", "bakery"), job("b", "one", "pub")]), act("two", 2, [job("c", "two", "library", "outline")])];

describe("what is open", () => {
  it("opens the first act from the start and the next when the last job ships", () => {
    expect([...openActs(acts, {})]).toEqual(["one"]);
    expect(openActs(acts, { a: shipped("a") }).has("two")).toBe(false);
    expect(openActs(acts, { b: shipped("b") }).has("two")).toBe(true);
  });

  it("lights the workshop always, and buildings whose jobs have shipped", () => {
    expect([...openBuildings(acts, {})]).toEqual(["workshop"]);
    expect(openBuildings(acts, { a: shipped("a") }).has("bakery")).toBe(true);
  });

  it("suggests the first unshipped written job", () => {
    expect(nextJob(acts, {})?.id).toBe("a");
    expect(nextJob(acts, { a: shipped("a") })?.id).toBe("b");
    expect(nextJob(acts, { a: shipped("a"), b: shipped("b") })).toBeNull();
  });

  it("gates on the last written Job, skipping outlines and sidequests", () => {
    const three = [
      act("one", 1, [job("a", "one", "bakery"), { ...job("side", "one", "workshop"), sidequest: true }]),
      act("two", 2, [job("c", "two", "library"), job("d", "two", "pub", "outline")]),
      act("three", 3, [job("e", "three", "scrapyard")]),
    ];
    expect(openActs(three, { a: shipped("a") }).has("two")).toBe(true);
    expect(openActs(three, { a: shipped("a"), c: shipped("c") }).has("three")).toBe(true);
    expect(nextJob(three, { a: shipped("a") })?.id).toBe("c");
  });

  it("opens the next Act when its placement section is passed, and counts placed Jobs as done", () => {
    const placements = [{ act: "one", jobId: "placement-one", title: "", summary: "", estimatedMinutes: 20 }];
    expect(openActs(acts, { "placement-one": shipped("placement-one") }, placements).has("two")).toBe(true);
    expect(openActs(acts, {}, placements).has("two")).toBe(false);
    const placed = { ...shipped("b"), status: "placed" as const };
    expect(openActs(acts, { b: placed }).has("two")).toBe(true);
    expect(openBuildings(acts, { b: placed }).has("pub")).toBe(true);
  });
});
