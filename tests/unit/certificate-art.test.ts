// The certificate drawn in the browser (components/certificates/art.ts): one layout, painted as an
// SVG on the page and onto a canvas for the picture. Everything stays on the A4 sheet, long names
// get smaller or a second line, and the words say what it is.
import { describe, expect, it, vi } from "vitest";
import { SHEET, certificateShapes, certificateWords, fitName, paint, roughMeasure, wrap, type CertificateFacts, type Shape } from "@/components/certificates/art";
import { encodeCertificate } from "@/lib/share-links";
import { certificateHash, certificateJobs } from "@/components/certificates/CertificateButton";
import { getIndex } from "@/lib/content/server";
import type { JobProgressRow } from "@/lib/store/types";

const facts: CertificateFacts = { name: "Ruth Okafor", act: 4, actName: "Algorithms and data structures", projects: 14, day: "2026-11-06", playingAs: { id: "neil", name: "Neil" } };
const texts = (shapes: Shape[]) => shapes.filter((s) => s.kind === "text").map((s) => (s.kind === "text" ? s.text : ""));

describe("the certificate's layout", () => {
  it("puts everything on the sheet", () => {
    for (const act of [1, 4, 8, 9]) {
      for (const s of certificateShapes({ ...facts, act })) {
        if (s.kind === "text") {
          const w = roughMeasure(s.text, s.face, s.size);
          const left = s.anchor === "start" ? s.x : s.anchor === "end" ? s.x - w : s.x - w / 2;
          expect(left).toBeGreaterThanOrEqual(0);
          expect(left + w).toBeLessThanOrEqual(SHEET.width);
          expect(s.y).toBeLessThanOrEqual(SHEET.height);
        } else {
          if (s.kind !== "rect") continue;
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.x + s.w).toBeLessThanOrEqual(SHEET.width);
          expect(s.y + s.h).toBeLessThanOrEqual(SHEET.height);
        }
      }
    }
  });

  it("says who, what, when, where and who signed it", () => {
    const words = texts(certificateShapes(facts));
    expect(words).toEqual(expect.arrayContaining(["Paul's Python Course", "Certificate of Completion", "This certifies that", "Ruth Okafor", "has completed Act IV: Algorithms and data structures", "and shipped fourteen Python projects", "in the Puzzle Room, floor 3 of the Clocktower, playing as Neil", "6 November 2026", "Date", "Professor"]));
    // Signed by hand, in pen: an outline, not a typed name. And no address printed on it.
    expect(certificateShapes(facts).some((s) => s.kind === "path" && s.fill === "#17264f")).toBe(true);
    expect(words).not.toContain("Paul Nercessian");
    expect(words.join(" ")).not.toMatch(/localhost|github\.io/);
    expect(certificateWords(facts)).toBe("Paul's Python Course certificate of completion: Ruth Okafor completed Act IV, Algorithms and data structures, with 14 projects shipped. Completed 6 November 2026. Playing as Neil. Signed by Paul.");
  });

  it("runs the course's name round the seal, and keeps everything clear of it", () => {
    const shapes = certificateShapes({ ...facts, name: "Maximiliana Konstantina Okafor-Featherstonehaugh de la Cruz" });
    expect(shapes.filter((s) => s.kind === "text" && s.turn !== undefined).length).toBeGreaterThan(20);
    // Everything in the middle of the page stops above the seal, even with a two-line name.
    for (const s of shapes) if (s.kind === "text" && s.turn === undefined && !["Act", "IV", "Date", "Professor", "6 November 2026"].includes(s.text)) expect(s.y).toBeLessThan(1012);
  });

  it("gives a long name a smaller size, then a second line", () => {
    expect(fitName("Ruth", roughMeasure)).toEqual({ size: 152, lines: ["Ruth"] });
    expect(fitName("Maximilian Okafor-Featherstonehaugh", roughMeasure).size).toBeLessThan(152);
    const long = fitName("Maximiliana Konstantina Okafor-Featherstonehaugh de la Cruz Montgomery-Wellington the Third of Somewhere", roughMeasure);
    expect(long.lines.length).toBe(2);
    for (const l of long.lines) expect(roughMeasure(l, "script", long.size)).toBeLessThanOrEqual(1480);
  });

  it("wraps by words, and cuts a word too long for any line", () => {
    const width = (s: string) => s.length;
    expect(wrap("one two three four", 9, width)).toEqual(["one two", "three", "four"]);
    expect(wrap("abcdefghijkl", 5, width)).toEqual(["abcde", "fghij", "kl"]);
  });

  it("paints the same shapes onto a canvas", () => {
    const calls: string[] = [];
    const ctx = {
      set fillStyle(v: string) {
        calls.push(`fill ${v}`);
      },
      set font(v: string) {
        calls.push(`font ${v}`);
      },
      textAlign: "",
      textBaseline: "",
      fillRect: () => calls.push("rect"),
      fill: () => calls.push("path"),
      stroke: () => calls.push("stroke"),
      save: () => undefined,
      restore: () => undefined,
      translate: () => undefined,
      rotate: () => undefined,
      fillText: (t: string) => calls.push(`text ${t}`),
    } as unknown as CanvasRenderingContext2D;
    vi.stubGlobal("Path2D", class {});
    paint(ctx, certificateShapes(facts), { title: "Title", script: "Script", serif: "Serif", italic: "Serif" });
    vi.unstubAllGlobals();
    expect(calls).toContain("text Ruth Okafor");
    expect(calls).toContain("font 400 152px Script");
    expect(calls).toContain("font italic 400 42px Serif");
    expect(calls).toContain("path");
    expect(calls.filter((c) => c === "stroke").length).toBeGreaterThan(10);
  });
});

describe("getting the certificate", () => {
  const act = getIndex().acts.find((a) => a.number === 1)!;
  const main = certificateJobs(act);
  const shipped = (ids: string[], at = Date.UTC(2026, 10, 6, 12)): Record<string, JobProgressRow> =>
    Object.fromEntries(ids.map((id, i) => [id, { key: id, jobId: id, status: "shipped", startedAt: null, shippedAt: at - i * 86_400_000, stretchDone: [], timeSpent: 0, updatedAt: at }]));
  const who = { name: "Ruth Okafor", playAs: "neil", character: null };

  it("needs every main project in the Act shipped", () => {
    expect(main.length).toBeGreaterThan(3);
    expect(certificateHash(act, shipped(main.slice(1).map((j) => j.id)), who)).toBeNull();
  });

  it("is dated the day the last of them shipped, so it's the same link whenever it's made", () => {
    const hash = certificateHash(act, shipped(main.map((j) => j.id)), who);
    expect(hash).toBe(encodeCertificate({ maker: { name: "Ruth Okafor", playAs: "neil", look: null }, act: 1, projects: main.length, day: "2026-11-06" }));
  });
});
