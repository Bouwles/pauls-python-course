// Exports every cast member's animations as GIFs, drawn by the same engine the course uses
// (lib/pixel). One folder per character:
//   <Name>/Emotions/<feeling>.gif          saying a real line with that feeling, mouth in time, blinks
//   <Name>/Emotions/<feeling> quiet.gif    the feeling at rest, blinking
//   <Name>/Gestures/<gesture>.gif          every head-and-shoulders gesture they make, looping
//   <Name>/Moves/<action> (<view>).gif     every full-body action, in every view it has
// People stand still and level throughout: only faces, arms, hands, legs and props move.
//   npx tsx scripts/export-cast-animations.ts [output folder]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { drawPerson, EXPRESSIONS, H, toRGBA, W, type Expression, type Moment, type PersonLook } from "../lib/pixel/people";
import { gesturesFor } from "../lib/pixel/gestures";
import { allActions, drawFigure, figureRGBA, FH, FW, type View } from "../lib/pixel/figures";
import { CAST_LOOKS } from "../lib/pixel/looks";
import { castColour } from "../lib/cast";
import { mouthFor } from "../lib/mood";

// The owner keeps the folder in the project (it's ignored by git: it's big, and made from the code).
const OUT = process.argv[2] ?? path.join(process.cwd(), "Paul's Python Course Cast");
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
  excited: "Can't wait to see this one run.",
  determined: "Right then. This time, properly.",
  focused: "Line by line. Carefully now.",
  curious: "What if we tried it with a dictionary?",
  smug: "Of course it's faster. It's mine.",
  mischievous: "Watch this. Don't tell Paul.",
  embarrassed: "Sorry. That was my bug.",
  nervous: "Fingers crossed it passes this time.",
  sad: "It's gone. The whole file.",
  relieved: "Phew. Finally, it passes.",
  sleepy: "It's late. One more test, then bed.",
  annoyed: "Ugh. The same error, again.",
};

const tint = (hex: string, t = 0.35) =>
  [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * t);
  });

/** Pixels on a coloured background, padded, scaled up crisp, as PNG. */
async function framePng(px: Uint8ClampedArray, w: number, h: number, bg: number[]): Promise<Buffer> {
  const fw = w + PAD * 2;
  const fh = h + PAD;
  const raw = Buffer.alloc(fw * fh * 4);
  for (let y = 0; y < fh; y++)
    for (let x = 0; x < fw; x++) {
      const i = (y * fw + x) * 4;
      const gx = x - PAD;
      const gy = y - PAD;
      const j = (gy * w + gx) * 4;
      const on = gx >= 0 && gy >= 0 && gx < w && gy < h && px[j + 3];
      raw[i] = on ? px[j]! : bg[0]!;
      raw[i + 1] = on ? px[j + 1]! : bg[1]!;
      raw[i + 2] = on ? px[j + 2]! : bg[2]!;
      raw[i + 3] = 255;
    }
  return sharp(raw, { raw: { width: fw, height: fh, channels: 4 } }).resize(fw * SCALE, fh * SCALE, { kernel: "nearest" }).png().toBuffer();
}

const bust = (look: PersonLook, m: Moment, bg: number[]) => framePng(toRGBA(drawPerson(look, m)), W, H, bg);

async function gif(file: string, frames: Buffer[], delays: number[]) {
  await sharp(frames, { join: { animated: true } }).gif({ delay: delays, loop: 0, effort: 4 }).toFile(file);
}

/** Saying a line: two letters a frame, the mouth shaped by the louder of them, a beat at stops. */
function talkFrames(text: string): { open: 0 | 1 | 2; ms: number; blink?: boolean }[] {
  const out: { open: 0 | 1 | 2; ms: number; blink?: boolean }[] = [{ open: 0, ms: 300 }];
  for (let i = 0; i < text.length; i += 2) {
    const pair = text.slice(i, i + 2);
    const open = Math.max(mouthFor(pair[0]), mouthFor(pair[1])) as 0 | 1 | 2;
    const stop = /[.?!]/.test(pair) ? 320 : /[,]/.test(pair) ? 180 : 0;
    out.push({ open, ms: 70 });
    if (stop) out.push({ open: 0, ms: stop });
  }
  out.push({ open: 0, ms: 140, blink: true }, { open: 0, ms: 700 });
  return out;
}

/** Filenames can't hold a slash. */
const safe = (s: string) => s.replace(/[/\\:]/g, "-");

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  let total = 0;
  const lists: string[] = [];
  for (const [id, look] of Object.entries(CAST_LOOKS)) {
    const name = NAMES[id] ?? id;
    const bg = tint(castColour(id).face);
    const dirs = { emotions: path.join(OUT, name, "Emotions"), gestures: path.join(OUT, name, "Gestures"), moves: path.join(OUT, name, "Moves") };
    for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true });
    let count = 0;

    // Feelings: talking, and quiet.
    for (const e of EXPRESSIONS) {
      const talk = talkFrames(LINES[e]);
      const frames: Buffer[] = [];
      for (const f of talk) frames.push(await bust(look, { expression: e, open: f.open, blink: f.blink }, bg));
      await gif(path.join(dirs.emotions, `${e}.gif`), frames, talk.map((f) => f.ms));
      const quiet = [{ ms: 1400 }, { ms: 120, blink: true }, { ms: 1800 }];
      const qf: Buffer[] = [];
      for (const f of quiet) qf.push(await bust(look, { expression: e, blink: f.blink }, bg));
      await gif(path.join(dirs.emotions, `${e} quiet.gif`), qf, quiet.map((f) => f.ms));
      count += 2;
    }

    // Gestures: everything they can do, their own moves included.
    const own: string[] = [];
    for (const g of gesturesFor(id)) {
      const face = g.faces?.[0] ?? "neutral";
      // At least two seconds of loop, with one blink near the end.
      const loops = Math.max(1, Math.ceil(2000 / (g.beats * g.ms)));
      const frames: Buffer[] = [];
      const delays: number[] = [];
      for (let l = 0; l < loops; l++)
        for (let beat = 0; beat < g.beats; beat++) {
          const blink = l === loops - 1 && beat === g.beats - 1 && face !== "laughing";
          frames.push(await bust(look, { expression: face, pose: g.id, beat, blink }, bg));
          delays.push(g.ms);
        }
      await gif(path.join(dirs.gestures, `${safe(g.id)}.gif`), frames, delays);
      if (g.who) own.push(g.id);
      count++;
    }

    // Full-body moves, in every view each has.
    for (const a of allActions()) {
      for (const view of a.views as View[]) {
        const loops = Math.max(1, Math.ceil(2000 / (a.frames * a.ms)));
        const frames: Buffer[] = [];
        const delays: number[] = [];
        for (let l = 0; l < loops; l++)
          for (let f = 0; f < a.frames; f++) {
            const blink = !a.blinks && l === loops - 1 && f === a.frames - 1;
            frames.push(await framePng(figureRGBA(drawFigure(look, { action: a.id, frame: f, view, blink })), FW, FH, bg));
            delays.push(a.ms);
          }
        await gif(path.join(dirs.moves, `${safe(a.id)} (${view}).gif`), frames, delays);
        count++;
      }
    }
    total += count;
    lists.push(`  ${name}: ${count} animations. Their own gestures: ${own.join(", ")}.`);
    console.log(`${name}: ${count}`);
  }

  fs.writeFileSync(
    path.join(OUT, "README.txt"),
    [
      "The cast of Paul's Python Course, animated by the same code the course uses.",
      `${total} animations in all (GIFs; press space in Finder to play one).`,
      "",
      "Each person has three folders:",
      `  Emotions: each of ${EXPRESSIONS.length} feelings twice: talking (saying a real line, the mouth in time with the words) and quiet (at rest, blinking).`,
      "  Gestures: every head-and-shoulders gesture they make: the everyday ones anyone can do, and their own, tied to what they're into.",
      "  Moves: full-body sprites: walking, running, sitting at a desk, reading, dancing, carrying, their own hobby, in each view.",
      "",
      ...lists,
      "",
      "Nobody bounces: people stand still and level, and only faces, arms, hands, legs and props move.",
      "To make them again after a change: npx tsx scripts/export-cast-animations.ts",
      "",
    ].join("\n"),
  );
  console.log(`${total} animations written to ${OUT}`);
}

main();
