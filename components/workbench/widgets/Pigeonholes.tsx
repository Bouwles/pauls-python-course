"use client";

// Concept before code (Section 3.7): find a parcel in pigeonholes numbered from 0.
import { useState } from "react";
import { Button } from "../../ui/Button";
import styles from "./widgets.module.css";

interface Params {
  items?: string[];
  ask?: number;
  negative?: boolean;
}

export function Pigeonholes({ params, onDone, done }: { params: Params; onDone: () => void; done: boolean }) {
  const items = params.items ?? ["Bea", "Ferro", "Tom", "Agnes", "Gwen", "Moss", "Mira"];
  const ask = params.ask ?? 3;
  const questions = [{ index: ask, label: `Mira says: "Parcel number ${ask}, please." Which pigeonhole?`, code: `parcels[${ask}]` }];
  if (params.negative) questions.push({ index: items.length - 1, label: `"Now the last one. Python can also call it number -1." Which pigeonhole?`, code: "parcels[-1]" });
  const [q, setQ] = useState(done ? questions.length : 0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const current = questions[q];

  const choose = (i: number) => {
    if (!current) return;
    setPicked(i);
    if (i === current.index) {
      setFeedback({ good: true, text: q === 0 ? `Right: hole ${i}. ${current.code} is "${items[i]}". The first hole is number 0, so number ${ask} is the ${ordinal(ask + 1)} from the left.` : `Right. ${current.code} is "${items[i]}". Negative numbers count back from the end, starting at -1.` });
      if (q === questions.length - 1) onDone();
    } else if (q === 0 && i === ask - 1) {
      setFeedback({ good: false, text: `That's the ${ordinal(ask)} hole, the one you'd call number ${ask} if counting started at 1. Mira's numbers start at 0.` });
    } else {
      setFeedback({ good: false, text: "Not that one. Read the numbers under the holes, not the order you'd count them in." });
    }
  };

  return (
    <div className={styles.widget}>
      <p className={styles.question}>{current ? current.label : "Every parcel has a number, starting at 0."}</p>
      <div className={styles.holes} role="group" aria-label="Pigeonholes">
        {items.map((item, i) => (
          <button key={i} className={[styles.hole, picked === i && feedback ? (feedback.good ? styles.good : styles.bad) : ""].join(" ")} onClick={() => choose(i)} disabled={!current} aria-label={`Pigeonhole ${i}${params.negative ? `, also ${i - items.length}` : ""}: ${item}`}>
            <span className={styles.parcel}>{item}</span>
            <span className={styles.holeNo}>{i}</span>
            {params.negative ? <span className={styles.holeNeg}>{i - items.length}</span> : null}
          </button>
        ))}
      </div>
      {feedback ? (
        <p className={[styles.feedback, feedback.good ? styles.fbGood : styles.fbBad].join(" ")} role="status">
          {feedback.text}
        </p>
      ) : null}
      {feedback?.good && q < questions.length - 1 ? (
        <Button size="sm" onClick={() => {
          setQ(q + 1);
          setPicked(null);
          setFeedback(null);
        }}>
          Next question
        </Button>
      ) : null}
    </div>
  );
}

function ordinal(n: number) {
  return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][n] ?? `${n}th`;
}
