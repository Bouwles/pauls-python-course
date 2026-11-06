// The Act certificate drawn in the browser, in the same design as the server-drawn one
// (CertificateImage.tsx): white paper, the sun band along the top, the pixel snake-P and the name
// in Fredoka, the Act on a sun-coloured pixel seal with the floor's residents standing on it, and
// the date, the course's address and who signed it along the bottom.
//
// It's laid out once, as a list of shapes on a 2000 x 1414 sheet (A4 landscape), and the same list
// is drawn two ways: as an SVG on the page (which prints as crisp vectors), and onto a canvas for
// "Save as a picture". Text is measured with the fonts the page has loaded, so a long name gets a
// smaller size or a second line, and both drawings agree.
import { BRAND } from "@/lib/brand";
import { castColour, floorFor } from "@/lib/cast";
import { CAST_LOOKS } from "@/lib/pixel/looks";
import { MARK_CELLS, MARK_GRID, MARK_HEX } from "@/lib/pixel/mark";
import { PERSON_CROPS, personRuns, type PixelRun } from "@/lib/pixel/svg";
import { DAY, OUTLINE, ROMAN, SUN, SUN_INK, longDate } from "./look";

export const SHEET = { width: 2000, height: 1414 };

export type Face = "display" | "text";
export type Weight = 400 | 700;

export interface TextShape {
  kind: "text";
  x: number;
  /** The baseline. */
  y: number;
  text: string;
  face: Face;
  weight: Weight;
  size: number;
  fill: string;
  anchor: "start" | "middle" | "end";
}

export interface RectShape {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

/** Pixel art: runs of one colour on a grid, `scale` sheet pixels to each of its pixels. */
export interface PixelShape {
  kind: "pixels";
  x: number;
  y: number;
  scale: number;
  w: number;
  h: number;
  runs: PixelRun[];
}

export type Shape = TextShape | RectShape | PixelShape;

/** How wide `text` is in that face, weight and size, in sheet pixels. */
export type Measure = (text: string, face: Face, weight: Weight, size: number) => number;

/** A rough measure for when no fonts are loaded (tests, and the moment before the fonts arrive). */
export const roughMeasure: Measure = (text, face, weight, size) => [...text].length * size * (face === "display" ? 0.56 : weight === 700 ? 0.55 : 0.5);

export interface CertificateFacts {
  name: string;
  act: number;
  /** The Act's subject: "Algorithms and data structures". */
  actName: string;
  projects: number;
  /** The day the Act was finished: "2026-11-06". */
  day: string;
  /** The classmate they play as, when it isn't just them ("Playing as Neil"). */
  playingAs: { id: string; name: string } | null;
  /** The course's address, without the scheme. */
  site: string;
}

const X = 128;
const RIGHT = SHEET.width - 128;
const MAX_LEFT = 1240;
/** Where a line of text sits in its line box: the baseline, this far down from its top. */
const ASCENT = 0.8;

/** Words that fit `max` wide, a line at a time; a single word too long for a line is cut by letters. */
export function wrap(text: string, max: number, width: (s: string) => number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const tried = current ? `${current} ${word}` : word;
    if (width(tried) <= max) {
      current = tried;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    while (width(current) > max && current.length > 1) {
      let n = current.length - 1;
      while (n > 1 && width(current.slice(0, n)) > max) n--;
      lines.push(current.slice(0, n));
      current = current.slice(n);
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** The name: the biggest size that fits on one line, else two lines at a smaller size. Multiples of 8, where the face is crisp. */
export function fitName(name: string, measure: Measure): { size: number; lines: string[] } {
  for (const size of [144, 120, 96, 80]) if (measure(name, "display", 400, size) <= MAX_LEFT) return { size, lines: [name] };
  for (const size of [80, 64, 56]) {
    const lines = wrap(name, MAX_LEFT, (s) => measure(s, "display", 400, size));
    if (lines.length <= 2) return { size, lines };
  }
  const lines = wrap(name, MAX_LEFT, (s) => measure(s, "display", 400, 56));
  return { size: 56, lines: lines.length > 3 ? [...lines.slice(0, 2), `${lines[2]!.replace(/.$/, "")}...`] : lines };
}

function markShape(x: number, y: number, scale: number): PixelShape {
  const runs: PixelRun[] = [];
  MARK_CELLS.forEach((row, ry) => {
    let rx = 0;
    while (rx < MARK_GRID) {
      const c = row[rx]!;
      let n = 1;
      while (rx + n < MARK_GRID && row[rx + n] === c) n++;
      if (c !== ".") runs.push({ x: rx, y: ry, n, fill: MARK_HEX[c] });
      rx += n;
    }
  });
  return { kind: "pixels", x, y, scale, w: MARK_GRID, h: MARK_GRID, runs };
}

/** The floor the Act is on, in words: "The Puzzle Room, floor 3 of the Clocktower". */
export function floorLine(act: number): string | null {
  const floor = floorFor(act);
  if (!floor) return null;
  return `${floor.room}, ${floor.act === 1 ? "the ground floor" : floor.act === 9 ? "the roof" : floor.label.toLowerCase()} of the Clocktower`;
}

/** Everything on the certificate, top to bottom, as shapes on the 2000 x 1414 sheet. */
export function certificateShapes(c: CertificateFacts, measure: Measure = roughMeasure): Shape[] {
  const shapes: Shape[] = [];
  const rect = (x: number, y: number, w: number, h: number, fill: string) => shapes.push({ kind: "rect", x, y, w, h, fill });
  const text = (x: number, y: number, words: string, face: Face, weight: Weight, size: number, fill: string, anchor: TextShape["anchor"] = "start") => shapes.push({ kind: "text", x, y, text: words, face, weight, size, fill, anchor });
  const roman = ROMAN[c.act] ?? String(c.act);

  rect(0, 0, SHEET.width, SHEET.height, DAY.bg);
  rect(0, 0, SHEET.width, 24, SUN);

  // The brand, and what this is.
  shapes.push(markShape(X, 128, 6));
  text(X + 96 + 24, 128 + 48 + 20, BRAND.name, "display", 400, 56, DAY.text);
  text(RIGHT, 128 + 48 + 11, "Certificate of completion", "text", 700, 30, DAY.text2, "end");

  // Along the bottom: when, where, and who signed it.
  const ruleY = 1176;
  rect(X, ruleY, RIGHT - X, 2, DAY.line);
  const labelY = ruleY + 40 + 26 * ASCENT;
  const valueY = ruleY + 40 + 26 * 1.2 + 10 + 40 * ASCENT;
  const day = longDate(c.day);
  const signer = BRAND.creditName;
  text(X, labelY, "Completed", "text", 700, 26, DAY.text2);
  text(X, valueY, day, "display", 400, 40, DAY.text);
  const firstWide = Math.max(measure("Completed", "text", 700, 26), measure(day, "display", 400, 40));
  const signedWide = Math.max(measure("Signed", "text", 700, 26), measure(signer, "display", 400, 40));
  text(RIGHT, labelY, "Signed", "text", 700, 26, DAY.text2, "end");
  text(RIGHT, valueY, signer, "display", 400, 40, DAY.text, "end");
  const middleX = X + firstWide + 88;
  const room = RIGHT - signedWide - 88 - middleX;
  const siteSize = [32, 28, 24, 20].find((s) => measure(c.site, "text", 700, s) <= room) ?? 20;
  text(middleX, labelY, "Course", "text", 700, 26, DAY.text2);
  text(middleX, valueY - 4, c.site, "text", 700, siteSize, DAY.text);

  // The middle: who, and what they finished, beside the seal.
  const top = 128 + 96 + 40;
  const centre = (top + ruleY - 40) / 2;
  const name = fitName(c.name, measure);
  const actWords = `completed Act ${roman}: ${c.actName}`;
  let actSize = 56;
  let actLines = wrap(actWords, MAX_LEFT, (s) => measure(s, "display", 400, actSize));
  if (actLines.length > 2) {
    actSize = 48;
    actLines = wrap(actWords, MAX_LEFT, (s) => measure(s, "display", 400, actSize)).slice(0, 3);
  }
  const floor = floorFor(c.act);
  const where = floorLine(c.act);
  const rows: { height: number; draw: (y: number) => void }[] = [
    { height: 36 * 1.3 + 20, draw: (y) => text(X, y + 36 * ASCENT, "This certifies that", "text", 400, 36, DAY.text2) },
    {
      height: name.lines.length * name.size * 1.05 + 40,
      draw: (y) => name.lines.forEach((l, i) => text(X, y + i * name.size * 1.05 + name.size * ASCENT, l, "display", 400, name.size, DAY.text)),
    },
    {
      height: actLines.length * actSize * 1.15 + 16,
      draw: (y) => actLines.forEach((l, i) => text(X, y + i * actSize * 1.15 + actSize * ASCENT, l, "display", 400, actSize, DAY.text)),
    },
    { height: 36 * 1.4, draw: (y) => text(X, y + 36 * ASCENT, `${c.projects} Python ${c.projects === 1 ? "project" : "projects"} shipped.`, "text", 400, 36, DAY.text2) },
  ];
  const swatchRow = (colour: string, words: string, gap: number) =>
    rows.push({
      height: gap + 30 * 1.3,
      draw: (y) => {
        rect(X, y + gap + 2, 32, 32, OUTLINE);
        rect(X + 4, y + gap + 6, 24, 24, colour);
        text(X + 32 + 16, y + gap + 30 * ASCENT + 4, words, "text", 400, 30, DAY.text2);
      },
    });
  if (floor && where) swatchRow(castColour(floor.residents[0] ?? "").face, where, 28);
  if (c.playingAs) swatchRow(castColour(c.playingAs.id).face, `Playing as ${c.playingAs.name}`, 12);
  const leftHeight = rows.reduce((n, r) => n + r.height, 0);
  let y = Math.max(top, centre - leftHeight / 2);
  for (const r of rows) {
    r.draw(y);
    y += r.height;
  }

  // The seal: the Act on sun, with the floor's residents standing on its bottom edge. Everyone on
  // the roof shows as a head, so all six fit.
  const residents = (floor?.residents ?? []).filter((who) => CAST_LOOKS[who]);
  const heads = residents.length > 2;
  const scale = heads ? 2 : residents.length > 1 ? 3 : 4;
  const crop = heads ? PERSON_CROPS.head : PERSON_CROPS.bust;
  const figureH = residents.length ? crop.h * scale : 0;
  const romanSize = roman.length > 3 ? 128 : 176;
  const sealW = 400;
  const sealH = 8 + 40 + 56 + 8 + romanSize + 24 + figureH + 8;
  const sealX = RIGHT - 16 - sealW;
  const sealY = Math.round(centre - sealH / 2);
  rect(sealX + 16, sealY + 16, sealW, sealH, OUTLINE);
  rect(sealX, sealY, sealW, sealH, OUTLINE);
  rect(sealX + 8, sealY + 8, sealW - 16, sealH - 16, SUN);
  const mid = sealX + sealW / 2;
  text(mid, sealY + 8 + 40 + 56 * ASCENT, "Act", "display", 400, 56, SUN_INK, "middle");
  text(mid, sealY + 8 + 40 + 56 + 8 + romanSize * ASCENT, roman, "display", 400, romanSize, SUN_INK, "middle");
  const rowW = residents.length * crop.w * scale;
  residents.forEach((who, i) => {
    const look = CAST_LOOKS[who]!;
    const runs = personRuns(look, heads ? { expression: "proud" } : { expression: "proud", pose: "thumbs" }, heads ? "head" : "bust");
    shapes.push({ kind: "pixels", x: Math.round(mid - rowW / 2 + i * crop.w * scale), y: sealY + sealH - 8 - figureH, scale, w: crop.w, h: crop.h, runs });
  });
  return shapes;
}

/** What the certificate says, for its alternative text. */
export function certificateWords(c: CertificateFacts): string {
  const roman = ROMAN[c.act] ?? String(c.act);
  return `${BRAND.name} certificate of completion: ${c.name} completed Act ${roman}, ${c.actName}, with ${c.projects} ${c.projects === 1 ? "project" : "projects"} shipped. Completed ${longDate(c.day)}.${c.playingAs ? ` Playing as ${c.playingAs.name}.` : ""} Signed ${BRAND.creditName}.`;
}

/** The font-family lists the canvas draws with: the same faces the page shows. */
export interface Families {
  display: string;
  text: string;
}

/** Draw the shapes onto a canvas the size of the sheet (or scaled with ctx.scale first). */
export function paint(ctx: CanvasRenderingContext2D, shapes: Shape[], families: Families) {
  ctx.textBaseline = "alphabetic";
  for (const s of shapes) {
    if (s.kind === "rect") {
      ctx.fillStyle = s.fill;
      ctx.fillRect(s.x, s.y, s.w, s.h);
    } else if (s.kind === "pixels") {
      for (const r of s.runs) {
        ctx.fillStyle = r.fill;
        ctx.fillRect(s.x + r.x * s.scale, s.y + r.y * s.scale, r.n * s.scale, s.scale);
      }
    } else {
      ctx.font = `${s.weight} ${s.size}px ${families[s.face]}`;
      ctx.textAlign = s.anchor === "middle" ? "center" : s.anchor === "end" ? "right" : "left";
      ctx.fillStyle = s.fill;
      ctx.fillText(s.text, s.x, s.y);
    }
  }
}
