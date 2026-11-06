// Pixel people (REDESIGN3_PLAN.md P1): every person in the course, the cast and each learner's
// avatar, drawn on one 48x52 grid in the style of the cast reference (art/pixel-reference/).
// A person is a look (face, skin, hair, brows, glasses, clothes) plus a moment: an expression,
// a pose with arms, a blink, a mouth open mid-word, a hand mid-wave. The same code draws in the
// browser (components/art/PixelPerson.tsx) and in Node (scripts/draw-cast-pixels.ts).

import { Grid, H, M, mix, OUTLINE, torsoOf, sleeveOf, topColour, W, hex } from "./kit";
import { gestureOf } from "./gestures";

export { Grid, H, W, mix };

export type Expression =
  | "neutral"
  | "talking"
  | "pleased"
  | "proud"
  | "thinking"
  | "confused"
  | "worried"
  | "surprised"
  | "laughing"
  | "unimpressed"
  // Redesign 3, more feelings so nobody wears the same face all day.
  | "excited"
  | "determined"
  | "focused"
  | "curious"
  | "smug"
  | "mischievous"
  | "embarrassed"
  | "nervous"
  | "sad"
  | "relieved"
  | "sleepy"
  | "annoyed";
export const EXPRESSIONS: Expression[] = [
  "neutral",
  "talking",
  "pleased",
  "proud",
  "thinking",
  "confused",
  "worried",
  "surprised",
  "laughing",
  "unimpressed",
  "excited",
  "determined",
  "focused",
  "curious",
  "smug",
  "mischievous",
  "embarrassed",
  "nervous",
  "sad",
  "relieved",
  "sleepy",
  "annoyed",
];
/** A gesture's id (lib/pixel/gestures): "idle", "wave", "sip", "glasses-push"... */
export type Pose = string;
/** The first six gestures, which every page and script can rely on. */
export const POSES: Pose[] = ["idle", "wave", "cheer", "think", "point", "thumbs"];
/** Where the eyes look, when not at you: "left" and "right" are the viewer's (the screen's). */
export type Gaze = "left" | "right" | "up" | "down";

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
  /** Below the waist, for the full-body figures (lib/pixel/figures.ts). */
  legs?: { trousers: string; shoes: string; kind?: "trousers" | "jeans" | "shorts" | "skirt" };
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
  /** Where they're looking, when not at you. */
  gaze?: Gaze;
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

/** Which arms hang at the sides: a gesture lifts one or both away. */
type Arms = { left: boolean; right: boolean };

function body(g: Grid, p: PersonLook, arms: Arms) {
  for (let y = 32; y <= 38; y++) g.row(y, 3, y < 35 ? p.skinShade : p.skin, "neck");
  const torso = torsoOf(p);
  const base = topColour(p);
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

const LASH = "#1d1514";
const WHITE = "#f4efe9";
const PUPIL = "#100c0b";

type EyeMode =
  | "open"
  | "closed"
  | "happy"
  | "wide"
  | "half"
  | "up"
  // Redesign 3
  | "sparkle" // excited: wide, big dark irises with a glint
  | "squint" // focused: the lower lids raised
  | "peer" // curious: one eye opened wider, under the raised brow
  | "lidded" // smug: lids lowered, a flick at the corner
  | "sly" // mischievous: narrowed, glancing to the side
  | "tiny" // nervous: wide, small irises in a lot of white
  | "droop" // sad: the lids drooping at the outer corners
  | "soft" // relieved: closed, curving down
  | "sleepy" // sleepy: heavy lids nearly shut
  | "glare"; // annoyed: the lids slanting down to the nose

type IrisKind = "normal" | "sparkle" | "small" | "dim";

/**
 * An eye, as a pattern of the left eye from just past its outer corner inwards (the right eye is
 * its mirror): K lash, W white, b the lower edge (only the iris shows there, or white under an
 * iris that looks up), h a heavy lid, l a lower lid, u a shadow under the eye. `iris` is the
 * iris's top row and height, in the middle of the eye; a gaze moves it a pixel that way, as far
 * as the eye is open. `over` is drawn after the iris (a lid that covers part of it).
 */
interface EyeArt {
  y: number;
  rows: string[];
  over?: { y: number; rows: string[] };
  iris?: { y: number; h: number; kind?: IrisKind; dx?: number };
}

const EYE_ART: Record<Exclude<EyeMode, "up" | "peer">, EyeArt> = {
  open: { y: 21, rows: [".KKKK", ".WWWW", ".bbbb"], iris: { y: 22, h: 2 } },
  wide: { y: 20, rows: [".KKKK", ".WWWW", ".WWWW", ".bbbb"], iris: { y: 22, h: 2 } },
  half: { y: 21, rows: [".KKKK", ".WWWW", ".bbbb"], over: { y: 22, rows: [".hhhh"] }, iris: { y: 22, h: 2 } },
  closed: { y: 22, rows: [".KKKK"] },
  happy: { y: 21, rows: ["..KK.", ".K..K"] },
  sparkle: { y: 20, rows: ["..KK.", ".KWWK", ".WWWW", ".bbbb"], iris: { y: 21, h: 3, kind: "sparkle" } },
  squint: { y: 21, rows: [".KKKK", ".WWWW", ".llll"], iris: { y: 22, h: 1 } },
  lidded: { y: 20, rows: ["K....", ".KKKK", ".WWWW", ".bbbb"], over: { y: 22, rows: [".hhhh"] }, iris: { y: 22, h: 2 } },
  sly: { y: 22, rows: [".KKKK", ".WWWW"], iris: { y: 23, h: 1, dx: 1 } },
  tiny: { y: 20, rows: [".KKKK", ".WWWW", ".WWWW", ".bbbb"], iris: { y: 22, h: 1, kind: "small" } },
  droop: { y: 21, rows: ["..KKK", ".KWWW", ".bbbb"], iris: { y: 22, h: 2 } },
  soft: { y: 22, rows: [".K..K", "..KK."] },
  sleepy: { y: 21, rows: [".hhhh", ".hKKK", ".Kbb.", "..uu."], iris: { y: 23, h: 1, kind: "dim" } },
  glare: { y: 21, rows: [".KKhh", ".WWKK", ".bbbb"], iris: { y: 22, h: 2 } },
};

function eyes(g: Grid, p: PersonLook, mode: EyeMode, gaze?: Gaze) {
  const hi = mix(p.iris, "#ffffff", 0.35);
  const dark = mix(p.iris, "#000000", 0.25);
  const lid = mix(p.skin, "#000000", 0.12);
  const lower = mix(p.skin, p.skinShade, 0.7);
  const gx = gaze === "left" ? -1 : gaze === "right" ? 1 : 0;
  const gy = gaze === "up" ? -1 : gaze === "down" ? 1 : 0;
  // Thinking's own look to the side, as approved, when nothing else is asked.
  const legacyUp = mode === "up" && !gaze;
  for (const side of [0, 1] as const) {
    const art = EYE_ART[mode === "up" ? "open" : mode === "peer" ? (side ? "wide" : "open") : mode];
    const xOf = (i: number) => (side ? 31 - i : 16 + i);
    const cell = (x: number, y: number) => art.rows[y - art.y]?.[side ? 31 - x : x - 16] ?? ".";
    const S = (x: number, y: number, c: string) => g.set(x, y, c, "eye");
    const paint = (rows: string[], y0: number, open: boolean) =>
      rows.forEach((row, r) =>
        [...row].forEach((ch, i) => {
          const x = xOf(i);
          const y = y0 + r;
          if (open && ch === "W") S(x, y, WHITE);
          else if (open && ch === "b") S(x, y, p.skin);
          else if (!open && ch === "K") S(x, y, LASH);
          else if (!open && ch === "h") S(x, y, lid);
          else if (!open && ch === "l") S(x, y, p.skinShade);
          else if (!open && ch === "u") S(x, y, lower);
        }),
      );
    paint(art.rows, art.y, true);
    if (art.iris) {
      const kind = art.iris.kind ?? "normal";
      const pal: string[][] =
        kind === "sparkle"
          ? [["#ffffff", dark], [dark, PUPIL], [p.iris, mix(p.iris, "#ffffff", 0.5)]]
          : kind === "small"
            ? [side ? [PUPIL, dark] : [dark, PUPIL]]
            : kind === "dim"
              ? [[dark, dark]]
              : legacyUp && side
                ? [[p.iris, hi], [dark, p.iris]]
                : side
                  ? [[hi, p.iris], [p.iris, dark]]
                  : [[hi, PUPIL], [dark, p.iris]];
      const isOpen = (x: number, y: number) => "Wb".includes(cell(x, y));
      const rowsOpen = art.rows.flatMap((row, r) => (/[Wb]/.test(row) ? [art.y + r] : []));
      const first = Math.min(...rowsOpen);
      const last = Math.max(...rowsOpen);
      const bx = (side ? 28 : 18) + (legacyUp ? (side ? 0 : -1) : gaze ? gx : (art.iris.dx ?? 0));
      let top = art.iris.y + gy;
      let h = art.iris.h;
      if (top < first) (h -= first - top), (top = first);
      h = Math.max(1, Math.min(h, last - top + 1));
      top = Math.min(top, last - h + 1);
      // An iris squeezed to one row by looking up or down keeps its pupil, in both eyes.
      if (h < art.iris.h && kind === "normal") pal[0] = [hi, PUPIL];
      for (let r = 0; r < h; r++) for (const k of [0, 1]) if (isOpen(bx + k, top + r)) S(bx + k, top + r, pal[r]![k]!);
      // White under an iris that has moved up, on the eye's lower edge.
      for (let y = top + h; y <= last; y++) for (const k of [0, 1]) if (cell(bx + k, y) === "b") S(bx + k, y, WHITE);
    }
    paint(art.rows, art.y, false);
    if (art.over) paint(art.over.rows, art.over.y, false);
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

type BrowMode =
  | "rest"
  | "up"
  | "worried"
  | "cross"
  | "one-up"
  | "low"
  // Redesign 3
  | "fierce" // determined: a steep V
  | "knit" // focused: lowered at the nose and drawn together
  | "scowl" // annoyed: lowered, the inner ends lowest
  | "high" // curious: both raised, one higher
  | "droop" // sad: inner ends up, outer ends down
  | "anxious"; // nervous: raised, the inner ends highest

function brows(g: Grid, p: PersonLook, mode: BrowMode) {
  const shape = BROWS[p.browShape];
  for (const side of [0, 1]) {
    for (const [x, y] of shape) {
      const inner = x >= 20; // the end nearest the nose
      const outer = x <= 17;
      let dy = 0;
      if (mode === "up") dy = -1;
      else if (mode === "worried") dy = inner ? -1 : 0;
      else if (mode === "cross" || mode === "knit") dy = inner ? 1 : 0;
      else if (mode === "one-up") dy = side === 1 ? -1 : 0;
      else if (mode === "low") dy = 1;
      else if (mode === "fierce") dy = inner ? 1 : outer ? -1 : 0;
      else if (mode === "scowl") dy = inner ? 2 : 1;
      else if (mode === "high") dy = side === 1 ? -2 : -1;
      else if (mode === "droop") dy = inner ? -1 : outer ? 1 : 0;
      else if (mode === "anxious") dy = inner ? -2 : -1;
      g.set(side ? M(x) : x, y + dy, p.brow, "brow");
    }
  }
  // Drawn together: the inner ends reach a pixel further towards the nose.
  if (mode === "knit" || mode === "scowl") {
    const ix = Math.max(...shape.map(([x]) => x));
    const iy = Math.max(...shape.filter(([x]) => x === ix).map(([, y]) => y)) + (mode === "scowl" ? 2 : 1);
    // Never so far that the two meet (bold brows already reach x 22).
    if (ix < 22) g.set(ix + 1, iy, p.brow, "brow"), g.set(M(ix + 1), iy, p.brow, "brow");
  }
}

function nose(g: Grid, p: PersonLook) {
  g.set(24, 24, p.skinShade, "skin");
  g.set(24, 25, p.skinShade, "skin");
  g.set(23, 26, mix(p.skinShade, "#000000", 0.08), "skin");
  g.set(24, 26, mix(p.skinShade, "#000000", 0.12), "skin");
}

type MouthMode =
  | RestingMouth
  | "open"
  | "ajar"
  | "o"
  | "laugh"
  | "frown"
  | "wavy"
  | "side"
  // Redesign 3
  | "beam" // excited: open, a strip of teeth
  | "set" // determined: pressed firm
  | "pursed" // focused: small and drawn in
  | "ooh" // curious: a small round "oh?"
  | "sly" // mischievous: a lopsided smile, one corner high
  | "bashful" // embarrassed: a small shy smile
  | "wobble" // nervous: unsteady
  | "pout" // sad: turned down, the lower lip out
  | "slack" // sleepy: loose, a little open
  | "grumble"; // annoyed: pulled down to one side

/**
 * Mouths: small, soft and set just under the nose, in the person's own skin and lip tones, so they
 * belong to the face. Each is drawn at rest, a little open (e, i, u) and wide open (a, o), so a
 * face keeps its feeling mid-word: L line, s soft lip, i inside, T teeth (only on a grin or a
 * laugh). Patterns start at x 20 and row 27 (or `MOUTH_TOP`).
 */
const OPEN = ["........", "..LLLL..", "..LiiL..", "...LL..."];
const AJAR = ["........", "..LiiL..", "...ss..."];
const MOUTHS: Record<MouthMode, [string[], string[], string[]]> = {
  smile: [
    [".L....L.", "..LLLL..", "...ss..."],
    [".L....L.", "..LiiL..", "...ss..."],
    [".L....L.", "..LLLL..", "..LiiL..", "...LL..."],
  ],
  half: [
    ["......L.", "..LLLL..", "...ss..."],
    ["......L.", "..LiiL..", "...ss..."],
    ["......L.", "..LLLL..", "..LiiL..", "...LL..."],
  ],
  smirk: [
    ["......Ls", "..LLLL.."],
    ["......Ls", "..LiiL..", "...ss..."],
    ["......Ls", "..LLLL..", "..LiiL..", "...LL..."],
  ],
  flat: [
    ["........", "..LLLL.."],
    ["........", "..LiiL.."],
    ["........", "..LLLL..", "..LiiL..", "..LLLL.."],
  ],
  grin: [
    ["L......L", ".LTTTTL.", "..LLLL.."],
    ["L......L", ".LTTTTL.", "..LiiL..", "...LL..."],
    ["L......L", ".LTTTTL.", ".LiiiiL.", "..LLLL.."],
  ],
  laugh: [
    ["L......L", ".LTTTTL.", ".LiiiiL.", "..LLLL.."],
    ["L......L", ".LTTTTL.", "..LLLL.."],
    ["L......L", ".LTTTTL.", ".LiiiiL.", "..LLLL.."],
  ],
  // A plain mouth mid-word, for a face with no feeling of its own (neutral, talking).
  open: [OPEN, AJAR, OPEN],
  ajar: [AJAR, AJAR, OPEN],
  o: [
    ["........", "...LL...", "..LiiL..", "...LL..."],
    ["........", "...LL...", "..LiiL..", "..LiiL..", "...LL..."],
    ["........", "..LLLL..", ".LiiiiL.", "..LLLL.."],
  ],
  frown: [
    ["........", "..LLLL..", ".L....L."],
    ["........", "..LiiL..", ".L....L."],
    ["........", "..LLLL..", ".LLiiLL.", "...LL..."],
  ],
  wavy: [
    ["........", ".L.LL.L.", "..L..L.."],
    ["........", ".L.LL.L.", "..LiiL.."],
    ["........", ".L.LL.L.", "..LiiL..", "...LL..."],
  ],
  side: [
    [".......L", "....LLL."],
    [".......L", "...LiiL.", "....ss.."],
    [".......L", "...LLLL.", "...LiiL.", "....LL.."],
  ],
  beam: [
    [".L....L.", "..TTTT..", "..LiiL..", "...LL..."],
    [".L....L.", "..TTTT..", "..LLLL.."],
    ["L......L", ".LTTTTL.", ".LiiiiL.", "..LLLL.."],
  ],
  set: [
    ["........", ".LLLLLL.", "...ss..."],
    ["........", ".LLiiLL.", "...ss..."],
    ["........", ".LLLLLL.", "..LiiL..", "...LL..."],
  ],
  pursed: [
    ["........", "...LL...", "...ss..."],
    ["........", "...ii...", "...ss..."],
    ["........", "...LL...", "..LiiL..", "...LL..."],
  ],
  ooh: [
    ["........", "...LL...", "...ii..."],
    ["........", "...LL...", "..LiiL..", "...LL..."],
    ["........", "...LL...", "..LiiL..", "..LiiL..", "...LL..."],
  ],
  sly: [
    [".......L", ".L....L.", "..LLLL..", "...ss..."],
    [".......L", ".L....L.", "..LiiL..", "...ss..."],
    [".......L", ".L....L.", "..LLLL..", "..LiiL..", "...LL..."],
  ],
  bashful: [
    ["........", "..L..L..", "...LL..."],
    ["........", "..LiiL..", "...LL..."],
    ["........", "..LLLL..", "..LiiL..", "...LL..."],
  ],
  wobble: [
    ["........", ".LL..LL.", "...LL..."],
    ["........", ".LLiiLL.", "...LL..."],
    ["........", ".LLLLLL.", ".LiiiiL.", "..L..L.."],
  ],
  pout: [
    ["........", "...LL...", "..L..L..", "...ss..."],
    ["........", "...LL...", "..LiiL..", "...ss..."],
    ["........", "..LLLL..", ".LLiiLL.", "...ss..."],
  ],
  slack: [
    ["........", "..LLL...", ".....s.."],
    ["........", "..LiL...", "...ss..."],
    ["........", "..LLL...", "..LiiL..", "...LL..."],
  ],
  grumble: [
    ["........", "...LLL..", "..L...L."],
    ["........", "...LiL..", "..L...L."],
    ["........", "...LLL..", "..LiiLL.", "...LL..."],
  ],
};
const MOUTH_TOP: Partial<Record<MouthMode, number>> = { sly: 26 };

function mouth(g: Grid, p: PersonLook, m: MouthMode, open: 0 | 1 | 2) {
  const colours: Record<string, string> = {
    L: mix(mix(p.skinShade, p.lip, 0.55), "#000000", 0.18),
    s: mix(p.skinShade, p.lip, 0.35),
    i: mix(p.lip, "#2a0f0f", 0.55),
    T: mix("#f4efe8", p.skin, 0.15),
  };
  const top = MOUTH_TOP[m] ?? 27;
  MOUTHS[m][open].forEach((row, r) => [...row].forEach((ch, i) => colours[ch] && g.set(20 + i, top + r, colours[ch]!, "mouth")));
}

type FaceEffect = "blush" | "sweat" | "tear";

interface Face {
  eyes: EyeMode;
  brows: BrowMode;
  mouth: MouthMode | "rest";
  /** Where they look when nothing else is asked. */
  gaze?: Gaze;
  fx?: FaceEffect[];
}

function faceOf(p: PersonLook, expression: Expression): Face {
  const E: Record<Expression, Face> = {
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
    excited: { eyes: "sparkle", brows: "up", mouth: "beam" },
    determined: { eyes: "open", brows: "fierce", mouth: "set" },
    focused: { eyes: "squint", brows: "knit", mouth: "pursed" },
    curious: { eyes: "peer", brows: "high", mouth: "ooh" },
    smug: { eyes: "lidded", brows: "one-up", mouth: "smirk" },
    mischievous: { eyes: "sly", brows: "cross", mouth: "sly" },
    embarrassed: { eyes: "open", brows: "worried", mouth: "bashful", gaze: "down", fx: ["blush"] },
    nervous: { eyes: "tiny", brows: "anxious", mouth: "wobble", fx: ["sweat"] },
    sad: { eyes: "droop", brows: "droop", mouth: "pout", fx: ["tear"] },
    relieved: { eyes: "soft", brows: "worried", mouth: "smile" },
    sleepy: { eyes: "sleepy", brows: "up", mouth: "slack" },
    annoyed: { eyes: "glare", brows: "scowl", mouth: "grumble" },
  };
  return E[expression];
}

const CLOSED_ALREADY: EyeMode[] = ["happy", "soft", "closed"];

function face(g: Grid, p: PersonLook, expression: Expression, blink: boolean, open: 0 | 1 | 2, gaze?: Gaze) {
  const e = faceOf(p, expression);
  eyes(g, p, blink && !CLOSED_ALREADY.includes(e.eyes) ? "closed" : e.eyes, gaze ?? e.gaze);
  brows(g, p, e.brows);
  nose(g, p);
  // At rest a neutral face wears the person's own mouth, and talks with a plain one.
  const m: MouthMode = e.mouth === "rest" ? (open === 2 ? "open" : open === 1 ? "ajar" : p.mouth) : e.mouth;
  mouth(g, p, m, e.mouth === "rest" ? 0 : open);
  if (p.blush) for (const [x, y] of [[17, 26], [18, 26], [29, 26], [30, 26]] as const) g.set(x, y, p.blush, "skin");
  if (e.fx?.includes("blush")) blush(g, p);
  if (e.fx?.includes("tear")) tear(g);
  if (p.stubble) stubble(g, p);
  if (p.moustache) for (let x = 22; x <= 25; x++) g.set(x, 27, mix(p.hair, p.skin, 0.35), "skin");
}

/** Cheeks gone pink, in a tone that shows on every skin. */
function blush(g: Grid, p: PersonLook) {
  const deep = mix(p.blush ?? mix(p.skin, "#e0485a", 0.45), "#d23c4c", 0.2);
  const soft = mix(p.skin, deep, 0.55);
  for (const [x, y, c] of [[17, 25, soft], [18, 25, deep], [19, 25, soft], [16, 26, soft], [17, 26, deep], [18, 26, deep], [19, 26, soft]] as const) {
    g.set(x, y, c, "skin");
    g.set(M(x), y, c, "skin");
  }
}

const TEAR = "#8fc8ee";

/** One small tear on the cheek, under the eye. */
function tear(g: Grid) {
  g.set(31, 24, mix(TEAR, "#ffffff", 0.5), "eye");
  g.set(31, 25, TEAR, "eye");
  g.set(31, 26, mix(TEAR, "#3d7fb8", 0.3), "eye");
}

/** Effects drawn over the hair: a single drop of sweat at the temple. */
function faceOver(g: Grid, p: PersonLook, expression: Expression) {
  if (!faceOf(p, expression).fx?.includes("sweat")) return;
  const drop: [number, number, string][] = [
    [1, 0, mix(TEAR, "#ffffff", 0.3)],
    [0, 1, TEAR],
    [1, 1, "#ffffff"],
    [0, 2, mix(TEAR, "#3d7fb8", 0.35)],
    [1, 2, TEAR],
  ];
  // At the temple, or where hair or glasses cover it, lower down the side of the face.
  for (const [x0, y0] of [[31, 15], [30, 15], [31, 16], [30, 16], [29, 16], [31, 22], [30, 23], [31, 23], [30, 25], [29, 25]] as const) {
    if (!drop.every(([dx, dy]) => g.get(x0 + dx, y0 + dy) === "skin")) continue;
    for (const [dx, dy, c] of drop) g.set(x0 + dx, y0 + dy, c, "fx");
    return;
  }
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

// ---------------------------------------------------------------- outline and drawing

/** The dark edge round everything solid. Effects (region "fx": steam, sparkles, smoke, notes)
 *  get no edge, so they read as light, not as objects. */
function outline(g: Grid) {
  const filled = (x: number, y: number) => {
    const r = g.get(x, y);
    return r !== null && r !== "fx";
  };
  const add: [number, number][] = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (g.get(x, y) === null && ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).some(([dx, dy]) => filled(x + dx, y + dy))) add.push([x, y]);
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
  const gesture = gestureOf(m.pose);
  const beat = m.beat ?? 0;
  gesture.behind?.(g, look, beat);
  BACK[look.hairStyle]?.(g, look);
  body(g, look, gesture.arms);
  head(g, look);
  face(g, look, expression, Boolean(m.blink), m.open === true ? 2 : m.open ? m.open : 0, m.gaze);
  FRONT[look.hairStyle](g, look);
  if (look.glasses) glasses(g, look.glasses, look.glassesColour ?? "#121214");
  accessory(g, look);
  faceOver(g, look, expression);
  gesture.draw(g, look, beat);
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
