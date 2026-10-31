"use client";

// Concept before code: two labels on one box (list aliasing), then a real copy.
import { useState } from "react";
import { Button } from "../../ui/Button";
import styles from "./widgets.module.css";

interface Box {
  id: string;
  items: string[];
}

const SCRIPT = [
  { code: 'order = ["flour", "eggs"]', note: "One box, one label." },
  { code: "saturday = order", note: "A second label. Not a second box." },
  { code: 'saturday.append("butter")', note: "Butter goes into the box both labels are stuck on." },
  { code: "print(order)", note: 'Prints ["flour", "eggs", "butter"]. Nobody touched order directly.' },
  { code: "sunday = order.copy()", note: "copy() builds a new box with the same things in it." },
  { code: 'sunday.append("cream")', note: "Only Sunday's box gets cream." },
];

function stateAfter(step: number): { boxes: Box[]; labels: Record<string, string> } {
  const boxes: Box[] = [];
  const labels: Record<string, string> = {};
  if (step >= 1) {
    boxes.push({ id: "A", items: ["flour", "eggs"] });
    labels.order = "A";
  }
  if (step >= 2) labels.saturday = "A";
  if (step >= 3) boxes[0]!.items.push("butter");
  if (step >= 5) {
    boxes.push({ id: "B", items: [...boxes[0]!.items] });
    labels.sunday = "B";
  }
  if (step >= 6) boxes[1]!.items.push("cream");
  return { boxes, labels };
}

export function TwoLabels({ onDone, done }: { onDone: () => void; done: boolean }) {
  const [step, setStep] = useState(done ? SCRIPT.length : 0);
  const [guess, setGuess] = useState<string | null>(null);
  const { boxes, labels } = stateAfter(step);
  const atPredict = step === 3 && guess === null;

  const advance = () => {
    const next = step + 1;
    setStep(next);
    if (next === SCRIPT.length) onDone();
  };

  return (
    <div className={styles.widget}>
      <ol className={styles.script}>
        {SCRIPT.map((s, i) => (
          <li key={i} className={[styles.scriptLine, i < step ? styles.ran : "", i === step ? styles.nextLine : ""].join(" ")}>
            <code>{s.code}</code>
            {i < step ? <span className={styles.scriptNote}>{s.note}</span> : null}
          </li>
        ))}
      </ol>
      <div className={styles.boxes} aria-live="polite">
        {boxes.length === 0 ? <p className={styles.dim}>Nothing yet.</p> : null}
        {boxes.map((b) => (
          <div key={b.id} className={styles.boxCol}>
            <div className={styles.tags}>
              {Object.entries(labels)
                .filter(([, id]) => id === b.id)
                .map(([name]) => (
                  <span key={name} className={styles.tag}>
                    {name}
                  </span>
                ))}
            </div>
            <div className={styles.box} aria-label={`A list holding ${b.items.join(", ")}`}>
              {b.items.map((it, i) => (
                <span key={i} className={styles.item}>
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {atPredict ? (
        <div className={styles.predict}>
          <p className={styles.question}>Before you run line 4: does order have butter in it?</p>
          <div className={styles.row}>
            <Button size="sm" onClick={() => setGuess("yes")}>
              Yes
            </Button>
            <Button size="sm" onClick={() => setGuess("no")}>
              No
            </Button>
          </div>
        </div>
      ) : step < SCRIPT.length ? (
        <Button size="sm" variant="primary" onClick={advance}>
          Run line {step + 1}
        </Button>
      ) : (
        <p className={styles.fbGood}>Two labels can share one box. Change the box through either label and both see it. Only a copy gives you a box of your own.</p>
      )}
      {guess && step === 3 ? (
        <p className={[styles.feedback, guess === "yes" ? styles.fbGood : styles.fbBad].join(" ")} role="status">
          {guess === "yes" ? "Yes. Both labels point at the same box." : "It does. saturday and order are two labels on one box, so butter is in both."}
        </p>
      ) : null}
    </div>
  );
}
