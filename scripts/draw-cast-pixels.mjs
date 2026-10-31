// Pixel-art reference portraits of the cast (Paul, Neil, Aaesha, Caitlin, Riya, Yahya), drawn
// from the written appearance sheet (art/CAST_APPEARANCE.md, REDESIGN-2.md 8.6) and the owner's
// corrections, so everyone can be seen at a glance. A reference only: the app uses the
// illustrator's art (art/ARTIST_BRIEF.md) and, until then, colour-and-initial placeholders.
// Some people have hair options (A, B, C) to choose between; DEFAULTS picks the one shown on
// the cast sheet. Writes art/pixel-reference/.
//   node scripts/draw-cast-pixels.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const W = 48;
const H = 52;
const SCALE = 10;
const OUT = path.join(process.cwd(), "art", "pixel-reference");
/** Which hair option each person shows on the cast sheet and in their own file. */
const DEFAULTS = { paul: "D", neil: "A", aaesha: "A", caitlin: "A", riya: "B", yahya: "B" };

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => {
  const [x, y] = [hex(a), hex(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const M = (x) => W - 1 - x; // mirror a column across the face's centre line

class Grid {
  constructor() {
    this.c = Array.from({ length: H }, () => Array(W).fill(null));
    this.r = Array.from({ length: H }, () => Array(W).fill(null));
  }
  set(x, y, colour, region) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.c[y][x] = colour;
    this.r[y][x] = region;
  }
  row(y, hw, colour, region) {
    for (let x = 24 - hw; x <= 23 + hw; x++) this.set(x, y, colour, region);
  }
  get(x, y) {
    return x < 0 || y < 0 || x >= W || y >= H ? null : this.r[y][x];
  }
}

/**
 * Fill runs of pixels. `rows` maps a row to one run [left, right] or several [[l, r], ...].
 * With `mirror`, every run is drawn on the other side of the face too.
 */
function runs(g, colour, rows, region = "hair", mirror = false) {
  for (const [y, v] of Object.entries(rows)) {
    const list = Array.isArray(v[0]) ? v : [v];
    for (const [l, r] of list)
      for (let x = l; x <= r; x++) {
        g.set(x, +y, typeof colour === "function" ? colour(x, +y) : colour, region);
        if (mirror) g.set(M(x), +y, typeof colour === "function" ? colour(M(x), +y) : colour, region);
      }
  }
}

// ---------------------------------------------------------------- faces

// Half-widths of the face from the centre line, rows 10 to 33.
const TOP = { 10: 6, 11: 8, 12: 9, 13: 9, 14: 10, 15: 10, 16: 10, 17: 10, 18: 10, 19: 10, 20: 10, 21: 10, 22: 10, 23: 10, 24: 10, 25: 10, 26: 10 };
const FACES = {
  standard: { ...TOP, 27: 9, 28: 9, 29: 8, 30: 7, 31: 6, 32: 4, 33: 2 },
  oval: { ...TOP, 25: 10, 26: 9, 27: 9, 28: 8, 29: 7, 30: 6, 31: 5, 32: 3, 33: 1 },
  strong: { ...TOP, 27: 10, 28: 9, 29: 9, 30: 8, 31: 7, 32: 5, 33: 3 },
};

function body(g, p) {
  for (let y = 32; y <= 39; y++) g.row(y, 4, y < 35 ? p.skinShade : p.skin, "neck");
  const torso = { 38: 9, 39: 13, 40: 16, 41: 18, 42: 19, 43: 20, 44: 20, 45: 21, 46: 21, 47: 21, 48: 22, 49: 22, 50: 22, 51: 22 };
  for (const [y, hw] of Object.entries(torso)) g.row(+y, hw, p.top, "body");
  p.clothes(g, p, torso);
}

function head(g, p) {
  const face = FACES[p.face ?? "standard"];
  for (const [y, hw] of Object.entries(face)) {
    g.row(+y, hw, p.skin, "skin");
    // Light from the top left: the right edge of the face sits in shade.
    if (+y > 13) for (let x = 23 + hw - 1; x <= 23 + hw; x++) g.set(x, +y, p.skinShade, "skin");
  }
  for (let y = 20; y <= 25; y++) g.set(13, y, p.skin, "ear"), g.set(34, y, p.skinShade, "ear");
  g.set(13, 22, p.skinShade, "ear");
  g.set(34, 22, mix(p.skinShade, "#000000", 0.15), "ear");
}

function eyes(g, p) {
  const lash = "#1d1514";
  for (const [x0, flip] of [[17, false], [27, true]]) {
    const xs = flip ? [x0 + 3, x0 + 2, x0 + 1, x0] : [x0, x0 + 1, x0 + 2, x0 + 3];
    for (const x of xs) g.set(x, 21, lash, "eye");
    g.set(xs[0], 22, "#f4efe9", "eye");
    g.set(xs[1], 22, p.iris, "eye");
    g.set(xs[2], 22, "#100c0b", "eye");
    g.set(xs[3], 22, "#efe9e2", "eye");
    g.set(xs[1], 23, mix(p.iris, "#000000", 0.25), "eye");
    g.set(xs[2], 23, p.iris, "eye");
    g.set(flip ? xs[2] : xs[1], 22, mix(p.iris, "#ffffff", 0.35), "eye");
  }
}

function brows(g, p) {
  const c = p.brow;
  const shapes = {
    straight: [[16, 19], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19]],
    thick: [[16, 19], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18]],
    arched: [[16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 19], [17, 19], [18, 19]],
    defined: [[16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [17, 19], [18, 19], [19, 19]],
    // Strong and arched, thicker towards the middle of the face.
    bold: [[15, 20], [16, 19], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [22, 19], [16, 20], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19]],
  };
  for (const [x, y] of shapes[p.browShape ?? "straight"]) g.set(x, y, c, "brow"), g.set(M(x), y, c, "brow");
}

function nose(g, p) {
  g.set(24, 24, p.skinShade, "skin");
  g.set(24, 25, p.skinShade, "skin");
  g.set(23, 26, mix(p.skinShade, "#000000", 0.08), "skin");
  g.set(24, 26, mix(p.skinShade, "#000000", 0.12), "skin");
}

function mouth(g, p) {
  const dark = mix(p.lip, "#2a0f0f", 0.45);
  const m = p.mouth;
  if (m === "grin") {
    for (let x = 20; x <= 27; x++) g.set(x, 29, dark, "mouth");
    for (let x = 21; x <= 26; x++) g.set(x, 30, "#f6f1ea", "mouth");
    for (let x = 22; x <= 25; x++) g.set(x, 31, p.lip, "mouth");
    g.set(19, 28, dark, "mouth"), g.set(28, 28, dark, "mouth");
  } else if (m === "half" || m === "smirk") {
    // Up on one side: an easy half-smile, or (smirk) a playful one.
    for (let x = 21; x <= 26; x++) g.set(x, 29, dark, "mouth");
    g.set(27, 28, dark, "mouth");
    if (m === "smirk") g.set(28, 27, dark, "mouth"), g.set(20, 29, dark, "mouth");
    for (let x = 22; x <= 25; x++) g.set(x, 30, p.lip, "mouth");
  } else if (m === "flat") {
    for (let x = 21; x <= 26; x++) g.set(x, 29, dark, "mouth");
    for (let x = 22; x <= 25; x++) g.set(x, 30, mix(p.lip, p.skin, 0.4), "mouth");
  } else {
    for (let x = 21; x <= 26; x++) g.set(x, 29, dark, "mouth");
    g.set(20, 28, dark, "mouth"), g.set(27, 28, dark, "mouth");
    for (let x = 22; x <= 25; x++) g.set(x, 30, p.lip, "mouth");
  }
}

function stubble(g, p, moustache) {
  const s = mix(p.skin, p.hair, 0.3);
  const face = FACES[p.face ?? "standard"];
  for (const [y, hw] of Object.entries(face)) {
    if (+y < 28) continue;
    for (let x = 24 - hw; x <= 23 + hw; x++) {
      if (g.get(x, +y) !== "skin") continue;
      if ((x * 3 + +y * 2) % 4 === 0 || (+y >= 31 && (x + +y) % 2 === 0)) g.set(x, +y, s, "skin");
    }
  }
  if (moustache) for (let x = 21; x <= 26; x++) g.set(x, 28, mix(p.skin, p.hair, 0.55), "skin");
}

/** A small, thin moustache: one row, just above the lip. */
function moustache(g, p) {
  for (let x = 22; x <= 25; x++) g.set(x, 27, mix(p.hair, p.skin, 0.35), "skin");
}

function glasses(g, kind, frame) {
  if (kind === "rect") {
    for (const x0 of [15, 26]) {
      for (let x = x0; x <= x0 + 6; x++) g.set(x, 20, frame, "glasses"), g.set(x, 24, frame, "glasses");
      for (let y = 20; y <= 24; y++) g.set(x0, y, frame, "glasses"), g.set(x0 + 6, y, frame, "glasses");
    }
  } else {
    for (const cx of [18.5, 28.5]) {
      const pts = [[-2, -2], [-1, -3], [0, -3], [1, -3], [2, -2], [3, -1], [3, 0], [3, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 2], [-3, 1], [-3, 0], [-3, -1]];
      for (const [dx, dy] of pts) g.set(Math.round(cx + dx), 22 + dy, frame, "glasses");
    }
  }
  for (const x of [22, 23, 24, 25]) g.set(x, 21, frame, "glasses");
  g.set(14, 21, frame, "glasses"), g.set(33, 21, frame, "glasses");
}

// ---------------------------------------------------------------- hair

/** Shade the hair: its lower edges and the side away from the light. */
function shadeHair(g, p, region = "hair") {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g.get(x, y) !== region) continue;
      if (x > 31 || g.get(x, y + 1) !== region) g.c[y][x] = shadeOf(p, y);
    }
}
const shadeOf = (p, y) => (p.endsFrom && y >= p.endsFrom ? p.endsShade : p.hairShade);
const colourOf = (p) => (x, y) => (p.endsFrom && y >= p.endsFrom ? p.ends : p.endsFrom && y >= p.endsFrom - 3 ? mix(p.hair, p.ends, (y - p.endsFrom + 4) / 4) : p.hair);

/** Small curls: a ring of highlight with a dark middle, every few pixels. */
function curls(g, p, points) {
  for (const [x, y] of points)
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0]]) if (g.get(x + dx, y + dy) === "hair") g.c[y + dy][x + dx] = p.hairLight;
}

/** Thin highlight strands: a line from (x0, y0) to (x1, y1). */
function strand(g, p, x0, y0, x1, y1, colour = p.hairLight) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    if (g.get(x, y) === "hair") g.c[y][x] = colour;
  }
}

/** Long hair falling behind the shoulders (drawn first, so the body covers it). */
function longBack(g, p, to = 51, hw = 13) {
  for (let y = 12; y <= to; y++) {
    const w = y < 16 ? hw - 1 : hw;
    for (let x = 24 - w; x <= 23 + w; x++) g.set(x, y, colourOf(p)(x, y), "hairBack");
  }
}

/** A centre-parted crown for long hair, with the parting showing as a line of skin. */
function partedCrown(g, p, partTo = 9) {
  runs(g, colourOf(p), { 4: [18, 29], 5: [15, 32], 6: [13, 34], 7: [12, 35], 8: [12, 35], 9: [11, 36], 10: [11, 36], 11: [11, 36], 12: [11, 36] });
  runs(g, colourOf(p), { 10: [[21, 22], [25, 26]], 11: [[19, 22], [25, 28]], 12: [[18, 21], [26, 29]], 13: [[17, 18], [29, 30]] });
}

/** The sides of long straight hair: down past the face, either side. */
function longSides(g, p, to, opts = {}) {
  for (let y = 13; y <= to; y++) {
    const inner = y < 20 ? 14 : 13;
    const wave = opts.wave ? (y >> 2) % 2 : 0;
    runs(g, colourOf(p), { [y]: [10 - wave + (opts.slim ? 1 : 0), inner] }, "hair", true);
  }
}

const HAIR = {
  paul: {
    // A: a curly mop, volume at the sides, curls falling over the forehead, down to the jaw.
    A(g, p) {
      runs(g, p.hair, { 3: [[17, 19], [22, 25], [28, 30]], 4: [14, 33], 5: [12, 35], 6: [11, 36], 7: [10, 37], 8: [10, 37], 9: [10, 37], 10: [10, 37], 11: [10, 37], 12: [10, 37], 13: [10, 37] });
      runs(g, p.hair, { 14: [[14, 18], [20, 25], [28, 33]], 15: [[15, 17], [21, 24], [29, 32]], 16: [[16, 16], [22, 23], [30, 31]] });
      for (let y = 14; y <= 28; y++) {
        const out = y % 4 < 2 ? 9 : 10;
        const inner = y <= 19 ? 14 : y <= 25 ? 13 : 12;
        const left = y <= 26 ? out : y === 27 ? 10 : 11;
        runs(g, p.hair, { [y]: [left, inner] }, "hair", true);
      }
      shadeHair(g, p);
      curls(g, p, [[15, 5], [20, 5], [26, 5], [31, 6], [13, 8], [18, 8], [23, 8], [28, 8], [33, 9], [15, 11], [20, 11], [25, 11], [30, 11], [11, 15], [11, 19], [11, 23], [36, 15], [36, 19], [16, 14], [22, 14], [30, 14]]);
    },
    // B: wavy curtains from a middle parting, framing the forehead, down to the jaw.
    B(g, p) {
      runs(g, p.hair, { 4: [16, 31], 5: [13, 34], 6: [12, 35], 7: [11, 36], 8: [11, 36], 9: [11, 36], 10: [11, 36], 11: [11, 36], 12: [11, 36] });
      runs(g, p.hair, { 13: [[11, 22], [25, 36]], 14: [[10, 20], [27, 37]], 15: [[10, 18], [29, 37]], 16: [[10, 16], [31, 37]], 17: [[10, 15], [32, 37]] });
      for (let y = 18; y <= 29; y++) {
        const out = y % 4 < 2 ? 9 : 10;
        runs(g, p.hair, { [y]: [y <= 27 ? out : 11, y <= 25 ? 13 : 12] }, "hair", true);
      }
      shadeHair(g, p);
      for (const [a, b, c, d] of [[21, 6, 14, 14], [19, 6, 12, 17], [26, 6, 33, 14], [28, 6, 35, 17], [11, 20, 10, 27], [36, 20, 37, 27]]) strand(g, p, a, b, c, d);
    },
    // C: thick waves swept across to one side, longer on that side.
    C(g, p) {
      runs(g, p.hair, { 3: [18, 30], 4: [15, 33], 5: [13, 35], 6: [12, 36], 7: [11, 37], 8: [11, 37], 9: [11, 37], 10: [11, 37], 11: [11, 37], 12: [11, 37], 13: [11, 37] });
      runs(g, p.hair, { 14: [[11, 13], [19, 36]], 15: [[11, 13], [24, 36]], 16: [[11, 13], [27, 36]], 17: [[11, 13], [30, 36]], 18: [[11, 13], [32, 36]] });
      for (let y = 19; y <= 25; y++) runs(g, p.hair, { [y]: [y % 4 < 2 ? 10 : 11, 13] });
      for (let y = 19; y <= 28; y++) runs(g, p.hair, { [y]: [34, y <= 26 ? (y % 4 < 2 ? 38 : 37) : 36] });
      shadeHair(g, p);
      for (const [a, b, c, d] of [[14, 6, 30, 14], [16, 9, 33, 16], [13, 11, 34, 18], [20, 4, 33, 10]]) strand(g, p, a, b, c, d);
    },
    // D: a black cap worn backwards, wavy hair coming out underneath at the sides and back.
    D(g, p) {
      const cap = "#18181b";
      const capShade = "#0c0c0e";
      const capLight = "#3a3a42";
      // Just a little wavy hair peeking out under the cap: at the temples, and a few short
      // flicks from behind the ears.
      runs(g, p.hair, { 15: [12, 14], 16: [12, 14], 17: [12, 13], 18: [11, 13], 19: [11, 12], 20: [11, 12], 21: [10, 12], 22: [10, 12], 23: [10, 11], 24: [11, 11] }, "hair", true);
      shadeHair(g, p);
      for (const [x, y] of [[12, 16], [11, 19], [10, 22], [35, 16], [36, 19], [37, 22]]) if (g.get(x, y) === "hair") g.c[y][x] = p.hairLight;
      // The cap's crown: a rounded dome down to the top of the forehead.
      runs(g, cap, { 4: [22, 25], 5: [17, 30], 6: [15, 32], 7: [14, 33], 8: [13, 34], 9: [12, 35], 10: [12, 35], 11: [12, 35], 12: [12, 35], 13: [12, 35], 14: [12, 35] }, "cap");
      for (let y = 5; y <= 14; y++) for (let x = 12; x <= 35; x++) if (g.get(x, y) === "cap" && (x > 31 || g.get(x, y + 1) !== "cap")) g.c[y][x] = capShade;
      // Seams from the button, and a sheen on the upper left.
      for (let y = 5; y <= 10; y++) g.set(23, y, capShade, "cap");
      for (const [x, y] of [[16, 7], [15, 8], [14, 9], [14, 10], [18, 6], [19, 6]]) g.set(x, y, capLight, "cap");
      g.set(23, 4, "#2a2a30", "cap"), g.set(24, 4, "#2a2a30", "cap");
      // Worn backwards: the snapback's opening at the front, with a little hair showing through, and the strap.
      runs(g, p.hair, { 11: [22, 25], 12: [21, 26], 13: [21, 26] }, "hair");
      for (const [x, y] of [[22, 11], [24, 12], [21, 13], [25, 13]]) g.set(x, y, p.hairLight, "hair");
      runs(g, cap, { 14: [19, 28] }, "cap");
      for (const x of [21, 23, 25]) g.set(x, 14, "#55565e", "cap");
    },
  },
  neil: {
    // A: short, with the front swept up into a quiff; short faded sides.
    A(g, p) {
      runs(g, p.hair, { 0: [21, 26], 1: [18, 29], 2: [16, 31], 3: [15, 32], 4: [14, 33], 5: [13, 34], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
      runs(g, p.hair, { 13: [[13, 17], [30, 34]], 14: [[13, 15], [32, 34]], 15: [[13, 14], [33, 34]], 16: [[13, 14], [33, 34]] });
      for (let y = 17; y <= 19; y++) g.set(13, y, mix(p.hair, p.skin, 0.4), "hair"), g.set(34, y, mix(p.hair, p.skinShade, 0.4), "hair");
      shadeHair(g, p);
      for (const [a, b, c, d] of [[17, 12, 21, 1], [21, 12, 24, 0], [25, 12, 27, 1], [15, 11, 18, 3]]) strand(g, p, a, b, c, d);
    },
    // B: short and textured, swept up into small peaks at the front.
    B(g, p) {
      runs(g, p.hair, { 1: [[17, 18], [21, 22], [25, 26], [29, 30]], 2: [16, 31], 3: [15, 32], 4: [14, 33], 5: [13, 34], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
      runs(g, p.hair, { 13: [[13, 16], [31, 34]], 14: [[13, 15], [32, 34]], 15: [[13, 14], [33, 34]], 16: [[13, 14], [33, 34]] });
      for (let y = 17; y <= 19; y++) g.set(13, y, mix(p.hair, p.skin, 0.4), "hair"), g.set(34, y, mix(p.hair, p.skinShade, 0.4), "hair");
      shadeHair(g, p);
      for (const x of [17, 21, 25, 29]) strand(g, p, x, 11, x + 1, 2);
    },
    // C: swept up and over to one side, higher at the front left.
    C(g, p) {
      runs(g, p.hair, { 0: [15, 21], 1: [14, 25], 2: [14, 28], 3: [13, 30], 4: [13, 32], 5: [13, 33], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
      runs(g, p.hair, { 13: [[13, 20], [31, 34]], 14: [[13, 15], [32, 34]], 15: [[13, 14], [33, 34]], 16: [[13, 14], [33, 34]] });
      for (let y = 17; y <= 19; y++) g.set(13, y, mix(p.hair, p.skin, 0.4), "hair"), g.set(34, y, mix(p.hair, p.skinShade, 0.4), "hair");
      shadeHair(g, p);
      for (const [a, b, c, d] of [[15, 12, 22, 2], [19, 12, 27, 3], [23, 11, 31, 5], [15, 4, 30, 7]]) strand(g, p, a, b, c, d);
    },
  },
  yahya: {
    // A: tight curls piled on top, short faded sides.
    A(g, p) {
      runs(g, p.hair, { 2: [[15, 17], [19, 21], [23, 25], [27, 29], [31, 32]], 3: [14, 33], 4: [13, 34], 5: [13, 34], 6: [13, 34], 7: [13, 34], 8: [13, 34], 9: [13, 34], 10: [13, 34], 11: [13, 34], 12: [13, 34] });
      runs(g, p.hair, { 13: [[13, 17], [30, 34]], 14: [[13, 15], [32, 34]] });
      for (let y = 15; y <= 19; y++) g.set(13, y, mix(p.hair, p.skin, 0.45), "hair"), g.set(34, y, mix(p.hair, p.skinShade, 0.45), "hair");
      shadeHair(g, p);
      const pts = [];
      for (let y = 4; y <= 12; y += 3) for (let x = 15 + (((y - 4) / 3) % 2) * 2; x <= 32; x += 4) pts.push([x, y]);
      curls(g, p, pts);
    },
    // B: the same curls, with a few falling onto the forehead.
    B(g, p) {
      HAIR.yahya.A(g, p);
      runs(g, p.hair, { 13: [[18, 29]], 14: [[18, 20], [23, 25], [27, 29]], 15: [[19, 19], [24, 24], [28, 28]] });
      shadeHair(g, p);
      curls(g, p, [[19, 14], [24, 14], [28, 14]]);
    },
    // C: a taller pile of curls, sides very short.
    C(g, p) {
      runs(g, p.hair, { 0: [[16, 18], [20, 22], [24, 26], [28, 30]], 1: [15, 32], 2: [14, 33], 3: [14, 33], 4: [14, 33], 5: [14, 33], 6: [14, 33], 7: [14, 33], 8: [14, 33], 9: [14, 33], 10: [14, 33], 11: [14, 33], 12: [13, 34] });
      runs(g, p.hair, { 13: [[13, 16], [31, 34]] });
      for (let y = 14; y <= 19; y++) g.set(13, y, mix(p.hair, p.skin, 0.55), "hair"), g.set(34, y, mix(p.hair, p.skinShade, 0.55), "hair");
      shadeHair(g, p);
      const pts = [];
      for (let y = 2; y <= 11; y += 3) for (let x = 16 + (((y - 2) / 3) % 2) * 2; x <= 32; x += 4) pts.push([x, y]);
      curls(g, p, pts);
    },
  },
  aaesha: {
    // Very long, straight, centre parting, strands framing her face.
    A(g, p) {
      partedCrown(g, p);
      longSides(g, p, 34);
      shadeHair(g, p);
      for (let y = 9; y <= 24; y++) if (y % 6 !== 0) g.set(12, y, p.hairLight, "hair");
    },
  },
  caitlin: {
    // A: long, centre parting, a soft wave, purple from about chin height down.
    A(g, p) {
      partedCrown(g, p);
      longSides(g, p, 37, { wave: true });
      shadeHair(g, p);
      for (let y = 9; y <= 22; y += 1) if (y % 5) g.set(11, y, p.hairLight, "hair");
      for (let y = p.endsFrom; y <= 37; y++) if (g.get(11, y) === "hair") g.c[y][11] = p.endsLight;
    },
    // B: the same, purple only at the tips.
    B(g, p) {
      HAIR.caitlin.A(g, { ...p, endsFrom: 33 });
    },
  },
  riya: {
    // A: long, straight, glossy, sharp centre parting, falling in front of her shoulders.
    A(g, p) {
      partedCrown(g, p, 10);
      for (let y = 13; y <= 51; y++) {
        const inner = y < 20 ? 14 : y < 31 ? 13 : y < 36 ? 15 : 16;
        const outer = y < 31 ? 11 : y < 36 ? 12 : 13;
        runs(g, p.hair, { [y]: [outer, inner] }, "hair", true);
      }
      shadeHair(g, p);
      for (let y = 8; y <= 46; y++) if (y % 7 !== 0) g.set(y < 31 ? 12 : 14, y, p.hairLight, "hair");
    },
    // B: the same, behind her shoulders.
    B(g, p) {
      partedCrown(g, p, 10);
      longSides(g, p, 38, { slim: true });
      shadeHair(g, p);
      for (let y = 8; y <= 30; y++) if (y % 7 !== 0) g.set(12, y, p.hairLight, "hair");
    },
  },
};

// ---------------------------------------------------------------- the cast

const BLACK_FRAMES = "#121214";

const CAST = [
  {
    id: "paul",
    name: "Paul",
    role: "The professor",
    colour: "#FFB627",
    face: "strong",
    skin: "#e2b48c",
    skinShade: "#c9946c",
    lip: "#b0705a",
    iris: "#5a3a24",
    brow: "#2a1a12",
    browShape: "thick",
    hair: "#4a2e1e",
    hairShade: "#2e1c12",
    hairLight: "#6e4a32",
    mouth: "half",
    top: "#22304f",
    options: { A: "Curly mop", B: "Wavy curtains", C: "Swept to one side", D: "Black backwards cap" },
    notes: "A black cap worn backwards, wavy dark-brown hair coming out underneath, strong brows, light stubble and a thin moustache. Navy-and-cream varsity jacket over a collared shirt.",
    face2(g, p) {
      stubble(g, p, true);
    },
    clothes(g, p, torso) {
      // Cream sleeves, a navy body, cream ribbing at the collar, a white shirt collar, snaps.
      for (const [y, hw] of Object.entries(torso)) {
        for (let x = 24 - hw; x <= 24 - hw + 5; x++) g.set(x, +y, "#ece3cf", "body");
        for (let x = 23 + hw - 5; x <= 23 + hw; x++) g.set(x, +y, "#ddd2bb", "body");
      }
      for (let y = 38; y <= 41; y++) for (let x = 19; x <= 28; x++) if (Math.abs(x - 23.5) >= 7 - (y - 38) * 1.4) g.set(x, y, "#ece3cf", "body");
      for (const [x, y] of [[20, 38], [21, 39], [22, 40], [27, 38], [26, 39], [25, 40], [20, 39], [27, 39]]) g.set(x, y, "#f7f6f2", "body");
      for (let y = 41; y <= 51; y++) g.set(23, y, "#1a2540", "body"), g.set(24, y, "#1a2540", "body");
      for (const y of [44, 47, 50]) g.set(22, y, "#ece3cf", "body");
    },
  },
  {
    id: "neil",
    name: "Neil",
    role: "The teaching assistant",
    colour: "#1FB5A8",
    skin: "#dcae86",
    skinShade: "#c28f68",
    lip: "#a96752",
    iris: "#4a3020",
    brow: "#16110f",
    browShape: "thick",
    hair: "#17130f",
    hairShade: "#0c0a08",
    hairLight: "#3d342c",
    mouth: "grin",
    top: "#f3f3f1",
    options: { A: "Quiff, short sides", B: "Short, flicked up", C: "Swept up to one side" },
    notes: "Short black hair swept up at the front, thick brows, clean-shaven, a wide friendly smile. Black rectangular glasses. A white collared shirt.",
    extras(g) {
      glasses(g, "rect", BLACK_FRAMES);
    },
    clothes(g, p, torso) {
      for (const [y, hw] of Object.entries(torso)) g.set(24 - hw, +y, "#d9dbe0", "body"), g.set(23 + hw, +y, "#cfd2d8", "body");
      for (const [x, y] of [[18, 37], [19, 38], [20, 39], [21, 40], [29, 37], [28, 38], [27, 39], [26, 40], [19, 37], [28, 37], [20, 38], [27, 38]]) g.set(x, y, "#ffffff", "body");
      for (const [x, y] of [[18, 38], [19, 39], [20, 40], [29, 38], [28, 39], [27, 40]]) g.set(x, y, "#c9ccd2", "body");
      for (let y = 41; y <= 51; y++) g.set(24, y, "#d6d8dd", "body");
      for (const y of [43, 47, 51]) g.set(24, y, "#a9adb5", "body");
    },
  },
  {
    id: "aaesha",
    name: "Aaesha",
    role: "Classmate: data and tests",
    colour: "#FF7A6B",
    skin: "#ebc3a0",
    skinShade: "#d4a57f",
    lip: "#bd6d64",
    iris: "#3d2518",
    brow: "#1f1512",
    browShape: "defined",
    hair: "#1e1512",
    hairShade: "#100b09",
    hairLight: "#3d2c24",
    mouth: "smile",
    top: "#4a3226",
    notes: "Very long, straight, near-black hair with a centre parting and strands framing her face. Rosy cheeks, a warm smile, small gold earrings, a fine gold necklace. A dark-brown T-shirt.",
    back(g, p) {
      longBack(g, p);
    },
    face2(g) {
      for (const [x, y] of [[17, 26], [18, 26], [29, 26], [30, 26]]) g.set(x, y, "#e59a8c", "skin");
    },
    extras(g) {
      g.set(13, 26, "#e8b440", "accessory"), g.set(34, 26, "#d29a2a", "accessory");
    },
    clothes(g, p) {
      for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
      for (let x = 21; x <= 26; x++) g.set(x, 39, p.skin, "neck");
      for (const [x, y] of [[20, 38], [21, 39], [22, 40], [23, 40], [24, 40], [25, 40], [26, 39], [27, 38]]) g.set(x, y, "#e8b440", "accessory");
      g.set(24, 41, "#f1c75a", "accessory");
    },
  },
  {
    id: "caitlin",
    name: "Caitlin",
    role: "Classmate: games, web, making things",
    colour: "#8C6BF2",
    skin: "#a8724e",
    skinShade: "#8d5c3c",
    lip: "#7d4535",
    iris: "#2c1a10",
    brow: "#22160f",
    browShape: "arched",
    hair: "#3b2618",
    hairShade: "#24170e",
    hairLight: "#5a3d28",
    // Purple towards the ends.
    ends: "#7a4cc6",
    endsShade: "#57339a",
    endsLight: "#a07ce8",
    endsFrom: 28,
    mouth: "smile",
    top: "#5f7a6b",
    options: { A: "Purple from chin height", B: "Purple tips only" },
    notes: "Long dark-brown hair turning purple towards the ends, centre parting, a soft wave. Round, thin black glasses. A loose overshirt over a plain T-shirt. A calm, knowing smile.",
    back(g, p) {
      longBack(g, p, 50);
    },
    extras(g) {
      glasses(g, "round", BLACK_FRAMES);
    },
    clothes(g, p, torso) {
      for (let y = 38; y <= 51; y++) for (let x = 18; x <= 29; x++) g.set(x, y, "#ece6da", "body");
      for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
      for (const [x, y] of [[17, 38], [18, 39], [18, 40], [17, 41], [30, 38], [29, 39], [29, 40], [30, 41]]) g.set(x, y, "#4d6658", "body");
      for (let y = 42; y <= 51; y++) g.set(18, y, "#4d6658", "body"), g.set(29, y, "#4d6658", "body");
      for (const [y, hw] of Object.entries(torso)) g.set(23 + hw, +y, "#4a6253", "body");
    },
  },
  {
    id: "riya",
    name: "Riya",
    role: "Classmate: practical projects and ML",
    colour: "#4CC36F",
    face: "oval",
    skin: "#ddb08a",
    skinShade: "#c4936c",
    lip: "#b0605a",
    iris: "#2e1c12",
    brow: "#0f0b0a",
    browShape: "bold",
    hair: "#0e0c0e",
    hairShade: "#050405",
    hairLight: "#3a4152",
    mouth: "smirk",
    top: "#efe7d4",
    options: { A: "Hair in front of the shoulders", B: "Hair behind the shoulders" },
    notes: "Long, straight, glossy jet-black hair with a sharp centre parting. Strong, defined brows, a playful smile. A cream varsity jacket with navy stripes on the collar and cuffs, over a dark top.",
    back(g, p) {
      longBack(g, p, 51, 12);
    },
    clothes(g, p, torso) {
      for (let y = 38; y <= 51; y++) for (let x = 19; x <= 28; x++) g.set(x, y, "#1d1d24", "body");
      for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
      // Navy-and-cream striped ribbing at the collar.
      for (const [x, y] of [[17, 38], [18, 39], [19, 40], [19, 41], [30, 38], [29, 39], [28, 40], [28, 41], [16, 38], [31, 38], [17, 39], [30, 39]]) g.set(x, y, "#22304f", "body");
      for (const [x, y] of [[16, 39], [17, 40], [18, 41], [31, 39], [30, 40], [29, 41]]) g.set(x, y, "#ece3cf", "body");
      for (const [x, y] of [[15, 39], [16, 40], [17, 41], [32, 39], [31, 40], [30, 41]]) g.set(x, y, "#22304f", "body");
      for (let y = 42; y <= 51; y++) g.set(19, y, "#d9cfb8", "body"), g.set(28, y, "#d9cfb8", "body");
      for (const [y, hw] of Object.entries(torso)) g.set(23 + hw, +y, "#d8cdb6", "body");
    },
  },
  {
    id: "yahya",
    name: "Yahya",
    role: "Classmate: algorithms, speed and the Arcade",
    colour: "#3B6FD8",
    face: "strong",
    skin: "#d8a982",
    skinShade: "#bd8b64",
    lip: "#a0624e",
    iris: "#2a1a11",
    brow: "#141010",
    browShape: "straight",
    hair: "#141112",
    hairShade: "#0a0809",
    hairLight: "#3d3537",
    mouth: "flat",
    top: "#1b1c21",
    options: { A: "Curls on top, faded sides", B: "Curls onto the forehead", C: "Taller curls" },
    notes: "Short, tight dark curls piled on top, shorter sides, clean-shaven. A black jacket over a heather-grey T-shirt. A cool, deadpan look; the smile is rare and earned.",
    
    clothes(g, p, torso) {
      for (let y = 38; y <= 51; y++) for (let x = 19; x <= 28; x++) g.set(x, y, (x + y) % 3 ? "#8f9298" : "#9da0a6", "body");
      for (let x = 20; x <= 27; x++) g.set(x, 38, p.skin, "neck");
      for (const [x, y] of [[18, 38], [18, 39], [19, 40], [29, 38], [29, 39], [28, 40]]) g.set(x, y, "#2c2e35", "body");
      for (let y = 41; y <= 51; y++) g.set(19, y, "#2c2e35", "body"), g.set(28, y, "#2c2e35", "body");
      for (const [y, hw] of Object.entries(torso)) g.set(24 - hw + 1, +y, "#2a2b31", "body");
    },
  },
];

function outline(g, ink) {
  const fill = (x, y) => g.get(x, y) !== null;
  const add = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (!fill(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => fill(x + dx, y + dy))) add.push([x, y]);
  for (const [x, y] of add) g.set(x, y, ink, "outline");
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = g.get(x, y);
      if (r === "skin" || r === "ear") {
        const n = [g.get(x - 1, y), g.get(x + 1, y), g.get(x, y - 1)];
        if (n.some((v) => v === "hair" || v === "hairBack" || v === "outline")) g.c[y][x] = mix(g.c[y][x], "#3a2016", 0.35);
      }
    }
}

function draw(p, option) {
  const g = new Grid();
  p.back?.(g, p);
  body(g, p);
  head(g, p);
  eyes(g, p);
  brows(g, p);
  nose(g, p);
  mouth(g, p);
  p.face2?.(g, p);
  HAIR[p.id][option](g, p);
  p.extras?.(g, p);
  outline(g, "#1a1418");
  return g;
}

async function render(g, background) {
  const pad = 4;
  const w = W + pad * 2;
  const h = H + pad;
  const raw = Buffer.alloc(w * h * 4);
  const bg = hex(background);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const c = y - pad >= 0 && x - pad >= 0 && x - pad < W && y - pad < H ? g.c[y - pad][x - pad] : null;
      const [r, gg, b] = c ? hex(c) : bg;
      raw[i] = r;
      raw[i + 1] = gg;
      raw[i + 2] = b;
      raw[i + 3] = 255;
    }
  return sharp(raw, { raw: { width: w, height: h, channels: 4 } }).resize(w * SCALE, h * SCALE, { kernel: "nearest" }).png().toBuffer();
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;");
const wrap = (s, n) => {
  const out = [];
  let line = "";
  for (const word of s.split(" ")) {
    if ((line + " " + word).trim().length > n) {
      out.push(line.trim());
      line = word;
    } else line += " " + word;
  }
  if (line.trim()) out.push(line.trim());
  return out;
};

/** A sheet of labelled portraits: `cards` are { png, title, swatch, lines }. */
async function sheet(file, heading, cards, cols) {
  const TW = (W + 8) * SCALE;
  const TH = (H + 4) * SCALE;
  const textH = Math.max(...cards.map((c) => 70 + c.lines.length * 26)) + 20;
  const CARD_H = TH + textH;
  const rows = Math.ceil(cards.length / cols);
  const sw = cols * TW + (cols + 1) * 40;
  const sh = rows * CARD_H + (rows + 1) * 40 + 60;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}"><rect width="100%" height="100%" fill="#0F1115"/>`;
  svg += `<text x="40" y="58" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#F2F3F5">${esc(heading)}</text>`;
  const comps = [];
  cards.forEach((c, i) => {
    const x = 40 + (i % cols) * (TW + 40);
    const y = 90 + Math.floor(i / cols) * (CARD_H + 40);
    svg += `<rect x="${x - 12}" y="${y - 12}" width="${TW + 24}" height="${CARD_H}" rx="10" fill="#1D212A"/>`;
    svg += `<text x="${x}" y="${y + TH + 44}" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#F2F3F5">${esc(c.title)}</text>`;
    if (c.swatch) svg += `<rect x="${x + TW - 26}" y="${y + TH + 18}" width="26" height="26" rx="4" fill="${c.swatch}"/>`;
    c.lines.forEach((l, j) => (svg += `<text x="${x}" y="${y + TH + 80 + j * 26}" font-family="Helvetica, Arial, sans-serif" font-size="${j === 0 ? 22 : 19}" fill="#A4ABB8">${esc(l)}</text>`));
    comps.push({ input: c.png, left: x, top: y });
  });
  svg += `</svg>`;
  fs.writeFileSync(path.join(OUT, file), await sharp(Buffer.from(svg)).composite(comps).png().toBuffer());
  console.log(`art/pixel-reference/${file}`);
}

fs.mkdirSync(path.join(OUT, "options"), { recursive: true });
const main = [];
const options = [];
for (const p of CAST) {
  const bg = mix(p.colour, "#ffffff", 0.35);
  for (const opt of Object.keys(HAIR[p.id])) {
    const png = await render(draw(p, opt), bg);
    if (p.options) {
      fs.writeFileSync(path.join(OUT, "options", `${p.id}-${opt.toLowerCase()}.png`), png);
      options.push({ png, title: `${p.name} ${opt}`, swatch: p.colour, lines: [p.options[opt]] });
    }
    if (opt === DEFAULTS[p.id]) {
      fs.writeFileSync(path.join(OUT, `${p.id}.png`), png);
      main.push({ png, title: p.name, swatch: p.colour, lines: [p.role, ...wrap(p.notes, 50)] });
      console.log(`art/pixel-reference/${p.id}.png`);
    }
  }
}
// The cast sheet: just the six of them, side by side, no text.
{
  const TW = (W + 8) * SCALE;
  const TH = (H + 4) * SCALE;
  const gap = 24;
  const comps = main.map((c, i) => ({ input: c.png, left: gap + (i % 3) * (TW + gap), top: gap + Math.floor(i / 3) * (TH + gap) }));
  const out = await sharp({ create: { width: 3 * TW + 4 * gap, height: 2 * TH + 3 * gap, channels: 4, background: "#0F1115" } }).composite(comps).png().toBuffer();
  fs.writeFileSync(path.join(OUT, "cast-sheet.png"), out);
  console.log("art/pixel-reference/cast-sheet.png");
}
await sheet("options-sheet.png", "Hair options: tell me which is closest for each person", options, 4);
