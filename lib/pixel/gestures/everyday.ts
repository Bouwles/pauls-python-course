// Everyday gestures anyone can make: waves, shrugs, claps, a sip of coffee, a look at the phone.
// Each is a real loop of several beats. People stand still and level throughout: only their arms,
// hands and what they hold move.
//
// Points are given for the arm on the viewer's right (the character's left arm) and mirrored for
// the other, so both sides of a two-handed gesture match. Hand patterns are drawn for that side
// too: S skin, s shade, k a crease between fingers, o a dark line.
import { limb, M, mix, OUTLINE, shoulders, sleeveOf, type Grid, type Pt } from "../kit";
import type { PersonLook } from "../people";
import * as P from "../props";
import { defineGestures, type GestureDef } from "./registry";

// ---------------------------------------------------------------- arms and hands

type Side = 1 | -1; // 1: the viewer's right (the character's left arm); -1: the viewer's left

/** A column on the given side: x as drawn for the right, mirrored for the left. */
const X = (s: Side, x: number) => (s === 1 ? x : M(x));
const at = (s: Side, [x, y]: Pt): Pt => [X(s, x), y];

/** The shoulder's outer column on the viewer's right, and where a lifted arm leaves the body. */
function frame(p: PersonLook) {
  const { R } = shoulders(p);
  return { R, joint: [R - 1, 43] as Pt };
}

/**
 * An arm from the shoulder through each point, three pixels of sleeve, ending in a cuff across the
 * last segment: "h" a cuff lying across a vertical forearm, "v" across a level one.
 */
function sleeve(g: Grid, p: PersonLook, s: Side, pts: Pt[], cuff: "h" | "v" | "none" = "h") {
  const c = sleeveOf(p);
  const ps = pts.map((q) => at(s, q));
  for (let i = 0; i + 1 < ps.length; i++) limb(g, c, ps[i]!, ps[i + 1]!);
  const [wx, wy] = ps[ps.length - 1]!;
  const cc = mix(c, "#000000", 0.22);
  if (cuff === "h") for (let d = -1; d <= 1; d++) g.set(wx + d, wy, cc, "arm");
  if (cuff === "v") for (let d = -1; d <= 1; d++) g.set(wx, wy + d, cc, "arm");
}

/** A hand from a pattern, its top-left at (x, y) as drawn on the viewer's right; mirrored on the left. */
function paw(g: Grid, p: PersonLook, s: Side, rows: string[], [x, y]: Pt, lit = false) {
  const knuckle = mix(p.skinShade, "#3a2016", 0.35);
  // A hand over the face catches more light than the face behind it, so it stands apart.
  const skin = lit ? mix(p.skin, "#ffffff", 0.14) : p.skin;
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      const c = ch === "S" ? skin : ch === "s" ? p.skinShade : ch === "k" ? knuckle : ch === "o" ? OUTLINE : ch === "n" ? mix(p.skin, "#ffffff", 0.22) : null;
      if (c) g.set(s === 1 ? x + rx : M(x + rx), y + ry, c, "hand");
    }),
  );
}

/** Regions the outline pass doesn't edge a hand against: edge the hands and arms against them here. */
const FACE_PARTS = new Set(["eye", "mouth", "brow", "glasses", "cap", "accessory", "hairBack", "ear"]);
function rimFace(g: Grid, also: string[] = []) {
  const over = new Set([...FACE_PARTS, ...also]);
  const hits: Pt[] = [];
  for (let y = 0; y < 52; y++)
    for (let x = 0; x < 48; x++) {
      const r = g.get(x, y);
      if (r !== "hand" && r !== "arm") continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (over.has(g.get(x + dx, y + dy) ?? "")) hits.push([x + dx, y + dy]);
    }
  for (const [x, y] of hits) g.c[y]![x] = OUTLINE;
}

/**
 * Draw something over arms or hands already there (a forearm over another, a hand over a sleeve)
 * and edge it against them, since the outline pass doesn't line an arm against an arm.
 */
function over(g: Grid, draw: () => void, against = ["arm", "hand"]) {
  const before = g.c.map((row) => [...row]);
  const regions = g.r.map((row) => [...row]);
  draw();
  const mine = (x: number, y: number) => g.c[y]![x] !== before[y]![x] || g.r[y]![x] !== regions[y]![x];
  const hits: Pt[] = [];
  for (let y = 0; y < 52; y++)
    for (let x = 0; x < 48; x++) {
      if (!mine(x, y)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx > 47 || ny > 51 || mine(nx, ny)) continue;
        if (against.includes(g.r[ny]![nx] ?? "")) hits.push([nx, ny]);
      }
    }
  for (const [x, y] of hits) g.c[y]![x] = OUTLINE;
}

/** Something of the person's own: the same pick for the same look, different across people. */
const pick = <T,>(p: PersonLook, list: T[]): T => list[[...(p.skin + p.hair + p.iris)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % list.length]!;
const MUGS = ["#e9e2d4", "#d8433a", "#3f6fd0", "#4cc36f", "#f2bb32", "#8c6bf2", "#1fb5a8", "#ff7a6b"];

/** A pen in the right hand with its tip at `tip`, the hand above and to the right of it. */
function writing(g: Grid, p: PersonLook, tip: Pt) {
  const { R, joint } = frame(p);
  const [tx, ty] = tip;
  sleeve(g, p, 1, [joint, [R + 1, 51], [tx + 7, ty + 3]], "v");
  paw(g, p, 1, ["..SSs", ".SkSS", "SSSSs", ".SSs."], [tx + 2, ty - 3]);
  P.pencil(g, [tx, ty], [tx + 6, ty - 6], false);
}

/** Two hands clapping in front of the chest: apart on even beats, together on odd ones. */
function clapping(g: Grid, p: PersonLook, beat: number) {
  const { R, joint } = frame(p);
  const shut = beat % 2 === 1;
  for (const s of [1, -1] as Side[]) {
    const hx = shut ? 24 : 27;
    sleeve(g, p, s, [joint, [R + 1, 51], [hx + 2, 47]], "v");
    paw(g, p, s, H.blade, [hx, 40]);
  }
  // Impact lines flicking out from the fingertips.
  if (shut) for (const s of [1, -1] as Side[]) P.mark(g, beat % 4 === 1 ? ["W.", ".W"] : ["W..", ".W.", "..."], [X(s, 29) - (s === 1 ? 0 : 1), 37], { W: "#fff3b0" }, "#c89a2a", s === -1);
}

/** Keyframes: which pose each beat shows. */
const K = (list: number[]) => (beat: number) => list[beat % list.length]!;

// Hand patterns, drawn for the viewer's right side (the character's left hand).
const H = {
  // Palm out, fingers spread, the thumb out towards the face.
  palm: ["....S.S..", "..S.S.S..", "..S.S.S.S", "..S.S.S.S", "S.SSSSSSS", "SSSSSSSSs", ".SSSSSSSs", "..SSSSSs.", "...SSSs.."],
  // A smaller open hand.
  palmS: ["...S.S.", ".S.S.S.", ".S.S.SS", "SSSSSSs", "SSSSSSs", ".SSSSs.", "..SSs.."],
  // Palm out, fingers together and straight up: stop, a high five.
  stop: ["..S.S.S.", "..S.S.S.", ".SS.S.S.", ".SSSSSSS", "SSSSSSSs", "SSSSSSSs", "SSSSSSSs", ".SSSSSs."],
  // A fist, knuckles towards us.
  fist: [".SSSS.", "SSSSSS", "SkkkkS", "SSSSSs", "SsssSs", ".SSSs."],
  // A fist, the thumb up.
  thumb: [".SS...", ".SS...", ".SS...", "SSSSS.", "SkkkSs", "SSSSSs", "SkkkSs", ".SSSs."],
  // The index finger up.
  finger: [".SS..", ".SS..", ".SS..", ".SSSs", "SSSSs", "SkkSs", "SSSSs", ".SSs."],
  // Two fingers up in a V, palm out, the thumb folded across.
  peace: ["S...S", "S...S", ".S.S.", ".SSS.", "SSSSs", "kkSSs", "SSkSs", ".SSs."],
  // Thumb and finger in a ring, three fingers up.
  ok: ["...S.S..", "...S.S.S", ".SSS.S.S", "S..SSSSS", "S..SSSSs", ".SSSSSs.", "..SSSs.."],
  // A finger gun aimed up and out, the thumb cocked.
  gunUp: ["......SS", ".....SSs", "..S.SSs.", ".SSSSs..", "SSSSs...", "SkkSs...", "SSSs....", ".SS....."],
  // Palm up, fingers out to the right, the thumb up at the near end.
  palmUp: ["S.......", "SS....SS", "SSSSSSSs", "kSSSSSSs", ".ssssss."],
  // A hand seen edge-on, fingers up, for a clap.
  blade: [".SS.", "SSSs", "SSSs", "SSSs", "SSSs", "kSSs", ".Ss."],
  // Two palms pressed together, fingers up.
  pray: ["..Ss..", ".SSss.", ".SSos.", "SSSoss", "SSSoss", "SSSoss", "kSSosk", ".SSos.", "..So.."],
  // The back of a hand over a mouth, fingers pointing left.
  cover: ["SSSSSSs.", "kkkkSSSs", "SSSSSSSs", "kkkSSSSs", ".SSSSSs."],
  // A flat hand, fingers pointing left: at a brow, shading the eyes.
  flat: ["SSSSSSs.", "kkkkSSSs", "SSSSSSSs", "....SSs."],
  // A palm on a cheek or a temple, fingers up.
  cheek: [".S.S.", ".S.S.", "SSSSs", "SSSSs", "SSSSs", "SSSSs", ".SSs."],
  // A big palm over the eyes, fingers up.
  facepalm: ["..S.S.S..", ".SS.S.S.S", ".SSSSSSSS", "SSSSSSSSs", "SSSSSSSSs", ".SSSSSSs.", "..SSSSs..", "...SSs..."],
  // Fingers curled on the head, scratching.
  claw: ["S.S.S.", "SSSSS.", "SSSSSs", "SkkkSs", ".SSSs."],
  clawUp: [".S.S.S", "SSSSSS", "SSSSSs", "SkkkSs", ".SSSs."],
  // The index finger pointing out at you, down and to the left.
  you: ["....SSs", "...SkkS", "..SSSSs", ".SSSSs.", "SS.ss..", "S......"],
  // Thumb and finger round the chin.
  pinch: ["S...S", "SS.SS", "SSSSs", ".SSs."],
  // A long finger up, for a shush.
  fingerLong: [".SS..", ".SS..", ".SS..", ".SS..", ".SSSs", "SSSSs", "SkkSs", "SSSSs", ".SSs."],
  // Three fingers up, for counting.
  three: ["S.S.S.", "S.S.S.", "S.S.S.", "SSSSS.", "SSSSSs", "SkkSSs", "SSSSs.", ".SSs.."],
  // Two fingers crossed.
  crossed: ["..SS.", ".S.S.", ".SS..", ".SSS.", "SSSSs", "SkkSs", "SSSSs", ".SSs."],
  // A fist, the thumb out to the right: over the shoulder, behind me.
  thumbBack: [".SSSs...", "SkkkSSSS", "SSSSSSSs", "SkkkS...", "SSSSs...", ".SSs...."],
  // A fist, the thumb down.
  thumbDown: [".SSSs.", "SkkkSs", "SSSSSs", "SkkkSs", "SSSSS.", ".SS...", ".SS...", ".SS..."],
  // Fingers round the right-hand side of something held.
  grip: ["SSs", "kkS", "SSs", "kkS", "SS."],
  // Two hands in a heart, the gap in the middle heart-shaped.
  heartRing: [".SS...SS.", "SSSS.SSSS", "SS.SSS.SS", "SS.....SS", ".SS...SS.", "..SS.SS..", "...SSS...", "....S...."],
  // Two fingers up for air quotes, straight and then bent.
  quote: ["S.S", "S.S", "SSS", "SSs", "SSs", ".s."],
  quoteBent: ["...", "SSS", "S.S", "SSs", "SSs", ".s."],
  // A fist knuckles-first towards you, for a bump or a knock.
  knuckles: [".SSSSS.", "SkSkSkS", "SSSSSSs", "SkkkkSs", "SSSSSSs", ".SSSSs."],
  // The index finger pointing in at the chest: me?
  pointIn: [".....SSs", "SSSSSSSs", "....SkkS", "....SSSs", ".....SS."],
  // Palm up, a finger raised and then curled, fingers towards the middle.
  comeUp: [".S....", ".S....", ".SS...", "sSSSSS", "sSSSSk", ".ssss."],
  comeCurl: ["......", ".SS...", "S.S...", "sSSSSS", "sSSSSk", ".ssss."],
  // A hand cupped behind the right ear, open towards it.
  cupEarL: ["SSS.", "..SS", "...S", "...S", "..SS", "sSS.", "sS.."],
};

// ---------------------------------------------------------------- the gestures

const LIST: GestureDef[] = [
  {
    id: "wave-both",
    label: "waves with both hands",
    arms: { left: false, right: false },
    beats: 6,
    ms: 140,
    tags: ["greet", "bye", "celebrate"],
    faces: ["excited", "pleased", "laughing"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const sway = [0, 1, 2, 1, 0, -1];
      for (const s of [1, -1] as Side[]) {
        const d = sway[(beat + (s === 1 ? 0 : 3)) % 6]!;
        sleeve(g, p, s, [joint, [R + 4, 38], [R + 4 + d, 31]]);
        paw(g, p, s, H.palm, [R + d, 22]);
      }
    },
  },
  {
    id: "wave-small",
    label: "gives a little wave",
    arms: { left: true, right: false },
    beats: 6,
    ms: 150,
    tags: ["greet", "bye"],
    faces: ["pleased", "embarrassed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = [0, 1, 2, 1, 0, 1][beat % 6]!;
      // The elbow stays down; the hand waggles by the jaw.
      sleeve(g, p, 1, [joint, [R + 2, 50], [R + 1 + d, 37]]);
      paw(g, p, 1, H.palmS, [R - 2 + d, 30]);
    },
  },
  {
    id: "salute",
    label: "salutes",
    arms: { left: true, right: false },
    beats: 6,
    ms: 170,
    tags: ["greet", "approve", "bye"],
    faces: ["determined", "proud"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 1, 1, 1, 2])(beat);
      if (k === 0) {
        // On the way up.
        sleeve(g, p, 1, [joint, [R + 5, 37], [R + 1, 28]], "v");
        paw(g, p, 1, H.flat, [R - 6, 26], true);
      } else {
        // Fingers to the brow, the elbow out; then a small flick away.
        const off = k === 2 ? 2 : 0;
        sleeve(g, p, 1, [joint, [R + 6, 32 - off], [R + 1 + off, 21 - off]], "v");
        paw(g, p, 1, H.flat, [R - 6 + off, 18 - off], true);
      }
      rimFace(g);
    },
  },
  {
    id: "shrug",
    label: "shrugs",
    arms: { left: false, right: false },
    beats: 4,
    ms: 230,
    tags: ["confuse", "tease"],
    faces: ["confused", "smug", "unimpressed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const up = K([0, 1, 2, 1])(beat);
      for (const s of [1, -1] as Side[]) {
        sleeve(g, p, s, [joint, [R, 50], [R + 3, 46 - up]], "v");
        paw(g, p, s, H.palmUp, [R + 2, 42 - up]);
      }
    },
  },
  {
    id: "arms-crossed",
    label: "folds their arms",
    arms: { left: true, right: true },
    beats: 4,
    ms: 420,
    tags: ["wait", "tease", "listen"],
    faces: ["unimpressed", "smug", "determined"],
    draw: (g, p, beat) => {
      const { R } = frame(p);
      const L = M(R);
      const c = sleeveOf(p);
      const tap = beat % 2;
      // The left forearm underneath, from the right elbow across to the left arm, and its hand
      // round the right upper arm.
      limb(g, c, [R - 2, 50], [L + 4, 48]);
      limb(g, c, [R - 2, 51], [L + 4, 49]);
      // The right forearm over it, from the left elbow up across to the right arm, its hand tucked
      // under the left arm.
      over(g, () => {
        limb(g, c, [L + 2, 49], [R - 4, 44]);
        limb(g, c, [L + 2, 50], [R - 4, 45]);
      });
      // The left hand's fingers on the right upper arm, one tapping.
      over(g, () => paw(g, p, -1, tap ? ["SSs", "kkS", "SSs", ".Ss"] : ["SSs", "SSs", "kkS", "SSs"], [R - 2, 44]));
    },
  },
  {
    id: "hands-on-hips",
    label: "stands with hands on hips",
    arms: { left: false, right: false },
    beats: 4,
    ms: 380,
    tags: ["wait", "approve", "tease"],
    faces: ["proud", "determined", "smug"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const out = K([0, 0, 1, 0])(beat);
      // Elbows out, hands down at the hips below the frame.
      for (const s of [1, -1] as Side[]) sleeve(g, p, s, [joint, [R + 6 + (s === 1 ? out : 0), 46], [R + 1, 52]], "none");
    },
  },
  {
    id: "facepalm",
    label: "puts a hand over their eyes",
    arms: { left: true, right: false },
    beats: 4,
    ms: 360,
    tags: ["worry", "tease", "sad"],
    faces: ["annoyed", "embarrassed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const dy = K([0, 1, 1, 2])(beat);
      sleeve(g, p, 1, [joint, [R + 2, 51], [R - 9, 26 + dy]], "h");
      paw(g, p, 1, H.facepalm, [R - 14, 17 + dy], true);
      rimFace(g);
    },
  },
  {
    id: "scratch-head",
    label: "scratches their head",
    arms: { left: true, right: false },
    beats: 6,
    ms: 120,
    tags: ["confuse", "think", "worry"],
    faces: ["confused", "embarrassed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = beat % 2;
      sleeve(g, p, 1, [joint, [R + 6, 32], [R + 1 - k, 15]], "h");
      paw(g, p, 1, k ? H.clawUp : H.claw, [R - 3 - k, 10]);
      if (beat >= 2) P.question(g, [R + 4, beat >= 4 ? 0 : 1]);
    },
  },
  {
    id: "clap",
    label: "claps",
    arms: { left: false, right: false },
    beats: 4,
    ms: 140,
    tags: ["celebrate", "approve", "encourage"],
    faces: ["laughing", "pleased", "excited"],
    draw: clapping,
  },
  {
    id: "fist-pump",
    label: "pumps a fist",
    arms: { left: true, right: false },
    beats: 4,
    ms: 170,
    tags: ["celebrate", "encourage"],
    faces: ["excited", "determined"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const down = K([0, 1, 2, 1])(beat);
      // Up by the shoulder, then pulled down hard to the chest.
      const pose: [Pt, Pt][] = [
        [[R + 4, 37], [R + 3, 30]],
        [[R + 3, 44], [R + 2, 36]],
        [[R + 2, 49], [R - 1, 41]],
      ];
      const [elbow, wrist] = pose[down]!;
      sleeve(g, p, 1, [joint, elbow, wrist], "h");
      paw(g, p, 1, H.fist, [wrist[0] - 3, wrist[1] - 6]);
    },
  },
  {
    id: "thumbs-both",
    label: "gives two thumbs up",
    arms: { left: false, right: false },
    beats: 4,
    ms: 230,
    tags: ["approve", "encourage", "celebrate"],
    faces: ["proud", "pleased", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const up = K([0, 1, 1, 0])(beat);
      for (const s of [1, -1] as Side[]) {
        sleeve(g, p, s, [joint, [R + 2, 50], [R - 1, 42 - up]], "h");
        paw(g, p, s, H.thumb, [R - 4, 34 - up]);
      }
    },
  },
  {
    id: "peace",
    label: "makes a peace sign",
    arms: { left: true, right: false },
    beats: 4,
    ms: 260,
    tags: ["greet", "bye", "celebrate"],
    faces: ["pleased", "mischievous"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 0, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 48], [R + 1 + k, 35]], "h");
      paw(g, p, 1, H.peace, [R - 1 + k, 27]);
    },
  },
  {
    id: "ok-sign",
    label: "makes an OK sign",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["approve", "encourage"],
    faces: ["pleased", "smug"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 1, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 48], [R + 1, 36 - k]], "h");
      paw(g, p, 1, H.ok, [R - 3, 29 - k]);
    },
  },
  {
    id: "finger-guns",
    label: "does finger guns",
    arms: { left: false, right: false },
    beats: 4,
    ms: 170,
    tags: ["tease", "approve", "greet"],
    faces: ["smug", "mischievous", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        // One hand then the other "fires", kicking up.
        const kick = (s === 1 ? beat : beat + 2) % 4 === 1 ? 1 : 0;
        sleeve(g, p, s, [joint, [R + 1, 50], [R - 1, 42 - kick]], "h");
        paw(g, p, s, H.gunUp, [R - 3, 34 - kick * 2]);
      }
    },
  },
  {
    id: "rub-neck",
    label: "rubs the back of their neck",
    arms: { left: true, right: false },
    beats: 4,
    ms: 220,
    tags: ["worry", "confuse", "sad"],
    faces: ["embarrassed", "nervous"],
    // The forearm reaches behind the head to the neck.
    behind: (g, p, beat) => {
      const { R } = frame(p);
      const d = K([0, 1, 2, 1])(beat);
      limb(g, sleeveOf(p), [R + 6, 30 - d], [R - 8, 26]);
    },
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 2, 1])(beat);
      sleeve(g, p, 1, [joint, [R + 6, 30 - d]], "none");
    },
  },
  {
    id: "stroke-chin",
    label: "strokes their chin",
    arms: { left: true, right: false },
    beats: 4,
    ms: 320,
    tags: ["think", "listen"],
    faces: ["thinking", "curious"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 2, 1])(beat);
      sleeve(g, p, 1, [joint, [R + 1, 51], [26, 37 + d]], "h");
      paw(g, p, 1, H.pinch, [22, 31 + d], true);
      rimFace(g);
    },
  },
  {
    id: "tap-temple",
    label: "taps their temple",
    arms: { left: true, right: false },
    beats: 4,
    ms: 180,
    tags: ["think", "tease", "explain"],
    faces: ["smug", "thinking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const off = beat % 2;
      sleeve(g, p, 1, [joint, [R + 5, 42], [R + 1 + off, 26]], "h");
      paw(g, p, 1, H.finger, [R - 2 + off, 18]);
      rimFace(g);
    },
  },
  {
    id: "point-at-you",
    label: "points at you",
    arms: { left: true, right: false },
    beats: 4,
    ms: 200,
    tags: ["explain", "encourage", "tease"],
    faces: ["pleased", "determined", "smug"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const jab = K([0, 1, 0, 0])(beat);
      // Reaching out towards you, the finger aimed past the frame.
      sleeve(g, p, 1, [joint, [R + 3, 47], [R - 1 + jab, 41 + jab]], "v");
      paw(g, p, 1, H.you, [R - 9 + jab, 36 + jab]);
    },
  },
  {
    id: "idea",
    label: "has an idea",
    arms: { left: true, right: false },
    beats: 4,
    ms: 230,
    tags: ["think", "surprise", "explain"],
    faces: ["excited", "surprised"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      sleeve(g, p, 1, [joint, [R + 5, 37], [R + 3, 28]], "h");
      paw(g, p, 1, H.finger, [R + 1, 20]);
      P.bulb(g, [R + 3, 3], { frame: beat });
    },
  },
  {
    id: "hand-up",
    label: "puts a hand up",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["confuse", "listen", "wait"],
    faces: ["curious", "talking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 0, -1])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 31], [R + 3 + d, 19]], "h");
      paw(g, p, 1, H.stop, [R - 1 + d, 11]);
    },
  },
  {
    id: "stop-hand",
    label: "holds up a hand to stop",
    arms: { left: true, right: false },
    beats: 4,
    ms: 220,
    tags: ["worry", "wait", "explain"],
    faces: ["determined", "worried"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const push = K([0, 1, 1, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 49], [R - 2 - push, 39]], "h");
      paw(g, p, 1, H.stop, [R - 6 - push, 31 - push]);
    },
  },
  {
    id: "shush",
    label: "puts a finger to their lips",
    arms: { left: true, right: false },
    beats: 4,
    ms: 320,
    tags: ["tease", "listen", "wait"],
    faces: ["mischievous", "focused"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      sleeve(g, p, 1, [joint, [R + 1, 51], [25, 36]], "h");
      paw(g, p, 1, H.fingerLong, [22, 26], true);
      rimFace(g);
      // A soft "shh" either side.
      if (beat % 2) for (const s of [1, -1] as Side[]) P.mark(g, ["W.W"], [X(s, 30) - (s === 1 ? 0 : 2), 29], { W: "#ffffff" }, "#8a90a8");
    },
  },
  {
    id: "please",
    label: "puts their hands together",
    arms: { left: false, right: false },
    beats: 4,
    ms: 240,
    tags: ["encourage", "worry", "wait"],
    faces: ["worried", "nervous"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 1, 0])(beat);
      for (const s of [1, -1] as Side[]) sleeve(g, p, s, [joint, [R + 1, 51], [26, 44 - d]], "v");
      paw(g, p, 1, H.pray, [21, 35 - d]);
    },
  },
  {
    id: "cover-laugh",
    label: "laughs behind a hand",
    arms: { left: true, right: false },
    beats: 4,
    ms: 150,
    tags: ["tease", "celebrate"],
    faces: ["laughing", "embarrassed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = beat % 2;
      sleeve(g, p, 1, [joint, [R + 2, 51], [29, 32 + d]], "v");
      paw(g, p, 1, H.cover, [21, 27 + d], true);
      rimFace(g);
    },
  },
  {
    id: "cheeks-shock",
    label: "clasps their cheeks",
    arms: { left: false, right: false },
    beats: 4,
    ms: 170,
    tags: ["surprise", "worry"],
    faces: ["surprised", "nervous"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        const d = (beat + (s === 1 ? 0 : 1)) % 2;
        sleeve(g, p, s, [joint, [R + 1, 51], [31 + d, 32]], "h");
        paw(g, p, s, H.cheek, [29 + d, 25], true);
      }
      rimFace(g);
    },
  },
  {
    id: "mind-blown",
    label: "is mind blown",
    arms: { left: false, right: false },
    beats: 6,
    ms: 170,
    tags: ["surprise", "celebrate"],
    faces: ["surprised", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 0, 1, 2, 2, 1])(beat);
      for (const s of [1, -1] as Side[]) {
        if (k === 0) {
          // Fingertips at the temples...
          sleeve(g, p, s, [joint, [R + 5, 38], [R - 1, 26]], "h");
          paw(g, p, s, H.finger, [R - 4, 18]);
        } else {
          // ...then flung open as it all goes off.
          const w = k === 2 ? 2 : 0;
          sleeve(g, p, s, [joint, [R + 5, 36], [R + 4 + w, 26 - w]], "h");
          paw(g, p, s, H.palm, [R + w, 17 - w]);
        }
      }
      rimFace(g);
      if (k > 0) P.burst(g, [24, 6], { frame: k - 1, colour: "#ffd23a" });
      if (k === 2) P.sparkle(g, [9, 6], { frame: 2 }), P.sparkle(g, [38, 6], { frame: 1 });
    },
  },
  {
    id: "dance",
    label: "dances",
    arms: { left: false, right: false },
    beats: 8,
    ms: 200,
    tags: ["celebrate", "idle"],
    faces: ["laughing", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // Point up on one side, then the other, with the free fist at the chest; then both up.
      const up = K([1, 0, -1, 0, 1, 0, -1, 2])(beat);
      for (const s of [1, -1] as Side[]) {
        if (up === s || up === 2) {
          sleeve(g, p, s, [joint, [R + 4, 34], [R + 5, 22]], "h");
          paw(g, p, s, H.finger, [R + 3, 14]);
        } else if (up === 0) {
          sleeve(g, p, s, [joint, [R + 3, 48], [R - 3, 42]], "h");
          paw(g, p, s, H.fist, [R - 6, 36]);
        } else {
          sleeve(g, p, s, [joint, [R + 2, 49], [R + 3, 42]], "h");
          paw(g, p, s, H.fist, [R, 36]);
        }
      }
      P.note(g, [beat % 2 ? 4 : 40, 4 - (beat % 4 >> 1)], { flip: beat % 2 === 1 });
    },
  },
  {
    id: "stretch-yawn",
    label: "stretches and yawns",
    arms: { left: false, right: false },
    beats: 6,
    ms: 300,
    tags: ["idle", "wait"],
    faces: ["sleepy"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 1, 2, 3, 3])(beat);
      for (const s of [1, -1] as Side[]) {
        if (k <= 1) {
          // Arms up in a long stretch.
          sleeve(g, p, s, [joint, [R + 5, 30 - k], [R + 6, 15 - k * 2]], "h");
          paw(g, p, s, H.fist, [R + 3, 9 - k * 2]);
        } else if (k === 2 || s === -1) {
          sleeve(g, p, s, [joint, [R + 5, 40], [R + 4, 32]], "h");
          paw(g, p, s, H.fist, [R + 1, 26]);
        } else {
          // A hand over the yawn.
          sleeve(g, p, s, [joint, [R + 2, 51], [29, 33]], "v");
          paw(g, p, s, H.cover, [21, 27], true);
        }
      }
      rimFace(g);
    },
  },
  // ------------------------------------------------ with things in hand
  {
    id: "sip-mug",
    label: "sips from a mug",
    arms: { left: true, right: false },
    beats: 6,
    ms: 320,
    tags: ["idle", "listen", "wait", "work"],
    faces: ["relieved", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 0, 1, 2, 2, 1])(beat);
      // The mug, its handle in the hand: at the chest, on the way up, at the lips.
      const mugAt: Pt = [[25, 39], [23, 33], [20, 27]][k] as Pt;
      const [mx, my] = mugAt;
      P.mug(g, mugAt, { colour: pick(p, MUGS), frame: beat, steam: k === 0 });
      sleeve(g, p, 1, [joint, [R + 2, 51], [mx + 8, my + 7]], "h");
      paw(g, p, 1, H.grip, [mx + 6, my + 2], k === 2);
      rimFace(g);
    },
  },
  {
    id: "sip-coffee",
    label: "sips a coffee",
    arms: { left: true, right: false },
    beats: 6,
    ms: 320,
    tags: ["idle", "listen", "wait", "work"],
    faces: ["pleased", "relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 0, 1, 2, 2, 1])(beat);
      const cupAt: Pt = [[26, 37], [24, 32], [21, 26]][k] as Pt;
      const [cx, cy] = cupAt;
      P.coffeeCup(g, cupAt, { colour: pick(p, ["#b0814f", "#3f9634", "#c0483c", "#2f8fd8"]) });
      sleeve(g, p, 1, [joint, [R + 2, 51], [cx + 7, cy + 7]], "h");
      // Fingers round the cup's sleeve.
      paw(g, p, 1, ["SSSs", "kkSS", "SSSs", "kkSS", ".SSs"], [cx + 3, cy + 3], k === 2);
      rimFace(g);
    },
  },
  {
    id: "check-phone",
    label: "checks their phone",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["idle", "wait", "work"],
    faces: ["focused", "curious"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 0, 1, 0])(beat);
      const at: Pt = [26, 36 - d];
      // The screen's light on the face.
      P.glow(g, [28, 35], 6, "#cfe9ff", [0.22, 0.16, 0.26, 0.18][beat % 4]!);
      P.phone(g, at, { colour: pick(p, ["#2b2e38", "#c0483c", "#3f6fd0", "#e9e2d4"]) });
      sleeve(g, p, 1, [joint, [R + 2, 51], [31, 45 - d]], "h");
      paw(g, p, 1, ["SSs", "kkS", "SSs", "kkS", "SSs", ".S."], [30, 38 - d]);
    },
  },
  {
    id: "show-phone",
    label: "shows you their phone",
    arms: { left: true, right: false },
    beats: 4,
    ms: 280,
    tags: ["explain", "tease"],
    faces: ["excited", "talking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      sleeve(g, p, 1, [joint, [R + 4, 45], [R + 2, 36]], "h");
      P.phone(g, [R - 1, 26], { side: "screen", frame: beat });
      paw(g, p, 1, ["S...S", "SSSSs", "kSSSs", ".SSs."], [R, 32]);
    },
  },
  {
    id: "phone-call",
    label: "talks on the phone",
    arms: { left: false, right: false },
    beats: 4,
    ms: 360,
    tags: ["work", "wait", "explain"],
    faces: ["talking", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // The phone at the ear...
      P.phone(g, [33, 18], { colour: pick(p, ["#2b2e38", "#c0483c", "#3f6fd0", "#e9e2d4"]) });
      sleeve(g, p, 1, [joint, [R + 5, 40], [R + 1, 29]], "h");
      paw(g, p, 1, ["SSSs", "kkSS", "SSSs", "kkSs", ".SSs"], [34, 23]);
      // ...and the other hand talking.
      const k = K([0, 1, 0, 2])(beat);
      sleeve(g, p, -1, [joint, [R + 2, 50], [R - 1 + (k === 2 ? 1 : 0), 42]], "v");
      paw(g, p, -1, k === 1 ? H.palmUp : ["S.......", "SS......", "SSSSSSs.", "kSSSSSs.", ".sssss.."], [R - 2 + (k === 2 ? 1 : 0), 38]);
      rimFace(g);
    },
  },
  {
    id: "type-laptop",
    label: "types on a laptop",
    arms: { left: false, right: false },
    beats: 6,
    ms: 130,
    tags: ["work", "think"],
    faces: ["focused", "determined"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // Elbows bobbing as the hands type behind the lid.
      for (const s of [1, -1] as Side[]) {
        const d = (beat + (s === 1 ? 0 : 1)) % 2;
        sleeve(g, p, s, [joint, [R, 49 + d], [R - 6, 51 + d]], "none");
      }
      P.laptop(g, [14, 41], { frame: beat, sticker: pick(p, ["#ffb627", "#4cc36f", "#ef4a6a", "#8c6bf2", "#1fb5a8"]) });
    },
  },
  {
    id: "read-book",
    label: "reads a book",
    arms: { left: false, right: false },
    beats: 6,
    ms: 380,
    tags: ["work", "idle", "think"],
    faces: ["focused", "curious"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      P.book(g, [16, 39], { frame: K([0, 0, 0, 1, 3, 0])(beat), colour: pick(p, ["#c0483c", "#3f6fd0", "#3f9634", "#8c6bf2", "#e0a93a"]) });
      for (const s of [1, -1] as Side[]) {
        sleeve(g, p, s, [joint, [R + 1, 51], [34, 48]], "v");
        paw(g, p, s, ["SSs", "kSS", "SSs", "SS."], [31, 43]);
      }
    },
  },
  {
    id: "write-notes",
    label: "writes notes",
    arms: { left: false, right: false },
    beats: 8,
    ms: 220,
    tags: ["work", "listen", "think"],
    faces: ["focused", "thinking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const book: Pt = [13, 37];
      // The notebook in the left hand...
      sleeve(g, p, -1, [joint, [R + 1, 51], [R - 4, 49]], "v");
      P.notebook(g, book, { frame: beat, colour: pick(p, ["#3f6fd0", "#c0483c", "#3f9634", "#8c6bf2"]) });
      paw(g, p, -1, ["SSs", "kkS", "SSs", "Ss."], [R - 3, 44]);
      // ...the pen in the right, writing along the lines.
      writing(g, p, P.notebookTip(book, beat));
    },
  },
  {
    id: "tick-clipboard",
    label: "ticks things off a clipboard",
    arms: { left: false, right: false },
    beats: 6,
    ms: 260,
    tags: ["work", "approve"],
    faces: ["focused", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const done = K([0, 1, 1, 2, 2, 3])(beat);
      const board: Pt = [13, 37];
      sleeve(g, p, -1, [joint, [R + 1, 51], [R - 4, 49]], "v");
      P.clipboard(g, board, { frame: done });
      paw(g, p, -1, ["SSs", "kkS", "SSs", "Ss."], [R - 3, 44]);
      // The pen on the box being ticked, then lifted to the next.
      const box = beat % 2 ? Math.max(0, done - 1) : Math.min(done, 2);
      writing(g, p, [board[0] + 3 + (beat % 2), board[1] + 4 + box * 3]);
    },
  },
  {
    id: "magnify",
    label: "looks through a magnifying glass",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["think", "work", "surprise"],
    faces: ["curious", "focused"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 1, 0])(beat);
      const lens: Pt = [29 + d, 22];
      P.magnifier(g, lens, { eye: p.iris });
      sleeve(g, p, 1, [joint, [R + 3, 50], [lens[0] + 9, lens[1] + 13]], "h");
      paw(g, p, 1, H.grip, [lens[0] + 7, lens[1] + 8]);
    },
  },
  {
    id: "hold-sheet",
    label: "holds up a sheet of paper",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["explain", "celebrate", "approve"],
    faces: ["proud", "talking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 0, 0])(beat);
      P.paper(g, [R, 19 - d], { content: "chart" });
      sleeve(g, p, 1, [joint, [R + 4, 45], [R + 4, 35 - d]], "h");
      paw(g, p, 1, ["S.S..", "SSSSs", "kSSSs", "SSSs.", ".SS.."], [R + 2, 29 - d]);
    },
  },
  {
    id: "eat-sandwich",
    label: "eats a sandwich",
    arms: { left: true, right: false },
    beats: 6,
    ms: 300,
    tags: ["idle", "wait"],
    faces: ["pleased", "relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // A bite, then chewing; another bite, more chewing.
      const k = K([2, 0, 0, 2, 1, 1])(beat);
      const atMouth = k === 2;
      const at: Pt = atMouth ? [19, 27] : [24, 38];
      P.sandwich(g, at, { frame: atMouth ? 0 : k + 1 });
      sleeve(g, p, 1, [joint, [R + 2, 51], [at[0] + 10, at[1] + 7]], "h");
      paw(g, p, 1, ["SSs", "kkS", "SSs", "kkS", "SS."], [at[0] + 7, at[1] + 1], atMouth);
      rimFace(g);
    },
  },
  {
    id: "eat-apple",
    label: "eats an apple",
    arms: { left: true, right: false },
    beats: 6,
    ms: 300,
    tags: ["idle", "wait"],
    faces: ["pleased", "relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([2, 0, 0, 2, 1, 1])(beat);
      const atMouth = k === 2;
      const at: Pt = atMouth ? [20, 26] : [25, 37];
      P.apple(g, at, { frame: atMouth ? 0 : k + 1, colour: pick(p, ["#d83a34", "#6cc04a", "#d83a34"]) });
      sleeve(g, p, 1, [joint, [R + 2, 51], [at[0] + 8, at[1] + 9]], "h");
      paw(g, p, 1, ["SSs", "kkS", "SSs", "Ss."], [at[0] + 6, at[1] + 4], atMouth);
      rimFace(g);
    },
  },
  {
    id: "eat-noodles",
    label: "eats noodles from a box",
    arms: { left: false, right: false },
    beats: 6,
    ms: 280,
    tags: ["idle", "wait", "work"],
    faces: ["pleased", "relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // The box in the left hand.
      sleeve(g, p, -1, [joint, [R + 1, 51], [R - 5, 48]], "v");
      P.takeawayBox(g, [14, 40], { chopsticks: false });
      paw(g, p, -1, ["SSs", "kkS", "SSs", "Ss."], [R - 8, 43]);
      // Chopsticks lifting noodles from the box to the mouth.
      const k = K([0, 1, 2, 2, 1, 0])(beat);
      const tip: Pt = [[19, 41], [22, 35], [23, 30]][k] as Pt;
      const mine = new Set<string>();
      const put = (x: number, y: number, c: string) => (g.set(x, y, c, "prop"), mine.add(`${x},${y}`));
      // Noodles hanging from the tips, then the chopsticks up to the hand.
      if (k > 0) for (let i = 1; i < 6 - k; i++) put(tip[0] - 1 + (i % 2), tip[1] + i, i % 2 ? "#e0a93a" : "#f6d36a"), put(tip[0] - 2 + (i % 2), tip[1] + i, "#f6d36a");
      for (let i = 0; i < 8; i++) put(tip[0] + Math.round(i * 0.8), tip[1] + i, i < 2 ? "#a8703a" : "#d9a066");
      P.edge(g, mine);
      sleeve(g, p, 1, [joint, [R + 1, 51], [tip[0] + 8, tip[1] + 9]], "h");
      paw(g, p, 1, ["SSs", "kkS", "SSs", "Ss."], [tip[0] + 5, tip[1] + 4], k === 2);
      rimFace(g);
    },
  },
  {
    id: "umbrella",
    label: "holds an umbrella",
    arms: { left: true, right: false },
    beats: 4,
    ms: 200,
    tags: ["wait", "idle", "sad"],
    faces: ["neutral", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const colour = pick(p, ["#d8433a", "#3f6fd0", "#f2bb32", "#8c6bf2", "#1fb5a8"]);
      const hand: Pt = [R + 3, 34];
      P.umbrella(g, [R - 6, 8], hand, { part: "canopy", colour });
      sleeve(g, p, 1, [joint, [R + 5, 45], [R + 4, 38]], "h");
      paw(g, p, 1, ["SSSs", "kkkS", "SSSs", ".SS."], [R + 2, 33]);
      P.umbrella(g, [R - 6, 8], [R + 3, 37], { part: "handle" });
      P.rain(g, beat);
    },
  },
  {
    id: "lift-trophy",
    label: "lifts a trophy",
    arms: { left: true, right: false },
    beats: 6,
    ms: 200,
    tags: ["celebrate"],
    faces: ["proud", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const up = K([0, 1, 2, 2, 2, 1])(beat);
      const ty = 16 - up * 4;
      P.trophy(g, [R - 1, ty], { frame: beat });
      sleeve(g, p, 1, [joint, [R + 5, 38 - up], [R + 4, ty + 15]], "h");
      paw(g, p, 1, ["SSSs", "kkkS", "SSSs", "kkkS", ".SS."], [R + 2, ty + 10]);
      if (up === 2) P.sparkle(g, [R - 3, ty + 1], { frame: beat }), P.sparkle(g, [R + 9 > 46 ? 46 : R + 9, ty + 14], { frame: beat + 2 });
    },
  },
  {
    id: "drink-water",
    label: "drinks some water",
    arms: { left: true, right: false },
    beats: 6,
    ms: 300,
    tags: ["idle", "wait", "work"],
    faces: ["relieved", "focused"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 2, 2, 2, 1])(beat);
      const at: Pt = [[28, 37], [25, 31], [22, 28]][k] as Pt;
      P.waterBottle(g, at, { frame: K([0, 0, 0, 1, 2, 2])(beat), colour: pick(p, ["#2f8fd8", "#3f9634", "#d8433a", "#8c6bf2"]) });
      sleeve(g, p, 1, [joint, [R + 2, 51], [at[0] + 5, at[1] + 11]], "h");
      paw(g, p, 1, ["SSs", "kkS", "SSs", "kkS", "SS."], [at[0] + 3, at[1] + 5], k === 2);
      rimFace(g);
    },
  },
  {
    id: "swipe-tablet",
    label: "swipes through a tablet",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["explain", "work"],
    faces: ["talking", "focused"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      sleeve(g, p, -1, [joint, [R + 1, 51], [R - 3, 48]], "v");
      P.tablet(g, [14, 37], { frame: beat, colour: pick(p, ["#2b2e38", "#e9e2d4", "#3f6fd0"]) });
      paw(g, p, -1, ["SSs", "kkS", "SSs", "Ss."], [R - 3, 40]);
      // A finger sweeping across the screen.
      const tx = [24, 22, 20, 22][beat % 4]!;
      sleeve(g, p, 1, [joint, [R + 1, 51], [tx + 3, 49]], "h");
      paw(g, p, 1, H.finger, [tx, 40]);
    },
  },
  {
    id: "listen-headphones",
    label: "holds a headphone to their ear",
    arms: { left: true, right: false },
    beats: 4,
    ms: 280,
    tags: ["listen", "idle", "work"],
    faces: ["focused", "pleased"],
    // The band, from behind the neck up behind the head to the lifted cup.
    behind: (g) => {
      for (let i = 0; i <= 10; i++) g.set(Math.round(27 + i * 0.6), 34 - i, "#24262c", "prop");
    },
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      P.headphonesNeck(g, { lifted: true, colour: pick(p, ["#2a2c34", "#d8433a", "#3f6fd0", "#8c6bf2"]) });
      sleeve(g, p, 1, [joint, [R + 5, 40], [R + 2, 29]], "h");
      paw(g, p, 1, ["SSs", "SkS", "kSs", "SSs", ".S."], [R - 1, 23]);
      P.note(g, [R + 4, 14 - (beat % 2) * 2], { flip: beat % 2 === 1 });
      if (beat >= 2) P.note(g, [R + 7, 8 - (beat - 2)]);
    },
  },
  {
    id: "high-five",
    label: "goes for a high five",
    arms: { left: true, right: false },
    beats: 4,
    ms: 170,
    tags: ["celebrate", "greet", "approve"],
    faces: ["excited", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 2, 2])(beat);
      const dx = k === 2 ? -2 : 0;
      const dy = k === 1 ? -1 : 0;
      sleeve(g, p, 1, [joint, [R + 4, 34], [R + 3 + dx, 25 + dy]], "h");
      paw(g, p, 1, H.stop, [R - 1 + dx, 17 + dy]);
      if (k === 2) P.burst(g, [R + 2 + dx, 20], { frame: beat, colour: "#fff3b0" });
    },
  },
  {
    id: "phew",
    label: "wipes their brow",
    arms: { left: true, right: false },
    beats: 5,
    ms: 170,
    tags: ["worry", "celebrate"],
    faces: ["relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = beat % 5;
      if (k < 3) {
        // The back of the hand across the forehead, left to right.
        const hx = [17, 21, 25][k]!;
        sleeve(g, p, 1, [joint, [R + 6, 32], [hx + 8, 18]], "v");
        paw(g, p, 1, H.flat, [hx, 15], true);
        P.sweat(g, [12, 16]);
      } else {
        // A flick, and the drop flies off.
        sleeve(g, p, 1, [joint, [R + 6, 33], [R + 4, 22]], "h");
        paw(g, p, 1, H.palmS, [R + 1, 15]);
        P.sweat(g, [k === 3 ? 6 : 3, k === 3 ? 10 : 6]);
      }
      rimFace(g);
    },
  },
  {
    id: "heart-hands",
    label: "makes a heart with their hands",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["approve", "celebrate", "bye"],
    faces: ["pleased", "laughing"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) sleeve(g, p, s, [joint, [R + 1, 51], [28, 42]], "h");
      paw(g, p, 1, H.heartRing, [20, 34]);
      // A heart in the middle, and a small one floating up.
      for (const [x, y] of [[22, 36], [26, 36], [22, 37], [23, 37], [24, 37], [25, 37], [26, 37], [23, 38], [24, 38], [25, 38], [24, 39]] as const) g.set(x, y, "#ef4a6a", "prop");
      g.set(23, 36, "#ef4a6a", "prop"), g.set(25, 36, "#ef4a6a", "prop");
      P.heart(g, [R + 3, 16 - beat * 2], { frame: beat });
    },
  },
  {
    id: "sticky-note",
    label: "holds up a sticky note",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["explain", "approve", "work"],
    faces: ["pleased", "talking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 0, 0])(beat);
      P.stickyNote(g, [R + 1, 22 - d], { frame: beat >= 2 ? 1 : 0, colour: pick(p, ["#ffd84a", "#ff9ac1", "#8fe0a0", "#9fd4ff"]) });
      sleeve(g, p, 1, [joint, [R + 4, 44], [R + 4, 33 - d]], "h");
      paw(g, p, 1, ["S...", "SSSs", "kSSs", "SSs.", ".S.."], [R + 2, 27 - d]);
    },
  },
  {
    id: "nod-off",
    label: "dozes off",
    arms: { left: true, right: false },
    beats: 4,
    ms: 420,
    tags: ["idle", "wait"],
    faces: ["sleepy"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // Chin propped on a fist, and z's drifting up.
      sleeve(g, p, 1, [joint, [R + 2, 51], [27, 38]], "h");
      paw(g, p, 1, H.fist, [23, 32]);
      P.zzz(g, [R + 2, 11], { frame: beat });
    },
  },
  {
    id: "startled",
    label: "starts in surprise",
    arms: { left: false, right: false },
    beats: 4,
    ms: 120,
    tags: ["surprise", "worry"],
    faces: ["surprised", "nervous"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        const j = (beat + (s === 1 ? 0 : 1)) % 2;
        sleeve(g, p, s, [joint, [R + 4, 40], [R + 3 + j, 33]], "h");
        paw(g, p, s, H.palmS, [R + j, 26]);
      }
      P.exclaim(g, [R + 3, 2 + (beat % 2)]);
    },
  },
  {
    id: "jazz-hands",
    label: "does jazz hands",
    arms: { left: false, right: false },
    beats: 4,
    ms: 130,
    tags: ["celebrate", "tease"],
    faces: ["excited", "laughing"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        const j = (beat + (s === 1 ? 0 : 1)) % 2;
        sleeve(g, p, s, [joint, [R + 3, 47], [R + 4 + j, 36]], "h");
        paw(g, p, s, H.palm, [R + j, 27 - j]);
      }
      P.sparkle(g, [R + 8 > 45 ? 45 : R + 8, 20], { frame: beat });
      P.sparkle(g, [M(R + 7), 22], { frame: beat + 2 });
    },
  },
  {
    id: "count-fingers",
    label: "counts on their fingers",
    arms: { left: true, right: false },
    beats: 6,
    ms: 380,
    tags: ["explain", "think"],
    faces: ["talking", "thinking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const n = K([0, 0, 1, 1, 2, 2])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 48], [R + 2, 35]], "h");
      paw(g, p, 1, [H.finger, H.peace, H.three][n]!, [R, 27]);
    },
  },
  {
    id: "beckon",
    label: "beckons you over",
    arms: { left: true, right: false },
    beats: 4,
    ms: 220,
    tags: ["greet", "encourage", "tease"],
    faces: ["mischievous", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      sleeve(g, p, 1, [joint, [R + 3, 50], [R + 1, 40]], "v");
      paw(g, p, 1, beat % 2 ? H.comeCurl : H.comeUp, [R - 5, 35]);
    },
  },
  {
    id: "rub-hands",
    label: "rubs their hands together",
    arms: { left: false, right: false },
    beats: 4,
    ms: 140,
    tags: ["tease", "celebrate", "work"],
    faces: ["mischievous", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        const d = (beat + (s === 1 ? 0 : 1)) % 2;
        sleeve(g, p, s, [joint, [R + 1, 51], [26, 47 - d]], "v");
        paw(g, p, s, H.blade, [24, 40 - d]);
      }
    },
  },
  {
    id: "fan-face",
    label: "fans their face",
    arms: { left: true, right: false },
    beats: 4,
    ms: 110,
    tags: ["worry", "tease"],
    faces: ["embarrassed", "relieved"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 2, 0, -1])(beat);
      sleeve(g, p, 1, [joint, [R + 4, 46], [R + 3 + d, 34]], "h");
      paw(g, p, 1, H.palmS, [R + d, 27]);
      P.sweat(g, [12, 17]);
    },
  },
  {
    id: "hands-behind-head",
    label: "rests their hands behind their head",
    arms: { left: false, right: false },
    beats: 4,
    ms: 500,
    tags: ["idle", "wait", "tease"],
    faces: ["smug", "pleased"],
    behind: (g, p, beat) => {
      const { R } = frame(p);
      const d = K([0, 0, 1, 1])(beat);
      for (const s of [1, -1] as Side[]) limb(g, sleeveOf(p), at(s, [R + 7, 23 - d]), at(s, [R - 6, 15]));
    },
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 0, 1, 1])(beat);
      for (const s of [1, -1] as Side[]) sleeve(g, p, s, [joint, [R + 7, 23 - d]], "none");
    },
  },
  {
    id: "thumb-back",
    label: "jerks a thumb over their shoulder",
    arms: { left: true, right: false },
    beats: 4,
    ms: 220,
    tags: ["explain", "tease"],
    faces: ["smug", "talking"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 1, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 4, 46], [R + 1 + d, 38]], "h");
      paw(g, p, 1, H.thumbBack, [R - 2 + d, 32]);
    },
  },
  {
    id: "check-watch",
    label: "taps their watch",
    arms: { left: false, right: false },
    beats: 4,
    ms: 240,
    tags: ["wait", "tease"],
    faces: ["unimpressed", "annoyed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      // The right forearm raised across the chest, the watch on its wrist...
      sleeve(g, p, -1, [joint, [R + 2, 50], [R - 9, 42]], "v");
      paw(g, p, -1, H.fist, [R - 15, 38]);
      P.watch(g, [M(R - 6), 43], { frame: beat });
      // ...and a finger tapping it.
      const up = beat % 2;
      sleeve(g, p, 1, [joint, [R + 2, 51], [M(R - 6) + 8, 39 - up]], "v");
      paw(g, p, 1, H.you, [M(R - 6) + 1, 35 - up]);
    },
  },
  {
    id: "air-quotes",
    label: "does air quotes",
    arms: { left: false, right: false },
    beats: 4,
    ms: 200,
    tags: ["tease", "explain"],
    faces: ["smug", "unimpressed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        sleeve(g, p, s, [joint, [R + 5, 38], [R + 3, 30]], "h");
        paw(g, p, s, beat % 2 ? H.quoteBent : H.quote, [R + 2, 24]);
      }
    },
  },
  {
    id: "fist-bump",
    label: "offers a fist bump",
    arms: { left: true, right: false },
    beats: 4,
    ms: 180,
    tags: ["greet", "approve", "celebrate"],
    faces: ["pleased", "excited"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 2, 0])(beat);
      const d = k ? 1 : 0;
      sleeve(g, p, 1, [joint, [R + 3, 48], [R - 2 - d, 43]], "v");
      paw(g, p, 1, H.knuckles, [R - 10 - d, 37 + d]);
      if (k === 2) P.burst(g, [R - 7 - d, 39], { frame: 1 });
    },
  },
  {
    id: "fingers-crossed",
    label: "crosses their fingers",
    arms: { left: false, right: false },
    beats: 4,
    ms: 260,
    tags: ["wait", "worry", "encourage"],
    faces: ["nervous", "worried"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      for (const s of [1, -1] as Side[]) {
        const d = (beat + (s === 1 ? 0 : 2)) % 4 === 1 ? 1 : 0;
        sleeve(g, p, s, [joint, [R + 3, 48], [R + 1, 36 - d]], "h");
        paw(g, p, s, H.crossed, [R - 1, 28 - d]);
      }
    },
  },
  {
    id: "hands-up",
    label: "puts their hands up",
    arms: { left: false, right: false },
    beats: 4,
    ms: 300,
    tags: ["tease", "worry", "confuse"],
    faces: ["nervous", "embarrassed"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 1, 0])(beat);
      for (const s of [1, -1] as Side[]) {
        sleeve(g, p, s, [joint, [R + 5, 36], [R + 4, 27 - d]], "h");
        paw(g, p, s, H.palmS, [R + 1, 20 - d]);
      }
    },
  },
  {
    id: "rub-eyes",
    label: "rubs their eyes",
    arms: { left: true, right: false },
    beats: 4,
    ms: 150,
    tags: ["idle", "sad", "wait"],
    faces: ["sleepy"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const [dx, dy] = ([[0, 0], [1, 1], [0, 2], [-1, 1]] as Pt[])[beat % 4]!;
      sleeve(g, p, 1, [joint, [R + 3, 51], [33 + dx, 29 + dy]], "h");
      paw(g, p, 1, ["SSSSs", "kSkSS", "SSSSs", "kkkSs", "SSSSs", ".SSs."], [29 + dx, 20 + dy]);
      rimFace(g);
    },
  },
  {
    id: "cup-ear",
    label: "cups a hand to their ear",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["listen", "confuse", "tease"],
    faces: ["curious", "confused"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 0, 1, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 5, 42], [R + 2 + d, 27]], "h");
      paw(g, p, 1, H.cupEarL, [R - 2 + d, 18]);
      rimFace(g);
    },
  },
  {
    id: "toast",
    label: "raises a mug",
    arms: { left: true, right: false },
    beats: 4,
    ms: 240,
    tags: ["celebrate", "greet", "approve"],
    faces: ["laughing", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const k = K([0, 1, 2, 1])(beat);
      const my = [24, 19, 17][k]!;
      P.mug(g, [R - 4, my], { colour: pick(p, MUGS), steam: false, flip: true });
      sleeve(g, p, 1, [joint, [R + 5, 40], [R + 4, my + 10]], "h");
      paw(g, p, 1, H.grip, [R + 2, my + 2]);
      if (k === 2) P.sparkle(g, [R - 5, my - 2], { frame: 2 });
    },
  },
  {
    id: "slow-clap",
    label: "gives a slow clap",
    arms: { left: false, right: false },
    beats: 4,
    ms: 450,
    tags: ["tease", "approve"],
    faces: ["unimpressed", "smug"],
    draw: clapping,
  },
  {
    id: "point-self",
    label: "points at themselves",
    arms: { left: true, right: false },
    beats: 4,
    ms: 240,
    tags: ["confuse", "tease", "surprise"],
    faces: ["surprised", "curious"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 0, 0])(beat);
      sleeve(g, p, 1, [joint, [R + 3, 50], [R - 1, 44]], "v");
      paw(g, p, 1, H.pointIn, [R - 9 + d, 40]);
    },
  },
  {
    id: "ponder-pencil",
    label: "taps a pencil on their chin",
    arms: { left: true, right: false },
    beats: 4,
    ms: 220,
    tags: ["think", "work"],
    faces: ["thinking", "curious"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = beat % 2;
      sleeve(g, p, 1, [joint, [R + 2, 51], [32, 42]], "h");
      paw(g, p, 1, ["SSSs", "kkSS", "SSSs", ".SS."], [28, 37]);
      P.pencil(g, [32, 41 - d], [25, 34 - d], false);
    },
  },
  {
    id: "thumbs-down",
    label: "gives a thumbs down",
    arms: { left: true, right: false },
    beats: 4,
    ms: 300,
    tags: ["sad", "tease"],
    faces: ["unimpressed", "sad"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const d = K([0, 1, 1, 0])(beat);
      // The forearm comes in from the side, so the thumb hangs clear below the fist.
      sleeve(g, p, 1, [joint, [R + 4, 47], [R + 1, 37 + d]], "v");
      over(g, () => paw(g, p, 1, H.thumbDown, [R - 5, 34 + d]));
    },
  },
  {
    id: "knock",
    label: "knocks on the screen",
    arms: { left: true, right: false },
    beats: 4,
    ms: 180,
    tags: ["greet", "wait", "tease"],
    faces: ["curious", "pleased"],
    draw: (g, p, beat) => {
      const { R, joint } = frame(p);
      const hit = beat % 2 === 1;
      sleeve(g, p, 1, [joint, [R + 4, 44], [R + 1 - (hit ? 1 : 0), 35]], "h");
      paw(g, p, 1, H.knuckles, [R - 4 - (hit ? 1 : 0), 29 + (hit ? 1 : 0)]);
      if (hit) P.burst(g, [R - 1, 31], { frame: beat >> 1 });
    },
  },
];

defineGestures(LIST);
