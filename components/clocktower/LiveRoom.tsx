"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionOf, FH, MID, type View } from "@/lib/pixel/figures";
import { errandsOf, residentsOf, roomHeight, ROOM_W, type Errand, type Spot } from "@/lib/pixel/rooms";
import type { Expression } from "@/lib/pixel/people";
import type { GestureTag } from "@/lib/pixel/gestures";
import { momentFor } from "@/lib/moments";
import { useVisit } from "@/lib/useVisit";
import { PixelFigure } from "../art/PixelFigure";
import { PixelRoom, pickShown, showsInRoom, useMotion, type PixelRoomProps, type RoomPerson } from "../art/PixelRoom";
import { useOnScreen } from "../art/useOnScreen";
import styles from "./LiveRoom.module.css";

// A floor's room with its residents living in it. In a busy room they sit at their desks getting on with their own
// work, a different move every few seconds (lib/pixel/variety.ts, mode "moment"), and now and
// then one of them gets up and goes somewhere as a full-body figure (lib/pixel/figures.ts): Paul
// to his chalkboard, Neil pacing with his rocket, Riya to her easel, Yahya timing a sprint. The
// errands are in lib/pixel/rooms.ts. Never everyone at once: only two people on a page are up at
// a time. A locked or open room is just the room. With reduced motion they stay at their desks,
// still. Same props as PixelRoom, which draws the room itself.

/** No more than this many people up and about on a page at once. */
const MAX_UP = 2;
let up = 0;

/** A stretch of an errand: one action, facing one way, from one column to another or staying put. */
export interface Leg {
  action: string;
  facing: View;
  from: number;
  to: number;
  ms: number;
}

const loopMs = (id: string) => {
  const a = actionOf(id);
  return a.frames * a.ms;
};

/** An errand as legs: up from the desk, there, each thing they do, on, back, and down again. */
export function legsOf(e: Errand, home: number): Leg[] {
  const legs: Leg[] = [];
  const stay = (action: string, facing: View, ms: number) => legs.push({ action, facing, from: at, to: at, ms });
  const go = (to: number, via: string) => {
    if (to === at) return;
    const a = actionOf(via);
    const ms = Math.round((Math.abs(to - at) / (a.travel ?? 16)) * a.frames * a.ms);
    legs.push({ action: via, facing: to > at ? "right" : "left", from: at, to, ms });
    at = to;
  };
  let at = home;
  const via = e.via ?? "walk";
  stay("stand", "front", 700);
  go(e.to, via);
  for (const t of e.then ?? []) stay(t.action, t.facing, t.loops * loopMs(t.action));
  // Gone to fetch something: a moment facing the shelf.
  if (!e.then?.length && e.and === undefined) stay("stand", "back", 900);
  if (e.and !== undefined) go(e.and, via);
  go(home, e.back ?? via);
  stay("stand", "front", 500);
  return legs;
}

/** Where a resident stands up: the middle of their place at the desk. */
const homeOf = (s: Spot) => s.x + 24;

type DeskMoment = { gesture: string; face: Expression };

/**
 * What they're doing at their desk: their own work most of all, the roof's party on the roof.
 * Only something that shows over the desk (showsInRoom): a move hidden behind it isn't a move.
 */
function deskMoment(s: Spot, act: number, seed: string, avoid: string[]): DeskMoment {
  const tags: GestureTag[] = act >= 9 ? ["idle", "celebrate", "listen"] : ["work", "idle"];
  let m!: DeskMoment;
  pickShown(
    (hidden) => (m = momentFor({ who: s.who, tags, seed, avoid: [...avoid, ...hidden], mode: "moment" }, s.work)).gesture,
    (g) => showsInRoom(act, s.who, g),
  );
  return m;
}

export function LiveRoom(props: Omit<PixelRoomProps, "people">) {
  const { act, state = "open", size = ROOM_W * 2, scale, animate = true, children } = props;
  const busy = state === "busy";
  const k = scale ?? Math.max(1, Math.floor(size / ROOM_W));
  const h = roomHeight(act);
  const box = useRef<HTMLSpanElement>(null);
  const onScreen = useOnScreen(box);
  const live = useMotion(animate) && onScreen && busy;
  const visit = useVisit();
  const residents = residentsOf(act);
  const errands = errandsOf(act);

  // At their desks: a move each, chosen for this visit, then a new one every few seconds.
  // Until the visit's seed arrives (the server's render, and hydrating it) they're simply at work.
  const first = useMemo(() => residents.map((s, i) => (visit ? deskMoment(s, act, `${visit}|${act}|${i}|0`, []) : { gesture: "idle", face: s.work })), [residents, act, visit]);
  const [changed, setChanged] = useState<Record<number, DeskMoment>>({});
  const desk = residents.map((s, i) => changed[i] ?? first[i]!);
  const history = useRef<string[][]>([]);
  // Another floor (the side sheet's banner moving between floors): its own people, afresh.
  useEffect(() => {
    setChanged({});
    history.current = [];
  }, [act]);
  useEffect(() => {
    if (!live || !residents.length) return;
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const next = () => {
      // A busy roof changes more often than a room with one person in it.
      timer = setTimeout(
        () => {
          const i = Math.floor(Math.random() * residents.length);
          const s = residents[i]!;
          const past = (history.current[i] ??= [first[i]!.gesture]);
          const rest = Math.random() < 0.2 && past.at(-1) !== "idle";
          const m = rest ? { gesture: "idle", face: s.work } : deskMoment(s, act, `${visit}|${act}|${i}|${++n}|${Math.random()}`, past.slice(-4));
          past.push(m.gesture);
          setChanged((c) => ({ ...c, [i]: m }));
          next();
        },
        (5000 + Math.random() * 7000) / Math.sqrt(residents.length),
      );
    };
    next();
    return () => clearTimeout(timer);
  }, [live, residents, act, visit, first]);

  // Up and about: now and then, while nobody else is.
  const [walker, setWalker] = useState<{ who: string; leg: Leg; n: number } | null>(null);
  useEffect(() => {
    if (!live || !errands.length) return;
    let timer: ReturnType<typeof setTimeout>;
    let holding = false;
    let last = -1;
    let n = 0;
    const wait = (ms: number) => {
      timer = setTimeout(attempt, ms);
    };
    const attempt = () => {
      if (up >= MAX_UP) return wait(3000 + Math.random() * 6000);
      up += 1;
      holding = true;
      let pick = Math.floor(Math.random() * errands.length);
      if (pick === last && errands.length > 1) pick = (pick + 1) % errands.length;
      last = pick;
      const e = errands[pick]!;
      const spot = residents.find((s) => s.who === e.who);
      if (!spot) {
        up -= 1;
        holding = false;
        return wait(8000);
      }
      const legs = legsOf(e, homeOf(spot));
      const step = (i: number) => {
        if (i >= legs.length) {
          setWalker(null);
          up -= 1;
          holding = false;
          return wait(10_000 + Math.random() * 16_000);
        }
        setWalker({ who: e.who, leg: legs[i]!, n: n++ });
        timer = setTimeout(() => step(i + 1), legs[i]!.ms);
      };
      step(0);
    };
    wait(1500 + Math.random() * 10_000);
    return () => {
      clearTimeout(timer);
      if (holding) up -= 1;
      setWalker(null);
    };
  }, [live, errands, residents]);

  const people: RoomPerson[] | undefined = busy ? residents.flatMap((s, i) => (walker?.who === s.who ? [] : [{ who: s.who, expression: desk[i]!.face, gesture: desk[i]!.gesture, spot: i }])) : undefined;

  // The box is there whatever the state, so it's watched from the start: a floor that turns busy
  // once the learner's progress arrives comes alive too.
  return (
    <PixelRoom {...props} people={people}>
      <span ref={box} className={styles.life} aria-hidden="true">
        {busy && walker ? <Walker key={walker.n} who={walker.who} leg={walker.leg} scale={k} roomHeight={h} /> : null}
      </span>
      {children}
    </PixelRoom>
  );
}

/**
 * Someone on a room's floor doing one leg of an errand, in a room drawn at `scale`: standing on the
 * room's bottom row, sliding from the leg's first column to its last one room pixel at a time.
 * Give each leg its own `key` so its slide starts afresh. Put it in a PixelRoom's children.
 */
export function Walker({ who, avatar, leg, scale: k, roomHeight: h }: { who?: string; avatar?: unknown; leg: Leg; scale: number; roomHeight: number }) {
  const steps = Math.abs(leg.to - leg.from);
  return (
    <span
      className={[styles.walker, steps ? styles.moving : ""].filter(Boolean).join(" ")}
      style={{
        top: (h - FH) * k,
        ["--from" as string]: `${(leg.from - MID) * k}px`,
        ["--to" as string]: `${(leg.to - MID) * k}px`,
        animationDuration: steps ? `${leg.ms}ms` : undefined,
        animationTimingFunction: steps ? `steps(${steps}, end)` : undefined,
      }}
    >
      <PixelFigure who={who} avatar={avatar} action={leg.action} facing={leg.facing} scale={k} />
    </span>
  );
}

/** Play `legs` once, one after another, and stay on the last. With `live` false, the last straight away. */
export function useLegs(legs: Leg[], live: boolean): { leg: Leg; n: number } | null {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!live) return;
    setAt(0);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      if (i >= legs.length - 1) return;
      t = setTimeout(() => {
        i += 1;
        setAt(i);
        next();
      }, legs[i]!.ms);
    };
    next();
    return () => clearTimeout(t);
  }, [legs, live]);
  if (!legs.length) return null;
  const n = live ? Math.min(at, legs.length - 1) : legs.length - 1;
  return { leg: legs[n]!, n };
}
