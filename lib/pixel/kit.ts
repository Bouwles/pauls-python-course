// The drawing kit shared by the bust engine (people.ts), every gesture (gestures/) and every prop
// (props.ts): the 48x52 grid, colour mixing, arms and hands. A gesture draws with these, so a new
// one never needs to touch people.ts.
import type { PersonLook } from "./people";

export const W = 48;
export const H = 52;

// ---------------------------------------------------------------- colour

export const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a: string, b: string, t: number): string => {
  const [x, y] = [hex(a), hex(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("");
};
/** The dark edge round everyone. */
export const OUTLINE = "#1a1418";
/** The column mirrored across the middle of the face. */
export const M = (x: number) => W - 1 - x;

// ---------------------------------------------------------------- the grid

/**
 * The person's pixels, and for each one the part it belongs to ("skin", "hair", "arm", "hand",
 * "prop"...), so later passes can shade, outline or tint by part. Draw light effects (steam,
 * sparkles, smoke, music notes) in the region "fx": they get no dark outline.
 */
export class Grid {
  c: (string | null)[][] = Array.from({ length: H }, () => Array<string | null>(W).fill(null));
  r: (string | null)[][] = Array.from({ length: H }, () => Array<string | null>(W).fill(null));
  set(x: number, y: number, colour: string, region: string) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.c[y]![x] = colour;
    this.r[y]![x] = region;
  }
  row(y: number, hw: number, colour: string, region: string) {
    for (let x = 24 - hw; x <= 23 + hw; x++) this.set(x, y, colour, region);
  }
  get(x: number, y: number): string | null {
    return x < 0 || y < 0 || x >= W || y >= H ? null : this.r[y]![x]!;
  }
  /** Recolour a pixel already in `region`. */
  tint(x: number, y: number, colour: string, region: string) {
    if (this.get(x, y) === region) this.c[y]![x] = colour;
  }
  /** Clear a pixel. */
  clear(x: number, y: number) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.c[y]![x] = null;
    this.r[y]![x] = null;
  }
}

/**
 * Draw a small pattern: each character of each row is looked up in `palette` ("." is clear).
 * (x, y) is the pattern's top-left; `flip` mirrors it left to right.
 */
export function stamp(g: Grid, rows: string[], x: number, y: number, palette: Record<string, string>, region = "prop", flip = false) {
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      const c = palette[ch];
      if (ch === "." || !c) return;
      g.set(flip ? x + w - 1 - rx : x + rx, y + ry, c, region);
    }),
  );
}

// ---------------------------------------------------------------- the body

/** Half-widths of the torso, shoulder line to the bottom of the frame. */
export function torsoOf(p: PersonLook): Record<number, number> {
  const w = p.build === "regular" ? 15 : 14;
  return { 38: w - 6, 39: w - 3, 40: w - 1, 41: w, 42: w, 43: w, 44: w, 45: w, 46: w, 47: w, 48: w, 49: w, 50: w, 51: w };
}

/** The shoulders' outer columns: [the character's right (viewer's left), the character's left]. */
export function shoulders(p: PersonLook): { L: number; R: number } {
  const hw = torsoOf(p)[44]!;
  return { L: 24 - hw + 1, R: 23 + hw - 1 };
}

export function sleeveOf(p: PersonLook): string {
  const t = p.top;
  if (t.kind === "varsity") return t.sleeves;
  if (t.kind === "overshirt" || t.kind === "jacket") return t.outer;
  return t.colour;
}

/** The main colour of the top (its body, not its sleeves). */
export function topColour(p: PersonLook): string {
  const t = p.top;
  return t.kind === "varsity" ? t.body : t.kind === "overshirt" || t.kind === "jacket" ? t.outer : t.colour;
}

// ---------------------------------------------------------------- arms and hands

export type Pt = [number, number];

/** One segment of sleeve, three pixels thick, shaded on the side away from the light. */
export function limb(g: Grid, sleeve: string, [x0, y0]: Pt, [x1, y1]: Pt, region = "arm") {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const steep = Math.abs(y1 - y0) >= Math.abs(x1 - x0);
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let d = -1; d <= 1; d++) {
      const [px, py] = steep ? [x + d, y] : [x, y + d];
      g.set(px, py, d === 1 ? mix(sleeve, "#000000", 0.16) : d === -1 ? mix(sleeve, "#ffffff", 0.1) : sleeve, region);
    }
  }
}

export type HandKind = "open" | "fist" | "thumb" | "point" | "peace" | "grip" | "flat" | "heart";

/**
 * Hands, drawn from small patterns: S skin, s shade, k knuckle line. The pattern's bottom row
 * sits at the wrist. Hands are about a fifth of the head's width, like a real hand to a face.
 * A gesture can pass its own pattern instead of a kind.
 */
export const HANDS: Record<HandKind, string[]> = {
  // Fingers up, palm out, thumb to the side.
  open: ["S.S.S.", "SSSSS.", "SSSSsS", "SSSSsS", "SSSSs.", ".SSs.."],
  fist: [".SSSs", "SkkkS", "SSSSs", "SSSSs", ".SSs."],
  thumb: [".S...", ".S...", "SSSSs", "SkkkS", "SSSSs", ".SSs."],
  point: [".SSSs....", "SSSSSSSSs", "SkkkS....", "SSSSs....", ".SSs....."],
  // Two fingers up in a V.
  peace: ["S..S.", "S..S.", ".SSs.", "SkkkS", "SSSSs", ".SSs."],
  // Curled round something held (a mug's handle, a pen, a controller).
  grip: [".SSs.", "SkkkS", "S...S", "SSSSs", ".SSs."],
  // Palm down and flat, fingers forward (on a keyboard, on a desk).
  flat: ["SSSSSs", "SSSSSs", ".SSSs."],
  // Half a finger heart: thumb and finger crossed.
  heart: [".S.S", "SSSs", "SkkS", ".SS."],
};

export function hand(g: Grid, p: PersonLook, kind: HandKind | string[], [hx, hy]: Pt, flip = false) {
  const rows = typeof kind === "string" ? HANDS[kind] : kind;
  const h = rows.length;
  rows.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const x = flip ? hx + 2 - rx : hx - 2 + rx;
      const y = hy - h + 1 + ry;
      g.set(x, y, ch === "S" ? p.skin : ch === "s" ? p.skinShade : mix(p.skinShade, "#3a2016", 0.35), "hand");
    });
  });
}

/** An arm from the shoulder, bent at the elbow, ending in a hand at the wrist. */
export function arm(g: Grid, p: PersonLook, shoulder: Pt, elbow: Pt, wrist: Pt, kind: HandKind | string[] | null, flip = false) {
  const sleeve = sleeveOf(p);
  limb(g, sleeve, shoulder, elbow);
  limb(g, sleeve, elbow, wrist);
  // A darker cuff where the sleeve ends.
  for (let d = -1; d <= 1; d++) g.set(wrist[0] + d, wrist[1], mix(sleeve, "#000000", 0.22), "arm");
  if (kind) hand(g, p, kind, [wrist[0], wrist[1] - 1], flip);
}
