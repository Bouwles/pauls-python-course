// Full-body pixel figures: the cast and each learner, standing, walking, sitting and doing things
// in scenes, at the same scale as the rooms (lib/pixel/rooms.ts). The busts (people.ts) are
// head-and-shoulders portraits; these are the same people seen whole, drawn in the same style:
// each person's own palette (lib/pixel/looks.ts), the dark outline, light from the top left and
// shading on the far side.
//
// The grid is 31 wide and 48 tall (FW x FH), one grid pixel to one room pixel. A standing figure
// is 44 pixels from the top of the hair to the soles (about three and a half heads: a head 11
// wide and 10 tall under its hair, shoulders 15 across the arms, arms that hang to the upper
// thigh), its middle on column 15, its shoes on rows 45 and 46. Put the grid's bottom row on a
// room's floor line and it stands among the desks and doors at their scale; a 56-pixel room has
// room above it. 31 is odd so a figure turned to face the other way mirrors onto exactly the same
// columns. Seated, the hips drop 7 rows to a chair's seat.
//
// A figure is a look plus a moment: an action (defineActions below: stand, walk, type, read,
// easel...), the frame of its loop, which way they face, a blink, a mouth open mid-word. Nothing
// bobs: a standing figure is level and still but for its eyes, a walk or a run moves only the
// legs and arms, and nothing lifts the whole figure off the floor. Left is right mirrored, except
// for letters and notes (a sleeper's "z"), which are placed after the mirror so they read the
// right way round. Learners' hair styles the cast pictures don't cover are built from a recipe
// per style (BUILDS). The same code draws in the browser (components/art/PixelFigure.tsx) and in
// Node.

import { hex, mix, OUTLINE } from "./kit";
import type { PersonLook } from "./people";

export const FW = 31;
export const FH = 48;
/** The figure's middle column. */
export const MID = 15;
/** The last row of the shoes. The floor is the row below. */
export const GROUND = 46;

export type View = "front" | "back" | "left" | "right";
export const VIEWS: View[] = ["front", "right", "back", "left"];
/** How a view is drawn: left is right, mirrored. */
type Kind = "front" | "back" | "side";

export type Pt = [number, number];

// ---------------------------------------------------------------- the grid

/** The figure's pixels, and for each the part it belongs to ("skin", "hair", "arm", "prop"...). */
export class FigureGrid {
  readonly c: (string | null)[] = new Array<string | null>(FW * FH).fill(null);
  readonly r: (string | null)[] = new Array<string | null>(FW * FH).fill(null);
  set(x: number, y: number, colour: string, region: string) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    this.c[y * FW + x] = colour;
    this.r[y * FW + x] = region;
  }
  get(x: number, y: number): string | null {
    x = Math.round(x);
    y = Math.round(y);
    return x < 0 || y < 0 || x >= FW || y >= FH ? null : this.r[y * FW + x]!;
  }
  colour(x: number, y: number): string | null {
    return x < 0 || y < 0 || x >= FW || y >= FH ? null : this.c[y * FW + x]!;
  }
  /** Recolour a pixel already in one of `regions`. */
  tint(x: number, y: number, colour: string, ...regions: string[]) {
    const r = this.get(x, y);
    if (r && regions.includes(r)) this.c[y * FW + x] = colour;
  }
  clear(x: number, y: number) {
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    this.c[y * FW + x] = null;
    this.r[y * FW + x] = null;
  }
  /** Mirror left to right about the middle column (a figure turning round). */
  mirror() {
    for (let y = 0; y < FH; y++)
      for (let x = 0; x < MID; x++) {
        const a = y * FW + x;
        const b = y * FW + (FW - 1 - x);
        [this.c[a], this.c[b]] = [this.c[b]!, this.c[a]!];
        [this.r[a], this.r[b]] = [this.r[b]!, this.r[a]!];
      }
  }
}

// ---------------------------------------------------------------- colour

const dark = (c: string, t = 0.2) => mix(c, "#140c18", t);
const light = (c: string, t = 0.2) => mix(c, "#fff6e4", t);

/** Everything a figure is drawn in, worked out once from the look. */
interface Pal {
  look: PersonLook;
  skin: string;
  skinShade: string;
  skinDeep: string;
  lip: string;
  line: string;
  soft: string;
  inside: string;
  teeth: string;
  iris: string;
  brow: string;
  lash: string;
  white: string;
  hair: string;
  hairShade: string;
  hairLight: string;
  /** The top: its body, sleeves, trim and what shows under it. */
  body: string;
  bodyShade: string;
  bodyLight: string;
  sleeve: string;
  sleeveShade: string;
  cuff: string;
  inner: string | null;
  trim: string | null;
  /** Short sleeves (a tee) or sleeves rolled up (a shirt): forearms bare. */
  bareForearms: boolean;
  rolled: boolean;
  trousers: string;
  trousersShade: string;
  trousersLight: string;
  legKind: "trousers" | "jeans" | "shorts" | "skirt";
  shoes: string;
  shoesShade: string;
  sole: string;
  frame: string;
  fabric: string;
}

/** What a figure wears below the waist when the look doesn't say. */
export const DEFAULT_LEGS: NonNullable<PersonLook["legs"]> = { trousers: "#34405c", shoes: "#e6e2da", kind: "jeans" };

function paletteOf(look: PersonLook): Pal {
  const t = look.top;
  const legs = look.legs ?? DEFAULT_LEGS;
  const body = t.kind === "varsity" ? t.body : t.kind === "overshirt" || t.kind === "jacket" ? t.outer : t.colour;
  const sleeve = t.kind === "varsity" ? t.sleeves : body;
  const inner = t.kind === "overshirt" || t.kind === "jacket" ? t.inner : t.kind === "varsity" ? (t.shirt ?? "#1d1d24") : null;
  const trim = t.kind === "varsity" ? t.trim : null;
  const line = mix(mix(look.skinShade, look.lip, 0.6), "#000000", 0.1);
  return {
    look,
    skin: look.skin,
    skinShade: look.skinShade,
    skinDeep: mix(look.skinShade, "#3a2016", 0.3),
    lip: look.lip,
    line,
    soft: mix(look.skin, mix(look.skinShade, look.lip, 0.5), 0.6),
    inside: mix(look.lip, "#2a0f0f", 0.55),
    teeth: mix("#f4efe8", look.skin, 0.15),
    iris: look.iris,
    brow: look.brow,
    lash: "#1d1514",
    white: "#f4efe9",
    hair: look.hair,
    hairShade: look.hairShade,
    hairLight: look.hairLight,
    body,
    bodyShade: dark(body, body === "#f3f3f1" || hex(body).every((v) => v > 200) ? 0.14 : 0.22),
    bodyLight: light(body, 0.14),
    sleeve,
    sleeveShade: dark(sleeve, hex(sleeve).every((v) => v > 200) ? 0.14 : 0.22),
    cuff: trim ?? dark(sleeve, 0.3),
    inner,
    trim,
    bareForearms: t.kind === "tee",
    rolled: t.kind === "shirt",
    trousers: legs.trousers,
    trousersShade: dark(legs.trousers, 0.28),
    // Dark trousers need a stronger light edge to show one leg against the other.
    trousersLight: light(legs.trousers, hex(legs.trousers).reduce((n, v) => n + v, 0) < 200 ? 0.2 : 0.12),
    legKind: legs.kind ?? "trousers",
    shoes: legs.shoes,
    shoesShade: dark(legs.shoes, 0.25),
    sole: hex(legs.shoes).every((v) => v > 160) ? mix(legs.shoes, "#8a8478", 0.45) : dark(legs.shoes, 0.45),
    frame: look.glassesColour ?? "#121214",
    fabric: look.fabric ?? "#18181b",
  };
}

/**
 * Hair colour for a pixel: a look with coloured ends turns from about chin height down, the
 * change dithered over two rows so it never reads as a band.
 */
function hairAt(p: Pal, x: number, y: number, headY: number, which: "base" | "shade" | "light" = "base"): string {
  const base = which === "base" ? p.hair : which === "shade" ? p.hairShade : p.hairLight;
  const e = p.look.ends;
  if (!e) return base;
  const to = which === "base" ? e.colour : which === "shade" ? e.shade : e.light;
  // The bust's ends start five rows above its chin: here that's about the chin.
  const from = headY + 8;
  if (y >= from) return to;
  if (y === from - 1) return (x + y) % 2 === 0 ? to : mix(base, to, 0.35);
  if (y === from - 2) return (x + y) % 3 === 0 ? mix(base, to, 0.6) : base;
  return base;
}

// ---------------------------------------------------------------- drawing helpers

/** The pixels along a line, one per step. */
function line(a: Pt, b: Pt): Pt[] {
  const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) out.push([Math.round(a[0] + ((b[0] - a[0]) * i) / n), Math.round(a[1] + ((b[1] - a[1]) * i) / n)]);
  return out;
}

/**
 * A limb segment `w` pixels thick (2 for arms, 3 for legs seen side on), lit on the side towards
 * the top left and shaded on the other. Returns the pixels it covered.
 */
function thick(a: Pt, b: Pt, w: number): { x: number; y: number; d: number }[] {
  const steep = Math.abs(b[1] - a[1]) >= Math.abs(b[0] - a[0]);
  const out: { x: number; y: number; d: number }[] = [];
  const lo = -Math.floor((w - 1) / 2);
  for (const [x, y] of line(a, b))
    for (let i = 0; i < w; i++) {
      const d = lo + i;
      out.push(steep ? { x: x + d, y, d: i === w - 1 ? 1 : i === 0 ? -1 : 0 } : { x, y: y + d, d: i === w - 1 ? 1 : i === 0 ? -1 : 0 });
    }
  return out;
}

/**
 * Paint pixels over what's there, with a soft dark edge wherever they cross something else (an
 * arm over the body), so a limb never melts into a jacket of the same colour.
 */
function over(g: FigureGrid, cells: { x: number; y: number; c: string }[], region: string, edgeOn: (r: string) => boolean = (r) => r !== region) {
  const mine = new Set(cells.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`));
  for (const p of cells)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const x = Math.round(p.x) + dx;
      const y = Math.round(p.y) + dy;
      if (mine.has(`${x},${y}`)) continue;
      const r = g.get(x, y);
      if (r && r !== "outline" && r !== "edge" && edgeOn(r)) g.set(x, y, mix(g.colour(x, y)!, OUTLINE, 0.7), "edge");
    }
  for (const p of cells) g.set(p.x, p.y, p.c, region);
}

/** Two-bone reach: where the middle joint goes to get from `a` to `c` with bones `l1` and `l2`, bending to `side` (1 or -1). */
function bend(a: Pt, c: Pt, l1: number, l2: number, side: number): Pt {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  const d = Math.max(0.001, Math.hypot(dx, dy));
  if (d >= l1 + l2 - 0.01) return [a[0] + (dx * l1) / (l1 + l2), a[1] + (dy * l1) / (l1 + l2)];
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const ux = dx / d;
  const uy = dy / d;
  return [a[0] + ux * along - uy * h * side, a[1] + uy * along + ux * h * side];
}

// ---------------------------------------------------------------- the body, resolved

/** Hands: a fist, open (a wave), gripping something, flat (on keys), pointing. */
export type HandShape = "fist" | "open" | "grip" | "flat" | "point";

interface ArmJ {
  s: Pt;
  e: Pt;
  w: Pt;
  hand: HandShape | null;
  /** Drawn over the head and body (reaching across), not beside them. */
  front: boolean;
  /** The far arm in a side view: behind the body, a shade darker. */
  far: boolean;
}

interface LegJ {
  h: Pt;
  k: Pt;
  a: Pt;
  far: boolean;
  /** The shoe: flat, heel up (pushing off), toe up (landing), or seen from the sole (front, sitting). */
  foot: "flat" | "heel" | "toe";
}

export type EyeMode = "open" | "closed" | "happy" | "down" | "up" | "wide" | "half" | "aside";
export type MouthMode = "rest" | "smile" | "grin" | "flat" | "ajar" | "open" | "o" | "laugh";

export interface Face {
  eyes?: EyeMode;
  mouth?: MouthMode;
  brows?: "rest" | "up" | "down";
}

interface Body {
  kind: Kind;
  /** The middle of the waistband: x the centre column, y its top row. */
  hip: Pt;
  /** The middle of the shoulder line: the torso's top row. */
  top: Pt;
  /** The head: x its centre column, y the top row of the skin. */
  head: Pt;
  arms: ArmJ[];
  legs: LegJ[];
  sit: boolean;
  face: Face;
}

// Standing measurements.
const HEAD_Y = 6;
const TOP_Y = 17;
const HIP_Y = 29;
const ANKLE_Y = GROUND - 2;
const UPPER_ARM = 6;
const FOREARM = 6;
const THIGH = 7;
const SHIN = 7;

/** Half-widths of the torso from the shoulder line down, seen from the front or back. */
const TORSO_FRONT = [4, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4];
/** Seen side on: [back, front] from the middle. */
const TORSO_SIDE: Pt[] = [[-2, 2], [-3, 3], [-3, 3], [-3, 3], [-3, 3], [-3, 2], [-3, 2], [-3, 2], [-3, 2], [-3, 2], [-3, 2], [-3, 2]];

// ---------------------------------------------------------------- the torso and what's on it

function torsoFront(g: FigureGrid, p: Pal, b: Body) {
  const back = b.kind === "back";
  const rows = b.hip[1] - b.top[1];
  const t = p.look.top;
  for (let i = 0; i < rows; i++) {
    const y = b.top[1] + i;
    const k = rows <= 1 ? 0 : i / (rows - 1);
    const cx = Math.round(b.top[0] + (b.hip[0] - b.top[0]) * k);
    // The shape is measured from the shoulders for the chest and from the hips for the waist.
    const hw = i < 8 ? TORSO_FRONT[i]! : TORSO_FRONT[Math.max(8, TORSO_FRONT.length - (rows - i))]!;
    for (let x = cx - hw; x <= cx + hw; x++) {
      let c = p.body;
      const fromMid = x - cx;
      const edge = fromMid === hw ? p.bodyShade : fromMid === -hw && i > 0 ? p.bodyLight : null;
      if (!back) {
        if (t.kind === "varsity") {
          // The sleeves' colour over the shoulders, a varsity jacket's yoke.
          if (i <= 1 && Math.abs(fromMid) >= hw - 1) c = p.sleeve;
          if (t.shirt) {
            // Closed, with snaps down the middle and a shirt collar.
            if (fromMid === 0 && i >= 2) c = dark(p.body, 0.25);
            if (fromMid === -1 && i >= 3 && i % 3 === 0) c = t.trim;
          } else {
            // Open over a dark top.
            if (Math.abs(fromMid) <= 1 && i >= 1) c = p.inner!;
            if (Math.abs(fromMid) === 2 && i >= 1) c = t.trim;
          }
          if (i === rows - 1) c = Math.abs(fromMid) <= 1 && !t.shirt ? p.inner! : t.trim;
        } else if (t.kind === "overshirt" || t.kind === "jacket") {
          if (Math.abs(fromMid) <= 1 && i >= 1) c = p.inner!;
          if (Math.abs(fromMid) === 2 && i >= 1) c = dark(p.body, 0.3);
        } else if (t.kind === "shirt") {
          if (fromMid === 0 && i >= 2) c = dark(p.body, 0.1);
          if (fromMid === 0 && i >= 2 && i % 3 === 2) c = dark(p.body, 0.3);
        } else if (t.kind === "hoodie") {
          if (Math.abs(fromMid) === 1 && i >= 1 && i <= 4) c = "#f2f2ee";
          if (i >= rows - 4 && i <= rows - 2 && Math.abs(fromMid) <= 3) c = dark(p.body, 0.1);
          if (i === rows - 1) c = dark(p.body, 0.16);
        } else if (t.kind === "jumper") {
          if (i === rows - 1) c = dark(p.body, 0.2);
        }
      } else if (t.kind === "varsity" && i <= 1 && Math.abs(fromMid) >= hw - 1) c = p.sleeve;
      else if (t.kind === "varsity" && i === rows - 1) c = t.trim;
      else if (t.kind === "hoodie" && i <= 2 && Math.abs(fromMid) <= 3) c = dark(p.body, 0.18);
      if (edge && c === p.body) c = edge;
      g.set(x, y, c, "body");
    }
  }
  // The neck, and the collar round it.
  const nx = b.top[0];
  for (let y = b.head[1] + 10; y < b.top[1]; y++) for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y, y === b.head[1] + 10 ? p.skinShade : p.skin, "neck");
  if (back) return;
  const y0 = b.top[1];
  if (t.kind === "tee" || t.kind === "jumper") {
    for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y0, p.skin, "neck");
    if (t.kind === "jumper") for (const dx of [-2, 2]) g.set(nx + dx, y0, dark(p.body, 0.2), "body");
    if (t.kind === "jumper") for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y0 + 1, dark(p.body, 0.2), "body");
  } else if (t.kind === "shirt") {
    // A collar either side of the open neck.
    g.set(nx, y0, p.skin, "neck");
    for (const [dx, dy] of [[-2, 0], [-1, 0], [1, 0], [2, 0], [-1, 1], [1, 1]] as const) g.set(nx + dx, y0 + dy, light(p.body, 0.5), "body");
    g.set(nx - 2, y0 + 1, dark(p.body, 0.16), "body"), g.set(nx + 2, y0 + 1, dark(p.body, 0.16), "body");
  } else if (t.kind === "varsity") {
    for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y0, t.shirt ? t.shirt : p.inner!, "body");
    for (const dx of [-2, 2]) g.set(nx + dx, y0, t.trim, "body");
    if (t.shirt) g.set(nx, y0, p.skin, "neck"), g.set(nx - 1, y0 + 1, t.shirt, "body"), g.set(nx + 1, y0 + 1, t.shirt, "body");
  } else if (t.kind === "overshirt" || t.kind === "jacket") {
    for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y0, p.inner!, "body");
    for (const dx of [-2, 2]) g.set(nx + dx, y0, dark(p.body, 0.3), "body");
  } else if (t.kind === "hoodie") {
    for (let x = nx - 3; x <= nx + 3; x++) g.set(x, y0, dark(p.body, 0.2), "body");
    g.set(nx, y0, p.skin, "neck");
  }
  if (p.look.necklace) for (const dx of [-1, 0, 1]) g.set(nx + dx, y0 + (dx === 0 ? 1 : 0), dx === 0 ? light(p.look.necklace, 0.2) : p.look.necklace, "accessory");
}

function torsoSide(g: FigureGrid, p: Pal, b: Body) {
  const rows = b.hip[1] - b.top[1];
  const t = p.look.top;
  for (let i = 0; i < rows; i++) {
    const y = b.top[1] + i;
    const k = rows <= 1 ? 0 : i / (rows - 1);
    const cx = Math.round(b.top[0] + (b.hip[0] - b.top[0]) * k);
    const [l, r] = i < 8 ? TORSO_SIDE[i]! : TORSO_SIDE[Math.max(8, TORSO_SIDE.length - (rows - i))]!;
    for (let x = cx + l; x <= cx + r; x++) {
      let c = x === cx + r ? p.bodyShade : x === cx + l && i > 0 ? p.bodyLight : p.body;
      if (t.kind === "varsity" && i <= 1) c = p.sleeve;
      if (t.kind === "varsity" && i === rows - 1) c = t.trim;
      // An open front shows what's under it.
      if ((t.kind === "overshirt" || t.kind === "jacket" || (t.kind === "varsity" && !t.shirt)) && x === cx + r && i >= 1 && i < rows - 1) c = p.inner!;
      if (t.kind === "shirt" && x === cx + r && i >= 2) c = dark(p.body, 0.08);
      g.set(x, y, c, "body");
    }
  }
  const nx = b.top[0];
  for (let y = b.head[1] + 10; y < b.top[1]; y++) for (let x = nx - 1; x <= nx + 1; x++) g.set(x, y, x === nx - 1 || y === b.head[1] + 10 ? p.skinShade : p.skin, "neck");
  const y0 = b.top[1];
  if (t.kind === "shirt") g.set(nx + 1, y0, light(p.body, 0.5), "body"), g.set(nx - 1, y0, light(p.body, 0.5), "body");
  if (t.kind === "varsity") g.set(nx - 1, y0, t.trim, "body"), g.set(nx + 1, y0, t.shirt ?? p.inner!, "body");
  if (t.kind === "hoodie") for (let x = nx - 3; x <= nx - 1; x++) g.set(x, y0, dark(p.body, 0.2), "body"), g.set(x - 1, y0 + 1, dark(p.body, 0.2), "body");
  if (p.look.necklace) g.set(nx + 1, y0, p.look.necklace, "accessory");
}

// ---------------------------------------------------------------- legs and shoes

function trousersTop(g: FigureGrid, p: Pal, b: Body) {
  const [hx, hy] = b.hip;
  if (b.kind === "side") {
    for (let y = hy; y <= hy + 2; y++) for (let x = hx - 3; x <= hx + 2; x++) g.set(x, y, x === hx - 3 ? p.trousersShade : p.trousers, "legs");
    return;
  }
  for (let y = hy; y <= hy + 2; y++) for (let x = hx - 4; x <= hx + 4; x++) g.set(x, y, x === hx + 4 ? p.trousersShade : p.trousers, "legs");
  if (p.legKind === "skirt") for (let y = hy; y <= hy + 7; y++) for (let x = hx - 4 - Math.floor((y - hy) / 3); x <= hx + 4 + Math.floor((y - hy) / 3); x++) g.set(x, y, x >= hx + 3 ? p.trousersShade : p.trousers, "legs");
}

/** One leg, hip to ankle, and its shoe. */
function leg(g: FigureGrid, p: Pal, b: Body, l: LegJ) {
  const side = b.kind === "side";
  const bare = (y: number) => (p.legKind === "shorts" && y > l.k[1] - 1) || (p.legKind === "skirt" && y > b.hip[1] + 7);
  const cells: { x: number; y: number; c: string }[] = [];
  if (side) {
    // Three wide, lit on the left, the far leg a shade darker; a thigh is a touch thicker than a shin.
    const thighW = p.look.build === "regular" || b.sit ? 4 : 3;
    for (const [a, c, w] of [[l.h, l.k, thighW], [l.k, l.a, 3]] as const)
      for (const q of thick([Math.round(a[0]), Math.round(a[1])], [Math.round(c[0]), Math.round(c[1])], w)) {
        const skin = bare(q.y);
        let col = skin ? (q.d === 1 ? p.skinShade : p.skin) : q.d === -1 ? p.trousersLight : q.d === 1 ? p.trousersShade : p.trousers;
        if (l.far) col = dark(skin ? col : q.d === -1 ? p.trousers : col, 0.28);
        cells.push({ x: q.x, y: q.y, c: col });
      }
  } else {
    // Seen from the front, four wide, lit on the left.
    const pts = [...line([Math.round(l.h[0]), Math.round(l.h[1])], [Math.round(l.k[0]), Math.round(l.k[1])]), ...line([Math.round(l.k[0]), Math.round(l.k[1])], [Math.round(l.a[0]), Math.round(l.a[1])])];
    for (const [x, y] of pts)
      for (let i = -1; i <= 2; i++) {
        const skin = bare(y);
        const col = i === 2 ? (skin ? p.skinShade : p.trousersShade) : i === -1 && p.legKind === "jeans" ? p.trousersLight : skin ? p.skin : p.trousers;
        cells.push({ x: x + i - 1, y, c: col });
      }
  }
  // The near leg side on gets a dark edge where it crosses the far one.
  if (side && !l.far) over(g, cells, "legs", (r) => r === "legFar");
  else for (const q of cells) g.set(q.x, q.y, q.c, l.far ? "legFar" : "legs");
  shoe(g, p, b, l);
}

function shoe(g: FigureGrid, p: Pal, b: Body, l: LegJ) {
  const [ax, ay] = [Math.round(l.a[0]), Math.round(l.a[1])];
  const top = l.far ? dark(p.shoes, 0.2) : p.shoes;
  const sole = l.far ? dark(p.sole, 0.2) : p.sole;
  const region = l.far ? "legFar" : "shoe";
  if (b.kind === "side") {
    // Heel behind the ankle, toe ahead of it.
    const rows =
      l.foot === "heel"
        ? [[ax - 1, ax + 1, top], [ax, ax + 2, top], [ax + 1, ax + 3, sole]]
        : l.foot === "toe"
          ? [[ax, ax + 3, top], [ax - 1, ax + 2, sole]]
          : [[ax - 1, ax + 2, top], [ax - 1, ax + 3, sole]];
    rows.forEach(([x0, x1, c], i) => {
      for (let x = x0 as number; x <= (x1 as number); x++) g.set(x, ay + 1 + i, x === x0 && i === 0 ? dark(c as string, 0.15) : (c as string), region);
    });
    return;
  }
  // From the front or back: as wide as the leg and a little more on the outside.
  const out = ax < b.hip[0] ? -1 : 1;
  const x0 = ax - 2;
  for (let x = x0; x <= x0 + 3; x++) g.set(x, ay + 1, x === x0 + 3 ? p.shoesShade : top, region);
  for (let x = x0 + (out < 0 ? -1 : 0); x <= x0 + 3 + (out > 0 ? 1 : 0); x++) g.set(x, ay + 2, sole, region);
  if (b.kind === "front") g.set(x0 + 1, ay + 1, light(top, 0.25), region);
}

// ---------------------------------------------------------------- arms and hands

/** Hands as patterns, drawn at the wrist pointing down (S skin, s shade). Others are turned. */
const HAND_DOWN: Record<HandShape, string[]> = {
  fist: ["SS", "Ss"],
  open: ["SSs", "SSs", "S.s"],
  grip: ["SS", "ss"],
  flat: ["SSs", "SSs"],
  point: ["SS", "Ss", ".S"],
};

function handAt(g: FigureGrid, p: Pal, a: ArmJ, cells: { x: number; y: number; c: string }[]) {
  if (!a.hand) return;
  const [ex, ey] = a.e;
  const [wx, wy] = [Math.round(a.w[0]), Math.round(a.w[1])];
  const dx = a.w[0] - ex;
  const dy = a.w[1] - ey;
  const skin = a.far ? p.skinShade : p.skin;
  const shade = a.far ? dark(p.skinShade, 0.15) : p.skinShade;
  const pat = HAND_DOWN[a.hand];
  const h = pat.length;
  const w = Math.max(...pat.map((r) => r.length));
  // Which way the forearm points: the hand carries on that way.
  const dir = Math.abs(dy) >= Math.abs(dx) ? (dy >= 0 ? "down" : "up") : dx > 0 ? "right" : "left";
  for (let ry = 0; ry < h; ry++)
    for (let rx = 0; rx < w; rx++) {
      const ch = pat[ry]![rx];
      if (!ch || ch === ".") continue;
      const c = ch === "S" ? skin : shade;
      let x = 0;
      let y = 0;
      if (dir === "down") (x = wx + rx), (y = wy + 1 + ry);
      else if (dir === "up") (x = wx + rx), (y = wy - 1 - ry);
      else if (dir === "right") (x = wx + 1 + ry), (y = wy + rx);
      else (x = wx - 1 - ry), (y = wy + rx);
      cells.push({ x, y, c });
    }
}

function armCells(p: Pal, a: ArmJ): { x: number; y: number; c: string }[] {
  const cells: { x: number; y: number; c: string }[] = [];
  const sleeve = a.far ? p.sleeveShade : p.sleeve;
  const shade = a.far ? dark(p.sleeveShade, 0.12) : p.sleeveShade;
  const s: Pt = [Math.round(a.s[0]), Math.round(a.s[1])];
  const e: Pt = [Math.round(a.e[0]), Math.round(a.e[1])];
  const w: Pt = [Math.round(a.w[0]), Math.round(a.w[1])];
  const upper = thick(s, e, 2);
  const fore = thick(e, w, 2);
  for (const q of upper) cells.push({ x: q.x, y: q.y, c: q.d === 1 ? shade : sleeve });
  const bare = p.bareForearms || p.rolled;
  fore.forEach((q, i) => {
    const first = i < 2;
    let c = q.d === 1 ? shade : sleeve;
    if (bare) c = first && p.rolled ? light(sleeve, 0.3) : q.d === 1 ? (a.far ? dark(p.skinShade, 0.15) : p.skinShade) : a.far ? p.skinShade : p.skin;
    else if (i >= fore.length - 2) c = a.far ? dark(p.cuff, 0.15) : p.cuff;
    cells.push({ x: q.x, y: q.y, c });
  });
  // A tee's sleeve stops above the elbow.
  if (p.bareForearms)
    for (const q of cells.slice(0, upper.length)) {
      const along = Math.hypot(q.x - s[0], q.y - s[1]);
      if (along > 3.2) q.c = q.c === shade ? (a.far ? dark(p.skinShade, 0.15) : p.skinShade) : a.far ? p.skinShade : p.skin;
    }
  handAt({} as FigureGrid, p, a, cells);
  return cells;
}

function drawArm(g: FigureGrid, p: Pal, a: ArmJ, edged: boolean) {
  const cells = armCells(p, a);
  const region = a.far ? "armFar" : "arm";
  if (edged) over(g, cells, region, (r) => r !== region && r !== "hand");
  else for (const q of cells) g.set(q.x, q.y, q.c, region);
}

// ---------------------------------------------------------------- heads and faces

/** The head's skin, row by row from the top: [left, right] from its centre column. */
const HEAD_FRONT: Pt[] = [[-4, 4], [-5, 5], [-5, 5], [-5, 5], [-5, 5], [-5, 5], [-5, 5], [-4, 4], [-3, 3], [-2, 2]];
/** Side on, facing right: the nose is the bump on row 5, the chin on row 8. */
const HEAD_SIDE: Pt[] = [[-3, 3], [-4, 4], [-5, 5], [-5, 5], [-5, 5], [-5, 6], [-5, 5], [-4, 5], [-3, 4], [-2, 3]];

function headSkin(g: FigureGrid, p: Pal, b: Body) {
  const [hx, hy] = b.head;
  const shape = b.kind === "side" ? HEAD_SIDE : HEAD_FRONT;
  shape.forEach(([l, r], dy) => {
    for (let dx = l; dx <= r; dx++) {
      // Lit from the top left: the far edge and the jaw a shade darker.
      const shade = b.kind === "side" ? dy >= 8 && dx >= r - 1 : dx >= r - (dy > 6 ? 1 : 0) && dy > 0;
      g.set(hx + dx, hy + dy, shade || dy === 9 ? p.skinShade : p.skin, "skin");
    }
  });
  if (b.kind === "side") {
    // The ear, just behind the middle.
    g.set(hx - 1, hy + 4, p.skinShade, "ear"), g.set(hx - 1, hy + 5, p.skinShade, "ear"), g.set(hx - 2, hy + 4, p.skinShade, "ear");
    g.set(hx - 1, hy + 4, p.skinDeep, "ear");
    if (p.look.earrings) g.set(hx - 1, hy + 6, p.look.earrings, "accessory");
    return;
  }
  for (const [dx, c] of [[-6, p.skin], [6, p.skinShade]] as const) {
    g.set(hx + dx, hy + 4, c, "ear"), g.set(hx + dx, hy + 5, c, "ear");
    if (b.kind === "front") g.set(hx + dx, hy + 4, p.skinDeep, "ear");
    if (p.look.earrings) g.set(hx + dx, hy + 6, dx < 0 ? p.look.earrings : dark(p.look.earrings, 0.12), "accessory");
  }
}

function faceFront(g: FigureGrid, p: Pal, b: Body) {
  const [hx, hy] = b.head;
  const f = b.face;
  const L = p.look;
  const set = (dx: number, dy: number, c: string, r = "face") => g.set(hx + dx, hy + dy, c, r);
  // Brows, a row above the eyes' lids.
  const by = 2 + (f.brows === "up" ? -1 : 0);
  const heavy = L.browShape === "thick" || L.browShape === "bold";
  for (const s of [-1, 1]) {
    const xs = L.glasses === "round" ? [3, 4] : heavy ? [2, 3, 4] : [2, 3];
    const c = L.glasses === "round" ? mix(L.brow, L.skin, 0.3) : L.brow;
    for (const dx of xs) set(s * dx, by + (f.brows === "down" && dx === xs[0] ? 1 : 0), c, "brow");
    if ((L.browShape === "arched" || L.browShape === "defined") && !L.glasses) set(s * 4, by + 1, mix(L.brow, L.skin, 0.4), "brow");
  }
  // Eyes: two pixels wide, two tall. The lid, then the white and the iris. Behind glasses the
  // frame is the lid: one row of eye and the lens below it.
  const mode = f.eyes ?? "open";
  if (L.glasses) {
    const lens = mix(L.skin, "#ffffff", 0.14);
    for (const s of [-1, 1]) {
      const outer = s * 3;
      const inner = s * 2;
      set(outer, 5, lens, "skin"), set(inner, 5, lens, "skin");
      if (mode === "closed" || mode === "happy" || mode === "down") set(outer, 4, p.lash), set(inner, 4, p.lash);
      else if (mode === "half") set(outer, 4, p.lash), set(inner, 4, p.iris);
      else {
        const irisOuter = mode === "aside" && s > 0;
        set(outer, 4, irisOuter ? p.iris : p.white), set(inner, 4, irisOuter ? p.white : p.iris);
        if (mode === "aside" && s < 0) set(outer, 4, p.white), set(inner, 4, p.iris);
        if (mode === "wide") set(outer, 5, p.white), set(inner, 5, p.white);
      }
    }
  } else for (const s of [-1, 1]) {
    const outer = s * 3;
    const inner = s * 2;
    if (mode === "closed") set(outer, 5, p.lash), set(inner, 5, p.lash);
    else if (mode === "happy") set(outer, 5, p.lash), set(inner, 4, p.lash), set(outer, 4, p.lash);
    else if (mode === "down") set(outer, 5, p.lash), set(inner, 5, p.lash), set(outer, 4, mix(L.skin, p.lash, 0.25)), set(inner, 4, mix(L.skin, p.lash, 0.25));
    else if (mode === "half") set(outer, 4, mix(L.skinShade, p.lash, 0.3)), set(inner, 4, mix(L.skinShade, p.lash, 0.3)), set(outer, 5, p.lash), set(inner, 5, p.iris);
    else {
      set(outer, 4, p.lash), set(inner, 4, p.lash);
      if (mode === "wide") set(outer, 3, p.lash), set(inner, 3, p.lash), set(outer, 4, p.white), set(inner, 4, p.iris);
      // Looking up or to one side moves the iris; otherwise it sits towards the nose.
      const irisAt = mode === "aside" ? (s < 0 ? inner : outer) : mode === "up" ? inner : inner;
      set(outer, 5, irisAt === outer ? p.iris : p.white), set(inner, 5, irisAt === inner ? p.iris : p.white);
      if (mode === "up") set(outer, 4, p.white), set(inner, 4, p.iris), set(outer, 5, p.lash), set(inner, 5, p.lash);
    }
  }
  // The nose: one soft shaded pixel.
  set(0, 6, mix(p.skin, p.skinShade, 0.7), "skin");
  mouthFront(g, p, b);
  if (L.blush) set(-4, 6, L.blush, "skin"), set(4, 6, mix(L.blush, L.skinShade, 0.3), "skin");
  if (L.stubble) {
    const st = mix(L.skin, L.hair, 0.26);
    for (const [dx, dy] of [[-3, 8], [3, 8], [-1, 9], [1, 9]] as const) if (g.get(hx + dx, hy + dy) === "skin") set(dx, dy, st, "skin");
  }
  if (L.moustache) for (const dx of [-1, 0, 1]) set(dx, 6, mix(L.hair, L.skin, 0.3), "skin");
}

function mouthFront(g: FigureGrid, p: Pal, b: Body) {
  const [hx, hy] = b.head;
  const set = (dx: number, dy: number, c: string) => g.set(hx + dx, hy + dy, c, "mouth");
  let m = b.face.mouth ?? "rest";
  if (m === "rest") m = p.look.mouth === "grin" ? "grin" : p.look.mouth === "smile" ? "smile" : "flat";
  const lift = b.face.mouth === undefined || b.face.mouth === "rest" ? p.look.mouth : null;
  switch (m) {
    case "flat":
      set(-1, 7, p.soft), set(0, 7, p.line), set(1, 7, p.soft);
      if (lift === "half" || lift === "smirk") set(1, 7, p.line), set(2, 6, p.soft);
      break;
    case "smile":
      set(-2, 6, p.soft), set(-1, 7, p.line), set(0, 7, p.line), set(1, 7, p.line), set(2, 6, p.soft);
      break;
    case "grin":
      set(-2, 6, p.line), set(-1, 7, p.teeth), set(0, 7, p.teeth), set(1, 7, p.teeth), set(2, 6, p.line);
      set(-2, 7, p.soft), set(2, 7, p.soft), set(0, 8, p.soft);
      break;
    case "laugh":
      set(-2, 6, p.line), set(-1, 7, p.teeth), set(0, 7, p.teeth), set(1, 7, p.teeth), set(2, 6, p.line);
      set(-2, 7, p.line), set(2, 7, p.line), set(-1, 8, p.inside), set(0, 8, p.inside), set(1, 8, p.inside);
      break;
    case "ajar":
      set(-1, 7, p.line), set(0, 7, p.inside), set(1, 7, p.line);
      break;
    case "open":
      set(-1, 7, p.inside), set(0, 7, p.inside), set(1, 7, p.inside);
      set(-1, 8, p.line), set(0, 8, p.inside), set(1, 8, p.line);
      break;
    case "o":
      set(0, 7, p.inside), set(-1, 7, p.line), set(1, 7, p.line), set(0, 8, p.line);
      break;
  }
}

function faceSide(g: FigureGrid, p: Pal, b: Body) {
  const [hx, hy] = b.head;
  const f = b.face;
  const L = p.look;
  const set = (dx: number, dy: number, c: string, r = "face") => g.set(hx + dx, hy + dy, c, r);
  const by = 2 + (f.brows === "up" ? -1 : 0);
  if (L.glasses) set(2, by, L.brow, "brow"), set(3, by, L.brow, "brow");
  else {
    set(3, by, L.brow, "brow"), set(4, by, L.brow, "brow");
    if (L.browShape === "thick" || L.browShape === "bold") set(2, by, L.brow, "brow");
  }
  const mode = f.eyes ?? "open";
  if (L.glasses) {
    set(3, 5, mix(L.skin, "#ffffff", 0.14), "skin"), set(4, 5, mix(L.skin, "#ffffff", 0.14), "skin");
    if (mode === "closed" || mode === "down" || mode === "happy") set(3, 4, p.lash), set(4, 4, p.lash);
    else set(3, 4, p.white), set(4, 4, p.iris);
  } else if (mode === "closed" || mode === "down") set(3, 5, p.lash), set(4, 5, p.lash);
  else if (mode === "happy") set(3, 4, p.lash), set(4, 5, p.lash), set(2, 5, p.lash);
  else if (mode === "half") set(3, 4, mix(L.skinShade, p.lash, 0.3)), set(3, 5, p.lash), set(4, 5, p.iris);
  else {
    set(3, 4, p.lash), set(4, 4, p.lash);
    set(3, 5, p.white), set(4, 5, p.iris);
    if (mode === "up") set(3, 5, p.white), set(4, 4, p.iris), set(3, 4, p.lash);
    if (mode === "wide") set(3, 3, p.lash), set(4, 3, p.lash), set(3, 4, p.white), set(4, 4, p.iris);
  }
  // The nose's underside.
  set(6, 6, p.skinShade, "skin");
  let m = f.mouth ?? "rest";
  if (m === "rest") m = L.mouth === "grin" ? "grin" : L.mouth === "smile" ? "smile" : "flat";
  const S = (dx: number, dy: number, c: string) => set(dx, dy, c, "mouth");
  if (m === "flat") S(4, 7, p.soft), S(5, 7, p.line);
  else if (m === "smile") S(3, 6, p.soft), S(4, 7, p.line), S(5, 7, p.line);
  else if (m === "grin") S(3, 6, p.line), S(4, 7, p.line), S(5, 7, p.teeth);
  else if (m === "laugh") S(3, 6, p.line), S(4, 7, p.teeth), S(5, 7, p.teeth), S(4, 8, p.inside), S(5, 8, p.inside);
  else if (m === "ajar") S(4, 7, p.line), S(5, 7, p.inside);
  else if (m === "open") S(4, 7, p.inside), S(5, 7, p.inside), S(5, 8, p.inside), S(4, 8, p.line);
  else if (m === "o") S(5, 7, p.inside), S(4, 7, p.line);
  if (L.blush) set(3, 6, L.blush, "skin");
  if (L.stubble) {
    const st = mix(L.skin, L.hair, 0.26);
    for (const [dx, dy] of [[2, 9], [4, 8]] as const) if (g.get(hx + dx, hy + dy) === "skin") set(dx, dy, st, "skin");
  }
}

function glassesOn(g: FigureGrid, p: Pal, b: Body) {
  const kind = p.look.glasses;
  if (!kind) return;
  const [hx, hy] = b.head;
  const c = p.frame;
  const set = (dx: number, dy: number) => g.set(hx + dx, hy + dy, c, "glasses");
  if (b.kind === "front") {
    for (const s of [-1, 1]) {
      const xs = [1, 2, 3, 4].map((d) => d * s);
      for (const dx of kind === "rect" ? xs : xs.slice(1, 3)) set(dx, 3), set(dx, 6);
      for (const dy of [4, 5]) set(s, dy), set(s * 4, dy);
      set(s * 5, 4);
    }
    set(0, 4);
  } else if (b.kind === "side") {
    for (const dx of kind === "rect" ? [3, 4, 5] : [4]) set(dx, 3), set(dx, 6);
    if (kind === "round") set(3, 4), set(3, 5), set(5, 4), set(5, 5);
    else set(5, 4), set(5, 5), set(2, 4), set(2, 5);
    for (const dx of [-1, 0, 1]) set(dx, 4);
  } else {
    // From behind, only the arms over the ears.
    set(-6, 3), set(6, 3);
  }
}

// ---------------------------------------------------------------- hair

/**
 * Hair and headwear as small pictures, one per view, laid over the head: 15 columns centred on
 * the head, the top row five above the skin's. H hair, S its shade, L its light, D deeper, f faded
 * into the skin; c, C and K a cap's fabric, its shade and its light, B its strap.
 */
interface HairArt {
  front: string[];
  side: string[];
  back: string[];
  /** Drawn behind the body: long hair down the back, seen past the shoulders. */
  behindFront?: string[];
  behindSide?: string[];
}

const CAST_HAIR: Partial<Record<string, HairArt>> = {
  // Paul: a black cap worn backwards, a little wavy hair under it at the sides and back.
  "cap-back": {
    front: [
      "...............",
      ".....KKccc.....",
      "...KKccccccC...",
      "..KccccccccCC..",
      ".KcccccccccccC.",
      ".ccccccLcccccC.",
      ".CCCCCHHHCCCCC.",
      ".LH.........SH.",
      ".H...........S.",
      "LH...........SS",
      ".L...........S.",
    ],
    side: [
      "...............",
      "......KKcc.....",
      "....KKccccC....",
      "...KcccccccC...",
      "..KccccccccC...",
      "CKcccccccccc...",
      "CCCCCCCCCCCC...",
      "..HLHH.........",
      "..LHS..........",
      ".HHS...........",
      "..LH...........",
      "...H...........",
    ],
    back: [
      "...............",
      ".....KKccc.....",
      "...KKccccccC...",
      "..KccccccccCC..",
      ".KcccccccccccC.",
      ".ccccccccccccC.",
      "KKKKKKKKKKKKKCC",
      "CCCCCCCCCCCCCCC",
      ".HLHHHLHHHLHHS.",
      ".HHLHHHLHHHLHS.",
      "..LHHHHHHHHHS..",
      "...HSHSHSHSH...",
    ],
  },
  // Neil: short, the front swept up into a quiff, short faded sides.
  quiff: {
    front: [
      ".....LHHHS.....",
      "....HLHHHHS....",
      "...HHLHHLHHS...",
      "..HLHHLHHHHSS..",
      "..LHHLHHHHHSS..",
      "..HHHHHHHHHHS..",
      "..HHS.....SHS..",
      "..f.........f..",
    ],
    side: [
      "........LHHS...",
      "......LHHHHHS..",
      "....LHHLHHHHS..",
      "...HHLHHLHHHHS.",
      "..HHHHHHHHHHHS.",
      "..HHHHHHHHHHH..",
      "..HHHHHf.......",
      "..HHHf.........",
      "..Hff..........",
      "..f............",
    ],
    back: [
      ".....HHHHS.....",
      "....HHHHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHSS..",
      "..HHHHHHHHHHS..",
      "..HHHHHHHHHHS..",
      "..HHHHHHHHHHS..",
      "..HHHHHHHHHSS..",
      "..fHHHHHHHHSf..",
      "...ffHHHHHff...",
    ],
  },
  // Aaesha: very long and straight, falling past her shoulders, strands framing her face.
  "long-framing": {
    front: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHH.....HHHS.",
      "LHH.........HSS",
      "LH...........SS",
      "HH...........SS",
      "LH...........SS",
      "HH...........SS",
      "HH...........SS",
      "LHH.........HSS",
      "HHH.........SSS",
      ".HHH.......HSS.",
      "..HHH.....SSS..",
      "..LHH.....HSS..",
      "..HHH.....HSS..",
      "..HHH.....SSS..",
      "..HH.......SS..",
      "..HH.......SS..",
      "...H.......S...",
    ],
    side: [
      "...............",
      "...............",
      ".....LLHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHH....",
      "LHHHHHHHH......",
      "LHHHHHHH.......",
      "HHHHHHH........",
      "LHHHHHS........",
      "HHHHHHS........",
      "HHHHHHS........",
      "HHHHHS.........",
      "HHHHHS.........",
      ".HHHHS.........",
      ".HHHHS.........",
      ".LHHHS.........",
      ".HHHHS.........",
      ".HHHS..........",
      ".HHHS..........",
      ".LHHS..........",
      ".HHHS..........",
      ".HHHS..........",
      ".HHS...........",
      "..HS...........",
      "..HS...........",
      "..S............",
    ],
    back: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      "LHHHHHHHHHHHHSS",
      "LHHHHHHHHHHHHSS",
      "HHHHHHHHHHHHHSS",
      "LHHHHHHHHHHHHSS",
      "HHHHHHHHHHHHHSS",
      "HHHHHHHHHHHHHSS",
      "LHHHHHHHHHHHSSS",
      "HHHHHHHHHHHHSSS",
      ".HHHHHHHHHHHSS.",
      ".HHHHHHHHHHHSS.",
      ".LHHHHHHHHHHSS.",
      ".HHHHHHHHHHHSS.",
      ".HHHHHHHHHHSSS.",
      ".HHHHHHHHHHSSS.",
      ".LHHHHHHHHHHSS.",
      ".HHHHHHHHHHHSS.",
      "..HHHHHHHHHSS..",
      "..HHHHHHHHHSS..",
      "..LHHHHHHHHSS..",
      "...HHHHHHHSS...",
      "...H.HHH.HS.S..",
    ],
    behindFront: [
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
    ],
  },
  // Caitlin: long and wavy, dark brown turning purple from about chin height.
  "long-wavy": {
    front: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHHH..HHHHHS.",
      "LHH.........HSS",
      "LH...........SS",
      ".HH.........SS.",
      "LH...........S.",
      "HH...........SS",
      ".HH.........SS.",
      "LHH.........HSS",
      "HHH.........SSS",
      ".HHH.......HSS.",
      "..LHH.....HSS..",
      ".HHH.......SHS.",
      "..LHH.....HSS..",
      "...HH.....SS...",
      "...L.......S...",
    ],
    side: [
      "...............",
      "...............",
      ".....LLHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHH...",
      "LHHHHHHHHH.....",
      "LHHHHHHHH......",
      ".HHHHHHH.......",
      "LHHHHHHS.......",
      "HHHHHHHS.......",
      ".HHHHHHS.......",
      "LHHHHHS........",
      "HHHHHHS........",
      "LHHHHHS........",
      ".HHHHS.........",
      "LHHHHS.........",
      "HHHHS..........",
      ".LHHS..........",
      "HHHS...........",
      ".H.S...........",
    ],
    back: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LHHHHHHHS...",
      "..LHHHHHHHHHS..",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      "LHHHHHHHHHHHHSS",
      "LHHHHHHHHHHHHSS",
      ".HHHHHHHHHHHHS.",
      "LHHHHHHHHHHHHSS",
      "HHHHHHHHHHHHHSS",
      ".HHHHHHHHHHHHS.",
      "LHHHHHHHHHHHHSS",
      "HHHHHHHHHHHHSSS",
      "LHHHHHHHHHHHSSS",
      ".LHHHHHHHHHHSS.",
      "LHHHHHHHHHHHSSS",
      ".HHHHHHHHHHSSS.",
      "..HHHHHHHHHSS..",
      "..L.HHH.HHS.S..",
    ],
    behindFront: [
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
    ],
  },
  // Riya: long, straight and glossy, falling behind her shoulders.
  "long-behind": {
    front: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LLHHHHHHS...",
      "..LLHHHHHHHHS..",
      ".LLHHHHHHHHHHS.",
      ".LHHHH...HHHHS.",
      ".LH.........SS.",
      "LH...........S.",
      "LH...........SS",
      "LH...........SS",
      "HH...........SS",
      "LH...........SS",
      "HH...........SS",
      "LH...........SS",
      ".H...........S.",
    ],
    side: [
      "...............",
      "...............",
      ".....LLHHHS....",
      "...LLHHHHHHS...",
      "..LLHHHHHHHHS..",
      ".LLHHHHHHHHHHS.",
      ".LHHHHHHHHHH...",
      "LLHHHHHHH......",
      "LHHHHHHH.......",
      "LHHHHHH........",
      "LHHHHHS........",
      "LHHHHHS........",
      "LHHHHHS........",
      "LHHHHS.........",
      "LHHHHS.........",
      ".LHHHS.........",
      ".LHHHS.........",
      ".LHHHS.........",
      ".LHHHS.........",
      ".LHHS..........",
      ".LHHS..........",
      ".LHHS..........",
      ".LHHS..........",
      "..HS...........",
    ],
    back: [
      "...............",
      "...............",
      "....LLHHHHS....",
      "...LLHHHHHHS...",
      "..LLHHHHHHHHS..",
      ".LLHHHHHHHHHHS.",
      ".LLHHHHHHHHHHS.",
      ".LLHHHHHHHHHHS.",
      "LLHHHHHHHHHHHSS",
      "LLHHHHHHHHHHHSS",
      "LLHHHHHHHHHHHSS",
      "LLHHHHHHHHHHHSS",
      "LLHHHHHHHHHHHSS",
      "LLHHHHHHHHHHHSS",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      ".LHHHHHHHHHHHS.",
      "..LHHHHHHHHHS..",
      "..LHHHHHHHHHS..",
      "..LHHHHHHHHHS..",
      "...HHHHHHHHS...",
    ],
    behindFront: [
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      "...............",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      ".SSSSSSSSSSSSS.",
      "..SSSSSSSSSSS..",
    ],
  },
  // Yahya: tight curls on top, a few falling onto his forehead, short faded sides.
  "curls-fringe": {
    front: [
      "...............",
      "...HH.HHH.HH...",
      "..HLSHLHSHLSS..",
      "..LSHLSHLSHSS..",
      "..HHLSHLSHLHS..",
      "..LHHHHHHHHHS..",
      "..HHHSHLHSHHS..",
      "..f..H..H.S.f..",
    ],
    side: [
      "...............",
      "....HH.HHH.H...",
      "...HLSHLSHLSH..",
      "..HSHLSHLSHLSS.",
      "..LHLSHLSHLSHS.",
      "..HSHHHHHHHHHH.",
      "..HHLSHf.H.S...",
      "..LSHf.........",
      "..Hf...........",
      "...............",
    ],
    back: [
      "...............",
      "...HH.HHH.HH...",
      "..HLSHLHSHLSS..",
      "..LSHLSHLSHSS..",
      "..HHLSHLSHLHS..",
      "..LSHLSHLSHLS..",
      "..HLSHLSHLSHS..",
      "..HHHSHLSHHSS..",
      "..fHHHHHHHHSf..",
      "...ffHHHHHff...",
    ],
  },
};

function hairPal(p: Pal, x: number, y: number, headY: number): Record<string, string> {
  const fabric = p.fabric;
  return {
    H: hairAt(p, x, y, headY, "base"),
    S: hairAt(p, x, y, headY, "shade"),
    L: hairAt(p, x, y, headY, "light"),
    D: dark(hairAt(p, x, y, headY, "shade"), 0.3),
    f: mix(p.hair, p.skin, 0.45),
    c: fabric,
    C: mix(fabric, "#000000", 0.45),
    K: mix(fabric, "#ffffff", 0.16),
    B: mix(fabric, "#ffffff", 0.32),
    k: p.skin,
    z: mix(p.hair, p.skin, 0.28),
    Z: mix(p.hair, p.skin, 0.5),
    y: mix(p.hair, p.skin, 0.55),
  };
}

/** Lay a picture over the head, row by row (the colours depend on the row, for coloured ends). */
function hairStamp(g: FigureGrid, p: Pal, b: Body, rows: string[] | undefined, region: string) {
  if (!rows) return;
  const [hx, hy] = b.head;
  rows.forEach((row, ry) => {
    const y = hy - 5 + ry;
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const half = (row.length - 1) / 2;
      const c = hairPal(p, hx - half + rx, y, hy)[ch];
      if (!c) return;
      const r = ch === "c" || ch === "C" || ch === "K" || ch === "B" ? "cap" : ch === "k" ? "skin" : region;
      g.set(hx - half + rx, y, c, r);
    });
  });
}

// ---------------------------------------------------------------- poses

/** Where a hand goes, relative to its shoulder, and which way the elbow bends. */
export interface Reach {
  x: number;
  y: number;
  hand?: HandShape | null;
  /** The elbow points out (away from the body), in, back, forward, up or down; or exactly here, relative to the shoulder. */
  elbow?: "out" | "in" | "back" | "fwd" | "up" | "down" | Pt;
  /** In front of the head and body (reaching across), not beside them. */
  front?: boolean;
}

/** Where a foot goes, relative to where it stands: x along, y up (negative is lifted). */
export interface Step {
  x?: number;
  y?: number;
  foot?: LegJ["foot"];
  /** The knee, relative to the hip, when it shouldn't be worked out (sitting cross-legged). */
  knee?: Pt;
}

/** A figure's pose on one frame. Every number is in grid pixels. */
export interface FigurePose {
  /** A sideways sway of the whole figure (never up or down). */
  x?: number;
  /** Seated on a chair: hips at the seat, knees forward. */
  sit?: boolean;
  /** The upper body over the hips: forward in a side view, to the viewer's right from the front. */
  lean?: number;
  /** Shoulders dropped, a slump over a desk or asleep. */
  slump?: number;
  /** The head's offset over the neck. */
  head?: Pt;
  /** Hands. `a` is the viewer's left from the front or back and the near hand side on; `b` the other. */
  a?: Reach;
  b?: Reach;
  /** Feet, the same way round. */
  fa?: Step;
  fb?: Step;
  face?: Face;
}

const SIT_DROP = 7;

/** A hand hanging at the side. */
export const HANG: Reach = { x: 0, y: 12, hand: "fist", elbow: "back" };

type Bend = "out" | "in" | "back" | "fwd" | "up" | "down";
const DIRS: Record<Bend, Pt> = { out: [0, 0], in: [0, 0], back: [-1, 0], fwd: [1, 0], up: [0, -1], down: [0, 1] };

function elbowOf(s: Pt, w: Pt, r: Reach, outward: number): Pt {
  if (Array.isArray(r.elbow)) return [s[0] + r.elbow[0], s[1] + r.elbow[1]];
  // A reach within a pixel or so of the arm's length stays straight: a hand swinging towards you
  // from the front just looks a little shorter.
  if (Math.hypot(w[0] - s[0], w[1] - s[1]) >= UPPER_ARM + FOREARM - 1.6) return [(s[0] + w[0]) / 2, (s[1] + w[1]) / 2];
  const named = (r.elbow ?? "down") as Bend;
  const pref: Pt = named === "out" ? [outward, 0.2] : named === "in" ? [-outward, 0.2] : DIRS[named];
  const a = bend(s, w, UPPER_ARM, FOREARM, 1);
  const b = bend(s, w, UPPER_ARM, FOREARM, -1);
  const mid: Pt = [(s[0] + w[0]) / 2, (s[1] + w[1]) / 2];
  const score = (e: Pt) => (e[0] - mid[0]) * pref[0] + (e[1] - mid[1]) * pref[1];
  return score(a) >= score(b) ? a : b;
}

function resolve(pose: FigurePose, kind: Kind): Body {
  const sx = pose.x ?? 0;
  const drop = pose.sit ? SIT_DROP : 0;
  const slump = pose.slump ?? 0;
  const lean = pose.lean ?? 0;
  const hip: Pt = [MID + sx, HIP_Y + drop];
  const top: Pt = [MID + sx + lean, TOP_Y + drop + slump];
  const hd = pose.head ?? [0, 0];
  const head: Pt = [top[0] + (kind === "side" ? 1 : 0) + hd[0], HEAD_Y + drop + slump + hd[1]];
  const arms: ArmJ[] = [];
  const legs: LegJ[] = [];
  const reaches = [pose.a ?? HANG, pose.b ?? HANG];
  reaches.forEach((r, i) => {
    let s: Pt;
    let outward: number;
    if (kind === "side") (s = [top[0] - 1, top[1] + 1]), (outward = 1);
    else (s = [i === 0 ? top[0] - 7 : top[0] + 6, top[1] + 1]), (outward = i === 0 ? -1 : 1);
    // From the back, the viewer's left is the figure's left: the same drawing, the same sides.
    let w: Pt = [s[0] + r.x, s[1] + r.y];
    const d = Math.hypot(r.x, r.y);
    const max = UPPER_ARM + FOREARM;
    if (d > max) w = [s[0] + (r.x * max) / d, s[1] + (r.y * max) / d];
    const e = elbowOf(s, w, r, outward);
    arms.push({ s, e, w, hand: r.hand === undefined ? "fist" : r.hand, front: Boolean(r.front), far: kind === "side" && i === 1 });
  });
  const steps = [pose.fa ?? {}, pose.fb ?? {}];
  steps.forEach((st, i) => {
    const far = kind === "side" && i === 1;
    let h: Pt;
    let a: Pt;
    let k: Pt;
    if (kind === "side") {
      h = [hip[0] - (far ? 1 : 0), hip[1] + 1];
      if (pose.sit) {
        k = [h[0] + 6, h[1]];
        a = [k[0] + (st.x ?? 0), ANKLE_Y + (st.y ?? 0)];
        if (st.knee) k = [h[0] + st.knee[0], h[1] + st.knee[1]];
      } else {
        a = [MID + sx - (far ? 1 : 0) + (st.x ?? 0), ANKLE_Y + (st.y ?? 0)];
        k = st.knee ? [h[0] + st.knee[0], h[1] + st.knee[1]] : bend(h, a, THIGH, SHIN, 1);
        if (!st.knee) {
          const k2 = bend(h, a, THIGH, SHIN, -1);
          if (k2[0] > k[0]) k = k2;
        }
      }
    } else {
      const lx = i === 0 ? MID - 2 : MID + 3;
      h = [lx + sx, hip[1] + 2];
      a = [lx + sx + (st.x ?? 0), ANKLE_Y + (st.y ?? 0)];
      k = st.knee ? [h[0] + st.knee[0], h[1] + st.knee[1]] : [(h[0] + a[0]) / 2, (h[1] + a[1]) / 2];
    }
    legs.push({ h, k, a, far, foot: st.foot ?? "flat" });
  });
  return { kind, hip, top, head, arms, legs, sit: Boolean(pose.sit), face: pose.face ?? {} };
}

// ---------------------------------------------------------------- the outline

function outline(g: FigureGrid) {
  const filled = (x: number, y: number) => g.get(x, y) !== null;
  const add: Pt[] = [];
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++) if (!filled(x, y) && ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).some(([dx, dy]) => filled(x + dx, y + dy) && g.get(x + dx, y + dy) !== "fx")) add.push([x, y]);
  for (const [x, y] of add) g.set(x, y, OUTLINE, "outline");
  // A far arm or leg, behind the head or body, gets a dark edge where it meets them.
  const nearParts = new Set(["skin", "face", "mouth", "brow", "ear", "glasses", "hair", "cap", "neck"]);
  const edge: Pt[] = [];
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++)
      if (g.get(x, y) === "armFar" && ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).some(([dx, dy]) => nearParts.has(g.get(x + dx, y + dy) ?? ""))) edge.push([x, y]);
  for (const [x, y] of edge) g.set(x, y, mix(g.colour(x, y)!, OUTLINE, 0.75), "edge");
  // Skin meeting hair or the outline gets a touch of shadow, as in the busts.
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++) {
      const r = g.get(x, y);
      if (r !== "skin") continue;
      const n = [g.get(x - 1, y), g.get(x + 1, y), g.get(x, y - 1)];
      if (n.some((v) => v === "hair" || v === "cap")) g.c[y * FW + x] = mix(g.c[y * FW + x]!, "#3a2016", 0.3);
    }
}

// ---------------------------------------------------------------- drawing a figure

/** What an action's props draw with: the grid, the person's colours and where their hands are. */
export interface PropCtx {
  g: FigureGrid;
  look: PersonLook;
  frame: number;
  kind: Kind;
  /** The hands' positions (the wrist), `a` then `b`. */
  hands: Pt[];
  head: Pt;
  hip: Pt;
  top: Pt;
  sit: boolean;
  /** Facing left: the figure is drawn facing right and mirrored at the end. */
  flip: boolean;
}

function drawBody(g: FigureGrid, p: Pal, b: Body, held: () => void = () => {}) {
  const art = CAST_HAIR[p.look.hairStyle] ?? genericHair(p.look);
  // Arms come last in every view, after anything held, so a hand always grips what it holds.
  // An arm reaching across the body or face gets a dark edge so it reads against them.
  const arms = () => {
    for (const a of b.arms) if (!a.front && !a.far) drawArm(g, p, a, false);
    for (const a of b.arms) if (a.front) drawArm(g, p, a, true);
  };
  if (b.kind === "front") {
    hairStamp(g, p, b, art.behindFront, "hairBack");
    for (const l of b.legs) leg(g, p, b, l);
    trousersTop(g, p, b);
    torsoFront(g, p, b);
    headSkin(g, p, b);
    faceFront(g, p, b);
    hairStamp(g, p, b, art.front, "hair");
    glassesOn(g, p, b);
    accessoryOn(g, p, b);
    held();
    arms();
  } else if (b.kind === "side") {
    const [near, far] = b.arms as [ArmJ, ArmJ];
    if (!far.front) drawArm(g, p, far, false);
    leg(g, p, b, b.legs[1]!);
    hairStamp(g, p, b, art.behindSide, "hairBack");
    trousersTop(g, p, b);
    leg(g, p, b, b.legs[0]!);
    torsoSide(g, p, b);
    headSkin(g, p, b);
    faceSide(g, p, b);
    hairStamp(g, p, b, art.side, "hair");
    glassesOn(g, p, b);
    accessoryOn(g, p, b);
    held();
    if (far.front) drawArm(g, p, far, true);
    drawArm(g, p, near, true);
  } else {
    // From behind, whatever's held in front of them, and the hands holding it, are behind the body.
    const ahead = (a: ArmJ) => a.front || (Math.abs(a.w[0] - b.top[0]) <= 5 && a.w[1] > b.top[1] + 2);
    held();
    for (const a of b.arms) if (ahead(a)) drawArm(g, p, a, false);
    for (const l of b.legs) leg(g, p, b, l);
    trousersTop(g, p, b);
    torsoFront(g, p, b);
    headSkin(g, p, b);
    hairStamp(g, p, b, art.back, "hair");
    glassesOn(g, p, b);
    accessoryOn(g, p, b);
    for (const a of b.arms) if (!ahead(a)) drawArm(g, p, a, false);
  }
}

// ---------------------------------------------------------------- the learner's hair, and accessories

/** A hair picture being built: 19 columns (dx -9 to 9), rows from five above the skin's top. */
class Pic {
  readonly rows: string[][] = Array.from({ length: 32 }, () => Array<string>(19).fill("."));
  set(dx: number, dy: number, ch: string) {
    const r = this.rows[dy + 5];
    if (r && dx >= -9 && dx <= 9) r[dx + 9] = ch;
  }
  get(dx: number, dy: number): string {
    return this.rows[dy + 5]?.[dx + 9] ?? ".";
  }
  run(dy: number, x0: number, x1: number, ch = "H") {
    for (let x = x0; x <= x1; x++) this.set(x, dy, ch);
  }
  /** A run on both sides of the face, mirrored. */
  both(dy: number, x0: number, x1: number, ch = "H") {
    this.run(dy, x0, x1, ch), this.run(dy, -x1, -x0, ch);
  }
  /** Lit on the left and the top, shaded on the right and along the bottom edge. */
  shade(ch = "H", lo = "S", hi = "L") {
    for (let dy = -5; dy <= 26; dy++)
      for (let dx = -9; dx <= 9; dx++) {
        if (this.get(dx, dy) !== ch) continue;
        const right = this.get(dx + 1, dy) === ".";
        const below = this.get(dx, dy + 1) === ".";
        const left = this.get(dx - 1, dy) === ".";
        const above = this.get(dx, dy - 1) === ".";
        if ((right && dx > -3) || (dx >= 4 && this.get(dx + 2, dy) === ".") || (below && dx > 0)) this.set(dx, dy, lo);
        else if ((left || above) && dx < 0 && dy < 6) this.set(dx, dy, hi);
      }
  }
  /** A pattern over the hair: curls, coils, braids, locs. */
  texture(kind: "curly" | "coily" | "braids" | "locs" | "wavy" | "straight") {
    for (let dy = -5; dy <= 26; dy++)
      for (let dx = -9; dx <= 9; dx++) {
        const c = this.get(dx, dy);
        if (c !== "H" && c !== "S") continue;
        const k = (a: number, m: number) => ((a % m) + m) % m;
        if (kind === "curly") {
          if (c === "H" && k(dx + dy * 2, 5) === 0) this.set(dx, dy, "L");
          else if (k(dx * 2 + dy, 7) === 0) this.set(dx, dy, c === "S" ? "D" : "S");
        } else if (kind === "coily") {
          if (c === "H" && k(dx * 3 + dy * 2, 5) === 0) this.set(dx, dy, "L");
          else if (k(dx + dy * 3, 6) === 0) this.set(dx, dy, c === "S" ? "D" : "S");
        } else if (kind === "braids" && dy > 1) {
          // Strands two wide with a dark parting between, a bead of light every other row.
          const col = k(dx, 3);
          if (col === 2) this.set(dx, dy, c === "S" ? "D" : "S");
          else if (col === 0 && k(dy, 2) === 0) this.set(dx, dy, c === "S" ? "H" : "L");
        } else if (kind === "locs" && dy > 1 && k(dx, 2) === 0) this.set(dx, dy, c === "S" ? "D" : "S");
        else if (kind === "straight" && dy > 1 && dx < 0 && k(dx, 3) === 0 && dy % 5 !== 0) this.set(dx, dy, "L");
      }
  }
  done(): string[] {
    const out = this.rows.map((r) => r.join(""));
    while (out.length && /^\.+$/.test(out[out.length - 1]!)) out.pop();
    return out;
  }
}

type Build = (p: Pic, view: Kind) => void;

/** The crown over the skull, front or back: from row `top`, widening to `hw` either side. */
function crownFB(p: Pic, top: number, hw: number, to = 0, ch = "H") {
  const widths = [3, 5, 6, 6, 6, 6, 6].map((w, i) => Math.min(hw, i === 0 ? Math.min(w, hw - 1) : w + Math.max(0, hw - 6)));
  for (let dy = top; dy <= to; dy++) p.run(dy, -widths[Math.min(widths.length - 1, dy - top)]!, widths[Math.min(widths.length - 1, dy - top)]!, ch);
}
/** The crown side on, facing right: over the top, the back of the head down to `nape`. */
function crownSide(p: Pic, top: number, front: number, nape: number, back = -6, ch = "H") {
  p.run(top, -3, Math.min(front, 2), ch);
  p.run(top + 1, -5, Math.min(front, 4), ch);
  for (let dy = top + 2; dy <= 0; dy++) p.run(dy, back, front, ch);
  // The front hairline, then the back of the head down past the ear.
  p.run(1, back, Math.min(front, 3), ch);
  for (let dy = 2; dy <= nape; dy++) p.run(dy, back, dy <= 3 ? 0 : -2, ch);
}

const BUILDS: Partial<Record<string, Build>> = {
  "short-straight": (p, v) => {
    if (v === "side") return crownSide(p, -3, 5, 6), p.run(1, 1, 4), p.set(4, 2, "H");
    crownFB(p, -3, 6);
    if (v === "front") p.run(1, -6, 1), p.run(1, 5, 6), p.both(2, 5, 6), p.set(2, -4, "H"), p.both(3, 6, 6, "f");
    else for (let dy = 1; dy <= 7; dy++) p.run(dy, -6, 6, dy === 7 ? "f" : "H");
  },
  "short-curly": (p, v) => {
    if (v === "side") return crownSide(p, -3, 5, 5), [-3, -1, 1].forEach((x) => p.set(x, -4, "H")), p.set(4, 1, "H"), p.set(3, 2, "H");
    crownFB(p, -3, 6);
    [-4, -2, 0, 2, 4].forEach((x) => p.set(x, -4, "H"));
    if (v === "front") p.run(1, -6, 6), [-4, -1, 2].forEach((x) => p.run(2, x, x + 1)), p.both(2, 5, 6), p.both(3, 6, 6, "f");
    else for (let dy = 1; dy <= 6; dy++) p.run(dy, -6, 6, dy === 6 ? "f" : "H");
  },
  buzz: (p, v) => {
    if (v === "side") {
      p.run(-1, -4, 3, "z"), p.run(0, -5, 4, "z"), p.run(1, -5, 2, "z");
      for (let dy = 2; dy <= 5; dy++) p.run(dy, -5, dy <= 3 ? -1 : -2, "z");
      return;
    }
    p.run(-1, -3, 3, "z"), p.run(0, -5, 5, "z");
    if (v === "front") p.both(1, 5, 5, "z"), p.both(2, 5, 5, "Z");
    else for (let dy = 1; dy <= 6; dy++) p.run(dy, -6, 6, dy >= 5 ? "Z" : "z");
  },
  shaved: (p, v) => {
    if (v === "side") return p.run(0, -4, 3, "y"), p.run(1, -5, 1, "y"), p.run(2, -5, -1, "y"), p.run(3, -5, -2, "y");
    p.run(0, -4, 4, "y");
    if (v === "back") for (let dy = 1; dy <= 5; dy++) p.run(dy, -6, 6, "y");
  },
  "wavy-medium": (p, v) => {
    const wave = (dy: number) => ((dy >> 1) % 2 === 0 ? 7 : 8);
    if (v === "side") {
      crownSide(p, -3, 5, 9, -7);
      for (let dy = 2; dy <= 11; dy++) p.run(dy, -wave(dy), dy <= 3 ? 0 : -2);
      return p.run(1, 2, 4), p.set(4, 2, "H");
    }
    crownFB(p, -3, 7);
    if (v === "front") {
      p.run(1, -7, -2), p.run(1, 2, 7);
      for (let dy = 2; dy <= 11; dy++) p.both(dy, dy <= 9 ? 6 : 5, wave(dy));
    } else for (let dy = 1; dy <= 11; dy++) p.run(dy, -wave(dy), wave(dy));
  },
  "curly-medium": (p, v) => {
    if (v === "side") {
      crownSide(p, -4, 6, 8, -8);
      for (let dy = -3; dy <= 0; dy++) p.run(dy, -8, 6);
      [-6, -3, 0, 3].forEach((x) => p.set(x, -5, "H"));
      return p.run(1, 2, 5), p.run(2, 3, 4);
    }
    crownFB(p, -4, 8);
    [-6, -3, 0, 3, 6].forEach((x) => p.run(-5, x - 1, x));
    if (v === "front") {
      p.run(1, -8, 8), [-4, -1, 2].forEach((x) => p.run(2, x, x + 1));
      for (let dy = 2; dy <= 9; dy++) p.both(dy, 6, dy % 3 === 0 ? 9 : 8);
    } else for (let dy = 1; dy <= 9; dy++) p.run(dy, -8, 8);
  },
  afro: (p, v) => {
    const hw = [4, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 7, 6];
    for (let i = 0; i < hw.length; i++) {
      const dy = i - 5;
      if (v === "side") {
        const back = -hw[i]! - 1;
        const front = dy <= 0 ? Math.min(6, hw[i]! - 2) : dy <= 1 ? 3 : -1;
        if (front >= back) p.run(dy, back, front);
      } else if (v === "front" && dy >= 1) p.both(dy, 6, hw[i]!);
      else p.run(dy, -hw[i]!, hw[i]!);
    }
  },
  braids: (p, v) => {
    if (v === "side") {
      crownSide(p, -3, 5, 8);
      for (let dy = 2; dy <= 19; dy++) p.run(dy, dy > 10 ? -6 : -7, dy <= 3 ? 0 : dy <= 10 ? -2 : -3);
      return p.run(1, 2, 4);
    }
    crownFB(p, -3, 6);
    if (v === "front") {
      p.run(1, -6, -1), p.run(1, 1, 6);
      for (let dy = 2; dy <= 18; dy++) p.both(dy, dy <= 10 ? 6 : 5, dy <= 10 ? 7 : 6);
    } else for (let dy = 1; dy <= 19; dy++) p.run(dy, dy > 10 ? -6 : -7, dy > 10 ? 6 : 7);
  },
  locs: (p, v) => {
    if (v === "side") {
      crownSide(p, -3, 5, 8, -7);
      for (let dy = 2; dy <= 17; dy++) p.run(dy, -7, dy <= 3 ? 0 : dy <= 10 ? -2 : -3);
      return p.run(1, 2, 4), p.set(4, 2, "H");
    }
    crownFB(p, -3, 7);
    if (v === "front") {
      p.run(1, -7, -1), p.run(1, 1, 7);
      for (let dy = 2; dy <= 16; dy++) p.both(dy, 6, 8);
    } else for (let dy = 1; dy <= 17; dy++) p.run(dy, -8, 8);
  },
  bun: (p, v) => {
    if (v === "side") return crownSide(p, -2, 5, 5), p.run(-5, -4, -1), p.run(-4, -5, 0), p.run(-3, -5, 0);
    crownFB(p, -2, 6);
    p.run(-5, -2, 2), p.run(-4, -3, 3), p.run(-3, -3, 3);
    if (v === "front") p.both(1, 5, 6), p.both(2, 6, 6), p.both(3, 6, 6, "f");
    else for (let dy = 1; dy <= 6; dy++) p.run(dy, -6, 6, dy === 6 ? "f" : "H");
  },
  ponytail: (p, v) => {
    if (v === "side") {
      crownSide(p, -3, 5, 5);
      p.set(-7, 1, "H");
      for (let dy = 2; dy <= 13; dy++) p.run(dy, -8, -7);
      return;
    }
    crownFB(p, -3, 6);
    if (v === "front") p.both(1, 5, 6), p.both(2, 6, 6), p.both(3, 6, 6, "f");
    else {
      for (let dy = 1; dy <= 5; dy++) p.run(dy, -6, 6);
      p.run(3, -1, 1, "c");
      for (let dy = 4; dy <= 14; dy++) p.run(dy, -1, 1);
    }
  },
  bob: (p, v) => {
    if (v === "side") {
      crownSide(p, -3, 5, 8, -7);
      for (let dy = 2; dy <= 8; dy++) p.run(dy, -7, dy <= 3 ? 0 : -1);
      return p.run(1, 1, 5), p.run(2, 3, 4), p.run(9, -6, -2);
    }
    crownFB(p, -3, 7);
    if (v === "front") {
      p.run(1, -7, 7), p.run(2, -7, -3), p.run(2, 3, 7);
      for (let dy = 3; dy <= 8; dy++) p.both(dy, 6, 7);
      p.both(9, 5, 6);
    } else for (let dy = 1; dy <= 9; dy++) p.run(dy, dy === 9 ? -6 : -7, dy === 9 ? 6 : 7);
  },
  hijab: (p, v) => {
    if (v === "side") {
      p.run(-3, -3, 2, "c"), p.run(-2, -5, 4, "c");
      for (let dy = -1; dy <= 10; dy++) p.run(dy, dy > 8 ? -6 : -7, dy <= 0 ? 5 : dy <= 9 ? 2 : 4, "c");
      for (let dy = 11; dy <= 14; dy++) p.run(dy, -7, 3, "c");
      return;
    }
    p.run(-3, -3, 3, "c"), p.run(-2, -5, 5, "c"), p.run(-1, -6, 6, "c"), p.run(0, -6, 6, "c"), p.run(1, -6, 6, "c");
    for (let dy = 2; dy <= 9; dy++) v === "front" ? p.both(dy, 5, 7, "c") : p.run(dy, -7, 7, "c");
    p.run(10, -6, 6, "c");
    for (let dy = 11; dy <= 14; dy++) p.run(dy, -8, 8, "c");
  },
  turban: (p, v) => {
    if (v === "side") {
      p.run(-4, -3, 2, "c"), p.run(-3, -5, 4, "c");
      for (let dy = -2; dy <= 1; dy++) p.run(dy, -6, dy === 1 ? 3 : 5, "c");
      p.run(2, -6, -2, "c"), p.run(3, -5, -3, "c");
      p.set(1, 2, "H"), p.set(1, 3, "H");
      return;
    }
    p.run(-4, -3, 3, "c"), p.run(-3, -6, 6, "c");
    for (let dy = -2; dy <= 0; dy++) p.run(dy, -6, 6, "c");
    p.run(1, -5, 5, "c");
    if (v === "front") p.both(2, 6, 6), p.both(3, 6, 6);
    else for (let dy = 2; dy <= 5; dy++) p.run(dy, -5, 5, dy <= 3 ? "c" : "H");
  },
  beanie: (p, v) => {
    if (v === "side") {
      p.run(-5, -1, 0, "c"), p.run(-4, -3, 2, "c"), p.run(-3, -5, 4, "c");
      for (let dy = -2; dy <= 1; dy++) p.run(dy, -6, 5, dy === 1 ? "C" : "c");
      for (let dy = 2; dy <= 5; dy++) p.run(dy, -6, -3);
      return;
    }
    p.run(-5, -1, 1, "c"), p.run(-4, -3, 3, "c"), p.run(-3, -5, 5, "c");
    for (let dy = -2; dy <= 1; dy++) p.run(dy, -6, 6, dy === 1 ? "C" : "c");
    if (v === "front") p.both(2, 6, 6), p.both(3, 6, 6), p.both(4, 6, 6, "f");
    else for (let dy = 2; dy <= 6; dy++) p.run(dy, -6, 6, dy === 6 ? "f" : "H");
  },
};

const TEXTURE: Partial<Record<string, Parameters<Pic["texture"]>[0]>> = {
  "short-curly": "curly",
  "curly-medium": "curly",
  afro: "coily",
  braids: "braids",
  locs: "locs",
  "short-straight": "straight",
  bob: "straight",
};

const GENERIC = new Map<string, HairArt>();

/** Hair for a look the cast pictures don't cover (a learner's avatar), built from its style. */
function genericHair(look: PersonLook): HairArt {
  const style = look.hairStyle;
  let art = GENERIC.get(style);
  if (art) return art;
  const build = BUILDS[style] ?? BUILDS["short-straight"]!;
  const view = (v: Kind) => {
    const p = new Pic();
    build(p, v);
    p.shade();
    const t = TEXTURE[style];
    if (t) p.texture(t);
    // Fabric: its own shade and light.
    for (let dy = -5; dy <= 26; dy++)
      for (let dx = -9; dx <= 9; dx++)
        if (p.get(dx, dy) === "c") {
          if (p.get(dx + 1, dy) === "." || p.get(dx, dy + 1) === "." || dx >= 5) p.set(dx, dy, "C");
          else if ((p.get(dx - 1, dy) === "." || p.get(dx, dy - 1) === ".") && dx < 0) p.set(dx, dy, "K");
        }
    return p.done();
  };
  art = { front: view("front"), side: view("side"), back: view("back") };
  GENERIC.set(style, art);
  return art;
}

function accessoryOn(g: FigureGrid, p: Pal, b: Body) {
  const a = p.look.accessory ?? "none";
  if (a === "none") return;
  const [hx, hy] = b.head;
  const set = (dx: number, dy: number, c: string, r = "accessory") => g.set(hx + dx, hy + dy, c, r);
  const fabric = p.look.fabric ?? "#3b6fd8";
  const shade = mix(fabric, "#000000", 0.3);
  if (a === "headphones") {
    const band = "#24262c";
    // The band sits on top of the hair, however high that is.
    const art = CAST_HAIR[p.look.hairStyle] ?? genericHair(p.look);
    const rows = b.kind === "side" ? art.side : b.kind === "back" ? art.back : art.front;
    const first = rows.findIndex((r) => /[^.]/.test(r));
    const top = Math.min(-1, first < 0 ? -1 : first - 5);
    if (b.kind === "side") {
      for (let dy = top + 1; dy <= 2; dy++) set(-1, dy, band);
      set(-1, top, band), set(0, top, band);
      for (let dy = 3; dy <= 6; dy++) for (let dx = -2; dx <= 0; dx++) set(dx, dy, dy === 3 || dy === 6 ? band : dx === -2 ? shade : fabric);
      return;
    }
    const arc: Pt[] = [[-6, 1], [-6, 0], [-6, -1], [-5, top + 2], [-4, top + 1], [-3, top + 1], [-2, top], [-1, top], [0, top], [1, top], [2, top], [3, top + 1], [4, top + 1], [5, top + 2], [6, -1], [6, 0], [6, 1]];
    for (const [dx, dy] of arc) set(dx, Math.min(dy, 1), band);
    for (let dy = top + 3; dy < -1; dy++) set(-6, dy, band), set(6, dy, band);
    for (const s of [-1, 1]) for (let dy = 2; dy <= 6; dy++) for (const dx of [6, 7]) set(s * dx, dy, dy === 2 || dy === 6 ? band : s > 0 ? shade : fabric);
  } else if (a === "cap") {
    // A cap worn forwards, its brim over the eyes' line.
    if (b.kind === "side") {
      for (let dy = -3; dy <= 1; dy++) for (let dx = dy === -3 ? -3 : -5; dx <= (dy === -3 ? 2 : 4); dx++) set(dx, dy, dy === 1 ? shade : fabric, "cap");
      for (let dx = 3; dx <= 8; dx++) set(dx, 1, shade, "cap");
      return;
    }
    for (let dy = -3; dy <= 0; dy++) for (let dx = dy === -3 ? -3 : -6; dx <= (dy === -3 ? 3 : 6); dx++) set(dx, dy, dx >= 5 ? shade : fabric, "cap");
    if (b.kind === "front") for (let dx = -7; dx <= 7; dx++) set(dx, 1, shade, "cap");
    else set(0, 0, shade, "cap"), set(-1, 1, shade, "cap"), set(1, 1, shade, "cap");
  } else if (a === "scarf") {
    const nx = b.top[0];
    const y0 = b.top[1] - 1;
    for (let dx = -4; dx <= 4; dx++) g.set(nx + dx, y0, fabric, "accessory"), g.set(nx + dx, y0 + 1, dx % 3 === 0 ? shade : fabric, "accessory");
    if (b.kind === "front") for (let y = y0 + 2; y <= y0 + 7; y++) g.set(nx + 2, y, fabric, "accessory"), g.set(nx + 3, y, shade, "accessory");
    else if (b.kind === "side") for (let y = y0 + 2; y <= y0 + 6; y++) g.set(nx + 2, y, fabric, "accessory");
  }
}

// ---------------------------------------------------------------- actions

export type FigureTag = "idle" | "move" | "sit" | "work" | "greet" | "celebrate" | "rest" | "carry" | "hobby" | "talk" | "think";

export interface FigureAction {
  id: string;
  /** What they're doing, for a screen reader or a list: short, plain, present tense ("walks", "types at a desk"). */
  label: string;
  /** Frames in one loop, and how long each lasts. */
  frames: number;
  ms: number;
  /** The views it's drawn in; asked for another, the figure turns to the nearest one it has. */
  views: View[];
  tags: FigureTag[];
  /** Whose interest it comes from. Anyone can do it. */
  owner?: string;
  /** The loop blinks by itself, so nothing else should add blinks. */
  blinks?: boolean;
  /** Pixels a scene should slide the figure each loop, for walking and running. */
  travel?: number;
  /** The pose on frame `f`, drawn front on, side on (facing right) or from behind. */
  pose: (f: number, kind: Kind) => FigurePose;
  /** Drawn before the figure (a chair, an easel, a board), with the figure, and after. */
  behind?: (c: PropCtx) => void;
  held?: (c: PropCtx) => void;
  front?: (c: PropCtx) => void;
  /** Drawn last, after a left-facing figure is mirrored, so letters and notes read the right way round. */
  glyphs?: (c: PropCtx) => void;
}

const ACTIONS = new Map<string, FigureAction>();

/** Add actions. A file loaded again (hot reload in development) replaces its own; ids are
 *  checked for clashes by tests/unit/figures.test.ts. */
export function defineActions(list: FigureAction[]) {
  for (const a of list) ACTIONS.set(a.id, a);
}

/** An action by id; an unknown id is standing. */
export function actionOf(id: string | undefined): FigureAction {
  return ACTIONS.get(id ?? "stand") ?? ACTIONS.get("stand")!;
}

export const hasAction = (id: string) => ACTIONS.has(id);
export const allActions = (): FigureAction[] => [...ACTIONS.values()];

/** The view an action is drawn in when asked for `view`: itself, its mirror, then the front. */
export function viewFor(action: FigureAction, view: View): View {
  if (action.views.includes(view)) return view;
  const turned: Record<View, View[]> = { front: ["right", "left", "back"], back: ["front", "right", "left"], left: ["right", "front", "back"], right: ["left", "front", "back"] };
  return turned[view].find((v) => action.views.includes(v)) ?? action.views[0]!;
}

export interface FigureMoment {
  action?: string;
  frame?: number;
  view?: View;
  /** Eyes shut for a blink. */
  blink?: boolean;
  /** The mouth mid-word: 1 a little, 2 wide; true is wide. */
  open?: boolean | 0 | 1 | 2;
}

/** Draw a figure at a moment. Cached by the caller. */
export function drawFigure(look: PersonLook, m: FigureMoment = {}): FigureGrid {
  const act = actionOf(m.action);
  const view = viewFor(act, m.view ?? "front");
  const kind: Kind = view === "front" ? "front" : view === "back" ? "back" : "side";
  const frame = (((m.frame ?? 0) % act.frames) + act.frames) % act.frames;
  const pose = act.pose(frame, kind);
  const face: Face = { ...(pose.face ?? {}) };
  if (m.blink && face.eyes !== "happy" && face.eyes !== "closed") face.eyes = "closed";
  const open = m.open === true ? 2 : m.open || 0;
  if (open) face.mouth = face.mouth === "laugh" ? "laugh" : open === 2 ? "open" : "ajar";
  const b = resolve({ ...pose, face }, kind);
  const p = paletteOf(look);
  const g = new FigureGrid();
  const ctx: PropCtx = { g, look, frame, kind, hands: b.arms.map((a) => a.w), head: b.head, hip: b.hip, top: b.top, sit: b.sit, flip: view === "left" };
  act.behind?.(ctx);
  drawBody(g, p, b, () => act.held?.(ctx));
  act.front?.(ctx);
  outline(g);
  if (view === "left") g.mirror();
  act.glyphs?.(ctx);
  return g;
}

/** RGBA pixels for a figure, for a canvas's ImageData or a PNG encoder. */
export function figureRGBA(g: FigureGrid): Uint8ClampedArray {
  const out = new Uint8ClampedArray(FW * FH * 4);
  for (let i = 0; i < FW * FH; i++) {
    const c = g.c[i];
    if (!c) continue;
    const [r, gg, b] = hex(c);
    out[i * 4] = r;
    out[i * 4 + 1] = gg;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = 255;
  }
  return out;
}

// ---------------------------------------------------------------- props

/** Prop colours, from the rooms' palette (lib/pixel/rooms.ts) so a figure's chair matches its floor. */
const C = {
  wood: "#9a6a44",
  woodLight: "#b98a5c",
  woodDark: "#6e4a30",
  metal: "#8d96a4",
  metalLight: "#c7ccd6",
  metalDark: "#5b6270",
  paper: "#efe9da",
  paperShade: "#d3c9b3",
  ink: "#2a2433",
  board: "#2f4d3e",
  boardLight: "#3a5c4a",
  chalk: "#dfe9de",
  screen: "#8fd3f0",
  screenDark: "#4f93b8",
  red: "#d9504a",
  blue: "#3f72d6",
  yellow: "#f2c23a",
  green: "#4cae66",
  purple: "#8c6bf2",
  orange: "#ee8a3c",
  teal: "#1fb5a8",
  pink: "#f08fb0",
  box: "#c99a5b",
  boxShade: "#a27540",
  boxLight: "#dcb27a",
  tape: "#ead39f",
  mug: "#f0ebe0",
  mugShade: "#c9bfac",
  coffee: "#5a3a24",
  steam: "#f4efe9",
  dark: "#26282f",
  darkLight: "#40454f",
  z: "#f4efe9",
  guitar: "#d08a45",
  guitarShade: "#a5632b",
  guitarDark: "#3a2414",
  canvas: "#f6f1e4",
};

type Cell = { x: number; y: number; c: string };

/** Draw a pattern ("." clear, "o" the dark edge), optionally with a soft dark edge where it crosses the figure. */
function put(g: FigureGrid, rows: string[], x: number, y: number, pal: Record<string, string>, opts: { edge?: boolean; region?: string } = {}) {
  const cells: Cell[] = [];
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const c = ch === "o" ? OUTLINE : pal[ch];
      if (c) cells.push({ x: x + rx, y: y + ry, c });
    }),
  );
  const region = opts.region ?? "prop";
  if (opts.edge) over(g, cells, region, (r) => r !== region && r !== "hand" && r !== "fx");
  else for (const q of cells) g.set(q.x, q.y, q.c, region);
}

function rect(g: FigureGrid, x: number, y: number, w: number, h: number, c: string, region = "prop") {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g.set(i, j, c, region);
}

/** A wooden chair: seen side on behind the sitter, or from the front with its seat either side. */
function chair(c: PropCtx) {
  const { g } = c;
  const seat = c.hip[1] + 4;
  if (c.kind === "side") {
    const bx = c.hip[0] - 5;
    rect(g, bx, seat - 12, 1, 12, C.woodLight), rect(g, bx + 1, seat - 12, 1, 12, C.wood);
    rect(g, bx, seat - 12, 2, 1, C.woodLight);
    rect(g, bx, seat, 11, 1, C.woodLight), rect(g, bx, seat + 1, 11, 1, C.woodDark);
    for (const lx of [bx, bx + 9]) rect(g, lx, seat + 2, 1, GROUND - seat - 1, C.wood), rect(g, lx + 1, seat + 2, 1, GROUND - seat - 1, C.woodDark);
    rect(g, bx + 2, seat + 5, 7, 1, C.woodDark);
  } else {
    const cx = c.hip[0];
    rect(g, cx - 8, seat - 1, 17, 1, C.woodLight), rect(g, cx - 8, seat, 17, 1, C.wood), rect(g, cx - 8, seat + 1, 17, 1, C.woodDark);
    for (const lx of [cx - 8, cx + 7]) rect(g, lx, seat + 2, 1, GROUND - seat - 1, C.wood), rect(g, lx + 1, seat + 2, 1, GROUND - seat - 1, C.woodDark);
    // The back, behind the shoulders.
    for (const lx of [cx - 7, cx + 6]) rect(g, lx, seat - 13, 2, 12, C.wood);
    rect(g, cx - 7, seat - 13, 15, 2, C.woodLight);
  }
}

/** A desk with a laptop on it, in front of a sitter. */
function desk(c: PropCtx, lit = true) {
  const { g } = c;
  const top = c.hip[1] - 5;
  const scr = lit ? C.screen : C.screenDark;
  if (c.kind === "side") {
    const x0 = c.hip[0] + 5;
    rect(g, x0, top, 31 - x0, 1, C.woodLight), rect(g, x0, top + 1, 31 - x0, 1, C.wood), rect(g, x0, top + 2, 31 - x0, 1, C.woodDark);
    rect(g, 27, top + 3, 1, GROUND - top - 2, C.wood), rect(g, 28, top + 3, 1, GROUND - top - 2, C.woodDark);
    // The laptop: its keyboard, and the lid tipped back with the screen facing them.
    rect(g, x0 + 1, top - 1, 7, 1, C.metal);
    put(g, ["...bk", "...bk", "..bk.", "..bk.", ".bk..", ".bk..", "bk..."], x0 + 5, top - 8, { b: scr, k: C.metalDark });
    return;
  }
  const cx = c.hip[0];
  rect(g, 0, top, FW, 1, C.woodLight), rect(g, 0, top + 1, FW, 1, C.wood), rect(g, 0, top + 2, FW, 1, C.woodDark);
  rect(g, 1, top + 3, FW - 2, 3, C.wood);
  rect(g, 1, top + 5, FW - 2, 1, C.woodDark);
  rect(g, cx - 2, top + 4, 5, 1, C.woodDark);
  for (const lx of [1, FW - 3]) rect(g, lx, top + 6, 1, GROUND - top - 5, C.wood), rect(g, lx + 1, top + 6, 1, GROUND - top - 5, C.woodDark);
  // The back of the laptop's lid, space grey, a light where the logo is.
  rect(g, cx - 4, top - 7, 9, 7, C.metal);
  rect(g, cx - 4, top - 7, 9, 1, C.metalLight);
  rect(g, cx - 4, top - 6, 1, 6, "#a3abb8");
  rect(g, cx + 4, top - 6, 1, 6, C.metalDark);
  g.set(cx, top - 4, lit ? "#e8f6ff" : C.metalLight, "prop");
  rect(g, cx - 5, top - 1, 11, 1, C.metalDark);
}

/** A glyph (a letter, a note) placed as if facing right, moved but never mirrored for a figure facing left. */
function glyph(c: PropCtx, rows: string[], x: number, y: number, colour: string) {
  const w = Math.max(...rows.map((r) => r.length));
  const at = c.flip ? FW - 1 - x - (w - 1) : x;
  put(c.g, rows, at, y, { z: colour }, { region: "fx" });
}

/** A "z" or two drifting up from a sleeper. */
function zs(c: PropCtx) {
  const [hx, hy] = c.head;
  const f = c.frame;
  const fwd = c.kind === "side" ? 4 : 5;
  for (const k of [0, 4]) {
    const t = (f + k) % 8;
    if (t > 6) continue;
    const big = t >= 3;
    glyph(c, big ? ["zzzz", "..z.", ".z..", "zzzz"] : ["zzz", ".z.", "zzz"], hx + fwd + Math.floor(t / 2), hy - 1 - t, C.z);
  }
}

function steam(c: PropCtx, x: number, y: number) {
  const f = c.frame % 4;
  const pts: Pt[] = [[0, 0], [1, -1], [0, -2], [1, -3]];
  for (let i = 0; i < 2; i++) {
    const [dx, dy] = pts[(f + i * 2) % 4]!;
    c.g.set(x + dx, y + dy - i, C.steam, "fx");
  }
}

/** A mug of coffee, held by its handle. */
function mug(c: PropCtx, w: Pt, side: boolean, toLips: boolean) {
  const [x, y] = [Math.round(w[0]), Math.round(w[1])];
  const pal = { m: C.mug, s: C.mugShade, c: C.coffee, t: C.teal };
  if (side) put(c.g, toLips ? ["mmms", "mmms", "ttts", "mmms"] : ["cccs", "mmms", "ttts", "mmms"], x + 1, y - 3, pal, { edge: true });
  else put(c.g, toLips ? ["mmms", "ttts", "mmms"] : ["mmms", "ttts", "mmms", "mmms"], x - 1, y - 3, pal, { edge: true });
  if (!toLips) steam(c, x + 1, y - 5);
}

function phone(c: PropCtx, w: Pt, side: boolean) {
  const [x, y] = [Math.round(w[0]), Math.round(w[1])];
  if (side) put(c.g, ["kb", "kb", "kb"], x + 1, y - 2, { k: C.dark, b: c.frame % 3 === 2 ? "#c9ecff" : C.screen }, { edge: true });
  else put(c.g, ["kkk", "kdk", "kkk", "kkk"], x - 1, y - 3, { k: C.dark, d: C.darkLight }, { edge: true });
}

function book(c: PropCtx, cover = C.blue) {
  const { g } = c;
  const turning = c.frame >= 6;
  if (c.kind === "side") {
    const [x, y] = [Math.round(c.hands[0]![0]), Math.round(c.hands[0]![1])];
    put(g, ["...c", "..pc", ".ppc", "pppc", "pppc", "cccc"], x, y - 5, { p: C.paper, c: cover }, { edge: true });
    if (turning) put(g, c.frame === 6 ? ["p.", "p."] : [".p", "p."], x + 1, y - 7, { p: C.paper }, { edge: true });
    return;
  }
  const cx = c.top[0];
  const y0 = c.top[1] + 3;
  put(g, ["ppppppppp", "ccccocccc", "ccccocccc", "ccccocccc", "ccccocccc", "ccccocccc"], cx - 4, y0, { p: C.paper, c: cover }, { edge: true });
  // A page turning over the top.
  if (turning) put(g, c.frame === 6 ? ["..pp", ".pp.", "pp.."] : ["pp..", ".pp.", "..pp"], c.frame === 6 ? cx + 1 : cx - 4, y0 - 3, { p: C.paper }, { edge: true });
}

function cardboard(c: PropCtx, x: number, y: number, w: number, h: number) {
  const { g } = c;
  const cells: Cell[] = [];
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      let col = j === 0 ? C.boxLight : i === w - 1 || j === h - 1 ? C.boxShade : C.box;
      if (i === Math.floor(w / 2) && j < h - 1) col = C.tape;
      cells.push({ x: x + i, y: y + j, c: col });
    }
  over(g, cells, "prop", (r) => r !== "prop");
}

function rocket(c: PropCtx, x: number, y: number) {
  // A model rocket, upright: a red nose cone, a white body with a window and a stripe, red fins.
  put(c.g, ["..r..", ".rrr.", ".rrr.", ".www.", ".wbw.", ".www.", ".www.", ".rrr.", ".www.", ".www.", ".www.", "rwwwr", "rwwwr", "r.k.r"], x - 2, y, { r: C.red, w: "#f3f0e8", b: C.blue, k: C.metalDark }, { edge: true });
}

function drone(c: PropCtx, x: number, y: number) {
  // The rotors blur between two frames, the light on its nose blinks.
  const spin = c.frame % 2;
  const props = spin ? "LLL.....LLL" : ".L.......L.";
  put(c.g, [props, ".k.......k.", ".kkkkkkkkk.", "..kkrkgkk..", "...k...k..."], x - 5, y, { L: C.metalLight, k: C.darkLight, r: c.frame % 4 < 2 ? C.red : "#7a2a28", g: C.green }, { region: "prop" });
}

function controller(c: PropCtx, x: number, y: number) {
  put(c.g, ["kkkkk", "kdkek", ".k.k."], x - 2, y, { k: C.dark, d: C.darkLight, e: C.red }, { edge: true });
  // Its aerial.
  put(c.g, ["m", "m", "m"], x + 2, y - 3, { m: C.metal }, { edge: true });
}

function stopwatch(c: PropCtx, w: Pt, side: boolean) {
  const [x, y] = [Math.round(w[0]), Math.round(w[1])];
  // A silver stopwatch with its button on top, the hand going round.
  const x0 = side ? x + 1 : x - 2;
  put(c.g, ["..k..", ".mmm.", "mfffm", "mfffm", "mfffm", ".mmm."], x0, y - 5, { m: C.metalLight, f: "#f6f2ea", k: C.metalDark }, { edge: true });
  const tip: Pt = ([[2, 2], [3, 3], [2, 4], [1, 3]] as Pt[])[c.frame % 4]!;
  c.g.set(x0 + 2, y - 2, C.ink, "prop");
  c.g.set(x0 + tip[0], y - 5 + tip[1], C.red, "prop");
}

function clipboard(c: PropCtx, x: number, y: number) {
  const ticks = Math.min(3, Math.floor(c.frame / 2));
  const rows = ["..mm..", "bppppb", "bp--pb", "bppppb", "bp--pb", "bppppb", "bp--pb", "bppppb", "bbbbbb"];
  put(c.g, rows, x, y, { m: C.metal, b: C.woodLight, p: C.paper, "-": C.paperShade }, { edge: true });
  for (let i = 0; i < ticks; i++) c.g.set(x + 1, y + 2 + i * 2, C.green, "prop");
}

function chalkboard(c: PropCtx) {
  const { g } = c;
  const lines = Math.min(4, Math.floor(c.frame / 2) + 1);
  if (c.kind === "back") {
    // The board behind them, a wooden frame, a few lines of chalk going up as they write.
    rect(g, 1, 3, 29, 24, C.woodDark);
    rect(g, 2, 4, 27, 22, C.board);
    rect(g, 2, 4, 27, 1, C.boardLight);
    for (let i = 0; i < 4; i++) {
      const y = 7 + i * 4;
      const len = i < lines - 1 ? 18 - (i % 2) * 5 : i === lines - 1 ? 4 + (c.frame % 2) * 4 : 0;
      for (let x = 4; x < 4 + len; x++) if ((x + i) % 5 !== 0) g.set(x, y, C.chalk, "prop");
    }
    rect(g, 1, 27, 29, 1, C.woodLight);
    g.set(24, 26, C.chalk, "prop"), g.set(25, 26, C.chalk, "prop");
    return;
  }
  // Side on: a board on a stand, turned a little towards you.
  rect(g, 22, 4, 8, 24, C.woodDark);
  rect(g, 23, 5, 6, 22, C.board);
  rect(g, 23, 5, 6, 1, C.boardLight);
  for (let i = 0; i < 4; i++) {
    const y = 8 + i * 4;
    const len = i < lines - 1 ? 5 - (i % 2) : i === lines - 1 ? 1 + (c.frame % 2) * 2 : 0;
    for (let x = 23; x < 23 + len; x++) g.set(x, y, C.chalk, "prop");
  }
  rect(g, 23, 28, 1, GROUND - 27, C.wood), rect(g, 28, 28, 1, GROUND - 27, C.woodDark);
}

function easel(c: PropCtx) {
  const { g } = c;
  const dabs: [number, number, string][] = [[2, 3, C.blue], [5, 2, C.yellow], [3, 6, C.green], [6, 7, C.red], [2, 10, C.purple], [5, 11, C.orange], [4, 4, C.teal], [6, 13, C.pink]];
  const shown = 4 + (c.frame % 4);
  if (c.kind === "back") {
    // From behind the painter: the canvas beyond them, on its easel.
    const x0 = 15;
    rect(g, x0 + 6, 5, 2, GROUND - 4, C.wood);
    rect(g, x0, 7, 14, 18, C.woodDark);
    rect(g, x0 + 1, 8, 12, 16, C.canvas);
    for (let i = 0; i < shown; i++) {
      const [dx, dy, col] = dabs[i]!;
      rect(g, x0 + 1 + dx, 8 + dy, 3, 2, col);
    }
    rect(g, x0 - 1, 25, 16, 1, C.woodLight);
    rect(g, x0 + 1, 26, 1, GROUND - 25, C.wood), rect(g, x0 + 12, 26, 1, GROUND - 25, C.woodDark);
    return;
  }
  // Side on: the canvas turned towards you, its easel's legs splayed.
  const x0 = 21;
  rect(g, x0 + 4, 9, 2, 4, C.wood);
  rect(g, x0, 12, 10, 15, C.woodDark);
  rect(g, x0 + 1, 13, 8, 13, C.canvas);
  for (let i = 0; i < shown; i++) {
    const [dx, dy, col] = dabs[i]!;
    g.set(x0 + 1 + Math.min(7, dx), 13 + Math.min(12, dy), col, "prop");
    g.set(x0 + 2 + Math.min(6, dx), 13 + Math.min(12, dy), col, "prop");
  }
  rect(g, x0 - 1, 27, 12, 1, C.woodLight);
  for (let y = 28; y <= GROUND; y++) {
    const k = y - 28;
    g.set(x0 + 1 - Math.floor(k / 4), y, C.wood, "prop");
    g.set(x0 + 8 + Math.floor(k / 4), y, C.woodDark, "prop");
  }
}

function brush(c: PropCtx, w: Pt, colour: string) {
  const [x, y] = [Math.round(w[0]), Math.round(w[1])];
  put(c.g, ["...t", "..h.", ".h.."], x, y - 3, { h: C.woodDark, t: colour }, { edge: true });
}

function palette(c: PropCtx, x: number, y: number) {
  put(c.g, [".wwww.", "wrwbww", "wwywgw", ".www.."], x, y, { w: C.woodLight, r: C.red, b: C.blue, y: C.yellow, g: C.green }, { edge: true });
}

function guitar(c: PropCtx) {
  const pal = { g: C.guitar, s: C.guitarShade, d: C.guitarDark, n: C.woodDark, h: C.metalLight };
  const { g } = c;
  if (c.kind === "side") {
    // Side on: the body against them at the hip, the neck out in front and up.
    const [x, y] = [c.top[0] - 1, c.top[1] + 7];
    put(g, [
      "...............hh",
      ".............nnh.",
      "...........nn....",
      ".gggg....nn......",
      "gggggg.nn........",
      "ggdgggnn.........",
      "gdddgg...........",
      "ggdggs...........",
      "gggggs...........",
      ".ssss............",
    ], x, y - 3, pal, { edge: true });
    return;
  }
  // From the front: the body across their right hip (your left), the neck up to their left hand.
  const [x, y] = [c.top[0] - 7, c.top[1] + 6];
  put(g, [
    "................hh",
    "..............nnh.",
    "............nn....",
    "..........nn......",
    "..ggg...nn........",
    ".ggggg.nn.........",
    "gggdggnn..........",
    "ggdddgg...........",
    "gggdgggs..........",
    ".ggggggs..........",
    "ggggggss..........",
    ".gggggs...........",
    "..ssss............",
  ], x, y - 2, pal, { edge: true });
}

function note(c: PropCtx, x: number, y: number) {
  const t = c.frame % 6;
  if (t > 3) return;
  glyph(c, [".zz", ".z.", "zz."], x + Math.floor(t / 2), y - t, C.z);
}

// ---------------------------------------------------------------- the actions themselves

const cyc = <T,>(list: T[], f: number): T => list[((f % list.length) + list.length) % list.length]!;
const ALL: View[] = ["front", "right", "back", "left"];
const FACING: View[] = ["front", "right", "left"];
const SIDES: View[] = ["right", "left"];

/** The walk's legs, side on: ankles along and lifted, the planted foot moving back evenly. */
function walkLegs(f: number, stride = 4, lift = 3): Pick<FigurePose, "fa" | "fb"> {
  // The swinging foot passes a little ahead of the planted one, so it shows past it.
  const along = [stride, stride / 2, 0, -stride / 2, -stride, -stride * 0.75, stride * 0.3, stride * 0.75].map(Math.round);
  const up = [0, 0, 0, 0, 0, -1, -lift, -1];
  const foot: LegJ["foot"][] = ["toe", "flat", "flat", "flat", "heel", "heel", "flat", "flat"];
  return {
    fa: { x: cyc(along, f), y: cyc(up, f), foot: cyc(foot, f) },
    fb: { x: cyc(along, f + 4), y: cyc(up, f + 4), foot: cyc(foot, f + 4) },
  };
}

/** From the front or back each foot lifts in turn. */
function walkLegsFront(f: number, lift = 2): Pick<FigurePose, "fa" | "fb"> {
  const up = [0, -1, -lift, -1, 0, 0, 0, 0];
  return { fa: { y: cyc(up, f + 4) }, fb: { y: cyc(up, f) } };
}

/** Side on, an arm raised: out in front at shoulder height, the forearm angled forwards, so the hand is well clear of the face. */
const SIDE_RAISE: Pt = [8, 0];

const SEATED_HANDS: Record<"side" | "front", [Reach, Reach]> = {
  side: [{ x: 4, y: 9, hand: "fist", elbow: "back" }, { x: 4, y: 9, hand: "fist", elbow: "back" }],
  front: [{ x: 2, y: 9, hand: "fist", elbow: "out" }, { x: -2, y: 9, hand: "fist", elbow: "out" }],
};

defineActions([
  // ------------------------------------------------ standing and moving
  {
    id: "stand",
    label: "stands",
    frames: 10,
    ms: 400,
    views: ALL,
    tags: ["idle"],
    blinks: true,
    pose: (f) => ({ face: { eyes: f === 8 ? "closed" : "open" } }),
  },
  {
    id: "walk",
    label: "walks",
    frames: 8,
    ms: 110,
    views: ALL,
    tags: ["move"],
    travel: 16,
    pose: (f, kind) => {
      if (kind === "side") {
        const swing = [-3, -2, 0, 2, 3, 2, 0, -2];
        return {
          ...walkLegs(f),
          a: { x: cyc(swing, f), y: 12, elbow: "back" },
          b: { x: cyc(swing, f + 4), y: 12, elbow: "back" },
        };
      }
      const hand = [0, -1, -1, -1, 0, 0, 0, 0];
      return { ...walkLegsFront(f), a: { x: 0, y: 12 + cyc(hand, f), elbow: "back" }, b: { x: 0, y: 12 + cyc(hand, f + 4), elbow: "back" } };
    },
  },
  {
    id: "run",
    label: "runs",
    frames: 8,
    ms: 75,
    views: ALL,
    tags: ["move"],
    travel: 32,
    pose: (f, kind) => runPose(f, kind),
  },
  // ------------------------------------------------ sitting
  {
    id: "sit",
    label: "sits",
    frames: 10,
    ms: 400,
    views: FACING,
    tags: ["sit", "idle"],
    blinks: true,
    pose: (f, kind) => {
      const [a, b] = SEATED_HANDS[kind === "side" ? "side" : "front"];
      return { sit: true, a, b, face: { eyes: f === 8 ? "closed" : "open" } };
    },
    behind: chair,
  },
  {
    id: "type",
    label: "types at a desk",
    frames: 4,
    ms: 130,
    views: FACING,
    tags: ["sit", "work"],
    pose: (f, kind) => {
      const up = (i: number) => (f % 4 === i ? -1 : 0);
      if (kind === "side")
        return {
          sit: true,
          head: [0, 0],
          a: { x: 7, y: 4 + up(0), hand: "flat", elbow: "down", front: true },
          b: { x: 6, y: 4 + up(2), hand: "flat", elbow: "down" },
          face: { eyes: "open" },
        };
      return { sit: true, a: { x: 3, y: 4 + up(0), hand: "flat", elbow: "out" }, b: { x: -3, y: 4 + up(2), hand: "flat", elbow: "out" }, face: { eyes: "down" } };
    },
    behind: chair,
    held: (c) => desk(c),
  },
  {
    id: "read",
    label: "reads a book",
    frames: 8,
    ms: 320,
    views: FACING,
    tags: ["sit", "rest"],
    owner: "aaesha",
    pose: (f, kind) => {
      if (kind === "side") return { sit: true, a: { x: 6, y: 5, hand: "grip", elbow: "down", front: true }, b: { x: 5, y: 5, hand: "grip", elbow: "down" }, face: { eyes: "down" } };
      return { sit: true, a: { x: 3, y: 7, hand: "grip", elbow: [0, 5], front: true }, b: { x: -3, y: 7, hand: "grip", elbow: [0, 5], front: true }, face: { eyes: f === 3 ? "closed" : "down" } };
    },
    behind: chair,
    held: (c) => book(c),
  },
  {
    id: "sleep",
    label: "dozes in a chair",
    frames: 8,
    ms: 360,
    views: FACING,
    tags: ["sit", "rest"],
    pose: (_f, kind) => {
      const [a, b] = SEATED_HANDS[kind === "side" ? "side" : "front"];
      return { sit: true, slump: 1, head: kind === "side" ? [1, 1] : [0, 1], a, b, face: { eyes: "closed", mouth: "o" } };
    },
    behind: chair,
    glyphs: zs,
  },
  // ------------------------------------------------ gestures
  {
    id: "wave",
    label: "waves",
    frames: 6,
    ms: 130,
    views: ALL,
    tags: ["greet"],
    pose: (f, kind) => {
      const sway = [0, 1, 2, 1, 0, -1][f % 6]!;
      // Side on, a hand raised well out in front of the face, the forearm wagging.
      // Side on, the far hand waves: the face stays in front of the arm and the hand shows past it.
      if (kind === "side") return { b: { x: 13 + [0, 1, 1, 0, -1, -1][f % 6]!, y: -6 - [0, 0, 1, 1, 1, 0][f % 6]!, hand: "open", elbow: SIDE_RAISE }, face: { mouth: "smile" } };
      return { b: { x: 3 + sway, y: -10, hand: "open", elbow: "out" }, face: { mouth: "smile" } };
    },
  },
  {
    id: "cheer",
    label: "cheers",
    frames: 4,
    ms: 180,
    views: ALL,
    tags: ["celebrate"],
    pose: (f, kind) => {
      const hi = f % 2 === 0;
      // Side on, fists pumped up in front, clear of the face.
      if (kind === "side") return { b: { x: 13, y: hi ? -7 : -5, elbow: SIDE_RAISE, hand: "fist" }, a: { x: 6, y: hi ? 3 : 4, elbow: "down", hand: "fist" }, face: { eyes: "happy", mouth: "laugh" } };
      return { a: { x: hi ? -2 : -4, y: hi ? -11 : -9, elbow: "out", hand: "fist" }, b: { x: hi ? 2 : 4, y: hi ? -11 : -9, elbow: "out", hand: "fist" }, face: { eyes: "happy", mouth: "laugh" } };
    },
  },
  {
    id: "dance",
    label: "dances",
    frames: 8,
    ms: 190,
    views: ALL,
    tags: ["celebrate"],
    owner: "caitlin",
    pose: (f, kind) => {
      const lean = [-1, 0, 1, 0, -1, 0, 1, 0][f]!;
      if (kind === "side") {
        const up = f % 4 < 2;
        return { lean: lean > 0 ? 1 : 0, a: up ? { x: 6, y: 3, hand: "fist", elbow: "down" } : { x: 3, y: 10, hand: "fist", elbow: "back" }, b: up ? { x: 12, y: -7, hand: "open", elbow: SIDE_RAISE } : { x: 7, y: 3, hand: "fist", elbow: "down" }, face: { mouth: "grin" } };
      }
      const poses: [Reach, Reach][] = [
        [{ x: -3, y: -10, hand: "open", elbow: "out" }, { x: 7, y: 2, hand: "open", elbow: "down" }],
        [{ x: 3, y: 6, hand: "fist", elbow: "out", front: true }, { x: -3, y: 6, hand: "fist", elbow: "out", front: true }],
        [{ x: -7, y: 2, hand: "open", elbow: "down" }, { x: 3, y: -10, hand: "open", elbow: "out" }],
        [{ x: 3, y: 6, hand: "fist", elbow: "out", front: true }, { x: -3, y: 6, hand: "fist", elbow: "out", front: true }],
        [{ x: -2, y: -11, hand: "open", elbow: "out" }, { x: 2, y: -11, hand: "open", elbow: "out" }],
        [{ x: -5, y: 9, hand: "open", elbow: "out" }, { x: 5, y: 9, hand: "open", elbow: "out" }],
        [{ x: -2, y: -11, hand: "open", elbow: "out" }, { x: 2, y: -11, hand: "open", elbow: "out" }],
        [{ x: 2, y: 10, hand: "fist", elbow: "out" }, { x: -2, y: 10, hand: "fist", elbow: "out" }],
      ];
      const [a, b] = poses[f]!;
      return { lean, a, b, face: { mouth: f % 4 === 1 ? "laugh" : "grin", eyes: f % 4 === 1 ? "happy" : "open" } };
    },
  },
  {
    id: "clap",
    label: "claps",
    frames: 4,
    ms: 120,
    views: FACING,
    tags: ["celebrate", "greet"],
    pose: (f, kind) => {
      const gap = [3, 1, 0, 1][f]!;
      if (kind === "side") return { a: { x: 6 + gap, y: 5, hand: "open", elbow: "down", front: true }, b: { x: 6, y: 5, hand: "open", elbow: "down" }, face: { mouth: "smile" } };
      return { a: { x: 4 - gap, y: 6, hand: "open", elbow: "down", front: true }, b: { x: -4 + gap, y: 6, hand: "open", elbow: "down", front: true }, face: { mouth: "smile", eyes: f === 2 ? "happy" : "open" } };
    },
  },
  {
    id: "talk",
    label: "talks",
    frames: 8,
    ms: 150,
    views: ALL,
    tags: ["talk"],
    pose: (f, kind) => {
      const mouth = (["open", "ajar", "rest", "open", "ajar", "ajar", "rest", "open"] as MouthMode[])[f]!;
      const lift = [0, -1, -1, 0, 0, -1, 0, 0][f]!;
      if (kind === "side") return { a: { x: 5, y: 5 + lift, hand: "open", elbow: "down" }, face: { mouth } };
      return { b: { x: -1, y: 6 + lift, hand: "open", elbow: "out" }, face: { mouth } };
    },
  },
  {
    id: "point",
    label: "points",
    frames: 4,
    ms: 260,
    views: ALL,
    tags: ["talk"],
    pose: (f, kind) => {
      const jab = f === 1 || f === 2 ? 1 : 0;
      if (kind === "side") return { a: { x: 9 + jab, y: 1, hand: "point", elbow: "down" }, face: { mouth: "smile" } };
      return { b: { x: 9 + jab, y: 1, hand: "point", elbow: "down" }, face: { eyes: "aside", mouth: "smile" } };
    },
  },
  {
    id: "think",
    label: "thinks, hand on chin",
    frames: 4,
    ms: 420,
    views: FACING,
    tags: ["think"],
    pose: (f, kind) => {
      const tap = f % 2;
      if (kind === "side") return { a: { x: 6, y: 0 - tap, hand: "fist", elbow: "down" }, face: { eyes: "up", mouth: "flat" } };
      return { b: { x: -4, y: 1 - tap, hand: "fist", elbow: [-1, 7], front: true }, a: { x: 8, y: 8, hand: "fist", elbow: [1, 7], front: true }, face: { eyes: "up", mouth: "flat" } };
    },
  },
  {
    id: "shrug",
    label: "shrugs",
    frames: 4,
    ms: 300,
    views: FACING,
    tags: ["talk", "think"],
    pose: (f, kind) => {
      const up = f === 1 || f === 2;
      if (kind === "side") return up ? { a: { x: 5, y: 6, hand: "open", elbow: "back" }, b: { x: 4, y: 6, hand: "open", elbow: "back" }, face: { brows: "up", mouth: "flat" } } : { face: { mouth: "flat" } };
      return up ? { a: { x: -5, y: 7, hand: "open", elbow: [0, 6] }, b: { x: 5, y: 7, hand: "open", elbow: [0, 6] }, face: { brows: "up", mouth: "flat", eyes: "aside" } } : { face: { mouth: "flat" } };
    },
  },
  {
    id: "stretch",
    label: "stretches",
    frames: 8,
    ms: 300,
    views: FACING,
    tags: ["rest"],
    pose: (f, kind) => {
      const yawn = f === 3 || f === 4;
      if (kind === "side") {
        // Reaching out in front, hands together, then back down.
        if (f === 0 || f === 7) return {};
        const out = f === 1 || f === 6 ? 0 : f === 3 || f === 4 ? 2 : 1;
        return {
          a: { x: 9 + out, y: f === 1 || f === 6 ? 2 : -3, hand: "open", elbow: [7, 0] },
          b: { x: 9 + out, y: f === 1 || f === 6 ? 2 : -3, hand: "open", elbow: [7, 0] },
          face: { eyes: "closed", mouth: yawn ? "o" : "flat" },
        };
      }
      if (f === 0) return {};
      if (f === 1 || f === 7) return { a: { x: -7, y: -6, hand: "open", elbow: "out" }, b: { x: 7, y: -6, hand: "open", elbow: "out" }, face: { eyes: "closed" } };
      const lean = [0, 0, 0, -1, -1, 1, 1, 0][f]!;
      return { lean, a: { x: -4, y: -11, hand: "open", elbow: "out" }, b: { x: 4, y: -11, hand: "open", elbow: "out" }, face: { eyes: "closed", mouth: yawn ? "o" : "flat" } };
    },
  },
  // ------------------------------------------------ holding things
  {
    id: "carry",
    label: "carries a box",
    frames: 8,
    ms: 120,
    views: ALL,
    tags: ["carry", "move"],
    travel: 16,
    pose: (f, kind) => {
      if (kind === "side") return { ...walkLegs(f, 3, 2), a: { x: 6, y: 7, hand: "grip", elbow: "down" }, b: { x: 5, y: 7, hand: "grip", elbow: "down" } };
      return { ...walkLegsFront(f), a: { x: 2, y: 8, hand: "grip", elbow: "out", front: true }, b: { x: -1, y: 8, hand: "grip", elbow: "out", front: true } };
    },
    behind: (c) => {
      if (c.kind === "back") cardboard(c, c.top[0] - 8, c.top[1] + 5, 17, 8);
    },
    held: (c) => {
      if (c.kind === "side") cardboard(c, c.top[0] + 3, c.top[1] + 4, 9, 8);
      else if (c.kind === "front") cardboard(c, c.top[0] - 6, c.top[1] + 5, 13, 8);
    },
  },
  {
    id: "phone",
    label: "looks at a phone",
    frames: 6,
    ms: 240,
    views: FACING,
    tags: ["idle", "rest"],
    pose: (f, kind) => {
      const tap = f % 3 === 2 ? -1 : 0;
      if (kind === "side") return { head: [0, 1], a: { x: 5, y: 6 + tap, hand: "grip", elbow: "down" }, face: { eyes: "down", mouth: f >= 4 ? "smile" : "rest" } };
      return { head: [0, 1], a: { x: 6, y: 6 + tap, hand: "grip", elbow: "down", front: true }, face: { eyes: "down", mouth: f >= 4 ? "smile" : "rest" } };
    },
    held: (c) => phone(c, c.hands[0]!, c.kind === "side"),
  },
  {
    id: "drink",
    label: "sips a coffee",
    frames: 10,
    ms: 220,
    views: FACING,
    tags: ["rest", "idle"],
    pose: (f, kind) => {
      const lips = f >= 5 && f <= 7;
      const mid = f === 4 || f === 8;
      if (kind === "side") return { a: lips ? { x: 6, y: -4, hand: "grip", elbow: "down" } : mid ? { x: 6, y: 0, hand: "grip", elbow: "down" } : { x: 5, y: 6, hand: "grip", elbow: "down" }, face: { eyes: lips ? "closed" : "open" } };
      // The elbow stays at the side and the mug comes up from below to the lips.
      return { b: lips ? { x: -4, y: -2, hand: "grip", elbow: [-1, 6], front: true } : mid ? { x: -3, y: 2, hand: "grip", elbow: [-1, 6], front: true } : { x: -2, y: 7, hand: "grip", elbow: [0, 6], front: true }, face: { eyes: lips ? "closed" : "open" } };
    },
    held: (c) => mug(c, c.kind === "side" ? c.hands[0]! : c.hands[1]!, c.kind === "side", c.frame >= 5 && c.frame <= 7),
  },
  // ------------------------------------------------ the cast's own things (anyone can)
  {
    id: "chalkboard",
    label: "writes on the chalkboard",
    frames: 8,
    ms: 230,
    views: ["back", "right", "left"],
    tags: ["work", "hobby"],
    owner: "paul",
    pose: (f, kind) => {
      const along = [0, 1, 2, 3, 0, 1, 2, 3][f]!;
      if (kind === "side") return { x: -4, a: { x: 10, y: -6 + Math.floor(f / 2), hand: "grip", elbow: [5, -1] }, face: { eyes: "open" } };
      return { x: -3, b: { x: -1 + along, y: -6 + Math.floor(f / 2), hand: "grip", elbow: "out" } };
    },
    behind: chalkboard,
  },
  {
    id: "rocket",
    label: "carries a model rocket",
    frames: 8,
    ms: 120,
    views: ALL,
    tags: ["carry", "hobby", "move"],
    owner: "neil",
    travel: 16,
    pose: (f, kind) => {
      if (kind === "side") return { ...walkLegs(f), a: { x: 5, y: 8, hand: "grip", elbow: "down" }, b: { x: cyc([-2, -1, 0, 1, 2, 1, 0, -1], f), y: 12, elbow: "back" }, face: { mouth: "grin" } };
      return { ...walkLegsFront(f), b: { x: 1, y: 10, hand: "grip", elbow: "out" } };
    },
    held: (c) => {
      const w = c.kind === "side" ? c.hands[0]! : c.hands[1]!;
      rocket(c, Math.round(w[0]) + (c.kind === "side" ? 2 : 1), Math.round(w[1]) - 9);
    },
  },
  {
    id: "drone",
    label: "flies a drone",
    frames: 8,
    ms: 120,
    views: ALL,
    tags: ["hobby", "work"],
    owner: "neil",
    pose: (f, kind) => {
      const nudge = f % 4 === 1 ? -1 : 0;
      if (kind === "side") return { head: [0, 0], a: { x: 5, y: 5 + nudge, hand: "grip", elbow: "down" }, b: { x: 4, y: 5, hand: "grip", elbow: "down" }, face: { eyes: "up", mouth: "smile" } };
      return { a: { x: 4, y: 6 + nudge, hand: "grip", elbow: "out", front: true }, b: { x: -4, y: 6, hand: "grip", elbow: "out", front: true }, face: { eyes: "up", mouth: "smile" } };
    },
    held: (c) => {
      const drift = [0, 1, 2, 2, 1, 0, -1, -1][c.frame]!;
      if (c.kind === "side") controller(c, Math.round(c.hands[0]![0]) + 2, Math.round(c.hands[0]![1]) - 1);
      else if (c.kind === "front") controller(c, c.top[0], Math.round(c.hands[0]![1]));
      drone(c, (c.kind === "side" ? 24 : 24) + drift, 1 + (c.frame % 4 === 2 ? 1 : 0));
    },
  },
  {
    id: "easel",
    label: "paints at an easel",
    frames: 8,
    ms: 220,
    views: ["right", "back", "left"],
    tags: ["hobby", "work"],
    owner: "riya",
    pose: (f, kind) => {
      const dab = [0, 1, 0, -1, 0, 1, 2, 1][f]!;
      if (kind === "side") return { x: -3, a: { x: 8, y: -1 + dab, hand: "grip", elbow: "down" }, b: { x: 3, y: 7, hand: "grip", elbow: "back" }, face: { eyes: "open" } };
      return { x: -5, b: { x: 2 + (f % 2), y: -4 + dab, hand: "grip", elbow: "out" }, a: { x: 1, y: 10, hand: "grip", elbow: "out" } };
    },
    behind: easel,
    held: (c) => {
      const colours = [C.blue, C.yellow, C.green, C.red];
      const tip = colours[Math.floor(c.frame / 2) % 4]!;
      if (c.kind === "side") {
        brush(c, c.hands[0]!, tip);
        palette(c, Math.round(c.hands[1]![0]) - 1, Math.round(c.hands[1]![1]) + 1);
      } else {
        brush(c, c.hands[1]!, tip);
        palette(c, Math.max(0, Math.round(c.hands[0]![0]) - 3), Math.round(c.hands[0]![1]) + 1);
      }
    },
  },
  {
    id: "stopwatch",
    label: "sprints with a stopwatch",
    frames: 8,
    ms: 70,
    views: ALL,
    tags: ["move", "hobby"],
    owner: "yahya",
    travel: 36,
    pose: (f, kind) => {
      const p = runPose(f, kind);
      // The watch hand stays up where he can see it.
      if (kind === "side") return { ...p, a: { x: 5, y: 3, hand: "grip", elbow: "down" }, face: { eyes: "open", mouth: "flat" } };
      return { ...p, b: { x: -2, y: 7, hand: "grip", elbow: [0, 6], front: true }, face: { mouth: "flat" } };
    },
    held: (c) => stopwatch(c, c.kind === "side" ? c.hands[0]! : c.hands[1]!, c.kind === "side"),
  },
  {
    id: "clipboard",
    label: "ticks off a clipboard",
    frames: 8,
    ms: 260,
    views: FACING,
    tags: ["work", "hobby"],
    owner: "aaesha",
    pose: (f, kind) => {
      const row = Math.min(2, Math.floor(f / 2));
      const lifted = f >= 6;
      if (kind === "side") return { b: { x: 5, y: 7, hand: "grip", elbow: "down" }, a: { x: 6, y: 3 + row * 2 - (lifted ? 2 : 0), hand: "grip", elbow: "down" }, face: { eyes: "down" } };
      return { a: { x: 6, y: 7, hand: "grip", elbow: "down", front: true }, b: { x: -5, y: 4 + row * 2 - (lifted ? 2 : 0), hand: "grip", elbow: "down", front: true }, face: { eyes: "down" } };
    },
    held: (c) => {
      if (c.kind === "side") clipboard(c, c.top[0] + 4, c.top[1] + 3);
      else clipboard(c, c.top[0] - 3, c.top[1] + 3);
    },
  },
  {
    id: "guitar",
    label: "plays the guitar",
    frames: 6,
    ms: 160,
    views: FACING,
    tags: ["hobby", "celebrate"],
    owner: "caitlin",
    pose: (f, kind) => {
      const strum = [0, 2, 0, 2, 1, 2][f]!;
      const s2 = strum > 0 ? 1 : -1;
      if (kind === "side") return { a: { x: 4, y: 9 + s2, hand: "fist", elbow: "back" }, b: { x: 10, y: 2, hand: "grip", elbow: "down", front: true }, face: { eyes: f >= 4 ? "closed" : "open", mouth: "smile" } };
      return { a: { x: 4, y: 9 + s2, hand: "fist", elbow: [0, 6], front: true }, b: { x: -1, y: 3, hand: "grip", elbow: "down", front: true }, face: { eyes: f >= 4 ? "closed" : "open", mouth: "smile" } };
    },
    held: guitar,
    glyphs: (c) => note(c, c.head[0] + 6, c.head[1] + 1),
  },
]);

/** Running, the body level: a long stride, the back foot kicked up, arms bent and pumping. */
function runPose(f: number, kind: Kind): FigurePose {
  if (kind === "side") {
    const along = [5, 3, 0, -3, -5, -3, 0, 3];
    const up = [0, 0, 0, 0, -1, -5, -5, -2];
    const foot: LegJ["foot"][] = ["toe", "flat", "flat", "heel", "heel", "heel", "flat", "flat"];
    const arm = (k: number): Reach => {
      const t = cyc([-1, -0.5, 0, 0.5, 1, 0.5, 0, -0.5], k);
      return { x: Math.round(4 * t), y: t > 0 ? 5 : 7, hand: "fist", elbow: t > 0 ? "down" : "back" };
    };
    return {
      lean: 1,
      fa: { x: cyc(along, f), y: cyc(up, f), foot: cyc(foot, f) },
      fb: { x: cyc(along, f + 4), y: cyc(up, f + 4), foot: cyc(foot, f + 4) },
      a: arm(f),
      b: arm(f + 4),
      face: { mouth: "flat" },
    };
  }
  const up = [0, -2, -3, -1, 0, 0, 0, 0];
  const hand = (k: number): Reach => ({ x: 0, y: cyc([8, 7, 6, 7, 8, 9, 9, 9], k), hand: "fist", elbow: [0, 6] });
  return { fa: { y: cyc(up, f + 4) }, fb: { y: cyc(up, f) }, a: hand(f), b: hand(f + 4), face: { mouth: "flat" } };
}
