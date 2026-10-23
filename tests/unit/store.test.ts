import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalStore } from "@/lib/store/local";
import { getCode, listSnapshots, saveCode, snapshot, updateStep } from "@/lib/store/progress";

describe("local store", () => {
  it("saves code, queues it for the server, and keeps snapshots in order", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    await saveCode(store, "job", "make", "main.py", "print(1)", 5);
    expect((await getCode(store, "job", "make", "main.py"))?.content).toBe("print(1)");
    expect(await store.outboxSize()).toBe(1);
    await snapshot(store, "job", "make", "main.py", "a", "run");
    await new Promise((r) => setTimeout(r, 5));
    await snapshot(store, "job", "make", "main.py", "b", "check");
    await snapshot(store, "job", "make", "main.py", "b", "run"); // identical: skipped
    const snaps = await listSnapshots(store, "job", "make", "main.py");
    expect(snaps.map((s) => s.content)).toEqual(["b", "a"]);
  });

  it("moves guest work into an account and queues all of it", async () => {
    const guest = new LocalStore(`g-${Math.random()}`);
    await updateStep(guest, "sign-on-the-door", "make", { status: "passed" });
    const mine = new LocalStore(`u-${Math.random()}`);
    expect(await mine.absorb(guest)).toBeGreaterThan(0);
    expect((await mine.get("step_progress", "sign-on-the-door/make"))?.status).toBe("passed");
    expect(await mine.outboxSize()).toBeGreaterThan(0);
  });

  it("only clears outbox entries that were not changed again in flight", async () => {
    const store = new LocalStore(`t-${Math.random()}`);
    await saveCode(store, "job", "make", "main.py", "one", null);
    const batch = await store.outbox();
    await new Promise((r) => setTimeout(r, 3));
    await saveCode(store, "job", "make", "main.py", "two", null);
    await store.clearSent(batch.map((b) => b.entry));
    expect(await store.outboxSize()).toBe(1);
  });
});
