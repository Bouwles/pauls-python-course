// Pixel people (REDESIGN3_PLAN.md P1): every person in the course, the cast and each learner's
// avatar, drawn on one 48x52 grid in the style of the cast reference (art/pixel-reference/).
// A person is a look (face, skin, hair, brows, glasses, clothes) plus a moment: an expression,
// a pose with arms, a blink, a mouth open mid-word, a hand mid-wave. The same code draws in the
// browser (components/art/PixelPerson.tsx) and in Node (scripts/draw-cast-pixels.ts).

export const W = 48;
export const H = 52;

export type Expression = "neutral" | "talking" | "pleased" | "proud" | "thinking" | "confused" | "worried" | "surprised" | "laughing" | "unimpressed";
export type Pose = "idle" | "wave" | "cheer" | "think" | "point" | "thumbs";
export const EXPRESSIONS: Expression[] = ["neutral", "talking", "pleased", "proud", "thinking", "confused", "worried", "surprised", "laughing", "unimpressed"];
export const POSES: Pose[] = ["idle", "wave", "cheer", "think", "point", "thumbs"];

export type FaceShape = "standard" | "oval" | "strong" | "round" | "square" | "long" | "heart";
export type BrowShape = "straight" | "thick" | "arched" | "defined" | "bold" | "fine";
export type RestingMouth = "smile" | "grin" | "half" | "smirk" | "flat";
export type HairStyle =
  | "cap-back"
  | "quiff"
  | "long-framing"
  | "long-wavy"
  | "long-behind"
  | "curls-fringe"
  | "short-straight"
  | "short-curly"
  | "buzz"
  | "wavy-medium"
  | "curly-medium"
  | "afro"
  | "braids"
  | "locs"
  | "bun"
  | "ponytail"
  | "bob"
  | "shaved"
  | "hijab"
  | "turban"
  | "beanie";

export type Top =
  | { kind: "varsity"; body: string; sleeves: string; trim: string; shirt?: string }
  | { kind: "shirt"; colour: string }
  | { kind: "tee"; colour: string }
  | { kind: "overshirt"; outer: string; inner: string }
  | { kind: "jacket"; outer: string; inner: string }
  | { kind: "hoodie"; colour: string }
  | { kind: "jumper"; colour: string };

export interface PersonLook {
  face: FaceShape;
  skin: string;
  skinShade: string;
  lip: string;
  iris: string;
  brow: string;
  browShape: BrowShape;
  mouth: RestingMouth;
  hairStyle: HairStyle;
  hair: string;
  hairShade: string;
  hairLight: string;
  /** Hair that turns another colour towards the ends, from this row down. */
  ends?: { colour: string; shade: string; light: string; from: number };
  /** For hats, scarves and wraps: the fabric's colour. */
  fabric?: string;
  glasses?: "rect" | "round" | null;
  glassesColour?: string;
  stubble?: boolean;
  moustache?: boolean;
  blush?: string;
  earrings?: string;
  necklace?: string;
  accessory?: "none" | "headphones" | "cap" | "scarf";
  /** Shoulder width: slim (28 px) or regular (30 px), against a 20 px head. */
  build?: "slim" | "regular";
  top: Top;
}

export interface Moment {
  expression?: Expression;
  pose?: Pose;
  /** Eyes shut for a blink. */
  blink?: boolean;
  /** Mouth open mid-word, when talking: 1 a little (e, i, u), 2 wide (a, o); true is wide. */
  open?: boolean | 0 | 1 | 2;
  /** Which frame of a gesture (a wave goes 0, 1, 0, 1...). */
  beat?: number;
}

// ---------------------------------------------------------------- colour

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a: string, b: string, t: number): string => {
  const [x, y] = [hex(a), hex(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("");
};
const OUTLINE = "#1a1418";
const M = (x: number) => W - 1 - x;

// ---------------------------------------------------------------- the grid

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
}

type Run = [number, number];
type Rows = Record<number, Run | Run[]>;
type Paint = string | ((x: number, y: number) => string);

/** Fill runs: `rows` maps a row to [left, right] or several. With `mirror`, both sides of the face. */
function runs(g: Grid, colour: Paint, rows: Rows, region = "hair", mirror = false) {
  for (const [y, v] of Object.entries(rows)) {
    const list = (Array.isArray(v[0]) ? v : [v]) as Run[];
    for (const [l, r] of list)
      for (let x = l; x <= r; x++) {
        g.set(x, +y, typeof colour === "function" ? colour(x, +y) : colour, region);
        if (mirror) g.set(M(x), +y, typeof colour === "function" ? colour(M(x), +y) : colour, region);
      }
  }
}

// ---------------------------------------------------------------- faces

const TOP: Record<number, number> = { 10: 6, 11: 8, 12: 9, 13: 9, 14: 10, 15: 10, 16: 10, 17: 10, 18: 10, 19: 10, 20: 10, 21: 10, 22: 10, 23: 10, 24: 10, 25: 10, 26: 10 };
const FACES: Record<FaceShape, Record<number, number>> = {
  standard: { ...TOP, 27: 9, 28: 9, 29: 8, 30: 7, 31: 6, 32: 4, 33: 2 },
  oval: { ...TOP, 25: 10, 26: 9, 27: 9, 28: 8, 29: 7, 30: 6, 31: 5, 32: 3, 33: 1 },
  strong: { ...TOP, 27: 10, 28: 9, 29: 9, 30: 8, 31: 7, 32: 5, 33: 3 },
  round: { ...TOP, 10: 7, 11: 9, 27: 10, 28: 10, 29: 9, 30: 8, 31: 7, 32: 5, 33: 2 },
  square: { ...TOP, 10: 8, 11: 9, 12: 10, 13: 10, 27: 10, 28: 10, 29: 10, 30: 9, 31: 8, 32: 6, 33: 3 },
  long: { ...TOP, 26: 9, 27: 9, 28: 8, 29: 8, 30: 7, 31: 6, 32: 5, 33: 3, 34: 1 },
  heart: { ...TOP, 14: 10, 24: 9, 25: 9, 26: 8, 27: 8, 28: 7, 29: 6, 30: 5, 31: 4, 32: 2, 33: 1 },
};

/** Half-widths of the torso, shoulder line to the bottom of the frame. */
function torsoOf(p: PersonLook): Record<number, number> {
  const w = p.build === "regular" ? 15 : 14;
  return { 38: w - 6, 39: w - 3, 40: w - 1, 41: w, 42: w, 43: w, 44: w, 45: w, 46: w, 47: w, 48: w, 49: w, 50: w, 51: w };
}

/** Which arms hang at the sides: a gesture lifts one or both away. */
type Arms = { left: boolean; right: boolean };
const ARMS: Record<Pose, Arms> = {
  idle: { left: true, right: true },
  wave: { left: true, right: false },
  cheer: { left: false, right: false },
  think: { left: true, right: false },
  point: { left: true, right: false },
  thumbs: { left: true, right: false },
};

function body(g: Grid, p: PersonLook, arms: Arms) {
  for (let y = 32; y <= 38; y++) g.row(y, 3, y < 35 ? p.skinShade : p.skin, "neck");
  const torso = torsoOf(p);
  const base = p.top.kind === "varsity" ? p.top.body : p.top.kind === "overshirt" || p.top.kind === "jacket" ? p.top.outer : p.top.colour;
  for (const [y, hw] of Object.entries(torso)) g.row(+y, hw, base, "body");
  clothes(g, p, torso);
  // The arms hang at the sides from the shoulder: four pixels of sleeve, a crease where they
  // meet the body. A lifted arm leaves its side empty below the shoulder.
  const sleeve = sleeveOf(p);
  const crease = mix(sleeve, "#000000", 0.42);
  const hw = torso[44]!;
  for (const [side, on] of [[0, arms.left], [1, arms.right]] as const) {
    const edge = side ? 23 + hw : 24 - hw;
    const dir = side ? -1 : 1;
    for (let y = 42; y <= 51; y++) {
      if (on) {
        for (let i = 0; i < 4; i++) g.set(edge + dir * i, y, i === 0 && side ? mix(sleeve, "#000000", 0.12) : sleeve, "arm");
        if (y >= 44) g.set(edge + dir * 4, y, crease, "body");
      } else if (y >= 44) {
        for (let i = 0; i < 4; i++) g.set(edge + dir * i, y, "", "");
      }
    }
    if (on) g.set(edge + dir * 3, 43, crease, "body");
  }
  // Empty cells left by a lifted arm go back to nothing.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g.c[y]![x] === "") (g.c[y]![x] = null), (g.r[y]![x] = null);
}

function clothes(g: Grid, p: PersonLook, torso: Record<number, number>) {
  const t = p.top;
  const neckOpen = (inner: string, l = 19, r = 28) => {
    for (let y = 38; y <= 51; y++) for (let x = l; x <= r; x++) g.set(x, y, inner, "body");
    for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
  };
  if (t.kind === "varsity") {
    // Shoulders in the sleeve colour, as a varsity jacket's are.
    for (const [y, hw] of Object.entries(torso)) if (+y <= 42) for (let x = 24 - hw; x <= 23 + hw; x++) if (Math.abs(x - 23.5) > hw - 4) g.set(x, +y, t.sleeves, "body");
    if (t.shirt) {
      // Open over a collared shirt, with cream ribbing and snaps.
      for (let y = 38; y <= 41; y++) for (let x = 19; x <= 28; x++) if (Math.abs(x - 23.5) >= 7 - (y - 38) * 1.4) g.set(x, y, t.trim, "body");
      for (const [x, y] of [[20, 38], [21, 39], [22, 40], [27, 38], [26, 39], [25, 40], [20, 39], [27, 39]] as const) g.set(x, y, t.shirt, "body");
      for (let y = 41; y <= 51; y++) g.set(23, y, mix(t.body, "#000000", 0.25), "body"), g.set(24, y, mix(t.body, "#000000", 0.25), "body");
      for (const y of [44, 47, 50]) g.set(22, y, t.trim, "body");
    } else {
      // Worn over a dark top, with striped ribbing on the collar.
      neckOpen("#1d1d24");
      for (const [x, y] of [[18, 38], [19, 39], [19, 40], [19, 41], [29, 38], [28, 39], [28, 40], [28, 41], [17, 38], [30, 38], [18, 39], [29, 39]] as const) g.set(x, y, t.trim, "body");
      for (const [x, y] of [[17, 39], [18, 40], [18, 41], [30, 39], [29, 40], [29, 41]] as const) g.set(x, y, t.body, "body");
      for (const [x, y] of [[16, 39], [17, 40], [17, 41], [31, 39], [30, 40], [30, 41]] as const) g.set(x, y, t.trim, "body");
      for (let y = 42; y <= 51; y++) g.set(19, y, mix(t.body, "#000000", 0.08), "body"), g.set(28, y, mix(t.body, "#000000", 0.08), "body");
    }
  } else if (t.kind === "shirt") {
    for (const [y, hw] of Object.entries(torso)) g.set(24 - hw, +y, mix(t.colour, "#000000", 0.1), "body"), g.set(23 + hw, +y, mix(t.colour, "#000000", 0.14), "body");
    const hi = mix(t.colour, "#ffffff", 0.6);
    const lo = mix(t.colour, "#000000", 0.18);
    for (const [x, y] of [[18, 37], [19, 38], [20, 39], [21, 40], [29, 37], [28, 38], [27, 39], [26, 40], [19, 37], [28, 37], [20, 38], [27, 38]] as const) g.set(x, y, hi, "body");
    for (const [x, y] of [[18, 38], [19, 39], [20, 40], [29, 38], [28, 39], [27, 40]] as const) g.set(x, y, lo, "body");
    for (let y = 41; y <= 51; y++) g.set(24, y, mix(t.colour, "#000000", 0.12), "body");
    for (const y of [43, 47, 51]) g.set(24, y, mix(t.colour, "#000000", 0.3), "body");
  } else if (t.kind === "tee") {
    for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
    for (let x = 21; x <= 26; x++) g.set(x, 39, p.skin, "neck");
    for (const [y, hw] of Object.entries(torso)) g.set(23 + hw, +y, mix(t.colour, "#000000", 0.15), "body");
  } else if (t.kind === "overshirt" || t.kind === "jacket") {
    neckOpen(t.inner, 18, 29);
    const edge = mix(t.outer, "#000000", 0.18);
    for (const [x, y] of [[17, 38], [18, 39], [18, 40], [17, 41], [30, 38], [29, 39], [29, 40], [30, 41]] as const) g.set(x, y, edge, "body");
    for (let y = 42; y <= 51; y++) g.set(18, y, edge, "body"), g.set(29, y, edge, "body");
    for (const [y, hw] of Object.entries(torso)) g.set(t.kind === "jacket" ? 24 - hw + 1 : 23 + hw, +y, mix(t.outer, "#000000", 0.12), "body");
  } else if (t.kind === "hoodie") {
    // The hood bunched round the neck, and two drawstrings.
    const hood = mix(t.colour, "#000000", 0.18);
    for (const [x, y] of [[16, 38], [17, 38], [18, 38], [19, 37], [28, 37], [29, 38], [30, 38], [31, 38], [17, 39], [18, 39], [29, 39], [30, 39]] as const) g.set(x, y, hood, "body");
    for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
    for (let y = 40; y <= 45; y++) g.set(21, y, "#f2f2ee", "body"), g.set(26, y, "#f2f2ee", "body");
    for (let x = 19; x <= 28; x++) g.set(x, 50, mix(t.colour, "#000000", 0.1), "body");
    for (const [y, hw] of Object.entries(torso)) g.set(23 + hw, +y, mix(t.colour, "#000000", 0.15), "body");
  } else if (t.kind === "jumper") {
    // A crew neck with ribbing.
    const rib = mix(t.colour, "#000000", 0.2);
    for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
    for (const [x, y] of [[19, 38], [20, 39], [21, 39], [22, 40], [23, 40], [24, 40], [25, 40], [26, 39], [27, 39], [28, 38]] as const) g.set(x, y, rib, "body");
    for (const [y, hw] of Object.entries(torso)) g.set(23 + hw, +y, mix(t.colour, "#000000", 0.15), "body");
  }
  if (p.necklace) {
    for (const [x, y] of [[20, 38], [21, 39], [22, 40], [23, 40], [24, 40], [25, 40], [26, 39], [27, 38]] as const) g.set(x, y, p.necklace, "accessory");
    g.set(24, 41, mix(p.necklace, "#ffffff", 0.2), "accessory");
  }
}

function sleeveOf(p: PersonLook): string {
  const t = p.top;
  if (t.kind === "varsity") return t.sleeves;
  if (t.kind === "overshirt" || t.kind === "jacket") return t.outer;
  return t.colour;
}

function head(g: Grid, p: PersonLook) {
  for (const [y, hw] of Object.entries(FACES[p.face])) {
    g.row(+y, hw, p.skin, "skin");
    if (+y > 13) for (let x = 23 + hw - 1; x <= 23 + hw; x++) g.set(x, +y, p.skinShade, "skin");
  }
  for (let y = 20; y <= 25; y++) g.set(13, y, p.skin, "ear"), g.set(34, y, p.skinShade, "ear");
  g.set(13, 22, p.skinShade, "ear");
  g.set(34, 22, mix(p.skinShade, "#000000", 0.15), "ear");
  if (p.earrings) g.set(13, 26, p.earrings, "accessory"), g.set(34, 26, mix(p.earrings, "#000000", 0.12), "accessory");
}

// ---------------------------------------------------------------- the face, by expression

type EyeMode = "open" | "closed" | "happy" | "wide" | "half" | "up";

function eyes(g: Grid, p: PersonLook, mode: EyeMode) {
  const lash = "#1d1514";
  for (const [x0, flip] of [[17, false], [27, true]] as const) {
    const xs = flip ? [x0 + 3, x0 + 2, x0 + 1, x0] : [x0, x0 + 1, x0 + 2, x0 + 3];
    if (mode === "closed") {
      for (const x of xs) g.set(x, 22, lash, "eye");
      continue;
    }
    if (mode === "happy") {
      // Closed in a smile: an upward arc.
      g.set(xs[0]!, 22, lash, "eye"), g.set(xs[1]!, 21, lash, "eye"), g.set(xs[2]!, 21, lash, "eye"), g.set(xs[3]!, 22, lash, "eye");
      continue;
    }
    const lid = mode === "wide" ? 20 : 21;
    for (const x of xs) g.set(x, lid, lash, "eye");
    const rows = mode === "wide" ? [21, 22, 23] : [22, 23];
    const iris = mode === "up" ? (flip ? [xs[2]!, xs[1]!] : [xs[0]!, xs[1]!]) : [xs[1]!, xs[2]!];
    for (const y of rows) for (const x of xs) g.set(x, y, y === rows[rows.length - 1] && !iris.includes(x) ? p.skin : "#f4efe9", "eye");
    const top = mode === "up" ? rows[0]! : rows[rows.length - 2]!;
    g.set(iris[0]!, top, p.iris, "eye");
    g.set(iris[1]!, top, "#100c0b", "eye");
    g.set(iris[0]!, top + 1, mix(p.iris, "#000000", 0.25), "eye");
    g.set(iris[1]!, top + 1, p.iris, "eye");
    g.set(flip ? iris[1]! : iris[0]!, top, mix(p.iris, "#ffffff", 0.35), "eye");
    if (mode === "half") for (const x of xs) g.set(x, 22, mix(p.skin, "#000000", 0.12), "eye");
  }
}

const BROWS: Record<BrowShape, [number, number][]> = {
  straight: [[16, 19], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19]],
  thick: [[16, 19], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18]],
  arched: [[16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 19], [17, 19], [18, 19]],
  defined: [[16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [17, 19], [18, 19], [19, 19]],
  bold: [[15, 20], [16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [22, 19], [16, 20], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19]],
  fine: [[16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 19]],
};

type BrowMode = "rest" | "up" | "worried" | "cross" | "one-up" | "low";

function brows(g: Grid, p: PersonLook, mode: BrowMode) {
  const shape = BROWS[p.browShape];
  for (const side of [0, 1]) {
    for (const [x, y] of shape) {
      let dy = 0;
      const inner = x >= 20; // the end nearest the nose
      if (mode === "up") dy = -1;
      else if (mode === "worried") dy = inner ? -1 : 0;
      else if (mode === "cross") dy = inner ? 1 : 0;
      else if (mode === "one-up") dy = side === 1 ? -1 : 0;
      else if (mode === "low") dy = 1;
      g.set(side ? M(x) : x, y + dy, p.brow, "brow");
    }
  }
}

function nose(g: Grid, p: PersonLook) {
  g.set(24, 24, p.skinShade, "skin");
  g.set(24, 25, p.skinShade, "skin");
  g.set(23, 26, mix(p.skinShade, "#000000", 0.08), "skin");
  g.set(24, 26, mix(p.skinShade, "#000000", 0.12), "skin");
}

type MouthMode = RestingMouth | "open" | "ajar" | "o" | "laugh" | "frown" | "wavy" | "side";

/**
 * Mouths: small, soft and set just under the nose, in the person's own skin and lip tones, so they
 * belong to the face. A line for a closed mouth, a small dark opening when talking, a thin strip
 * of teeth only on a grin or a laugh.
 */
function mouth(g: Grid, p: PersonLook, m: MouthMode) {
  const y = 28;
  const line = mix(mix(p.skinShade, p.lip, 0.55), "#000000", 0.18);
  const soft = mix(p.skinShade, p.lip, 0.35);
  const inside = mix(p.lip, "#2a0f0f", 0.55);
  const teeth = mix("#f4efe8", p.skin, 0.15);
  const S = (x: number, yy: number, c: string) => g.set(x, yy, c, "mouth");
  const row = (yy: number, a: number, b2: number, c: string) => {
    for (let x = a; x <= b2; x++) S(x, yy, c);
  };
  switch (m) {
    case "smile":
      row(y, 22, 25, line);
      S(21, y - 1, line), S(26, y - 1, line);
      row(y + 1, 23, 24, soft);
      break;
    case "half":
      row(y, 22, 25, line);
      S(26, y - 1, line);
      row(y + 1, 23, 24, soft);
      break;
    case "smirk":
      row(y, 22, 25, line);
      S(26, y - 1, line), S(27, y - 1, soft);
      break;
    case "flat":
      row(y, 22, 25, line);
      break;
    case "grin":
      // A wide smile with a thin strip of teeth.
      S(20, y - 1, line), S(27, y - 1, line);
      S(21, y, line), row(y, 22, 25, teeth), S(26, y, line);
      row(y + 1, 22, 25, line);
      break;
    case "laugh":
      S(20, y - 1, line), S(27, y - 1, line);
      S(21, y, line), row(y, 22, 25, teeth), S(26, y, line);
      S(21, y + 1, line), row(y + 1, 22, 25, inside), S(26, y + 1, line);
      row(y + 2, 22, 25, line);
      break;
    case "open":
      // Mid-word, wide: a small dark oval.
      row(y, 22, 25, line);
      S(22, y + 1, line), row(y + 1, 23, 24, inside), S(25, y + 1, line);
      row(y + 2, 23, 24, line);
      break;
    case "ajar":
      // Mid-word, a little.
      S(22, y, line), row(y, 23, 24, inside), S(25, y, line);
      row(y + 1, 23, 24, soft);
      break;
    case "o":
      row(y, 23, 24, line);
      S(22, y + 1, line), row(y + 1, 23, 24, inside), S(25, y + 1, line);
      row(y + 2, 23, 24, line);
      break;
    case "frown":
      row(y, 22, 25, line);
      S(21, y + 1, line), S(26, y + 1, line);
      break;
    case "wavy":
      S(21, y, line), S(22, y + 1, line), S(23, y, line), S(24, y, line), S(25, y + 1, line), S(26, y, line);
      break;
    case "side":
      row(y, 24, 26, line);
      S(27, y - 1, line);
      break;
  }
}

function face(g: Grid, p: PersonLook, expression: Expression, blink: boolean, open: 0 | 1 | 2) {
  const E: Record<Expression, { eyes: EyeMode; brows: BrowMode; mouth: MouthMode | "rest" }> = {
    neutral: { eyes: "open", brows: "rest", mouth: "rest" },
    talking: { eyes: "open", brows: "rest", mouth: "rest" },
    pleased: { eyes: "open", brows: "rest", mouth: p.mouth === "grin" ? "grin" : "smile" },
    proud: { eyes: "open", brows: "up", mouth: p.mouth === "flat" ? "half" : p.mouth === "grin" ? "grin" : "smile" },
    thinking: { eyes: "up", brows: "one-up", mouth: "side" },
    confused: { eyes: "open", brows: "one-up", mouth: "wavy" },
    worried: { eyes: "open", brows: "worried", mouth: "frown" },
    surprised: { eyes: "wide", brows: "up", mouth: "o" },
    laughing: { eyes: "happy", brows: "up", mouth: "laugh" },
    unimpressed: { eyes: "half", brows: "low", mouth: "flat" },
  };
  const e = E[expression];
  eyes(g, p, blink && e.eyes !== "happy" ? "closed" : e.eyes);
  brows(g, p, e.brows);
  nose(g, p);
  const resting: MouthMode = e.mouth === "rest" ? p.mouth : e.mouth;
  const m: MouthMode = open === 2 ? (expression === "laughing" ? "laugh" : "open") : open === 1 ? "ajar" : resting;
  mouth(g, p, m);
  if (p.blush) for (const [x, y] of [[17, 26], [18, 26], [29, 26], [30, 26]] as const) g.set(x, y, p.blush, "skin");
  if (p.stubble) stubble(g, p);
  if (p.moustache) for (let x = 22; x <= 25; x++) g.set(x, 27, mix(p.hair, p.skin, 0.35), "skin");
}

function stubble(g: Grid, p: PersonLook) {
  const s = mix(p.skin, p.hair, 0.3);
  for (const [y, hw] of Object.entries(FACES[p.face])) {
    if (+y < 28) continue;
    for (let x = 24 - hw; x <= 23 + hw; x++) {
      if (g.get(x, +y) !== "skin") continue;
      if ((x * 3 + +y * 2) % 4 === 0 || (+y >= 31 && (x + +y) % 2 === 0)) g.set(x, +y, s, "skin");
    }
  }
  // A thin moustache comes with the stubble.
  for (let x = 21; x <= 26; x++) if (g.get(x, 27) === "skin") g.set(x, 27, mix(p.skin, p.hair, 0.5), "skin");
}

function glasses(g: Grid, kind: "rect" | "round", frame: string) {
  if (kind === "rect") {
    for (const x0 of [15, 26]) {
      for (let x = x0; x <= x0 + 6; x++) g.set(x, 20, frame, "glasses"), g.set(x, 24, frame, "glasses");
      for (let y = 20; y <= 24; y++) g.set(x0, y, frame, "glasses"), g.set(x0 + 6, y, frame, "glasses");
    }
  } else {
    for (const cx of [18.5, 28.5]) {
      const pts = [[-2, -2], [-1, -3], [0, -3], [1, -3], [2, -2], [3, -1], [3, 0], [3, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 2], [-3, 1], [-3, 0], [-3, -1]];
      for (const [dx, dy] of pts) g.set(Math.round(cx + dx!), 22 + dy!, frame, "glasses");
    }
  }
  for (const x of [22, 23, 24, 25]) g.set(x, 21, frame, "glasses");
  g.set(14, 21, frame, "glasses"), g.set(33, 21, frame, "glasses");
}

// ---------------------------------------------------------------- hair and headwear

const shadeOf = (p: PersonLook, y: number) => (p.ends && y >= p.ends.from ? p.ends.shade : p.hairShade);
const colourOf = (p: PersonLook) => (_x: number, y: number) =>
  p.ends && y >= p.ends.from ? p.ends.colour : p.ends && y >= p.ends.from - 3 ? mix(p.hair, p.ends.colour, (y - p.ends.from + 4) / 4) : p.hair;

function shadeHair(g: Grid, p: PersonLook, region = "hair") {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g.get(x, y) !== region) continue;
      if (x > 31 || g.get(x, y + 1) !== region) g.c[y]![x] = shadeOf(p, y);
      const d = Math.hypot(x - 21, (y - 9) * 1.3);
      if (d > 4.4 && d < 5.8 && x < 20 && y < 9) g.c[y]![x] = p.hairLight;
    }
}

function curls(g: Grid, p: PersonLook, points: [number, number][]) {
  for (const [x, y] of points) for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0]] as const) g.tint(x + dx, y + dy, p.hairLight, "hair");
}

function strand(g: Grid, p: PersonLook, x0: number, y0: number, x1: number, y1: number, colour = p.hairLight) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) g.tint(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), colour, "hair");
}

function longBack(g: Grid, p: PersonLook, to = 51, hw = 13) {
  for (let y = 12; y <= to; y++) {
    const w = y < 16 ? hw - 1 : hw;
    for (let x = 24 - w; x <= 23 + w; x++) g.set(x, y, colourOf(p)(x, y), "hairBack");
  }
}

function crown(g: Grid, p: PersonLook) {
  runs(g, colourOf(p), { 4: [18, 29], 5: [15, 32], 6: [13, 34], 7: [12, 35], 8: [12, 35], 9: [11, 36], 10: [11, 36], 11: [11, 36], 12: [11, 36] });
  runs(g, colourOf(p), { 10: [[21, 22], [25, 26]], 11: [[19, 22], [25, 28]], 12: [[18, 21], [26, 29]], 13: [[17, 18], [29, 30]] });
}

function longSides(g: Grid, p: PersonLook, to: number, opts: { wave?: boolean; slim?: boolean } = {}) {
  for (let y = 13; y <= to; y++) {
    const inner = y < 20 ? 14 : 13;
    const wave = opts.wave ? (y >> 2) % 2 : 0;
    runs(g, colourOf(p), { [y]: [10 - wave + (opts.slim ? 1 : 0), inner] }, "hair", true);
  }
}

function fadeSides(g: Grid, p: PersonLook, from: number, to: number, amount: number) {
  for (let y = from; y <= to; y++) g.set(13, y, mix(p.hair, p.skin, amount), "hair"), g.set(34, y, mix(p.hair, p.skinShade, amount), "hair");
}

/** Hair drawn behind the head and body (long styles). */
const BACK: Partial<Record<HairStyle, (g: Grid, p: PersonLook) => void>> = {
  "long-framing": (g, p) => longBack(g, p),
  "long-wavy": (g, p) => longBack(g, p, 50),
  "long-behind": (g, p) => longBack(g, p, 51, 12),
  braids: (g, p) => longBack(g, p, 51, 12),
  locs: (g, p) => longBack(g, p, 51, 13),
  ponytail: (g, p) => runs(g, p.hairShade, { 22: [36, 38], 23: [36, 39], 24: [37, 39], 25: [37, 39], 26: [37, 39], 27: [37, 38], 28: [37, 38], 29: [37, 38], 30: [37, 38], 31: [38, 38] }, "hairBack"),
  hijab: (g, p) => {
    const f = p.fabric ?? "#3b6fd8";
    for (let y = 8; y <= 51; y++) {
      const hw = y < 12 ? 11 : y < 34 ? 13 : y < 40 ? 14 : 16;
      for (let x = 24 - hw; x <= 23 + hw; x++) g.set(x, y, f, "hairBack");
    }
  },
};

/** Hair and headwear in front. */
const FRONT: Record<HairStyle, (g: Grid, p: PersonLook) => void> = {
  // Paul: a black cap worn backwards, a little wavy hair under it at the back and sides.
  "cap-back": (g, p) => {
    const cap = p.fabric ?? "#18181b";
    const capShade = mix(cap, "#000000", 0.45);
    const capLight = mix(cap, "#ffffff", 0.15);
    runs(g, p.hair, { 15: [12, 14], 16: [12, 14], 17: [12, 13], 18: [11, 13], 19: [11, 12], 20: [11, 12], 21: [10, 12], 22: [10, 12], 23: [10, 11], 24: [11, 11] }, "hair", true);
    shadeHair(g, p);
    for (const [x, y] of [[12, 16], [11, 19], [10, 22], [35, 16], [36, 19], [37, 22]] as const) g.tint(x, y, p.hairLight, "hair");
    runs(g, cap, { 4: [22, 25], 5: [17, 30], 6: [15, 32], 7: [14, 33], 8: [13, 34], 9: [12, 35], 10: [12, 35], 11: [12, 35], 12: [12, 35], 13: [12, 35], 14: [12, 35] }, "cap");
    for (let y = 5; y <= 14; y++) for (let x = 12; x <= 35; x++) if (g.get(x, y) === "cap" && (x > 31 || g.get(x, y + 1) !== "cap")) g.c[y]![x] = capShade;
    for (let y = 5; y <= 10; y++) g.set(23, y, capShade, "cap");
    for (const [x, y] of [[16, 7], [15, 8], [14, 9], [14, 10], [18, 6], [19, 6]] as const) g.set(x, y, capLight, "cap");
    g.set(23, 4, capLight, "cap"), g.set(24, 4, capLight, "cap");
    runs(g, p.hair, { 11: [22, 25], 12: [21, 26], 13: [21, 26] }, "hair");
    for (const [x, y] of [[22, 11], [24, 12], [21, 13], [25, 13]] as const) g.set(x, y, p.hairLight, "hair");
    runs(g, cap, { 14: [19, 28] }, "cap");
    for (const x of [21, 23, 25]) g.set(x, 14, mix(cap, "#ffffff", 0.3), "cap");
  },
  // Neil: short, the front swept up, short faded sides.
  quiff: (g, p) => {
    runs(g, p.hair, { 0: [21, 26], 1: [18, 29], 2: [16, 31], 3: [15, 32], 4: [14, 33], 5: [13, 34], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
    runs(g, p.hair, { 13: [[13, 17], [30, 34]], 14: [[13, 15], [32, 34]], 15: [[13, 14], [33, 34]], 16: [[13, 14], [33, 34]] });
    fadeSides(g, p, 17, 19, 0.4);
    shadeHair(g, p);
    for (const [a, b, c, d] of [[17, 12, 21, 1], [21, 12, 24, 0], [25, 12, 27, 1], [15, 11, 18, 3]] as const) strand(g, p, a, b, c, d);
  },
  // Aaesha: very long and straight, strands framing her face.
  "long-framing": (g, p) => {
    crown(g, p);
    longSides(g, p, 34);
    shadeHair(g, p);
    for (let y = 9; y <= 24; y++) if (y % 6 !== 0) g.tint(12, y, p.hairLight, "hair");
  },
  // Caitlin: long with a soft wave (and her ends, when the look has them).
  "long-wavy": (g, p) => {
    crown(g, p);
    longSides(g, p, 37, { wave: true });
    shadeHair(g, p);
    for (let y = 9; y <= 22; y++) if (y % 5) g.tint(11, y, p.hairLight, "hair");
    if (p.ends) for (let y = p.ends.from; y <= 37; y++) g.tint(11, y, p.ends.light, "hair");
  },
  // Riya: long, straight, glossy, behind her shoulders.
  "long-behind": (g, p) => {
    crown(g, p);
    longSides(g, p, 38, { slim: true });
    shadeHair(g, p);
    for (let y = 8; y <= 30; y++) if (y % 7 !== 0) g.tint(12, y, p.hairLight, "hair");
  },
  // Yahya: tight curls on top, a few onto the forehead, faded sides.
  "curls-fringe": (g, p) => {
    FRONT["short-curly"](g, p);
    runs(g, p.hair, { 13: [[18, 29]], 14: [[18, 20], [23, 25], [27, 29]], 15: [[19, 19], [24, 24], [28, 28]] });
    shadeHair(g, p);
    curls(g, p, [[19, 14], [24, 14], [28, 14]]);
  },
  "short-straight": (g, p) => {
    runs(g, p.hair, { 4: [18, 29], 5: [15, 32], 6: [14, 33], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34], 13: [[13, 22], [27, 34]], 14: [[13, 19], [32, 34]], 15: [[13, 15], [33, 34]], 16: [[13, 14], [33, 34]] });
    fadeSides(g, p, 17, 19, 0.35);
    shadeHair(g, p);
    for (const [a, b, c, d] of [[16, 12, 22, 6], [20, 13, 26, 6]] as const) strand(g, p, a, b, c, d);
  },
  "short-curly": (g, p) => {
    runs(g, p.hair, { 2: [[15, 17], [19, 21], [23, 25], [27, 29], [31, 32]], 3: [14, 33], 4: [13, 34], 5: [13, 34], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
    runs(g, p.hair, { 13: [[13, 17], [30, 34]], 14: [[13, 15], [32, 34]] });
    fadeSides(g, p, 15, 19, 0.45);
    shadeHair(g, p);
    const pts: [number, number][] = [];
    for (let y = 4; y <= 12; y += 3) for (let x = 15 + (((y - 4) / 3) % 2) * 2; x <= 32; x += 4) pts.push([x, y]);
    curls(g, p, pts);
  },
  buzz: (g, p) => {
    const c = mix(p.hair, p.skin, 0.25);
    runs(g, c, { 6: [17, 30], 7: [15, 32], 8: [14, 33], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34], 13: [[13, 16], [31, 34]], 14: [[13, 14], [33, 34]], 15: [[13, 13], [34, 34]], 16: [[13, 13], [34, 34]] });
    for (let y = 6; y <= 12; y++) for (let x = 13; x <= 34; x++) if ((x + y) % 3 === 0) g.tint(x, y, mix(c, p.hair, 0.5), "hair");
  },
  // Wavy curtains from a middle parting, down to the jaw.
  "wavy-medium": (g, p) => {
    runs(g, p.hair, { 4: [16, 31], 5: [13, 34], 6: [12, 35], 7: [11, 36], 8: [11, 36], 9: [11, 36], 10: [11, 36], 11: [11, 36], 12: [11, 36] });
    runs(g, p.hair, { 13: [[11, 22], [25, 36]], 14: [[10, 20], [27, 37]], 15: [[10, 18], [29, 37]], 16: [[10, 16], [31, 37]], 17: [[10, 15], [32, 37]] });
    for (let y = 18; y <= 29; y++) runs(g, p.hair, { [y]: [y <= 27 ? (y % 4 < 2 ? 9 : 10) : 11, y <= 25 ? 13 : 12] }, "hair", true);
    shadeHair(g, p);
    for (const [a, b, c, d] of [[21, 6, 14, 14], [19, 6, 12, 17], [26, 6, 33, 14], [28, 6, 35, 17], [11, 20, 10, 27], [36, 20, 37, 27]] as const) strand(g, p, a, b, c, d);
  },
  // A curly mop, volume at the sides.
  "curly-medium": (g, p) => {
    runs(g, p.hair, { 3: [[17, 19], [22, 25], [28, 30]], 4: [14, 33], 5: [12, 35], 6: [11, 36], 7: [10, 37], 8: [10, 37], 9: [10, 37], 10: [10, 37], 11: [10, 37], 12: [10, 37], 13: [10, 37] });
    runs(g, p.hair, { 14: [[14, 18], [20, 25], [28, 33]], 15: [[15, 17], [21, 24], [29, 32]], 16: [[16, 16], [22, 23], [30, 31]] });
    for (let y = 14; y <= 28; y++) runs(g, p.hair, { [y]: [y <= 26 ? (y % 4 < 2 ? 9 : 10) : y === 27 ? 10 : 11, y <= 19 ? 14 : y <= 25 ? 13 : 12] }, "hair", true);
    shadeHair(g, p);
    curls(g, p, [[15, 5], [20, 5], [26, 5], [31, 6], [13, 8], [18, 8], [23, 8], [28, 8], [33, 9], [15, 11], [20, 11], [25, 11], [30, 11], [11, 15], [11, 19], [11, 23], [36, 15], [36, 19]]);
  },
  afro: (g, p) => {
    const rows: Rows = {};
    for (let y = 0; y <= 27; y++) {
      const dy = (y - 12) / 15;
      const hw = Math.round(17 * Math.sqrt(Math.max(0, 1 - dy * dy)));
      if (hw > 0) rows[y] = [24 - hw, 23 + hw];
    }
    const faceParts = new Set(["skin", "eye", "brow", "mouth", "glasses"]);
    for (const [y, run] of Object.entries(rows) as [string, Run][])
      for (let x = run[0]; x <= run[1]; x++) if (+y < 14 || !faceParts.has(g.get(x, +y) ?? "")) g.set(x, +y, p.hair, "hair");
    shadeHair(g, p);
    const pts: [number, number][] = [];
    for (let y = 2; y <= 24; y += 3) for (let x = 9 + (y % 2) * 2; x <= 38; x += 4) if (g.get(x, y) === "hair") pts.push([x, y]);
    curls(g, p, pts);
  },
  braids: (g, p) => {
    crown(g, p);
    for (let y = 13; y <= 40; y++) runs(g, p.hair, { [y]: [10, 13] }, "hair", true);
    shadeHair(g, p);
    for (let y = 13; y <= 40; y += 2) for (const x of [11, 12]) g.tint(x, y, p.hairLight, "hair"), g.tint(M(x), y, p.hairLight, "hair");
  },
  locs: (g, p) => {
    crown(g, p);
    for (let y = 13; y <= 42; y++) runs(g, p.hair, { [y]: [[9, 10], [12, 13]] }, "hair", true);
    shadeHair(g, p);
    for (let y = 2; y <= 42; y += 3) for (const x of [9, 12, 16, 20, 27, 31]) g.tint(x, y, p.hairLight, "hair"), g.tint(M(x), y, p.hairLight, "hair");
  },
  bun: (g, p) => {
    runs(g, p.hair, { 0: [20, 27], 1: [19, 28], 2: [19, 28], 3: [20, 27], 4: [17, 30], 5: [14, 33], 6: [13, 34], 7: [12, 35], 8: [12, 35], 9: [12, 35], 10: [12, 35], 11: [12, 35], 12: [12, 35], 13: [[12, 16], [31, 35]], 14: [[12, 14], [33, 35]], 15: [[12, 13], [34, 35]], 16: [[12, 13], [34, 35]], 17: [[12, 13], [34, 35]] });
    shadeHair(g, p);
    for (const [x, y] of [[21, 1], [22, 0], [20, 2]] as const) g.tint(x, y, p.hairLight, "hair");
    strand(g, p, 15, 12, 22, 5), strand(g, p, 32, 12, 26, 5);
  },
  ponytail: (g, p) => {
    runs(g, p.hair, { 4: [17, 30], 5: [14, 33], 6: [13, 34], 7: [12, 35], 8: [12, 35], 9: [12, 35], 10: [12, 35], 11: [12, 35], 12: [12, 35], 13: [[12, 16], [31, 35]], 14: [[12, 14], [33, 35]], 15: [[12, 13], [34, 36]], 16: [[12, 13], [34, 36]], 17: [[12, 13], [35, 36]], 18: [[12, 12], [35, 36]] });
    shadeHair(g, p);
    strand(g, p, 15, 12, 30, 6), strand(g, p, 18, 13, 32, 8);
  },
  bob: (g, p) => {
    crown(g, p);
    for (let y = 13; y <= 30; y++) runs(g, p.hair, { [y]: [10, y < 20 ? 14 : 13] }, "hair", true);
    runs(g, p.hair, { 13: [15, 32], 14: [15, 32], 15: [15, 32], 16: [[15, 21], [26, 32]] });
    shadeHair(g, p);
    for (let y = 9; y <= 28; y++) if (y % 5) g.tint(11, y, p.hairLight, "hair");
  },
  shaved: (g, p) => {
    const c = mix(p.hair, p.skin, 0.5);
    runs(g, c, { 7: [16, 31], 8: [14, 33], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34], 13: [[13, 15], [32, 34]], 14: [[13, 14], [33, 34]] });
  },
  hijab: (g, p) => {
    const f = p.fabric ?? "#3b6fd8";
    const shade = mix(f, "#000000", 0.25);
    const light = mix(f, "#ffffff", 0.2);
    // Framing the face from the forehead to under the chin, over the shoulders.
    runs(g, f, { 6: [16, 31], 7: [14, 33], 8: [13, 34], 9: [12, 35], 10: [11, 36], 11: [11, 36], 12: [11, 36], 13: [11, 36] }, "cap");
    for (let y = 14; y <= 30; y++) runs(g, f, { [y]: [10, y < 20 ? 14 : 13] }, "cap", true);
    runs(g, f, { 31: [[10, 17], [30, 37]], 32: [[10, 19], [28, 37]], 33: [[10, 37]], 34: [9, 38], 35: [9, 38], 36: [8, 39], 37: [8, 39] }, "cap");
    for (let y = 6; y <= 37; y++) for (let x = 8; x <= 39; x++) if (g.get(x, y) === "cap" && (x > 32 || g.get(x, y + 1) !== "cap")) g.c[y]![x] = shade;
    for (let y = 8; y <= 30; y += 2) g.tint(11, y, light, "cap");
    for (let x = 15; x <= 32; x++) g.tint(x, 13, shade, "cap");
  },
  turban: (g, p) => {
    const f = p.fabric ?? "#e86fa8";
    const shade = mix(f, "#000000", 0.25);
    const light = mix(f, "#ffffff", 0.22);
    runs(g, f, { 1: [18, 29], 2: [15, 32], 3: [13, 34], 4: [12, 35], 5: [11, 36], 6: [11, 36], 7: [11, 36], 8: [11, 36], 9: [11, 36], 10: [11, 36], 11: [11, 36], 12: [12, 35], 13: [13, 34], 14: [14, 33] }, "cap");
    // The folds.
    for (const [a, b, c, d] of [[12, 12, 23, 2], [16, 13, 27, 3], [21, 14, 33, 6], [26, 14, 35, 9]] as const) {
      const n = Math.max(Math.abs(c - a), Math.abs(d - b));
      for (let i = 0; i <= n; i++) g.tint(Math.round(a + ((c - a) * i) / n), Math.round(b + ((d - b) * i) / n), i % 2 ? shade : light, "cap");
    }
    runs(g, p.hair, { 15: [[13, 13], [34, 34]], 16: [[13, 13], [34, 34]] });
    if (p.stubble || p.moustache) runs(g, p.hair, { 26: [[14, 15], [32, 33]], 27: [[14, 16], [31, 33]] });
  },
  beanie: (g, p) => {
    const f = p.fabric ?? "#1fb5a8";
    const shade = mix(f, "#000000", 0.28);
    runs(g, p.hair, { 14: [[12, 14], [33, 35]], 15: [[12, 14], [33, 35]], 16: [[12, 13], [34, 35]], 17: [[12, 13], [34, 35]], 18: [[12, 13], [34, 35]] });
    runs(g, f, { 2: [19, 28], 3: [16, 31], 4: [14, 33], 5: [13, 34], 6: [12, 35], 7: [12, 35], 8: [12, 35], 9: [12, 35], 10: [11, 36], 11: [11, 36], 12: [11, 36], 13: [11, 36], 14: [11, 36] }, "cap");
    for (let x = 11; x <= 36; x++) g.tint(x, 12, shade, "cap");
    for (let y = 3; y <= 11; y++) for (let x = 13; x <= 34; x += 3) g.tint(x, y, shade, "cap");
    g.set(23, 1, f, "cap"), g.set(24, 1, f, "cap"), g.set(23, 0, mix(f, "#ffffff", 0.3), "cap"), g.set(24, 0, mix(f, "#ffffff", 0.3), "cap");
  },
};

function accessory(g: Grid, p: PersonLook) {
  const a = p.accessory ?? "none";
  if (a === "headphones") {
    const c = "#24262c";
    const pad = p.fabric ?? "#3b6fd8";
    for (const [x, y] of [[13, 6], [14, 5], [15, 4], [16, 3], [17, 3], [18, 2], [19, 2], [20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 2], [29, 3], [30, 3], [31, 4], [32, 5], [33, 6], [12, 7], [35, 7], [11, 9], [36, 9], [11, 11], [36, 11]] as const) g.set(x, y, c, "accessory");
    for (let y = 18; y <= 25; y++) for (const x of [10, 11, 12, 13]) g.set(x, y, y === 18 || y === 25 ? c : pad, "accessory"), g.set(M(x), y, y === 18 || y === 25 ? c : mix(pad, "#000000", 0.2), "accessory");
    for (let y = 12; y <= 17; y++) g.set(11, y, c, "accessory"), g.set(36, y, c, "accessory");
  } else if (a === "cap") {
    // A cap worn forwards: the crown over the hair, and the brim over the eyes' line.
    const f = p.fabric ?? "#3b6fd8";
    const shade = mix(f, "#000000", 0.3);
    runs(g, f, { 4: [19, 28], 5: [16, 31], 6: [14, 33], 7: [13, 34], 8: [12, 35], 9: [12, 35], 10: [12, 35], 11: [12, 35], 12: [12, 35], 13: [12, 35], 14: [12, 35] }, "cap");
    runs(g, shade, { 15: [11, 36], 16: [13, 34] }, "cap");
    g.set(23, 3, shade, "cap"), g.set(24, 3, shade, "cap");
  } else if (a === "scarf") {
    const f = p.fabric ?? "#ff7a6b";
    const shade = mix(f, "#000000", 0.25);
    runs(g, f, { 35: [17, 30], 36: [16, 31], 37: [15, 32], 38: [15, 32], 39: [16, 31] }, "accessory");
    runs(g, f, { 40: [26, 30], 41: [26, 30], 42: [26, 30], 43: [27, 30], 44: [27, 30], 45: [27, 30], 46: [27, 30] }, "accessory");
    for (let x = 16; x <= 31; x += 3) g.tint(x, 37, shade, "accessory");
    for (let y = 41; y <= 46; y += 2) g.tint(28, y, shade, "accessory");
  }
}

// ---------------------------------------------------------------- arms

type Pt = [number, number];

/** One segment of sleeve, three pixels thick, shaded on the side away from the light. */
function limb(g: Grid, sleeve: string, [x0, y0]: Pt, [x1, y1]: Pt) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const steep = Math.abs(y1 - y0) >= Math.abs(x1 - x0);
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let d = -1; d <= 1; d++) {
      const [px, py] = steep ? [x + d, y] : [x, y + d];
      g.set(px, py, d === 1 ? mix(sleeve, "#000000", 0.16) : d === -1 ? mix(sleeve, "#ffffff", 0.1) : sleeve, "arm");
    }
  }
}

type HandKind = "open" | "fist" | "thumb" | "point";

/**
 * A hand at the wrist (hx, hy), drawn from a small pattern: S skin, s shade, k knuckle line.
 * Hands are about a fifth of the head's width, like a real hand to a face at this scale.
 */
const HANDS: Record<HandKind, string[]> = {
  // Fingers up, palm out, thumb to the side.
  open: [
    "S.S.S.",
    "SSSSS.",
    "SSSSsS",
    "SSSSsS",
    "SSSSs.",
    ".SSs..",
  ],
  fist: [
    ".SSSs",
    "SkkkS",
    "SSSSs",
    "SSSSs",
    ".SSs.",
  ],
  thumb: [
    ".S...",
    ".S...",
    "SSSSs",
    "SkkkS",
    "SSSSs",
    ".SSs.",
  ],
  point: [
    ".SSSs....",
    "SSSSSSSSs",
    "SkkkS....",
    "SSSSs....",
    ".SSs.....",
  ],
};

function hand(g: Grid, p: PersonLook, kind: HandKind, [hx, hy]: Pt, flip = false) {
  const rows = HANDS[kind];
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
function arm(g: Grid, p: PersonLook, shoulder: Pt, elbow: Pt, wrist: Pt, kind: HandKind, flip = false) {
  const sleeve = sleeveOf(p);
  limb(g, sleeve, shoulder, elbow);
  limb(g, sleeve, elbow, wrist);
  // A darker cuff where the sleeve ends.
  for (let d = -1; d <= 1; d++) g.set(wrist[0] + d, wrist[1], mix(sleeve, "#000000", 0.22), "arm");
  hand(g, p, kind, [wrist[0], wrist[1] - 1], flip);
}

function pose(g: Grid, p: PersonLook, pose: Pose, beat: number) {
  const hw = torsoOf(p)[44]!;
  const R = 23 + hw - 1; // the right shoulder's outer column (the character's left)
  const L = 24 - hw + 1;
  const b4 = beat % 4;
  if (pose === "wave") {
    const sway = [0, 1, 2, 1, 0, -1][beat % 6]!;
    arm(g, p, [R - 1, 43], [R + 3, 37], [R + 3 + sway, 31], "open");
  } else if (pose === "cheer") {
    const lift = beat % 2;
    arm(g, p, [L + 1, 43], [L - 3, 37], [L - 2, 30 - lift], "fist", true);
    arm(g, p, [R - 1, 43], [R + 3, 37], [R + 2, 30 - lift], "fist");
  } else if (pose === "think") {
    const tap = beat % 2;
    arm(g, p, [R - 1, 43], [R + 2, 50], [28, 37 - tap], "fist", true);
  } else if (pose === "point") {
    const thrust = beat % 2;
    arm(g, p, [R - 1, 43], [R + 2, 41], [R + 5 + thrust, 40], "point");
  } else if (pose === "thumbs") {
    const bob = beat % 2;
    arm(g, p, [R - 1, 43], [R + 2, 49], [R + 2, 41 - bob], "thumb", true);
  }
}

// ---------------------------------------------------------------- outline and drawing

function outline(g: Grid) {
  const filled = (x: number, y: number) => g.get(x, y) !== null;
  const add: [number, number][] = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (!filled(x, y) && ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).some(([dx, dy]) => filled(x + dx, y + dy))) add.push([x, y]);
  for (const [x, y] of add) g.set(x, y, OUTLINE, "outline");
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = g.get(x, y);
      if (r === "skin" || r === "ear") {
        const n = [g.get(x - 1, y), g.get(x + 1, y), g.get(x, y - 1)];
        if (n.some((v) => v === "hair" || v === "hairBack" || v === "outline" || v === "cap")) g.c[y]![x] = mix(g.c[y]![x]!, "#3a2016", 0.35);
      }
      // Arms read against the body.
      if (r === "arm" || r === "hand") {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const n = g.get(x + dx, y + dy);
          if (n === "body" || n === "skin" || n === "neck" || n === "hair") g.c[y + dy]![x + dx] = OUTLINE;
        }
      }
    }
}

/** Draw a person at a moment. Cached by the caller. */
export function drawPerson(look: PersonLook, m: Moment = {}): Grid {
  const g = new Grid();
  const expression = m.expression ?? "neutral";
  BACK[look.hairStyle]?.(g, look);
  body(g, look, ARMS[m.pose ?? "idle"]);
  head(g, look);
  face(g, look, expression, Boolean(m.blink), m.open === true ? 2 : m.open ? m.open : 0);
  FRONT[look.hairStyle](g, look);
  if (look.glasses) glasses(g, look.glasses, look.glassesColour ?? "#121214");
  accessory(g, look);
  pose(g, look, m.pose ?? "idle", m.beat ?? 0);
  outline(g);
  return g;
}

/** RGBA pixels for a grid, for a canvas's ImageData or a PNG encoder. */
export function toRGBA(g: Grid): Uint8ClampedArray {
  const out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const c = g.c[y]![x];
      if (!c) continue;
      const [r, gg, b] = hex(c);
      const i = (y * W + x) * 4;
      out[i] = r;
      out[i + 1] = gg;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  return out;
}
