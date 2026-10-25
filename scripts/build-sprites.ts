// Builds pixel art from text grids (Section 7.3).
//
//   sprites/src/*.txt       characters, props and tiles, one character per pixel
//   sprites/src/learner/    the learner's layered parts (recoloured at runtime)
//   sprites/scenes/*.json   backgrounds composed from props
//
// Output: public/sprites/<name>.png (frames side by side) + <name>.json,
// public/sprites/learner.json, public/sprites/scene-<name>.png.
// With --preview, also writes 8x enlargements to sprites/preview/ for review.
import fs from "node:fs";
import path from "node:path";
import { BRAND } from "../lib/brand";

const BRAND_NAME = BRAND.name;
const BRAND_TAGLINE = BRAND.tagline;
import { encodePng } from "../lib/pixel/png";

const root = process.cwd();
const SRC = path.join(root, "sprites", "src");
const OUT = path.join(root, "public", "sprites");
const PREVIEW = path.join(root, "sprites", "preview");
const preview = process.argv.includes("--preview");

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

interface PaletteFile {
  colours: Record<string, { name: string; hex: string }>;
  special: Record<string, { name: string; hex: string }>;
  ramps: { coat: Record<string, string[]>; jumper: Record<string, string[]> };
  placeholders: Record<string, string>;
}
const palette = JSON.parse(fs.readFileSync(path.join(root, "palette.json"), "utf8")) as PaletteFile;
const colourCount = Object.keys(palette.colours).length;
// One palette for the world, the interface and the characters (REDESIGN.md 3.1).
if (colourCount > 64) throw new Error(`palette.json has ${colourCount} colours; the limit is 64`);

const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const COLOURS = new Map<string, [number, number, number]>();
for (const [k, v] of Object.entries(palette.colours)) COLOURS.set(k, rgb(v.hex));
for (const [k, v] of Object.entries(palette.special)) COLOURS.set(k, rgb(v.hex));
// Placeholders preview with the first coat and jumper ramps.
const firstCoat = Object.values(palette.ramps.coat)[0]!;
const firstJumper = Object.values(palette.ramps.jumper)[0]!;
const PLACEHOLDER_DEFAULTS: Record<string, string> = { A: firstCoat[0]!, B: firstCoat[1]!, C: firstCoat[2]!, D: firstJumper[0]!, E: firstJumper[1]!, F: firstJumper[2]! };

// ---------------------------------------------------------------------------
// Sprite source format
//
//   @sprite moss 40x32        name and frame size
//   @fps 4                    animation ticks per second (default 4)
//   @anchor 20 31             the pixel that stands on the ground
//   @frame idle-1             followed by <height> rows of <width> characters
//   @frame blink = idle-1     a copy of another frame, then optional patches:
//   @patch 14 9               rows below overwrite from (x, y); '_' leaves a pixel alone
//   @anim idle idle-1*8 blink idle-1*4
// ---------------------------------------------------------------------------

interface Sprite {
  name: string;
  w: number;
  h: number;
  fps: number;
  anchor: [number, number];
  frames: Map<string, string[]>;
  anims: Record<string, string[]>;
  file: string;
  allowPlaceholders: boolean;
}

function parseSprite(file: string, allowPlaceholders: boolean): Sprite[] {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const sprites: Sprite[] = [];
  let sprite: Sprite | null = null;
  let target: { frame: string[]; x: number; y: number; row: number } | null = null;
  const where = (i: number) => `${path.relative(root, file)}:${i + 1}`;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("#") || (line.trim() === "" && !target)) continue;
    if (line.startsWith("@")) {
      target = null;
      const [cmd, ...args] = line.slice(1).trim().split(/\s+/);
      if (cmd === "sprite") {
        const [w, h] = args[1]!.split("x").map(Number);
        sprite = { name: args[0]!, w: w!, h: h!, fps: 4, anchor: [Math.floor(w! / 2), h! - 1], frames: new Map(), anims: {}, file, allowPlaceholders };
        sprites.push(sprite);
      } else if (!sprite) {
        throw new Error(`${where(i)}: @${cmd} before @sprite`);
      } else if (cmd === "fps") {
        sprite.fps = Number(args[0]);
      } else if (cmd === "anchor") {
        sprite.anchor = [Number(args[0]), Number(args[1])];
      } else if (cmd === "frame") {
        const id = args[0]!;
        if (args[1] === "=") {
          const base = sprite.frames.get(args[2]!);
          if (!base) throw new Error(`${where(i)}: unknown base frame ${args[2]}`);
          sprite.frames.set(id, base.slice());
          target = null;
          // Remember the frame for following @patch lines.
          (sprite as Sprite & { last?: string }).last = id;
        } else {
          const rows: string[] = [];
          sprite.frames.set(id, rows);
          (sprite as Sprite & { last?: string }).last = id;
          target = { frame: rows, x: -1, y: 0, row: 0 };
        }
      } else if (cmd === "patch") {
        const id = (sprite as Sprite & { last?: string }).last;
        const frame = id ? sprite.frames.get(id) : undefined;
        if (!frame) throw new Error(`${where(i)}: @patch without a frame`);
        target = { frame, x: Number(args[0]), y: Number(args[1]), row: 0 };
      } else if (cmd === "anim") {
        const [id, ...seq] = args;
        sprite.anims[id!] = seq.flatMap((s) => {
          const [f, n] = s.split("*");
          return Array(Number(n ?? 1)).fill(f);
        });
      } else {
        throw new Error(`${where(i)}: unknown directive @${cmd}`);
      }
      continue;
    }
    if (!sprite || !target) {
      if (line.trim() !== "") throw new Error(`${where(i)}: pixels outside a frame`);
      continue;
    }
    if (target.x === -1) {
      // A full frame: take the row as is.
      if (line.length !== sprite.w) throw new Error(`${where(i)}: row is ${line.length} wide, expected ${sprite.w}`);
      target.frame.push(line);
      if (target.frame.length === sprite.h) target = null;
    } else {
      if (line.trim() === "") {
        target = null;
        continue;
      }
      const y = target.y + target.row;
      if (y >= sprite.h) throw new Error(`${where(i)}: patch runs below the frame`);
      const chars = target.frame[y]!.split("");
      for (let k = 0; k < line.length; k++) {
        if (line[k] === "_") continue;
        if (target.x + k >= sprite.w) throw new Error(`${where(i)}: patch runs off the right edge`);
        chars[target.x + k] = line[k]!;
      }
      target.frame[y] = chars.join("");
      target.row++;
    }
  }
  for (const s of sprites) {
    for (const [id, rows] of s.frames) {
      if (rows.length !== s.h) throw new Error(`${path.relative(root, file)}: frame ${s.name}/${id} has ${rows.length} rows, expected ${s.h}`);
      for (const [y, row] of rows.entries()) {
        for (const ch of row) {
          if (ch === ".") continue;
          if (COLOURS.has(ch)) continue;
          if (allowPlaceholders && ch in PLACEHOLDER_DEFAULTS) continue;
          throw new Error(`${path.relative(root, file)}: ${s.name}/${id} row ${y + 1} uses "${ch}", which is not in palette.json`);
        }
      }
    }
    if (Object.keys(s.anims).length === 0) s.anims.default = [...s.frames.keys()].slice(0, 1);
    for (const [a, seq] of Object.entries(s.anims)) for (const f of seq) if (!s.frames.has(f)) throw new Error(`${path.relative(root, file)}: anim ${a} uses unknown frame ${f}`);
  }
  return sprites;
}

function frameToRgba(rows: string[], w: number, h: number, into: Uint8Array, stride: number, ox: number, oy: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ch = rows[y]![x]!;
      if (ch === ".") continue;
      if (ch in PLACEHOLDER_DEFAULTS && !COLOURS.has(ch)) ch = PLACEHOLDER_DEFAULTS[ch]!;
      const c = COLOURS.get(ch)!;
      const i = ((oy + y) * stride + ox + x) * 4;
      into[i] = c[0];
      into[i + 1] = c[1];
      into[i + 2] = c[2];
      into[i + 3] = 255;
    }
  }
}

function scaleUp(rgba: Uint8Array, w: number, h: number, k: number, background?: [number, number, number]): Uint8Array {
  const out = new Uint8Array(w * k * h * k * 4);
  for (let y = 0; y < h * k; y++) {
    for (let x = 0; x < w * k; x++) {
      const s = (Math.floor(y / k) * w + Math.floor(x / k)) * 4;
      const d = (y * w * k + x) * 4;
      if (background && rgba[s + 3] === 0) {
        out[d] = background[0];
        out[d + 1] = background[1];
        out[d + 2] = background[2];
        out[d + 3] = 255;
      } else {
        out.set(rgba.subarray(s, s + 4), d);
      }
    }
  }
  return out;
}

function writeSheet(s: Sprite, outDir: string, prefix = "") {
  const ids = [...s.frames.keys()];
  const sheetW = s.w * ids.length;
  const rgba = new Uint8Array(sheetW * s.h * 4);
  ids.forEach((id, i) => frameToRgba(s.frames.get(id)!, s.w, s.h, rgba, sheetW, i * s.w, 0));
  fs.writeFileSync(path.join(outDir, `${prefix}${s.name}.png`), encodePng(sheetW, s.h, rgba));
  const meta = {
    name: s.name,
    w: s.w,
    h: s.h,
    fps: s.fps,
    anchor: s.anchor,
    frames: Object.fromEntries(ids.map((id, i) => [id, i])),
    anims: Object.fromEntries(Object.entries(s.anims).map(([a, seq]) => [a, seq.map((f) => ids.indexOf(f))])),
  };
  fs.writeFileSync(path.join(outDir, `${prefix}${s.name}.json`), JSON.stringify(meta));
  if (preview) {
    const bg = COLOURS.get("6")!;
    fs.writeFileSync(path.join(PREVIEW, `${prefix}${s.name}-sheet.png`), encodePng(sheetW * 4, s.h * 4, scaleUp(rgba, sheetW, s.h, 4, bg)));
    const first = new Uint8Array(s.w * s.h * 4);
    frameToRgba(s.frames.get(ids[0]!)!, s.w, s.h, first, s.w, 0, 0);
    const k = Math.max(4, Math.floor(400 / Math.max(s.w, s.h)));
    fs.writeFileSync(path.join(PREVIEW, `${prefix}${s.name}.png`), encodePng(s.w * k, s.h * k, scaleUp(first, s.w, s.h, k, bg)));
  }
  return meta;
}

// ---------------------------------------------------------------------------
// Scenes: a background composed from props
//   { "name": "workshop", "size": [160, 96], "fill": "1",
//     "rects": [{ "x": 0, "y": 70, "w": 160, "h": 26, "c": "f" }],
//     "props": [{ "sprite": "window", "frame": "day", "x": 20, "y": 10 }] }
// ---------------------------------------------------------------------------

interface SceneFile {
  name: string;
  size: [number, number];
  fill: string;
  rects?: { x: number; y: number; w: number; h: number; c: string; pattern?: string[] }[];
  props?: { sprite: string; frame?: string; x: number; y: number; flip?: boolean; layer?: "back" | "front" }[];
  /** Named points and rectangles the runtime uses: where characters stand, where rain falls. */
  marks?: Record<string, number[]>;
  /** Preview only: characters drawn between the layers so the composition can be checked. */
  previewActors?: { sprite: string; frame: string; x: number; y: number; flip?: boolean }[];
}

function renderLayer(scene: SceneFile, sprites: Map<string, Sprite>, layer: "back" | "front"): string[][] {
  const [W, H] = scene.size;
  const rows: string[][] = Array.from({ length: H }, () => Array(W).fill(layer === "back" ? scene.fill : "."));
  if (layer === "back") {
    for (const r of scene.rects ?? []) {
      for (let y = r.y; y < r.y + r.h && y < H; y++) {
        for (let x = r.x; x < r.x + r.w && x < W; x++) {
          if (x < 0 || y < 0) continue;
          if (r.pattern) {
            const p = r.pattern[(y - r.y) % r.pattern.length]!;
            const ch = p[(x - r.x) % p.length]!;
            if (ch !== ".") rows[y]![x] = ch;
          } else rows[y]![x] = r.c;
        }
      }
    }
  }
  for (const p of scene.props ?? []) {
    if ((p.layer ?? "back") !== layer) continue;
    const s = sprites.get(p.sprite);
    if (!s) throw new Error(`scene ${scene.name}: unknown sprite ${p.sprite}`);
    const frame = s.frames.get(p.frame ?? [...s.frames.keys()][0]!);
    if (!frame) throw new Error(`scene ${scene.name}: ${p.sprite} has no frame ${p.frame}`);
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const ch = frame[y]![p.flip ? s.w - 1 - x : x]!;
        const tx = p.x + x;
        const ty = p.y + y;
        if (ch !== "." && tx >= 0 && ty >= 0 && tx < W && ty < H) rows[ty]![tx] = ch;
      }
    }
  }
  return rows;
}

function buildScene(scene: SceneFile, sprites: Map<string, Sprite>) {
  const [W, H] = scene.size;
  const out: Record<string, unknown> = { name: scene.name, w: W, h: H, marks: scene.marks ?? {} };
  for (const layer of ["back", "front"] as const) {
    const rows = renderLayer(scene, sprites, layer);
    if (layer === "front" && !(scene.props ?? []).some((p) => p.layer === "front")) continue;
    const rgba = new Uint8Array(W * H * 4);
    frameToRgba(rows.map((r) => r.join("")), W, H, rgba, W, 0, 0);
    const file = layer === "back" ? `scene-${scene.name}.png` : `scene-${scene.name}-front.png`;
    fs.writeFileSync(path.join(OUT, file), encodePng(W, H, rgba));
    out[layer] = file;
    if (preview && layer === "back") {
      const front = renderLayer(scene, sprites, "front");
      for (const a of scene.previewActors ?? []) {
        const s = sprites.get(a.sprite) ?? learnerSprites.get(a.sprite);
        const frame = s?.frames.get(a.frame);
        if (!s || !frame) throw new Error(`scene ${scene.name}: preview actor ${a.sprite}/${a.frame} not found`);
        for (let y = 0; y < s.h; y++)
          for (let x = 0; x < s.w; x++) {
            const ch = frame[y]![a.flip ? s.w - 1 - x : x]!;
            const tx = a.x + x;
            const ty = a.y + y;
            if (ch !== "." && tx >= 0 && ty >= 0 && tx < W && ty < H) rows[ty]![tx] = ch;
          }
      }
      const both = rows.map((r, y) => r.map((ch, x) => (front[y]![x] !== "." ? front[y]![x]! : ch)).join(""));
      const all = new Uint8Array(W * H * 4);
      frameToRgba(both, W, H, all, W, 0, 0);
      fs.writeFileSync(path.join(PREVIEW, `scene-${scene.name}.png`), encodePng(W * 4, H * 4, scaleUp(all, W, H, 4)));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------

function listTxt(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".txt"))
    .sort()
    .map((f) => path.join(dir, f));
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
if (preview) fs.mkdirSync(PREVIEW, { recursive: true });

const all = new Map<string, Sprite>();
const index: Record<string, unknown> = {};
for (const file of listTxt(SRC)) {
  for (const s of parseSprite(file, false)) {
    if (all.has(s.name)) throw new Error(`duplicate sprite name ${s.name}`);
    all.set(s.name, s);
    index[s.name] = writeSheet(s, OUT);
  }
}

// Hand-drawn sheets (e.g. from Aseprite) in sprites/png/ are copied as they are.
const handDrawn = path.join(root, "sprites", "png");
if (fs.existsSync(handDrawn)) {
  for (const f of fs.readdirSync(handDrawn).filter((n) => n.endsWith(".png"))) {
    const name = f.replace(/\.png$/, "");
    const metaFile = path.join(handDrawn, `${name}.json`);
    if (!fs.existsSync(metaFile)) throw new Error(`sprites/png/${f} needs a ${name}.json beside it`);
    if (index[name]) throw new Error(`sprites/png/${f} clashes with a text sprite of the same name`);
    fs.copyFileSync(path.join(handDrawn, f), path.join(OUT, f));
    fs.copyFileSync(metaFile, path.join(OUT, `${name}.json`));
    index[name] = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  }
}

// Learner parts: shipped as grids so the client can recolour coat and jumper.
const learnerSprites = new Map<string, Sprite>();
const learner: Record<string, { w: number; h: number; anchor: [number, number]; frames: Record<string, string[]>; anims: Record<string, string[]>; fps: number }> = {};
for (const file of listTxt(path.join(SRC, "learner"))) {
  for (const s of parseSprite(file, true)) {
    learner[s.name] = { w: s.w, h: s.h, anchor: s.anchor, fps: s.fps, frames: Object.fromEntries(s.frames), anims: s.anims };
    learnerSprites.set(`learner:${s.name}`, s);
    if (preview) writeSheet(s, PREVIEW, "learner-");
  }
}
fs.writeFileSync(
  path.join(OUT, "learner.json"),
  JSON.stringify({
    parts: learner,
    colours: Object.fromEntries([...COLOURS].map(([k, v]) => [k, `#${v.map((n) => n.toString(16).padStart(2, "0")).join("")}`])),
    ramps: palette.ramps,
  }),
);

const scenesDir = path.join(root, "sprites", "scenes");
const scenes: Record<string, unknown> = {};
if (fs.existsSync(scenesDir)) {
  for (const f of fs.readdirSync(scenesDir).filter((n) => n.endsWith(".json")).sort()) {
    const scene = JSON.parse(fs.readFileSync(path.join(scenesDir, f), "utf8")) as SceneFile;
    scenes[scene.name] = buildScene(scene, all);
  }
}
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ sprites: index, scenes }));

// Favicons (REDESIGN.md 1.4): the 16x16 mark, nearest-neighbour scaled; Dennis until the mark exists.
function icon(size: number, k: number, background: string | null, file: string) {
  const d = all.get("mark") ?? all.get("dennis")!;
  const rgba = new Uint8Array(size * size * 4);
  if (background) {
    const c = COLOURS.get(background)!;
    for (let i = 0; i < size * size; i++) rgba.set([c[0], c[1], c[2], 255], i * 4);
  }
  const frame = d.frames.get("idle") ?? [...d.frames.values()][0]!;
  const ox = Math.floor((size - d.w * k) / 2);
  const oy = Math.floor((size - d.h * k) / 2);
  for (let y = 0; y < d.h * k; y++)
    for (let x = 0; x < d.w * k; x++) {
      const ch = frame[Math.floor(y / k)]![Math.floor(x / k)]!;
      if (ch === ".") continue;
      const c = COLOURS.get(ch)!;
      rgba.set([c[0], c[1], c[2], 255], ((oy + y) * size + ox + x) * 4);
    }
  fs.writeFileSync(path.join(root, "public", file), encodePng(size, size, rgba));
}
const markScale = all.has("mark") ? 1 : 1;
icon(16, markScale, null, "icon-16.png");
icon(32, 2 * markScale, null, "icon-32.png");
icon(32, 2 * markScale, null, "icon.png");
icon(180, 11, "G", "apple-icon.png");
icon(512, 32, "G", "icon-512.png");

// The 5x7 world font and the palette as data, for images the server draws at request time
// (certificates, share cards): bundled with the app, so no files are read at runtime.
{
  const font = all.get("font");
  const glyphs = font ? Object.fromEntries([...font.frames].map(([k, rows]) => [k, rows])) : {};
  const colours = Object.fromEntries([...COLOURS].map(([k, c]) => [k, c]));
  fs.mkdirSync(path.join(root, "generated"), { recursive: true });
  fs.writeFileSync(path.join(root, "generated", "pixel-data.json"), JSON.stringify({ font: { w: font?.w ?? 5, h: font?.h ?? 7, glyphs }, colours }));
}

// The OG image (REDESIGN.md 1.4): the town at dusk with the wordmark, 1200x630, rendered here from the
// same grids as everything else. The scene is drawn at the biggest whole-number scale that fits.
{
  const W = 1200;
  const H = 630;
  const rgba = new Uint8Array(W * H * 4);
  const bg = COLOURS.get("G")!;
  for (let i = 0; i < W * H; i++) rgba.set([bg[0], bg[1], bg[2], 255], i * 4);
  const plot = (x: number, y: number, ch: string) => {
    if (x < 0 || y < 0 || x >= W || y >= H || ch === ".") return;
    const c = COLOURS.get(ch);
    if (c) rgba.set([c[0], c[1], c[2], 255], (y * W + x) * 4);
  };
  const blit = (rows: string[], ox: number, oy: number, k: number, recolour?: string) => {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]!;
        if (ch === ".") continue;
        for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) plot(ox + x * k + dx, oy + y * k + dy, recolour ?? ch);
      }
    });
  };
  const sceneName = ["harbour-dusk", "harbour", "pier", "workshop2-night", "workshop-night"].find((n) => fs.existsSync(path.join(scenesDir, `${n}.json`)));
  let titleAt: [number, number] = [48, 48];
  if (sceneName) {
    const scene = JSON.parse(fs.readFileSync(path.join(scenesDir, `${sceneName}.json`), "utf8")) as SceneFile;
    const [sw, sh] = scene.size;
    const k = Math.max(1, Math.floor(Math.min(W / sw, H / sh)));
    const ox = Math.floor((W - sw * k) / 2);
    const oy = Math.floor((H - sh * k) / 2);
    const back = renderLayer(scene, all, "back");
    const front = renderLayer(scene, all, "front");
    blit(back.map((r, y) => r.map((ch, x) => (front[y]![x] !== "." ? front[y]![x]! : ch)).join("")), ox, oy, k);
    const t = scene.marks?.title;
    if (t) titleAt = [ox + t[0]! * k + 3 * k, oy + t[1]! * k + 3 * k];
  }
  // Text in the 5x7 world font, with a one-unit shadow so it reads over the sky.
  const font = all.get("font");
  const glyphName = (c: string) => ({ " ": "space", ".": "period", ",": "comma", "'": "apostrophe", "-": "hyphen", ":": "colon", "&": "ampersand", "?": "question", "/": "slash" })[c] ?? c;
  const write = (text: string, x: number, y: number, k: number, colour: string) => {
    if (!font) return;
    let cx = x;
    for (const c of text.toUpperCase()) {
      const g = font.frames.get(glyphName(c));
      if (g) {
        blit(g, cx + k, y + k, k, "G");
        blit(g, cx, y, k, colour);
      }
      cx += (font.w + 1) * k;
    }
  };
  const wordmark = all.get("wordmark");
  if (wordmark) {
    const frame = [...wordmark.frames.values()][0]!;
    blit(frame, titleAt[0], titleAt[1], 4);
    write(BRAND_TAGLINE, titleAt[0], titleAt[1] + wordmark.h * 4 + 18, 3, "M");
  } else {
    write(BRAND_NAME, titleAt[0], titleAt[1], 7, "N");
    write(BRAND_TAGLINE, titleAt[0], titleAt[1] + 7 * 7 + 18, 3, "M");
  }
  fs.writeFileSync(path.join(root, "public", "og.png"), encodePng(W, H, rgba));
}

// Pixel icons as SVG paths (REDESIGN.md 3.6), bundled with the app so they draw
// crisp at any whole-number size. Chalk (M) pixels become currentColor so a
// button can recolour its icon; other colours (the heart, the duck) stay as drawn.
{
  const iconSprites = [...all.values()].filter((sp) => sp.name.startsWith("icon-") || sp.name === "heart" || sp.name === "mark");
  const out: Record<string, { w: number; h: number; frames: Record<string, { fill: string; d: string }[]> }> = {};
  for (const sp of iconSprites) {
    const frames: Record<string, { fill: string; d: string }[]> = {};
    for (const [id, rows] of sp.frames) {
      const byColour = new Map<string, string[]>();
      rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
          const ch = row[x]!;
          if (ch === ".") {
            x++;
            continue;
          }
          let run = 1;
          while (x + run < row.length && row[x + run] === ch) run++;
          const fill = ch === "M" ? "currentColor" : `#${COLOURS.get(ch)!.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
          if (!byColour.has(fill)) byColour.set(fill, []);
          byColour.get(fill)!.push(`M${x} ${y}h${run}v1h-${run}z`);
          x += run;
        }
      });
      frames[id] = [...byColour].map(([fill, parts]) => ({ fill, d: parts.join("") }));
    }
    out[sp.name.replace(/^icon-/, "")] = { w: sp.w, h: sp.h, frames };
  }
  fs.mkdirSync(path.join(root, "generated"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "generated", "icons.ts"),
    `// GENERATED by scripts/build-sprites.ts from sprites/src/ui.txt. Do not edit.\nexport const ICONS: Record<string, { w: number; h: number; frames: Record<string, { fill: string; d: string }[]> }> = ${JSON.stringify(out)};\n`,
  );
}
console.log(`sprites: ${all.size} sheets, ${Object.keys(learner).length} learner parts, ${Object.keys(scenes).length} scenes`);
