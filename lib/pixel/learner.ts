// Composes the learner's character from layered parts (sprites/src/learner),
// recolouring coat (A B C) and jumper (D E F) from the palette ramps.
// Pure: returns RGBA pixels, so it works in the browser and in Node.
import type { CharacterLook } from "../store/types";

export interface LearnerPart {
  w: number;
  h: number;
  anchor: [number, number];
  fps: number;
  frames: Record<string, string[]>;
  anims: Record<string, string[]>;
}

export interface LearnerData {
  parts: Record<string, LearnerPart>;
  colours: Record<string, string>;
  ramps: { coat: Record<string, string[]>; jumper: Record<string, string[]> };
}

export const LEARNER_W = 32;
export const LEARNER_H = 37;
export type Pose = "stand" | "sit" | "walk";

export const SPECIES = ["otter", "hare", "badger", "fox", "heron", "mole", "seal", "frog"] as const;
export const ACCESSORIES = ["none", "scarf", "beanie", "glasses", "flat-cap", "headphones"] as const;

/** Where the head sits on each body frame (sitting shifts it forward a touch). */
const HEAD_OFFSET: Record<string, [number, number]> = {
  "stand-1": [8, 0],
  "stand-2": [8, -1],
  "sit-1": [8, 0],
  "sit-2": [8, 0],
  "walk-1": [8, 0],
  "walk-2": [8, -1],
  "walk-3": [8, 0],
  "walk-4": [8, -1],
};

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

export function defaultLook(): CharacterLook {
  return { species: "otter", coat: "chestnut", jumper: "brick", accessory: "none" };
}

export function composeLearner(
  data: LearnerData,
  look: CharacterLook,
  bodyFrame: string,
  headFrame: "open" | "blink" = "open",
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(LEARNER_W * LEARNER_H * 4);
  const coat = data.ramps.coat[look.coat] ?? Object.values(data.ramps.coat)[0]!;
  const jumper = data.ramps.jumper[look.jumper] ?? Object.values(data.ramps.jumper)[0]!;
  const map: Record<string, string> = { A: coat[0]!, B: coat[1]!, C: coat[2]!, D: jumper[0]!, E: jumper[1]!, F: jumper[2]! };
  const paint = (rows: string[] | undefined, ox: number, oy: number) => {
    if (!rows) return;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y]!;
      for (let x = 0; x < row.length; x++) {
        let ch = row[x]!;
        if (ch === ".") continue;
        ch = map[ch] ?? ch;
        const hex = data.colours[ch];
        const px = ox + x;
        const py = oy + y;
        if (!hex || px < 0 || py < 0 || px >= LEARNER_W || py >= LEARNER_H) continue;
        const [r, g, b] = hexToRgb(hex);
        const i = (py * LEARNER_W + px) * 4;
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = 255;
      }
    }
  };
  const [hx, hy] = HEAD_OFFSET[bodyFrame] ?? [8, 0];
  paint(data.parts.body?.frames[bodyFrame], 0, 17);
  // The lighthouse keeper's coat (earned in the lamp room): brass buttons and collar over the jumper.
  if (look.jumper === "keeper") paint(data.parts["trim-keeper"]?.frames[bodyFrame], 0, 17);
  paint(data.parts[`head-${look.species}`]?.frames[headFrame], hx, hy);
  if (look.accessory !== "none") paint(data.parts[`acc-${look.accessory}`]?.frames.on, hx, hy);
  return out;
}
