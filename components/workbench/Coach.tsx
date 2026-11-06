"use client";

import { useEffect, useMemo, useRef } from "react";
import { prefersReducedMotion } from "@/lib/display";
import { moodOf } from "@/lib/mood";
import { pickGesture } from "@/lib/pixel/variety";
import type { Expression, Pose } from "@/lib/pixel/people";
import { Speech } from "../art/Speech";
import { Icon } from "../ui/Icon";
import { useWorkbench, type Utterance } from "./context";
import styles from "./Coach.module.css";

/**
 * How the speaker looks on each line said on a step, in order. Content's face and gesture come
 * first (one of the first six becomes a fitting variety of the speaker's own); a reaction's tags
 * say what fits otherwise (a pass approves or celebrates); the words do the rest. Each line's seed is the
 * step, its place and when it was said, so a step looks different on each visit, and the gesture
 * before (anyone's, and the same speaker's last two) is never picked again straight after.
 */
export function coachLooks(said: Utterance[], stepId: string): { face: Expression; gesture: Pose }[] {
  const looks: { face: Expression; gesture: Pose }[] = [];
  const lastBy = new Map<string, string[]>();
  said.forEach((u, i) => {
    const seed = `${stepId}|${i}|${u.id}`;
    const avoid = [looks[i - 1]?.gesture, ...(lastBy.get(u.who) ?? [])];
    const m = moodOf(u.text, { face: u.face, gesture: u.gesture }, { who: u.who, seed, avoid });
    const gesture = u.tags && !u.gesture ? pickGesture({ who: u.who, tags: u.tags, face: m.face, seed: `${seed}|${u.text}`, avoid }) : m.gesture;
    looks.push({ face: m.face, gesture });
    lastBy.set(u.who, [gesture, ...(lastBy.get(u.who) ?? [])].slice(0, 2));
  });
  return looks;
}

/**
 * The coach (REDESIGN3_PLAN.md P3): whoever is speaking, as a 112 px pixel bust beside a speech
 * bubble, saying one line at a time. The words type out while their mouth moves, with the face
 * and a gesture that fits the line and the speaker (coachLooks), never the same one twice in a
 * row. Back and Next step through everything said on this step; a new reaction jumps to the
 * newest line.
 */
export function Coach() {
  const { coach, coachTo, nameOf, step } = useWorkbench();
  const box = useRef<HTMLElement>(null);
  const current: Utterance | undefined = coach.said[coach.index];
  const stepId = step?.id ?? "";
  const looks = useMemo(() => coachLooks(coach.said, stepId), [coach.said, stepId]);

  // A reaction (to a check, a run, an answer) comes into view if the panel has scrolled past it.
  const reacting = current && current.kind !== "step" ? current.id : null;
  useEffect(() => {
    if (reacting) box.current?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [reacting]);

  if (!current) return null;
  const name = nameOf(current.who);
  const count = coach.said.length;
  const first = coach.index === 0;
  const last = coach.index === count - 1;

  return (
    <section ref={box} className={styles.coach} aria-label="Coach">
      <Speech key={current.id} who={current.who} name={name} text={current.text} mood={looks[coach.index]} size={112} bubbleClassName={styles.bubble} />
      {count > 1 ? (
        <div className={styles.steps}>
          <button type="button" className={styles.back} onClick={() => coachTo(coach.index - 1)} disabled={first} title="The line before">
            <Icon name="caretLeft" size={16} />
            <span className="visually-hidden">The line before</span>
          </button>
          <span className={styles.count} aria-hidden="true">
            {coach.index + 1}/{count}
          </span>
          <button type="button" className={[styles.next, last ? "" : styles.more].join(" ")} onClick={() => coachTo(coach.index + 1)} disabled={last}>
            <span>Next line</span>
            <Icon name="next" size={16} />
          </button>
        </div>
      ) : null}
      <p className="visually-hidden" aria-live="polite">
        {name}: {current.text}
        {count > 1 ? ` Line ${coach.index + 1} of ${count}.` : ""}
      </p>
    </section>
  );
}
