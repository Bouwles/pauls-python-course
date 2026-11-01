// Pixel rooms (REDESIGN3_PLAN.md P3): each floor of the Clocktower as pixel art in the cast's
// style (lib/pixel/people.ts): a dark outline, flat colours with one shade, light from the top
// left, a small palette. A room is drawn in two layers, the back (walls, windows, furniture behind
// the people) and the front (the desk or counter the people sit behind), so the residents, drawn
// by <PixelPerson> at the same scale, sit between them. Three states: locked (lights off, the
// furniture under dust sheets), open (lights on, nobody in) and busy (the residents at work).
// The same code draws in the browser (components/art/PixelRoom.tsx) and in Node, for checking.
//
// It is always night at the Clocktower: the clock has said 3:14 for years.

import { FLOORS } from "../cast";
import { mix, type Expression, type Pose } from "./people";

export type RoomState = "locked" | "open" | "busy";

/** Every room is this wide; the roof is taller, for the clock and the sky. */
export const ROOM_W = 160;
export const ROOM_H = 56;
export const ROOF_H = 88;
export const roomHeight = (act: number) => (act >= FLOORS.length ? ROOF_H : ROOM_H);

// ---------------------------------------------------------------- colour

export const OUT = "#1a1418";
/** Shadows lean cool and purple, highlights warm, as in the cast. */
export const dk = (c: string, t = 0.22) => mix(c, "#1a1030", t);
export const lt = (c: string, t = 0.22) => mix(c, "#fff4d6", t);

const C = {
  sky: "#1d2350",
  skyLow: "#283070",
  star: "#f6efc9",
  moon: "#f3e7b0",
  wood: "#9a6a44",
  woodLight: "#b98a5c",
  woodDark: "#6e4a30",
  frame: "#e6dfcc",
  metal: "#8d96a4",
  paper: "#efe9da",
  ink: "#2a2433",
  chalkboard: "#2f4d3e",
  chalk: "#dfe9de",
  cloth: "#d9d3c4",
  bulb: "#ffe7a0",
  bulbOff: "#6b675e",
  red: "#d9504a",
  blue: "#3f72d6",
  yellow: "#f2c23a",
  green: "#4cae66",
  purple: "#8c6bf2",
  orange: "#ee8a3c",
  teal: "#1fb5a8",
  pink: "#f08fb0",
  cream: "#f1e6c8",
  brass: "#c9a043",
  plant: "#4f9a58",
  pot: "#c46a45",
};
const NIGHT = "#090b17";

// ---------------------------------------------------------------- the canvas

/** A layer of pixels. `lit` pixels keep their colour when the lights go out (sky, screens left on). */
export class Layer {
  readonly c: (string | null)[];
  readonly lit: Uint8Array;
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.c = new Array<string | null>(w * h).fill(null);
    this.lit = new Uint8Array(w * h);
  }
  set(x: number, y: number, col: string | null, lit = false) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    this.c[i] = col;
    this.lit[i] = lit ? 1 : 0;
  }
  get(x: number, y: number): string | null {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.c[y * this.w + x]!;
  }
  rect(x: number, y: number, w: number, h: number, col: string, lit = false) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, col, lit);
  }
  hl(x0: number, x1: number, y: number, col: string, lit = false) {
    for (let x = x0; x <= x1; x++) this.set(x, y, col, lit);
  }
  vl(x: number, y0: number, y1: number, col: string, lit = false) {
    for (let y = y0; y <= y1; y++) this.set(x, y, col, lit);
  }
  line(x0: number, y0: number, x1: number, y1: number, col: string, lit = false) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, col, lit);
  }
  disc(cx: number, cy: number, r: number, col: string, lit = false) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.set(cx + x, cy + y, col, lit);
  }
  ring(cx: number, cy: number, r: number, col: string, lit = false) {
    // Midpoint circle: one pixel thick, no gaps.
    let x = r;
    let y = 0;
    let e = 1 - r;
    while (x >= y) {
      for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]] as const) this.set(cx + a, cy + b, col, lit);
      y++;
      if (e < 0) e += 2 * y + 1;
      else {
        x--;
        e += 2 * (y - x) + 1;
      }
    }
  }
  /** An outlined box: highlight on the top and left inside edge, shade on the right and bottom. */
  box(x: number, y: number, w: number, h: number, fill: string, o: { line?: string | false; hi?: string | false; lo?: string | false; round?: boolean; lit?: boolean } = {}) {
    const { line = OUT, hi = lt(fill), lo = dk(fill), round = false, lit = false } = o;
    const corners = round ? ([[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]] as const).map(([a, b]) => [a, b, this.get(a, b), this.lit[b * this.w + a]] as const) : [];
    this.rect(x, y, w, h, fill, lit);
    if (w > 2 && h > 2) {
      if (lo) this.hl(x + 1, x + w - 2, y + h - 2, lo, lit), this.vl(x + w - 2, y + 1, y + h - 2, lo, lit);
      if (hi) this.hl(x + 1, x + w - 2, y + 1, hi, lit), this.vl(x + 1, y + 1, y + h - 2, hi, lit);
    }
    if (line) {
      this.hl(x, x + w - 1, y, line), this.hl(x, x + w - 1, y + h - 1, line);
      this.vl(x, y, y + h - 1, line), this.vl(x + w - 1, y, y + h - 1, line);
    }
    for (const [a, b, col, l] of corners) this.set(a, b, col, l === 1);
  }
  /** Recolour every pixel not marked lit: the lights going out. */
  darken(t = 0.7) {
    for (let i = 0; i < this.c.length; i++) if (this.c[i] && !this.lit[i]) this.c[i] = mix(this.c[i]!, NIGHT, t);
  }
}

/** Pixels for a layer, for a canvas's ImageData or a PNG encoder. */
export function layerRGBA(l: Layer): Uint8ClampedArray {
  const out = new Uint8ClampedArray(l.w * l.h * 4);
  for (let i = 0; i < l.c.length; i++) {
    const c = l.c[i];
    if (!c) continue;
    out[i * 4] = parseInt(c.slice(1, 3), 16);
    out[i * 4 + 1] = parseInt(c.slice(3, 5), 16);
    out[i * 4 + 2] = parseInt(c.slice(5, 7), 16);
    out[i * 4 + 3] = 255;
  }
  return out;
}

/** A steady pseudo-random number in [0, 1) for a seed, so every room draws the same every time. */
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------- residents

/** Where a resident stands: the top-left of their 48x52 grid in the room, and how they behave. */
export interface Spot {
  who: string;
  x: number;
  y: number;
  /** Their face while they get on with it. */
  work: Expression;
  /** What they do now and then: a gesture and the face that goes with it. */
  moments: { pose: Pose; expression: Expression; talking?: boolean }[];
}

// ---------------------------------------------------------------- building blocks

interface Ctx {
  b: Layer;
  f: Layer;
  h: number;
  locked: boolean;
  busy: boolean;
  /** Animation frame: 0 to 7, a step every half second. */
  frame: number;
  clock: { h: number; m: number };
  /** Drawn after the lights go out, in their own colours (cobwebs catching the moonlight). */
  after: ((c: Ctx) => void)[];
}

const W = ROOM_W;
/** The wall's last row; the floor runs from the next one to the bottom. */
const WALL_END = 39;

type FloorKind = "wood" | "tiles" | "carpet" | "concrete" | "grate";

function walls(c: Ctx, wall: string, floor: FloorKind, floorCol: string, skirting = dk(wall, 0.45)) {
  const { b, h } = c;
  b.rect(0, 0, W, WALL_END + 1, wall);
  b.hl(0, W - 1, 0, dk(wall, 0.55));
  b.hl(0, W - 1, 1, dk(wall, 0.25));
  // The corners of the room, a step darker each side.
  b.vl(0, 1, WALL_END, dk(wall, 0.25));
  b.vl(W - 1, 1, WALL_END, dk(wall, 0.25));
  b.hl(0, W - 1, WALL_END - 2, dk(wall, 0.3));
  b.rect(0, WALL_END - 1, W, 2, skirting);
  b.hl(0, W - 1, WALL_END - 1, lt(skirting, 0.18));
  const y0 = WALL_END + 1;
  for (let y = y0; y < h; y++)
    for (let x = 0; x < W; x++) {
      const r = y - y0;
      let col = floorCol;
      if (floor === "wood") {
        const band = Math.floor(r / 4);
        if (r % 4 === 3) col = dk(floorCol, 0.28);
        else if ((x + band * 37) % 46 === 0) col = dk(floorCol, 0.28);
        else if (r % 4 === 0) col = lt(floorCol, 0.1);
      } else if (floor === "tiles") {
        // A checker, the far edge of each row of tiles a line darker.
        const cell = Math.floor(x / 10) + Math.floor(r / 4);
        if (r % 4 === 3) col = dk(floorCol, 0.2);
        else if (cell % 2) col = dk(floorCol, 0.1);
        else if (r % 4 === 0) col = lt(floorCol, 0.12);
      } else if (floor === "carpet") {
        const n = rnd(x * 7 + y * 131);
        if (n > 0.93) col = [C.teal, C.pink, C.yellow][Math.floor(rnd(x + y) * 3)]!;
        else if (n > 0.8) col = lt(floorCol, 0.12);
      } else if (floor === "concrete") {
        const n = rnd(x * 13 + y * 71);
        if (n > 0.97) col = [C.red, C.blue, C.yellow, C.green][Math.floor(rnd(x * 3 + y) * 4)]!;
        else if (n > 0.86) col = dk(floorCol, 0.12);
        else if (r % 6 === 5 && x % 40 < 39) col = dk(floorCol, 0.08);
      } else if (floor === "grate") {
        if (r % 3 === 2 || x % 6 === 5) col = dk(floorCol, 0.35);
        else if (r % 3 === 0 && x % 6 === 0) col = lt(floorCol, 0.15);
      }
      if (r === 0) col = dk(floorCol, 0.45);
      b.set(x, y, col);
    }
}

/** A window onto the night: a frame, two panes of sky with a star or two, a sill. */
function windowAt(c: Ctx, x: number, y: number, w: number, h: number, o: { frame?: string; moon?: boolean; seed?: number } = {}) {
  const { b } = c;
  const frame = o.frame ?? C.frame;
  b.box(x, y, w, h, frame, { lo: dk(frame, 0.2) });
  b.rect(x + 2, y + 2, w - 4, h - 4, C.sky, true);
  b.hl(x + 2, x + w - 3, y + h - 3, C.skyLow, true);
  for (let i = x + 2; i < x + w - 2; i += 2) b.set(i, y + h - 4, C.skyLow, true);
  const seed = o.seed ?? x;
  for (let i = 0; i < 4; i++) {
    const sx = x + 3 + Math.floor(rnd(seed + i * 3) * (w - 6));
    const sy = y + 3 + Math.floor(rnd(seed + i * 5 + 1) * (h - 9));
    b.set(sx, sy, C.star, true);
  }
  if (o.moon) {
    const mx = x + w - 7;
    const my = y + 6;
    b.disc(mx, my, 2, C.moon, true);
    b.set(mx + 1, my - 1, C.sky, true), b.set(mx + 2, my, C.sky, true), b.set(mx + 1, my, C.sky, true);
  }
  b.vl(x + Math.floor(w / 2), y + 1, y + h - 2, frame);
  b.hl(x + 1, x + w - 2, y + Math.floor(h / 2), frame);
  b.hl(x - 1, x + w, y + h, lt(frame, 0.3));
  b.hl(x - 1, x + w, y + h + 1, OUT);
  b.set(x - 1, y + h, OUT), b.set(x + w, y + h, OUT);
}

/** A lamp hanging from the ceiling, lit unless the floor is locked. */
function pendant(c: Ctx, x: number, drop = 4, shade = "#3b4150") {
  const { b } = c;
  b.vl(x, 0, drop, OUT);
  const y = drop + 1;
  b.hl(x - 1, x + 1, y, OUT);
  b.hl(x - 2, x + 2, y + 1, shade), b.set(x - 2, y + 1, OUT), b.set(x + 2, y + 1, OUT);
  b.hl(x - 3, x + 3, y + 2, shade), b.set(x - 3, y + 2, OUT), b.set(x + 3, y + 2, OUT);
  b.set(x - 1, y + 1, lt(shade, 0.3));
  b.hl(x - 3, x + 3, y + 3, OUT);
  b.hl(x - 1, x + 1, y + 3, c.locked ? C.bulbOff : C.bulb, !c.locked);
  b.set(x, y + 4, c.locked ? C.bulbOff : C.bulb, !c.locked);
}

/** A desk in front of where someone sits: the top, a front panel, a drawer. In the front layer. */
function desk(c: Ctx, x: number, w: number, top = C.woodLight, front = C.wood) {
  const { f } = c;
  const y = 41;
  f.box(x, y, w, 13, front, { hi: false });
  f.hl(x + 1, x + w - 2, y + 1, lt(top, 0.25));
  f.hl(x + 1, x + w - 2, y + 2, top);
  f.hl(x + 1, x + w - 2, y + 3, dk(top, 0.3));
  f.hl(x, x + w - 1, y + 4, OUT);
  // A drawer on the right, a panel line on the left.
  f.box(x + w - 16, y + 6, 12, 5, front, { hi: lt(front, 0.15) });
  f.hl(x + w - 12, x + w - 9, y + 8, OUT);
  f.vl(x + 4, y + 6, y + 10, dk(front, 0.25));
  f.hl(x + 4, x + w - 20, y + 6, dk(front, 0.25));
}

/** A chair's back, behind where someone sits (hidden once they do). */
function chair(c: Ctx, cx: number, col = "#3d3a4a") {
  if (c.locked) return;
  c.b.box(cx - 7, 27, 15, 15, col, { round: true, hi: false });
  c.b.box(cx - 5, 29, 11, 10, lt(col, 0.18), { line: dk(col, 0.45), hi: lt(col, 0.4), lo: false, round: true });
}

/**
 * A small drawing from rows of letters, outlined in the cast's dark line. `paint` gives each
 * letter's colour from its row and column (null leaves the pixel alone).
 */
function bitmap(L: Layer, x: number, y: number, rows: string[], paint: (ch: string, i: number, j: number) => string | null, o: { outline?: boolean; lit?: boolean } = {}) {
  const { outline = true, lit = false } = o;
  const mine = new Set<string>();
  rows.forEach((row, j) =>
    [...row].forEach((ch, i) => {
      if (ch === " ") return;
      const col = paint(ch, i, j);
      if (!col) return;
      L.set(x + i, y + j, col, lit);
      mine.add(`${i},${j}`);
    }),
  );
  if (!outline) return;
  for (const key of mine) {
    const [i, j] = key.split(",").map(Number) as [number, number];
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (!mine.has(`${i + di},${j + dj}`)) L.set(x + i + di, y + j + dj, OUT);
  }
}

/** A dust sheet thrown over something, with folds and a ragged hem, outlined. */
function sheet(L: Layer, x: number, y: number, w: number, h: number) {
  const cloth = C.cloth;
  const mask = new Set<number>();
  for (let r = 0; r < h; r++) {
    const inset = r === 0 ? 2 : r === 1 ? 1 : 0;
    const flare = r >= h - 2 ? 1 : 0;
    const x0 = x + inset - flare;
    const x1 = x + w - 1 - inset + flare;
    for (let xx = x0; xx <= x1; xx++) {
      if (r === h - 1 && (xx - x) % 4 === 2) continue;
      let col = cloth;
      if (xx <= x0 + 1 || r <= 1) col = lt(cloth, 0.35);
      if (xx >= x1 - 1) col = dk(cloth, 0.25);
      if (r >= 3 && (xx - x) % 9 === 4 && xx > x0 + 2 && xx < x1 - 2) col = dk(cloth, 0.2);
      if (r >= Math.floor(h * 0.6) && (xx - x) % 9 === 7 && xx < x1 - 2) col = dk(cloth, 0.12);
      L.set(xx, y + r, col);
      mask.add((y + r) * L.w + xx);
    }
  }
  const edge: [number, number][] = [];
  for (const i of mask) {
    const px = i % L.w;
    const py = Math.floor(i / L.w);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = px + dx;
      const ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h) continue;
      if (!mask.has(ny * L.w + nx)) edge.push([nx, ny]);
    }
  }
  for (const [ex, ey] of edge) L.set(ex, ey, OUT);
}

/** Cobwebs in the top corners of a shut room. */
function cobweb(c: Ctx) {
  c.after.push(({ b }) => {
    const web = "#5d6274";
    for (const [mx, sx] of [[0, 1], [W - 1, -1]] as const) {
      b.line(mx, 2, mx + sx * 9, 2, web), b.line(mx, 2, mx + sx * 7, 8, web), b.line(mx, 2, mx, 10, web);
      b.line(mx + sx * 4, 2, mx + sx * 3, 5, web), b.line(mx + sx * 3, 5, mx, 6, web);
      b.line(mx + sx * 8, 2, mx + sx * 6, 7, web), b.line(mx + sx * 6, 7, mx, 10, web);
    }
  });
}

/** A potted plant on the floor. */
function plant(L: Layer, x: number, base: number, tall = 14) {
  const top = base - tall;
  for (const [a, bb, cc, d] of [[x + 4, base - 6, x, top + 3], [x + 5, base - 6, x + 5, top], [x + 6, base - 6, x + 10, top + 2], [x + 5, base - 6, x + 1, top + 7], [x + 5, base - 6, x + 9, top + 7]] as const) {
    L.line(a, bb, cc, d, C.plant);
    L.set(cc, d, lt(C.plant, 0.3));
    L.set(cc + 1, d, dk(C.plant, 0.2));
  }
  L.box(x + 1, base - 6, 9, 6, C.pot, { round: true });
  L.hl(x + 1, x + 9, base - 6, OUT);
  L.hl(x + 2, x + 8, base - 5, lt(C.pot, 0.3));
}

/** A mug, steaming when someone's in. */
function mug(c: Ctx, x: number, y: number, col: string) {
  const { f } = c;
  f.box(x, y - 5, 5, 5, col, { hi: lt(col, 0.3) });
  f.set(x + 5, y - 4, OUT), f.set(x + 6, y - 3, OUT), f.set(x + 5, y - 2, OUT);
  if (c.busy) {
    const s = c.frame % 2;
    f.set(x + 1 + s, y - 7, C.paper), f.set(x + 2 - s, y - 8, C.paper), f.set(x + 3 - s, y - 9, C.paper);
  }
}

/** A row of book spines standing on a shelf whose top is at `y`. */
function books(L: Layer, x0: number, x1: number, y: number, seed: number) {
  const cols = [C.red, C.blue, C.yellow, C.green, C.purple, C.orange, C.teal, C.cream, C.pink];
  let x = x0;
  let i = 0;
  while (x < x1 - 2) {
    const w = 2 + Math.floor(rnd(seed + i) * 3);
    const h = 6 + Math.floor(rnd(seed + i * 7) * 4);
    if (x + w > x1) break;
    const col = cols[Math.floor(rnd(seed + i * 13) * cols.length)]!;
    L.box(x, y - h, w + 1, h + 1, col, { hi: lt(col, 0.3), lo: false });
    if (h > 7) L.hl(x + 1, x + w - 1, y - h + 3, lt(col, 0.45));
    x += w + (rnd(seed + i * 17) > 0.8 ? 2 : 0);
    i++;
  }
}

/** A plank shelf on brackets. */
function shelf(L: Layer, x0: number, x1: number, y: number) {
  L.hl(x0, x1, y, C.woodLight);
  L.hl(x0, x1, y + 1, C.woodDark);
  L.hl(x0 - 1, x1 + 1, y + 2, OUT);
  L.hl(x0 - 1, x1 + 1, y - 1, OUT);
  L.set(x0 - 1, y, OUT), L.set(x0 - 1, y + 1, OUT), L.set(x1 + 1, y, OUT), L.set(x1 + 1, y + 1, OUT);
  for (const bx of [x0 + 3, x1 - 3]) L.vl(bx, y + 3, y + 5, OUT), L.set(bx + 1, y + 3, OUT);
}

/** A screen showing something (lit): an outlined dark panel. */
function screen(L: Layer, x: number, y: number, w: number, h: number, bg = "#14202c") {
  L.box(x, y, w, h, "#2b2d36", { hi: "#4a4d5a", lo: false });
  L.rect(x + 2, y + 2, w - 4, h - 4, bg, true);
}

/** A tiny sprite on a screen, from rows of "#" marks. */
function sprite(L: Layer, x: number, y: number, rows: string[], col: string) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => ch === "#" && L.set(x + i, y + j, col, true)));
}

// ---------------------------------------------------------------- the rooms

type Draw = (c: Ctx) => void;

interface RoomDef {
  draw: Draw;
  residents: Spot[];
}

// Who sits where. People are 48x52; the desk's top hides everything below their shoulders.
const AT_DESK = 2;

const ROOMS: Record<number, RoomDef> = {
  // Paul's classroom: the chalkboard, the big desk, the duck.
  1: {
    residents: [
      {
        who: "paul",
        x: 80,
        y: AT_DESK,
        work: "neutral",
        moments: [
          { pose: "point", expression: "talking", talking: true },
          { pose: "think", expression: "thinking" },
          { pose: "wave", expression: "pleased" },
          { pose: "idle", expression: "pleased" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      const wall = "#c9a46b";
      walls(c, wall, "wood", "#8a5b3b");
      // Panelling below a rail.
      b.rect(1, 25, W - 2, 12, "#8f6642");
      b.hl(1, W - 2, 24, lt("#8f6642", 0.35));
      b.hl(1, W - 2, 25, OUT);
      for (let x = 12; x < W - 4; x += 22) b.box(x, 28, 16, 7, "#8f6642", { line: dk("#8f6642", 0.35), hi: lt("#8f6642", 0.15), lo: false });
      pendant(c, 66, 5);
      windowAt(c, 136, 5, 18, 22, { moon: true });
      // The chalkboard, with Python on it and a doodle of the duck.
      b.box(6, 4, 56, 24, C.wood, { hi: C.woodLight, lo: C.woodDark });
      b.rect(9, 7, 50, 18, C.chalkboard);
      b.hl(9, 58, 7, dk(C.chalkboard, 0.3));
      b.vl(9, 7, 24, dk(C.chalkboard, 0.3));
      b.hl(6, 61, 28, C.woodDark), b.hl(5, 62, 29, OUT);
      b.rect(46, 26, 4, 1, C.chalk), b.rect(52, 26, 5, 1, "#d8a0a0");
      if (!c.locked) {
        const ch = C.chalk;
        const dim = "#9db7a6";
        const lines: [number, number, [number, number][]][] = [
          [11, 10, [[0, 3], [4, 6], [11, 3]]],
          [15, 13, [[0, 5], [6, 9]]],
          [15, 16, [[0, 2], [3, 1], [5, 6]]],
          [11, 19, [[0, 4], [5, 7]]],
        ];
        const shown = c.busy ? lines.length : 3;
        lines.slice(0, shown).forEach(([x, y, words], i) => words.forEach(([o, n]) => b.hl(x + o, x + o + n - 1, y, i === 0 ? ch : dim)));
        if (c.busy) b.hl(15, 15 + (c.frame % 4) * 2 + 2, 22, ch);
        // The duck, in chalk.
        const d = [
          "   ###     ",
          "  #   #    ",
          "###  o#    ",
          "  #   #### ",
          "  #      # ",
          "   #    #  ",
          "    ####   ",
        ];
        d.forEach((row, j) => [...row].forEach((k, i) => k !== " " && b.set(45 + i, 11 + j, ch)));
      }
      // A plant under the window.
      if (!c.locked) plant(b, 140, 50, 16);
      chair(c, 104, "#5a3a2a");
      if (c.locked) {
        sheet(c.f, 70, 28, 64, 26);
        sheet(c.b, 138, 36, 14, 15);
        cobweb(c);
        return;
      }
      desk(c, 72, 62);
      const { f } = c;
      // Books on the left of the desk, the duck on the right.
      f.box(76, 37, 12, 3, C.blue, { hi: lt(C.blue, 0.3), lo: false });
      f.box(77, 35, 10, 3, C.red, { hi: lt(C.red, 0.3), lo: false });
      f.box(76, 33, 11, 3, C.green, { hi: lt(C.green, 0.3), lo: false });
      // The duck: yellow, an orange beak, an eye.
      const duck = [
        "    ###   ",
        "   #####  ",
        "   ##o##bb",
        "#  #####bb",
        "##########",
        "##########",
        " ######## ",
      ];
      duck.forEach((row, j) =>
        [...row].forEach((k, i) => {
          if (k === "#") f.set(120 + i, 34 + j, j < 2 || i < 2 ? lt(C.yellow, 0.25) : j > 5 ? dk(C.yellow, 0.2) : C.yellow);
          if (k === "o") f.set(120 + i, 34 + j, OUT);
          if (k === "b") f.set(120 + i, 34 + j, C.orange);
        }),
      );
      for (let i = 119; i <= 130; i++) if (!f.get(i, 33) && f.get(i, 34)) f.set(i, 33, OUT);
      f.set(119, 37, OUT), f.set(119, 38, OUT), f.set(119, 39, OUT), f.set(119, 40, OUT), f.set(130, 36, OUT), f.set(130, 37, OUT), f.set(122, 34, OUT), f.set(123, 33, OUT);
      if (c.busy) mug(c, 92, 41, C.cream);
    },
  },

  // Caitlin's floor: desks, shelves of notebooks, a kettle, a bike hung on the wall.
  2: {
    residents: [
      {
        who: "caitlin",
        x: 56,
        y: AT_DESK,
        work: "thinking",
        moments: [
          { pose: "idle", expression: "laughing" },
          { pose: "thumbs", expression: "pleased" },
          { pose: "point", expression: "talking", talking: true },
          { pose: "think", expression: "thinking" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      walls(c, "#a596cf", "wood", "#b08a5e");
      pendant(c, 108, 3);
      // Shelves of notebooks.
      for (const y of [12, 23]) {
        shelf(b, 4, 44, y);
        if (!c.locked) books(b, 6, 43, y - 1, y * 3);
      }
      // The counter and the kettle.
      if (c.locked) sheet(b, 3, 26, 40, 27);
      else {
        b.box(3, 33, 40, 20, C.woodLight, { lo: C.wood });
        b.hl(3, 42, 35, OUT);
        b.vl(23, 36, 51, OUT);
        b.set(20, 43, OUT), b.set(26, 43, OUT);
        // The kettle: cream, a dark handle, a spout to the left.
        b.box(10, 25, 10, 8, C.cream, { round: true });
        b.hl(12, 17, 23, OUT), b.set(11, 24, OUT), b.set(18, 24, OUT);
        b.line(9, 27, 7, 25, OUT), b.set(6, 24, OUT);
        b.hl(11, 18, 30, dk(C.cream, 0.15));
        b.box(28, 27, 6, 6, C.teal, { hi: lt(C.teal, 0.3) });
        b.set(34, 29, OUT), b.set(35, 30, OUT);
        if (c.busy) {
          const s = c.frame % 3;
          for (let i = 0; i < 4; i++) b.set(6 - ((i + s) % 2), 22 - i * 2 - (s % 2), C.paper);
        }
      }
      // The bike on the wall.
      if (c.locked) sheet(b, 110, 4, 46, 24);
      else {
        const tyre = "#2b2a30";
        const frame = C.teal;
        for (const [wx, wy] of [[120, 16], [146, 16]] as const) {
          b.ring(wx, wy, 8, OUT);
          b.ring(wx, wy, 7, tyre);
          b.ring(wx, wy, 6, OUT);
          b.line(wx - 5, wy, wx + 5, wy, "#8f8a9c"), b.line(wx, wy - 5, wx, wy + 5, "#8f8a9c");
          b.set(wx, wy, OUT);
        }
        b.line(120, 16, 128, 8, frame), b.line(128, 8, 140, 8, frame), b.line(130, 18, 140, 9, frame), b.line(120, 16, 130, 18, frame), b.line(128, 8, 130, 18, frame), b.line(140, 8, 146, 16, frame);
        b.line(121, 15, 129, 7, OUT), b.line(129, 7, 141, 7, OUT);
        b.hl(125, 130, 5, OUT), b.hl(126, 129, 6, "#3a3540");
        b.hl(139, 143, 4, OUT), b.vl(140, 5, 7, OUT);
        for (const hx of [121, 145]) b.vl(hx, 3, 6, "#5c5868"), b.set(hx, 2, OUT);
      }
      chair(c, 80, "#6a4c8a");
      if (c.locked) {
        sheet(c.f, 52, 30, 60, 24);
        cobweb(c);
        return;
      }
      desk(c, 52, 60);
      const { f } = c;
      // An open notebook with a pencil, a stack of closed ones.
      f.hl(88, 106, 41, OUT);
      f.hl(89, 97, 40, C.paper), f.hl(99, 105, 40, C.paper), f.set(98, 40, dk(C.paper, 0.3));
      f.hl(88, 96, 39, OUT), f.hl(98, 106, 39, OUT), f.set(97, 40, OUT);
      f.line(100, 38, 106, 35, C.yellow), f.set(99, 38, OUT);
      f.box(56, 37, 14, 3, C.orange, { hi: lt(C.orange, 0.3), lo: false });
      f.box(57, 34, 12, 4, C.purple, { hi: lt(C.purple, 0.3), lo: false });
      if (c.busy) mug(c, 74, 41, C.pink);
    },
  },

  // Riya's floor: easels and a drawing tablet, prints pinned to every wall, a small arcade cabinet.
  3: {
    residents: [
      {
        who: "riya",
        x: 58,
        y: AT_DESK,
        work: "neutral",
        moments: [
          { pose: "idle", expression: "pleased" },
          { pose: "point", expression: "talking", talking: true },
          { pose: "thumbs", expression: "proud" },
          { pose: "think", expression: "thinking" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      walls(c, "#86b896", "concrete", "#9a9ca3");
      pendant(c, 116, 3);
      // Prints pinned up: little pictures, each with a pin.
      const prints: [number, number, number, number, string[]][] = [
        [44, 4, 10, 12, [C.yellow, C.orange]],
        [124, 3, 12, 9, [C.blue, C.cream]],
        [140, 5, 10, 11, [C.pink, C.purple]],
        [104, 6, 11, 8, [C.teal, C.yellow]],
      ];
      prints.forEach(([x, y, w, h, [a, z]], i) => {
        if (c.locked) return;
        b.box(x, y, w, h, C.paper, { hi: false, lo: dk(C.paper, 0.15) });
        b.rect(x + 2, y + 2, w - 4, h - 4, a!);
        if (i % 2) b.disc(x + Math.floor(w / 2), y + Math.floor(h / 2), 2, z!);
        else b.rect(x + 2, y + h - 5, w - 4, 3, z!);
        b.set(x + Math.floor(w / 2), y, C.red), b.set(x + Math.floor(w / 2), y - 1, OUT);
      });
      // The easel, with a painting of a hill at night.
      if (c.locked) sheet(b, 4, 12, 34, 42);
      else {
        b.line(21, 10, 10, 53, OUT), b.line(22, 10, 11, 53, C.wood);
        b.line(22, 10, 33, 53, OUT), b.line(23, 10, 34, 53, C.wood);
        b.line(22, 12, 22, 52, C.woodDark);
        b.box(7, 13, 31, 22, C.paper, { hi: false, lo: false });
        b.rect(9, 15, 27, 18, "#5d7fd0");
        b.disc(29, 19, 2, C.yellow);
        for (let x = 9; x <= 35; x++) {
          const top = 26 + Math.round(Math.sin((x - 9) / 5) * 3);
          for (let y = top; y <= 32; y++) b.set(x, y, y === top ? lt(C.green, 0.3) : C.green);
        }
        b.box(5, 34, 35, 3, C.woodLight, { hi: false });
        // A palette of paint on the ledge.
        b.set(9, 33, C.red), b.set(10, 33, C.yellow), b.set(12, 33, C.blue);
      }
      // A small arcade cabinet in the corner.
      if (c.locked) sheet(b, 134, 14, 22, 40);
      else {
        const body = "#c94a4a";
        b.box(135, 14, 20, 39, body, { hi: lt(body, 0.25) });
        b.box(136, 14, 18, 5, C.yellow, { lit: true });
        b.hl(139, 151, 16, C.red, true);
        screen(b, 137, 20, 16, 12, "#141a2e");
        const f0 = c.frame % 2;
        sprite(b, 141, 23, ["  #  ", " ### ", "## ##", "#   #"].map((r) => (f0 ? r : r.replace(/#$/, " "))), C.green);
        b.set(146 + f0 * 2, 29, C.yellow, true);
        b.box(136, 32, 18, 5, dk(body, 0.2), { hi: false });
        b.vl(141, 30, 33, OUT), b.disc(141, 30, 1, C.red);
        b.set(146, 34, C.yellow), b.set(149, 34, C.blue), b.set(152, 34, C.green);
        b.box(141, 42, 8, 6, dk(body, 0.25), { hi: false });
        b.vl(145, 44, 45, C.yellow);
      }
      chair(c, 82, "#3a6a4a");
      if (c.locked) {
        sheet(c.f, 54, 30, 60, 24);
        cobweb(c);
        return;
      }
      desk(c, 54, 60, "#d9d4c9", "#a9a59a");
      const { f } = c;
      // The drawing tablet, propped up, with its pen; jars of brushes.
      f.box(94, 33, 16, 9, "#2b2d36", { hi: "#4a4d5a", lo: false });
      f.line(110, 41, 112, 33, OUT), f.set(111, 36, "#4a4d5a");
      f.box(58, 35, 6, 6, "#7fb7d8", { hi: lt("#7fb7d8", 0.3) });
      f.vl(59, 30, 34, C.woodLight), f.vl(61, 31, 34, C.red), f.vl(62, 29, 34, C.woodDark);
      f.set(59, 29, C.blue), f.set(62, 28, C.yellow);
      if (c.busy) {
        // Paper with a sketch, a pen moving on the tablet.
        f.hl(70, 82, 40, C.paper), f.hl(70, 82, 39, OUT);
        f.set(73 + (c.frame % 4) * 2, 40, C.ink);
      }
    },
  },

  // Neil's floor: a racing simulator rig, a model rocket on the shelf, sticky notes and string.
  4: {
    residents: [
      {
        who: "neil",
        x: 56,
        y: AT_DESK,
        work: "thinking",
        moments: [
          { pose: "point", expression: "talking", talking: true },
          { pose: "thumbs", expression: "pleased" },
          { pose: "cheer", expression: "laughing" },
          { pose: "think", expression: "thinking" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      walls(c, "#6aa9a2", "tiles", "#7d838c");
      pendant(c, 46, 3);
      // A cork board of sticky notes joined by red string.
      b.box(3, 4, 40, 27, "#c4945f", { hi: lt("#c4945f", 0.2), lo: dk("#c4945f", 0.2) });
      for (let i = 0; i < 30; i++) b.set(5 + Math.floor(rnd(i * 3) * 36), 6 + Math.floor(rnd(i * 5) * 23), dk("#c4945f", 0.25));
      if (!c.locked) {
        const notes: [number, number, string][] = [
          [7, 7, C.yellow],
          [22, 9, C.pink],
          [33, 7, "#8ec5ef"],
          [12, 19, "#8ec5ef"],
          [27, 20, C.yellow],
          [35, 18, "#a9e08a"],
        ];
        const centre = (n: [number, number, string]) => [n[0] + 2, n[1] + 2] as const;
        for (const [a, z] of [[0, 1], [1, 2], [1, 4], [0, 3], [3, 4], [4, 5], [2, 5]] as const) {
          const [x0, y0] = centre(notes[a]!);
          const [x1, y1] = centre(notes[z]!);
          b.line(x0, y0, x1, y1, C.red);
        }
        for (const [x, y, col] of notes) {
          b.rect(x, y, 5, 5, col);
          b.hl(x, x + 4, y + 4, dk(col, 0.2));
          b.set(x + 2, y, OUT);
        }
      }
      // The model rocket on its shelf.
      shelf(b, 138, 157, 15);
      if (!c.locked) {
        const r = [
          "  #  ",
          " ### ",
          " ### ",
          " #o# ",
          " ### ",
          " ### ",
          " ### ",
          "f###f",
          "f #f ",
        ];
        r.forEach((row, j) =>
          [...row].forEach((k, i) => {
            const x = 145 + i;
            const y = 5 + j;
            if (k === "#") b.set(x, y, j < 2 ? C.red : i === 3 ? dk(C.paper, 0.2) : C.paper);
            if (k === "o") b.set(x, y, C.blue);
            if (k === "f") b.set(x, y, C.red);
          }),
        );
        b.set(147, 4, OUT), b.set(146, 5, OUT), b.set(148, 5, OUT);
      } else sheet(b, 143, 4, 9, 11);
      // The racing simulator: a screen with the track, the wheel, the bucket seat.
      if (c.locked) sheet(b, 112, 18, 44, 36);
      else {
        b.vl(124, 33, 52, OUT), b.vl(125, 33, 52, "#3a3d46"), b.hl(119, 130, 52, OUT);
        screen(b, 112, 17, 26, 17, "#58a14f");
        // The track running into the distance, its stripes moving while Neil drives.
        const s = c.busy ? c.frame % 4 : 0;
        for (let y = 19; y <= 31; y++) {
          const half = Math.round((y - 18) * 0.85);
          for (let x = 125 - half; x <= 124 + half; x++) b.set(x, y, "#5b5f6a", true);
          b.set(125 - half - 1, y, (y + s) % 4 < 2 ? C.red : C.paper, true);
          b.set(124 + half + 1, y, (y + s) % 4 < 2 ? C.red : C.paper, true);
          if ((y + s) % 4 === 0) b.set(124, y, C.paper, true), b.set(125, y, C.paper, true);
        }
        b.hl(114, 135, 19, "#2c3a72", true), b.hl(114, 135, 20, "#2c3a72", true);
        // The wheel, on its post.
        b.vl(140, 38, 52, OUT), b.vl(141, 38, 52, "#3a3d46");
        b.ring(140, 35, 4, OUT), b.ring(140, 35, 3, "#2b2a30");
        b.set(140, 35, C.red);
        b.hl(137, 143, 52, OUT);
        // The bucket seat.
        const seat = "#c43d3d";
        b.box(147, 22, 10, 20, seat, { round: true });
        b.box(144, 38, 13, 8, seat, { round: true });
        b.vl(151, 24, 37, dk(seat, 0.3));
        b.vl(150, 46, 52, OUT), b.vl(154, 46, 52, OUT), b.hl(146, 157, 52, OUT);
      }
      chair(c, 80, "#2e5f5a");
      if (c.locked) {
        sheet(c.f, 52, 30, 56, 24);
        cobweb(c);
        return;
      }
      desk(c, 52, 56, "#c8ccd2", "#8e959f");
      const { f } = c;
      // A laptop (we see its lid) and a red model car.
      f.box(56, 33, 16, 9, "#9aa3ae", { hi: lt("#9aa3ae", 0.3) });
      f.set(63, 37, C.paper), f.set(64, 37, C.paper);
      f.box(92, 37, 12, 4, C.red, { hi: lt(C.red, 0.3), lo: false });
      f.box(95, 35, 6, 3, C.red, { hi: false, lo: false });
      f.rect(96, 36, 4, 1, "#8ec5ef");
      f.disc(94, 41, 1, OUT), f.disc(101, 41, 1, OUT);
      if (c.busy) mug(c, 82, 41, C.paper);
    },
  },

  // Yahya's floor: filing cabinets, a huge wall chart, a weather station outside the window.
  5: {
    residents: [
      {
        who: "yahya",
        x: 66,
        y: AT_DESK,
        work: "unimpressed",
        moments: [
          { pose: "point", expression: "talking", talking: true },
          { pose: "think", expression: "thinking" },
          { pose: "idle", expression: "proud" },
          { pose: "thumbs", expression: "neutral" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      walls(c, "#7590c4", "carpet", "#4b5672");
      pendant(c, 108, 3);
      // The wall chart: bars, a line, axes.
      b.box(3, 3, 48, 31, C.paper, { hi: false, lo: dk(C.paper, 0.15) });
      b.set(5, 3, C.red), b.set(48, 3, C.red);
      if (!c.locked) {
        b.hl(7, 22, 6, C.ink);
        b.vl(7, 9, 30, C.ink), b.hl(7, 47, 30, C.ink);
        const bars = [8, 12, 10, 15, 13, 18, 16, 20];
        const cols = [C.blue, C.blue, C.orange, C.blue, C.blue, C.orange, C.blue, C.green];
        bars.forEach((hgt, i) => b.rect(10 + i * 5, 30 - hgt, 3, hgt, cols[i]!));
        let prev: [number, number] | null = null;
        bars.forEach((hgt, i) => {
          const p: [number, number] = [11 + i * 5, 30 - hgt - 4];
          if (prev) b.line(prev[0], prev[1], p[0], p[1], C.red);
          b.set(p[0], p[1], OUT);
          prev = p;
        });
      }
      // The window, and the weather station on its pole outside.
      windowAt(c, 55, 6, 16, 22, { seed: 9 });
      b.vl(66, 14, 25, "#9aa3ae", true);
      const spin = c.busy || !c.locked ? c.frame % 2 : 0;
      b.hl(63, 69, 13, "#9aa3ae", true);
      b.set(spin ? 62 : 63, 12, C.paper, true), b.set(spin ? 70 : 69, 12, C.paper, true), b.set(66, spin ? 11 : 12, C.paper, true);
      b.set(66, 13, C.red, true);
      // Filing cabinets.
      for (const x of [120, 139]) {
        if (c.locked) {
          sheet(b, x - 1, 7, 20, 47);
          continue;
        }
        const m = "#8a97a8";
        b.box(x, 8, 18, 45, m);
        for (let d = 0; d < 4; d++) {
          const y = 10 + d * 11;
          b.box(x + 2, y, 14, 10, m, { line: dk(m, 0.45) });
          b.box(x + 6, y + 2, 6, 3, C.paper, { line: dk(m, 0.45), hi: false, lo: false });
          b.hl(x + 7, x + 10, y + 6, OUT);
        }
      }
      if (c.busy && !c.locked) {
        // Folders piled on the cabinet, waiting to be filed.
        b.box(122, 5, 14, 3, C.yellow, { hi: lt(C.yellow, 0.3), lo: false });
        b.box(123, 3, 12, 3, C.blue, { hi: lt(C.blue, 0.3), lo: false });
        b.box(121, 1, 13, 3, C.paper, { hi: false, lo: false });
      }
      chair(c, 90, "#2f3c5e");
      if (c.locked) {
        sheet(c.f, 62, 30, 60, 24);
        cobweb(c);
        return;
      }
      desk(c, 62, 58, "#c7b28e", "#8e7553");
      const { f } = c;
      // A laptop and a desk lamp.
      f.box(97, 33, 16, 9, "#2d313b", { hi: "#4b5160" });
      f.disc(105, 37, 1, C.paper);
      f.line(70, 41, 66, 33, OUT), f.line(66, 33, 72, 29, OUT);
      f.box(70, 27, 6, 4, C.yellow, { hi: false });
      f.hl(71, 74, 30, C.bulb, true);
      f.hl(67, 73, 41, OUT);
      if (c.busy) {
        f.box(79, 38, 12, 3, C.blue, { hi: false, lo: false });
        f.box(80, 36, 10, 2, C.paper, { hi: false, lo: false });
      }
    },
  },

  // Paul's other floor: whiteboards full of graphs, a coffee machine, a laptop training all night.
  6: {
    residents: [
      {
        who: "paul",
        x: 58,
        y: AT_DESK,
        work: "thinking",
        moments: [
          { pose: "point", expression: "talking", talking: true },
          { pose: "cheer", expression: "laughing" },
          { pose: "think", expression: "thinking" },
          { pose: "thumbs", expression: "proud" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      walls(c, "#a9b6ae", "tiles", "#c9c3b4");
      pendant(c, 110, 3);
      // Two whiteboards.
      const board = "#f5f6f2";
      const rim = "#b9c0c8";
      b.box(3, 3, 52, 28, rim, { hi: lt(rim, 0.4) });
      b.rect(5, 5, 48, 24, board);
      b.hl(6, 52, 31, rim), b.hl(5, 53, 32, OUT);
      b.box(116, 3, 40, 22, rim, { hi: lt(rim, 0.4) });
      b.rect(118, 5, 36, 18, board);
      b.hl(117, 155, 25, OUT);
      if (!c.locked) {
        // A loss curve falling, and its validation twin.
        b.vl(8, 7, 27, C.ink), b.hl(8, 50, 27, C.ink);
        for (let x = 9; x <= 49; x++) {
          const t = (x - 9) / 40;
          b.set(x, 8 + Math.round(17 * (1 - Math.exp(-t * 4))), C.red);
          if (x % 2 === 0) b.set(x, 11 + Math.round(13 * (1 - Math.exp(-t * 3.2))), C.blue);
        }
        b.hl(36, 40, 8, C.ink), b.hl(42, 47, 8, C.ink), b.hl(36, 44, 11, "#7f8794");
        // A scatter with its line, and a little network.
        b.vl(120, 7, 21, C.ink), b.hl(120, 140, 21, C.ink);
        for (let i = 0; i < 11; i++) b.set(123 + i * 1.6, 19 - i * 1.1 + (rnd(i) - 0.5) * 4, C.blue);
        b.line(122, 20, 139, 8, C.red);
        for (const [x, y] of [[145, 9], [145, 17], [151, 13]] as const) b.disc(x, y, 1, C.ink);
        for (const [x, y] of [[145, 9], [145, 17]] as const) b.line(x, y, 151, 13, "#7f8794");
      }
      // The coffee machine on its counter.
      if (c.locked) sheet(b, 120, 24, 37, 30);
      else {
        b.box(120, 34, 37, 19, C.woodLight, { lo: C.wood });
        b.hl(120, 156, 36, OUT);
        b.vl(138, 37, 51, OUT);
        const m = "#3c3f4a";
        b.box(126, 21, 16, 14, m, { hi: lt(m, 0.25) });
        b.rect(128, 23, 12, 3, "#5a5e6c");
        b.set(137, 24, C.red, true);
        b.rect(131, 27, 5, 2, OUT);
        b.box(131, 30, 5, 4, C.paper, { hi: false });
        if (c.busy) {
          const s = c.frame % 2;
          b.set(132 + s, 28, C.paper), b.set(134 - s, 27, C.paper);
        }
        plant(b, 145, 34, 10);
      }
      chair(c, 82, "#3a3d4e");
      if (c.locked) {
        sheet(c.f, 54, 26, 58, 28);
        cobweb(c);
        return;
      }
      desk(c, 54, 58, "#e3e1da", "#b3b0a6");
      const { f } = c;
      // A screen turned our way: training, epoch by epoch, all night.
      screen(f, 56, 27, 22, 14, "#14202c");
      const done = 3 + ((c.frame + 2) % 8) * 2;
      f.box(59, 35, 16, 4, "#14202c", { line: "#4a6a8a", hi: false, lo: false });
      f.hl(60, 59 + Math.min(14, done), 36, C.green, true), f.hl(60, 59 + Math.min(14, done), 37, C.green, true);
      for (let x = 59; x <= 74; x++) f.set(x, 29 + Math.round(4 * Math.exp(-(x - 59) / 4)), C.yellow, true);
      f.box(64, 41, 6, 1, OUT, { hi: false, lo: false });
      if (c.busy) mug(c, 100, 41, "#f5f6f2");
    },
  },

  // Aaesha's floor: the clock's gears behind glass, a rack of servers, a model of a brain.
  7: {
    residents: [
      {
        who: "aaesha",
        x: 62,
        y: AT_DESK,
        work: "thinking",
        moments: [
          { pose: "point", expression: "talking", talking: true },
          { pose: "wave", expression: "pleased" },
          { pose: "think", expression: "thinking" },
          { pose: "idle", expression: "surprised" },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      const wall = "#8f6a66";
      walls(c, wall, "grate", "#5c6170", "#3a3440");
      // Riveted panels and a copper pipe along the ceiling.
      for (let x = 30; x < W; x += 32) b.vl(x, 2, 36, dk(wall, 0.2));
      for (let x = 34; x < W; x += 32) for (const y of [5, 33]) b.set(x, y, lt(wall, 0.3));
      b.rect(58, 3, 70, 3, "#c27a4a"), b.hl(58, 127, 3, lt("#c27a4a", 0.3)), b.hl(58, 127, 2, OUT), b.hl(58, 127, 6, OUT);
      for (const x of [74, 100]) b.box(x, 2, 4, 5, "#a56638", { hi: false });
      // The clock's gears, behind glass.
      b.box(3, 3, 50, 34, "#6b5130", { hi: "#8a6a40", lo: "#4a3820" });
      const glow = !c.locked;
      b.rect(6, 6, 44, 28, "#231c2c", glow);
      const turn = c.locked ? 0 : c.frame;
      gear(b, 19, 21, 10, 10, turn * 0.2, C.brass, glow);
      gear(b, 37, 12, 6, 8, -turn * 0.3 + 0.2, lt(C.brass, 0.15), glow);
      gear(b, 40, 27, 5, 6, turn * 0.4, dk(C.brass, 0.1), glow);
      b.line(9, 32, 16, 7, "#4a4560", glow), b.line(11, 32, 18, 7, "#3a3550", glow);
      b.line(44, 33, 48, 18, "#4a4560", true);
      // The server rack, its lights blinking.
      if (c.locked) sheet(b, 130, 4, 27, 50);
      else {
        b.box(131, 4, 25, 49, "#26272e", { hi: "#3a3c46" });
        for (let u = 0; u < 9; u++) {
          const y = 7 + u * 5;
          b.box(133, y, 21, 4, "#33353f", { line: OUT, hi: "#474a56", lo: false });
          for (let l = 0; l < 3; l++) {
            const on = rnd(u * 11 + l * 3 + Math.floor(c.frame / (1 + (u % 3)))) > 0.35;
            b.set(136 + l * 2, y + 2, on ? [C.green, C.green, "#ffb627"][l]! : "#20222a", on);
          }
          b.hl(144, 151, y + 2, "#22242c");
        }
      }
      chair(c, 86, "#5a3a3a");
      if (c.locked) {
        sheet(c.f, 58, 26, 66, 28);
        cobweb(c);
        return;
      }
      desk(c, 58, 66, "#9aa1ad", "#5f6674");
      const { f } = c;
      // The brain model on its stand.
      f.vl(113, 37, 41, OUT), f.hl(110, 116, 41, OUT), f.hl(111, 115, 40, "#9aa3ae");
      const brain = "#f0a3b4";
      bitmap(
        f,
        105,
        28,
        [
          "   ####  ##   ",
          " ###### ##### ",
          "##############",
          "##############",
          "##############",
          " ############ ",
          "  ######  ### ",
        ],
        (_, i, j) => (j <= 1 && i < 6 ? lt(brain, 0.3) : j >= 5 || i >= 12 ? dk(brain, 0.18) : brain),
      );
      for (const [a, bb, cc, d] of [[108, 30, 110, 31], [110, 31, 110, 33], [113, 30, 113, 32], [115, 31, 117, 30], [107, 33, 109, 34], [114, 33, 116, 34], [111, 34, 112, 33]] as const) f.line(a, bb, cc, d, dk(brain, 0.38));
      // A console of switches and lights.
      f.box(62, 36, 20, 6, "#3c4150", { hi: "#555b6c" });
      for (let i = 0; i < 4; i++) f.set(65 + i * 4, 38, rnd(i + c.frame) > 0.4 ? [C.green, "#ffb627", C.red, C.teal][i]! : "#20222a", true);
      if (c.busy) mug(c, 92, 41, C.cream);
    },
  },

  // The Arcade, Aaesha's and Caitlin's: a row of cabinets, a leaderboard, a prize shelf.
  8: {
    residents: [
      {
        who: "aaesha",
        x: 46,
        y: AT_DESK,
        work: "pleased",
        moments: [
          { pose: "cheer", expression: "laughing" },
          { pose: "point", expression: "talking", talking: true },
          { pose: "thumbs", expression: "proud" },
        ],
      },
      {
        who: "caitlin",
        x: 86,
        y: AT_DESK + 1,
        work: "neutral",
        moments: [
          { pose: "idle", expression: "laughing" },
          { pose: "cheer", expression: "pleased" },
          { pose: "think", expression: "unimpressed" },
          { pose: "point", expression: "talking", talking: true },
        ],
      },
    ],
    draw(c) {
      const { b } = c;
      const wall = "#3b2f5e";
      walls(c, wall, "carpet", "#232046", "#1d1836");
      // Neon along the top.
      b.hl(1, W - 2, 3, c.locked ? "#4a3a70" : "#ff6fae", !c.locked);
      b.hl(1, W - 2, 4, dk(wall, 0.3));
      // The leaderboard, over the cabinets.
      b.box(2, 7, 48, 13, "#121220", { hi: "#2a2a40", lo: false });
      if (!c.locked) {
        const cols = [C.yellow, C.teal, C.pink, C.paper];
        for (let r = 0; r < 3; r++) {
          const y = 10 + r * 3;
          b.hl(5, 6, y, cols[r]!, true);
          b.hl(9, 9 + 12 + ((r * 5) % 7), y, cols[r]!, true);
          b.hl(38, 46, y, r === 0 && c.frame % 2 ? C.paper : cols[r]!, true);
        }
      }
      // Three cabinets.
      const bodies = [C.red, C.blue, C.yellow];
      bodies.forEach((body, i) => {
        const x = 3 + i * 16;
        if (c.locked) {
          sheet(b, x, 22, 15, 32);
          return;
        }
        b.box(x, 22, 15, 31, body, { hi: lt(body, 0.25) });
        b.box(x + 1, 22, 13, 4, C.paper, { lit: true, hi: false, lo: false });
        b.hl(x + 3, x + 11, 24, body, true);
        screen(b, x + 2, 27, 11, 9, "#101426");
        const f0 = (c.frame + i) % 2;
        const sprites = [["# #", "###", "# #"], [" # ", "###", " # "], ["## ", " ##", "## "]];
        sprite(b, x + 5, 29 + f0, sprites[i]!, [C.green, C.pink, C.teal][i]!);
        b.box(x + 1, 36, 13, 4, dk(body, 0.25), { hi: false });
        b.set(x + 4, 37, C.red), b.set(x + 8, 38, C.paper), b.set(x + 10, 38, C.paper);
        b.box(x + 4, 44, 7, 5, dk(body, 0.3), { hi: false });
        b.vl(x + 7, 45, 47, C.yellow);
      });
      // The prize shelf: plushies and a trophy.
      for (const y of [14, 28]) shelf(b, 134, 157, y);
      if (!c.locked) {
        b.box(137, 7, 7, 7, C.pink, { round: true }), b.set(138, 7, OUT), b.set(142, 7, OUT), b.set(139, 10, OUT), b.set(141, 10, OUT);
        b.box(147, 6, 7, 8, C.yellow, { round: true }), b.set(151, 9, OUT), b.hl(153, 154, 10, C.orange);
        b.box(136, 21, 8, 7, C.teal, { round: true }), b.set(138, 23, OUT), b.set(141, 23, OUT), b.hl(138, 141, 25, dk(C.teal, 0.3));
        b.box(148, 20, 7, 4, C.brass, { hi: lt(C.brass, 0.4) }), b.vl(151, 24, 26, C.brass), b.hl(149, 153, 27, OUT);
        plant(b, 140, 52, 14);
      }
      if (c.locked) {
        sheet(c.f, 44, 32, 92, 22);
        cobweb(c);
        return;
      }
      // The prize counter they lean on, glass at the front.
      const { f } = c;
      f.box(44, 41, 92, 13, "#2b2550", { hi: false });
      f.hl(45, 134, 42, "#c9a0e8"), f.hl(45, 134, 43, "#8a66b8"), f.hl(44, 135, 44, OUT);
      f.rect(47, 46, 86, 6, "#1b2a44", true);
      for (const [x, col] of [[52, C.pink], [62, C.yellow], [74, C.teal], [86, C.red], [98, C.green], [110, C.purple], [122, C.orange]] as const) {
        f.box(x, 48, 5, 4, col, { round: true, hi: lt(col, 0.3), lo: false, lit: true });
      }
      for (let x = 50; x < 132; x += 14) f.line(x, 51, x + 3, 46, "#3d5a80", true);
      // A ticket stub and a bell.
      f.box(126, 38, 6, 3, C.yellow, { hi: false });
      f.disc(52, 39, 2, C.brass), f.hl(50, 54, 41, OUT), f.set(52, 36, OUT);
    },
  },

  // The roof: the clock, the city at night, string lights, the whole class.
  9: {
    residents: [
      { who: "riya", x: -4, y: 34, work: "pleased", moments: [{ pose: "wave", expression: "pleased" }, { pose: "point", expression: "talking", talking: true }] },
      { who: "yahya", x: 116, y: 35, work: "neutral", moments: [{ pose: "thumbs", expression: "proud" }, { pose: "think", expression: "thinking" }] },
      { who: "caitlin", x: 18, y: 36, work: "laughing", moments: [{ pose: "cheer", expression: "laughing" }, { pose: "point", expression: "talking", talking: true }] },
      { who: "aaesha", x: 94, y: 36, work: "pleased", moments: [{ pose: "wave", expression: "pleased" }, { pose: "idle", expression: "laughing" }] },
      { who: "neil", x: 70, y: 35, work: "pleased", moments: [{ pose: "cheer", expression: "laughing" }, { pose: "thumbs", expression: "pleased" }] },
      { who: "paul", x: 43, y: 35, work: "proud", moments: [{ pose: "point", expression: "talking", talking: true }, { pose: "wave", expression: "pleased" }] },
    ],
    draw(c) {
      const { b, h } = c;
      // Sky and stars.
      b.rect(0, 0, W, h, C.sky, true);
      for (let y = 48; y < 62; y++) for (let x = 0; x < W; x++) if (y > 54 || (x + y) % 2 === 0) b.set(x, y, C.skyLow, true);
      for (let i = 0; i < 34; i++) {
        const x = Math.floor(rnd(i * 7 + 1) * W);
        const y = Math.floor(rnd(i * 11 + 2) * 46);
        const twinkle = !c.locked && i % 5 === c.frame % 5;
        b.set(x, y, twinkle ? C.sky : i % 4 ? mix(C.star, C.sky, 0.35) : C.star, true);
      }
      b.disc(16, 11, 5, C.moon, true);
      b.disc(19, 9, 4, C.sky, true);
      // The city: towers of lit windows.
      let x = 0;
      let i = 0;
      while (x < W) {
        const w = 8 + Math.floor(rnd(i * 3 + 5) * 12);
        const top = 40 + Math.floor(rnd(i * 5 + 7) * 20);
        const col = i % 2 ? "#141838" : "#181d42";
        b.rect(x, top, w, h - top, col, true);
        for (let wy = top + 3; wy < h - 4; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) if (rnd(wx * 13 + wy * 7) > 0.62) b.set(wx, wy, rnd(wx + wy) > 0.5 ? C.bulb : "#f2a65a", true);
        if (rnd(i * 9) > 0.7) b.vl(x + Math.floor(w / 2), top - 5, top - 1, col, true), b.set(x + Math.floor(w / 2), top - 6, C.red, true);
        x += w;
        i++;
      }
      // The clock housing and the clock face, stuck at 3:14 (or running, once the roof is done).
      const brick = "#8c4a3c";
      const hx = 60;
      b.rect(hx, 8, 40, h - 8, brick);
      for (let y = 9; y < h; y++) for (let bx = hx; bx < hx + 40; bx++) if (y % 4 === 0 || (bx + (Math.floor(y / 4) % 2) * 4) % 8 === 0) b.set(bx, y, dk(brick, 0.25));
      b.vl(hx, 8, h - 1, OUT), b.vl(hx + 39, 8, h - 1, OUT), b.vl(hx + 1, 9, h - 1, lt(brick, 0.2)), b.vl(hx + 38, 9, h - 1, dk(brick, 0.4));
      for (let r = 0; r < 9; r++) b.hl(hx - 2 + r * 2 + 2, hx + 41 - r * 2 - 2, 8 - r, r === 8 ? OUT : r % 2 ? "#4a5468" : "#5d6880");
      b.hl(hx - 2, hx + 41, 8, OUT), b.hl(hx - 1, hx + 40, 9, "#5d6880"), b.hl(hx - 2, hx + 41, 10, OUT);
      for (let r = 0; r < 8; r++) b.set(hx - 2 + r * 2 + 2, 8 - r, OUT), b.set(hx + 41 - r * 2 - 2, 8 - r, OUT);
      const cx = hx + 19.5;
      clockFace(b, Math.floor(cx), 25, 13, c.clock);
      // The terrace and its railing, string lights from the housing to the corners.
      b.rect(0, 76, W, h - 76, "#5a5f6e");
      for (let y = 76; y < h; y += 3) b.hl(0, W - 1, y, "#4b4f5c");
      lights(c, 0, 30, hx - 1, 44);
      lights(c, hx + 40, 44, W - 1, 30);
      if (c.locked) {
        sheet(b, 6, 60, 30, 16);
        sheet(b, 120, 58, 28, 18);
      } else if (!c.busy) {
        // Benches and plants, a telescope pointed at the sky.
        b.box(8, 66, 28, 4, C.woodLight, { hi: lt(C.woodLight, 0.2) });
        b.box(8, 62, 28, 3, C.wood, { hi: false });
        b.vl(10, 70, 75, OUT), b.vl(33, 70, 75, OUT);
        plant(b, 40, 76, 14);
        b.line(130, 75, 136, 62, OUT), b.line(142, 75, 136, 62, OUT), b.vl(136, 62, 75, OUT);
        b.box(126, 54, 18, 5, C.paper, { round: true }), b.line(142, 55, 146, 52, OUT), b.set(127, 56, C.blue);
        plant(b, 108, 76, 12);
      }
      railing(c.f, h);
    },
  },
};

/** A gear: a disc with teeth round the edge, a hub, turning by `turn` (in teeth). */
function gear(L: Layer, cx: number, cy: number, r: number, teeth: number, turn: number, col: string, lit = true) {
  for (let t = 0; t < teeth; t++) {
    const a = ((t + turn) / teeth) * Math.PI * 2;
    for (let d = r; d <= r + 2; d++) {
      const px = cx + Math.cos(a) * d;
      const py = cy + Math.sin(a) * d;
      L.set(px, py, d === r + 2 ? OUT : col, lit);
      L.set(px + 1, py, d === r + 2 ? OUT : dk(col, 0.1), lit);
    }
  }
  L.disc(cx, cy, r, col, lit);
  L.ring(cx, cy, r, dk(col, 0.35), lit);
  L.disc(cx, cy, Math.max(2, Math.floor(r / 3)), dk(col, 0.45), lit);
  L.set(cx - 1, cy - 1, lt(col, 0.4), lit);
  for (let s = 0; s < 4; s++) {
    const a = ((s + turn) / 4) * Math.PI * 2 + 0.4;
    L.line(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), dk(col, 0.2), lit);
  }
}

/** The clock face: cream, a brass rim, twelve marks and two hands. Always lit. */
export function clockFace(L: Layer, cx: number, cy: number, r: number, time: { h: number; m: number }) {
  L.disc(cx, cy, r + 2, OUT, true);
  L.disc(cx, cy, r + 1, C.brass, true);
  L.disc(cx, cy, r - 1, C.cream, true);
  L.ring(cx, cy, r + 1, dk(C.brass, 0.3), true);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const long = i % 3 === 0;
    for (let d = r - (long ? 4 : 3); d <= r - 2; d++) L.set(cx + Math.sin(a) * d, cy - Math.cos(a) * d, OUT, true);
  }
  const hand = (angle: number, len: number, thick: boolean) => {
    const a = (angle / 360) * Math.PI * 2;
    for (let d = 0; d <= len; d += 0.5) {
      const px = cx + Math.sin(a) * d;
      const py = cy - Math.cos(a) * d;
      L.set(px, py, OUT, true);
      if (thick && d < len - 1) L.set(px + (Math.abs(Math.cos(a)) > 0.7 ? 0 : 1), py + (Math.abs(Math.cos(a)) > 0.7 ? 1 : 0), OUT, true);
    }
  };
  hand(((time.h % 12) + time.m / 60) * 30, Math.round(r * 0.5), true);
  hand(time.m * 6, Math.round(r * 0.78), false);
  L.set(cx, cy, C.red, true);
}

/** String lights in a sagging line, one bulb in each of the class's colours. */
function lights(c: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const { b } = c;
  const n = Math.abs(x1 - x0);
  const colours = [C.yellow, C.teal, "#ff7a6b", C.purple, C.green, C.blue];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 6);
    b.set(x, y, "#3a3550", true);
    if (i % 6 === 3) {
      const k = Math.floor(i / 6);
      const on = !c.locked && !(c.busy && (k + c.frame) % 7 === 0);
      const col = colours[k % colours.length]!;
      b.set(x, y + 1, on ? col : "#3d4050", on);
      b.set(x, y + 2, on ? lt(col, 0.3) : "#2c2f3c", on);
    }
  }
}

/** The roof's railing, in front of whoever is up there. */
function railing(f: Layer, h: number) {
  const stone = "#b7aea0";
  f.box(0, 77, W, h - 77, dk(stone, 0.12), { hi: false, lo: false });
  for (let y = 77; y < h - 1; y++) {
    const course = Math.floor((y - 77) / 4);
    for (let x = 1; x < W - 1; x++) {
      if ((y - 77) % 4 === 3) f.set(x, y, dk(stone, 0.32));
      else if ((x + (course % 2) * 6) % 12 === 0) f.set(x, y, dk(stone, 0.32));
      else if ((y - 77) % 4 === 0) f.set(x, y, lt(stone, 0.08));
    }
  }
  f.box(0, 73, W, 5, stone, { hi: lt(stone, 0.35), lo: dk(stone, 0.2) });
}

// ---------------------------------------------------------------- drawing a room

export interface DrawnRoom {
  w: number;
  h: number;
  back: Layer;
  front: Layer;
}

export interface RoomOptions {
  /** 0 to 7: the step of everything that moves (gears, screens, steam, lights). */
  frame?: number;
  /** The clock on the roof. 3:14 unless it's been fixed. */
  clock?: { h: number; m: number };
}

export const STUCK_CLOCK = { h: 3, m: 14 };

/** Draw a floor's room in a state: the back layer and the front layer. */
export function drawRoom(act: number, state: RoomState, { frame = 0, clock = STUCK_CLOCK }: RoomOptions = {}): DrawnRoom {
  const h = roomHeight(act);
  const def = ROOMS[act] ?? ROOMS[1]!;
  const c: Ctx = { b: new Layer(W, h), f: new Layer(W, h), h, locked: state === "locked", busy: state === "busy", frame: ((frame % 8) + 8) % 8, clock, after: [] };
  def.draw(c);
  if (c.locked) {
    c.b.darken();
    c.f.darken();
  }
  for (const fn of c.after) fn(c);
  return { w: W, h, back: c.b, front: c.f };
}

/** Who's in a floor's room when it's busy, and where they sit. */
export function residentsOf(act: number): Spot[] {
  return ROOMS[act]?.residents ?? [];
}

/** Whether anything in the room moves (so a still room needn't be redrawn). */
export function roomMoves(state: RoomState): boolean {
  return state !== "locked";
}

// ---------------------------------------------------------------- the tower around the rooms

/** The building's measurements, in room pixels. */
export const TOWER = {
  /** Brick each side of a room. */
  wall: 6,
  /** The stone band between floors. */
  slab: 4,
  /** Sky above the roof. */
  top: 6,
  /** The steps under the ground floor. */
  base: 8,
} as const;

export const TOWER_W = ROOM_W + TOWER.wall * 2;

/** The y of each floor's room in the tower, top floor first, and the tower's full height. */
export function towerLayout(acts: number[]): { rooms: { act: number; y: number; h: number }[]; height: number } {
  let y = TOWER.top;
  const rooms = acts.map((act, i) => {
    if (i > 0) y += TOWER.slab;
    const r = { act, y, h: roomHeight(act) };
    y += r.h;
    return r;
  });
  return { rooms, height: y + TOWER.base };
}

const BRICK = "#8c4a3c";
const STONE = "#b7aea0";

/** Brick, in courses, with mortar and a little wear. */
function bricks(L: Layer, x0: number, y0: number, w: number, h: number, col = BRICK) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const course = Math.floor(y / 4);
      let p = col;
      if (y % 4 === 3) p = dk(col, 0.35);
      else if ((x + (course % 2) * 4) % 8 === 7) p = dk(col, 0.35);
      else if (y % 4 === 0) p = lt(col, 0.12);
      else if (rnd(x * 5 + course * 31) > 0.92) p = dk(col, 0.12);
      L.set(x, y, p);
    }
}

/**
 * The scene the floors sit in: the night sky and its stars, the city far off, the tower's brick
 * walls, the stone bands between floors and the steps. `width` is the scene's width in room
 * pixels (the tower is centred in it); the rooms themselves are drawn on top by the page.
 */
export function drawTowerScene(width: number, acts: number[]): { layer: Layer; x: number; layout: ReturnType<typeof towerLayout> } {
  const layout = towerLayout(acts);
  const h = layout.height;
  const L = new Layer(width, h);
  const x0 = Math.floor((width - TOWER_W) / 2);
  // Sky.
  L.rect(0, 0, width, h, C.sky);
  for (let i = 0; i < Math.round((width * h) / 260); i++) {
    const x = Math.floor(rnd(i * 7 + 3) * width);
    const y = Math.floor(rnd(i * 13 + 5) * (h - 60));
    L.set(x, y, i % 5 ? mix(C.star, C.sky, 0.45) : C.star);
  }
  // The far city along the bottom, either side of the tower.
  let x = 0;
  let i = 0;
  while (x < width) {
    const w = 10 + Math.floor(rnd(i * 3 + 1) * 14);
    const top = h - 40 - Math.floor(rnd(i * 5 + 2) * 70);
    const col = i % 2 ? "#151a3c" : "#191f47";
    L.rect(x, top, w, h - top, col);
    for (let wy = top + 3; wy < h - 6; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) if (rnd(wx * 17 + wy * 3) > 0.7) L.set(wx, wy, rnd(wx + wy * 2) > 0.5 ? C.bulb : "#f2a65a");
    x += w;
    i++;
  }
  L.rect(0, h - 4, width, 4, "#20243a");
  L.hl(0, width - 1, h - 4, "#2c3150");
  // The tower's walls, beside every floor but the roof, which has its own railing.
  const roof = layout.rooms.find((r) => r.act >= FLOORS.length);
  const wallTop = roof ? roof.y + 74 : TOWER.top;
  bricks(L, x0, wallTop, TOWER_W, h - TOWER.base - wallTop);
  L.vl(x0, wallTop, h - TOWER.base - 1, OUT);
  L.vl(x0 + TOWER_W - 1, wallTop, h - TOWER.base - 1, OUT);
  L.vl(x0 + 1, wallTop, h - TOWER.base - 1, lt(BRICK, 0.15));
  L.vl(x0 + TOWER_W - 2, wallTop, h - TOWER.base - 1, dk(BRICK, 0.4));
  // Stone bands between the floors, a cornice under the roof's railing, and a dark seam round each room.
  for (const r of layout.rooms) {
    if (r.act < FLOORS.length) {
      L.box(x0 + TOWER.wall - 1, r.y - 1, ROOM_W + 2, r.h + 2, OUT, { hi: false, lo: false, line: OUT });
      const sy = r.y + r.h;
      if (sy < h - TOWER.base) {
        L.box(x0 - 1, sy, TOWER_W + 2, TOWER.slab, STONE, { hi: lt(STONE, 0.3), lo: dk(STONE, 0.2) });
      }
    }
  }
  if (roof) {
    const sy = roof.y + roof.h;
    L.box(x0 - 2, sy, TOWER_W + 4, TOWER.slab, STONE, { hi: lt(STONE, 0.3), lo: dk(STONE, 0.2) });
    // The roof's railing carries on over the walls.
    L.box(x0, roof.y + 74, TOWER.wall + 1, 4, STONE, { hi: lt(STONE, 0.3) });
    L.box(x0 + TOWER_W - TOWER.wall - 1, roof.y + 74, TOWER.wall + 1, 4, STONE, { hi: lt(STONE, 0.3) });
  }
  // The steps.
  const by = h - TOWER.base;
  L.box(x0 - 3, by, TOWER_W + 6, 4, STONE, { hi: lt(STONE, 0.3), lo: dk(STONE, 0.2) });
  L.box(x0 - 6, by + 4, TOWER_W + 12, 4, dk(STONE, 0.1), { hi: lt(STONE, 0.15), lo: dk(STONE, 0.3) });
  return { layer: L, x: x0, layout };
}

/** A strip of the tower's brick, for the side sheet's banner either side of the room. */
export function drawBricks(width: number, height: number): Layer {
  const L = new Layer(width, height);
  bricks(L, 0, 0, width, height);
  return L;
}
