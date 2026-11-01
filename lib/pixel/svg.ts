// A pixel person as an SVG document, for places with no canvas: the server-drawn share cards and
// certificates (next/og), and scripts. Each row's runs of one colour become one rectangle, and
// every edge stays crisp at any whole-number scale.
import { drawPerson, H, W, type Moment, type PersonLook } from "./people";

/** The part of the 48x52 grid each crop shows (as PixelPerson's crops). */
const CROPS = {
  bust: { x: 0, y: 0, w: W, h: H },
  head: { x: 8, y: 0, w: 32, h: 36 },
};

export function personSvg(look: PersonLook, m: Moment = {}, { scale = 4, crop = "bust", background }: { scale?: number; crop?: keyof typeof CROPS; background?: string } = {}): string {
  const g = drawPerson(look, m);
  const c = CROPS[crop];
  const rects: string[] = [];
  if (background) rects.push(`<rect width="${c.w}" height="${c.h}" fill="${background}"/>`);
  for (let y = 0; y < c.h; y++) {
    let x = 0;
    while (x < c.w) {
      const colour = g.c[c.y + y]?.[c.x + x];
      let n = 1;
      while (x + n < c.w && g.c[c.y + y]?.[c.x + x + n] === colour) n++;
      if (colour) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${colour}"/>`);
      x += n;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${c.w * scale}" height="${c.h * scale}" viewBox="0 0 ${c.w} ${c.h}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

/** The same, as a data: URL for an <img>. */
export const personDataUrl = (...args: Parameters<typeof personSvg>) => `data:image/svg+xml;base64,${Buffer.from(personSvg(...args)).toString("base64")}`;
