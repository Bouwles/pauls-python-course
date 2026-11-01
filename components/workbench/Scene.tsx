"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Line } from "@/lib/content/types";
import { CAST_IDS, FLOORS, castColour } from "@/lib/cast";
import { ROOM_W, residentsOf, roomHeight } from "@/lib/pixel/rooms";
import { moodOf } from "@/lib/mood";
import { prefersReducedMotion } from "@/lib/display";
import type { Expression, Pose } from "@/lib/pixel/people";
import { PixelPerson, type PixelPersonProps } from "../art/PixelPerson";
import { PixelRoom } from "../art/PixelRoom";
import { useSpeech } from "../art/useSpeech";
import { SpeechBubble } from "../ui/SpeechBubble";
import styles from "./Scene.module.css";

// The Ask and the Ship as small pixel scenes (REDESIGN3_PLAN.md P3): the client at their desk in
// their room on the Clocktower, anyone else in the conversation in the foreground, and the lines
// said in bubbles beside them. A line types out like <Speech> does (lib/mood.ts, useSpeech), and
// its speaker's mouth moves with it here on the stage instead of in a portrait by the bubble.

/** How open a mouth is: in time with useSpeech. */
export type Mouth = PixelPersonProps["mouthOpen"];

export interface StagePerson {
  who: string;
  face: Expression;
  gesture: Pose;
  /** In time with the line being typed; leave out when they aren't speaking. */
  mouthOpen?: Mouth;
}

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

  return (
    <div ref={box} className={[styles.stage, className].filter(Boolean).join(" ")} style={{ height: h || undefined }} role="img" aria-label={label}>
      {width ? (
        <div className={styles.shift} style={{ transform: `translateX(${shift}px)` }} aria-hidden="true">
          <PixelRoom act={act} state="open" scale={k} people={[{ who: lead.who, expression: lead.face, gesture: lead.gesture, mouthOpen: lead.mouthOpen, spot }]}>
            {shown.map((g, i) => {
              const x = left ? 2 + i * 30 : ROOM_W - 50 - i * 30;
              return (
                <span key={g.who} className={styles.guest} style={{ left: x * k, top: (roomHeight(act) - 44) * k }}>
                  <PixelPerson who={g.who} expression={g.face} pose={g.gesture} mouthOpen={g.mouthOpen} scale={k} />
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

/**
 * How `who` looks on the stage right now: saying their line (the client greets with `hello` on
 * their first line unless it says otherwise), or listening with the face of their last line.
 */
export function personOnStage(who: string, lines: Line[], talk: ReturnType<typeof useConversation>, client: string, hello: Pose = "wave"): StagePerson {
  if (talk.speaking >= 0 && lines[talk.speaking]!.who === who) {
    const l = lines[talk.speaking]!;
    const greeting = who === client && talk.speaking === lines.findIndex((x) => x.who === who);
    const m = moodOf(l.text, { face: l.face, gesture: l.gesture ?? (greeting ? hello : undefined) });
    return { who, face: m.face, gesture: m.gesture, mouthOpen: talk.mouth };
  }
  const upto = Math.min(lines.length, talk.shown) - 1;
  for (let i = upto; i >= 0; i--) if (lines[i]!.who === who) return { who, face: moodOf(lines[i]!.text, lines[i]).face, gesture: "idle" };
  return { who, face: "neutral", gesture: "idle" };
}
