"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/display";
import { Speech } from "../art/Speech";
import { Icon } from "../ui/Icon";
import { useWorkbench, type Utterance } from "./context";
import styles from "./Coach.module.css";

/**
 * The coach (REDESIGN3_PLAN.md P3): whoever is speaking, as a 112 px pixel bust beside a speech
 * bubble, saying one line at a time. The words type out while their mouth moves, with the face
 * and gesture the line calls for (from content, the reaction, or the words themselves). Back and
 * Next step through everything said on this step; a new reaction jumps to the newest line.
 */
export function Coach() {
  const { coach, coachTo, nameOf } = useWorkbench();
  const box = useRef<HTMLElement>(null);
  const current: Utterance | undefined = coach.said[coach.index];

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
      <Speech key={current.id} who={current.who} name={name} text={current.text} face={current.face} gesture={current.gesture} size={112} className={styles.speech} />
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
