"use client";

import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/lib/display";
import type { Expression, Pose } from "@/lib/pixel/people";
import { gestureOf, type GestureTag } from "@/lib/pixel/gestures";
import { pickGesture } from "@/lib/pixel/variety";
import { momentFor } from "@/lib/moments";
import { useVisit } from "@/lib/useVisit";
import { PixelPerson } from "../art/PixelPerson";
import { useSpeech } from "../art/useSpeech";
import { SpeechBubble } from "../ui/SpeechBubble";
import { PixelClock } from "../site/PixelClock";
import styles from "./ClassScene.module.css";

// The hero's picture (REDESIGN3_PLAN.md P3): the whole class in one pixel scene, like a class
// photo. Paul and Neil stand at the back, the four classmates in front behind a long desk with
// Neil's rubber duck on it. Paul greets the visitor: his line types out and his mouth moves with
// it, with a greeting of his own (a different one each visit). Then the class comes alive: every
// few seconds someone does something, from their own moves (Neil's rocket, Riya's palette,
// Yahya's stopwatch) and everyday ones (a stretch, a sip of coffee), never the same twice
// running and different on every visit (lib/pixel/variety.ts). Nobody moves up or down: only
// arms, hands and props. Positions are in sprite pixels; the CSS multiplies them by the scale (3
// on wide screens, 2 on phones), so every pixel stays crisp. With reduced motion everyone holds
// still and the line is there whole.

type Spot = { who: string; x: number; y: number; face: Expression };

/** Back row first, so the front row stands in front of it. */
const CLASS: Spot[] = [
  { who: "paul", x: 22, y: 0, face: "pleased" },
  { who: "neil", x: 107, y: 0, face: "pleased" },
  { who: "aaesha", x: 0, y: 32, face: "neutral" },
  { who: "caitlin", x: 43, y: 32, face: "pleased" },
  { who: "riya", x: 86, y: 32, face: "pleased" },
  { who: "yahya", x: 129, y: 32, face: "neutral" },
];

/** What a moment in class can be: anything from a cheer to a sip of coffee, their own moves most. */
const MOMENT_TAGS: GestureTag[] = ["celebrate", "approve", "greet", "idle", "work", "think", "tease", "listen", "surprise"];

/** How long a moment lasts: two loops of its gesture, within reason. */
function momentMs(gesture: string): number {
  const g = gestureOf(gesture);
  return Math.min(3600, Math.max(1800, g.beats * g.ms * 2));
}

export function ClassScene({ greeting, names }: { greeting: string; names: Record<string, string> }) {
  const [still, setStill] = useState(true);
  const [ready, setReady] = useState(false);
  const [moment, setMoment] = useState<{
    who: string;
    pose: Pose;
    face: Expression;
  } | null>(null);
  useEffect(() => {
    const reduced = prefersReducedMotion();
    setStill(reduced);
    // A beat after the page appears before Paul starts, so the line is noticed; with reduced
    // motion the line is simply there.
    const t = setTimeout(() => setReady(true), reduced ? 0 : 500);
    return () => clearTimeout(t);
  }, []);
  const [said, setSaid] = useState(false);
  const speech = useSpeech(greeting, {
    start: ready,
    onDone: () => setSaid(true),
  });

  // Paul's greeting while he says his line: a wave, a salute, a tip of the cap, chosen per visit.
  const visit = useVisit();
  const hello = useMemo(() => pickGesture({ who: "paul", tags: ["greet"], seed: `class|${visit}`, mode: "talk" }), [visit]);

  // Once Paul has said his line, someone does something every few seconds, Paul too.
  useEffect(() => {
    if (!said || still) return;
    const who = CLASS.map((s) => s.who);
    const past: Record<string, string[]> = { paul: [hello] };
    let last = "";
    let n = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      const pool = who.filter((w) => w !== last);
      const pick = pool[Math.floor(Math.random() * pool.length)]!;
      const spot = CLASS.find((s) => s.who === pick)!;
      const seen = (past[pick] ??= []);
      const m = momentFor({ who: pick, tags: MOMENT_TAGS, seed: `class|${visit}|${pick}|${n++}`, avoid: seen.slice(-6), mode: "moment" }, spot.face);
      seen.push(m.gesture);
      last = pick;
      setMoment({ who: pick, pose: m.gesture, face: m.face });
      const ms = momentMs(m.gesture);
      t = setTimeout(() => {
        setMoment(null);
        t = setTimeout(next, 900 + Math.random() * 1400);
      }, ms);
    };
    t = setTimeout(next, 900);
    return () => clearTimeout(t);
  }, [said, still, visit, hello]);

  const name = (id: string) => names[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
  const paul = name("paul");
  return (
    <div className={styles.room}>
      <p className="visually-hidden">
        The class in the Workshop: {paul} and {name("neil")} standing at the back, {name("aaesha")}, {name("caitlin")}, {name("riya")} and {name("yahya")} in front of them behind a long desk with a
        yellow rubber duck on it. On the wall, the clock says 3:14.
      </p>
      <PixelClock className={styles.clock} scale={3} />
      <div className={styles.scene}>
        <button type="button" className={styles.say} onClick={speech.skip} tabIndex={speech.talking ? 0 : -1} title={speech.talking ? "Show the whole line" : undefined}>
          <SpeechBubble who="paul" name={paul} tail="bottom" className={styles.bubble}>
            <span className={styles.line}>
              <span className={styles.ghost} aria-hidden="true">
                {greeting}
              </span>
              <span className={styles.typed} aria-hidden={speech.talking ? true : undefined}>
                {speech.shown}
              </span>
              {speech.talking ? <span className="visually-hidden">{greeting}</span> : null}
            </span>
          </SpeechBubble>
        </button>
        <div className={styles.stage} aria-hidden="true">
          {CLASS.map((s) => {
            const now = moment?.who === s.who ? moment : null;
            const isPaul = s.who === "paul";
            const greets = isPaul && speech.talking && ready;
            const pose: Pose = greets ? (still ? "idle" : hello) : (now?.pose ?? "idle");
            const face: Expression = greets ? "talking" : (now?.face ?? s.face);
            return (
              <span
                key={s.who}
                className={styles.spot}
                style={{
                  ["--x" as string]: s.x,
                  ["--y" as string]: s.y,
                  zIndex: s.y ? 2 : 1,
                }}
              >
                <PixelPerson who={s.who} expression={face} pose={pose} mouthOpen={isPaul ? speech.open : undefined} scale={1} className={styles.person} />
              </span>
            );
          })}
          <span className={styles.desk} />
          <Duck className={styles.duck} />
        </div>
      </div>
    </div>
  );
}

// Neil's rubber duck (REDESIGN-2.md 7.2): yellow, facing the class, with a chip out of its beak.
// # body, s shade, b beak, e eye; the outline is worked out round it.
const DUCK = ["....###.....", "...#####....", "..##e###....", "bb######....", ".b######..#.", "..#########.", ".##########s", ".#########ss", "..sssssssss."];
const DUCK_FILL: Record<string, string> = {
  "#": "var(--sun)",
  s: "var(--sun-press)",
  b: "var(--c-aaesha)",
  e: "var(--sun-ink)",
  o: "var(--px-outline)",
};
const DUCK_PATHS = (() => {
  const w = DUCK[0]!.length + 2;
  const h = DUCK.length + 2;
  const at = (x: number, y: number) => DUCK[y - 1]?.[x - 1] ?? ".";
  const cell = (x: number, y: number) => {
    const c = at(x, y);
    if (c !== ".") return c;
    return [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)].some((n) => n !== ".") ? "o" : ".";
  };
  const runs: Record<string, string> = {};
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w;) {
      const c = cell(x, y);
      let n = 1;
      while (x + n < w && cell(x + n, y) === c) n++;
      if (c !== ".") runs[c] = (runs[c] ?? "") + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  return {
    w,
    h,
    paths: ["o", "#", "s", "b", "e"].filter((c) => runs[c]).map((c) => ({ fill: DUCK_FILL[c]!, d: runs[c]! })),
  };
})();

function Duck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${DUCK_PATHS.w} ${DUCK_PATHS.h}`}
      shapeRendering="crispEdges"
      focusable="false"
      style={{
        ["--w" as string]: DUCK_PATHS.w,
        ["--h" as string]: DUCK_PATHS.h,
      }}
    >
      {DUCK_PATHS.paths.map((p) => (
        <path key={p.fill} d={p.d} style={{ fill: p.fill }} />
      ))}
    </svg>
  );
}
