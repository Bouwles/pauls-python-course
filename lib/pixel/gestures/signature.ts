// Signature moves: each cast member's own gestures, from what they're into, so nobody moves like
// anybody else. Paul pushes his cap back and shows a loss curve going down; Neil launches a model
// rocket; Riya paints; Yahya clicks a stopwatch; Aaesha ticks her clipboard; Caitlin strums a
// guitar. Every one is `who`-only. The props they hold are in lib/pixel/props-interests.ts.
// Everyone stands still and level: only arms, hands and what they hold move.
import { arm, hand, shoulders, type Grid, type HandKind, type Pt } from "../kit";
import type { PersonLook } from "../people";
import * as P from "../props-interests";
import { defineGestures, type GestureDef } from "./registry";

// ---------------------------------------------------------------- helpers

/** Which drawing a beat shows, for loops that hold some frames longer than others. */
const at = <T,>(seq: readonly T[], beat: number): T => seq[beat % seq.length]!;

/** Move every pixel of `region` by (dx, dy); where it was is filled by `fill` (or cleared). */
function move(g: Grid, region: string, dx: number, dy: number, fill?: (x: number, y: number) => [string, string] | null) {
  const cells: [number, number, string][] = [];
  for (let y = 0; y < 52; y++) for (let x = 0; x < 48; x++) if (g.r[y]![x] === region) cells.push([x, y, g.c[y]![x]!]);
  for (const [x, y] of cells) {
    const f = fill?.(x, y);
    if (f) g.set(x, y, f[0], f[1]);
    else g.clear(x, y);
  }
  for (const [x, y, c] of cells) g.set(x + dx, y + dy, c, region);
}

type Kind = HandKind | string[] | null;

/** An arm on the viewer's left, its elbow down by the bottom of the frame, the hand up at `wrist`. */
function lowL(g: Grid, p: PersonLook, wrist: Pt, kind: Kind, flip = false) {
  const { L } = shoulders(p);
  arm(g, p, [L + 1, 43], [L - 1, 51], wrist, kind, flip);
}
/** The same on the viewer's right. */
function lowR(g: Grid, p: PersonLook, wrist: Pt, kind: Kind, flip = true) {
  const { R } = shoulders(p);
  arm(g, p, [R - 1, 43], [R + 1, 51], wrist, kind, flip);
}
/** An arm on the viewer's right raised beside the head, elbow out at `elbow`. */
function upR(g: Grid, p: PersonLook, elbow: Pt, wrist: Pt, kind: Kind, flip = false) {
  const { R } = shoulders(p);
  arm(g, p, [R - 1, 43], [R + elbow[0], elbow[1]], wrist, kind, flip);
}
/** An arm on the viewer's left raised beside the head. */
function upL(g: Grid, p: PersonLook, elbow: Pt, wrist: Pt, kind: Kind, flip = true) {
  const { L } = shoulders(p);
  arm(g, p, [L + 1, 43], [L - elbow[0], elbow[1]], wrist, kind, flip);
}

/** A hand on its own (over a prop), bottom row at `pt`. */
const handAt = (g: Grid, p: PersonLook, rows: HandKind | string[], pt: Pt, flip = false) => hand(g, p, rows, pt, flip);

// Hand shapes the signature moves need beyond kit.ts's. S skin, s shade, k crease.
const H = {
  // Holding the side of something flat, thumb over its front edge.
  side: [".SS.", "SSSs", "SkSs", "SSSs", ".Ss."],
  // A palm under something, fingers curled up its sides.
  cup: ["S....S", "SS..sS", "SSSSSs", ".SSSs."],
  // A palm under something small, from one side.
  palm: ["S...", "SSSs", "SSSs", ".Ss."],
  // Counting: one, two and three fingers up, the rest tucked.
  one: ["..S..", "..S..", "..S..", ".SSs.", "SkkkS", "SSSSs", ".SSs."],
  two: [".S.S.", ".S.S.", ".S.S.", ".SSs.", "SkkkS", "SSSSs", ".SSs."],
  three: ["S.S.S", "S.S.S", "S.S.S", "SSSSs", "SkkkS", "SSSSs", ".SSs."],
  // A pinch: thumb and finger round something thin (chalk, a brush, a pen).
  pinch: [".SS..", "SkSs.", "SSSs.", "SSSs.", ".Ss.."],
  // Fingers flat along something, from the side (a neck, a cap's edge).
  flatSide: ["SSSSs", "SSSSs", "SkSSs", ".SSs."],
  // A director's corner: the finger up, the thumb out.
  cornerUp: ["S....", "S....", "S....", "Ss...", "SSSSS", "SSSs.", ".Ss.."],
  // The other corner: the thumb out to the left, the finger down.
  cornerDown: ["SSSSS", "..sSS", "....S", "..SSS", "..SSs", "...Ss"],
  // A finger heart: thumb and finger crossed at the top.
  heart: [".S.S.", "SSSs.", "SkkSs", "SSSs.", ".Ss.."],
  // A flat palm, fingers forward, slapping down (a button).
  slap: ["SSSSSs", "SSSSSs", ".SSSs."],
};

// ================================================================ Paul: coding, AI and machine learning

const paul: GestureDef[] = [
  {
    id: "cap-push",
    label: "pushes his cap back",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "think", "idle"],
    faces: ["pleased", "determined"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const f = at([0, 1, 2, 2, 1, 0], beat);
      if (f === 0) return upR(g, p, [4, 37], [p.build === "regular" ? 41 : 40, 29], "open");
      // He tugs it back: the cap lifts a pixel, showing a line of hair under it.
      if (f === 2) move(g, "cap", 0, -1, (x, y) => (y >= 12 && x >= 13 && x <= 34 ? [p.hair, "hair"] : null));
      upR(g, p, [7, 31], [37, 17 - (f === 2 ? 1 : 0)], H.flatSide, true);
    },
  },
  {
    id: "gear-turn",
    label: "turns a spare clock gear in his fingers",
    arms: { left: true, right: false },
    beats: 4,
    ms: 260,
    tags: ["think", "idle", "wait"],
    faces: ["curious", "thinking"],
    who: ["paul"],
    draw: (g, p, beat) => {
      // One of the clock's spare parts, from his drawer. It will go back in one day.
      upR(g, p, [4, 42], [41, 38], null);
      P.gear(g, 41, 28, (beat * Math.PI) / 12);
      handAt(g, p, H.pinch, [41, 37], true);
    },
  },
  {
    id: "code-markup",
    label: "marks up a printout in red pen",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["work", "explain", "think"],
    faces: ["focused", "thinking"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const ring = at([0, 1, 2, 3, 4, 4], beat);
      lowL(g, p, [14, 50], null);
      P.codeSheet(g, 12, 36, ring, beat === 5);
      handAt(g, p, H.side, [12, 49]);
      // The pen follows the ring round line three, then ticks the margin.
      const tips: Pt[] = [[15, 40], [21, 40], [24, 42], [18, 44], [14, 42], [24, 48]];
      const [tx, ty] = at(tips, beat);
      lowR(g, p, [tx + 6, ty + 6], H.pinch);
      P.pen(g, tx + 4, ty + 3, tx, ty, "#3a3d46", P.RED);
    },
  },
  {
    id: "chalk-write",
    label: "writes on the chalkboard",
    arms: { left: true, right: false },
    beats: 8,
    ms: 260,
    tags: ["explain", "work"],
    faces: ["focused", "talking"],
    who: ["paul"],
    behind: (g, _p, beat) => {
      P.chalkboard(g, 36, 4, 12, 36);
      const strokes: [number, number, number][] = [[39, 14, 6], [39, 18, 4], [41, 22, 5], [39, 26, 7]];
      P.chalkLines(g, strokes, at([1, 1, 2, 2, 3, 3, 4, 4], beat));
    },
    draw: (g, p, beat) => {
      const spots: Pt[] = [[44, 15], [45, 14], [42, 19], [43, 18], [45, 23], [46, 22], [44, 27], [46, 26]];
      const [hx, hy] = at(spots, beat);
      upR(g, p, [4, 37], [hx - 2, hy + 6], H.pinch, true);
      P.chalkStick(g, hx - 4, hy);
    },
  },
  {
    id: "laptop-mug",
    label: "carries his laptop and a coffee",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["work", "idle", "wait"],
    faces: ["pleased", "focused"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const { L, R } = shoulders(p);
      // The laptop rests on his forearm, open towards you, training something overnight.
      lowL(g, p, [L + 12, 50], null);
      P.laptopOpen(g, L + 2, 37, (sx, sy) => P.trainingScreen(g, sx, sy, (beat + 1) / 6));
      handAt(g, p, ["SSSSs", "SSSSs", ".SSs."], [L + 13, 50]);
      // The coffee, held up by his shoulder.
      upR(g, p, [3, 48], [R + 4, 40], null);
      P.mug(g, R - 3, 32);
      handAt(g, p, ["SSs.", "SSSs", "SkSs", "SSSs", ".Ss."], [R + 4, 39]);
    },
  },
  {
    id: "loss-curve",
    label: "shows the loss curve going down",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["explain", "celebrate", "approve"],
    faces: ["proud", "pleased"],
    who: ["paul"],
    draw: (g, p, beat) => {
      lowL(g, p, [16, 48], null);
      lowR(g, p, [31, 48], null);
      P.tablet(g, 16, 37, (sx, sy) => P.lossCurve(g, sx, sy, at([2, 4, 6, 8, 11, 11], beat)));
      handAt(g, p, H.side, [16, 47]);
      handAt(g, p, H.side, [31, 47], true);
    },
  },
  {
    id: "pointer-stick",
    label: "points with a pointer stick",
    arms: { left: true, right: false },
    beats: 4,
    ms: 260,
    tags: ["explain"],
    faces: ["talking", "pleased"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const tap = at([0, 1, 0, 0], beat);
      const { R } = shoulders(p);
      upR(g, p, [3, 41], [R + 6, 36 - tap], null);
      P.pointerStick(g, R + 6, 33 - tap, 46, 8 - tap * 2);
      handAt(g, p, ["SSSs", "SkSs", "SSSs", ".Ss."], [R + 6, 35 - tap]);
    },
  },
  {
    id: "robot-hold",
    label: "shows off a little robot",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["explain", "celebrate", "idle"],
    faces: ["pleased", "proud"],
    who: ["paul"],
    draw: (g, p, beat) => {
      lowL(g, p, [19, 50], null);
      lowR(g, p, [29, 50], null);
      P.robot(g, 18, 34, beat);
      handAt(g, p, H.side, [19, 50]);
      handAt(g, p, H.side, [29, 50], true);
    },
  },
  {
    id: "paper-crown",
    label: "wears the gold paper crown and cheers",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["celebrate"],
    faces: ["laughing", "proud"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const { L, R } = shoulders(p);
      const up = at([0, 1, 0, 1], beat);
      P.paperCrown(g, 17, 0, beat);
      arm(g, p, [L + 1, 43], [L - 3, 37], [L - 2, 30 - up], "fist", true);
      arm(g, p, [R - 1, 43], [R + 3, 37], [R + 2, 30 - up], "fist");
    },
  },
  {
    id: "finger-count",
    label: "counts the points off on his fingers",
    arms: { left: true, right: false },
    beats: 8,
    ms: 260,
    tags: ["explain", "think"],
    faces: ["talking", "focused"],
    who: ["paul"],
    draw: (g, p, beat) => {
      const { R } = shoulders(p);
      const n = at([0, 0, 1, 1, 2, 2, 2, 2], beat);
      upR(g, p, [3, 38], [R + 3, 33], [H.one, H.two, H.three][n]!);
    },
  },
];

// ================================================================ Neil: racing cars and aerospace

const neil: GestureDef[] = [
  {
    id: "specs-push",
    label: "pushes his glasses up",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["think", "explain", "idle"],
    faces: ["focused", "thinking"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const f = at([0, 1, 2, 2, 1, 0], beat);
      if (f === 2) move(g, "glasses", 0, -1, () => [p.skin, "skin"]);
      const tip: Pt = f === 0 ? [36, 25] : [33, 21 - (f === 2 ? 1 : 0)];
      upR(g, p, [6, 35], [tip[0] + 6, tip[1] + 4], "point", true);
    },
  },
  {
    id: "rocket-launch",
    label: "launches a model rocket",
    arms: { left: true, right: false },
    beats: 12,
    ms: 260,
    tags: ["celebrate", "explain", "surprise", "work", "idle"],
    faces: ["excited", "pleased"],
    who: ["neil"],
    draw: (g, p, beat) => {
      upR(g, p, [5, 40], [41, 34], null);
      // Up it goes on its flame, out of the top, and back down on its parachute into his hand.
      const ys = [21, 20, 15, 7, -2, -14, -4, 2, 8, 13, 18, 21];
      const y = at(ys, beat);
      const lit = beat >= 1 && beat <= 5;
      const chute = beat >= 6 && beat <= 10;
      // Smoke billows out round his hand at liftoff, then trails and thins.
      if (beat === 2) P.puff(g, 34, 26, 3), P.puff(g, 43, 27, 2);
      if (beat === 3) P.puff(g, 34, 25, 3), P.puff(g, 44, 26, 2), P.puff(g, 39, 22, 1);
      if (beat === 4) P.puff(g, 35, 24, 2), P.puff(g, 44, 25, 1), P.puff(g, 38, 13, 2);
      if (beat === 5) P.puff(g, 38, 4, 3), P.puff(g, 40, 12, 1);
      if (chute) {
        P.put(g, [".ooooooo.", "oRRWWWRRo", "oRWWWWWRo", "o.......o"].map((r, i) => (i === 3 ? "o.......o" : r)), 37, y - 7, { R: P.RED, W: P.WHITE });
        P.line(g, 38, y - 4, 40, y, "#9aa0ab"), P.line(g, 44, y - 4, 42, y, "#9aa0ab");
      }
      if (y > -10) P.rocket(g, 38, y);
      if (lit) P.flame(g, 40, y + 10, beat, beat > 1);
      // An open hand while it's away, a cupped one when it's in it.
      handAt(g, p, beat >= 3 && beat <= 10 ? "open" : H.cup, [41, 33]);
    },
  },
  {
    id: "steering-wheel",
    label: "takes a corner on the racing wheel",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["work", "celebrate", "idle"],
    faces: ["determined", "focused"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const turn = at([0, 0.4, 0, -0.4], beat);
      const grip = P.steeringWheel(g, 24, 44, turn);
      lowL(g, p, [grip.left[0] + 1, grip.left[1] + 4], null);
      lowR(g, p, [grip.right[0] - 1, grip.right[1] + 4], null);
      P.steeringWheel(g, 24, 44, turn);
      handAt(g, p, "fist", [grip.left[0], grip.left[1] + 2]);
      handAt(g, p, "fist", [grip.right[0], grip.right[1] + 2], true);
    },
  },
  {
    id: "drone-fly",
    label: "flies his drone",
    arms: { left: false, right: false },
    beats: 8,
    ms: 130,
    tags: ["work", "idle", "wait"],
    faces: ["focused", "excited"],
    who: ["neil"],
    draw: (g, p, beat) => {
      lowL(g, p, [18, 50], null);
      lowR(g, p, [30, 50], null);
      P.droneController(g, 16, 39, beat >> 1);
      handAt(g, p, H.side, [17, 48]);
      handAt(g, p, H.side, [31, 48], true);
      P.drone(g, 34, at([3, 3, 2, 2, 3, 3, 4, 4], beat), beat);
    },
  },
  {
    id: "duck-hold",
    label: "holds up the rubber duck",
    arms: { left: true, right: false },
    beats: 4,
    ms: 390,
    tags: ["explain", "listen", "encourage"],
    faces: ["pleased", "curious"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const squeeze = at([0, 0, 1, 0], beat);
      upR(g, p, [4, 42], [41, 36], null);
      P.rubberDuck(g, 37, 25 + squeeze);
      handAt(g, p, squeeze ? ["S.....S", "SS...sS", "SSSSSSs", ".SSSSs."] : H.cup, [41, 35]);
    },
  },
  {
    id: "chequered-flag",
    label: "waves the chequered flag",
    arms: { left: true, right: false },
    beats: 4,
    ms: 260,
    tags: ["celebrate", "greet", "bye"],
    faces: ["excited", "laughing"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const lean = at([-3, -1, 1, -1], beat);
      upR(g, p, [4, 36], [40, 29], null);
      P.chequeredFlag(g, 40, 7, beat, lean, 30);
      handAt(g, p, "fist", [40, 28]);
    },
  },
  {
    id: "helmet-show",
    label: "holds up his karting helmet",
    arms: { left: true, right: false },
    beats: 4,
    ms: 390,
    tags: ["greet", "celebrate", "idle"],
    faces: ["proud", "pleased"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const up = at([0, 1, 1, 0], beat);
      upR(g, p, [4, 44], [41, 40 - up], null);
      P.helmet(g, 36, 28 - up, beat);
      handAt(g, p, H.cup, [41, 39 - up]);
    },
  },
  {
    id: "paper-plane",
    label: "throws a paper plane",
    arms: { left: true, right: false },
    beats: 8,
    ms: 260,
    tags: ["celebrate", "bye", "idle"],
    faces: ["excited", "pleased"],
    who: ["neil"],
    draw: (g, p, beat) => {
      const f = at([0, 1, 2, 3, 4, 5, 6, 7], beat);
      if (f === 0 || f === 7) {
        upR(g, p, [4, 39], [41, 33], H.pinch, true);
        P.paperPlane(g, 36, 27, true);
      } else if (f === 1) {
        upR(g, p, [6, 39], [44, 32], H.pinch, true);
        P.paperPlane(g, 39, 25, true, true);
      } else {
        upR(g, p, [3, 37], [39, 30], "open");
        const path: [number, number, boolean][] = [[36, 15, true], [26, 6, false], [14, 1, false], [2, 4, false], [-12, 0, false]];
        const [x, y, climb] = path[f - 2]!;
        if (x > -9) P.paperPlane(g, x, y, true, climb);
      }
    },
  },
  {
    id: "telemetry-read",
    label: "reads the telemetry on his tablet",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["work", "think", "explain"],
    faces: ["focused", "thinking"],
    who: ["neil"],
    draw: (g, p, beat) => {
      lowL(g, p, [14, 49], null);
      P.tablet(g, 12, 37, (sx, sy) => P.telemetry(g, sx, sy, beat));
      handAt(g, p, H.side, [12, 47]);
      const tap = at([0, 0, 1, 0], beat);
      lowR(g, p, [34 - tap, 47], "point");
    },
  },
];

// ================================================================ Riya: art

const riya: GestureDef[] = [
  {
    id: "paint-palette",
    label: "paints at her easel",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["work", "think", "idle"],
    faces: ["focused", "pleased"],
    who: ["riya"],
    behind: (g, _p, beat) => P.easel(g, 37, 16, beat + 1),
    draw: (g, p, beat) => {
      lowL(g, p, [17, 49], null);
      P.palette(g, 11, 40);
      handAt(g, p, ["SSSs", "SSSs", ".Ss."], [16, 48]);
      const tips: Pt[] = [[42, 19], [43, 21], [41, 25], [44, 27], [42, 23], [45, 20]];
      const [tx, ty] = at(tips, beat);
      const paint = [P.BLUE, P.YELLOW, P.GREEN, "#3e9a5c", "#2f7a48", P.PINK][beat % 6]!;
      upR(g, p, [4, 44], [tx - 4, ty + 9], H.pinch, true);
      P.brush(g, tx - 5, ty + 5, tx, ty, paint);
    },
  },
  {
    id: "stylus-draw",
    label: "draws on her tablet",
    arms: { left: false, right: false },
    beats: 8,
    ms: 260,
    tags: ["work", "think", "explain"],
    faces: ["focused", "pleased"],
    who: ["riya"],
    draw: (g, p, beat) => {
      lowL(g, p, [15, 49], null);
      // A heart, traced a few points a beat.
      const pts: Pt[] = [[5, 2], [4, 1], [3, 0], [2, 0], [1, 1], [1, 2], [2, 4], [3, 5], [4, 6], [5, 7], [6, 6], [7, 5], [8, 4], [9, 2], [9, 1], [8, 0], [7, 0], [6, 1]];
      const n = Math.round(((beat + 1) / 8) * pts.length);
      P.drawingTablet(g, 13, 37, (sx, sy) => pts.slice(0, n).forEach(([x, y]) => g.set(sx + 1 + x, sy + y, "#ff5a7a", "prop")));
      handAt(g, p, H.side, [13, 47]);
      const [px, py] = pts[Math.max(0, n - 1)]!;
      const tip: Pt = [16 + px, 39 + py];
      lowR(g, p, [tip[0] + 5, tip[1] + 7], H.pinch);
      P.stylus(g, tip[0] + 4, tip[1] + 4, tip[0], tip[1]);
    },
  },
  {
    id: "pixel-heart",
    label: "makes a finger heart",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["approve", "greet", "encourage"],
    faces: ["pleased", "proud"],
    who: ["riya"],
    draw: (g, p, beat) => {
      upR(g, p, [4, 39], [39, 34], H.heart);
      P.splats(g, [[38, 31, P.BLUE], [40, 32, P.PINK], [41, 36, P.YELLOW]]);
      const f = at([0, 1, 2, 3, 3, 0], beat);
      if (f === 1) P.heart(g, 39, 26, 1);
      if (f === 2) P.heart(g, 38, 24, 2);
      if (f === 3) P.heart(g, 38, 20 - (beat === 4 ? 1 : 0), 3);
    },
  },
  {
    id: "framed-print",
    label: "shows a framed print",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["celebrate", "explain", "approve"],
    faces: ["proud", "pleased"],
    who: ["riya"],
    draw: (g, p, beat) => {
      lowL(g, p, [16, 49], null);
      lowR(g, p, [31, 49], null);
      P.framedPrint(g, 15, 36, beat);
      handAt(g, p, H.side, [15, 48]);
      handAt(g, p, H.side, [32, 48], true);
    },
  },
  {
    id: "swatch-fan",
    label: "fans out her colour swatches",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["explain", "think", "work"],
    faces: ["pleased", "talking"],
    who: ["riya"],
    draw: (g, p, beat) => {
      lowR(g, p, [29, 50], null);
      P.swatchFan(g, 28, 45, at([0, 1, 2, 3, 3, 1], beat));
      handAt(g, p, "fist", [29, 49], true);
    },
  },
  {
    id: "camera-snap",
    label: "takes a photo",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["celebrate", "work", "idle"],
    faces: ["focused", "pleased"],
    who: ["riya"],
    draw: (g, p, beat) => {
      lowL(g, p, [16, 49], null);
      lowR(g, p, [31, 49], null);
      P.camera(g, 15, 37, beat === 3);
      handAt(g, p, H.side, [15, 47]);
      // A finger comes down on the shutter button.
      handAt(g, p, beat === 2 || beat === 3 ? ["..S.", ".SSs", "SSSs", "SkSs", "SSSs", ".Ss."] : H.side, [31, 47], true);
    },
  },
  {
    id: "pixel-canvas",
    label: "holds up a little pixel-art canvas",
    arms: { left: true, right: false },
    beats: 4,
    ms: 390,
    tags: ["celebrate", "explain", "greet"],
    faces: ["proud", "pleased"],
    who: ["riya"],
    draw: (g, p, beat) => {
      upR(g, p, [4, 44], [41, 37], null);
      P.pixelArt(g, 37, 23, beat === 2);
      handAt(g, p, H.cup, [41, 36]);
    },
  },
  {
    id: "splat-thumbs",
    label: "gives a paint-splattered thumbs up",
    arms: { left: true, right: false },
    beats: 4,
    ms: 390,
    tags: ["approve", "encourage"],
    faces: ["proud", "pleased"],
    who: ["riya"],
    draw: (g, p, beat) => {
      const up = at([0, 1, 0, 1], beat);
      P.tuckedBrush(g, 33, 12);
      upR(g, p, [4, 45], [40, 38 - up], "thumb", true);
      const y = 38 - up;
      P.splats(g, [[39, y - 2, P.BLUE], [41, y - 4, P.PINK], [40, y - 6, P.YELLOW], [38, y - 3, P.GREEN], [41, y + 2, P.PINK], [39, y + 4, P.BLUE], [42, y + 5, P.YELLOW]]);
    },
  },
  {
    id: "pencil-measure",
    label: "sizes it up with her pencil",
    arms: { left: true, right: false },
    beats: 6,
    ms: 390,
    tags: ["think", "work", "explain"],
    faces: ["focused", "thinking"],
    who: ["riya"],
    draw: (g, p, beat) => {
      // Arm out, pencil upright, her thumb sliding up it to mark the size.
      const t = at([0, 1, 2, 3, 3, 1], beat);
      upR(g, p, [4, 42], [41, 38], null);
      P.pencil(g, 40, 14, 34);
      handAt(g, p, [".SSs.", "SkkkS", "SSSSs", "SSSSs", ".SSs."], [41, 37]);
      for (const dy of [0, 1]) g.set(40, 31 - t - dy, dy ? p.skin : p.skinShade, "hand"), g.set(41, 31 - t - dy, p.skin, "hand");
      for (let y = 31 - t + 1; y <= 32; y++) g.set(39, y, p.skin, "hand");
    },
  },
];

// ================================================================ Yahya: data science

const yahya: GestureDef[] = [
  {
    id: "stopwatch-click",
    label: "clicks his stopwatch",
    arms: { left: true, right: false },
    beats: 8,
    ms: 260,
    tags: ["wait", "work", "tease"],
    faces: ["focused", "determined"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      upR(g, p, [4, 44], [42, 38], null);
      P.stopwatch(g, 38, 23, beat === 0 ? 0 : beat, beat === 0);
      handAt(g, p, H.cup, [42, 37]);
      // His thumb on the button.
      if (beat === 0) g.set(42, 23, p.skin, "hand"), g.set(43, 23, p.skinShade, "hand");
    },
  },
  {
    id: "double-peace",
    label: "makes a deadpan double peace sign",
    arms: { left: false, right: false },
    beats: 2,
    ms: 520,
    tags: ["celebrate", "approve", "tease"],
    faces: ["unimpressed", "smug"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      // His proud move, both hands, not a flicker on his face.
      const { L, R } = shoulders(p);
      const k = beat % 2;
      arm(g, p, [L + 1, 43], [L - 3, 38], [L - 2, 32 - k], "peace", true);
      arm(g, p, [R - 1, 43], [R + 3, 38], [R + 2, 32 - (1 - k)], "peace");
    },
  },
  {
    id: "bar-chart",
    label: "points at a bar chart as it grows",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["explain", "celebrate"],
    faces: ["smug", "talking"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      lowL(g, p, [13, 49], null);
      const grow = Math.min(1, (beat + 1) / 4);
      P.chartCard(g, 12, 37, [3, 5, 4, 7].map((h) => Math.round(h * grow)), grow === 1 ? 3 : -1);
      handAt(g, p, H.side, [12, 47]);
      lowR(g, p, [34, 46 - (beat >= 4 ? beat - 4 : 0)], "point");
    },
  },
  {
    id: "laptop-graph",
    label: "shows a graph on his laptop",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["explain", "work"],
    faces: ["focused", "pleased"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      lowL(g, p, [18, 50], null);
      lowR(g, p, [30, 50], null);
      P.laptopOpen(g, 16, 36, (sx, sy) => P.scatterScreen(g, sx, sy, at([3, 6, 10, 10, 10, 10], beat), at([0, 0, 0, 0.5, 1, 1], beat)), "silver");
      handAt(g, p, H.palm, [18, 50]);
      handAt(g, p, H.palm, [30, 50], true);
    },
  },
  {
    id: "dice-roll",
    label: "rolls a die",
    arms: { left: true, right: false },
    beats: 8,
    ms: 260,
    tags: ["tease", "think", "wait"],
    faces: ["determined", "smug"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      const f = at([0, 1, 2, 3, 4, 5, 6, 6], beat);
      if (f <= 1) return upR(g, p, [4, 45], [41 + f, 38], "fist");
      upR(g, p, [4, 45], [41, 38], null);
      if (f === 2) P.die(g, 39, 27, 3, true);
      if (f === 3) P.die(g, 39, 20, 2, true);
      if (f === 4) P.die(g, 39, 25, 5, true);
      if (f >= 5) P.die(g, 39, 30, 6);
      handAt(g, p, H.cup, [41, 37]);
    },
  },
  {
    id: "thermometer-read",
    label: "reads the weather station thermometer",
    arms: { left: true, right: false },
    beats: 6,
    ms: 390,
    tags: ["work", "think", "explain"],
    faces: ["focused", "curious"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      upR(g, p, [6, 36], [42, 26], null);
      P.thermometer(g, 39, 21, at([2, 3, 5, 7, 8, 8], beat));
      handAt(g, p, H.pinch, [42, 25], true);
    },
  },
  {
    id: "phone-time",
    label: "holds up his phone with his time on it",
    arms: { left: true, right: false },
    beats: 6,
    ms: 390,
    tags: ["tease", "celebrate"],
    faces: ["smug", "unimpressed"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      lowR(g, p, [35, 47], null);
      P.phoneTime(g, 17, 37, at(["0.00", "0.01", "0.02", "0.02", "0.02", "0.02"], beat), beat === 3 || beat === 5);
      handAt(g, p, H.side, [34, 45], true);
    },
  },
  {
    id: "wind-gauge",
    label: "holds up the weather station's wind gauge",
    arms: { left: true, right: false },
    beats: 6,
    ms: 130,
    tags: ["work", "explain", "wait"],
    faces: ["focused", "curious"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      upR(g, p, [4, 42], [41, 37], null);
      P.anemometer(g, 41, 18, beat, 15);
      handAt(g, p, "fist", [41, 36]);
    },
  },
  {
    id: "paper-tidy",
    label: "taps his papers into a neat stack",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "idle", "wait"],
    faces: ["focused", "pleased"],
    who: ["yahya"],
    draw: (g, p, beat) => {
      // Clean data: the stack goes from fanned out to square, tap, tap.
      const neat = at([0, 1, 2, 2, 2, 2], beat);
      const lift = at([0, 2, 0, 2, 0, 0], beat);
      lowL(g, p, [17, 50 - lift], null);
      lowR(g, p, [30, 50 - lift], null);
      P.paperStack(g, 18, 38 - lift, neat, beat === 2 || beat === 4);
      handAt(g, p, H.side, [17, 48 - lift]);
      handAt(g, p, H.side, [30, 48 - lift], true);
    },
  },
];

// ================================================================ Aaesha: cognitive systems

const aaesha: GestureDef[] = [
  {
    id: "memory-pairs",
    label: "finds a pair in the memory game",
    arms: { left: false, right: false },
    beats: 6,
    ms: 390,
    tags: ["think", "work", "celebrate"],
    faces: ["focused", "pleased"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      // Two cards turned, a match, then face down again for the next volunteer.
      const up = at([[false, false, false, false], [true, false, false, false], [true, false, false, true], [true, false, false, true], [true, false, false, true], [false, false, false, false]] as const, beat);
      lowL(g, p, [13, 50], null);
      P.memoryTray(g, 12, 37, [...up], beat === 3 || beat === 4);
      handAt(g, p, H.side, [12, 49]);
      const tip: Pt = at([[17, 43], [16, 41], [22, 47], [26, 49], [26, 49], [26, 49]] as const, beat);
      lowR(g, p, [tip[0] + 6, tip[1] + 3], "point", true);
    },
  },
  {
    id: "brain-model",
    label: "holds up a little model of a brain",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["explain", "think"],
    faces: ["curious", "pleased"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      lowR(g, p, [29, 50], null);
      P.brainModel(g, 22, 36, beat);
      handAt(g, p, H.cup, [28, 49]);
    },
  },
  {
    id: "test-pass",
    label: "runs her test until it goes green",
    arms: { left: false, right: false },
    beats: 8,
    ms: 390,
    tags: ["approve", "celebrate", "work"],
    faces: ["pleased", "focused"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      // She wrote the test first: red, then running, then green.
      const state = at(["fail", "fail", "run1", "run2", "run3", "pass", "pass", "pass"] as const, beat);
      lowL(g, p, [16, 49], null);
      P.tablet(g, 15, 37, (sx, sy) => P.testScreen(g, sx, sy, state));
      handAt(g, p, H.side, [15, 47]);
      const press = beat === 1;
      lowR(g, p, [31, press ? 48 : 50], press ? "point" : H.side, true);
    },
  },
  {
    id: "balance-weigh",
    label: "weighs up two options on a little balance",
    arms: { left: true, right: false },
    beats: 4,
    ms: 390,
    tags: ["think", "explain"],
    faces: ["thinking", "curious"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      // Held up in front of her by its ring, tipping one way, then the other.
      upR(g, p, [3, 47], [27, 40], null);
      P.handBalance(g, 24, 37, at([1, 0, -1, 0], beat));
      handAt(g, p, H.pinch, [26, 39], true);
    },
  },
  {
    id: "tally-click",
    label: "clicks her tally counter",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "wait", "listen"],
    faces: ["focused", "determined"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      // One more for the count, with her thumb.
      const n = at([7, 8, 8, 8, 9, 9], beat);
      const press = beat === 1 || beat === 4;
      // Low in front of her, her thumb on the plunger, counting volunteers.
      lowR(g, p, [28, 50], null);
      P.tallyCounter(g, 19, 37, n, press);
      handAt(g, p, ["S......S", "SS....sS", "SSSSSSSs", ".SSSSSs."], [27, 50]);
      for (const [dx, dy] of [[0, 0], [1, 0], [2, 1], [3, 2]] as const) g.set(24 + dx, (press ? 37 : 36) + dy, dx === 0 ? p.skinShade : p.skin, "hand");
    },
  },
  {
    id: "flashcards",
    label: "shuffles her flashcards",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "think", "wait"],
    faces: ["focused", "pleased"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      const colours = ["#ff7a6b", P.TEAL, P.GOLD];
      const f = beat % 6;
      lowL(g, p, [15, 50], null);
      P.cardStack(g, 12, 41, f >= 5 ? colours[1]! : colours[2]!);
      handAt(g, p, H.side, [13, 49]);
      // The top card goes up, over and back in at the bottom.
      const card: [number, number, boolean][] = [[12, 40, false], [14, 36, false], [20, 35, true], [24, 37, false], [17, 39, false], [12, 41, false]];
      const [cx, cy, thin] = card[f]!;
      if (f >= 1 && f <= 4) P.flashcard(g, cx, cy, colours[1]!, thin);
      const grip: Pt = f >= 1 && f <= 4 ? [cx + (thin ? 6 : 9), cy + 6] : [22, 47];
      lowR(g, p, grip, H.pinch);
    },
  },
  {
    id: "card-sort",
    label: "sorts her coloured cards",
    arms: { left: false, right: false },
    beats: 8,
    ms: 260,
    tags: ["work", "think", "explain"],
    faces: ["focused", "pleased"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      // Red, blue, yellow, green: blue goes to the end, and back again.
      const f = beat % 8;
      const slots = [14, 18, 22, 26];
      const rest = [P.RED, P.YELLOW, P.GREEN];
      const sorted = f >= 4 && f <= 5;
      lowL(g, p, [15, 50], null);
      const order = sorted ? [P.RED, P.YELLOW, P.GREEN, P.BLUE] : [P.RED, P.BLUE, P.YELLOW, P.GREEN];
      const lifted = f === 1 || f === 2 || f === 3 || f === 6 || f === 7;
      const liftX = [0, 18, 22, 26, 0, 0, 26, 20][f]!;
      if (lifted) {
        rest.forEach((c, i) => P.colourCard(g, slots[i]!, 40, c));
        P.colourCard(g, liftX, 35, P.BLUE);
      } else order.forEach((c, i) => P.colourCard(g, slots[i]!, 40, c));
      handAt(g, p, H.side, [14, 48]);
      const grip: Pt = lifted ? [liftX + 4, 38] : [33, 47];
      lowR(g, p, [grip[0] + 2, grip[1] + 3], H.pinch);
    },
  },
  {
    id: "neuron-net",
    label: "shows a little network firing",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["explain", "think"],
    faces: ["curious", "pleased"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      lowL(g, p, [16, 50], null);
      lowR(g, p, [31, 50], null);
      P.networkCard(g, 15, 37, at([0, 1, 2, 3, 3, 0], beat));
      handAt(g, p, H.side, [15, 48]);
      handAt(g, p, H.side, [32, 48], true);
    },
  },
  {
    id: "bangle-turn",
    label: "turns her gold bangle",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["idle", "wait", "listen"],
    faces: ["pleased", "neutral"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      lowR(g, p, [30, 41], "open", false);
      P.bangle(g, 30, 41, beat % 3);
      lowL(g, p, [26, 46], H.pinch, false);
    },
  },
  {
    id: "reaction-button",
    label: "hits the reaction-time button",
    arms: { left: true, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "wait", "think"],
    faces: ["determined", "focused"],
    who: ["aaesha"],
    draw: (g, p, beat) => {
      const light = at(["red", "red", "amber", "green", "green", "off"] as const, beat);
      const down = beat === 4;
      P.reactionBox(g, 14, 46, light, down);
      // Hovering over the button, then down on it the moment it goes green.
      lowR(g, p, [27, down ? 46 : 43], [".SSSSs.", "SSSSSSs", "SkSkSks", ".SSSSs."]);
    },
  },
];

// ================================================================ Caitlin: games, music, food, everything else

const caitlin: GestureDef[] = [
  {
    id: "guitar-strum",
    label: "strums her guitar",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["celebrate", "idle", "wait"],
    faces: ["pleased", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      const down = at([0, 1, 0, 1], beat);
      P.guitar(g, 7, 39, down === 0);
      upR(g, p, [5, 44], [38, 37], "grip");
      lowL(g, p, [17, 47 + down * 2], "fist");
    },
  },
  {
    id: "button-mash",
    label: "button-mashes a game controller",
    arms: { left: false, right: false },
    beats: 4,
    ms: 130,
    tags: ["work", "idle", "celebrate"],
    faces: ["determined", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      lowL(g, p, [17, 50], null);
      lowR(g, p, [30, 50], null);
      P.gameController(g, 15, 40, beat);
      handAt(g, p, H.side, [16, 49 - (beat % 2)]);
      handAt(g, p, H.side, [31, 49 - ((beat + 1) % 2)], true);
    },
  },
  {
    id: "cupcake-tray",
    label: "holds out a tray of cupcakes",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["greet", "celebrate", "encourage"],
    faces: ["pleased", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      const up = at([0, 1, 1, 0], beat);
      lowL(g, p, [14, 50 - up], null);
      lowR(g, p, [34, 50 - up], null);
      P.cupcakeTray(g, 12, 40 - up, beat);
      handAt(g, p, H.cup, [14, 49 - up]);
      handAt(g, p, H.cup, [34, 49 - up], true);
    },
  },
  {
    id: "board-game",
    label: "shows off a board game",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["greet", "explain", "celebrate"],
    faces: ["excited", "mischievous"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      lowL(g, p, [16, 50], null);
      lowR(g, p, [31, 50], null);
      P.boardGame(g, 16, 37, beat === 2 || beat === 3);
      handAt(g, p, H.side, [16, 48]);
      handAt(g, p, H.side, [31, 48], true);
    },
  },
  {
    id: "quiz-card",
    label: "reads out a quiz card",
    arms: { left: true, right: false },
    beats: 6,
    ms: 390,
    tags: ["explain", "tease", "think"],
    faces: ["mischievous", "talking"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      upR(g, p, [4, 43], [41, 37], null);
      P.quizCard(g, 37, 22, at(["back", "back", "thin", "front", "front", "thin"] as const, beat));
      handAt(g, p, H.pinch, [41, 36], true);
    },
  },
  {
    id: "selfie-peace",
    label: "takes a selfie",
    arms: { left: false, right: false },
    beats: 4,
    ms: 390,
    tags: ["celebrate", "greet"],
    faces: ["excited", "pleased"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      upR(g, p, [6, 36], [42, 24], null);
      P.phoneBack(g, 39, 11, beat === 2);
      handAt(g, p, "fist", [42, 23]);
      upL(g, p, [4, 38], [7, 32], "peace");
    },
  },
  {
    id: "headphone-groove",
    label: "grooves along with her headphones on",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["celebrate", "idle", "wait"],
    faces: ["pleased", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      // One hand pressing a cup to her ear, the other keeping the beat; notes off the other cup.
      P.headphones(g);
      upR(g, p, [6, 33], [36, 25], ["SSSs", "SSSs", "SkSs", "SSSs", ".Ss."], true);
      const k = at([0, 2, 0, 2], beat);
      upL(g, p, [4, 40], [8, 34 - k], ["..S..", "..S..", ".SSs.", "SkkkS", "SSSSs", ".SSs."]);
      const notes: [number, number][] = [[3, 16], [1, 10], [4, 5], [1, 0]];
      const [nx, ny] = notes[beat % 4]!;
      P.note(g, nx, ny, beat % 2 ? P.YELLOW : P.WHITE);
    },
  },
  {
    id: "arcade-stick",
    label: "plays on the arcade stick",
    arms: { left: false, right: false },
    beats: 4,
    ms: 130,
    tags: ["work", "idle", "celebrate"],
    faces: ["determined", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      const lean = at([-1, 1, -1, 1], beat);
      const hit = at([0, 1, 2, 1], beat);
      // Fingers round the shaft under the ball, the other hand slapping the buttons.
      const top = P.arcadePanel(g, 7, 45, lean, hit);
      lowL(g, p, [top[0], top[1] + 6], ["SSSSs", "SkkkS", "SSSSs", ".SSs."]);
      P.arcadeBall(g, top);
      lowR(g, p, [27 + hit * 5, hit === 1 ? 45 : 43], H.slap);
    },
  },
  {
    id: "controller-victory",
    label: "holds her controller up in victory",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["celebrate"],
    faces: ["laughing", "excited"],
    who: ["caitlin"],
    draw: (g, p, beat) => {
      const up = at([0, 1, 0, 1], beat);
      upR(g, p, [4, 37], [41, 30 - up], null);
      P.put(g, [".oooooooooo.", "oCCDCCCCYCCo", "oCDDDCCBCRCo", "oCCDCCCCGCCo", ".oCCo..oCCo.", "..oo....oo.."], 35, 21 - up, { C: "#7d5ad8", D: "#2a2440", Y: P.YELLOW, B: P.BLUE, R: P.RED, G: P.GREEN });
      handAt(g, p, "fist", [41, 29 - up]);
      upL(g, p, [3, 37], [9, 31 - (1 - up)], "fist");
    },
  },
];

defineGestures([...paul, ...neil, ...riya, ...yahya, ...aaesha, ...caitlin]);

