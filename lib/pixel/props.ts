// Small things people hold (a mug, a phone, a book, a trophy) and the little marks that appear by
// them (a sparkle, a heart, a "?"), drawn into the 48x52 grid as region "prop". Each takes the grid,
// a position (the top-left of its box unless it says otherwise) and options: a colour, the frame
// of its own little animation (steam rising, a page turning, a tick going on), a flip.
//
// Props edge themselves in the outline colour wherever they sit on something already drawn (the
// body, the face, a hand); over empty space the outline pass (people.ts) edges them, so the line is
// one pixel everywhere. Steam and rain are "ghost" pixels: coloured but with no region, so nothing
// outlines them.
import { mix, OUTLINE, type Grid, type Pt } from "./kit";

export interface PropOptions {
  colour?: string;
  /** The frame of the prop's own animation; it loops. */
  frame?: number;
  /** Mirror it left to right (a handle on the other side). */
  flip?: boolean;
}

type Palette = Record<string, string>;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
const light = (c: string, t = 0.35) => mix(c, "#ffffff", t);
const dark = (c: string, t = 0.25) => mix(c, "#000000", t);

/**
 * Stamp a pattern as a prop and edge it. "." is clear and "o" is an outline pixel inside it (a
 * handle's hole, a fold). Returns the pixels it drew.
 */
export function put(g: Grid, rows: string[], [x, y]: Pt, pal: Palette, flip = false, rim = true): Set<string> {
  const w = Math.max(...rows.map((r) => r.length));
  const mine = new Set<string>();
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const colour = ch === "o" ? OUTLINE : pal[ch];
      if (!colour) return;
      const px = flip ? x + w - 1 - rx : x + rx;
      g.set(px, y + ry, colour, "prop");
      mine.add(`${px},${y + ry}`);
    }),
  );
  if (rim) edge(g, mine);
  return mine;
}

/** Outline a set of pixels against whatever is drawn round them. */
export function edge(g: Grid, mine: Set<string>) {
  for (const k of mine) {
    const [px, py] = k.split(",").map(Number) as [number, number];
    for (const [dx, dy] of DIRS) {
      const nx = px + dx;
      const ny = py + dy;
      if (mine.has(`${nx},${ny}`)) continue;
      const r = g.get(nx, ny);
      if (r === null || r === "outline" || r === "prop") continue;
      g.set(nx, ny, OUTLINE, "outline");
    }
  }
}

/** A see-through pixel: over something, a tint of it; over nothing, a pale "fx" pixel with no outline. */
export function ghost(g: Grid, x: number, y: number, colour: string, amount = 0.5) {
  if (x < 0 || y < 0 || x >= 48 || y >= 52) return;
  const r = g.r[y]![x];
  const under = g.c[y]![x];
  if (r === null || r === "fx") g.set(x, y, colour, "fx");
  else if (under) g.c[y]![x] = mix(under, colour, amount);
}

/**
 * A light mark in the air (a sparkle, a heart, a "?"): region "fx", so the outline pass leaves it
 * alone, with its own soft edge in `rim` where it sits on empty space. Where it overlaps the person
 * it is drawn solid, so nothing eats into it.
 */
export function mark(g: Grid, rows: string[], [x, y]: Pt, pal: Palette, rim?: string, flip = false) {
  const w = Math.max(...rows.map((r) => r.length));
  const mine = new Set<string>();
  rows.forEach((row, ry) =>
    [...row].forEach((ch, rx) => {
      const colour = pal[ch];
      if (ch === "." || !colour) return;
      const px = flip ? x + w - 1 - rx : x + rx;
      const r = g.get(px, y + ry);
      g.set(px, y + ry, colour, r === null || r === "fx" ? "fx" : "prop");
      mine.add(`${px},${y + ry}`);
    }),
  );
  if (!rim) return;
  for (const k of mine) {
    const [px, py] = k.split(",").map(Number) as [number, number];
    for (const [dx, dy] of DIRS) if (!mine.has(`${px + dx},${py + dy}`) && g.get(px + dx, py + dy) === null) g.set(px + dx, py + dy, rim, "fx");
  }
}

/** Light from a screen falling on whatever is near it, strongest at (cx, cy). */
export function glow(g: Grid, [cx, cy]: Pt, radius: number, colour: string, amount: number, regions = ["skin", "neck", "body", "arm", "hand", "ear", "mouth"]) {
  for (let y = Math.max(0, cy - radius); y <= Math.min(51, cy + radius); y++)
    for (let x = Math.max(0, cx - radius); x <= Math.min(47, cx + radius); x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.2) / radius;
      const r = g.get(x, y);
      if (d >= 1 || !r || !regions.includes(r)) continue;
      const c = g.c[y]![x];
      if (c && c !== OUTLINE) g.c[y]![x] = mix(c, colour, amount * (1 - d));
    }
}

// ---------------------------------------------------------------- drinks

/** A mug, 8 by 7, its handle on the right (flip: the left), with steam over it. */
export function mug(g: Grid, at: Pt, o: PropOptions & { steam?: boolean } = {}) {
  const m = o.colour ?? "#e9e2d4";
  put(
    g,
    ["LLLLLL..", "LccccL..", "MMMMMMMM", "MhMMMs.M", "MhMMMs.M", "MhMMMsMM", "sMMMss.."],
    at,
    { L: light(m, 0.4), c: "#5b3622", M: m, h: light(m, 0.55), s: dark(m, 0.2) },
    o.flip,
  );
  if (o.steam !== false) steam(g, [at[0] + (o.flip ? 3 : 1), at[1] - 2], o.frame ?? 0);
}

/** Two wisps of steam rising from (x, y), the top of the drink, curling as `frame` goes on. */
export function steam(g: Grid, [x, y]: Pt, frame: number) {
  const sway = [0, 1, 1, 0];
  for (const dx of [0, 3])
    for (let i = 0; i < 4; i++) {
      // A gap climbs each wisp, so the steam looks like it rises.
      if ((i - frame + 40) % 4 === 3) continue;
      ghost(g, x + dx + sway[(i + frame + dx) % 4]!, y - i, "#ffffff", 0.6 - i * 0.1);
    }
}

/** A takeaway coffee, 6 by 8: a lid, a cardboard sleeve in `colour`. */
export function coffeeCup(g: Grid, at: Pt, o: PropOptions = {}) {
  const s = o.colour ?? "#b0814f";
  put(
    g,
    [".llll.", "LLLLLL", "WWWWWw", "SSSSSs", "SSDSSs", "SSSSSs", ".WWWw.", ".WWWw."],
    at,
    { l: "#c9c4bc", L: "#f4f1ea", W: "#f6f3ee", w: "#d9d3c9", S: s, s: dark(s, 0.2), D: light(s, 0.45) },
    o.flip,
  );
}

/** A water bottle, 4 by 11, the water falling as `frame` goes up (0 full to 3 low). */
export function waterBottle(g: Grid, at: Pt, o: PropOptions = {}) {
  const cap = o.colour ?? "#2f8fd8";
  const level = 3 + Math.min(3, (o.frame ?? 0) % 4);
  const rows = [".cc.", ".cc.", "nnnn"];
  for (let r = 3; r <= 10; r++) {
    const water = r >= level + 1;
    if (r === 6 || r === 7) rows.push("LLLL");
    else if (r === 10) rows.push(water ? "bbbb" : "eeee");
    else rows.push(water ? "BhBb" : "EhEe");
  }
  put(g, rows, at, { c: cap, n: "#cfe6f2", B: "#7fc4ee", b: "#5aa7d8", h: "#e3f4fd", E: "#d8eef8", e: "#b8d8e8", L: dark(cap, 0.05) }, o.flip);
}

// ---------------------------------------------------------------- food

/** A sandwich, 8 by 7, seen from the side: bread, lettuce, tomato, cheese. `frame` bites taken (0-2). */
export function sandwich(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const rows = [".TTTTTT.", "TtTTTTTT", "gGgGgGgG", "RRRRRRRR", "YYYYYYYY", "TTTTTTTT", ".bbbbbb."];
  const bites = (o.frame ?? 0) % 3;
  // Each bite takes a round notch out of the far top corner.
  const cut = (cx: number, cy: number) => rows.forEach((row, ry) => (rows[ry] = [...row].map((ch, rx) => (Math.hypot(rx - cx, ry - cy) < 2.3 ? "." : ch)).join("")));
  if (bites >= 1) cut(7.5, -0.2);
  if (bites >= 2) cut(5.5, -0.6);
  put(g, rows, [x, y], { T: "#e8b96a", t: "#f5d79c", b: "#c98f45", g: "#5fb84a", G: "#3f9634", R: "#e0483c", Y: "#f6cf3e" }, o.flip);
}

/** An apple, 7 by 8, red unless `colour`; `frame` bites (0-2). */
export function apple(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const r = o.colour ?? "#d83a34";
  const rows = ["...bLL.", "..bLL..", ".RRbRR.", "RhRRRRR", "RhRRRRr", "RRRRRRr", "RRRRRrr", ".RR.rr."];
  const bites = (o.frame ?? 0) % 3;
  if (bites >= 1) for (const [rx, ry] of [[6, 3], [6, 4], [5, 4], [6, 5]] as const) rows[ry] = rows[ry]!.slice(0, rx) + "W" + rows[ry]!.slice(rx + 1);
  if (bites >= 2) for (const [rx, ry] of [[0, 4], [0, 5], [1, 5], [0, 6]] as const) rows[ry] = rows[ry]!.slice(0, rx) + "W" + rows[ry]!.slice(rx + 1);
  put(g, rows, [x, y], { b: "#6b4424", L: "#5cb84a", R: r, h: light(r, 0.5), r: dark(r, 0.22), W: "#f7ecc8" }, o.flip);
}

/** A noodle box, 9 by 9, with chopsticks standing in it. */
export function takeawayBox(g: Grid, [x, y]: Pt, o: PropOptions & { chopsticks?: boolean } = {}) {
  const c = o.colour ?? "#d8433a";
  if (o.chopsticks !== false) {
    // Two chopsticks leaning out of the box, apart at the top.
    const mine = new Set<string>();
    for (let i = 0; i < 6; i++)
      for (const [x0, lean, c] of [[5, 0.4, "#d9a066"], [6, 0.8, "#c58a4c"]] as const) {
        const px = x + x0 + Math.round(i * lean);
        g.set(px, y + 1 - i, c, "prop"), mine.add(`${px},${y + 1 - i}`);
      }
    edge(g, mine);
  }
  put(
    g,
    ["NnNnNnNnN", "WWWWWWWWw", "WWWWWWWWw", ".WWRRRWw.", ".WWRWRWw.", ".WWRRRWw.", ".WWWWWWw.", "..WWWWw..", "..wwwww.."],
    [x, y],
    { N: "#f2c95a", n: "#e0a93a", W: "#f6f3ee", w: "#d5cfc5", R: c },
    o.flip,
  );
}

// ---------------------------------------------------------------- screens

/** A phone, 5 by 8: its back (`side` "back", a camera, a case in `colour`) or its lit screen. */
export function phone(g: Grid, at: Pt, o: PropOptions & { side?: "back" | "screen" } = {}) {
  const c = o.colour ?? "#2b2e38";
  if (o.side === "screen") {
    const f = (o.frame ?? 0) % 4;
    // Lines of a feed scrolling up a row a frame.
    const rows = ["bbbbb"];
    for (let r = 0; r < 6; r++) rows.push((r + f) % 3 === 0 ? "bAAAb" : (r + f) % 3 === 1 ? "bLLSb" : "bSSSb");
    rows.push("bbbbb");
    put(g, rows, at, { b: "#1e2028", S: "#c8ecff", L: "#7cb8e6", A: "#ffd56a" }, o.flip);
  } else {
    put(g, ["hcccc", "hdccc", "hcccc", "hcccc", "hcccc", "hcccc", "hcccc", "cssss"], at, { c, h: light(c, 0.22), s: dark(c, 0.3), d: "#0c0d10" }, o.flip);
  }
}

/** A tablet, 12 by 9, landscape, its screen towards us: a chart, swiped along by `frame`. */
export function tablet(g: Grid, at: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#2b2e38";
  const f = (o.frame ?? 0) % 4;
  const bars = [3, 5, 4, 6, 2, 5, 3, 6];
  const rows = ["bbbbbbbbbbbb"];
  for (let r = 0; r < 7; r++) {
    let row = "b";
    for (let col = 0; col < 10; col++) {
      const h = bars[(col + f * 2) % bars.length]!;
      row += r === 0 ? (col < 4 ? "T" : "S") : col % 2 === 1 && 7 - r <= h - 1 ? (col % 4 === 1 ? "A" : "B") : "S";
    }
    rows.push(row + "b");
  }
  rows.push("bbbbbbbbbbbb");
  put(g, rows, at, { b: c, S: "#d6f0ff", T: "#8fc0e6", A: "#ff9a4a", B: "#4aa3e0" }, o.flip);
}

/**
 * A laptop seen from behind, 20 by 11 (at the bottom of the frame, in front of the body): the lid
 * towards us with a glowing mark, and the screen's light on the person.
 */
export function laptop(g: Grid, [x, y]: Pt, o: PropOptions & { sticker?: string } = {}) {
  const c = o.colour ?? "#b8bcc6";
  const f = (o.frame ?? 0) % 4;
  // The screen's light on their face and shirt, flickering a little as the screen changes.
  glow(g, [x + 10, y - 3], 10, "#cfe9ff", [0.24, 0.3, 0.22, 0.28][f]!);
  const rows: string[] = [];
  for (let r = 0; r < 11; r++) {
    if (r === 0) rows.push("GGGGGGGGGGGGGGGGGGGG");
    else rows.push("h" + "M".repeat(18) + "s");
  }
  // The mark in the middle, lit from inside.
  const mark: [number, number, string][] = [[9, 4, "W"], [10, 4, "W"], [8, 5, "W"], [9, 5, "w"], [10, 5, "w"], [11, 5, "W"], [9, 6, "W"], [10, 6, "W"]];
  for (const [mx, my, ch] of mark) rows[my] = rows[my]!.slice(0, mx) + ch + rows[my]!.slice(mx + 1);
  // A sticker on the lid.
  if (o.sticker) for (const [sx, sy] of [[3, 7], [4, 7], [3, 8], [4, 8], [5, 8]] as const) rows[sy] = rows[sy]!.slice(0, sx) + "K" + rows[sy]!.slice(sx + 1);
  put(g, rows, [x, y], { G: "#e9f6ff", M: c, h: light(c, 0.3), s: dark(c, 0.22), W: "#f4fbff", w: "#bfe6ff", K: o.sticker ?? "#ffb627" });
}

// ---------------------------------------------------------------- paper

/**
 * An open book, 16 by 9, `side` "pages" (open towards us: two pages of text) or "cover" (held up to
 * read: the cover towards us, the pages' edges at the top). `frame` turns a page (0 flat, 1 lifting
 * off the right, 3 landing on the left).
 */
export function book(g: Grid, [x, y]: Pt, o: PropOptions & { side?: "pages" | "cover" } = {}) {
  const c = o.colour ?? "#c0483c";
  const pal: Palette = { C: c, c: dark(c, 0.25), P: "#f7f3ea", p: "#ddd5c4", t: "#9b9488", g: "#bfb5a2" };
  if (o.side === "cover") {
    put(g, [".pppppp..pppppp.", "CCCCCCCcgCCCCCCC", "CCCCCCCcgCCCCCCC", "CCCttCCcgCCCCCCC", "CCCCCCCcgCCCCCCC", "CCCCCCCcgCCCCCCC", "CCCCCCCcgCCCCCCC", "cccccccccccccccc"], [x, y], { ...pal, g: dark(c, 0.4), t: light(c, 0.4) }, o.flip);
    return;
  }
  const rows = [
    ".PPPPPP..PPPPPP.",
    "PPPPPPPpgPPPPPPP",
    "PtttttPpgPttttPP",
    "PPPPPPPpgPPPPPPP",
    "PttttPPpgPtttttP",
    "PPPPPPPpgPPPPPPP",
    "PtttPPPpgPttttPP",
    "PPPPPPPpgPPPPPPP",
    "CCCCCCCCCCCCCCCC",
  ];
  const f = (o.frame ?? 0) % 4;
  put(g, rows, [x, y], pal, o.flip);
  // A page turning: it lifts off the right and curls over to land on the left (frames 1 and 3;
  // frame 2 is the page mid-air, flat again under it).
  const page: Record<number, string[]> = {
    1: ["....PPPP", "...PPPPP", "..PPPPPp", "..PPPPp.", "..PPPp..", "..PPp...", "..Pp...."],
    3: ["PPPP....", "PPPPP...", "pPPPPP..", ".pPPPP..", "..pPPP..", "...pPP..", "....pP.."],
  };
  if (f === 1) put(g, page[1]!, [x + 7, y - 5], pal, o.flip);
  if (f === 3) put(g, page[3]!, [x + 1, y - 5], pal, o.flip);
}

/**
 * A spiral notebook, 11 by 13, lined, with handwriting: `frame` counts half-lines written (0-7),
 * so it fills as someone writes. `notebookTip` says where the pen is for that frame.
 */
export function notebook(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#3f6fd0";
  const rows = [".s.s.s.s.s.", "CsCsCsCsCsC", "PPPPPPPPPPP"];
  for (let i = 0; i < 5; i++) rows.push("PrPPPPPPPPP", "PrbbbbbbbbP");
  rows.push("ppppppppppp");
  const f = (o.frame ?? 0) % 8;
  const words = ["IIIPIIPIIIP", "IIPIIIIPIIP", "IIIIPIIPIPP", "IIPIIIPPPPP"];
  for (let line = 0; line <= Math.floor(f / 2) && line < 4; line++) {
    const n = line < Math.floor(f / 2) ? 8 : f % 2 ? 5 : 2;
    const r = 3 + line * 2;
    rows[r] = "Pr" + words[line]!.slice(0, n).padEnd(8, "P").slice(0, 8) + "P";
  }
  put(g, rows, [x, y], { s: "#9aa0ab", C: c, P: "#f8f6f0", p: "#dcd7cc", r: "#ef8a8a", b: "#b9d3f2", I: "#3a3f58" }, o.flip);
}

/** Where the pen rests on a notebook at (x, y) for a frame. */
export function notebookTip([x, y]: Pt, frame: number): Pt {
  const f = frame % 8;
  const line = Math.min(3, Math.floor(f / 2));
  return [x + 2 + (f % 2 ? 5 : 2), y + 3 + line * 2];
}

/** A pencil from `tip` to `end`: graphite, wood, yellow paint, a band and a pink rubber. */
export function pencil(g: Grid, tip: Pt, end: Pt, edgeHands = true) {
  const n = Math.max(Math.abs(end[0] - tip[0]), Math.abs(end[1] - tip[1]), 1);
  const mine = new Set<string>();
  for (let i = 0; i <= n; i++) {
    const x = Math.round(tip[0] + ((end[0] - tip[0]) * i) / n);
    const y = Math.round(tip[1] + ((end[1] - tip[1]) * i) / n);
    const colour = i === 0 ? "#2a2a30" : i === 1 ? "#e8c896" : i >= n ? "#f08aa0" : i === n - 1 ? "#b8bcc6" : "#f6c636";
    g.set(x, y, colour, "prop");
    mine.add(`${x},${y}`);
  }
  if (edgeHands) edge(g, mine);
  else for (const k of mine) {
    const [px, py] = k.split(",").map(Number) as [number, number];
    for (const [dx, dy] of DIRS) {
      const r = g.get(px + dx, py + dy);
      if (r && r !== "hand" && r !== "prop" && r !== "outline" && !mine.has(`${px + dx},${py + dy}`)) g.c[py + dy]![px + dx] = OUTLINE;
    }
  }
}

/** A clipboard, 10 by 13, with a sheet of three tasks; `frame` of them ticked (0-3). */
export function clipboard(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#b98a52";
  const rows = ["...mmmm...", "BBBmMMmBBB", "BWWWWWWWWB", "BWkkWllWWB", "BWkkWlllWB", "BWWWWWWWWB", "BWkkWlllWB", "BWkkWllWWB", "BWWWWWWWWB", "BWkkWllWWB", "BWkkWlllWB", "BWWWWWWWWB", "bbbbbbbbbb"];
  put(g, rows, [x, y], { m: "#8e939c", M: "#d4d8de", B: c, b: dark(c, 0.25), W: "#f8f6f0", k: "#b9b4aa", l: "#a7b4c8" }, o.flip);
  const ticks = (o.frame ?? 0) % 4;
  for (let i = 0; i < ticks; i++)
    for (const [dx, dy] of [[1, 0], [2, 1], [3, 0], [4, -1]] as const) g.set(o.flip ? x + 9 - dx : x + dx, y + 4 + i * 3 + dy, "#1f9a46", "prop");
}

/** A sheet of paper, 9 by 12, its corner folded; `content` lines of text, a bar chart or a big tick. */
export function paper(g: Grid, [x, y]: Pt, o: PropOptions & { content?: "text" | "chart" | "tick" } = {}) {
  const ink = o.colour ?? "#5a6a8a";
  const rows = ["WWWWWWo..", "WWWWWWfo.", "WWWWWWffo", "WWWWWWWWW"];
  const content = o.content ?? "text";
  for (let r = 4; r < 12; r++) {
    if (content === "text") rows.push(r % 2 === 0 ? (r === 10 ? "WlllWWWWW" : "WlllllllW") : "WWWWWWWWW");
    else if (content === "chart") rows.push("W" + [3, 0, 5, 0, 4, 0, 7].map((h, i) => (h && 11 - r <= h ? (i % 4 ? "B" : "A") : "W")).join("") + "W");
    else rows.push("WWWWWWWWW");
  }
  if (content === "text") rows[1] = "WTTTTWfo.";
  if (content === "chart") rows[11] = "WkkkkkkkW", (rows[1] = "WTTTWWfo.");
  put(g, rows, [x, y], { W: "#fbfaf6", f: "#d8d3c8", l: mix(ink, "#ffffff", 0.35), T: ink, A: "#ff9a4a", B: "#4aa3e0", k: "#8a8478" }, o.flip);
  if (content === "tick") for (const [dx, dy] of [[2, 7], [3, 8], [4, 9], [5, 8], [6, 7], [6, 6], [7, 5], [3, 7], [4, 8], [5, 7], [6, 5]] as const) g.set(o.flip ? x + 8 - dx : x + dx, y + dy, "#2fa354", "prop");
}

/** A sticky note, 6 by 6, in `colour` (yellow); `frame` 1 draws a tick on it. */
export function stickyNote(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffd84a";
  put(g, ["NNNNNN", "YllllY", "YYYYYY", "YlllYY", "YYYYYc", "YYYYcc"], [x, y], { N: dark(c, 0.08), Y: c, l: dark(c, 0.35), c: dark(c, 0.18) }, o.flip);
  if ((o.frame ?? 0) % 2 === 1) for (const [dx, dy] of [[1, 3], [2, 4], [3, 3], [4, 2]] as const) g.set(o.flip ? x + 5 - dx : x + dx, y + dy, "#d0363c", "prop");
}

// ---------------------------------------------------------------- things

/**
 * A magnifying glass, the lens centred at (cx, cy), radius 4, its handle down to the right (flip:
 * down to the left). The glass tints what is behind it; with `eye`, a big magnified eye looks out.
 */
export function magnifier(g: Grid, [cx, cy]: Pt, o: PropOptions & { eye?: string } = {}) {
  const rim = o.colour ?? "#6a5a48";
  const s = o.flip ? -1 : 1;
  const mine = new Set<string>();
  const set = (x: number, y: number, c: string) => {
    g.set(x, y, c, "prop");
    mine.add(`${x},${y}`);
  };
  // The handle first, so the rim sits over its end.
  for (let i = 4; i <= 9; i++) {
    const x = cx + s * i;
    const y = cy + i;
    set(x, y, i <= 4 ? dark(rim, 0.1) : "#3a2a20");
    set(x - s, y, i <= 4 ? dark(rim, 0.1) : "#5a4230");
  }
  for (let y = cy - 5; y <= cy + 5; y++)
    for (let x = cx - 5; x <= cx + 5; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > 4.6) continue;
      if (d > 3.5) set(x, y, d > 4.1 ? dark(rim, 0.15) : light(rim, 0.25));
      else {
        // The glass: what is behind it, tinted, or the background's pale blue.
        const under = g.c[y]?.[x];
        set(x, y, under && g.get(x, y) !== null ? mix(under, "#bfe6ff", 0.35) : "#cdebff");
      }
    }
  if (o.eye) {
    // A magnified eye: white, a big iris, a pupil, a glint.
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 2; x <= cx + 2; x++) g.set(x, y, "#f6f2ec", "prop");
    for (const x of [cx - 3, cx + 3]) g.set(x, cy, "#f6f2ec", "prop");
    for (let x = cx - 3; x <= cx + 3; x++) g.set(x, cy - 2, "#1d1514", "prop");
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) g.set(x, y, o.eye, "prop");
    g.set(cx, cy, "#100c0b", "prop"), g.set(cx + 1, cy, "#100c0b", "prop"), g.set(cx - 1, cy - 1, "#ffffff", "prop");
  }
  // A glint on the glass.
  g.set(cx - 2, cy - 3, "#ffffff", "prop"), g.set(cx - 3, cy - 2, "#ffffff", "prop");
  edge(g, mine);
}

/** A trophy, 10 by 12, gold unless `colour`; `frame` runs a glint across it (0-3). */
export function trophy(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#f2bb32";
  const rows = ["LLLLLLLLLL", "hGGGGGGGGh", "h.GgGGGs.h", "h.GgGGGs.h", ".hhgGGGshh", "...GGGs...", "....Gs....", "....Gs....", "...GGGs...", "..BBBBBB..", "..BPPPPB..", "..BBBBBB.."];
  const f = (o.frame ?? 0) % 4;
  // A diagonal glint sweeping across the cup, then gone for a frame.
  const glint = [5, 7, 9, -1][f]!;
  rows.forEach((row, ry) => (rows[ry] = [...row].map((ch, rx) => ((ch === "G" || ch === "g") && rx + ry === glint ? "W" : ch)).join("")));
  put(g, rows, [x, y], { L: light(c, 0.45), G: c, g: light(c, 0.3), s: dark(c, 0.2), h: dark(c, 0.08), W: "#fffbe8", B: "#5a3e2a", P: "#e9d9a8" }, o.flip);
}

/**
 * An umbrella over someone's head: the canopy level with its rim at `rim` (the middle of its
 * bottom edge), 29 wide and 8 tall, in panels of `colour` and white; the shaft from the rim down
 * to `hand`; the crook curling under the hand. `part` "canopy" or "handle" draws one or the other
 * (a gesture draws the hand between them), "all" both.
 */
export function umbrella(g: Grid, rim: Pt, hand: Pt, o: PropOptions & { part?: "canopy" | "handle" | "all" } = {}) {
  const c = o.colour ?? "#d8433a";
  const c2 = "#f3efe6";
  const part = o.part ?? "all";
  const [cx, cy] = rim;
  const [hx, hy] = hand;
  const mine = new Set<string>();
  const set = (x: number, y: number, col: string) => {
    if (x < 0 || y < 0 || x > 47 || y > 51) return;
    g.set(x, y, col, "prop");
    mine.add(`${x},${y}`);
  };
  if (part !== "handle") {
    // The shaft, from under the canopy to the hand.
    const n = Math.max(Math.abs(hx - cx), Math.abs(hy - cy));
    for (let i = 0; i <= n; i++) set(Math.round(cx + ((hx - cx) * i) / n), Math.round(cy + ((hy - cy) * i) / n), "#3a3438");
    const A = 14.5;
    const B = 8;
    for (let y = cy - B; y <= cy; y++)
      for (let x = Math.ceil(cx - A); x <= cx + A; x++) {
        const dx = x - cx;
        const up = cy - y;
        if ((dx * dx) / (A * A) + (up * up) / (B * B) > 1) continue;
        // Six panels fanning from the top; between the ribs the hem curves up.
        const t = Math.atan2(dx, up + 3) / (Math.PI / 2); // -1..1 across
        const pos = (t + 1) * 3;
        const panel = Math.floor(pos);
        const within = pos - panel;
        if (up === 0 && within > 0.22 && within < 0.78) continue;
        const rib = within < 0.12 || within > 0.88;
        const col = panel % 2 ? c2 : c;
        set(x, y, rib && up > 0 ? dark(col, 0.22) : up >= B - 2 ? light(col, 0.18) : col);
      }
    set(cx, cy - B - 1, "#3a3438");
  }
  if (part !== "canopy") {
    // The crook, curling under the hand.
    for (const [dx, dy] of [[0, 0], [0, 1], [0, 2], [-1, 3], [-2, 3], [-3, 2]] as const) set(hx + dx, hy + dy, "#6b4424");
  }
  edge(g, mine);
}

/** Rain: short streaks falling across the empty sky, `frame` moving them down. */
export function rain(g: Grid, frame: number) {
  const drops: Pt[] = [[3, 2], [9, 12], [41, 6], [45, 18], [2, 24], [44, 30], [6, 36], [40, 40], [14, 0], [36, 0]];
  for (const [x0, y0] of drops)
    for (let i = 0; i < 2; i++) {
      const y = (y0 + frame * 4 + i) % 52;
      // Slanting a little as it falls.
      const x = x0 - Math.floor(((y0 + frame * 4) % 52) / 12);
      if (g.get(x, y) === null && g.get(x, y + 1) === null && g.get(x, y - 1) === null) ghost(g, x, y, i ? "#d9ecff" : "#a9cff2");
    }
}

/**
 * Headphones worn round the neck: the band behind, a cup on each collarbone, in `colour`. With
 * `lifted`, the right-hand cup (as you look) is held up to the ear, its side of the band with it.
 */
export function headphonesNeck(g: Grid, o: PropOptions & { lifted?: boolean } = {}) {
  const c = o.colour ?? "#2a2c34";
  const pal = { c, p: light(c, 0.15), P: light(c, 0.45) };
  const cup = [".cccc", "cpppc", "cpPpc", "cpppc", ".cccc"];
  const mine = new Set<string>();
  const band = (x: number, y: number) => (g.set(x, y, dark(c, 0.1), "prop"), mine.add(`${x},${y}`));
  for (const [x, y] of [[19, 35], [19, 36], [20, 34]] as const) band(x, y);
  put(g, cup, [15, 37], pal);
  if (o.lifted) {
    // The cup held up at the ear (its side of the band runs behind the head).
    put(g, cup.map((r) => [...r].reverse().join("")), [31, 20], pal);
  } else {
    for (const [x, y] of [[28, 35], [28, 36], [27, 34]] as const) band(x, y);
    put(g, cup.map((r) => [...r].reverse().join("")), [28, 37], pal);
  }
  edge(g, mine);
}

/** A wristwatch on a wrist at (x, y), the face 3 wide; `frame` ticks its hand round. */
export function watch(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const strap = o.colour ?? "#3a3438";
  put(g, ["sssss", "sFFFs", "sFFFs", "sssss"], [x - 2, y - 2], { s: strap, F: "#f4f1e8" });
  // The hand, round the face a quarter a frame.
  const [dx, dy] = ([[0, -1], [1, 0], [0, 0], [-1, 0]] as Pt[])[(o.frame ?? 0) % 4]!;
  g.set(x + dx, y + dy, "#2a2a30", "prop");
}

// ---------------------------------------------------------------- marks in the air

/** A twinkle centred on (cx, cy): `frame` 0 a dot, 1 a small cross, 2 a full star, 3 a small cross. */
export function sparkle(g: Grid, [cx, cy]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#fff3b0";
  const f = (o.frame ?? 0) % 4;
  const shapes: Record<number, string[]> = {
    0: ["W"],
    1: [".W.", "WWW", ".W."],
    2: ["...W...", "...W...", "..WWW..", "WWWWWWW", "..WWW..", "...W...", "...W..."],
    3: [".W.", "WWW", ".W."],
  };
  const rows = shapes[f]!;
  const r = (rows.length - 1) / 2;
  mark(g, rows.map((row) => row.replace(/W/g, (_, i: number) => (i === r ? "C" : "W"))), [cx - r, cy - r], { W: c, C: "#ffffff" }, dark(c, 0.38));
}

/** A five-pointed star, 7 by 7, gold. `frame` 1 and 3 shine. */
export function star(g: Grid, at: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffd23a";
  const shine = (o.frame ?? 0) % 2 === 1;
  mark(g, ["...Y...", "..YYY..", "YYYYYYY", ".YYhYY.", "..YYY..", ".YY.YY.", ".Y...Y."], at, { Y: c, h: shine ? "#ffffff" : light(c, 0.5) }, dark(c, 0.35));
}

/** A heart, `size` small (5 by 4) or big (7 by 6); `frame` 1 beats bigger by a pixel's highlight. */
export function heart(g: Grid, at: Pt, o: PropOptions & { size?: "small" | "big" } = {}) {
  const c = o.colour ?? "#ef4a6a";
  const rows = o.size === "big" ? [".RR.RR.", "RhRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."] : ["RR.RR", "hRRRR", ".RRR.", "..R.."];
  mark(g, rows, at, { R: c, h: (o.frame ?? 0) % 2 ? "#ffffff" : light(c, 0.5) }, dark(c, 0.4));
}

/** A question mark, 6 by 9, for a puzzle over someone's head. */
export function question(g: Grid, at: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffffff";
  mark(g, [".WWWW.", "WW..WW", "....WW", "...WW.", "..WW..", "..WW..", "......", "..WW..", "..WW.."], at, { W: c }, mix(c, "#4a4f6a", 0.7));
}

/** An exclamation mark, 2 by 9. */
export function exclaim(g: Grid, at: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffe14a";
  mark(g, ["WW", "WW", "WW", "WW", "WW", "WW", "..", "WW", "WW"], at, { W: c }, mix(c, "#b0400a", 0.7));
}

/** Sleepy z's rising from (x, y): a small z, then a big one, drifting up with `frame` (0-3). */
export function zzz(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffffff";
  const f = (o.frame ?? 0) % 4;
  const rim = mix(c, "#3a4a7a", 0.65);
  mark(g, ["zzzz", "..z.", ".z..", "zzzz"], [x, y - f], { z: c }, rim);
  if (f >= 1) mark(g, ["ZZZZZ", "...Z.", "..Z..", ".Z...", "ZZZZZ"], [x + 3, y - 7 - f], { Z: c }, rim);
}

/** A musical note, 4 by 6, for humming or dancing. */
export function note(g: Grid, at: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#ffffff";
  mark(g, ["..NN", "..NN", "..N.", "..N.", "NNN.", "NNN."], at, { N: c }, mix(c, "#4a4f6a", 0.7), o.flip);
}

/** A light bulb, 5 by 7, for an idea; `frame` 1-3 lights it, 2 with rays. */
export function bulb(g: Grid, [x, y]: Pt, o: PropOptions = {}) {
  const f = (o.frame ?? 0) % 4;
  const lit = f > 0;
  put(g, [".YYY.", "YhYYY", "YYYYY", "YYYYY", ".YYY.", ".ggg.", ".ggg."], [x, y], { Y: lit ? "#ffe45a" : "#d9d4c0", h: lit ? "#ffffff" : "#efece0", g: "#9aa0ab" });
  if (f === 2 || f === 3) {
    const rays: Pt[] = f === 2 ? [[-2, 1], [6, 1], [2, -2], [-1, -1], [5, -1]] : [[-3, 1], [7, 1], [2, -3], [-2, -2], [6, -2]];
    for (const [dx, dy] of rays) mark(g, ["Y"], [x + dx, y + dy], { Y: "#ffe45a" }, "#d99a1a");
  }
}

/** A sweat drop, 3 by 4. */
export function sweat(g: Grid, at: Pt) {
  mark(g, [".b.", "bbb", "bwb", ".b."], at, { b: "#7cc4f0", w: "#e6f6ff" }, "#3a86c8");
}

/** Little lines bursting out from (cx, cy), for a clap, a high five, a knock; `frame` 1 is wider. */
export function burst(g: Grid, [cx, cy]: Pt, o: PropOptions = {}) {
  const c = o.colour ?? "#fff3b0";
  const d = (o.frame ?? 0) % 2 === 1 ? 5 : 4;
  // Three short strokes fanning up and two out to the sides.
  for (const [dx, dy] of [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]] as const) {
    const n = dx && dy ? 0.75 : 1;
    const a: Pt = [cx + Math.round(dx * d * n), cy + Math.round(dy * d * n)];
    const b: Pt = [cx + Math.round(dx * (d + 1) * n), cy + Math.round(dy * (d + 1) * n)];
    // One short stroke, edged as a whole.
    const x0 = Math.min(a[0], b[0]);
    const y0 = Math.min(a[1], b[1]);
    const rows = Array.from({ length: Math.abs(a[1] - b[1]) + 1 }, (_, ry) => Array.from({ length: Math.abs(a[0] - b[0]) + 1 }, (_, rx) => ([a, b].some(([px, py]) => px === x0 + rx && py === y0 + ry) ? "W" : ".")).join(""));
    mark(g, rows, [x0, y0], { W: c }, dark(c, 0.4));
  }
}
