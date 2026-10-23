// Writes sprites/preview/learner-all.png: every species, several looks, for review.
import fs from "node:fs";
import path from "node:path";
import { composeLearner, LEARNER_H, LEARNER_W, SPECIES, type LearnerData } from "../lib/pixel/learner";
import { encodePng } from "../lib/pixel/png";
import type { CharacterLook } from "../lib/store/types";

const data = JSON.parse(fs.readFileSync(path.join("public", "sprites", "learner.json"), "utf8")) as LearnerData;
const coats = Object.keys(data.ramps.coat);
const jumpers = Object.keys(data.ramps.jumper);
const accs = ["none", "scarf", "beanie", "glasses", "flat-cap", "headphones"] as const;
const rows: { look: CharacterLook; frame: string }[][] = [
  SPECIES.map((s, i) => ({ look: { species: s, coat: coats[i % coats.length]!, jumper: jumpers[i % jumpers.length]!, accessory: "none" }, frame: "stand-1" })),
  SPECIES.map((s, i) => ({ look: { species: s, coat: coats[(i + 2) % coats.length]!, jumper: jumpers[(i + 3) % jumpers.length]!, accessory: accs[(i % 5) + 1]! }, frame: "stand-1" })),
  SPECIES.map((s, i) => ({ look: { species: s, coat: coats[(i + 4) % coats.length]!, jumper: jumpers[(i + 1) % jumpers.length]!, accessory: "none" }, frame: i % 2 ? "sit-1" : "walk-1" })),
];
const k = 4;
const cols = SPECIES.length;
const W = cols * (LEARNER_W + 4);
const H = rows.length * (LEARNER_H + 4);
const sheet = new Uint8Array(W * H * 4);
rows.forEach((row, r) =>
  row.forEach((cell, c) => {
    const px = composeLearner(data, cell.look, cell.frame);
    for (let y = 0; y < LEARNER_H; y++)
      for (let x = 0; x < LEARNER_W; x++) {
        const s = (y * LEARNER_W + x) * 4;
        if (px[s + 3] === 0) continue;
        const d = ((r * (LEARNER_H + 4) + 2 + y) * W + c * (LEARNER_W + 4) + 2 + x) * 4;
        sheet.set(px.subarray(s, s + 4), d);
      }
  }),
);
const big = new Uint8Array(W * k * H * k * 4);
for (let y = 0; y < H * k; y++)
  for (let x = 0; x < W * k; x++) {
    const s = (Math.floor(y / k) * W + Math.floor(x / k)) * 4;
    const d = (y * W * k + x) * 4;
    if (sheet[s + 3] === 0) big.set([235, 229, 213, 255], d);
    else big.set(sheet.subarray(s, s + 4), d);
  }
fs.mkdirSync(path.join("sprites", "preview"), { recursive: true });
fs.writeFileSync(path.join("sprites", "preview", "learner-all.png"), encodePng(W * k, H * k, big));
console.log("wrote sprites/preview/learner-all.png");
