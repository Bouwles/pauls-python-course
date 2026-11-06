import { describe, expect, it } from "vitest";
import { decodeReport, decodeTable, encodeReport, encodeTable, fitReport, kindOf, pack, unpack, LIMITS } from "@/lib/classes/link";
import { joinedRows, leagueForReport, registerRows, sharedRows, tableToShare } from "@/lib/classes/league";
import { EMPTY_BOOK, putJoined, putReport, putTable, putTaught, readBook, writeBook } from "@/lib/classes/store";
import type { ClassInfo, LeagueEntryReport, Report, SharedTable, TaughtClass } from "@/lib/classes/types";
import { baselinePolicy, league, policyText } from "@/lib/league/course";
import { bestPolicy } from "@/lib/league/cast";
import { rankRows } from "@/lib/league/table";

const cls: ClassInfo = { id: "Ab3dEf6hIj9kLm0n", name: "Thursday Python", teacher: "Paul", assignments: [{ jobId: "shop-sign", due: null, note: "" }], updatedAt: 1_762_400_000_000 };
// Thursday of week 45, 2026.
const now = Date.UTC(2026, 10, 5, 18, 30);
const WEEK = "2026-W45";

const entry = (policy = baselinePolicy(), week = WEEK): LeagueEntryReport => ({ week, ...league(policy, week), enteredAt: now - 3600_000, policy, checked: true });

const report = (id: string, name: string, over: Partial<Report> = {}): Report => ({
  classId: cls.id,
  className: cls.name,
  teacher: "Paul",
  student: { id, name, character: null, playAs: null },
  sentAt: now,
  shipped: 3,
  projects: [{ jobId: "shop-sign", status: "shipped", passed: 9, seen: 0, total: 10, hints: 0, seconds: 600, lastWorked: null, code: [{ name: "main.py", content: "print(1)\n" }], codeLeftOut: false }],
  ...over,
});

const ruth = (over: Partial<Report> = {}) => report("Ruth0000student1", "Ruth", { league: entry(), ...over });
const sam = (over: Partial<Report> = {}) => report("Sam00000student2", "Sam", { league: entry(bestPolicy()), ...over });

/** The report part of a progress link, unpacked, to tamper with. */
const wireOf = (r: Report) => (unpack(encodeReport(r)) as { ok: true; value: { k: string; r: Record<string, unknown> } }).value.r;

describe("a progress link with a League entry", () => {
  it("carries this week's score, finish and policy", () => {
    const r = ruth();
    const back = decodeReport(encodeReport(r));
    expect(back).toEqual({ ok: true, value: r });
    expect(back.ok && back.value.league?.policy).toEqual(baselinePolicy());
  });

  it("is made from the entry kept in this browser, for this week only", () => {
    const policy = baselinePolicy();
    expect(leagueForReport([{ week: WEEK, policy, enteredAt: 5 }], now)).toEqual({ week: WEEK, ...league(policy, WEEK), enteredAt: 5, policy, checked: true });
    expect(leagueForReport([{ week: "2026-W44", policy, enteredAt: 5 }], now)).toBeUndefined();
    expect(leagueForReport([], now)).toBeUndefined();
  });

  it("races the policy again where it's opened, so a changed score doesn't stick", () => {
    const wire = wireOf(ruth());
    const lg = wire.lg as unknown[];
    const back = decodeReport(pack({ k: "report", r: { ...wire, lg: [lg[0], 1.5, 50, 50, lg[4], lg[5]] } }));
    expect(back.ok && back.value.league).toMatchObject({ score: league(baselinePolicy(), WEEK).score, checked: true });
  });

  it("takes the score as sent, and says so, when the policy didn't come", () => {
    const wire = wireOf(ruth());
    const back = decodeReport(pack({ k: "report", r: { ...wire, lg: [WEEK, 16.4, 49, 50, now, 0] } }));
    expect(back.ok && back.value.league).toEqual({ week: WEEK, score: 16.4, finished: 49, races: 50, enteredAt: now, policy: null, checked: false });
  });

  it("checks every field of the entry", () => {
    const wire = wireOf(ruth());
    const p = policyText(baselinePolicy());
    const bad: unknown[] = [
      "16.4",
      [WEEK, 16.4, 49, 50, now],
      ["last week", 16.4, 49, 50, now, 0],
      ["2026-W60", 16.4, 49, 50, now, 0],
      [WEEK, -1, 49, 50, now, 0],
      [WEEK, 101, 49, 50, now, 0],
      [WEEK, Number.NaN, 49, 50, now, 0],
      [WEEK, 16.4, 51, 50, now, 0],
      [WEEK, 16.4, 0, 0, now, 0],
      [WEEK, 16.4, 49, 50, now, p.slice(1)],
      [WEEK, 16.4, 49, 50, now, `${p.slice(1)}x`],
    ];
    for (const lg of bad) expect(decodeReport(pack({ k: "report", r: { ...wire, lg } })), JSON.stringify(lg)).toMatchObject({ ok: false, problem: "broken" });
    // No entry at all is fine: that's a link from someone who didn't enter.
    for (const lg of [undefined, 0, null]) expect(decodeReport(pack({ k: "report", r: { ...wire, lg } })).ok).toBe(true);
  });

  it("keeps the policy unless the link is still too long with all the code left out", () => {
    expect(fitReport(ruth()).report.league?.policy).toEqual(baselinePolicy());
    // About 260 characters with the code left out, and about 30 fewer without the policy.
    const tight = fitReport(ruth(), 250);
    expect(tight.report.league).toMatchObject({ policy: null, checked: false, score: ruth().league!.score });
    const back = decodeReport(tight.hash);
    expect(back.ok && back.value.league?.score).toBe(ruth().league!.score);
  });
});

describe("the class's table", () => {
  const taught = (register: Report[]): TaughtClass => ({ ...cls, role: "teacher", createdAt: 1, register });

  it("is the register: each student whose latest link has an entry for the week", () => {
    const t = taught([ruth(), sam(), report("Kim00000student3", "Kim"), report("Lee00000student4", "Lee", { league: entry(baselinePolicy(), "2026-W44") })]);
    const rows = rankRows(registerRows(t, WEEK));
    expect(rows.map((r) => r.name)).toEqual(["Sam", "Ruth"]);
    expect(rows[0]!.place).toBe(1);
    expect(rankRows(registerRows(t, "2026-W44")).map((r) => r.name)).toEqual(["Lee"]);
  });

  it("goes in with the report: adding a newer progress link updates the student's entry", () => {
    let book = putTaught(EMPTY_BOOK, taught([]));
    book = putReport(book, ruth({ league: undefined })).book;
    expect(registerRows(book.teaching[0]!, WEEK)).toEqual([]);
    book = putReport(book, ruth({ sentAt: now + 1000 })).book;
    expect(registerRows(book.teaching[0]!, WEEK).map((r) => r.name)).toEqual(["Ruth"]);
    // And it survives being saved in the browser.
    expect(registerRows(readBook(writeBook(book)).teaching[0]!, WEEK).map((r) => r.score)).toEqual([ruth().league!.score]);
  });

  it("is shared as names and scores, in order, and comes back the same", () => {
    const t = taught([ruth(), sam()]);
    const shared = tableToShare(t, WEEK, now);
    expect(shared.rows.map((r) => [r.id, r.name])).toEqual([
      ["Sam00000student2", "Sam"],
      ["Ruth0000student1", "Ruth"],
    ]);
    const hash = encodeTable(shared);
    expect(hash).toMatch(/^2\./);
    expect(kindOf(hash)).toBe("table");
    expect(decodeTable(hash)).toEqual({ ok: true, value: shared });
    // Nothing else: no policies, code or looks.
    expect(JSON.stringify(unpack(hash))).not.toMatch(/main\.py|[udlr]{63}/);
  });

  it("shows a student where they stand", () => {
    const shared = tableToShare(taught([ruth(), sam()]), WEEK, now);
    const rows = rankRows(sharedRows(shared, "Ruth0000student1"));
    expect(rows.find((r) => r.mine)).toMatchObject({ name: "Ruth", place: 2 });
    expect(rankRows(sharedRows(shared, "")).some((r) => r.mine)).toBe(false);
  });

  it("swaps in a student's newest entry on their own copy of the class's table", () => {
    const shared = tableToShare(taught([ruth(), sam()]), WEEK, now);
    const joined = { ...putJoined(EMPTY_BOOK, cls, {}, 1).book.joined[0]!, table: shared };
    const mine = { key: "me", name: "Ruth", score: 15.1, finished: 50, races: 50, enteredAt: now, mine: true };
    const rows = rankRows(joinedRows(joined, WEEK, "Ruth0000student1", mine));
    expect(rows.map((r) => [r.name, r.place, r.mine])).toEqual([
      ["Ruth", 1, true],
      ["Sam", 2, false],
    ]);
    // Another week's table isn't this week's.
    expect(joinedRows(joined, "2026-W46", "Ruth0000student1", null)).toEqual([]);
  });

  it("refuses a table link that doesn't read, and cleans what it shows", () => {
    const good = { c: cls.id, cn: "Thursday Python", t: "Paul", w: WEEK, at: now, e: [["Ruth0000student1", "Ruth", 16.2, 50, 50]] };
    expect(decodeTable(pack({ k: "table", l: good })).ok).toBe(true);
    const bad: unknown[] = [
      { ...good, c: "short" },
      { ...good, w: "this week" },
      { ...good, cn: "" },
      { ...good, e: "Ruth" },
      { ...good, e: [["<b>", "Ruth", 16.2, 50, 50]] },
      { ...good, e: [["Ruth0000student1", "Ruth", "16.2", 50, 50]] },
      { ...good, e: [["Ruth0000student1", "Ruth", 16.2, 60, 50]] },
      { ...good, e: [["Ruth0000student1", "Ruth", 16.2, 50]] },
    ];
    for (const l of bad) expect(decodeTable(pack({ k: "table", l })), JSON.stringify(l)).toMatchObject({ ok: false, problem: "broken" });
    expect(decodeTable(encodeReport(ruth()))).toEqual({ ok: false, problem: "wrong-kind", kind: "report" });
    const odd = decodeTable(
      pack({
        k: "table",
        l: {
          ...good,
          e: [
            ["Ruth0000student1", "Ru\u0000th​", 16.2, 50, 50],
            ["Ruth0000student1", "Again", 15, 50, 50],
            ...Array.from({ length: 150 }, (_, i) => [`student${String(i).padStart(4, "0")}`, "x", 20, 50, 50]),
          ],
        },
      }),
    );
    expect(odd.ok).toBe(true);
    if (!odd.ok) return;
    expect(odd.value.rows[0]!.name).toBe("Ruth");
    expect(odd.value.rows.filter((r) => r.id === "Ruth0000student1")).toHaveLength(1);
    expect(odd.value.rows.length).toBeLessThanOrEqual(LIMITS.tableRows);
  });
});

describe("a shared table in the browser's class book", () => {
  const table = (sentAt: number, week = WEEK): SharedTable => ({ classId: cls.id, className: cls.name, teacher: "Paul", week, sentAt, rows: [{ id: "Ruth0000student1", name: "Ruth", score: 16.2, finished: 50, races: 50 }] });

  it("is kept with a class this browser has joined, newest first, and nowhere else", () => {
    expect(putTable(EMPTY_BOOK, table(5)).result).toBe("not-joined");
    let book = putJoined(EMPTY_BOOK, cls, {}, 1).book;
    const kept = putTable(book, table(5));
    expect(kept.result).toBe("kept");
    book = kept.book;
    expect(putTable(book, table(5)).result).toBe("same");
    expect(putTable(book, table(4)).result).toBe("older");
    expect(putTable(book, table(6, "2026-W46")).book.joined[0]!.table!.week).toBe("2026-W46");
  });

  it("stays when the class is updated from its join link, and is saved and read back", () => {
    let book = putTable(putJoined(EMPTY_BOOK, cls, {}, 1).book, table(5)).book;
    book = putJoined(book, { ...cls, name: "Thursday Python 2" }, {}, 9).book;
    expect(book.joined[0]!.table).toEqual(table(5));
    expect(readBook(writeBook(book))).toEqual(book);
    // A table for another class can't be slipped into this one's copy.
    const stored = JSON.parse(writeBook(book)) as { joined: { t: { c: string } }[] };
    stored.joined[0]!.t.c = "SomeOtherClass12";
    expect(readBook(JSON.stringify(stored)).joined[0]!.table).toBeUndefined();
  });
});
