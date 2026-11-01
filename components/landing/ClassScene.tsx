"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/display";
import type { Expression, Pose } from "@/lib/pixel/people";
import { PixelPerson } from "../art/PixelPerson";
import { useSpeech } from "../art/useSpeech";
import { SpeechBubble } from "../ui/SpeechBubble";
import { PixelClock } from "../site/PixelClock";
import styles from "./ClassScene.module.css";

// The hero's picture (REDESIGN3_PLAN.md P3): the whole class in one pixel scene, like a class
// photo. Paul and Neil stand at the back, the four classmates in front behind a long desk with
// Neil's rubber duck on it. Paul greets the visitor: his line types out and his mouth moves with
// it, and he waves. Then the class comes alive: now and then someone waves, cheers or gives a
// thumbs up. Positions are in sprite pixels; the CSS multiplies them by the scale (3 on wide
// screens, 2 on phones), so every pixel stays crisp. With reduced motion everyone holds still
// and the line is there whole.

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

/** What each of them does when it's their moment: a gesture and the face that goes with it. */
const MOMENTS: Record<string, { pose: Pose; face: Expression }[]> = {
  neil: [
    { pose: "thumbs", face: "pleased" },
    { pose: "cheer", face: "laughing" },
  ],
  aaesha: [
    { pose: "wave", face: "pleased" },
    { pose: "think", face: "thinking" },
  ],
  caitlin: [
    { pose: "cheer", face: "laughing" },
    { pose: "point", face: "pleased" },
  ],
  riya: [
    { pose: "wave", face: "pleased" },
    { pose: "thumbs", face: "proud" },
  ],
  yahya: [
    { pose: "thumbs", face: "proud" },
    { pose: "think", face: "unimpressed" },
  ],
};

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

  // Once Paul has said his line, someone does something every few seconds.
  useEffect(() => {
    if (!said || still) return;
    const who = Object.keys(MOMENTS);
    let last = "";
    let off: ReturnType<typeof setTimeout> | undefined;
    const next = () => {
      const pool = who.filter((w) => w !== last);
      const pick = pool[Math.floor(Math.random() * pool.length)]!;
      const options = MOMENTS[pick]!;
      const m = options[Math.floor(Math.random() * options.length)]!;
      last = pick;
      setMoment({ who: pick, ...m });
      off = setTimeout(() => setMoment(null), 1700);
    };
    const first = setTimeout(next, 900);
    const every = setInterval(next, 3600);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      if (off) clearTimeout(off);
    };
  }, [said, still]);

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
            const pose: Pose = isPaul ? (speech.talking && ready && !still ? "wave" : "idle") : (now?.pose ?? "idle");
            const face: Expression = isPaul ? (speech.talking && ready ? "talking" : "pleased") : (now?.face ?? s.face);
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
