import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalStore } from "@/lib/store/local";
import { addCardsForJob, dueCards, gradeFor, pickVariant, queueSoon, review, Rating } from "@/lib/review/deck";

const DAY = 86_400_000;

describe("review deck (FSRS)", () => {
  it("adds each concept once, due from tomorrow", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    expect(await addCardsForJob(store, ["print", "strings"])).toEqual(["print", "strings"]);
    expect(await addCardsForJob(store, ["print"])).toEqual([]);
    expect(await dueCards(store)).toHaveLength(0);
    expect(await dueCards(store, Date.now() + DAY)).toHaveLength(2);
  });

  it("spaces a remembered card further out than a forgotten one", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    await addCardsForJob(store, ["print", "strings"]);
    const now = Date.now() + DAY;
    const good = await review(store, "print", "print-1", Rating.Good, now);
    const again = await review(store, "strings", "strings-1", Rating.Again, now);
    expect(good.due).toBeGreaterThan(again.due);
    expect(again.lapses + again.reps).toBeGreaterThan(0);
    expect((await store.all("review_logs")).map((l) => l.cardId).sort()).toEqual(["print-1", "strings-1"]);
  });

  it("prefers a variant not seen before", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    await review(store, "print", "print-1", Rating.Good);
    await review(store, "print", "print-2", Rating.Good);
    for (let i = 0; i < 10; i++) expect(["print-3"]).toContain(await pickVariant(store, "print", ["print-1", "print-2", "print-3"]));
  });

  it("brings a concept forward after the solution is seen", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    await addCardsForJob(store, ["print"]);
    await queueSoon(store, ["print"], 0);
    expect(await dueCards(store)).toHaveLength(1);
  });

  it("grades answers", () => {
    expect(gradeFor(false, 1)).toBe(Rating.Again);
    expect(gradeFor(true, 1)).toBe(Rating.Good);
    expect(gradeFor(true, 2)).toBe(Rating.Hard);
  });
});
