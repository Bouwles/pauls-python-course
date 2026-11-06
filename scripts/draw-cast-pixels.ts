// Renders the pixel people (lib/pixel/people.ts) to PNG sheets in art/pixel-reference/: the cast
// as picked, every expression and pose, and every avatar hair style. The app
// draws the same people live; these sheets are for looking at them all at once.
//   npx tsx scripts/draw-cast-pixels.ts
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { drawPerson, EXPRESSIONS, H, POSES, toRGBA, W, type Moment, type PersonLook } from "../lib/pixel/people";
import { CAST_LOOKS, avatarToLook } from "../lib/pixel/looks";
import { defaultAvatar, HAIR_STYLES } from "../lib/avatar";
import { castColour } from "../lib/cast";

const OUT = path.join(process.cwd(), "art", "pixel-reference");
const SCALE = 10;

async function tile(look: PersonLook, m: Moment, bg: string, scale = SCALE): Promise<Buffer> {
  const pad = 4;
  const w = W + pad * 2;
  const h = H + pad;
  const raw = Buffer.alloc(w * h * 4);
  const [br, bgc, bb] = [parseInt(bg.slice(1, 3), 16), parseInt(bg.slice(3, 5), 16), parseInt(bg.slice(5, 7), 16)];
  const px = toRGBA(drawPerson(look, m));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const gx = x - pad;
      const gy = y - pad;
      const j = (gy * W + gx) * 4;
      const inside = gx >= 0 && gy >= 0 && gx < W && gy < H && px[j + 3];
      raw[i] = inside ? px[j]! : br;
      raw[i + 1] = inside ? px[j + 1]! : bgc;
      raw[i + 2] = inside ? px[j + 2]! : bb;
      raw[i + 3] = 255;
    }
  return sharp(raw, { raw: { width: w, height: h, channels: 4 } }).resize(w * scale, h * scale, { kernel: "nearest" }).png().toBuffer();
}

async function grid(file: string, tiles: Buffer[], cols: number, scale = SCALE) {
  const tw = (W + 8) * scale;
  const th = (H + 4) * scale;
  const gap = Math.round(scale * 2.4);
  const rows = Math.ceil(tiles.length / cols);
  const comps = tiles.map((input, i) => ({ input, left: gap + (i % cols) * (tw + gap), top: gap + Math.floor(i / cols) * (th + gap) }));
  const out = await sharp({ create: { width: cols * tw + (cols + 1) * gap, height: rows * th + (rows + 1) * gap, channels: 4, background: "#0F1115" } }).composite(comps).png().toBuffer();
  fs.writeFileSync(path.join(OUT, file), out);
  console.log(`art/pixel-reference/${file}`);
}

const light = (hex: string) => {
  const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) + (255 - parseInt(hex.slice(i, i + 2), 16)) * 0.35));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
};

fs.mkdirSync(OUT, { recursive: true });
const ids = Object.keys(CAST_LOOKS);
const cast: Buffer[] = [];
for (const id of ids) {
  const png = await tile(CAST_LOOKS[id]!, {}, light(castColour(id).face));
  fs.writeFileSync(path.join(OUT, `${id}.png`), png);
  cast.push(png);
}
await grid("cast-sheet.png", cast, 3);

// Every expression, for each of the cast, one row each.
const faces: Buffer[] = [];
for (const id of ids) for (const e of EXPRESSIONS) faces.push(await tile(CAST_LOOKS[id]!, { expression: e, open: e === "talking" }, light(castColour(id).face), 4));
await grid("expressions-sheet.png", faces, EXPRESSIONS.length, 4);

// Every pose, two beats each, for each of the cast.
const poses: Buffer[] = [];
for (const id of ids) for (const pose of POSES) poses.push(await tile(CAST_LOOKS[id]!, { pose, beat: 1, expression: pose === "cheer" ? "laughing" : pose === "think" ? "thinking" : "pleased" }, light(castColour(id).face), 4));
await grid("poses-sheet.png", poses, POSES.length, 4);

// Every avatar hair style, on the default avatar.
const hair: Buffer[] = [];
for (const h of HAIR_STYLES) hair.push(await tile(avatarToLook({ ...defaultAvatar(), hair: h.id }), {}, "#7FA6F0", 4));
await grid("avatar-hair-sheet.png", hair, 6, 4);
