"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSISTANT, CLASSMATES, FLOORS, PROFESSOR } from "@/lib/cast";
import { prefersReducedMotion } from "@/lib/display";
import { moodOf } from "@/lib/mood";
import { gestureOf, gesturesFor } from "@/lib/pixel/gestures";
import type { View } from "@/lib/pixel/figures";
import type { Expression } from "@/lib/pixel/people";
import { hash } from "@/lib/pixel/variety";
import { useVisit } from "@/lib/useVisit";
import { PixelFigure } from "../art/PixelFigure";
import { Speech } from "../art/Speech";
import { useOnScreen } from "../art/useOnScreen";
import styles from "./MeetTheClass.module.css";

// "Meet the class" (REDESIGN-2.md 6 and 7, REDESIGN3_PLAN.md P3): the six people in the
// Clocktower, each standing on their colour like the cast sheet, saying a line in their own voice
// about what they're into, with the face and gesture that go with it. The teachers first, then
// the four classmates. They start talking when the section comes into view, one after another.
// Once they've said their line, each shows their own moves in turn (Neil's rocket launch, Riya's
// palette, Yahya's stopwatch), one person at a time, in a different order every visit; beside
// them on wide screens a small figure of them, head to toe, gets on with what they're into (Paul
// at a chalkboard, Caitlin on guitar). Nobody moves up and down; with reduced motion they hold
// still.

const ROLE: Record<string, string> = {
  paul: "The professor. Coding, AI and machine learning.",
  neil: "The teaching assistant. Racing cars and aerospace.",
  aaesha: "Classmate. Cognitive systems.",
  caitlin: "Classmate. A bit of everything.",
  riya: "Classmate. Art and design.",
  yahya: "Classmate. Data science.",
};

const LINE: Record<string, { text: string; face: string; gesture: string }> = {
  paul: { text: "Most of AI is careful Python and honest data. I'll teach you both, in that order.", face: "pleased", gesture: "point" },
  neil: { text: "Racing cars and rockets both run on code. Lap times, launch windows, telemetry: it's all Python underneath.", face: "laughing", gesture: "thumbs" },
  aaesha: { text: "I'm into how minds remember and decide. I build small ones in code to see where they break.", face: "thinking", gesture: "think" },
  caitlin: { text: "Games, websites, a bot that reminds me to water my plants. If it's fun, I've built it.", face: "laughing", gesture: "point" },
  riya: { text: "I make art with code: patterns, colour, pictures that draw themselves. First question: who's it for?", face: "pleased", gesture: "wave" },
  yahya: { text: "Give me a messy dataset and ten minutes. The answer's in there, and I'll find it first.", face: "proud", gesture: "thumbs" },
};

/** What their small figure does, their interest first: a turn of each, back to the first between. */
const PASTIMES: Record<string, { action: string; facing: View }[]> = {
  paul: [{ action: "chalkboard", facing: "left" }, { action: "talk", facing: "left" }, { action: "drink", facing: "front" }],
  neil: [{ action: "drone", facing: "front" }, { action: "think", facing: "left" }, { action: "cheer", facing: "front" }],
  aaesha: [{ action: "clipboard", facing: "front" }, { action: "read", facing: "left" }, { action: "think", facing: "left" }],
  caitlin: [{ action: "guitar", facing: "front" }, { action: "dance", facing: "front" }, { action: "clap", facing: "front" }],
  riya: [{ action: "easel", facing: "left" }, { action: "phone", facing: "front" }, { action: "think", facing: "left" }],
  yahya: [{ action: "stopwatch", facing: "front" }, { action: "drink", facing: "left" }, { action: "shrug", facing: "front" }],
};

/** Their own moves, in an order of this visit's: never the paper crown, which is for a reason. */
function ownMoves(id: string, seed: string): string[] {
  return gesturesFor(id)
    .filter((g) => g.who?.includes(id) && g.id !== "paper-crown")
    .map((g) => g.id)
    .sort((a, b) => hash(`${seed}|${a}`) - hash(`${seed}|${b}`));
}

/** The rooms someone runs (the roof is everyone's), as "the Workshop and the Model Room". */
function rooms(id: string): string {
  const names = FLOORS.filter((f) => f.residents.length < 3 && f.residents.includes(id)).map((f) => f.room);
  const list = names.map((n, i) => (i ? n.replace(/^The /, "the ") : n));
  return list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : (list[0] ?? "");
}

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** True on phones, where each person is a portrait beside their line instead of above it. */
function usePhone(): boolean {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

export function MeetTheClass({ names }: { names: Record<string, string> }) {
  const n = (id: string) => names[id] ?? cap(id);
  const phone = usePhone();
  const ref = useRef<HTMLUListElement>(null);
  const onScreen = useOnScreen(ref, "0px");
  const visit = useVisit();
  // How many have started talking: none until the class is on screen, then one more every beat.
  const [talking, setTalking] = useState(0);
  const [still, setStill] = useState(true);
  const people = [PROFESSOR, ASSISTANT, ...CLASSMATES];
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setTalking(people.length);
      return;
    }
    setStill(false);
    let tick: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setTalking(1);
        tick = setInterval(() => setTalking((t) => (t >= people.length ? t : t + 1)), 900);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (tick) clearInterval(tick);
    };
  }, [people.length]);

  // Who has said their line, and how far through their own moves each of them is. One person
  // moves on at a time, so the class never changes all at once.
  const [said, setSaid] = useState<Record<string, boolean>>({});
  const [turns, setTurns] = useState<Record<string, number>>({});
  const live = !still && onScreen;
  useEffect(() => {
    if (!live) return;
    // Each person gets a turn every six ticks, in order, so a turn comes every eight seconds or so.
    let tick = 0;
    const t = setInterval(() => {
      const id = people[tick++ % people.length]!;
      if (said[id]) setTurns((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    }, 1300);
    return () => clearInterval(t);
    // `people` is the same six every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, said]);

  const moves = useMemo(() => Object.fromEntries(people.map((id) => [id, ownMoves(id, `meet|${visit}`)])), [visit, people.join()]);

  return (
    <ul ref={ref} className={styles.grid}>
      {people.map((id, i) => {
        const line = LINE[id]!;
        const where = rooms(id);
        const turn = turns[id] ?? 0;
        // While they talk: a gesture that suits the line, theirs for this visit. After: their own moves.
        // (Until the visit's seed arrives, the line's own gesture, so the page hydrates as it was sent.)
        const talk = visit ? moodOf(line.text, { face: line.face, gesture: line.gesture }, { who: id, seed: `meet|${visit}` }) : line;
        const own = moves[id]!;
        const gesture = said[id] && turn > 0 && !still ? own[(turn - 1) % own.length]! : talk.gesture;
        const face = (said[id] && turn > 0 && !still ? gestureOf(gesture).faces?.[0] : undefined) ?? (line.face as Expression);
        const pastimes = PASTIMES[id]!;
        // The pastime changes every few of their turns: their interest, then something else, then back.
        const step = Math.floor(turn / 3);
        const pastime = step % 2 === 0 ? pastimes[0]! : pastimes[1 + ((step >> 1) % (pastimes.length - 1))]!;
        return (
          <li key={id} className={styles.person}>
            <h3 className="visually-hidden">{n(id)}</h3>
            <Speech
              who={id}
              name={n(id)}
              text={line.text}
              face={face}
              gesture={gesture}
              big={!phone}
              size={phone ? 112 : 232}
              start={talking > i}
              onDone={() => setSaid((d) => (d[id] ? d : { ...d, [id]: true }))}
              className={[styles.speech, phone ? "" : styles.big].join(" ")}
            />
            {phone ? null : (
              <span className={styles.pastime} aria-hidden="true">
                <PixelFigure who={id} action={pastime.action} facing={pastime.facing} scale={2} animate={!still} />
              </span>
            )}
            <p className={styles.role}>
              <span className={styles.roleText}>{ROLE[id]}</span>
              {where ? <span className={styles.where}>{where}</span> : null}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
