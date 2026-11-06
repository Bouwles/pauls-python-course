import { describe, expect, it } from "vitest";
import { deflateSync, strToU8 } from "fflate";
import {
  CODE_CAP,
  LIMITS,
  REPORT_TARGET,
  decodeJoin,
  decodeReport,
  decodeTeach,
  encodeJoin,
  encodeReport,
  encodeTeach,
  fitReport,
  fitTeach,
  fromBase64Url,
  kindOf,
  linkUrl,
  pack,
  toBase64Url,
  unpack,
} from "@/lib/classes/link";
import { EMPTY_BOOK, mergeRegister, putCoTeach, putJoined, putReport, putTaught, readBook, writeBook } from "@/lib/classes/store";
import type { ClassInfo, Report, TaughtClass } from "@/lib/classes/types";
import { defaultAvatar } from "@/lib/avatar";

const cls: ClassInfo = {
  id: "Ab3dEf6hIj9kLm0n",
  name: "Thursday Python",
  teacher: "Paul",
  assignments: [
    { jobId: "shop-sign", due: "2026-11-20", note: "Try it before Thursday." },
    { jobId: "bill-splitter", due: null, note: "" },
  ],
  updatedAt: 1_762_400_000_000,
};

const report = (over: Partial<Report> = {}): Report => ({
  classId: cls.id,
  className: cls.name,
  teacher: "Paul",
  student: { id: "Ruth0000student1", name: "Ruth", character: { ...defaultAvatar(), hair: "afro", glasses: true }, playAs: "neil" },
  sentAt: 1_762_500_000_000,
  shipped: 3,
  projects: [
    { jobId: "shop-sign", status: "shipped", passed: 9, seen: 1, total: 10, hints: 2, seconds: 1260, lastWorked: 1_762_450_000_000, code: [{ name: "main.py", content: 'print("Open 9 till 5")\n' }], codeLeftOut: false },
    { jobId: "bill-splitter", status: "in-progress", passed: 4, seen: 0, total: 24, hints: 0, seconds: 300, lastWorked: null, code: [], codeLeftOut: false },
  ],
  ...over,
});

/** A payload packed by hand, as an attacker or an old version might. */
const raw = (value: unknown) => pack(value);

describe("class links: round trips", () => {
  it("base64url turns bytes back into the same bytes, for every length", () => {
    for (let n = 0; n < 40; n++) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 37 + n) & 255);
      const text = toBase64Url(bytes);
      expect(text).toMatch(/^[A-Za-z0-9_-]*$/);
      expect([...fromBase64Url(text)!]).toEqual([...bytes]);
    }
  });

  it("a join link carries the class, its teacher and its projects", () => {
    const hash = encodeJoin(cls);
    expect(hash).toMatch(/^2\.[A-Za-z0-9_-]+$/);
    expect(decodeJoin(hash)).toEqual({ ok: true, value: cls });
    // With the "#", as location.hash gives it.
    expect(decodeJoin(`#${hash}`)).toEqual({ ok: true, value: cls });
  });

  it("a progress link carries the student, their look and each set project", () => {
    const r = report();
    expect(decodeReport(encodeReport(r))).toEqual({ ok: true, value: r });
  });

  it("a co-teacher link carries the class and its register", () => {
    const register = [report(), report({ student: { id: "Sam00000student2", name: "Sam", character: null, playAs: null } })];
    expect(decodeTeach(encodeTeach(cls, register))).toEqual({ ok: true, value: { cls, register } });
  });

  it("survives being wrapped in an email or followed by a full stop", () => {
    const hash = encodeJoin(cls);
    const wrapped = `${hash.slice(0, 20)}\n${hash.slice(20)}.`;
    expect(decodeJoin(wrapped)).toEqual({ ok: true, value: cls });
  });

  it("builds the absolute link under the site's base path", () => {
    expect(linkUrl("https://example.github.io", "/pauls-python-course", "join", "1.abc")).toBe("https://example.github.io/pauls-python-course/class/join/#1.abc");
    expect(linkUrl("http://localhost:3000", "", "report", "1.abc")).toBe("http://localhost:3000/class/report/#1.abc");
    expect(linkUrl("https://example.github.io", "/pauls-python-course", "table", "2.abc")).toBe("https://example.github.io/pauls-python-course/league/#2.abc");
  });
});

describe("class links: keeping them short", () => {
  // Random-looking code barely compresses, so it pushes a link over.
  let seed = 7;
  const noise = (n: number) =>
    Array.from({ length: n }, () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return "abcdefghijklmnopqrstuvwxyz0123456789 \n"[seed % 38];
    }).join("");

  it("cuts long code, and leaves code out, biggest first, when the link is still too long", () => {
    const r = report({
      projects: [
        { ...report().projects[0]!, code: [{ name: "main.py", content: noise(12_000) }] },
        { ...report().projects[1]!, code: [{ name: "main.py", content: noise(2_500) }] },
        { ...report().projects[1]!, jobId: "unit-converter", code: [{ name: "main.py", content: noise(4_000) }] },
      ],
    });
    const fitted = fitReport(r);
    expect(fitted.hash.length).toBeLessThanOrEqual(REPORT_TARGET);
    expect(fitted.leftOut[0]).toBe("shop-sign");
    const back = decodeReport(fitted.hash);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    const [first, second, third] = back.value.projects;
    expect(fitted.leftOut).not.toContain("bill-splitter");
    expect(third!.codeLeftOut || third!.code.length === 1).toBe(true);
    expect(first!.codeLeftOut).toBe(true);
    expect(first!.code).toEqual([]);
    // Everything else is still there.
    expect(first!.passed).toBe(9);
    expect(second!.code[0]!.content.length).toBeLessThanOrEqual(CODE_CAP + 80);
  });

  it("keeps short code whole, and cuts a long file with a line saying so", () => {
    const fitted = fitReport(report());
    expect(fitted.leftOut).toEqual([]);
    expect(fitted.report.projects[0]!.code[0]!.content).toBe('print("Open 9 till 5")\n');
    const long = 'print("hello")\n'.repeat(1000);
    const cut = fitReport(report({ projects: [{ ...report().projects[0]!, code: [{ name: "main.py", content: long }] }] }));
    expect(cut.leftOut).toEqual([]);
    const content = cut.report.projects[0]!.code[0]!.content;
    expect(content.startsWith(long.slice(0, CODE_CAP))).toBe(true);
    expect(content).toMatch(/Cut short here/);
  });

  it("leaves students' code out of a co-teacher link that's too long", () => {
    const big = (id: string) => report({ student: { id, name: id, character: null, playAs: null }, projects: [{ ...report().projects[0]!, code: [{ name: "main.py", content: noise(1_500) }] }] });
    const register = Array.from({ length: 12 }, (_, i) => big(`student${String(i).padStart(4, "0")}`));
    const fitted = fitTeach(cls, register, 6_000);
    expect(fitted.leftOut).toBeGreaterThan(0);
    expect(fitted.hash.length).toBeLessThanOrEqual(6_000);
    expect(decodeTeach(fitted.hash).ok).toBe(true);
  });
});

describe("class links: what they refuse", () => {
  it("says a missing, cut or garbled link is broken", () => {
    const hash = encodeJoin(cls);
    expect(decodeJoin("")).toEqual({ ok: false, problem: "empty" });
    expect(decodeJoin("#")).toEqual({ ok: false, problem: "empty" });
    expect(decodeJoin(hash.slice(0, Math.floor(hash.length / 2)))).toMatchObject({ ok: false, problem: "broken" });
    expect(decodeJoin("1.not*base64")).toMatchObject({ ok: false, problem: "broken" });
    expect(decodeJoin("hello")).toMatchObject({ ok: false, problem: "broken" });
    // Valid base64url, but not deflate.
    expect(decodeJoin(`1.${toBase64Url(strToU8("plain text"))}`)).toMatchObject({ ok: false, problem: "broken" });
    // Deflate, but not JSON.
    expect(decodeJoin(`1.${toBase64Url(deflateSync(strToU8("{nope")))}`)).toMatchObject({ ok: false, problem: "broken" });
  });

  it("tells an old link from one made by a newer version", () => {
    const body = encodeJoin(cls).slice(2);
    expect(decodeJoin(`0.${body}`)).toEqual({ ok: false, problem: "old" });
    expect(decodeJoin(`3.${body}`)).toEqual({ ok: false, problem: "newer" });
  });

  it("still reads version 1 links, made before the League", () => {
    // Version 1 had the same packing, and progress links without an entry.
    const body = (hash: string) => hash.slice(2);
    expect(decodeJoin(`1.${body(encodeJoin(cls))}`)).toEqual({ ok: true, value: cls });
    const old = decodeReport(`1.${body(encodeReport(report()))}`);
    expect(old).toEqual({ ok: true, value: report() });
    expect(old.ok && old.value.league).toBeUndefined();
    const register = [report()];
    expect(decodeTeach(`1.${body(encodeTeach(cls, register))}`)).toEqual({ ok: true, value: { cls, register } });
  });

  it("knows a link opened on the wrong page", () => {
    const hash = encodeReport(report());
    expect(decodeJoin(hash)).toEqual({ ok: false, problem: "wrong-kind", kind: "report" });
    expect(kindOf(hash)).toBe("report");
    expect(decodeReport(encodeJoin(cls))).toEqual({ ok: false, problem: "wrong-kind", kind: "join" });
    expect(decodeJoin(raw({ k: "something-else", c: {} }))).toMatchObject({ ok: false, problem: "broken" });
  });

  it("refuses a link far too long to be real, and one that unpacks into too much", () => {
    expect(decodeJoin(`1.${"A".repeat(LIMITS.hash + 1)}`)).toEqual({ ok: false, problem: "too-long" });
    // A few kilobytes that inflate past the cap (a deflate bomb).
    const bomb = `1.${toBase64Url(deflateSync(strToU8(`{"k":"join","c":"${"a".repeat(LIMITS.json + 10)}"}`), { level: 9 }))}`;
    expect(bomb.length).toBeLessThan(10_000);
    expect(decodeJoin(bomb)).toMatchObject({ ok: false, problem: "broken" });
  });

  it("checks every field of a class", () => {
    const good = { i: cls.id, n: "Class", t: "Paul", u: 1, a: [["shop-sign", null, ""]] };
    expect(decodeJoin(raw({ k: "join", c: good })).ok).toBe(true);
    const bad: unknown[] = [
      null,
      [],
      { ...good, i: "short" },
      { ...good, i: "has spaces in it!" },
      { ...good, n: "" },
      { ...good, n: 42 },
      { ...good, t: { name: "Paul" } },
      { ...good, a: "shop-sign" },
      { ...good, a: [["../../etc/passwd", null, ""]] },
      { ...good, a: [["Shop_Sign", null, ""]] },
      { ...good, a: [["shop-sign", "next tuesday", ""]] },
      { ...good, a: [["shop-sign", "2026-02-30", ""]] },
      { ...good, a: [["shop-sign", null, ["note"]]] },
      { ...good, a: [{ jobId: "shop-sign" }] },
    ];
    for (const c of bad) expect(decodeJoin(raw({ k: "join", c })), JSON.stringify(c)).toMatchObject({ ok: false, problem: "broken" });
  });

  it("cleans and caps text instead of trusting it", () => {
    const c = {
      i: cls.id,
      n: `<img src=x onerror=alert(1)>‮${"x".repeat(500)}`,
      t: "Pa\u0000ul​",
      u: -5,
      a: [...Array.from({ length: 80 }, (_, i) => [`project-${i}`, null, "y".repeat(1000)]), ["shop-sign", null, ""], ["shop-sign", null, "again"]],
    };
    const got = decodeJoin(raw({ k: "join", c }));
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    // Kept as text (the pages never render it as HTML), cut to size, hidden characters gone.
    expect(got.value.name.startsWith("<img src=x onerror=alert(1)>x")).toBe(true);
    expect([...got.value.name].length).toBeLessThanOrEqual(LIMITS.className);
    expect(got.value.teacher).toBe("Paul");
    expect(got.value.updatedAt).toBe(0);
    expect(got.value.assignments.length).toBe(LIMITS.assignments);
    expect(got.value.assignments[0]!.note.length).toBe(LIMITS.note);
  });

  it("checks every field of a progress report", () => {
    const wire = JSON.parse(JSON.stringify(unpack(encodeReport(report())))).value as { k: string; r: Record<string, unknown> };
    const r = wire.r;
    const project = (r.p as unknown[][])[0]!;
    const variants: [string, unknown][] = [
      ["class id", { ...r, c: "x" }],
      ["sent at", { ...r, at: "yesterday" }],
      ["shipped", { ...r, sh: -1 }],
      ["student", { ...r, s: ["Ruth0000student1", "Ruth"] }],
      ["student id", { ...r, s: ["<b>", "Ruth", 0, 0] }],
      ["projects", { ...r, p: {} }],
      ["status", { ...r, p: [[...project.slice(0, 1), "finished", ...project.slice(2)]] }],
      ["passed", { ...r, p: [[...project.slice(0, 2), "9", ...project.slice(3)]] }],
      ["hints", { ...r, p: [[...project.slice(0, 5), Number.NaN, ...project.slice(6)]] }],
      ["file name", { ...r, p: [[...project.slice(0, 9), [["../secret", "x"]]]] }],
      ["file content", { ...r, p: [[...project.slice(0, 9), [["main.py", 5]]]] }],
      ["short project", { ...r, p: [project.slice(0, 5)] }],
    ];
    for (const [what, body] of variants) expect(decodeReport(raw({ k: "report", r: body })), what).toMatchObject({ ok: false, problem: "broken" });
  });

  it("reads an unknown look or player as nobody in particular, and caps numbers", () => {
    const wire = JSON.parse(JSON.stringify(unpack(encodeReport(report())))).value as { k: string; r: Record<string, unknown> };
    const r = wire.r;
    const project = (r.p as unknown[][])[0]!;
    const body = { ...r, s: ["Ruth0000student1", "", ["#BADBAD", "javascript:", 1, 2, 3, 4, 1, 0, 5, 6, 7], "darth-vader"], p: [[project[0], project[1], 9999, 0, 10, 1e12, 1e15, 0, 0, []]] };
    const got = decodeReport(raw({ k: "report", r: body }));
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(got.value.student.name).toBe("A student");
    expect(got.value.student.playAs).toBeNull();
    expect(got.value.student.character).toMatchObject({ ...defaultAvatar(), glasses: true });
    const p = got.value.projects[0]!;
    expect(p.passed).toBe(10);
    expect(p.hints).toBe(LIMITS.count);
    expect(p.seconds).toBe(LIMITS.seconds);
    expect(p.lastWorked).toBeNull();
  });

  it("drops reports from other classes out of a co-teacher register", () => {
    const stray = report({ classId: "SomeOtherClass12" });
    const got = decodeTeach(encodeTeach(cls, [report(), stray]));
    expect(got.ok && got.value.register.length).toBe(1);
  });
});

describe("the browser's class book", () => {
  const taught: TaughtClass = { ...cls, role: "teacher", createdAt: 1, register: [] };

  it("keeps each student's latest report, and only for a class taught here", () => {
    let book = putTaught(EMPTY_BOOK, taught);
    const first = putReport(book, report());
    expect(first.result).toBe("added");
    book = first.book;
    expect(putReport(book, report()).result).toBe("same");
    expect(putReport(book, report({ sentAt: 1 })).result).toBe("older");
    const newer = putReport(book, report({ sentAt: report().sentAt + 1000, shipped: 4 }));
    expect(newer.result).toBe("replaced");
    expect(newer.book.teaching[0]!.register).toHaveLength(1);
    expect(newer.book.teaching[0]!.register[0]!.shipped).toBe(4);
    expect(putReport(EMPTY_BOOK, report()).result).toBe("no-class");
  });

  it("merges a co-teacher's copy: newer projects, every student's latest report", () => {
    const mine = putReport(putTaught(EMPTY_BOOK, taught), report()).book;
    const theirs = { ...cls, name: "Thursday Python (moved)", updatedAt: cls.updatedAt + 1 };
    const sam = report({ student: { id: "Sam00000student2", name: "Sam", character: null, playAs: null } });
    const merged = putCoTeach(mine, theirs, [sam, report({ sentAt: 5 })], 99);
    expect(merged.result).toBe("merged");
    const t = merged.book.teaching[0]!;
    expect(t.role).toBe("teacher");
    expect(t.name).toBe("Thursday Python (moved)");
    expect(t.register.map((r) => [r.student.name, r.sentAt])).toEqual([
      ["Ruth", report().sentAt],
      ["Sam", report().sentAt],
    ]);
    expect(putCoTeach(EMPTY_BOOK, cls, [sam], 99).book.teaching[0]!.role).toBe("co-teacher");
    expect(mergeRegister([report({ sentAt: 9 })], [report({ sentAt: 3 })])[0]!.sentAt).toBe(9);
  });

  it("joins once, and brings in changes when the link is opened again", () => {
    const joined = putJoined(EMPTY_BOOK, cls, { "shop-sign": "make" }, 10);
    expect(joined.result).toBe("joined");
    const again = putJoined(joined.book, { ...cls, assignments: [] }, {}, 20);
    expect(again.result).toBe("updated");
    expect(again.book.joined).toHaveLength(1);
    expect(again.book.joined[0]!.joinedAt).toBe(10);
    expect(again.book.joined[0]!.assignments).toEqual([]);
  });

  it("reads back what it writes, and shrugs off anything it can't read", () => {
    let book = putReport(putTaught(EMPTY_BOOK, taught), report()).book;
    book = putJoined(book, cls, { "shop-sign": "make", __proto__: "x" } as Record<string, string>, 10).book;
    book = { ...book, me: "MeMeMeMeMeMeMeMe" };
    expect(readBook(writeBook(book))).toEqual(book);
    expect(readBook(null)).toEqual(EMPTY_BOOK);
    expect(readBook("not json")).toEqual(EMPTY_BOOK);
    expect(readBook(JSON.stringify({ teaching: [{ c: { i: "bad" } }, "x", null], joined: 5, me: "<script>" }))).toEqual(EMPTY_BOOK);
  });
});
