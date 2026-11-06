// The props only the cast's signature moves use (lib/pixel/gestures/signature.ts): each one
// belongs to somebody's interest. Paul's chalkboard, tablet and robot; Neil's rocket, wheel, drone
// and duck; Riya's easel, palette and prints; Yahya's stopwatch, charts and trophy; Aaesha's
// clipboard, brain model and flashcards; Caitlin's guitar, controller and cupcakes. Each is drawn
// from a small pattern, with its own dark edge where it sits over the body, so it reads at 2x.
import { mix, OUTLINE, type Grid } from "./kit";

type Pal = Record<string, string>;

/** Regions a prop's edge is never drawn over: a hand holding it, another prop, an edge already there, a light effect. */
const NO_EDGE = new Set(["hand", "prop", "outline", "fx"]);

/**
 * Draw a prop from a pattern ("." is clear, "o" is the dark edge), and a dark edge round it
 * wherever it sits over something else (the body, an arm, hair), so it never melts into a jacket.
 * The outline pass in people.ts edges it against the background on its own.
 */
export function put(g: Grid, rows: string[], x: number, y: number, pal: Pal, opts: { flip?: boolean; edge?: boolean; region?: string } = {}) {
  const { flip = false, edge = true, region = "prop" } = opts;
  const w = Math.max(...rows.map((r) => r.length));
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const c = ch === "o" ? OUTLINE : pal[ch];
      if (!c) return;
      const px = flip ? x + w - 1 - rx : x + rx;
      g.set(px, y + ry, c, region);
      cells.push([px, y + ry]);
      mine.add(`${px},${y + ry}`);
    }),
  );
  if (edge) edgeRound(g, cells, mine);
}

function edgeRound(g: Grid, cells: [number, number][], mine: Set<string>) {
  for (const [px, py] of cells)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const [nx, ny] = [px + dx, py + dy];
      if (mine.has(`${nx},${ny}`)) continue;
      const r = g.get(nx, ny);
      if (r && !NO_EDGE.has(r)) g.set(nx, ny, OUTLINE, "outline");
    }
}

/** A straight line of one colour (a stick, a string, a trail). */
export function line(g: Grid, x0: number, y0: number, x1: number, y1: number, colour: string, region = "prop") {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) g.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), colour, region);
}

/** A thick line (two pixels), dark-edged where it crosses the body: a stick, a guitar neck. */
export function rod(g: Grid, x0: number, y0: number, x1: number, y1: number, colour: string, shade: string, width = 2) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const steep = Math.abs(y1 - y0) >= Math.abs(x1 - x0);
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let d = 0; d < width; d++) {
      const [px, py] = steep ? [x + d, y] : [x, y + d];
      g.set(px, py, d === width - 1 && width > 1 ? shade : colour, "prop");
      cells.push([px, py]);
      mine.add(`${px},${py}`);
    }
  }
  edgeRound(g, cells, mine);
}

// ---------------------------------------------------------------- shared colours

export const WOOD = "#b5824c";
export const WOOD_D = "#7d5430";
export const WOOD_L = "#d9a86c";
export const GOLD = "#f2bf45";
export const GOLD_D = "#c48a22";
export const GOLD_L = "#ffe593";
export const SCREEN = "#1d2836";
export const SCREEN_L = "#33465e";
export const CASE = "#3a3d46";
export const CASE_D = "#26282f";
export const CASE_L = "#5b5f6b";
export const SILVER = "#c3c8d0";
export const SILVER_D = "#8e95a1";
export const SILVER_L = "#e4e8ee";
export const PAPER = "#f6f2e7";
export const PAPER_D = "#d9d2c0";
export const INK = "#2b2f3a";
export const RED = "#e5484d";
export const RED_D = "#b02e33";
export const BLUE = "#3b7be0";
export const BLUE_L = "#7fb2ff";
export const GREEN = "#43b66a";
export const YELLOW = "#ffcf3a";
export const ORANGE = "#ff8a3d";
export const PURPLE = "#8c6bf2";
export const TEAL = "#1fb5a8";
export const PINK = "#ff8fb1";
export const WHITE = "#f7f7f4";

/** A frame of `w` x `h` as pattern rows: "o" edge, `a` the border ring, `b` inside. */
function box(w: number, h: number, a: string, b: string, border = 1): string[] {
  const rows: string[] = [];
  for (let r = 0; r < h; r++) {
    let s = "";
    for (let c = 0; c < w; c++) {
      const edge = r === 0 || r === h - 1 || c === 0 || c === w - 1;
      const ring = r <= border || r >= h - 1 - border || c <= border || c >= w - 1 - border;
      s += edge ? "o" : ring ? a : b;
    }
    rows.push(s);
  }
  return rows;
}

// ================================================================ Paul

/** A slice of the Workshop's chalkboard in its wooden frame, beside him, with its chalk ledge. */
export function chalkboard(g: Grid, x: number, y: number, w: number, h: number) {
  const board = "#2f4b3c";
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) {
      const frame = yy === y || yy === y + h - 1 || xx === x || xx === x + w - 1;
      g.set(xx, yy, frame ? (yy === y ? WOOD_L : WOOD) : (xx * 5 + yy * 3) % 13 === 0 ? mix(board, "#ffffff", 0.07) : board, "prop");
    }
  for (let xx = x - 1; xx < x + w; xx++) g.set(xx, y + h, WOOD_D, "prop"), g.set(xx, y + h + 1, OUTLINE, "prop");
  // A stub of chalk on the ledge.
  g.set(x + w - 4, y + h - 1, "#eceee4", "prop"), g.set(x + w - 3, y + h - 1, "#eceee4", "prop");
}

/** Chalk writing: short strokes, `n` of them so far, like a line of code. */
export function chalkLines(g: Grid, strokes: [number, number, number][], n: number) {
  const chalk = "#eceee4";
  const faint = mix(chalk, "#2f4b3c", 0.45);
  strokes.slice(0, n).forEach(([x, y, len], i) => {
    for (let k = 0; k < len; k++) {
      const gap = (k + i) % 4 === 3;
      g.set(x + k, y, gap ? faint : chalk, "prop");
    }
  });
}

/** A stick of chalk held at an angle. */
export function chalkStick(g: Grid, x: number, y: number) {
  g.set(x, y, "#f4f4ee", "prop"), g.set(x + 1, y + 1, "#f4f4ee", "prop"), g.set(x + 1, y, "#d4d4c8", "prop");
}

/** A mug, Paul's sun yellow, its handle to the right (where the hand goes). 8x7. */
export function mug(g: Grid, x: number, y: number, colour = "#ffb627") {
  const shade = mix(colour, "#000000", 0.2);
  const light = mix(colour, "#ffffff", 0.35);
  put(g, [
    "ooooooo.",
    "oCcCcCo.",
    "oLYYYsooo",
    "oLYYYso.o",
    "oLYYYsooo",
    "oLYYYso..",
    ".ooooo...",
  ], x, y, { C: "#5a3a22", c: "#7a5232", Y: colour, s: shade, L: light });
}

/** An open laptop held towards you. `screen` paints its 12x7 screen at (sx, sy). */
export function laptopOpen(g: Grid, x: number, y: number, screen: (sx: number, sy: number) => void, body: "dark" | "silver" = "dark") {
  const [K, L, d] = body === "dark" ? [CASE, CASE_L, CASE_D] : [SILVER, SILVER_L, SILVER_D];
  put(g, [
    ".oooooooooooooo.",
    ".oKKKKKKKKKKKKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKSSSSSSSSSSKo.",
    ".oKKKKKKKKKKKKo.",
    "oLLLLLLLLLLLLLLo",
    "oddddddddddddddo",
    ".oooooooooooooo.",
  ], x, y, { K, S: SCREEN, L, d });
  if (body === "silver") g.set(x + 8, y + 10, "#9ad1ff", "prop");
  screen(x + 3, y + 2);
}

/** Training: a falling loss curve and a progress bar, `fill` 0..1. 12x7. */
export function trainingScreen(g: Grid, sx: number, sy: number, fill: number) {
  const curve = [0, 1, 2, 3, 3, 4, 4, 4, 4, 5];
  const n = Math.round(fill * 10);
  curve.forEach((v, i) => g.set(sx + 1 + i, sy + v, i < n ? "#ffb627" : SCREEN_L, "prop"));
  for (let i = 0; i < 10; i++) g.set(sx + 1 + i, sy + 6, i < n ? "#6fd3a6" : SCREEN_L, "prop");
}

/** A tablet, screen towards you. `screen` paints the inside (w-4 by h-4) at (sx, sy). */
export function tablet(g: Grid, x: number, y: number, screen?: (sx: number, sy: number) => void, opts: { w?: number; h?: number; body?: string; glass?: string } = {}) {
  const w = opts.w ?? 16;
  const h = opts.h ?? 12;
  put(g, box(w, h, "B", "S"), x, y, { B: opts.body ?? "#2c2f37", S: opts.glass ?? SCREEN });
  screen?.(x + 2, y + 2);
}

/** The loss curve on Paul's tablet, `n` of 11 points along, falling to the floor. 12x8. */
export function lossCurve(g: Grid, sx: number, sy: number, n: number) {
  const axis = "#8796ad";
  for (let i = 0; i < 8; i++) g.set(sx, sy + i, axis, "prop");
  for (let i = 0; i < 12; i++) g.set(sx + i, sy + 7, axis, "prop");
  const ys = [0, 1, 2, 3, 4, 4, 5, 5, 5, 6, 6];
  for (let i = 0; i < Math.min(n, 11); i++) {
    g.set(sx + 1 + i, sy + ys[i]!, "#ffb627", "prop");
    if (i > 0 && ys[i]! > ys[i - 1]!) g.set(sx + 1 + i, sy + ys[i]! - 1, "#c98a1a", "prop");
  }
  if (n > 0 && n <= 11) g.set(sx + n, sy + ys[n - 1]!, "#fff3c8", "prop");
}

/** A thin wooden pointer stick, red-tipped. */
export function pointerStick(g: Grid, x0: number, y0: number, x1: number, y1: number) {
  line(g, x0, y0, x1, y1, WOOD_L);
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  // A darker underside so it reads as round.
  for (let i = 1; i < n; i += 2) g.set(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), WOOD, "prop");
  g.set(x1, y1, RED, "prop");
}

/** A little robot with a screen for a face, an antenna light, and arms that go up and down. 13x15. */
export function robot(g: Grid, x: number, y: number, beat: number) {
  const light = beat % 2 ? "#ff5a5f" : "#ffd36b";
  const up = beat % 2 === 0;
  put(g, [
    "......o......",
    ".....oLo.....",
    "......o......",
    "..ooooooooo..",
    ".oWWWWWWWWWo.",
    ".oWSSSSSSSWo.",
    ".oWSEESEESWo.",
    ".oWSSSMSSSWo.",
    ".oWWWWWWWWWo.",
    "..ooooooooo..",
    up ? "oo.oWWWWWo.oo" : "...oWWWWWo...",
    up ? "oAooWWCWWooAo" : ".ooWWWCWWWoo.",
    up ? ".oo.WWWWW.oo." : "oAooWWWWWooAo",
    "...oGGGGGo...",
    "...ooo.ooo...",
  ], x, y, { L: light, W: "#e3e8ee", S: "#24303f", E: "#43e0f0", M: "#43e0f0", C: "#ffb627", A: "#b9c3cf", G: "#9aa5b3" });
}

/** The gold paper crown from the final scene, folded from card. 13 wide. */
export function paperCrown(g: Grid, x: number, y: number, glint: number) {
  put(g, [
    "o.....o.....o",
    "oo...oGo...oo",
    "oGo.oGGGo.oGo",
    "oGGoGGLGGoGGo",
    "oGGGGGGGGGGGo",
    "oDDDDDDDDDDDo",
    ".ooooooooooo.",
  ], x, y, { G: GOLD, L: GOLD_L, D: GOLD_D });
  // Light catches one point at a time.
  const tip: [number, number][] = [[1, 2], [6, 1], [11, 2], [6, 4]];
  const [tx, ty] = tip[glint % 4]!;
  g.set(x + tx, y + ty, GOLD_L, "prop");
}

// ================================================================ Neil

/** A model rocket: red nose, white body, a window, fins. 7x10, base at y + 9. */
export function rocket(g: Grid, x: number, y: number) {
  put(g, [
    "...o...",
    "..oRo..",
    ".oRRRo.",
    ".oWWWo.",
    ".oWBWo.",
    ".oWWWo.",
    ".oWsWo.",
    "oRoWoRo",
    "oRRWRRo",
    "ooooooo",
  ], x, y, { R: RED, W: WHITE, B: "#3b6fd8", s: "#d4d6da" });
}

/** A rocket's flame under its base, flickering. 3 wide. */
export function flame(g: Grid, x: number, y: number, beat: number, tall = true) {
  put(g, tall ? (beat % 2 ? ["oYo", "oOo", ".o."] : ["oYo", "oOo", "oRo", ".o."]) : ["oYo", ".o."], x, y, { Y: "#fff3a0", O: ORANGE, R: RED }, { edge: false });
}

/** A puff of smoke, small or big. */
export function puff(g: Grid, x: number, y: number, size: 1 | 2 | 3) {
  const c = "#eef0f2";
  const d = "#c4c9cf";
  const pats = { 1: ["cd"], 2: [".cc.", "ccdd", ".dd."], 3: [".ccc..", "cccccd", "ccddcd", ".dddd."] };
  put(g, pats[size], x, y, { c, d }, { edge: false, region: "fx" });
}

/**
 * A sim-rig steering wheel, round, turned `angle` radians (positive is clockwise): a dark rim, a
 * yellow marker at the top, three spokes and a teal hub. Returns where the two grips are now, for
 * the hands. Centre (cx, cy), radius 7.
 */
export function steeringWheel(g: Grid, cx: number, cy: number, angle: number): { left: [number, number]; right: [number, number] } {
  const rim = "#30333b";
  const rimL = "#4a4e58";
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  const set = (x: number, y: number, c: string) => {
    g.set(x, y, c, "prop");
    if (!mine.has(`${x},${y}`)) cells.push([x, y]), mine.add(`${x},${y}`);
  };
  for (let y = cy - 8; y <= cy + 8; y++)
    for (let x = cx - 8; x <= cx + 8; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy);
      // The angle round from the top, turned back by the wheel's turn.
      let a = Math.atan2(dx, -dy) - angle;
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a < -Math.PI) a += 2 * Math.PI;
      if (d >= 5.6 && d <= 7.4) set(x, y, Math.abs(a) < 0.3 ? YELLOW : d < 6.5 ? rimL : rim);
      else if (d <= 2.4) set(x, y, d < 1.2 ? "#bff3ec" : TEAL);
      else if (d < 5.6) {
        const spoke = [Math.PI / 2, -Math.PI / 2, Math.PI].some((s) => Math.abs(Math.sin(a - s)) * d < 0.8 && Math.cos(a - s) > 0);
        if (spoke) set(x, y, "#5b5f6b");
      }
    }
  edgeRound(g, cells, mine);
  const grip = (s: number): [number, number] => [Math.round(cx + Math.sin(s + angle) * 6.5), Math.round(cy - Math.cos(s + angle) * 6.5)];
  return { left: grip(-Math.PI / 2), right: grip(Math.PI / 2) };
}

/** A drone hovering, propellers spinning (two frames), its lights blinking. 13x6. */
export function drone(g: Grid, x: number, y: number, beat: number) {
  const blade = "#f2f4f7";
  put(g, [
    ".o.........o.",
    "oAoooooooooAo",
    ".o.oBBBBBo.o.",
    "...oBRBGBo...",
    "...ooBBBoo...",
    "...o.ooo.o...",
  ], x, y + 1, { A: "#5b5f6b", B: "#dfe3e8", R: beat % 4 < 2 ? "#ff5a5f" : "#9b3a3d", G: beat % 4 < 2 ? "#3a8a5a" : "#6fff9a" });
  for (const px of [x + 1, x + 11]) {
    if (beat % 2 === 0) for (let d = -2; d <= 2; d++) g.set(px + d, y, blade, "fx");
    else g.set(px - 2, y, blade, "fx"), g.set(px - 1, y, "#b9c0c9", "fx"), g.set(px + 1, y, "#b9c0c9", "fx"), g.set(px + 2, y, blade, "fx");
  }
}

/** The drone's controller: two sticks, a little screen and an aerial. 14x9. */
export function droneController(g: Grid, x: number, y: number, beat: number) {
  put(g, [
    "............o.",
    "............o.",
    "..oooooooooooo",
    ".oCCCCCCCCCCCo",
    "oCCKCCSSSCCKCCo",
    "oCKkKCSSSCKkKCo",
    "oCCKCCCCCCCKCCo",
    ".oCCCCCCCCCCCo.",
    "..ooooooooooo..",
  ], x, y, { C: "#5b5f6b", S: "#7fd8ff", K: "#2b2d33", k: "#e2e5ea" });
  const n = beat % 4;
  // The sticks nudge.
  if (n === 1) g.set(x + 3, y + 4, "#e2e5ea", "prop");
  if (n === 3) g.set(x + 12, y + 5, "#e2e5ea", "prop");
}

/** The rubber duck from Neil's desk, chipped beak and all. 8x9, facing right. */
export function rubberDuck(g: Grid, x: number, y: number, flip = false) {
  put(g, [
    "..oooo..",
    ".oYYYYo.",
    ".oYYEYoo",
    ".oYYYOOo",
    "ooYYYooo",
    "oYYYYYYo",
    "oYLYYYYo",
    "oYYYYYso",
    ".oooooo.",
  ], x, y, { Y: "#ffd23f", L: "#ffeb94", E: OUTLINE, O: ORANGE, s: "#e8b52a" }, { flip });
  // The chip in the beak.
  g.set(flip ? x : x + 7, y + 3, "#ffc79a", "prop");
}

/** A chequered flag, the cloth rippling by beat; its stick from the top (x + lean, y) down to (x, bottom). */
export function chequeredFlag(g: Grid, x: number, y: number, beat: number, lean: number, bottom: number) {
  const cloth: [number, number][] = [];
  for (let c = 0; c < 9; c++) {
    const wave = Math.round(Math.sin(c * 0.8 - beat * 1.6) * 0.9);
    for (let r = 0; r < 6; r++) cloth.push([c, r + wave]);
  }
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  for (const [c, r] of cloth) {
    const dark = (Math.floor(c / 2) + Math.floor((r - Math.round(Math.sin(c * 0.8 - beat * 1.6) * 0.9)) / 2)) % 2 === 0;
    const px = x + 1 + c + lean;
    const py = y + r;
    g.set(px, py, dark ? "#1d1d22" : WHITE, "prop");
    cells.push([px, py]);
    mine.add(`${px},${py}`);
  }
  edgeRound(g, cells, mine);
  line(g, x + lean, y - 1, x, bottom, "#9aa0ab");
  g.set(x + lean, y - 2, GOLD, "prop");
}

/** A karting helmet, visor to the front, a teal stripe over the top. 12x11. */
export function helmet(g: Grid, x: number, y: number, glint: number) {
  put(g, [
    "...oooooo...",
    "..oWWTTWWo..",
    ".oWWWTTWWWo.",
    "oWWWWTTWWWWo",
    "oWVVVVVVVWWo",
    "oVVVVVVVVVWo",
    "oVVVVVVVVVWo",
    "oWVVVVVVVWWo",
    "oWWWWWWWWWDo",
    ".oDDDDDDDDo.",
    "..oooooooo..",
  ], x, y, { W: WHITE, T: TEAL, V: "#2b3a52", D: "#c9ccd2" });
  const spots: [number, number][] = [[2, 5], [4, 5], [6, 5], [8, 5]];
  const [gx, gy] = spots[glint % 4]!;
  g.set(x + gx, y + gy, "#8fb2e8", "prop"), g.set(x + gx + 1, y + gy + 1, "#5d7aa8", "prop");
}

/** A paper plane, nose to the right (or left, flipped), level or climbing. */
export function paperPlane(g: Grid, x: number, y: number, flip = false, climb = false) {
  const level = ["oo.......", "oPPoo....", ".oPPPPoo.", "oDDDPPPPo", "oDDoooo..", "oo......."];
  const up = [".......oo", ".....ooPo", "...ooPPo.", ".ooPPPPo.", "oDDDDPo..", ".ooooo..."];
  put(g, climb ? up : level, x, y, { P: WHITE, D: "#c9ccd2" }, { flip });
}

/** A speed trace scrolling across a 12x8 screen (telemetry), with a throttle bar. */
export function telemetry(g: Grid, sx: number, sy: number, beat: number) {
  const trace = [5, 4, 2, 1, 1, 1, 2, 4, 5, 5, 4, 2, 1, 0, 1, 3];
  for (let i = 0; i < 12; i++) {
    const v = trace[(i + beat * 3) % trace.length]!;
    g.set(sx + i, sy + v, TEAL, "prop");
  }
  for (let i = 0; i < 12; i++) g.set(sx + i, sy + 7, i < 3 + ((beat * 3) % 9) ? "#6fd36f" : SCREEN_L, "prop");
  g.set(sx + 11, sy, "#ff5a5f", "prop");
}

// ================================================================ Riya

/** A canvas on an easel, beside her, `n` strokes of a little landscape painted so far. */
export function easel(g: Grid, x: number, y: number, n: number) {
  // Legs and the crossbar, behind the canvas.
  line(g, x + 2, y + 14, x, 51, WOOD_D);
  line(g, x + 9, y + 14, x + 11, 51, WOOD_D);
  line(g, x + 5, y - 2, x + 5, 51, WOOD);
  put(g, box(11, 15, "F", "C"), x, y, { F: "#efe9dc", C: WHITE });
  for (let xx = x - 1; xx <= x + 11; xx++) g.set(xx, y + 15, WOOD, "prop");
  // The painting, stroke by stroke: sky, sun, hills, a tree.
  const sky = "#9fd2ff";
  const strokes: (() => void)[] = [
    () => { for (let yy = y + 2; yy <= y + 6; yy++) for (let xx = x + 2; xx <= x + 8; xx++) g.set(xx, yy, sky, "prop"); },
    () => { for (const [dx, dy] of [[6, 3], [7, 3], [6, 4], [7, 4]] as const) g.set(x + dx, y + dy, YELLOW, "prop"); },
    () => { for (let xx = x + 2; xx <= x + 8; xx++) for (let yy = y + 7 + (xx % 3 === 0 ? 0 : 1); yy <= y + 9; yy++) g.set(xx, yy, "#5cc27a", "prop"); },
    () => { for (let xx = x + 2; xx <= x + 8; xx++) for (let yy = y + 10; yy <= y + 12; yy++) g.set(xx, yy, "#3e9a5c", "prop"); },
    () => { g.set(x + 3, y + 6, "#2f7a48", "prop"), g.set(x + 3, y + 5, "#2f7a48", "prop"), g.set(x + 4, y + 6, "#2f7a48", "prop"), g.set(x + 3, y + 7, WOOD_D, "prop"); },
    () => { g.set(x + 5, y + 11, PINK, "prop"), g.set(x + 7, y + 12, PINK, "prop"), g.set(x + 2, y + 11, YELLOW, "prop"); },
  ];
  strokes.slice(0, n).forEach((s) => s());
}

/** A painter's palette, wooden, with dabs of colour and a thumb hole. 13x8. */
export function palette(g: Grid, x: number, y: number) {
  put(g, [
    "..ooooooooo..",
    ".oWRWWYWWBWo.",
    "oWWWWWWWWWWWo",
    "oGWWoWWWWWPWo",
    "oWWo.oWWWWWWo",
    "oKWWoWWWWWWo.",
    ".oWWWWWWWoo..",
    "..ooooooo....",
  ], x, y, { W: WOOD_L, R: RED, Y: YELLOW, B: BLUE, G: GREEN, P: PINK, K: WHITE });
}

/** A paintbrush from its handle end to its tip, the tip loaded with `paint`. */
export function brush(g: Grid, x0: number, y0: number, x1: number, y1: number, paint: string) {
  line(g, x0, y0, x1, y1, "#c0392b");
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const at = (t: number): [number, number] => [Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t)];
  const [fx, fy] = at((n - 2) / n);
  g.set(fx, fy, "#c9ccd2", "prop");
  g.set(x1, y1, paint, "prop");
}

/** Riya's drawing tablet: a pale pen display. `screen` paints its 12x8 inside. */
export function drawingTablet(g: Grid, x: number, y: number, screen: (sx: number, sy: number) => void) {
  tablet(g, x, y, screen, { body: "#3a3f4a", glass: "#f4f6fb" });
}

/** A stylus held in a pinch, from (x0, y0) to its tip. */
export function stylus(g: Grid, x0: number, y0: number, x1: number, y1: number) {
  line(g, x0, y0, x1, y1, "#4a4f5c");
  g.set(x1, y1, "#e8ebf0", "prop");
}

/** A framed print: a wooden frame, a cream mount and a little seaside picture. 18x14. */
export function framedPrint(g: Grid, x: number, y: number, glint: number) {
  put(g, box(18, 14, "F", "M"), x, y, { F: WOOD, M: "#f1ead9" });
  for (let xx = x; xx < x + 18; xx++) g.set(xx, y + 1, WOOD_L, "prop");
  // The picture: sky, sun, sea, sand.
  const px = x + 3;
  const py = y + 3;
  for (let yy = 0; yy < 8; yy++)
    for (let xx = 0; xx < 12; xx++) {
      const c = yy < 3 ? "#ffc98f" : yy < 4 ? "#ff9a6b" : yy < 6 ? (xx + yy) % 4 === 0 ? "#7fc6e8" : "#3e8fc2" : "#f2d38a";
      g.set(px + xx, py + yy, c, "prop");
    }
  for (const [dx, dy] of [[7, 1], [8, 1], [7, 2], [8, 2], [6, 2], [9, 2]] as const) g.set(px + dx, py + dy, "#fff1a8", "prop");
  // Light sliding across the glass.
  const gx = [1, 4, 7, 10][glint % 4]!;
  for (let k = 0; k < 3; k++) g.set(px + gx + k, py + 2 - k + 3, mix(g.c[py + 5 - k]![px + gx + k] ?? WHITE, "#ffffff", 0.45), "prop");
}

/** Colour swatches fanned from a pivot (x, y): `open` of 6 strips spread. */
export function swatchFan(g: Grid, x: number, y: number, open: number) {
  const colours = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE];
  const spread = [0, 0.35, 0.7, 1][Math.max(0, Math.min(3, open))]!;
  colours.forEach((c, i) => {
    const angle = (-0.95 + (i / 5) * 1.9) * spread - Math.PI / 2;
    const len = 11;
    const tx = Math.round(x + Math.cos(angle) * len);
    const ty = Math.round(y + Math.sin(angle) * len);
    rod(g, x, y, tx, ty, c, mix(c, "#000000", 0.25), 2);
    g.set(tx, ty, WHITE, "prop");
  });
  // The rivet.
  g.set(x, y, "#c9ccd2", "prop");
}

/** A film camera, lens to you: a silver top, black body, a big lens; the flash fires on `flash`. 17x10. */
export function camera(g: Grid, x: number, y: number, flash: boolean) {
  put(g, [
    ".oooo.......ooo..",
    ".oFFo......oRRo..",
    "ooooooooooooooooo",
    "oSSSSSSoooSSSSSso",
    "oSSSSSoLLLoSSSSso",
    "oKkKKoLGGGLoKkKKo",
    "oKKKKoLGHGLoKKKKo",
    "oKkKKoLGGGLoKkKKo",
    "oKKKKKoLLLoKKKKKo",
    "ooooooooooooooooo",
  ], x, y, { S: "#d9dde3", s: "#aab1bb", K: "#34373f", k: "#454952", L: "#a7aeb8", G: "#1b2440", H: "#9fc4ff", F: flash ? "#fffbe0" : "#8fd3ff", R: RED });
  // The burst lands over her hair, so it stays a solid star: an effect there would lose its edges.
  if (flash) put(g, ["...W...", "..WWW..", "WWWWWWW", "..WWW..", "...W..."], x - 1, y - 5, { W: "#fffbe0" }, { edge: false });
}

/** A pencil held upright: graphite tip at the top, yellow body, pink eraser at the bottom. 2 wide. */
export function pencil(g: Grid, x: number, top: number, bottom: number) {
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  for (let y = top; y <= bottom; y++)
    for (const dx of [0, 1]) {
      const c = y === top ? (dx ? "#3a3a40" : "#55555e") : y <= top + 2 ? (dx ? "#c99a62" : "#e8bf8a") : y >= bottom - 1 ? (y === bottom - 1 ? SILVER : PINK) : dx ? "#e0a92a" : YELLOW;
      if (y === top && dx) continue;
      g.set(x + dx, y, c, "prop");
      cells.push([x + dx, y]), mine.add(`${x + dx},${y}`);
    }
  edgeRound(g, cells, mine);
}

/** A paintbrush tucked behind an ear: handle up and back, a blue tip. */
export function tuckedBrush(g: Grid, x: number, y: number) {
  line(g, x, y, x + 5, y + 7, "#c0392b");
  g.set(x + 4, y + 6, "#c9ccd2", "prop");
  g.set(x + 5, y + 7, BLUE, "prop"), g.set(x + 6, y + 8, BLUE, "prop");
}

/** A small canvas of pixel art: a little pink cat face that blinks. 10x10. */
export function pixelArt(g: Grid, x: number, y: number, blink: boolean) {
  put(g, box(10, 10, "F", "C"), x, y, { F: WOOD, C: "#fdf6e8" });
  const art = ["P....P", "PP..PP", "PPPPPP", blink ? "PkPPkP" : "PEPPEP", "PPRRPP", ".PPPP."];
  put(g, art, x + 2, y + 2, { P: "#ff9ec0", E: OUTLINE, k: "#c25d82", R: "#e5484d" }, { edge: false });
}

/** A heart popping up, small (1) to full (3). */
export function heart(g: Grid, x: number, y: number, size: 1 | 2 | 3) {
  const pats = { 1: ["R"], 2: ["R.R", "RRR", ".R."], 3: [".RR.RR.", "RLRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."] };
  put(g, pats[size], x, y, { R: "#ff5a7a", L: "#ffc2d0" }, { edge: false, region: "fx" });
}

/** Splashes of paint on a hand or a sleeve. */
export function splats(g: Grid, spots: [number, number, string][]) {
  for (const [x, y, c] of spots) if (g.get(x, y) === "hand" || g.get(x, y) === "arm") g.set(x, y, c, g.get(x, y)!);
}

// ================================================================ Yahya

/** A stopwatch: a silver case, a white face, a red hand at `tick` of 8, the button `pressed`. 9x11. */
export function stopwatch(g: Grid, x: number, y: number, tick: number, pressed: boolean) {
  put(g, [
    pressed ? "........." : "...oSo...",
    pressed ? "...oSo..." : "...oSo...",
    "..ooooo..",
    ".oSSSSSo.",
    "oSWWWWWSo",
    "oSWWWWWSo",
    "oSWWWWWSo",
    "oSWWWWWSo",
    "oSWWWWWSo",
    ".oSSSSSo.",
    "..ooooo..",
  ], x, y, { S: SILVER, W: WHITE });
  // Ticks at the quarters, then the hand from the middle.
  const cx = x + 4;
  const cy = y + 6;
  for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0]] as const) g.set(cx + dx, cy + dy, "#a7adb8", "prop");
  const dirs: [number, number][] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  const [dx, dy] = dirs[tick % 8]!;
  g.set(cx, cy, INK, "prop");
  g.set(cx + dx, cy + dy, RED, "prop");
  g.set(cx + dx * 2, cy + dy * 2, RED, "prop");
}

/** A card with a bar chart on it, bars `heights` (0..7) tall. 15x12. */
export function chartCard(g: Grid, x: number, y: number, heights: number[], best = -1) {
  put(g, box(15, 12, "P", "P"), x, y, { P: PAPER });
  for (let yy = y + 2; yy <= y + 9; yy++) g.set(x + 2, yy, INK, "prop");
  for (let xx = x + 2; xx <= x + 12; xx++) g.set(xx, y + 9, INK, "prop");
  heights.forEach((h, i) => {
    for (let k = 0; k < h; k++) for (let w = 0; w < 2; w++) g.set(x + 4 + i * 3 + w, y + 8 - k, i === best ? "#3b6fd8" : "#9db5e6", "prop");
  });
}

/** A scatter of points and a fitted line drawn `fill` of the way across a 12x7 screen. */
export function scatterScreen(g: Grid, sx: number, sy: number, dots: number, fill: number) {
  const pts: [number, number][] = [[1, 6], [2, 4], [3, 5], [4, 3], [5, 4], [6, 2], [7, 3], [8, 1], [9, 2], [10, 0]];
  pts.slice(0, dots).forEach(([dx, dy]) => g.set(sx + dx, sy + dy, BLUE_L, "prop"));
  for (let i = 0; i < Math.round(fill * 11); i++) g.set(sx + i, sy + 6 - Math.round(i * 0.58), YELLOW, "prop");
}

/** A die showing `face` (1..6), or tumbling (a diamond). 5x5. */
export function die(g: Grid, x: number, y: number, face: number, tumbling = false) {
  if (tumbling) {
    put(g, ["...o...", "..oWo..", ".oWWWo.", "oWKWWWo", ".oWWKo.", "..oWo..", "...o..."], x - 1, y - 1, { W: WHITE, K: INK });
    return;
  }
  put(g, box(7, 7, "W", "W"), x - 1, y - 1, { W: WHITE });
  const pips: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[0, 0], [2, 2], [4, 4]],
    4: [[1, 1], [3, 1], [1, 3], [3, 3]],
    5: [[0, 0], [4, 0], [2, 2], [0, 4], [4, 4]],
    6: [[1, 0], [3, 0], [1, 2], [3, 2], [1, 4], [3, 4]],
  };
  for (const [dx, dy] of pips[face] ?? pips[6]!) g.set(x + dx, y + dy, face === 1 ? RED : INK, "prop");
}

/** A glass thermometer: a red bulb, the red line `level` (0..10) up the tube. 4x16. */
export function thermometer(g: Grid, x: number, y: number, level: number) {
  put(g, [
    ".oo.",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oGGo",
    "oRRo",
    "oRRRo",
    "oRRRo",
    ".ooo.",
  ], x, y, { G: "#e4f2fb", R: RED });
  for (let k = 0; k < level; k++) g.set(x + 1, y + 11 - k, RED, "prop"), g.set(x + 2, y + 11 - k, k === level - 1 ? "#ff8a8d" : RED_D, "prop");
  for (let k = 2; k <= 10; k += 2) g.set(x + 3, y + 11 - k, "#8a93a3", "prop");
  g.set(x + 2, y + 13, "#ff9a9d", "prop");
}

/** Digits in a 3x5 pixel font. */
const DIGITS: Record<string, string[]> = {
  "0": ["XXX", "X.X", "X.X", "X.X", "XXX"],
  "1": [".X.", "XX.", ".X.", ".X.", "XXX"],
  "2": ["XXX", "..X", "XXX", "X..", "XXX"],
  "3": ["XXX", "..X", ".XX", "..X", "XXX"],
  "4": ["X.X", "X.X", "XXX", "..X", "..X"],
  "5": ["XXX", "X..", "XXX", "..X", "XXX"],
  "6": ["XXX", "X..", "XXX", "X.X", "XXX"],
  "7": ["XXX", "..X", ".X.", ".X.", ".X."],
  "8": ["XXX", "X.X", "XXX", "X.X", "XXX"],
  "9": ["XXX", "X.X", "XXX", "..X", "XXX"],
  ".": [".", ".", ".", ".", "X"],
  ":": [".", "X", ".", "X", "."],
};
export function digits(g: Grid, x: number, y: number, text: string, colour: string) {
  let cx = x;
  for (const ch of text) {
    const d = DIGITS[ch];
    if (!d) continue;
    d.forEach((row, ry) => [...row].forEach((c, rx) => c === "X" && g.set(cx + rx, y + ry, colour, "prop")));
    cx += d[0]!.length + 1;
  }
}

/** A phone held sideways, showing a time. 17x9. */
export function phoneTime(g: Grid, x: number, y: number, text: string, glow: boolean) {
  put(g, box(17, 9, "B", "S"), x, y, { B: "#22252c", S: glow ? "#173a2c" : "#14261f" });
  digits(g, x + 2, y + 2, text, glow ? "#8dffb5" : "#5fd98f");
  g.set(x + 15, y + 4, "#3a3f4a", "prop");
}

// ================================================================ Aaesha

/** A pen, from the end that's held to its nib. */
export function pen(g: Grid, x0: number, y0: number, x1: number, y1: number, colour = "#2b4f9e", nib = INK) {
  line(g, x0, y0, x1, y1, colour);
  g.set(x1, y1, nib, "prop");
}

/** A little model of a brain on a stand, a spark of light running round it. 11x9. */
export function brainModel(g: Grid, x: number, y: number, spark: number) {
  put(g, [
    "..oooooo...",
    ".oPPpPPPo..",
    "oPPpPPPpPo.",
    "oPpPPpPPPPo",
    "oPPPpPPpPPo",
    ".oPPPPpPPo.",
    "..ooopPPPo.",
    "....oooSo..",
    "...oSSSSSo.",
    "...ooooooo.",
  ], x, y, { P: "#f4a6b8", p: "#d77a92", S: SILVER_D });
  const path: [number, number][] = [[2, 2], [4, 1], [6, 2], [8, 3], [7, 5], [5, 5]];
  const [sx, sy] = path[spark % path.length]!;
  g.set(x + sx, y + sy, "#fff0f4", "prop");
  const [tx, ty] = path[(spark + path.length - 1) % path.length]!;
  g.set(x + tx, y + ty, "#ffc9d6", "prop");
}

/** A stack of flashcards, `top` the colour of the card on top. 9x7. */
export function cardStack(g: Grid, x: number, y: number, top: string) {
  put(g, ["ooooooooo", "oTTTTTTTo", "oWWWWWWWo", "oWkkkkWWo", "oWWWWWWWo", "oooooooooo", ".ooooooooo"], x, y, { T: top, W: WHITE, k: "#9aa2b1" });
}

/** One flashcard on its own, face up or turned (a thin edge). */
export function flashcard(g: Grid, x: number, y: number, colour: string, edgeOn = false) {
  if (edgeOn) put(g, ["oo", "oW", "oW", "oW", "oW", "oo"], x + 3, y, { W: WHITE });
  else put(g, ["ooooooooo", "oCCCCCCCo", "oWWWWWWWo", "oWkkkWWWo", "oWWWWWWWo", "ooooooooo"], x, y, { C: colour, W: WHITE, k: "#9aa2b1" });
}

/** A small upright card of one colour. 5x7. */
export function colourCard(g: Grid, x: number, y: number, colour: string) {
  put(g, ["ooooo", "oCCCo", "oCLCo", "oCCCo", "oCCCo", "oCCCo", "ooooo"], x, y, { C: colour, L: mix(colour, "#ffffff", 0.4) });
}

/** A gold bangle round a wrist at (x, y), its shine at `turn` of 3. */
export function bangle(g: Grid, x: number, y: number, turn: number) {
  for (let k = -2; k <= 2; k++) g.set(x + k, y, k === turn - 1 ? "#fff0b0" : GOLD, "prop");
  for (let k = -2; k <= 2; k++) g.set(x + k, y + 1, GOLD_D, "prop");
}

/**
 * A reaction-time box on the desk: a big red button on top, pressed or not, and a lamp on the front
 * that goes red, amber, then green. 20 wide; its top at y, running off the bottom of the frame.
 */
export function reactionBox(g: Grid, x: number, y: number, light: "red" | "amber" | "green" | "off", pressed: boolean) {
  const lamp = { red: "#ff4b4b", amber: "#ffb627", green: "#5dff8a", off: "#4a4e58" }[light];
  const lit = mix(lamp, "#ffffff", 0.5);
  put(g, pressed ? ["......oooooooo......", ".....oBBBBBBBBo....."] : [".......oooooo.......", ".....ooBbBBBBBoo....", ".....oBBBBBBBBBo...."], x, y - (pressed ? 2 : 3), { B: "#ff5a5f", b: "#ff9a9d" });
  put(g, [
    "oooooooooooooooooooo",
    "oKKKKKKKKKKKKKKKKKKo",
    "oKooooKKKKKKKKKKKKKo",
    "oKoLloKkkkkkkkkkkKKo",
    "oKoLLoKKKKKKKKKKKKKo",
    "oKooooKkkkkkkKKKKKKo",
    "oKKKKKKKKKKKKKKKKKKo",
    "oKKKKKKKKKKKKKKKKKKo",
  ], x, y, { K: "#3a3d46", k: "#5b5f6b", L: lamp, l: light === "off" ? lamp : lit });
}

// ================================================================ Caitlin

/** An acoustic guitar: the body low on the left, the neck up to the right. Strings shimmer on `strum`. */
export function guitar(g: Grid, x: number, y: number, strum: boolean) {
  // The neck first, from the body to the headstock, then the body over its end.
  rod(g, x + 13, y + 4, x + 33, y - 8, "#5a3a26", "#3e281a", 3);
  for (let k = 3; k <= 18; k += 3) g.set(x + 13 + Math.round(k), y + 4 - Math.round(k * 0.6), "#c9ccd2", "prop");
  put(g, ["..oooo", ".oHHHo", "oHHHHo", "oHHHo.", "oooo.."], x + 32, y - 12, { H: "#3e281a" });
  put(g, [
    "....ooooooo.....",
    "..ooBBBBBBBoo...",
    ".oBBBBBBBBBBBo..",
    "oBBBBBBBBBBBBBo.",
    "oBBBBBBoooBBBBBo",
    "oBBBBBoKKKoBBBBo",
    "oBBBBBoKKKoBBBBo",
    "oBBBBBBoooBBBBo.",
    ".oBBBBBBBBBBBBo.",
    "oBBBBBBBBBBBBBBo",
    "oBBBBBBBBBBBBBBo",
    "oBBBBDDDBBBBBBBo",
    "oBBBBBBBBBBBBBBo",
  ], x, y, { B: "#d98b3a", K: "#2a1a10", D: "#7a4a22" });
  // The strings over the sound hole and up the neck.
  const s = strum ? "#fff6d8" : "#e6dcc4";
  for (let k = 0; k < 24; k++) g.set(x + 8 + k, y + 6 - Math.round(k * 0.6), k % 2 && strum ? "#ffffff" : s, "prop");
}

/** A game controller held in two hands: a d-pad, four buttons, `lit` showing which are pressed. 18x8. */
export function gameController(g: Grid, x: number, y: number, lit: number) {
  put(g, [
    "..oooooooooooooo..",
    ".oCCCCCCCCCCCCCCo.",
    "oCCDCCCCCCCCCYCCCo",
    "oCDDDCCooCCCBCRCCo",
    "oCCDCCCCCCCCCGCCCo",
    "oCCCCCooooooCCCCCo",
    ".oCCCo......oCCCo.",
    "..ooo........ooo..",
  ], x, y, { C: "#7d5ad8", D: "#2a2440", Y: YELLOW, B: BLUE, R: RED, G: GREEN });
  const press: [number, number][] = [[13, 2], [14, 3], [13, 4], [12, 3]];
  const [px, py] = press[lit % 4]!;
  g.set(x + px, y + py, "#ffffff", "prop");
  if (lit % 2) g.set(x + 3, y + 2, "#5a5078", "prop");
  else g.set(x + 2, y + 3, "#5a5078", "prop");
}

/** A tray of three cupcakes, sprinkles twinkling by beat. 24x10. */
export function cupcakeTray(g: Grid, x: number, y: number, beat: number) {
  const frost = ["#ff9ec0", "#b79cff", "#fff4e0"];
  for (let i = 0; i < 3; i++) {
    const cx = x + 2 + i * 7;
    put(g, ["..oo...", ".oFFFo.", "oFFFFFo", "oFFFFFo", "oCcCcCo", ".oCcCo."].map((r, k) => (k === 0 ? "..oRo.." : r)), cx, y - 1, { F: frost[i]!, C: "#f2c46b", c: "#d9a24a", R: RED });
    const sp = (beat + i) % 3;
    g.set(cx + 2 + sp, y + 2, ["#3bd1ff", "#ffe14a", "#5dff8a"][sp]!, "prop");
  }
  put(g, ["oooooooooooooooooooooooo", "oTTTTTTTTTTTTTTTTTTTTTTo", "oooooooooooooooooooooooo"], x, y + 5, { T: SILVER });
}

/** A board game box: a track of coloured squares round the lid, a die in the middle; `open` lifts the lid a crack. 16x12. */
export function boardGame(g: Grid, x: number, y: number, open: boolean) {
  const pal = { R: "#e5484d", G: GREEN, B: BLUE, Y: YELLOW, T: "#2fae9e", W: WHITE, K: INK };
  if (open) put(g, ["oooooooooooooooo", "oRWGWBWYWRWGWBWo", "oooooooooooooooo"], x, y + 9, pal);
  put(g, [
    "oooooooooooooooo",
    "oGBYRGBYRGBYRGBo",
    "oRTTTTTTTTTTTTGo",
    "oYTTTTTTTTTTTTYo",
    "oBTTTTooooTTTTRo",
    "oGTTTToKWWoTTTBo",
    "oRTTTToWKWoTTTYo",
    "oYTTTToWWKoTTTGo",
    "oBTTTTooooTTTTRo",
    "oGTTTTTTTTTTTTBo",
    "oRYGBRYGBRYGBRYo",
    "oooooooooooooooo",
  ].map((r, i) => (i >= 5 && i <= 7 ? r.slice(0, 6) + r.slice(6, 11) + r.slice(11) : r)), x, open ? y - 3 : y, pal);
}

/** A quiz card: the back with a big question mark, or the front with lines; `thin` mid-flip. 9x12. */
export function quizCard(g: Grid, x: number, y: number, side: "back" | "front" | "thin") {
  if (side === "thin") {
    put(g, ["oo", "oP", "oP", "oP", "oP", "oP", "oP", "oP", "oP", "oP", "oP", "oo"], x + 4, y, { P: WHITE });
    return;
  }
  put(g, box(9, 12, side === "back" ? "V" : "P", side === "back" ? "V" : "P"), x, y, { V: PURPLE, P: WHITE });
  if (side === "back")
    put(g, [".YYY.", "Y...Y", "...Y.", "..Y..", "..Y..", ".....", "..Y.."], x + 2, y + 2, { Y: YELLOW }, { edge: false });
  else for (let i = 0; i < 4; i++) for (let k = 0; k < [5, 4, 5, 2][i]!; k++) g.set(x + 2 + k, y + 3 + i * 2, i === 3 ? PURPLE : "#7d8696", "prop");
}

/** A phone seen from the back: a violet case and a camera lens, a flash on `flash`. 7x12. */
export function phoneBack(g: Grid, x: number, y: number, flash: boolean) {
  put(g, box(7, 12, "C", "C"), x, y, { C: "#3c3550" });
  put(g, ["ooo", "oLo", "ooo"], x + 2, y + 2, { L: "#7fb2ff" }, { edge: false });
  g.set(x + 4, y + 2, flash ? "#fffbe0" : "#c9ccd2", "prop");
  if (flash) put(g, ["..W..", ".WWW.", "WWWWW", ".WWW.", "..W.."], x + 2, y - 6, { W: "#fffbe0" }, { edge: false, region: "fx" });
}

/** Headphones over her head: the band over the top, a cup over each ear. */
export function headphones(g: Grid, colour = PURPLE) {
  const band = "#2a2731";
  for (const [x, y] of [[12, 12], [12, 11], [12, 10], [13, 9], [13, 8], [14, 7], [15, 6], [16, 5], [17, 4], [18, 3], [19, 3], [20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 3], [29, 3], [30, 4], [31, 5], [32, 6], [33, 7], [34, 8], [34, 9], [35, 10], [35, 11], [35, 12]] as const) {
    g.set(x, y, band, "prop");
    g.set(x, y - 1, OUTLINE, "outline");
  }
  for (const side of [0, 1]) {
    const x0 = side ? 33 : 10;
    put(g, ["oooo", "oCCo", "oCLo", "oCCo", "oCCo", "oCCo", "oCCo", "oooo"].map((r) => r), x0, 15, { C: side ? mix(colour, "#000000", 0.15) : colour, L: mix(colour, "#ffffff", 0.35) });
  }
}

/** A music note. */
export function note(g: Grid, x: number, y: number, colour = WHITE) {
  put(g, ["..CC", "..CC", "..C.", "..C.", "CCC.", "CC.."], x, y, { C: colour }, { edge: false, region: "fx" });
}

/**
 * An arcade panel at the bottom of the frame: a dark top with three big buttons, a violet front,
 * and a stick whose shaft leans `lean` (-1, 0, 1). `hit` is the button pressed. Returns where the
 * stick's ball is, so the hand can grip under it. 34 wide.
 */
export function arcadePanel(g: Grid, x: number, y: number, lean: number, hit: number): [number, number] {
  put(g, [
    "oooooooooooooooooooooooooooooooooo",
    "oTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTo",
    "oTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTo",
    "oDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDo",
    "oVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVo",
    "oVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVo",
    "oVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVo",
  ], x, y, { T: "#2b2d40", D: "#1b1c28", V: "#7d5ad8" });
  // Three buttons, a pressed one sunk into the panel.
  [YELLOW, BLUE, GREEN].forEach((c, i) => {
    const bx = x + 18 + i * 5;
    const down = hit === i;
    if (down) put(g, ["oCCCo"], bx, y + 1, { C: mix(c, "#000000", 0.3) }, { edge: false });
    else put(g, [".ooo.", "oLCCo", "oCCCo"], bx, y - 1, { C: c, L: mix(c, "#ffffff", 0.45) }, { edge: false });
  });
  // The stick: a silver shaft, its red ball drawn by `arcadeBall` once the hand is on it.
  const top: [number, number] = [x + 8 + lean * 2, y - 6];
  line(g, x + 8, y + 1, top[0], top[1] + 2, "#c9ccd2");
  return top;
}

/** The arcade stick's red ball, over the fingers holding it. */
export function arcadeBall(g: Grid, [x, y]: [number, number]) {
  put(g, [".oooo.", "oRLRRo", "oRRRRo", "oRRRso", ".oooo."], x - 2, y - 4, { R: RED, L: "#ff9a9d", s: RED_D });
}

// ================================================================ more of Paul's

/** A brass gear from the clock's spare parts, `phase` turning it. About 11 across. */
export function gear(g: Grid, cx: number, cy: number, phase: number) {
  const cells: [number, number][] = [];
  const mine = new Set<string>();
  for (let y = cy - 6; y <= cy + 6; y++)
    for (let x = cx - 6; x <= cx + 6; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx) - phase;
      const tooth = d <= 5.2 && Math.cos(6 * a) > 0.1;
      if (d > 3.7 && !tooth) continue;
      if (d < 1.3) {
        g.set(x, y, "#5a3d12", "prop");
      } else {
        const lit = dx + dy < -1 ? "#f3d27a" : dx + dy > 2 ? "#a8781f" : "#d4a23a";
        g.set(x, y, d > 2.4 && d < 3.1 ? "#b8861f" : lit, "prop");
      }
      cells.push([x, y]), mine.add(`${x},${y}`);
    }
  edgeRound(g, cells, mine);
}

/** A printout of code, `ring` of 4 strokes of red pen round its third line, a tick in the margin. 14x15. */
export function codeSheet(g: Grid, x: number, y: number, ring: number, tick: boolean) {
  put(g, box(14, 15, "P", "P"), x, y, { P: PAPER });
  const rows: [number, string, number][] = [[0, "#8c6bf2", 3], [2, "#7d8696", 6], [2, "#e08a2c", 4], [0, "#8c6bf2", 3], [2, "#7d8696", 7], [2, "#7d8696", 5]];
  rows.forEach(([indent, c, len], i) => {
    for (let k = 0; k < len; k++) g.set(x + 2 + indent + k, y + 2 + i * 2, c, "prop");
    if (indent === 0) for (let k = len + 1; k < len + 5; k++) g.set(x + 2 + k, y + 2 + i * 2, "#7d8696", "prop");
  });
  // The red pen ring round line three (y + 6), drawn a quarter at a time.
  const pts: [number, number][] = [[3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 5], [11, 6], [11, 7], [10, 8], [9, 8], [8, 8], [7, 8], [6, 8], [5, 8], [4, 8], [3, 8], [2, 7], [2, 6], [2, 5]];
  const n = Math.round((Math.min(4, ring) / 4) * pts.length);
  pts.slice(0, n).forEach(([dx, dy]) => g.set(x + dx, y + dy, RED, "prop"));
  if (tick) for (const [dx, dy] of [[11, 12], [12, 13], [13, 12], [14, 11]] as const) g.set(x + dx - 1, y + dy, RED, "prop");
}

// ================================================================ more of Yahya's

/** The weather station's cup anemometer on its pole, spinning (`beat` of 6 per turn). Hub at (cx, cy). */
export function anemometer(g: Grid, cx: number, cy: number, beat: number, pole: number) {
  line(g, cx, cy + 1, cx, cy + pole, SILVER_D);
  const cups = [0, 1, 2].map((i) => {
    const a = (beat / 6) * Math.PI * 2 + (i * Math.PI * 2) / 3;
    return { x: Math.round(cx + Math.cos(a) * 5), front: Math.sin(a) > 0, dir: Math.sin(a + Math.PI / 2) > 0 ? 1 : -1 };
  });
  // Back cups first, then the arms, then the front cups.
  const cup = (c: { x: number; front: boolean; dir: number }) =>
    put(g, c.dir > 0 ? ["oCC.", "oCCC", ".oo."] : [".CCo", "CCCo", ".oo."], c.x - 2, cy - 1, { C: c.front ? "#e5484d" : "#b9363b" });
  cups.filter((c) => !c.front).forEach(cup);
  for (const c of cups) line(g, cx, cy, c.x, cy, SILVER);
  put(g, ["ooo", "oSo", "ooo"], cx - 1, cy - 1, { S: SILVER_L }, { edge: false });
  cups.filter((c) => c.front).forEach(cup);
}

/** A stack of papers, `neat` or not, a tap mark under it on `tap`. 13x10. */
export function paperStack(g: Grid, x: number, y: number, neat: number, tap: boolean) {
  // neat 0: fanned out; 1: half straight; 2: square.
  const offs: [number, number][][] = [[[-3, 2], [3, -2], [1, 0]], [[-1, 1], [1, -1], [0, 0]], [[0, 0], [0, 0], [0, 0]]];
  for (const [i, [dx, dy]] of offs[neat]!.entries()) {
    put(g, box(12, 10, "P", "P"), x + dx, y + dy + (2 - i), { P: i === 2 ? PAPER : PAPER_D });
    if (i === 2) for (let r = 0; r < 3; r++) for (let k = 0; k < [7, 5, 8][r]!; k++) g.set(x + dx + 2 + k, y + dy + 2 + 2 + r * 2, k % 4 === 3 ? "#b8bfcc" : "#7d8696", "prop");
  }
  void tap;
}

// ================================================================ more of Aaesha's

/** A tray of four memory cards, 2x2: `up` says which show their picture, `match` glows them green. 15x15. */
export function memoryTray(g: Grid, x: number, y: number, up: boolean[], match: boolean) {
  put(g, box(15, 15, "T", "T"), x, y, { T: "#c9a27a" });
  const pics = [P_STAR, P_HEART, P_HEART, P_STAR];
  ([[2, 2], [8, 2], [2, 8], [8, 8]] as const).forEach(([dx, dy], i) => {
    const shown = up[i];
    const edge = shown && match && (i === 0 || i === 3) ? "#3ad16f" : OUTLINE;
    const rows = ["ooooo", "oCCCo", "oCCCo", "oCCCo", "ooooo"].map((r) => r.replace(/o/g, "e"));
    put(g, rows, x + dx, y + dy, { e: edge, C: shown ? WHITE : "#ff7a6b" }, { edge: false });
    if (shown) pics[i]!(g, x + dx + 1, y + dy + 1);
    else g.set(x + dx + 2, y + dy + 2, "#ffd0c8", "prop");
  });
}
function P_STAR(g: Grid, x: number, y: number) {
  g.set(x + 1, y, YELLOW, "prop"), g.set(x, y + 1, YELLOW, "prop"), g.set(x + 1, y + 1, GOLD_D, "prop"), g.set(x + 2, y + 1, YELLOW, "prop"), g.set(x + 1, y + 2, YELLOW, "prop");
}
function P_HEART(g: Grid, x: number, y: number) {
  g.set(x, y, RED, "prop"), g.set(x + 2, y, RED, "prop"), g.set(x, y + 1, RED, "prop"), g.set(x + 1, y + 1, RED, "prop"), g.set(x + 2, y + 1, RED, "prop"), g.set(x + 1, y + 2, RED, "prop");
}

/** A test runner's screen (12x8): failing red, running dots, or passing green. */
export function testScreen(g: Grid, sx: number, sy: number, state: "fail" | "run1" | "run2" | "run3" | "pass") {
  if (state === "fail") {
    for (let k = 0; k < 5; k++) g.set(sx + 4 + k, sy + k, RED, "prop"), g.set(sx + 8 - k, sy + k, RED, "prop");
    for (let k = 0; k < 12; k++) g.set(sx + k, sy + 7, RED_D, "prop");
  } else if (state === "pass") {
    for (const [dx, dy] of [[3, 3], [4, 4], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1]] as const) g.set(sx + dx, sy + dy, "#4ee07e", "prop"), g.set(sx + dx, sy + dy + 1, "#2fa85a", "prop");
    for (let k = 0; k < 12; k++) g.set(sx + k, sy + 7, "#2fa85a", "prop");
  } else {
    const n = state === "run1" ? 1 : state === "run2" ? 2 : 3;
    for (let i = 0; i < 3; i++) g.set(sx + 4 + i * 2, sy + 3, i < n ? "#e8ebf0" : SCREEN_L, "prop");
    for (let k = 0; k < 12; k++) g.set(sx + k, sy + 7, k < n * 4 ? "#7fb2ff" : SCREEN_L, "prop");
  }
}

/** A little hand balance hanging from her fingers: a beam tipped `tilt` (-1, 0, 1), a pan each end. Ring at (x, y). */
export function handBalance(g: Grid, x: number, y: number, tilt: number) {
  const brass = "#d4a23a";
  const brassD = "#8f6a22";
  put(g, [".o.", "oBo", ".o."], x - 1, y - 1, { B: brass }, { edge: false });
  line(g, x, y + 1, x, y + 3, brassD);
  const [l, r] = [y + 4 + tilt * 2, y + 4 - tilt * 2];
  rod(g, x - 8, l, x + 8, r, brass, brassD, 2);
  put(g, ["ooo", "oBo", "ooo"], x - 1, y + 3, { B: GOLD_L }, { edge: false });
  for (const [ex, ey, item] of [[x - 8, l, RED], [x + 8, r, BLUE]] as const) {
    line(g, ex - 3, ey + 6, ex, ey + 2, "#9aa0ab"), line(g, ex + 3, ey + 6, ex, ey + 2, "#9aa0ab");
    put(g, ["ooooooooo", "oPPPPPPPo", ".oPPPPPo.", "..ooooo.."], ex - 4, ey + 7, { P: brass });
    put(g, ["ooooo", "oIIIo", "oIiIo", "ooooo"].map((q) => q), ex - 2, ey + 4, { I: item, i: mix(item, "#ffffff", 0.35) }, { edge: false });
  }
}

/** A tally counter: a silver case, a plunger on top, a ring for her finger, two digits. 11x12. */
export function tallyCounter(g: Grid, x: number, y: number, n: number, pressed: boolean) {
  put(g, [
    pressed ? "..........." : "....ooo....",
    pressed ? "....ooo...." : "....oSo....",
    "..ooooooo..",
    ".oSSSSSSSo.",
    "oSSKKKKKSSo",
    "oSSKKKKKSSo",
    "oSSKKKKKSSo",
    "oSSKKKKKSSo",
    "oSSKKKKKSSo",
    ".oSSSSSSSo.",
    "..ooSSSoo..",
    "....oRo....",
  ].map((r, i) => (i === 11 ? "...oo.oo..." : r)), x, y, { S: SILVER, K: "#20232a", R: SILVER_D });
  digits(g, x + 3, y + 4, String(n % 100).padStart(2, "0").slice(-1), "#f4f6fb");
  g.set(x + 3, y + 6, "#5b5f6b", "prop");
}

/** A card with a little network on it, the signal at layer `step` (0 none, 1 in, 2 hidden, 3 out). 17x13. */
export function networkCard(g: Grid, x: number, y: number, step: number) {
  put(g, box(17, 13, "P", "P"), x, y, { P: PAPER });
  const layers: [number, number][][] = [[[3, 3], [3, 9]], [[8, 3], [8, 9]], [[13, 6]]];
  for (let li = 0; li < 2; li++)
    for (const a of layers[li]!) for (const b of layers[li + 1]!) line(g, x + a[0], y + a[1], x + b[0], y + b[1], step === li + 2 || (step === li + 1 && li === 0) ? "#ffb3a8" : "#c3c8d0");
  // Each node a little ring, lit coral when the signal reaches its layer.
  layers.forEach((nodes, li) =>
    nodes.forEach(([nx, ny]) => {
      const on = step === li + 1;
      put(g, [".N.", "NLN", ".N."], x + nx - 1, y + ny - 1, { N: on ? "#ff5a4a" : "#5b8fd9", L: on ? "#ffd2cb" : "#9cc0f2" }, { edge: false });
    }),
  );
}
