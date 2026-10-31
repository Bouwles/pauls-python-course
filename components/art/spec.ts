// The art pipeline's rules (REDESIGN-2.md 8.4): the kinds of image there are, the canvas each
// is drawn on, the sizes it's shown at, and how an id becomes a file name. <Art>, the /dev/art
// page, scripts/build-art-manifest.ts and scripts/check-art.ts all read them from here.
//
// Ids:
//   paul.portrait.pleased         a half-body portrait in one of the ten expressions
//   paul.body.standing            a full-body pose: "standing" or "action"
//   group.workshop                the whole class in the Workshop
//   clocktower.shell              the building around the floors (sky, walls, roof)
//   clocktower.floor3.open        a floor in a state: locked, open or busy (night)
//   clocktower.floor3.open.day    the same in daylight (optional)
//   avatar.hair.hijab             one part of the learner's avatar
//   shelf.bill-splitter           a project's Shelf object
//   duck                          the duck on Neil's desk
//
// File names: the id with every "." made "_", then ".png" (paul_portrait_pleased.png).
// Ids never contain "_", so the rule runs both ways.

import { FLOORS, type Floor } from "@/lib/cast";

export const EXPRESSIONS = ["neutral", "talking", "pleased", "proud", "thinking", "confused", "worried", "surprised", "laughing", "unimpressed"] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const POSES = ["standing", "action"] as const;
export type Pose = (typeof POSES)[number];

export const FLOOR_STATES = ["locked", "open", "busy"] as const;
export type FloorState = (typeof FLOOR_STATES)[number];

export type ArtKind = "portrait" | "body" | "group" | "tower" | "floor" | "avatar" | "shelf" | "duck";

export interface KindSpec {
  label: string;
  /** The master canvas, in pixels. Every exported PNG is exactly this size (the roof is taller). */
  width: number;
  height: number;
  /** A transparent background is required (check-art fails an opaque one). */
  transparent: boolean;
  /** The widths, in CSS pixels, it's shown at. */
  display: number[];
}

export const KINDS: Record<ArtKind, KindSpec> = {
  portrait: { label: "Portraits", width: 1024, height: 1024, transparent: true, display: [64, 128, 256, 512] },
  body: { label: "Full body", width: 1024, height: 2048, transparent: true, display: [180, 240, 360] },
  group: { label: "Group illustration", width: 2400, height: 1600, transparent: false, display: [480, 720, 960] },
  tower: { label: "Clocktower building", width: 2400, height: 4000, transparent: false, display: [240, 360, 600] },
  floor: { label: "Clocktower floors", width: 2400, height: 400, transparent: false, display: [360, 720, 1200] },
  avatar: { label: "Avatar parts", width: 1024, height: 1024, transparent: true, display: [32, 64, 128, 256] },
  shelf: { label: "Shelf objects", width: 512, height: 512, transparent: true, display: [32, 48, 64, 128] },
  duck: { label: "The duck", width: 512, height: 512, transparent: true, display: [24, 48, 96] },
};

/** The roof (the clock face and the terrace) is twice the height of a floor. */
export const ROOF_HEIGHT = 800;

export const fileFor = (id: string) => `${id.replace(/\./g, "_")}.png`;
export const idForFile = (file: string) => file.replace(/\.png$/i, "").replace(/_/g, ".");

/** "ground", "floor1" to "floor7", "roof": the names the building uses for its floors. */
export function floorKey(act: number): string {
  if (act <= 1) return "ground";
  if (act >= FLOORS.length) return "roof";
  return `floor${act - 1}`;
}

export function floorByKey(key: string): Floor | undefined {
  return FLOORS.find((f) => floorKey(f.act) === key);
}

export const portraitId = (who: string, expression: Expression = "neutral") => `${who}.portrait.${expression}`;
export const bodyId = (who: string, pose: Pose = "standing") => `${who}.body.${pose}`;
export const shelfId = (jobId: string) => `shelf.${jobId}`;
export const floorId = (act: number, state: FloorState, day = false) => `clocktower.${floorKey(act)}.${state}${day ? ".day" : ""}`;

export interface ParsedId {
  kind: ArtKind;
  /** The character it shows, for portraits and full-body poses. */
  who?: string;
  expression?: string;
  pose?: string;
  floor?: Floor;
  state?: string;
  day?: boolean;
  part?: string;
  option?: string;
  project?: string;
}

/** What an id names, or null for one that isn't in the grammar above. */
export function parseArtId(id: string): ParsedId | null {
  const [a, b, c, d] = id.split(".");
  if (!a) return null;
  if (a === "duck" && !b) return { kind: "duck" };
  if (a === "group" && b) return { kind: "group" };
  if (a === "shelf" && b) return { kind: "shelf", project: b };
  if (a === "avatar" && b) return { kind: "avatar", part: b, option: c };
  if (a === "clocktower" && b === "shell") return { kind: "tower", day: c === "day" };
  if (a === "clocktower" && b && c) {
    const floor = floorByKey(b);
    return floor ? { kind: "floor", floor, state: c, day: d === "day" } : null;
  }
  if (b === "portrait" && c) return { kind: "portrait", who: a, expression: c };
  if (b === "body" && c) return { kind: "body", who: a, pose: c };
  return null;
}

/** One image in art/manifest.json. */
export interface ManifestEntry {
  id: string;
  file: string;
  kind: ArtKind;
  size: { width: number; height: number };
  transparent: boolean;
  /** Who it shows (for a floor, who lives there first; null for things). */
  character: string | null;
  /** The expression, pose, floor state, avatar option or project it shows. */
  expression?: Expression | "crown";
  pose?: Pose;
  state?: FloorState;
  time?: "night" | "day";
  part?: string;
  option?: string;
  project?: string;
  /** What to draw, for the artist. */
  notes: string;
  /** Widths, in CSS pixels, the app shows it at. */
  display: number[];
  /** False for nice-to-haves (the daylight Clocktower, the hair layers behind the head). */
  required: boolean;
  status: "placeholder" | "final";
}

export interface Manifest {
  about: string;
  naming: string;
  entries: ManifestEntry[];
}

/** The canvas an id is drawn on. */
export function canvasFor(id: string): { width: number; height: number } | null {
  const p = parseArtId(id);
  if (!p) return null;
  const k = KINDS[p.kind];
  if (p.kind === "floor" && p.floor?.act === FLOORS.length) return { width: k.width, height: ROOF_HEIGHT };
  return { width: k.width, height: k.height };
}
