"use client";

import { useEffect, useState } from "react";
import { Portrait, type Expression } from "../art/Portrait";
import { SpeechBubble } from "../ui/SpeechBubble";
import { Icon } from "../ui/Icon";
import { useWorkbench, type Utterance } from "./context";
import styles from "./Coach.module.css";

const EXPRESSIONS = new Set<Expression>(["neutral", "talking", "pleased", "proud", "thinking", "confused", "worried", "surprised", "laughing", "unimpressed"]);
const expression = (face?: string): Expression => (face && EXPRESSIONS.has(face as Expression) ? (face as Expression) : "neutral");

/**
 * The coach (REDESIGN-2.md 4.4): whoever is speaking, as a 64 px portrait with their name tag and
 * a speech bubble of one or two short lines. It shows only when there's something worth saying:
 * the start of a step, a check, a hint, a reaction to the code. Clicking the portrait shows what
 * was said earlier on this step.
 */
export function Coach() {
  const { coach, coachTo, nameOf } = useWorkbench();
  const [history, setHistory] = useState(false);
  const current: Utterance | undefined = coach.said[coach.index];
  const earlier = coach.said.slice(0, coach.index);
  const more = coach.index < coach.said.length - 1;

  useEffect(() => {
    if (!earlier.length) setHistory(false);
  }, [earlier.length]);

  if (!current) return null;
  const name = nameOf(current.who);

  return (
    <section className={styles.coach} aria-label="Coach">
      {history && earlier.length ? (
        <ol className={styles.history} aria-label="Earlier on this step">
          {earlier.map((u) => (
            <li key={u.id} className={styles.past}>
              <Portrait who={u.who} name={nameOf(u.who)} size={28} expression={expression(u.face)} />
              <p>
                <span className={styles.pastName}>{nameOf(u.who)}</span> {u.lines.join(" ")}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
      <div className={styles.row}>
        {earlier.length ? (
          <button type="button" className={styles.portraitButton} aria-expanded={history} onClick={() => setHistory((h) => !h)} title={history ? "Hide the earlier lines" : "Show the earlier lines"}>
            <Portrait who={current.who} name={name} size={64} expression={expression(current.face)} label={`${name}. ${history ? "Hide" : "Show"} the earlier lines on this step`} />
          </button>
        ) : (
          <Portrait who={current.who} name={name} size={64} expression={expression(current.face)} className={styles.portrait} />
        )}
        <div className={styles.say}>
          <SpeechBubble key={current.id} who={current.who} name={name} tail="left" className={styles.bubble}>
            {current.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </SpeechBubble>
          {more ? (
            <button type="button" className={styles.next} onClick={() => coachTo(coach.index + 1)}>
              <span>Next line</span>
              <Icon name="next" size={16} />
            </button>
          ) : null}
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {name}: {current.lines.join(" ")}
      </p>
    </section>
  );
}
