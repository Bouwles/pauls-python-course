// The README's pixel art, drawn by the same engine the course uses (lib/pixel): an animated strip
// of the whole class doing their own moves (docs/readme/cast.gif), and a portrait of each
// (docs/readme/<id>.png). Run after changing a look or a gesture.
//   npx tsx scripts/build-readme-art.ts
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { drawPerson, H, toRGBA, W, type Expression } from "../lib/pixel/people";
import { gestureOf } from "../lib/pixel/gestures";
import { CAST_LOOKS } from "../lib/pixel/looks";
import { castColour } from "../lib/cast";

const OUT = path.join(process.cwd(), "docs", "readme");
fs.mkdirSync(OUT, { recursive: true });
const SCALE = 4;
const PAD = 3;

// Each person and a move of their own, with a face to match.
const STRIP: [string, string, Expression][] = [
  ["paul", "chalk-write", "focused"],
  ["neil", "rocket-launch", "excited"],
  ["aaesha", "test-pass", "pleased"],
  ["caitlin", "guitar-strum", "laughing"],
  ["riya", "paint-palette", "pleased"],
  ["yahya", "stopwatch-click", "smug"],
];

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tint = (hex: string, t = 0.35) => hexRgb(hex).map((v) => Math.round(v + (255 - v) * t));

/** One person at one moment, on their colour, as raw RGBA (W + 2*PAD wide, H + PAD tall). */
function tile(who: string, pose: string, beat: number, expression: Expression, blink = false): Buffer {
  const w = W + PAD * 2;
  const h = H + PAD;
  const bg = tint(castColour(who).face);
  const px = toRGBA(drawPerson(CAST_LOOKS[who]!, { expression, pose, beat, blink }));
  const raw = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const gx = x - PAD;
      const gy = y - PAD;
      const j = (gy * W + gx) * 4;
      const on = gx >= 0 && gy >= 0 && gx < W && gy < H && px[j + 3];
      raw[i] = on ? px[j]! : bg[0]!;
      raw[i + 1] = on ? px[j + 1]! : bg[1]!;
      raw[i + 2] = on ? px[j + 2]! : bg[2]!;
      raw[i + 3] = 255;
    }
  return raw;
}

async function main() {
  const tw = W + PAD * 2;
  const th = H + PAD;
  const gap = 2;
  const width = (tw + gap) * STRIP.length - gap;
  // A loop long enough for every move to play through at least once, at the clock's 130 ms.
  const FRAMES = 36;
  const frames: Buffer[] = [];
  for (let f = 0; f < FRAMES; f++) {
    const sheet = Buffer.alloc(width * th * 4, 0);
    for (let i = 3; i < sheet.length; i += 4) sheet[i] = 255;
    STRIP.forEach(([who, pose, face], n) => {
      const g = gestureOf(pose);
      // Each move at its own speed: how many 130 ms ticks one beat lasts.
      const ticks = Math.max(1, Math.round(g.ms / 130));
      const beat = Math.floor(f / ticks) % g.beats;
      const t = tile(who, pose, beat, face, f === 20 + n);
      for (let y = 0; y < th; y++) t.copy(sheet, (y * width + n * (tw + gap)) * 4, y * tw * 4, (y + 1) * tw * 4);
    });
    frames.push(await sharp(sheet, { raw: { width, height: th, channels: 4 } }).resize(width * SCALE, th * SCALE, { kernel: "nearest" }).png().toBuffer());
  }
  await sharp(frames, { join: { animated: true } }).gif({ delay: frames.map(() => 130), loop: 0, effort: 7 }).toFile(path.join(OUT, "cast.gif"));
  console.log("docs/readme/cast.gif");

  for (const [who] of STRIP) {
    await sharp(tile(who, "idle", 0, "pleased"), { raw: { width: tw, height: th, channels: 4 } }).resize(tw * 3, th * 3, { kernel: "nearest" }).png().toFile(path.join(OUT, `${who}.png`));
  }
  console.log("docs/readme/<id>.png for the six");
}

main();
