// Loading built sprite sheets and scenes (public/sprites).
import type { LearnerData } from "@/lib/pixel/learner";

export interface SheetMeta {
  name: string;
  w: number;
  h: number;
  fps: number;
  anchor: [number, number];
  frames: Record<string, number>;
  anims: Record<string, number[]>;
}

export interface Sheet {
  meta: SheetMeta;
  img: HTMLImageElement;
}

export interface SceneMeta {
  name: string;
  w: number;
  h: number;
  back: string;
  front?: string;
  marks: Record<string, number[]>;
}

const sheets = new Map<string, Promise<Sheet>>();
let index: Promise<{ sprites: Record<string, SheetMeta>; scenes: Record<string, SceneMeta> }> | null = null;
let learner: Promise<LearnerData> | null = null;
const images = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`could not load ${src}`));
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

export function loadIndex() {
  if (!index) index = fetch("/sprites/index.json").then((r) => r.json());
  return index;
}

export function loadSheet(name: string): Promise<Sheet> {
  let p = sheets.get(name);
  if (!p) {
    p = (async () => {
      const idx = await loadIndex();
      const meta = idx.sprites[name];
      if (!meta) throw new Error(`no sprite ${name}`);
      return { meta, img: await loadImage(`/sprites/${name}.png`) };
    })();
    sheets.set(name, p);
  }
  return p;
}

export async function loadScene(name: string): Promise<{ meta: SceneMeta; back: HTMLImageElement; front: HTMLImageElement | null }> {
  const idx = await loadIndex();
  const meta = idx.scenes[name];
  if (!meta) throw new Error(`no scene ${name}`);
  const [back, front] = await Promise.all([loadImage(`/sprites/${meta.back}`), meta.front ? loadImage(`/sprites/${meta.front}`) : Promise.resolve(null)]);
  return { meta, back, front };
}

export function loadLearnerData(): Promise<LearnerData> {
  if (!learner) learner = fetch("/sprites/learner.json").then((r) => r.json());
  return learner;
}

/** The biggest whole-number scale that fits, never below 1. Sprites are never scaled fractionally. */
export function integerScale(contentW: number, availableW: number, max = 6): number {
  return Math.max(1, Math.min(max, Math.floor(availableW / contentW)));
}
