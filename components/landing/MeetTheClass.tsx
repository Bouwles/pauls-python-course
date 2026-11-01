"use client";

import { useEffect, useRef, useState } from "react";
import { ASSISTANT, CLASSMATES, FLOORS, PROFESSOR } from "@/lib/cast";
import { prefersReducedMotion } from "@/lib/display";
import { Speech } from "../art/Speech";
import styles from "./MeetTheClass.module.css";

// "Meet the class" (REDESIGN-2.md 6 and 7, REDESIGN3_PLAN.md P3): the six people in the
// Clocktower, each standing on their colour like the cast sheet, saying a line in their own voice
// about what they're into, with the face and gesture that go with it. The teachers first, then
// the four classmates. They start talking when the section comes into view, one after another.

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
  // How many have started talking: none until the class is on screen, then one more every beat.
  const [talking, setTalking] = useState(0);
  const people = [PROFESSOR, ASSISTANT, ...CLASSMATES];
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setTalking(people.length);
      return;
    }
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

  return (
    <ul ref={ref} className={styles.grid}>
      {people.map((id, i) => {
        const line = LINE[id]!;
        const where = rooms(id);
        return (
          <li key={id} className={styles.person}>
            <h3 className="visually-hidden">{n(id)}</h3>
            <Speech who={id} name={n(id)} text={line.text} face={line.face} gesture={line.gesture} big={!phone} size={phone ? 112 : 232} start={talking > i} className={[styles.speech, phone ? "" : styles.big].join(" ")} />
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
