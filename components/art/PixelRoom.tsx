"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { drawBricks, drawRoom, drawTowerScene, layerRGBA, residentsOf, roomHeight, ROOM_W, STUCK_CLOCK, TOWER, type Layer, type RoomState, type Spot } from "@/lib/pixel/rooms";
import type { Expression, Gaze, Pose } from "@/lib/pixel/people";
import { gestureOf, type GestureTag } from "@/lib/pixel/gestures";
import { pickGesture } from "@/lib/pixel/variety";
import { prefersReducedMotion } from "@/lib/display";
import { PixelPerson, type PixelPersonProps } from "./PixelPerson";
import { useOnScreen } from "./useOnScreen";
import styles from "./PixelRoom.module.css";

// A floor's room as pixel art (REDESIGN3_PLAN.md P3), drawn by lib/pixel/rooms.ts on canvases at a
// whole-number scale so every pixel stays crisp:
//   <PixelRoom act={2} state="busy" size={480} />
// Locked rooms are dark with the furniture under dust sheets, open rooms have the lights on, and
// busy rooms have their residents in, at work, doing something of their own now and then (lib/pixel/
// variety.ts: never the same thing twice running). Screens flicker, gears turn and kettles steam;
// with reduced motion everything holds still. A room draws and moves only while it's on screen.
//
// For a scene (the Ask, the Ship), put someone in the room yourself: `people` replaces the
// residents, each taking one of the room's places (spot 0 is the resident's own chair), with
// their own face, gesture and talking mouth. Anything in `children` sits on top of the room.
//   <PixelRoom act={2} state="open" size={640} people={[{ who: "caitlin", expression: "pleased", gesture: "wave", talking }]} />

export interface RoomPerson {
  /** A cast id, or `avatar` for the learner. */
  who?: string;
  avatar?: unknown;
  expression?: Expression;
  gesture?: Pose;
  /** Where they look, when not at you (at whoever is speaking). */
  gaze?: Gaze;
  talking?: boolean;
  /** The mouth in time with a line being typed out (useSpeech). */
  mouthOpen?: PixelPersonProps["mouthOpen"];
  /** Which of the room's places they take. Defaults to their order in the list. */
  spot?: number;
}

export interface PixelRoomProps {
  /** The floor's Act, 1 (the Workshop) to 9 (the roof). */
  act: number;
  state?: RoomState;
  /** The width to fit, in CSS pixels: the room takes the biggest whole-number scale that fits. */
  size?: number;
  /** Room pixels per grid pixel, instead of fitting `size`. */
  scale?: number;
  /** Who's in the room, instead of its residents (who are only in when it's busy). */
  people?: RoomPerson[];
  /** The roof's clock. 3:14 unless it's been fixed. */
  clock?: { h: number; m: number };
  /** Moves (people, screens, steam). Off with reduced motion whatever this says. */
  animate?: boolean;
  /** Words for a screen reader (the room becomes one image); leave out when it's decoration. */
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------- one clock for every room

const STEP = 480;
const listeners = new Set<(frame: number) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let tick = 0;
function subscribe(fn: (frame: number) => void) {
  listeners.add(fn);
  if (!timer)
    timer = setInterval(() => {
      tick = (tick + 1) % 8;
      listeners.forEach((l) => l(tick));
    }, STEP);
  return () => {
    listeners.delete(fn);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** The room's moving parts' frame: 0 to 7, or 0 for good when still. */
function useFrame(moving: boolean): number {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!moving) {
      setFrame(0);
      return;
    }
    return subscribe(setFrame);
  }, [moving]);
  return frame;
}

/** Whether things may move: `animate`, and no reduced motion. False on the server. */
export function useMotion(animate = true): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(animate && !prefersReducedMotion()), [animate]);
  return ok;
}

// ---------------------------------------------------------------- drawing

const frames = new Map<string, { back: ImageData; front: ImageData }>();
const toImage = (l: Layer) => new ImageData(layerRGBA(l) as Uint8ClampedArray<ArrayBuffer>, l.w, l.h);

function roomFrames(act: number, state: RoomState, frame: number, clock: { h: number; m: number }) {
  const key = `${act}|${state}|${state === "locked" ? 0 : frame}|${clock.h}:${clock.m}`;
  let f = frames.get(key);
  if (!f) {
    const r = drawRoom(act, state, { frame, clock });
    f = { back: toImage(r.back), front: toImage(r.front) };
    if (frames.size > 400) frames.clear();
    frames.set(key, f);
  }
  return f;
}

function paint(canvas: HTMLCanvasElement | null, image: ImageData) {
  const ctx = canvas?.getContext("2d");
  if (ctx) ctx.putImageData(image, 0, 0);
}

// ---------------------------------------------------------------- what shows from a seat

// Whether a gesture shows over the desk is looked up in a table made ahead of time
// (lib/pixel/shown.ts), so a page full of rooms never has to draw to find out.
import { showsInRoom } from "@/lib/pixel/shown";
export { showsInRoom };

/** A pick that shows: `pick` again, steering clear of each one that doesn't, a few times at most. */
export function pickShown(pick: (hidden: string[]) => string, shows: (gesture: string) => boolean, tries = 8): string {
  const hidden: string[] = [];
  let g = pick(hidden);
  for (let i = 0; i < tries && !shows(g); i++) {
    hidden.push(g);
    g = pick(hidden);
  }
  return g;
}

// ---------------------------------------------------------------- now and then

type Moment = { pose: Pose; expression: Expression; talking?: boolean };

/** What a room's moment names (one of the first six) stands for, with their work and idle moves. */
const MOMENT_TAGS: Record<string, GestureTag[]> = {
  idle: ["idle", "work"],
  wave: ["greet", "idle"],
  cheer: ["celebrate", "work"],
  think: ["think", "work"],
  point: ["explain"],
  thumbs: ["approve", "work"],
};

/**
 * One of a resident's moments, made fresh: the face and the kind of thing the room gives them,
 * and a gesture that fits it from their own moves and everyday ones, never the last one again.
 * A moment the room names exactly (not one of the first six) is kept.
 */
function freshMoment(act: number, who: string, m: Moment, seed: string, last: string | undefined): Moment {
  const tags = MOMENT_TAGS[m.pose];
  if (!tags) return m;
  const pose = pickShown((hidden) => pickGesture({ who, tags, face: m.talking ? undefined : m.expression, seed, avoid: [last, ...hidden], mode: m.talking ? "talk" : "moment" }), (g) => showsInRoom(act, who, g));
  const g = gestureOf(pose);
  // Talking keeps the room's face; anything else brings the face that goes with it.
  return { pose, expression: m.talking || g.faces?.includes(m.expression) ? m.expression : (g.faces?.[0] ?? m.expression), talking: m.talking };
}

/** Residents at work, each doing something now and then: one of their own moves, a laugh, a word. */
function useMoments(act: number, spots: Spot[], live: boolean): (Moment | null)[] {
  const [now, setNow] = useState<(Moment | null)[]>([]);
  const key = spots.map((s) => s.who).join(",");
  useEffect(() => {
    setNow([]);
    if (!live || !spots.length) return;
    let t: ReturnType<typeof setTimeout>;
    let count = 0;
    const visit = Math.random().toString(36).slice(2, 8);
    const last: (string | undefined)[] = [];
    const next = () => {
      t = setTimeout(
        () => {
          const i = Math.floor(Math.random() * spots.length);
          const s = spots[i]!;
          const options = s.moments;
          const m = freshMoment(act, s.who, options[Math.floor(Math.random() * options.length)]!, `${key}|${visit}|${count++}`, last[i]);
          last[i] = m.pose;
          setNow((cur) => {
            const out = [...cur];
            out[i] = m;
            return out;
          });
          // Long enough to see it through: a gesture's whole loop, or a word or two.
          const g = gestureOf(m.pose);
          t = setTimeout(
            () => {
              setNow((cur) => {
                const out = [...cur];
                out[i] = null;
                return out;
              });
              next();
            },
            m.talking ? 3200 : Math.min(6000, Math.max(2400, g.beats * g.ms * 2)),
          );
        },
        3500 + Math.random() * 6000,
      );
    };
    next();
    return () => clearTimeout(t);
    // The spots are fixed for a room; `key` says when the room changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, live, act]);
  return now;
}

// ---------------------------------------------------------------- the room

export function PixelRoom({ act, state = "open", size = ROOM_W * 2, scale, people, clock = STUCK_CLOCK, animate = true, label, className, children }: PixelRoomProps) {
  const h = roomHeight(act);
  const k = scale ?? Math.max(1, Math.floor(size / ROOM_W));
  const box = useRef<HTMLSpanElement>(null);
  const onScreen = useOnScreen(box);
  const moving = useMotion(animate) && onScreen;
  const frame = useFrame(moving && state !== "locked");
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!onScreen) return;
    const f = roomFrames(act, state, frame, clock);
    paint(back.current, f.back);
    paint(front.current, f.front);
  }, [onScreen, act, state, frame, clock]);

  const spots = residentsOf(act);
  const residents = useMemo(() => (people ? [] : state === "busy" ? spots : []), [people, state, spots]);
  const moments = useMoments(act, residents, moving);

  const placed = people
    ? people.map((p, i) => {
        const at = spots[p.spot ?? i] ?? spots[0] ?? { x: Math.round(ROOM_W / 2) - 24, y: 2 };
        return { key: `p${i}`, x: at.x, y: at.y, who: p.who, avatar: p.avatar, expression: p.expression ?? "neutral", pose: p.gesture ?? "idle", gaze: p.gaze, talking: p.talking ?? false, mouthOpen: p.mouthOpen };
      })
    : residents.map((s, i) => {
        const m = moments[i];
        return { key: s.who + i, x: s.x, y: s.y, who: s.who, avatar: undefined, expression: m?.expression ?? s.work, pose: m?.pose ?? "idle", gaze: undefined, talking: m?.talking ?? false, mouthOpen: undefined };
      });

  return (
    <span
      ref={box}
      className={[styles.room, className].filter(Boolean).join(" ")}
      style={{ width: ROOM_W * k, height: h * k }}
      role={label ? "img" : undefined}
      aria-label={label}
      data-state={state}
    >
      <canvas ref={back} width={ROOM_W} height={h} className={styles.layer} aria-hidden="true" />
      {placed.map((p) => (
        <span key={p.key} className={styles.person} style={{ left: p.x * k, top: p.y * k }} aria-hidden="true" data-who={p.who} data-pose={p.pose}>
          <PixelPerson who={p.who} avatar={p.avatar} expression={p.expression} pose={p.pose} gaze={p.gaze} talking={p.talking} mouthOpen={p.mouthOpen} animate={animate} scale={k} />
        </span>
      ))}
      <canvas ref={front} width={ROOM_W} height={h} className={styles.layer} aria-hidden="true" />
      {children ? <span className={styles.over}>{children}</span> : null}
    </span>
  );
}

// ---------------------------------------------------------------- brick, and the whole tower as one picture

/** The tower's brick, filling whatever box it's in (the side sheet's banner). */
export function PixelBricks({ scale = 2, className }: { scale?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const [cells, setCells] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setCells({ w: Math.ceil(el.clientWidth / scale) + 1, h: Math.ceil(el.clientHeight / scale) + 1 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale]);
  useEffect(() => {
    if (!cells) return;
    paint(ref.current, toImage(drawBricks(cells.w, cells.h)));
  }, [cells]);
  return (
    <span ref={box} className={[styles.bricks, className].filter(Boolean).join(" ")} aria-hidden="true">
      {cells ? <canvas ref={ref} width={cells.w} height={cells.h} className={styles.brickCanvas} style={{ width: cells.w * scale, height: cells.h * scale }} /> : null}
    </span>
  );
}

const ACTS = [9, 8, 7, 6, 5, 4, 3, 2, 1];

/**
 * The whole Clocktower as one still picture, every floor in `state` (no people): the placeholder
 * for the building's illustration slot. Fits `size` at a whole-number scale.
 */
export function PixelTowerPicture({ size, state = "open", label, className }: { size: number; state?: RoomState; label?: string; className?: string }) {
  const width = ROOM_W + TOWER.wall * 2 + 24;
  const k = Math.max(1, Math.floor(size / width));
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useMemo(() => drawTowerScene(width, ACTS), [width]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(toImage(scene.layer), 0, 0);
    // Rooms on top, back and front together (nobody in).
    const tmp = document.createElement("canvas");
    for (const r of scene.layout.rooms) {
      const f = roomFrames(r.act, state, 0, STUCK_CLOCK);
      tmp.width = ROOM_W;
      tmp.height = r.h;
      const t = tmp.getContext("2d");
      if (!t) continue;
      for (const img of [f.back, f.front]) {
        t.putImageData(img, 0, 0);
        ctx.drawImage(tmp, scene.x + TOWER.wall, r.y);
      }
    }
  }, [scene, state]);
  return (
    <canvas
      ref={ref}
      width={width}
      height={scene.layer.h}
      className={[styles.picture, className].filter(Boolean).join(" ")}
      style={{ width: width * k, height: scene.layer.h * k }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
