// Choosing what someone does for a moment outside a line of dialogue: a gesture for a bust
// (lib/pixel/variety.ts, with the face it comes with) or an action for a full-body figure
// (lib/pixel/figures.ts). The same seed gives the same choice; pass the last one as `avoid` so
// nothing comes twice running, and a seed from useVisit (lib/useVisit.ts) so a screen looks
// different on every visit.
import { allActions, type FigureTag } from "./pixel/figures";
import { gestureOf } from "./pixel/gestures";
import type { Expression } from "./pixel/people";
import { hash, pickGesture, type PickOptions } from "./pixel/variety";

/** A gesture for a moment and its face: the gesture's own when it brings one, else `face`. */
export function momentFor(opts: PickOptions, face: Expression): { gesture: string; face: Expression } {
  const gesture = pickGesture(opts);
  return { gesture, face: gestureOf(gesture).faces?.[0] ?? face };
}

/**
 * A full-body action with one of `tags`. Someone's own actions (Neil's rocket, Caitlin's guitar)
 * count three times and someone else's half; `only` limits the choice to those ids, in case a scene has room for some
 * and not others.
 */
export function pickAction({ who, tags, seed, avoid = [], only }: { who?: string; tags: FigureTag[]; seed: string; avoid?: (string | undefined)[]; only?: string[] }): string {
  const fits = allActions().filter((a) => a.tags.some((t) => tags.includes(t)) && (!only || only.includes(a.id)));
  const fresh = fits.filter((a) => !avoid.includes(a.id));
  const pool = fresh.length ? fresh : fits;
  if (!pool.length) return "stand";
  const weight = (owner?: string) => (owner && owner === who ? 3 : owner ? 0.5 : 1);
  const total = pool.reduce((n, a) => n + weight(a.owner), 0);
  let r = ((hash(`${who ?? "you"}|${seed}`) % 10_000) / 10_000) * total;
  for (const a of pool) {
    r -= weight(a.owner);
    if (r < 0) return a.id;
  }
  return pool[pool.length - 1]!.id;
}

/** One of `options`, the same for the same seed. */
export function oneOf<T>(options: readonly T[], seed: string): T {
  return options[hash(seed) % options.length]!;
}
