// The Act certificate, made the way formal certificates are: a guilloche border in one green ink as
// on a banknote or a stock certificate, an engraved vignette at the head (the Clocktower), the
// course's name in blackletter, the person's in copperplate on a ruled line, then a gold seal
// between the date and Paul's signature in pen.
//
// It's laid out once, as a list of shapes on a 2000 x 1414 sheet (A4 landscape), and the same list
// is drawn three ways: as an SVG on the page (which prints as crisp vectors), onto a canvas for
// "Save as a picture", and by the server (CertificateImage.tsx). Text is measured with the fonts
// the page has loaded, so a long name gets a smaller size or a second line, and they all agree.
import { BRAND } from "@/lib/brand";
import { floorFor } from "@/lib/cast";
import { circle, clocktower, guillocheBand, rosette, scallop } from "./engraving";
import { ENGRAVED as E, ROMAN, longDate } from "./look";
import { SIGNATURE, signaturePath } from "./signature";

export const SHEET = { width: 2000, height: 1414 };

export type Face = "title" | "script" | "serif" | "italic";

export interface TextShape {
  kind: "text";
  x: number;
  /** The baseline. */
  y: number;
  text: string;
  face: Face;
  size: number;
  fill: string;
  anchor: "start" | "middle" | "end";
  /** Degrees clockwise round (x, y), for the letters round the seal. */
  turn?: number;
}

export interface RectShape {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

/** An outline, filled, stroked or both: the guilloche, the vignette, the signature. */
export interface PathShape {
  kind: "path";
  d: string;
  fill?: string;
  stroke?: string;
  width?: number;
}

export type Shape = TextShape | RectShape | PathShape;

/** How wide `text` is in that face and size, in sheet pixels. */
export type Measure = (text: string, face: Face, size: number) => number;

/** A rough measure for when no fonts are loaded (tests, and the moment before the fonts arrive). */
export const roughMeasure: Measure = (text, face, size) => [...text].reduce((w, ch) => w + size * (face === "script" ? 0.42 : face === "title" ? 0.46 : /[A-Z]/.test(ch) ? 0.6 : /['*.,:]/.test(ch) ? 0.26 : 0.47), 0);

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
}

const MID = SHEET.width / 2;
/** How wide a line of words may run inside the border. */
const MAX_WIDE = 1480;
const NUMBERS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

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

/** The name: the biggest size that fits on one line, else two lines at a smaller size. */
export function fitName(name: string, measure: Measure): { size: number; lines: string[] } {
  for (const size of [152, 136, 120, 104, 92]) if (measure(name, "script", size) <= MAX_WIDE) return { size, lines: [name] };
  for (const size of [80, 68]) {
    const lines = wrap(name, MAX_WIDE, (s) => measure(s, "script", size));
    if (lines.length <= 2) return { size, lines };
  }
  const lines = wrap(name, MAX_WIDE, (s) => measure(s, "script", 60));
  return { size: 60, lines: lines.length > 2 ? [lines[0]!, `${lines[1]!.replace(/.$/, "")}...`] : lines };
}

/** The floor the Act is on, in words: "The Puzzle Room, floor 3 of the Clocktower". */
export function floorLine(act: number): string | null {
  const floor = floorFor(act);
  if (!floor) return null;
  return `${floor.room}, ${floor.act === 1 ? "the ground floor" : floor.act === 9 ? "the roof" : floor.label.toLowerCase()} of the Clocktower`;
}

/** Everything on the certificate, back to front, as shapes on the 2000 x 1414 sheet. */
export function certificateShapes(c: CertificateFacts, measure: Measure = roughMeasure): Shape[] {
  const shapes: Shape[] = [];
  const { width: W, height: H } = SHEET;
  const rect = (x: number, y: number, w: number, h: number, fill: string) => shapes.push({ kind: "rect", x, y, w, h, fill });
  const text = (x: number, y: number, words: string, face: Face, size: number, fill: string, anchor: TextShape["anchor"] = "middle", turn?: number) => shapes.push({ kind: "text", x, y, text: words, face, size, fill, anchor, ...(turn === undefined ? {} : { turn }) });
  const stroke = (d: string, colour: string, width: number) => shapes.push({ kind: "path", d, stroke: colour, width });
  const fill = (d: string, colour: string) => shapes.push({ kind: "path", d, fill: colour });
  const frame = (inset: number) => `M${inset} ${inset}H${W - inset}V${H - inset}H${inset}Z`;
  const roman = ROMAN[c.act] ?? String(c.act);

  // The paper, with a large pale rosette under the words.
  rect(0, 0, W, H, E.paper);
  stroke(rosette(MID, 690, 150, 470, 28, 7, 420), E.tint, 1);
  stroke(circle(MID, 690, 150), E.tint, 1);

  // The border: ruled lines either side of a band of guilloche, and a rosette at each corner.
  const band = 92;
  const half = 25;
  stroke(frame(50), E.ink, 3.5);
  stroke(frame(58), E.ink, 1);
  stroke(frame(band - half - 5), E.ink, 1);
  stroke(frame(band + half + 5), E.ink, 1);
  stroke(frame(band + half + 12), E.ink, 3);
  stroke(frame(band + half + 18), E.ink, 1);
  const corner = 58;
  const span = (a: number, b: number) => [a + 34, b - 34] as const;
  const [ax, bx] = span(band, W - band);
  const [ay, by] = span(band, H - band);
  stroke(guillocheBand(ax, band, bx, band, half, 62) + guillocheBand(ax, H - band, bx, H - band, half, 62) + guillocheBand(band, ay, band, by, half, 62) + guillocheBand(W - band, ay, W - band, by, half, 62), E.ink, 0.9);
  for (const [x, y] of [[band, band], [W - band, band], [band, H - band], [W - band, H - band]] as const) {
    rect(x - corner / 2 - 4, y - corner / 2 - 4, corner + 8, corner + 8, E.paper);
    stroke(`M${x - corner / 2 - 4} ${y - corner / 2 - 4}h${corner + 8}v${corner + 8}h-${corner + 8}Z`, E.ink, 1.2);
    stroke(rosette(x, y, 5, 28, 8, 6, 96), E.ink, 0.8);
  }

  // The vignette at the head: the Clocktower, in the same ink.
  const tower = clocktower(MID, 372);
  stroke(tower.rays, E.ink, 0.9);
  fill(tower.mask, E.paper);
  stroke(tower.fine, E.ink, 0.8);
  stroke(tower.strong, E.ink, 1.5);
  fill(tower.solid, E.ink);

  // Who gave it, what it is, and who to.
  text(MID, 484, BRAND.name, "title", 118, E.black);
  text(MID, 548, "Certificate of Completion", "italic", 42, E.ink);
  text(MID, 606, "This certifies that", "italic", 38, E.soft);
  const name = fitName(c.name, measure);
  const count = c.projects <= 20 ? NUMBERS[c.projects]! : String(c.projects);
  let y = 610;
  name.lines.forEach((line) => {
    y += name.size * (name.lines.length > 1 ? 1.12 : 0.86);
    text(MID, y, line, "script", name.size, E.black);
  });
  const ruled = Math.max(620, Math.min(MAX_WIDE, Math.max(...name.lines.map((l) => measure(l, "script", name.size))) + 120));
  y += 36;
  stroke(`M${MID - ruled / 2} ${y}H${MID + ruled / 2}`, E.ink, 1.5);

  // What they did, as a diploma words it, clear of any tails hanging through the line.
  y += 66;
  const where = floorLine(c.act);
  text(MID, y, `has completed Act ${roman}: ${c.actName}`, "serif", 44, E.black);
  y += 54;
  text(MID, y, `and shipped ${count} Python ${c.projects === 1 ? "project" : "projects"}`, "serif", 44, E.black);
  y += 50;
  const after = [where ? `in ${where.replace(/^The /, "the ")}` : null, c.playingAs ? `playing as ${c.playingAs.name}` : null].filter(Boolean).join(", ");
  if (after) text(MID, y, after, "italic", measure(after, "italic", 34) > MAX_WIDE ? 28 : 34, E.soft);

  // Along the foot: the date, the seal, and Paul's signature, on ruled lines.
  const footY = 1172;
  const leftX = 480;
  const rightX = W - 480;
  const ruleW = 460;
  text(leftX, footY - 14, longDate(c.day), "serif", 40, E.black);
  stroke(`M${leftX - ruleW / 2} ${footY}H${leftX + ruleW / 2}M${rightX - ruleW / 2} ${footY}H${rightX + ruleW / 2}`, E.ink, 1.5);
  text(leftX, footY + 44, "Date", "italic", 30, E.soft);
  text(rightX, footY + 44, "Professor", "italic", 30, E.soft);
  const signScale = 0.68;
  const signW = SIGNATURE.width * signScale;
  const signH = SIGNATURE.height * signScale;
  fill(signaturePath(rightX - signW / 2, footY + 12 - signH, signScale), E.pen);

  // The seal: ribbons behind, a scalloped edge, a gold rosette, and the Act in the middle.
  const sealX = MID;
  const sealY = 1124;
  const tail = (dir: 1 | -1) => `M${sealX + dir * 22} ${sealY + 60}L${sealX + dir * 92} ${sealY + 60}L${sealX + dir * 124} ${sealY + 140}L${sealX + dir * 90} ${sealY + 122}L${sealX + dir * 62} ${sealY + 144}Z`;
  fill(tail(-1) + tail(1), E.ink);
  stroke(tail(-1) + tail(1), E.goldDark, 1.5);
  fill(scallop(sealX, sealY, 104, 10, 40), E.gold);
  stroke(scallop(sealX, sealY, 104, 10, 40), E.goldDark, 1.5);
  stroke(circle(sealX, sealY, 100), E.goldDark, 1.5);
  stroke(rosette(sealX, sealY, 66, 100, 24, 4, 240), E.goldDark, 0.8);
  fill(circle(sealX, sealY, 86), E.gold);
  stroke(circle(sealX, sealY, 86), E.goldDark, 2);
  stroke(circle(sealX, sealY, 58), E.goldDark, 1.5);
  fill(circle(sealX, sealY, 57), E.goldLight);
  stroke(rosette(sealX, sealY, 40, 57, 18, 3, 180), E.gold, 0.7);
  // The course's name round the seal, a letter at a time, evenly over the whole circle.
  const ring = `${BRAND.name.toUpperCase()} * THE CLOCKTOWER * `;
  const letters = [...ring];
  const ringR = 64;
  const ringSize = 19;
  const widths = letters.map((l) => (l === " " ? ringSize * 0.34 : measure(l, "serif", ringSize)));
  const total = widths.reduce((a, b) => a + b, 0);
  const gap = (2 * Math.PI * ringR - total) / letters.length;
  let along = 0;
  letters.forEach((l, i) => {
    const middle = along + widths[i]! / 2;
    const a = middle / ringR;
    if (l !== " ") text(sealX + ringR * Math.sin(a), sealY - ringR * Math.cos(a), l, "serif", ringSize, E.goldDark, "middle", (a * 180) / Math.PI);
    along += widths[i]! + gap;
  });
  text(sealX, sealY - 18, "Act", "italic", 28, E.goldDark);
  text(sealX, sealY + 34, roman, "serif", roman.length > 2 ? 48 : 60, E.goldDark);
  return shapes;
}

/** What the certificate says, for its alternative text. */
export function certificateWords(c: CertificateFacts): string {
  const roman = ROMAN[c.act] ?? String(c.act);
  return `${BRAND.name} certificate of completion: ${c.name} completed Act ${roman}, ${c.actName}, with ${c.projects} ${c.projects === 1 ? "project" : "projects"} shipped. Completed ${longDate(c.day)}.${c.playingAs ? ` Playing as ${c.playingAs.name}.` : ""} Signed by Paul.`;
}

/** The font-family lists the canvas draws with: the same faces the page shows. */
export type Families = Record<Face, string>;

/** Draw the shapes onto a canvas the size of the sheet (or scaled with ctx.scale first). */
export function paint(ctx: CanvasRenderingContext2D, shapes: Shape[], families: Families) {
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  for (const s of shapes) {
    if (s.kind === "rect") {
      ctx.fillStyle = s.fill;
      ctx.fillRect(s.x, s.y, s.w, s.h);
    } else if (s.kind === "path") {
      const path = new Path2D(s.d);
      if (s.fill) {
        ctx.fillStyle = s.fill;
        ctx.fill(path);
      }
      if (s.stroke) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.width ?? 1;
        ctx.stroke(path);
      }
    } else {
      ctx.font = `${s.face === "italic" ? "italic " : ""}400 ${s.size}px ${families[s.face]}`;
      ctx.textAlign = s.anchor === "middle" ? "center" : s.anchor === "end" ? "right" : "left";
      ctx.fillStyle = s.fill;
      if (s.turn === undefined) {
        ctx.fillText(s.text, s.x, s.y);
      } else {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate((s.turn * Math.PI) / 180);
        ctx.fillText(s.text, 0, 0);
        ctx.restore();
      }
    }
  }
}
