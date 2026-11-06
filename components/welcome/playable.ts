// The six you can play as on "Who's playing?" and in Settings (lib/playas.ts): who they are, what
// they're into and a line in their voice, from CHARACTERS.md, and the signature moves they show
// off when you point at them (lib/pixel/gestures/signature.ts), the first one most of all.
import type { CastId } from "@/lib/playas";

export interface Playable {
  id: CastId;
  name: string;
  role: string;
  /** What they're into, to follow "Into": "racing cars and aerospace". */
  into: string;
  line: string;
  moves: string[];
}

export const PLAYABLE: Playable[] = [
  { id: "paul", name: "Paul", role: "The professor", into: "coding, AI and machine learning", line: "Build it ugly first. Then make it good.", moves: ["loss-curve", "robot-hold", "cap-push", "laptop-mug"] },
  { id: "neil", name: "Neil", role: "The teaching assistant", into: "racing cars and aerospace", line: "Every programmer has written this exact bug. Including Paul.", moves: ["rocket-launch", "helmet-show", "drone-fly", "steering-wheel"] },
  { id: "aaesha", name: "Aaesha", role: "Classmate", into: "how minds and machines think", line: "Before you run it, how will you know it worked?", moves: ["brain-model", "test-pass", "memory-pairs", "card-sort"] },
  { id: "caitlin", name: "Caitlin", role: "Classmate", into: "games, music, food and the fun version of everything", line: "It works. It's ugly. Shipping it.", moves: ["guitar-strum", "controller-victory", "cupcake-tray", "arcade-stick"] },
  { id: "riya", name: "Riya", role: "Classmate", into: "art, colour and pixel art", line: "Who's actually going to use this?", moves: ["paint-palette", "pixel-canvas", "framed-print", "camera-snap"] },
  { id: "yahya", name: "Yahya", role: "Classmate", into: "data, charts and a clean dataset", line: "Mine runs in 0.02 seconds. Yours?", moves: ["stopwatch-click", "bar-chart", "dice-roll", "double-peace"] },
];

export const playableOf = (id: string | null | undefined): Playable | undefined => PLAYABLE.find((p) => p.id === id);
