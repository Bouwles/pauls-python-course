// A pixel person as an SVG document, for places with no canvas: the server-drawn share cards and
// certificates (next/og), and scripts. Each row's runs of one colour become one rectangle, and
// every edge stays crisp at any whole-number scale.
import { drawPerson, H, W, type Moment, type PersonLook } from "./people";

/** The part of the 48x52 grid each crop shows (as PixelPerson's crops). */
export const PERSON_CROPS = {
  bust: { x: 0, y: 0, w: W, h: H },
  head: { x: 8, y: 0, w: 32, h: 36 },
};

/** One row's run of one colour: `n` pixels from (x, y), inside the crop. */
export interface PixelRun {
  x: number;
  y: number;
  n: number;
  fill: string;
}

/** The person's pixels as runs of one colour, row by row, inside the crop. */
export function personRuns(look: PersonLook, m: Moment = {}, crop: keyof typeof PERSON_CROPS = "bust"): PixelRun[] {
  const g = drawPerson(look, m);
  const c = PERSON_CROPS[crop];
  const runs: PixelRun[] = [];
  for (let y = 0; y < c.h; y++) {
    let x = 0;
    while (x < c.w) {
      const colour = g.c[c.y + y]?.[c.x + x];
      let n = 1;
      while (x + n < c.w && g.c[c.y + y]?.[c.x + x + n] === colour) n++;
      if (colour) runs.push({ x, y, n, fill: colour });
      x += n;
    }
  }
  return runs;
}

export function personSvg(look: PersonLook, m: Moment = {}, { scale = 4, crop = "bust", background }: { scale?: number; crop?: keyof typeof PERSON_CROPS; background?: string } = {}): string {
  const c = PERSON_CROPS[crop];
  const rects: string[] = [];
  if (background) rects.push(`<rect width="${c.w}" height="${c.h}" fill="${background}"/>`);
  for (const r of personRuns(look, m, crop)) rects.push(`<rect x="${r.x}" y="${r.y}" width="${r.n}" height="1" fill="${r.fill}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${c.w * scale}" height="${c.h * scale}" viewBox="0 0 ${c.w} ${c.h}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

/** The same, as a data: URL for an <img>. */
export const personDataUrl = (...args: Parameters<typeof personSvg>) => `data:image/svg+xml;base64,${Buffer.from(personSvg(...args)).toString("base64")}`;
