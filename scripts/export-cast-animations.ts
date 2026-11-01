// Exports every cast member's emotions and gestures as animated GIFs, drawn by the same engine the
// course uses (lib/pixel/people.ts). One folder per character:
//   <Name>/Emotions/<emotion>.gif         talking with that feeling: a real line, mouth in time, blinks
//   <Name>/Emotions/<emotion> quiet.gif   the feeling at rest: breathing and blinking
//   <Name>/Gestures/<gesture>.gif         the gesture, looping
//   npx tsx scripts/export-cast-animations.ts [output folder]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { drawPerson, EXPRESSIONS, H, POSES, toRGBA, W, type Expression, type Moment, type PersonLook, type Pose } from "../lib/pixel/people";
import { CAST_LOOKS } from "../lib/pixel/looks";
import { castColour } from "../lib/cast";
import { mouthFor } from "../lib/mood";

const OUT = process.argv[2] ?? path.join(os.homedir(), "Desktop", "Paul's Python Course Cast");
const SCALE = 8;
const PAD = 4;
const NAMES: Record<string, string> = { paul: "Paul", neil: "Neil", aaesha: "Aaesha", caitlin: "Caitlin", riya: "Riya", yahya: "Yahya" };

// A line for each feeling, so the mouth has real words to say.
const LINES: Record<Expression, string> = {
  neutral: "Right. Let's have a look at this one.",
  talking: "So the loop runs once for every item in the list.",
  pleased: "That works. Nicely done, really.",
  proud: "Look at that. First try, all of it.",
  thinking: "Hmm. What happens if the list is empty?",
  confused: "Wait, why is that printing twice?",
  worried: "Oh no. I think I broke the build.",
  surprised: "Oh. It actually ran. Fast, too.",
  laughing: "Ha, no, that's brilliant. Do it again.",
  unimpressed: "Sure. And what if someone types zero?",
};
const GESTURE_FACE: Record<Pose, Expression> = { idle: "neutral", wave: "pleased", cheer: "laughing", think: "thinking", point: "pleased", thumbs: "proud" };

const tint = (hex: string, t = 0.35) =>
  [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * t);
  });

/** One frame: the person at a moment, on their colour, lifted `lift` pixels (a breath). */
async function frame(look: PersonLook, m: Moment, bg: number[], lift = 0): Promise<Buffer> {
  const w = W + PAD * 2;
  const h = H + PAD + 1;
  const raw = Buffer.alloc(w * h * 4);
  const px = toRGBA(drawPerson(look, m));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const gx = x - PAD;
      const gy = y - PAD - 1 + lift;
      const j = (gy * W + gx) * 4;
      const on = gx >= 0 && gy >= 0 && gx < W && gy < H && px[j + 3];
      raw[i] = on ? px[j]! : bg[0]!;
      raw[i + 1] = on ? px[j + 1]! : bg[1]!;
      raw[i + 2] = on ? px[j + 2]! : bg[2]!;
      raw[i + 3] = 255;
    }
  return sharp(raw, { raw: { width: w, height: h, channels: 4 } }).resize(w * SCALE, h * SCALE, { kernel: "nearest" }).png().toBuffer();
}

async function gif(file: string, frames: Buffer[], delays: number[]) {
  await sharp(frames, { join: { animated: true } }).gif({ delay: delays, loop: 0, effort: 7 }).toFile(file);
}

/** Saying a line: two letters a frame, the mouth shaped by the louder of them, a beat at stops. */
function talkFrames(text: string): { open: 0 | 1 | 2; ms: number; blink?: boolean; lift: number }[] {
  const out: { open: 0 | 1 | 2; ms: number; blink?: boolean; lift: number }[] = [{ open: 0, ms: 300, lift: 0 }];
  for (let i = 0; i < text.length; i += 2) {
    const pair = text.slice(i, i + 2);
    const open = Math.max(mouthFor(pair[0]), mouthFor(pair[1])) as 0 | 1 | 2;
    const stop = /[.?!]/.test(pair) ? 320 : /[,]/.test(pair) ? 180 : 0;
    out.push({ open, ms: 70, lift: Math.floor(i / 16) % 2 });
    if (stop) out.push({ open: 0, ms: stop, lift: Math.floor(i / 16) % 2 });
  }
  out.push({ open: 0, ms: 140, blink: true, lift: 0 });
  out.push({ open: 0, ms: 700, lift: 0 });
  return out;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const [id, look] of Object.entries(CAST_LOOKS)) {
  const name = NAMES[id] ?? id;
  const bg = tint(castColour(id).face);
  const emotions = path.join(OUT, name, "Emotions");
  const gestures = path.join(OUT, name, "Gestures");
  fs.mkdirSync(emotions, { recursive: true });
  fs.mkdirSync(gestures, { recursive: true });

  for (const e of EXPRESSIONS) {
    // Talking.
    const talk = talkFrames(LINES[e]);
    const frames: Buffer[] = [];
    for (const f of talk) frames.push(await frame(look, { expression: e, open: f.open, blink: f.blink }, bg, f.lift));
    await gif(path.join(emotions, `${e}.gif`), frames, talk.map((f) => f.ms));
    // Quiet: a breath in and out, and a blink.
    const quiet = [
      { lift: 0, ms: 700 },
      { lift: 1, ms: 700 },
      { lift: 1, ms: 120, blink: true },
      { lift: 1, ms: 500 },
      { lift: 0, ms: 900 },
      { lift: 1, ms: 800 },
    ];
    const qf: Buffer[] = [];
    for (const f of quiet) qf.push(await frame(look, { expression: e, blink: f.blink }, bg, f.lift));
    await gif(path.join(emotions, `${e} quiet.gif`), qf, quiet.map((f) => f.ms));
  }

  for (const g of POSES) {
    const beats = g === "wave" ? 12 : g === "cheer" ? 10 : 8;
    const ms = g === "wave" ? 130 : g === "cheer" ? 200 : g === "idle" ? 450 : 280;
    const frames: Buffer[] = [];
    const delays: number[] = [];
    for (let beat = 0; beat < beats; beat++) {
      const face = GESTURE_FACE[g];
      // Cheering laughs out loud; waving says hello.
      const open = g === "cheer" ? (beat % 2 ? 2 : 0) : g === "wave" ? ([0, 2, 1, 0, 0, 0] as const)[beat % 6]! : 0;
      frames.push(await frame(look, { expression: face, pose: g, beat, blink: beat === beats - 2, open }, bg, g === "cheer" ? beat % 2 : Math.floor(beat / 3) % 2));
      delays.push(beat === beats - 2 ? 120 : ms);
    }
    await gif(path.join(gestures, `${g}.gif`), frames, delays);
  }
  console.log(`${name}: ${EXPRESSIONS.length} emotions (talking and quiet), ${POSES.length} gestures`);
}

fs.writeFileSync(
  path.join(OUT, "README.txt"),
  [
    "The cast of Paul's Python Course, animated by the same code the course uses.",
    "",
    "Each person has two folders of animations (GIFs; press space in Finder to play one):",
    "  Emotions: each feeling twice: talking (saying a real line, the mouth in time with the words,",
    `    with blinks and breaths) and quiet (at rest). Feelings: ${EXPRESSIONS.join(", ")}.`,
    `  Gestures: ${POSES.join(", ")}.`,
    "",
    "To make them again after a change: npx tsx scripts/export-cast-animations.ts",
    "",
  ].join("\n"),
);
console.log(`Written to ${OUT}`);
