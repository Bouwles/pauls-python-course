import { course, readPolicyText } from "../../lib/league/course";
import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { deflateSync, strToU8 } from "fflate";
import { defaultAvatar } from "@/lib/avatar";
import { encodeJoin, toBase64Url } from "@/lib/classes/link";
import { EMPTY_BOOK } from "@/lib/classes/store";
import type { ClassBook, ClassInfo, Report } from "@/lib/classes/types";
import { newCardRow } from "@/lib/review/deck";
import { LocalStore } from "@/lib/store/local";
import { blankProfile, snapshotKey } from "@/lib/store/progress";
import { DEFAULT_SETTINGS, TABLES, type Tables } from "@/lib/store/types";
import { applySave, collectSave, reminderDue, type BookIO } from "@/lib/save/browser";
import { exportData, exportFiles } from "@/lib/save/export";
import { SAVE_LIMITS, decodeSaveText, emptyTables, encodeSaveCode, problemText, readSave, saveFileName, saveJson, saveWire, type SaveData, type SaveRead, type SaveTables } from "@/lib/save/format";
import { mergeBooks, mergeSaves } from "@/lib/save/merge";
import { describeDetail, describeSave, summarise } from "@/lib/save/summary";

const NOV_6 = Date.UTC(2026, 10, 6, 12);
const DAY = 24 * 3600_000;

const cls: ClassInfo = { id: "Ab3dEf6hIj9kLm0n", name: "Thursday Python", teacher: "Paul", assignments: [{ jobId: "shop-sign", due: "2026-11-20", note: "Before Thursday." }], updatedAt: NOV_6 - 5 * DAY };

const report = (over: Partial<Report> = {}): Report => ({
  classId: cls.id,
  className: cls.name,
  teacher: "Paul",
  student: { id: "Ruth0000student1", name: "Ruth", character: { ...defaultAvatar(), hair: "afro" }, playAs: "neil" },
  sentAt: NOV_6 - DAY,
  shipped: 3,
  projects: [{ jobId: "shop-sign", status: "shipped", passed: 9, seen: 1, total: 10, hints: 2, seconds: 1260, lastWorked: NOV_6 - 2 * DAY, code: [{ name: "main.py", content: 'print("Open 9 till 5")\n' }], codeLeftOut: false }],
  ...over,
});

const book = (): ClassBook => ({
  me: "Caitlin0student1",
  teaching: [],
  joined: [{ ...cls, joinedAt: NOV_6 - 4 * DAY, build: { "shop-sign": "make" } }],
});

/** A browser's worth of work, one or more rows in every table, as the app writes them. */
function caitlin(): SaveData {
  const t = emptyTables();
  t.profile.push({
    ...blankProfile(),
    displayName: "Caitlin",
    character: { ...defaultAvatar(), hair: "braids", glasses: true },
    settings: { ...DEFAULT_SETTINGS, playAs: "caitlin", theme: "light", editorFontSize: 16 },
    experience: "some",
    lastLocation: { jobId: "bill-splitter", stepId: "make", cursor: 12, file: "main.py" },
    onboarded: true,
    updatedAt: NOV_6 - DAY,
  });
  const jobs = ["shop-sign", "bill-splitter", "unit-converter", "tip-jar", "receipt", "timetable", "quiz", "grades", "inventory", "budget", "weather", "library"];
  for (const [i, jobId] of jobs.entries())
    t.job_progress.push({ key: jobId, jobId, status: i === 1 ? "shipped-stretch" : "shipped", startedAt: NOV_6 - 20 * DAY + i, shippedAt: NOV_6 - 10 * DAY + i, stretchDone: i === 1 ? ["round-up"] : [], timeSpent: 1200 + i, updatedAt: NOV_6 - 10 * DAY + i });
  t.job_progress.push({ key: "maze", jobId: "maze", status: "in-progress", startedAt: NOV_6 - DAY, shippedAt: null, stretchDone: [], timeSpent: 60, updatedAt: NOV_6 - DAY });
  t.step_progress.push(
    { key: "shop-sign/make", jobId: "shop-sign", stepId: "make", status: "passed", attempts: 3, hintsUsed: 1, seenSolution: false, predictChoice: null, selfExplanation: "Because the text\nhas quotes.", selfRating: "had", timeSpent: 300, data: {}, updatedAt: NOV_6 - 12 * DAY },
    { key: "shop-sign/predict", jobId: "shop-sign", stepId: "predict", status: "seen-solution", attempts: 1, hintsUsed: 3, seenSolution: true, predictChoice: "b", selfExplanation: null, selfRating: null, timeSpent: 40, data: { answers: { q1: "42" }, order: [2, 0, 1], git: { repo: { files: { "finance/cli.py": "print(1)\n" } } } }, updatedAt: NOV_6 - 12 * DAY },
    { key: "maze/make", jobId: "maze", stepId: "make", status: "in-progress", attempts: 0, hintsUsed: 0, seenSolution: false, predictChoice: null, selfExplanation: null, selfRating: null, timeSpent: 20, data: {}, updatedAt: NOV_6 - DAY },
  );
  t.code_files.push(
    { key: "shop-sign/make/main.py", jobId: "shop-sign", stepId: "make", filename: "main.py", content: 'print("CAITLIN\'S\tDESK")\n', cursor: 10, baseUpdatedAt: null, conflictNote: false, updatedAt: NOV_6 - 12 * DAY },
    { key: "maze/make/maze.py", jobId: "maze", stepId: "make", filename: "maze.py", content: "grid = []\n# half done\n", cursor: null, baseUpdatedAt: null, conflictNote: false, updatedAt: NOV_6 - DAY },
    { key: "personal-finance/make/finance/cli.py", jobId: "personal-finance", stepId: "make", filename: "finance/cli.py", content: "def main():\n    pass\n", cursor: 0, baseUpdatedAt: null, conflictNote: false, updatedAt: NOV_6 - 3 * DAY },
  );
  const at = NOV_6 - 12 * DAY;
  t.code_snapshots.push({ key: `shop-sign/make/main.py/${String(at).padStart(14, "0")}-k2x9q1`, jobId: "shop-sign", stepId: "make", filename: "main.py", content: 'print("first go")\n', reason: "run", createdAt: at, updatedAt: at });
  t.review_cards.push({ ...newCardRow("f-strings", NOV_6 - 9 * DAY), updatedAt: NOV_6 - 9 * DAY });
  t.review_logs.push({ key: `${NOV_6 - 2 * DAY}-abc123`, cardId: "f-strings-2", rating: 3, reviewedAt: NOV_6 - 2 * DAY, elapsedDays: 1, scheduledDays: 4, updatedAt: NOV_6 - 2 * DAY });
  t.misconceptions.push({ key: "print-returns", count: 2, lastSeenAt: NOV_6 - 3 * DAY, lastAddressedAt: null, updatedAt: NOV_6 - 3 * DAY });
  t.drill_bests.push({ key: "slicing", bestMs: 41_000, achievedAt: NOV_6 - 4 * DAY, updatedAt: NOV_6 - 4 * DAY });
  t.collectibles.push({ key: "name-plate", foundAt: NOV_6 - 10 * DAY, updatedAt: NOV_6 - 10 * DAY });
  t.story_flags.push({ key: "act-1-note", setAt: NOV_6 - 10 * DAY, updatedAt: NOV_6 - 10 * DAY });
  t.events.push({ key: "0f8c6d1e-3b7a-4c55-9d2e-1a2b3c4d5e6f", type: "check", payload: { passed: true }, createdAt: NOV_6 - DAY, updatedAt: NOV_6 - DAY });
  // A League entry too: a week's policy, one letter a tile (lib/league/course.ts).
  const c = course();
  const policy = readPolicyText("r".repeat(c.rows * c.cols))!;
  return { savedAt: NOV_6, tables: t, classes: book(), league: [{ week: "2026-W45", policy, enteredAt: NOV_6 }] };
}

const ok = (r: SaveRead) => {
  if (!r.ok) throw new Error(`didn't read: ${r.problem}`);
  return r;
};

/** A save's JSON packed by hand, as an attacker or a newer version might. */
const code = (value: unknown, version = 1) => `ppc-save.${version}.${toBase64Url(deflateSync(strToU8(JSON.stringify(value))))}`;
const wire = (tables: Partial<Record<keyof Tables, unknown>>, over: Record<string, unknown> = {}) => ({ kind: "ppc-save", v: 1, savedAt: NOV_6, tables, ...over });

function memoryBook(start: ClassBook = EMPTY_BOOK): BookIO & { now: () => ClassBook } {
  let held = start;
  return {
    load: () => held,
    save: (b) => {
      held = b;
      return true;
    },
    now: () => held,
  };
}

const sortRows = (t: SaveTables) => Object.fromEntries(TABLES.map((k) => [k, [...t[k]].sort((a, b) => a.key.localeCompare(b.key))]));

describe("save: round trips", () => {
  it("the file holds everything, and reads back as it went in", () => {
    const save = caitlin();
    const back = ok(decodeSaveText(saveJson(save)));
    expect(back.skipped).toBe(0);
    expect(back.save).toEqual(save);
  });

  it("the save code holds the same, and survives a chat wrapping it", () => {
    const save = caitlin();
    const text = encodeSaveCode(save);
    expect(text).toMatch(/^ppc-save\.1\.[A-Za-z0-9_-]+$/);
    // Much shorter than the file.
    expect(text.length).toBeLessThan(saveJson(save).length);
    expect(ok(decodeSaveText(text)).save).toEqual(save);
    const wrapped = `"${text.match(/.{1,60}/g)!.join("\n  ")}".`;
    expect(ok(decodeSaveText(wrapped)).save).toEqual(save);
  });

  it("the file says what it is for someone who opens it", () => {
    const w = saveWire(caitlin());
    expect(w.kind).toBe("ppc-save");
    expect(w.v).toBe(1);
    expect(w.course).toBe("Paul's Python Course");
    expect(saveFileName(caitlin())).toMatch(/^ppc-save-caitlin-2026-11-06\.json$/);
  });

  it("goes from one browser's store into an empty one, classes and all", async () => {
    const from = new LocalStore(`save-a-${Math.random()}`);
    const save = caitlin();
    for (const t of TABLES) await from.putMany(t, save.tables[t] as never[]);
    const collected = await collectSave(from, book(), NOV_6);
    const text = encodeSaveCode(collected);

    const to = new LocalStore(`save-b-${Math.random()}`);
    const theirs = memoryBook();
    await applySave(to, ok(decodeSaveText(text)).save, "replace", { book: theirs, now: NOV_6 });
    const after = await collectSave(to, theirs.now(), NOV_6);
    expect(sortRows(after.tables)).toEqual(sortRows(save.tables));
    expect(theirs.now()).toEqual(book());
    // Loading it counts as saving: the reminder starts again from it.
    expect(await to.kvGet("save-last")).toEqual({ at: NOV_6, shipped: 12 });
  });

  it("replacing leaves nothing of what was there before", async () => {
    const store = new LocalStore(`save-c-${Math.random()}`);
    await store.put("code_files", { key: "old/make/main.py", jobId: "old", stepId: "make", filename: "main.py", content: "x", cursor: null, baseUpdatedAt: null, conflictNote: false, updatedAt: 1 });
    await store.put("job_progress", { key: "old", jobId: "old", status: "shipped", startedAt: 1, shippedAt: 2, stretchDone: [], timeSpent: 1, updatedAt: 2 });
    const held = memoryBook({ me: "SomeoneElse00001", teaching: [], joined: [] });
    const result = await applySave(store, caitlin(), "replace", { book: held, now: NOV_6 });
    expect(result.removed).toBe(2);
    expect(await store.get("code_files", "old/make/main.py")).toBeUndefined();
    expect(await store.get("job_progress", "old")).toBeUndefined();
    expect(held.now().me).toBe("Caitlin0student1");
  });
});

describe("save: what's in it", () => {
  it("in a line, then in a little more detail", () => {
    const s = summarise(caitlin());
    expect(describeSave(s, { now: NOV_6 })).toBe("Caitlin, 12 projects shipped, 1 class, saved 6 Nov");
    expect(describeSave(s, { now: NOV_6 + 365 * DAY })).toBe("Caitlin, 12 projects shipped, 1 class, saved 6 Nov 2026");
    expect(describeSave(s, { saved: false })).toBe("Caitlin, 12 projects shipped, 1 class");
    expect(describeDetail(s)).toBe("2 steps done, code for 3 steps and 1 review card.");
    expect(s.playAs).toBe("caitlin");
    expect(s.empty).toBe(false);
  });

  it("an untouched browser is empty", () => {
    const s = summarise({ savedAt: NOV_6, tables: emptyTables(), classes: EMPTY_BOOK });
    expect(s.empty).toBe(true);
    expect(describeSave(s, { saved: false })).toBe("No name yet, no projects shipped yet, no classes");
  });
});

describe("save: merging", () => {
  /** The same student, a few days on, on another computer. */
  function laptop(): SaveData {
    const s = caitlin();
    const t = s.tables;
    // Further on the maze, and started there first.
    t.job_progress = t.job_progress.map((j) => (j.jobId === "maze" ? { ...j, status: "shipped", shippedAt: NOV_6, startedAt: NOV_6 - 3 * DAY, timeSpent: 900, updatedAt: NOV_6 } : j));
    // Behind on one step, but touched more recently: the furthest still wins.
    t.step_progress = t.step_progress.map((r) => (r.key === "shop-sign/make" ? { ...r, status: "in-progress", attempts: 9, updatedAt: NOV_6 } : r));
    // Passed the step that was only seen here.
    t.step_progress = t.step_progress.map((r) => (r.key === "shop-sign/predict" ? { ...r, status: "passed", seenSolution: false, updatedAt: NOV_6 - 20 * DAY } : r));
    // Newer code for the maze, older code for the sign.
    t.code_files = t.code_files.map((c) => (c.key === "maze/make/maze.py" ? { ...c, content: "grid = [[0]]\n# finished\n", updatedAt: NOV_6 } : c.key === "shop-sign/make/main.py" ? { ...c, content: "print('old')\n", updatedAt: 5 } : c));
    t.code_snapshots.push({ key: snapshotKey("maze", "make", "maze.py", NOV_6), jobId: "maze", stepId: "make", filename: "maze.py", content: "grid = [[0]]\n", reason: "check", createdAt: NOV_6, updatedAt: NOV_6 });
    t.drill_bests = [{ key: "slicing", bestMs: 52_000, achievedAt: NOV_6, updatedAt: NOV_6 }, { key: "loops", bestMs: 30_000, achievedAt: NOV_6, updatedAt: NOV_6 }];
    t.job_progress.push({ key: "quiz-night", jobId: "quiz-night", status: "in-progress", startedAt: NOV_6, shippedAt: null, stretchDone: ["extra-round"], timeSpent: 5, updatedAt: NOV_6 });
    // A stretch task on a project shipped plainly here.
    t.job_progress = t.job_progress.map((j) => (j.jobId === "shop-sign" ? { ...j, stretchDone: ["shout"] } : j));
    t.profile = [{ ...t.profile[0]!, displayName: "Cait", onboarded: false, updatedAt: NOV_6 }];
    return { ...s, savedAt: NOV_6 + DAY };
  }

  it("keeps the furthest progress per step and job, and the newest code", () => {
    const m = mergeSaves(caitlin(), laptop());
    const step = (k: string) => m.tables.step_progress.find((r) => r.key === k)!;
    const job = (k: string) => m.tables.job_progress.find((r) => r.key === k)!;
    const file = (k: string) => m.tables.code_files.find((r) => r.key === k)!;
    expect(step("shop-sign/make").status).toBe("passed");
    expect(step("shop-sign/predict").status).toBe("passed");
    expect(job("maze")).toMatchObject({ status: "shipped", shippedAt: NOV_6, startedAt: NOV_6 - 3 * DAY, timeSpent: 900 });
    expect(job("shop-sign")).toMatchObject({ status: "shipped-stretch", stretchDone: ["shout"] });
    expect(job("quiz-night").status).toBe("in-progress");
    expect(file("maze/make/maze.py").content).toContain("# finished");
    expect(file("shop-sign/make/main.py").content).toContain("CAITLIN");
    expect(m.tables.code_snapshots).toHaveLength(2);
    expect(m.tables.drill_bests.find((d) => d.key === "slicing")!.bestMs).toBe(41_000);
    expect(m.tables.drill_bests).toHaveLength(2);
    // The newer profile, but nobody is sent back to "Who's playing?".
    expect(m.tables.profile).toHaveLength(1);
    expect(m.tables.profile[0]).toMatchObject({ displayName: "Cait", onboarded: true });
    expect(summarise(m).shipped).toBe(13);
  });

  it("merging into the store writes only what changed, as new writes", async () => {
    const store = new LocalStore(`save-d-${Math.random()}`);
    const here = caitlin();
    for (const t of TABLES) await store.putMany(t, here.tables[t] as never[]);
    await store.put("code_files", { ...here.tables.code_files[1]!, baseUpdatedAt: 777 });
    const held = memoryBook(book());
    const later = NOV_6 + 2 * DAY;
    const result = await applySave(store, laptop(), "merge", { book: held, now: later });
    // A step, three jobs, the maze's code, a snapshot, a drill and the profile.
    expect(result.written).toBe(8);
    expect(result.removed).toBe(0);
    const maze = await store.get("code_files", "maze/make/maze.py");
    expect(maze).toMatchObject({ content: "grid = [[0]]\n# finished\n", updatedAt: later, baseUpdatedAt: 777 });
    // Untouched rows keep their own time.
    expect((await store.get("code_files", "shop-sign/make/main.py"))!.updatedAt).toBe(NOV_6 - 12 * DAY);
    expect((await store.get("step_progress", "shop-sign/make"))!.status).toBe("passed");
  });

  it("puts two class books together", () => {
    const taught = { ...cls, role: "teacher" as const, createdAt: NOV_6 - 9 * DAY, register: [report()] };
    const a: ClassBook = { me: "Here000000000001", teaching: [taught], joined: [] };
    const sam = report({ student: { id: "Sam00000student2", name: "Sam", character: null, playAs: null }, sentAt: NOV_6 });
    const newerRuth = report({ sentAt: NOV_6, shipped: 4 });
    const b: ClassBook = {
      me: "There00000000001",
      teaching: [{ ...taught, name: "Thursday Python, renamed", updatedAt: NOV_6, role: "co-teacher", createdAt: NOV_6 - 2 * DAY, register: [sam, newerRuth] }],
      joined: [{ ...cls, id: "Other00000class1", joinedAt: NOV_6, build: {} }],
    };
    const m = mergeBooks(a, b);
    expect(m.teaching).toHaveLength(1);
    expect(m.teaching[0]).toMatchObject({ name: "Thursday Python, renamed", role: "teacher", createdAt: NOV_6 - 9 * DAY });
    expect(m.teaching[0]!.register.map((r) => [r.student.name, r.shipped]).sort()).toEqual([
      ["Ruth", 4],
      ["Sam", 3],
    ]);
    expect(m.joined.map((j) => j.id)).toEqual(["Other00000class1"]);
    // Only the save had been in a class, so the teacher knows this student by the save's id.
    expect(m.me).toBe("There00000000001");
  });
});

describe("save: bad saves are refused", () => {
  const problem = (text: string) => {
    const r = decodeSaveText(text);
    return r.ok ? "ok" : r.problem;
  };

  it("says why, for each way a save can be wrong", () => {
    expect(problem("   ")).toBe("empty");
    expect(problem("hello there")).toBe("not-a-save");
    expect(problem("ppc-save.1.!!!")).toBe("not-a-save");
    expect(problem("ppc-save.1.AAAA")).toBe("broken");
    expect(problem(code({ hello: 1 }))).toBe("not-a-save");
    expect(problem(code(wire({}), 2))).toBe("newer");
    expect(problem(JSON.stringify(wire({}, { v: 2 })))).toBe("newer");
    expect(problem(JSON.stringify(wire({}, { v: "1" })))).toBe("broken");
    expect(problem(JSON.stringify(wire({}, { savedAt: "yesterday" })))).toBe("broken");
    expect(problem(JSON.stringify(wire({}, { tables: [] })))).toBe("broken");
    expect(problem('{"kind": "ppc-save", "v": 1,')).toBe("broken");
    expect(problem(JSON.stringify(exportData(caitlin())))).toBe("data-export");
    expect(problem(`https://example.com/class/join/#${encodeJoin(cls)}`)).toBe("class-link");
    expect(problem(encodeJoin(cls))).toBe("class-link");
    for (const p of ["empty", "broken", "newer", "too-big", "not-a-save", "data-export", "class-link"] as const) expect(problemText(p)).toMatch(/\.$/);
  });

  it("a code cut short when it was copied doesn't read", () => {
    const text = encodeSaveCode(caitlin());
    expect(problem(text.slice(0, Math.floor(text.length / 2)))).toBe("broken");
  });

  it("a small code that unpacks into something enormous is stopped", () => {
    const bomb = `ppc-save.1.${toBase64Url(deflateSync(new Uint8Array(SAVE_LIMITS.jsonBytes + 1_000_000), { level: 9 }))}`;
    expect(bomb.length).toBeLessThan(200_000);
    expect(problem(bomb)).toBe("too-big");
  });

  it("text far too long to be a save isn't read at all", () => {
    expect(problem(`ppc-save.1.${"A".repeat(SAVE_LIMITS.codeChars + 4)}`)).toBe("too-big");
    expect(problem(`{"kind":"ppc-save","pad":"${"x".repeat(SAVE_LIMITS.fileBytes)}"}`)).toBe("too-big");
  });

  it("rows that don't check out are left out, and counted", () => {
    const good = caitlin().tables;
    const r = ok(
      readSave(
        wire({
          job_progress: [good.job_progress[0], { jobId: "../../etc", status: "shipped" }, { jobId: "x", status: "hacked" }, "a string", null],
          code_files: [good.code_files[0], { jobId: "a", stepId: "b", filename: "../escape.py", content: "x" }, { jobId: "a", stepId: "b", filename: "/abs.py", content: "x" }, { jobId: "a", stepId: "b", filename: "main.py", content: 42 }, { jobId: "a", stepId: "b", filename: "big.py", content: "x".repeat(SAVE_LIMITS.codeText + 1) }],
          step_progress: [{ ...good.step_progress[0], data: "not an object" }, { ...good.step_progress[1], status: "passed" }],
          review_cards: [{ cardId: "f-strings", due: "tomorrow", state: 1 }],
          story_flags: [{ key: "x".repeat(300), setAt: 1 }],
          profile: "not a list",
        }),
      ),
    );
    expect(r.save.tables.job_progress.map((j) => j.jobId)).toEqual(["shop-sign"]);
    expect(r.save.tables.code_files.map((c) => c.filename)).toEqual(["main.py"]);
    expect(r.save.tables.step_progress.map((s) => s.key)).toEqual(["shop-sign/predict"]);
    expect(r.save.tables.review_cards).toEqual([]);
    expect(r.save.tables.story_flags).toEqual([]);
    expect(r.save.tables.profile).toEqual([]);
    expect(r.skipped).toBe(4 + 4 + 1 + 1 + 1 + 1);
  });

  it("keys are made again from what they stand for, and fields are cleaned", () => {
    const r = ok(
      readSave(
        wire({
          step_progress: [{ key: "something/else", jobId: "shop-sign", stepId: "make", status: "passed", attempts: -4, hintsUsed: 1e12, timeSpent: Infinity, selfExplanation: "fine‮\u0000 text", data: {} }],
          code_files: [{ key: "elsewhere", jobId: "shop-sign", stepId: "make", filename: "main.py", content: "print(1)", cursor: 99, baseUpdatedAt: 5, conflictNote: true, updatedAt: -1 }],
          profile: [{ key: "someone", displayName: "  Cait​lin \n", character: { kind: "human", hair: "not-a-hair", colour: "red; background: url(x)" }, settings: { playAs: "dennis", editorFontSize: 400, theme: "neon", leagueHandle: "cait", evil: { nested: 1 } }, onboarded: "true" }],
        }),
      ),
    );
    const s = r.save.tables.step_progress[0]!;
    expect(s).toMatchObject({ key: "shop-sign/make", attempts: 0, hintsUsed: 1000, timeSpent: 0, selfExplanation: "fine text" });
    expect(r.save.tables.code_files[0]).toMatchObject({ key: "shop-sign/make/main.py", cursor: 8, baseUpdatedAt: null, conflictNote: false, updatedAt: 0 });
    const p = r.save.tables.profile[0]!;
    expect(p).toMatchObject({ key: "me", displayName: "Caitlin", onboarded: false });
    expect(p.character).toMatchObject({ kind: "human", hair: defaultAvatar().hair, colour: defaultAvatar().colour });
    expect(p.settings).toMatchObject({ playAs: null, editorFontSize: 22, theme: DEFAULT_SETTINGS.theme, leagueHandle: "cait" });
    expect("evil" in p.settings).toBe(false);
  });

  it("nothing in a save can reach the objects it's read into", () => {
    const text = `{"kind":"ppc-save","v":1,"savedAt":1,"tables":{"step_progress":[{"jobId":"a","stepId":"b","status":"passed","data":{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"fine":1}}],"events":[{"key":"e1","type":"run","createdAt":1,"payload":{"__proto__":{"polluted":true}}}]},"classes":{"__proto__":{"polluted":true}}}`;
    const r = ok(decodeSaveText(text));
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    const data = r.save.tables.step_progress[0]!.data;
    expect(Object.keys(data)).toEqual(["fine"]);
    expect(Object.getPrototypeOf(data)).toBe(Object.prototype);
    expect(r.save.classes).toEqual(EMPTY_BOOK);
  });

  it("history longer than any real one keeps its newest rows", () => {
    const cap = SAVE_LIMITS.rows.events;
    const events = Array.from({ length: cap + 5 }, (_, i) => ({ key: `e-${i}`, type: "run", createdAt: i + 1 }));
    const r = ok(readSave(wire({ events })));
    expect(r.save.tables.events).toHaveLength(cap);
    expect(r.save.tables.events.some((e) => e.key === "e-0")).toBe(false);
    expect(r.save.tables.events.some((e) => e.key === `e-${cap + 4}`)).toBe(true);
    expect(r.skipped).toBe(5);
  });

  it("a table longer than any real one is cut, and a key given twice is kept once", () => {
    const flags = Array.from({ length: SAVE_LIMITS.rows.story_flags + 10 }, (_, i) => ({ key: `flag-${i}`, setAt: i + 1 }));
    const r = ok(readSave(wire({ story_flags: flags, drill_bests: [{ key: "d", bestMs: 9, achievedAt: 1, updatedAt: 1 }, { key: "d", bestMs: 5, achievedAt: 2, updatedAt: 2 }] })));
    expect(r.save.tables.story_flags).toHaveLength(SAVE_LIMITS.rows.story_flags);
    expect(r.save.tables.drill_bests).toEqual([{ key: "d", bestMs: 5, achievedAt: 2, updatedAt: 2 }]);
    expect(r.skipped).toBe(11);
  });

  it("step state that's too big or too deep is left out", () => {
    let deep: unknown = 1;
    for (let i = 0; i < 40; i++) deep = { deeper: deep };
    const r = ok(
      readSave(
        wire({
          step_progress: [
            { jobId: "a", stepId: "deep", status: "passed", data: deep },
            { jobId: "a", stepId: "big", status: "passed", data: { text: "x".repeat(SAVE_LIMITS.stepData + 1) } },
            { jobId: "a", stepId: "fine", status: "passed", data: { list: [1, "two", null, true, { three: 3 }] } },
          ],
        }),
      ),
    );
    expect(r.save.tables.step_progress.map((s) => s.stepId)).toEqual(["fine"]);
    expect(r.skipped).toBe(2);
  });
});

describe("save: the reminder after a Ship", () => {
  const mark = (at: number, shipped: number) => ({ at, shipped });
  it("comes on the first Ship, then waits for three more or a few days", () => {
    expect(reminderDue({ saved: null, reminded: null, shipped: 0, now: NOV_6 })).toBe(false);
    expect(reminderDue({ saved: null, reminded: null, shipped: 1, now: NOV_6 })).toBe(true);
    // Shown once: quiet until three more Ships...
    expect(reminderDue({ saved: null, reminded: mark(NOV_6, 1), shipped: 3, now: NOV_6 + DAY })).toBe(false);
    expect(reminderDue({ saved: null, reminded: mark(NOV_6, 1), shipped: 4, now: NOV_6 + DAY })).toBe(true);
    // ...or a Ship more than three days on.
    expect(reminderDue({ saved: null, reminded: mark(NOV_6, 1), shipped: 2, now: NOV_6 + 4 * DAY })).toBe(true);
  });

  it("counts from the last save, and says nothing if nothing has shipped since", () => {
    expect(reminderDue({ saved: mark(NOV_6, 5), reminded: mark(NOV_6 - 9 * DAY, 2), shipped: 6, now: NOV_6 + DAY })).toBe(false);
    expect(reminderDue({ saved: mark(NOV_6, 5), reminded: null, shipped: 5, now: NOV_6 + 30 * DAY })).toBe(false);
    expect(reminderDue({ saved: mark(NOV_6, 5), reminded: null, shipped: 8, now: NOV_6 + DAY })).toBe(true);
    expect(reminderDue({ saved: mark(NOV_6, 5), reminded: null, shipped: 6, now: NOV_6 + 3 * DAY + 1 })).toBe(true);
  });
});

describe("save: the data download without a server", () => {
  it("has the server's layout, the classes, and the code as files", () => {
    const data = exportData(caitlin());
    expect(Object.keys(data)).toEqual(["account", "exportedAt", "profile", ...TABLES.filter((t) => t !== "profile"), "classes"]);
    expect(data.account).toBeNull();
    expect(data.profile).toMatchObject({ display_name: "Caitlin", onboarded: true });
    // The server's fields only: nothing that's about one browser's sync.
    expect(Object.keys((data.code_files as Record<string, unknown>[])[0]!)).toEqual(["jobId", "stepId", "filename", "content", "cursor", "updatedAt", "key"]);
    expect((data.story_flags as Record<string, unknown>[])[0]).toEqual({ key: "act-1-note", setAt: NOV_6 - 10 * DAY, updatedAt: NOV_6 - 10 * DAY });
    const { name, files } = exportFiles(caitlin());
    expect(name).toBe("ppc-export.zip");
    expect(Object.keys(files).sort()).toEqual(["code/maze/make/maze.py", "code/personal-finance/make/finance/cli.py", "code/shop-sign/make/main.py", "ppc-data.json"]);
  });

  it("with an account, adds the classes to the server's answer", () => {
    const { files } = exportFiles(caitlin(), { account: { id: "u1", email: "c@example.com" }, exportedAt: "x", submissions: [] });
    const data = JSON.parse(files["ppc-data.json"]!) as Record<string, unknown>;
    expect(data.account).toEqual({ id: "u1", email: "c@example.com" });
    expect((data.classes as { joined: unknown[] }).joined).toHaveLength(1);
  });
});
