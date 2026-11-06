"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { drawPerson, H, toRGBA, W, type Expression, type Gaze, type Moment, type PersonLook, type Pose } from "@/lib/pixel/people";
import { CAST_LOOKS, avatarToLook } from "@/lib/pixel/looks";
import { gestureOf } from "@/lib/pixel/gestures";
import { prefersReducedMotion } from "@/lib/display";
import { useOnScreen } from "./useOnScreen";
import styles from "./PixelPerson.module.css";

// A pixel person, alive (REDESIGN3_PLAN.md P1): drawn by lib/pixel/people.ts on a canvas at a
// whole-number scale, so every pixel stays crisp. They stand still and level (the owner: no
// bouncing), blink now and then, move their
// mouth while `talking`, and play a gesture when given a pose. With reduced motion they hold still.
// Everyone on a page shares one clock, so a tower full of people costs one timer, and a person
// only draws, and only listens to the clock, while they're on screen.

export type Crop = "bust" | "head";

/** The part of the 48x52 grid each crop shows. */
const CROPS: Record<Crop, { x: number; y: number; w: number; h: number }> = {
  bust: { x: 0, y: 0, w: W, h: H },
  head: { x: 8, y: 0, w: 32, h: 36 },
};

// ---------------------------------------------------------------- the shared clock

const TICK = 130;
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

// Frames are cheap (48x52) but people repeat a lot: cache each drawn moment.
const frames = new Map<string, ImageData>();
function frame(key: string, look: PersonLook, m: Moment, crop: Crop): ImageData {
  const k = `${key}|${crop}|${m.expression}|${m.pose}|${m.blink ? 1 : 0}|${m.open === true ? 2 : m.open || 0}|${m.beat ?? 0}|${m.gaze ?? ""}`;
  let f = frames.get(k);
  if (!f) {
    const full = toRGBA(drawPerson(look, m));
    const c = CROPS[crop];
    const out = new Uint8ClampedArray(c.w * c.h * 4);
    for (let y = 0; y < c.h; y++) out.set(full.subarray(((c.y + y) * W + c.x) * 4, ((c.y + y) * W + c.x + c.w) * 4), y * c.w * 4);
    f = new ImageData(out, c.w, c.h);
    if (frames.size > 600) frames.clear();
    frames.set(k, f);
  }
  return f;
}

export interface PixelPersonProps {
  /** A cast id (paul, neil...), or `look` for anyone else. */
  who?: string;
  /** A learner's saved avatar (profile.character). */
  avatar?: unknown;
  look?: PersonLook;
  expression?: Expression;
  pose?: Pose;
  /** Where they look, when not at you. */
  gaze?: Gaze;
  /** Mouth moves while true (a natural rhythm of its own). */
  talking?: boolean;
  /** The mouth, controlled from outside, in time with a line being typed out (useSpeech): 0 shut, 1 a little, 2 wide. */
  mouthOpen?: boolean | 0 | 1 | 2;
  /** Blinks, talks and gestures. Off with reduced motion whatever this says. */
  animate?: boolean;
  /** Pixels of the person per grid pixel. Defaults to the biggest whole number that fits `size`. */
  scale?: number;
  /** The box to fit, in CSS pixels (the width). */
  size?: number;
  crop?: Crop;
  /** Accessible description; leave out when the person is decoration beside their name. */
  label?: string;
  className?: string;
}

export function PixelPerson({ who, avatar, look: given, expression = "neutral", pose = "idle", gaze, talking = false, mouthOpen, animate = true, scale, size = 96, crop = "bust", label, className }: PixelPersonProps) {
  const look = useMemo<PersonLook>(() => given ?? (who ? CAST_LOOKS[who] : undefined) ?? avatarToLook(avatar), [given, who, avatar]);
  const key = useMemo(() => (given ? JSON.stringify(given) : who ? `cast:${who}` : `avatar:${JSON.stringify(avatar ?? null)}`), [given, who, avatar]);
  const c = CROPS[crop];
  const k = scale ?? Math.max(1, Math.floor(size / c.w));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [moment, setMoment] = useState<Moment>({ expression, pose, gaze });
  const [still, setStill] = useState(true);
  const onScreen = useOnScreen(canvas);

  useEffect(() => setStill(!animate || prefersReducedMotion()), [animate]);
  const mouthRef = useRef<boolean | 0 | 1 | 2 | undefined>(mouthOpen);
  mouthRef.current = mouthOpen;

  // The clock: blinks every few seconds, the mouth while talking, a gesture's beat.
  useEffect(() => {
    if (still || !onScreen) {
      setMoment((m) => (m.expression === expression && m.pose === pose && m.gaze === gaze && !m.blink && !m.beat && m.open === mouthRef.current ? m : { expression, pose, gaze, open: mouthRef.current }));
      return;
    }
    let nextBlink = performance.now() + 1500 + Math.random() * 3000;
    let blinkUntil = 0;
    let beat = 0;
    let lastBeat = 0;
    const g = gestureOf(pose);
    return subscribe((t) => {
      if (t > nextBlink) {
        blinkUntil = t + 140;
        nextBlink = t + 2500 + Math.random() * 4000;
      }
      // Each gesture keeps its own time (a wave is quick, a sip is slow).
      if (g.beats > 1 && t - lastBeat >= g.ms - TICK / 2) {
        beat = (beat + 1) % g.beats;
        lastBeat = t;
      }
      // Talking on its own: a believable rhythm of wide, little and shut.
      const open = mouthRef.current ?? (talking ? ([2, 1, 0, 2, 1, 1, 0, 2, 0] as const)[Math.floor(t / TICK) % 9]! : 0);
      const blink = t < blinkUntil;
      // Only a change re-renders: most ticks, most people are just standing there.
      setMoment((m) => (m.expression === expression && m.pose === pose && m.gaze === gaze && Boolean(m.blink) === blink && m.open === open && m.beat === beat ? m : { expression, pose, gaze, blink, open, beat }));
    });
  }, [still, onScreen, expression, pose, gaze, talking]);

  // A controlled mouth changes between ticks too, so a word's vowels land on time.
  useEffect(() => {
    if (mouthOpen === undefined) return;
    setMoment((m) => (m.open === mouthOpen ? m : { ...m, open: mouthOpen }));
  }, [mouthOpen]);

  useEffect(() => {
    if (!onScreen) return;
    const ctx = canvas.current?.getContext("2d");
    if (ctx) ctx.putImageData(frame(key, look, moment, crop), 0, 0);
  }, [onScreen, key, look, moment, crop]);

  return (
    <canvas
      ref={canvas}
      width={c.w}
      height={c.h}
      className={[styles.person, className].filter(Boolean).join(" ")}
      style={{ width: c.w * k, height: c.h * k, ["--px" as string]: `${k}px` }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
