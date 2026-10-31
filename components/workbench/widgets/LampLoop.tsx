"use client";

// Concept before code: a for loop, one pass at a time. Each pass lights one more dot.
import { useState } from "react";
import { Button } from "../../ui/Button";
import styles from "./widgets.module.css";

export function LampLoop({ params, onDone, done }: { params: { count?: number }; onDone: () => void; done: boolean }) {
  const count = Math.max(1, Math.min(8, params.count ?? 4));
  const [pass, setPass] = useState(done ? count : 0);
  const finished = pass >= count;
  const step = () => {
    const next = pass + 1;
    setPass(next);
    if (next >= count) onDone();
  };
  return (
    <div className={styles.widget}>
      <pre className={styles.loopCode}>
        <code>
          <span className={!finished && pass >= 0 ? styles.hot : ""}>{`for i in range(${count}):`}</span>
          {"\n"}
          {`    print("Pass", i)`}
        </code>
      </pre>
      <div className={styles.loopRow}>
        <div className={styles.passes} aria-hidden="true">
          {Array.from({ length: count }, (_, k) => (
            <span key={k} className={[styles.passDot, k < pass ? styles.passDone : "", k === pass - 1 && !finished ? styles.passNow : ""].join(" ")}>
              {k}
            </span>
          ))}
        </div>
        <div className={styles.loopState} aria-live="polite">
          <p>
            {pass === 0 ? "The loop hasn't started." : finished ? `Done. range(${count}) gave ${Array.from({ length: count }, (_, i) => i).join(", ")}.` : `Pass ${pass}: i is ${pass - 1}.`}
          </p>
          <pre className={styles.loopOut}>{Array.from({ length: Math.min(pass, count) }, (_, i) => `Pass ${i}`).join("\n") || " "}</pre>
        </div>
      </div>
      {!finished ? (
        <Button size="sm" variant="primary" onClick={step}>
          {pass === 0 ? "Start the loop" : "Next pass"}
        </Button>
      ) : (
        <p className={styles.fbGood}>
          {count} passes, and i went from 0 to {count - 1}. range({count}) stops before {count}.
        </p>
      )}
    </div>
  );
}
