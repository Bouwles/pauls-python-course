"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionOf, drawFigure, figureRGBA, FH, FW, viewFor, type FigureMoment, type View } from "@/lib/pixel/figures";
import { CAST_LOOKS, avatarToLook } from "@/lib/pixel/looks";
import type { PersonLook } from "@/lib/pixel/people";
import { prefersReducedMotion } from "@/lib/display";
import { useOnScreen } from "./useOnScreen";
import styles from "./PixelFigure.module.css";

// A whole pixel person, doing something (lib/pixel/figures.ts): walking, typing at a desk, painting
// at an easel. Drawn on a canvas at a whole-number scale so every pixel stays crisp:
//   <PixelFigure who="neil" action="walk" facing="right" scale={3} />
//   <PixelFigure avatar={profile.character} action="wave" label="You, waving" />
// The figure stands level and still but for its own action: nothing bobs. It blinks now and then,
// moves its mouth while `talking`, and plays its action's loop at the action's own pace. Everyone
// on a page shares one clock, frames are drawn once and kept, and a figure only draws, and only
// listens to the clock, while it's on screen. With reduced motion it holds the first frame.
//
// A scene that walks someone across a room slides the figure itself: the action's `travel` is how
// many grid pixels a loop of the walk covers (actionOf("walk").travel), so feet and floor agree.

// ---------------------------------------------------------------- the shared clock

const TICK = 35;
const listeners = new Set<(t: number) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(fn: (t: number) => void) {
  listeners.add(fn);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l(performance.now())), TICK);
  return () => {
    listeners.delete(fn);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// ---------------------------------------------------------------- frames, drawn once

const frames = new Map<string, ImageData>();
function frameImage(key: string, look: PersonLook, m: Required<Pick<FigureMoment, "action" | "view" | "frame">> & FigureMoment): ImageData {
  const open = m.open === true ? 2 : m.open || 0;
  const k = `${key}|${m.action}|${m.view}|${m.frame}|${m.blink ? 1 : 0}|${open}`;
  let f = frames.get(k);
  if (!f) {
    f = new ImageData(figureRGBA(drawFigure(look, m)) as Uint8ClampedArray<ArrayBuffer>, FW, FH);
    if (frames.size > 2000) frames.clear();
    frames.set(k, f);
  }
  return f;
}

// ---------------------------------------------------------------- the figure

export interface PixelFigureProps {
  /** A cast id (paul, neil...), or `avatar` or `look` for anyone else. */
  who?: string;
  /** A learner's saved avatar (profile.character). */
  avatar?: unknown;
  look?: PersonLook;
  /** What they're doing: an action id from lib/pixel/figures.ts ("walk", "type", "easel"...). Unknown ids stand. */
  action?: string;
  /** Which way they face. An action drawn in fewer views turns to the nearest it has. */
  facing?: View;
  /** Mouth moves while true (a natural rhythm of its own). */
  talking?: boolean;
  /** The mouth, controlled from outside, in time with a line being typed out (useSpeech): 0 shut, 1 a little, 2 wide. */
  mouthOpen?: boolean | 0 | 1 | 2;
  /** Plays the action and blinks. Off with reduced motion whatever this says. */
  animate?: boolean;
  /** Screen pixels per grid pixel. Defaults to the biggest whole number that fits `size`. */
  scale?: number;
  /** The height to fit, in CSS pixels, when no `scale` is given. */
  size?: number;
  /** Accessible description; leave out when the figure is decoration beside their name. */
  label?: string;
  className?: string;
}

export function PixelFigure({ who, avatar, look: given, action = "stand", facing = "front", talking = false, mouthOpen, animate = true, scale, size = FH * 2, label, className }: PixelFigureProps) {
  const look = useMemo<PersonLook>(() => given ?? (who ? CAST_LOOKS[who] : undefined) ?? avatarToLook(avatar), [given, who, avatar]);
  const key = useMemo(() => (given ? JSON.stringify(given) : who && CAST_LOOKS[who] ? `cast:${who}` : `avatar:${JSON.stringify(avatar ?? null)}`), [given, who, avatar]);
  const act = actionOf(action);
  const view = viewFor(act, facing);
  const k = scale ?? Math.max(1, Math.floor(size / FH));
  const canvas = useRef<HTMLCanvasElement>(null);
  const onScreen = useOnScreen(canvas);
  const [still, setStill] = useState(true);
  const [moment, setMoment] = useState<{ frame: number; blink: boolean; open: 0 | 1 | 2 }>({ frame: 0, blink: false, open: 0 });
  const mouthRef = useRef(mouthOpen);
  mouthRef.current = mouthOpen;

  useEffect(() => setStill(!animate || prefersReducedMotion()), [animate]);

  // The clock: the action's frames at its own pace, a blink every few seconds, the mouth while talking.
  useEffect(() => {
    const shut = (v: typeof mouthOpen) => (v === true ? 2 : v || 0) as 0 | 1 | 2;
    if (still || !onScreen) {
      setMoment((m) => (m.frame === 0 && !m.blink && m.open === shut(mouthRef.current) ? m : { frame: 0, blink: false, open: shut(mouthRef.current) }));
      return;
    }
    let frame = 0;
    let last = performance.now();
    let nextBlink = last + 1500 + Math.random() * 3000;
    let blinkUntil = 0;
    return subscribe((t) => {
      if (act.frames > 1 && t - last >= act.ms - TICK / 2) {
        frame = (frame + 1) % act.frames;
        last = t;
      }
      // An action that blinks in its own loop (standing, sitting) gets no extra blinks.
      if (!act.blinks && t > nextBlink) {
        blinkUntil = t + 140;
        nextBlink = t + 2500 + Math.random() * 4000;
      }
      const blink = t < blinkUntil;
      const open = mouthRef.current !== undefined ? shut(mouthRef.current) : talking ? ([2, 1, 0, 2, 1, 1, 0, 2, 0] as const)[Math.floor(t / 130) % 9]! : 0;
      // Only a change re-renders: most ticks, nothing has moved.
      setMoment((m) => (m.frame === frame && m.blink === blink && m.open === open ? m : { frame, blink, open }));
    });
  }, [still, onScreen, act, talking]);

  // A controlled mouth changes between ticks too, so a word's vowels land on time.
  useEffect(() => {
    if (mouthOpen === undefined) return;
    const open = (mouthOpen === true ? 2 : mouthOpen || 0) as 0 | 1 | 2;
    setMoment((m) => (m.open === open ? m : { ...m, open }));
  }, [mouthOpen]);

  useEffect(() => {
    if (!onScreen) return;
    const ctx = canvas.current?.getContext("2d");
    if (ctx) ctx.putImageData(frameImage(key, look, { action: act.id, view, frame: moment.frame, blink: moment.blink, open: moment.open }), 0, 0);
  }, [onScreen, key, look, act, view, moment]);

  return (
    <canvas
      ref={canvas}
      width={FW}
      height={FH}
      className={[styles.figure, className].filter(Boolean).join(" ")}
      style={{ width: FW * k, height: FH * k }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-action={act.id}
    />
  );
}
