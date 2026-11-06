"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Line } from "@/lib/content/types";
import { CAST_IDS, FLOORS, castColour } from "@/lib/cast";
import { ROOM_W, residentsOf, roomHeight } from "@/lib/pixel/rooms";
import { moodOf } from "@/lib/mood";
import { prefersReducedMotion } from "@/lib/display";
import { allGestures, gestureOf, type GestureTag } from "@/lib/pixel/gestures";
import { hash, isFamily, pickGesture } from "@/lib/pixel/variety";
import type { Expression, Gaze, Pose } from "@/lib/pixel/people";
import { PixelPerson, type PixelPersonProps } from "../art/PixelPerson";
import { PixelRoom, pickShown, showsInRoom, useMotion } from "../art/PixelRoom";
import { useSpeech } from "../art/useSpeech";
import { SpeechBubble } from "../ui/SpeechBubble";
import styles from "./Scene.module.css";

// The Ask and the Ship as small pixel scenes: the client at their desk in
// their room on the Clocktower, anyone else in the conversation in the foreground, and the lines
// said in bubbles beside them. A line types out like <Speech> does (lib/mood.ts, useSpeech), and
// its speaker's mouth moves with it here on the stage instead of in a portrait by the bubble.
// Nobody does the same thing twice in a row: each line gets a gesture that fits it and the
// speaker, and between lines and afterwards the client gets on with something of their own in
// their room (lib/pixel/variety.ts), different on every visit.

/** How open a mouth is: in time with useSpeech. */
export type Mouth = PixelPersonProps["mouthOpen"];

export interface StagePerson {
  who: string;
  face: Expression;
  gesture: Pose;
  /** In time with the line being typed; leave out when they aren't speaking. */
  mouthOpen?: Mouth;
  /** Saying a line now: the others on the stage look at them. */
  speaking?: boolean;
  /** Where they look, when not at you (the stage sets it for whoever is listening). */
  gaze?: Gaze;
}

/**
 * A token for this visit to a screen, for the seeds of everything the cast do on it, so coming
 * back finds them doing something else. It holds while the screen stays open.
 */
export function useVisit(): string {
  const [visit] = useState(() => Math.floor(Math.random() * 0x7fffffff).toString(36));
  return visit;
}

/** Gestures that don't suit a happy scene (a Ship, a placement): the sad and the sleepy. */
export const GLUM = allGestures()
  .filter((g) => g.tags.includes("sad") || g.faces?.[0] === "sleepy")
  .map((g) => g.id);

/**
 * A celebration of their own, where they have one (Neil launches a rocket, Caitlin wins on her
 * controller): their own celebrating moves on three projects in four, any fitting one otherwise,
 * so it changes from project to project. `seed` names the project and the visit.
 */
export function celebrationFor(who: string, seed: string, { act, avoid = [] }: { act?: number; avoid?: string[] } = {}): Pose {
  const everyday = hash(`${seed}|own`) % 4 ? allGestures().filter((g) => !g.who && g.tags.includes("celebrate")).map((g) => g.id) : [];
  // At their desk, one the desk doesn't hide.
  return pickShown(
    (hidden) => pickGesture({ who, tags: ["celebrate"], face: "laughing", seed, avoid: [...avoid, ...GLUM, ...everyday, ...hidden], mode: "moment" }),
    (g) => act === undefined || showsInRoom(act, who, g),
  );
}

/** Gestures aimed at someone else, which look odd done alone in a room: knocking, shushing, asking for quiet. */
export const AT_SOMEONE = ["hand-up", "stop-hand", "please", "shush", "knock", "beckon", "point-at-you", "cup-ear", "finger-guns", "high-five", "fist-bump", "listen-headphones"];

/** The room a client asks from: the project's own floor if they live there, else their first floor. */
export function roomOf(client: string, act: number): number {
  if (FLOORS.find((f) => f.act === act)?.residents.includes(client)) return act;
  return FLOORS.find((f) => f.act < 9 && f.residents.includes(client))?.act ?? act;
}

/**
 * The stage: the client at their own desk in their room on the Clocktower (components/art/PixelRoom),
 * saying their lines with the face and gesture each one calls for. Anyone else in the conversation
 * stands in the foreground on the side away from them. The room takes the biggest whole-number
 * scale that fits; on a narrow screen it stays at three and is cropped around the client. The
 * whole stage is one image to assistive technology, with the client's name on a pixel plate.
 */
export function Stage({ act, lead, guests = [], name, label, className, children }: { act: number; lead: StagePerson; guests?: StagePerson[]; name: string; label: string; className?: string; children?: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const k = Math.max(3, Math.floor(width / ROOM_W));
  const h = roomHeight(act) * k;
  const seat = residentsOf(act).find((s) => s.who === lead.who) ?? residentsOf(act)[0];
  const spot = Math.max(0, residentsOf(act).indexOf(seat!));
  // Narrower than the room: slide it so the client is in the middle.
  const centre = ((seat?.x ?? ROOM_W / 2 - 24) + 24) * k;
  const shift = width && ROOM_W * k > width ? Math.round(Math.min(0, Math.max(width - ROOM_W * k, width / 2 - centre))) : Math.round((width - ROOM_W * k) / 2);
  // The others stand in the foreground, on the side away from the client, a step apart.
  const left = (seat?.x ?? 56) + 24 >= ROOM_W / 2;
  const shown = guests.slice(0, 2);
  const c = castColour(lead.who);
  // Whoever is listening looks at whoever is speaking: across the room, one way or the other.
  const guestSpeaking = shown.some((g) => g.speaking);
  const leadGaze = lead.gaze ?? (guestSpeaking && !lead.speaking ? (left ? "left" : "right") : undefined);
  const guestGaze = (g: StagePerson) => g.gaze ?? (g.speaking ? undefined : lead.speaking ? (left ? "right" : "left") : undefined);

  return (
    <div ref={box} className={[styles.stage, className].filter(Boolean).join(" ")} style={{ height: h || undefined }} role="img" aria-label={label}>
      {width ? (
        <div className={styles.shift} style={{ transform: `translateX(${shift}px)` }} aria-hidden="true">
          <PixelRoom act={act} state="open" scale={k} people={[{ who: lead.who, expression: lead.face, gesture: lead.gesture, gaze: leadGaze, mouthOpen: lead.mouthOpen, spot }]}>
            {shown.map((g, i) => {
              const x = left ? 2 + i * 30 : ROOM_W - 50 - i * 30;
              return (
                <span key={g.who} className={styles.guest} style={{ left: x * k, top: (roomHeight(act) - 44) * k }} data-who={g.who} data-pose={g.gesture}>
                  <PixelPerson who={g.who} expression={g.face} pose={g.gesture} gaze={guestGaze(g)} mouthOpen={g.mouthOpen} scale={k} />
                </span>
              );
            })}
          </PixelRoom>
        </div>
      ) : null}
      <span className={styles.name} style={{ background: c.face, color: c.ink }} aria-hidden="true">
        {name}
      </span>
      {children}
    </div>
  );
}

/**
 * One line in a bubble. While `live` it types out at a talking pace (click to finish it) and
 * reports its mouth to whoever is drawing the speaker; otherwise it is simply there, whole.
 */
export function SpokenLine({
  who,
  name,
  text,
  tail = "left",
  live = false,
  onMouth,
  onDone,
  className,
}: {
  who: string;
  /** The name tag; left out for a speaker's second line in a row. */
  name?: string;
  text: string;
  tail?: "left" | "top" | "none";
  live?: boolean;
  onMouth?: (open: Mouth) => void;
  onDone?: () => void;
  className?: string;
}) {
  const speech = useSpeech(text, { start: live, onDone });
  const mouth = useRef(onMouth);
  mouth.current = onMouth;
  useEffect(() => {
    if (live) mouth.current?.(speech.open);
  }, [live, speech.open]);
  useEffect(() => () => mouth.current?.(0), []);

  const talking = live && speech.talking;
  const bubble = (
    <SpeechBubble who={who} name={name} tail={tail} className={styles.bubble}>
      <span className={styles.words}>
        <span className={styles.ghost} aria-hidden="true">
          {text}
        </span>
        <span className={styles.typed} aria-hidden={talking || undefined}>
          {live ? speech.shown : text}
        </span>
        {/* Screen readers get the whole line at once, never the letters as they arrive. */}
        {talking ? <span className="visually-hidden">{text}</span> : null}
      </span>
    </SpeechBubble>
  );
  if (!talking) return <div className={[styles.line, className].filter(Boolean).join(" ")}>{bubble}</div>;
  return (
    // Named by its contents (the name tag and the whole line), so the name always holds what's visible.
    <button type="button" className={[styles.line, styles.lineButton, className].filter(Boolean).join(" ")} onClick={speech.skip} title="Show the whole line">
      {bubble}
    </button>
  );
}

/** The pause between one line ending and the next starting. */
const BEAT_MS = 650;

/**
 * A conversation of `count` lines said one after another: which line is being said, whose mouth
 * is open, and Skip. Nothing starts until `start`; with reduced motion every line is there at once.
 */
export function useConversation(count: number, start = true) {
  const [at, setAt] = useState(0);
  const [said, setSaid] = useState(false);
  const [skipped, setSkipped] = useState(() => prefersReducedMotion() || count === 0);
  const [mouth, setMouth] = useState<Mouth>(0);
  const beat = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (beat.current) clearTimeout(beat.current);
    },
    [],
  );

  const lineDone = useCallback(() => {
    setSaid(true);
    setMouth(0);
    if (at >= count - 1) return;
    beat.current = setTimeout(() => {
      setAt((n) => n + 1);
      setSaid(false);
    }, BEAT_MS);
  }, [at, count]);

  const skip = useCallback(() => {
    if (beat.current) clearTimeout(beat.current);
    setSkipped(true);
    setMouth(0);
  }, []);

  const playing = start && !skipped && (at < count - 1 || !said);
  return {
    /** The line being said now (or the last one said). */
    at,
    playing,
    skipped,
    mouth,
    setMouth,
    lineDone,
    skip,
    /** How many lines are showing. */
    shown: !start ? 0 : skipped ? count : at + 1,
    /** This line is the one being typed out. */
    live: (i: number) => start && !skipped && i === at,
    /** The line someone is saying right now, if anyone is. */
    speaking: playing ? at : -1,
  };
}

/** Everyone in a conversation besides the client, in the order they first speak (the cast only). */
export function othersIn(lines: Line[], client: string): string[] {
  return [...new Set(lines.map((l) => l.who))].filter((w) => w !== client && (CAST_IDS as readonly string[]).includes(w));
}

// ---------------------------------------------------------------- asides

export interface AsidePerson {
  who: string;
  /** Free to get on with something: not saying a line. */
  free: boolean;
  /** What fits: "idle", "work" and "wait" in their own room, "celebrate" on a Ship. */
  tags: GestureTag[];
  /** At their desk in this room: only what the desk doesn't hide. */
  act?: number;
  /** Gestures that don't suit them here, besides the scene's. */
  avoid?: string[];
}

/** What someone is doing on the side: a gesture, and the face it brings. */
export interface Aside {
  gesture: Pose;
  face?: Expression;
}

// Each person's asides in order, worked out once: the n-th never repeats the two before it.
const ASIDES = new Map<string, string[]>();
function asideAt(who: string, tags: GestureTag[], seed: string, avoid: (string | undefined)[], n: number, act?: number): string {
  const key = `${who}|${tags.join(",")}|${seed}|${avoid.join(",")}|${act ?? ""}`;
  const list = ASIDES.get(key) ?? [];
  while (list.length <= n) {
    const before = [list[list.length - 1], list[list.length - 2], ...avoid];
    list.push(pickShown((hidden) => pickGesture({ who, tags, seed: `${seed}|aside|${list.length}`, avoid: [...before, ...hidden], mode: "moment" }), (g) => act === undefined || showsInRoom(act, who, g)));
  }
  if (ASIDES.size > 200) ASIDES.clear();
  ASIDES.set(key, list);
  return list[n]!;
}

/** How long a turn lasts: a gesture plays its loop twice (within reason), and a pause between is a few seconds. */
function turnMs(gesture: string | null, seed: string): number {
  if (!gesture) return 1800 + (hash(seed) % 2200);
  const g = gestureOf(gesture);
  return Math.min(6400, Math.max(2600, g.beats * g.ms * 2));
}

/**
 * What people get on with when they aren't speaking: one of their own goings-on (Neil flies his drone,
 * Riya paints, Yahya clicks his stopwatch), then standing easy for a few seconds, then something
 * else, never the same thing twice running. Back from saying a line, they pick up where they
 * left off. With reduced motion each keeps their first, standing still.
 */
export function useAsides(people: AsidePerson[], { seed, avoid = [] }: { seed: string; avoid?: (string | undefined)[] }): Record<string, Aside> {
  const moving = useMotion();
  const [turns, setTurns] = useState<Record<string, number>>({});
  const shape = people.map((p) => `${p.who}:${p.free ? 1 : 0}:${p.tags.join(",")}:${p.act ?? ""}`).join("|");
  const avoidKey = avoid.join(",");

  const at = (p: AsidePerson, n: number) => (n % 2 ? null : asideAt(p.who, p.tags, seed, p.avoid ? [...avoid, ...p.avoid] : avoid, n / 2, p.act));

  // Each free person's turn ends after its own time; then the next one starts.
  useEffect(() => {
    if (!moving) return;
    const timers = people
      .filter((p) => p.free)
      .map((p) => {
        const n = turns[p.who] ?? 0;
        return setTimeout(() => setTurns((t) => ({ ...t, [p.who]: n + 1 })), turnMs(at(p, n), `${seed}|${p.who}|${n}`));
      });
    return () => timers.forEach(clearTimeout);
    // `shape` and `avoidKey` stand for `people` and `avoid`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moving, shape, turns, seed, avoidKey]);

  // Anyone not free (saying a line, listening to one, or off the stage) stands easy here; their
  // turn waits for them.
  const out: Record<string, Aside> = {};
  for (const p of people) {
    const g = p.free ? at(p, moving ? (turns[p.who] ?? 0) : 0) : null;
    out[p.who] = g ? { gesture: g, face: gestureOf(g).faces?.[0] } : { gesture: "idle" };
  }
  return out;
}

/** The first six stand for a kind of moment: the client's first line greets, or on a Ship celebrates, in a way of their own. */
const HELLO = { greet: "wave", celebrate: "cheer" } as const;

/**
 * Everyone on a stage, right now. The one speaking says their line with a face and gesture that
 * fit it (content's, or a fitting variety of their own for one of the first six or none); the
 * client's first line greets (or celebrates) as only they would. The others listen, looking at
 * the speaker; the client gets on with something of their own (`tags`) between lines and after,
 * and once it's all said, so does everyone else (`guestTags`). Seeded by `seed` (the project,
 * the step, the visit), so each project and each visit looks different.
 */
export function useStageCast(
  lines: Line[],
  talk: ReturnType<typeof useConversation>,
  client: string,
  {
    act,
    seed,
    hello = "greet",
    tags,
    guestTags = ["idle", "listen"],
    avoid = [],
    after,
    on = true,
  }: {
    /** The client's room: at their desk there, only what the desk doesn't hide. */
    act: number;
    seed: string;
    hello?: keyof typeof HELLO;
    tags: GestureTag[];
    guestTags?: GestureTag[];
    avoid?: string[];
    /** The face once it's all said, instead of the last line's. */
    after?: Expression;
    /** False while the stage isn't showing: nobody gets on with anything. */
    on?: boolean;
  },
): (who: string) => StagePerson {
  const looks = useMemo(() => {
    const out: { face: Expression; gesture: Pose }[] = [];
    const lastBy = new Map<string, string[]>();
    const first = lines.findIndex((l) => l.who === client);
    lines.forEach((l, i) => {
      const greeting = i === first;
      const given = l.gesture ?? (greeting ? HELLO[hello] : undefined);
      const before = [out[i - 1]?.gesture, ...(lastBy.get(l.who) ?? [])];
      const mood = (hidden: string[]) => moodOf(l.text, { face: l.face, gesture: given }, { who: l.who, seed: `${seed}|${i}`, avoid: [...before, ...hidden], mode: greeting ? "moment" : "talk" });
      // The client is at their desk: a gesture content names exactly is kept, anything chosen
      // for them is one the desk doesn't hide.
      const chosen = l.who === client && (!given || isFamily(given));
      const gesture = chosen ? pickShown((hidden) => mood(hidden).gesture, (g) => showsInRoom(act, client, g)) : mood([]).gesture;
      out.push({ face: mood([]).face, gesture });
      lastBy.set(l.who, [gesture, ...(lastBy.get(l.who) ?? [])].slice(0, 2));
    });
    return out;
  }, [lines, client, seed, hello, act]);

  const speaker = talk.speaking >= 0 ? lines[talk.speaking]!.who : null;
  const everyone = [client, ...othersIn(lines, client)];
  const asides = useAsides(
    // Guests are visiting: nobody nods off in someone else's room.
    everyone.map((who) => (who === client ? { who, free: on && who !== speaker, tags, act } : { who, free: on && !talk.playing, tags: guestTags, avoid: GLUM })),
    { seed, avoid: [...avoid, ...AT_SOMEONE] },
  );

  return (who: string): StagePerson => {
    if (who === speaker) {
      const m = looks[talk.speaking]!;
      return { who, face: m.face, gesture: m.gesture, mouthOpen: talk.mouth, speaking: true };
    }
    // Resting: the face of the last thing they said (or `after`, once it's all said).
    let rest: Expression = "neutral";
    for (let i = Math.min(lines.length, talk.shown) - 1; i >= 0; i--)
      if (lines[i]!.who === who) {
        rest = looks[i]!.face;
        break;
      }
    if (after && !talk.playing) rest = after;
    const a = asides[who];
    return a && a.gesture !== "idle" ? { who, face: a.face ?? rest, gesture: a.gesture } : { who, face: rest, gesture: "idle" };
  };
}
