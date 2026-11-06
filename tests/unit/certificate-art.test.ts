// The certificate drawn in the browser (components/certificates/art.ts): one layout, painted as an
// SVG on the page and onto a canvas for the picture. Everything stays on the A4 sheet, long names
// get smaller or a second line, and the words say what it is.
import { describe, expect, it } from "vitest";
import { SHEET, certificateShapes, certificateWords, fitName, paint, roughMeasure, wrap, type CertificateFacts, type Shape } from "@/components/certificates/art";
import { encodeCertificate } from "@/lib/share-links";
import { certificateHash, certificateJobs } from "@/components/certificates/CertificateButton";
import { getIndex } from "@/lib/content/server";
import type { JobProgressRow } from "@/lib/store/types";

const facts: CertificateFacts = { name: "Ruth Okafor", act: 4, actName: "Algorithms and data structures", projects: 14, day: "2026-11-06", playingAs: { id: "neil", name: "Neil" }, site: "bouwles.github.io/pauls-python-course" };
const texts = (shapes: Shape[]) => shapes.filter((s) => s.kind === "text").map((s) => (s.kind === "text" ? s.text : ""));

describe("the certificate's layout", () => {
  it("puts everything on the sheet", () => {
    for (const act of [1, 4, 8, 9]) {
      for (const s of certificateShapes({ ...facts, act })) {
        if (s.kind === "text") {
          const w = roughMeasure(s.text, s.face, s.weight, s.size);
          const left = s.anchor === "start" ? s.x : s.anchor === "end" ? s.x - w : s.x - w / 2;
          expect(left).toBeGreaterThanOrEqual(0);
          expect(left + w).toBeLessThanOrEqual(SHEET.width);
          expect(s.y).toBeLessThanOrEqual(SHEET.height);
        } else {
          const [w, h] = s.kind === "rect" ? [s.w, s.h] : [s.w * s.scale, s.h * s.scale];
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.x + w).toBeLessThanOrEqual(SHEET.width);
          expect(s.y + h).toBeLessThanOrEqual(SHEET.height);
        }
      }
    }
  });

  it("says who, what, when, where and who signed it", () => {
    const words = texts(certificateShapes(facts));
    expect(words).toEqual(expect.arrayContaining(["Certificate of completion", "This certifies that", "Ruth Okafor", "completed Act IV: Algorithms and data", "structures", "14 Python projects shipped.", "The Puzzle Room, floor 3 of the Clocktower", "Playing as Neil", "6 November 2026", "bouwles.github.io/pauls-python-course", "Paul Nercessian", "IV"]));
    expect(certificateWords(facts)).toBe("Paul's Python Course certificate of completion: Ruth Okafor completed Act IV, Algorithms and data structures, with 14 projects shipped. Completed 6 November 2026. Playing as Neil. Signed Paul Nercessian.");
  });

  it("stands the floor's residents on the seal: one for the Workshop, six heads on the roof", () => {
    const people = (act: number) => certificateShapes({ ...facts, act }).filter((s) => s.kind === "pixels" && s.w !== 16);
    expect(people(1)).toHaveLength(1);
    expect(people(8)).toHaveLength(2);
    expect(people(9)).toHaveLength(6);
  });

  it("gives a long name a smaller size, then a second line", () => {
    expect(fitName("Ruth", roughMeasure)).toEqual({ size: 144, lines: ["Ruth"] });
    expect(fitName("Maximilian Okafor-Featherstonehaugh", roughMeasure).size).toBeLessThan(144);
    const long = fitName("Maximiliana Konstantina Okafor-Featherstonehaugh de la Cruz", roughMeasure);
    expect(long.lines.length).toBe(2);
    for (const l of long.lines) expect(roughMeasure(l, "display", 400, long.size)).toBeLessThanOrEqual(1240);
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
      fillText: (t: string) => calls.push(`text ${t}`),
    } as unknown as CanvasRenderingContext2D;
    paint(ctx, certificateShapes(facts), { display: "Fredoka", text: "Atkinson" });
    expect(calls).toContain("text Ruth Okafor");
    expect(calls).toContain("font 400 144px Fredoka");
    expect(calls.filter((c) => c === "rect").length).toBeGreaterThan(100);
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
