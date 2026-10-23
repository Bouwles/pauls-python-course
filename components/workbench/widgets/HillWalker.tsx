"use client";

// Concept before code for gradient descent: a walker going downhill on a loss
// curve, one step at a time, with a learning rate you can change.
import { useMemo, useState } from "react";
import { Button } from "../../ui/Button";
import styles from "./widgets.module.css";

const loss = (x: number) => (x - 3) ** 2 + 1;
const grad = (x: number) => 2 * (x - 3);

export function HillWalker({ params, onDone, done }: { params: { start?: number; rate?: number }; onDone: () => void; done: boolean }) {
  const start = params.start ?? -2;
  const [rate, setRate] = useState(params.rate ?? 0.1);
  const [steps, setSteps] = useState<number[]>([start]);
  const [tried, setTried] = useState({ small: done, big: done });
  const x = steps[steps.length - 1]!;
  const W = 560;
  const H = 260;
  const sx = (v: number) => ((v + 4) / 14) * W;
  const sy = (v: number) => H - 14 - Math.min(1, v / 50) * (H - 30);
  const curve = useMemo(() => Array.from({ length: 141 }, (_, i) => -4 + i * 0.1).map((v) => `${sx(v)},${sy(loss(v))}`).join(" "), []);

  const step = () => {
    const next = x - rate * grad(x);
    setSteps([...steps, next]);
    const t = { ...tried };
    if (rate <= 0.5 && Math.abs(next - 3) < 0.05) t.small = true;
    if (rate > 1 && Math.abs(next - 3) > Math.abs(x - 3)) t.big = true;
    setTried(t);
    if (t.small && t.big && !(tried.small && tried.big)) onDone();
  };

  return (
    <div className={styles.widget}>
      <p className={styles.question}>The walker wants the bottom of the hill. Each step goes downhill by (learning rate) times (slope).</p>
      <label className={styles.rateRow}>
        Learning rate: {rate.toFixed(2)}
        <input type="range" min={0.01} max={1.1} step={0.01} value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ accentColor: "var(--accent-ink)" }} />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, border: "1px solid var(--rule)", background: "var(--paper-raised)" }} role="img" aria-label={`Loss curve. The walker is at x = ${x.toFixed(3)}, loss ${loss(x).toFixed(3)}, after ${steps.length - 1} steps.`}>
        <polyline points={curve} fill="none" stroke="var(--ink-2)" strokeWidth={2} />
        {steps.map((v, i) => (i > 0 ? <line key={i} x1={sx(steps[i - 1]!)} y1={sy(loss(steps[i - 1]!))} x2={sx(v)} y2={sy(loss(v))} stroke="var(--accent-ink)" strokeWidth={1.5} strokeDasharray="4 3" /> : null))}
        <rect x={sx(x) - 5} y={sy(loss(x)) - 14} width={10} height={14} fill="var(--fail)" />
        <circle cx={sx(x)} cy={sy(loss(x)) - 18} r={4} fill="var(--ink)" />
        <line x1={sx(3)} y1={H - 10} x2={sx(3)} y2={H - 4} stroke="var(--pass)" strokeWidth={2} />
      </svg>
      <p className={styles.dim} aria-live="polite">
        Step {steps.length - 1}: x = {x.toFixed(3)}, slope = {grad(x).toFixed(3)}, loss = {loss(x).toFixed(3)}
      </p>
      <div className={styles.row}>
        <Button size="sm" variant="primary" onClick={step} disabled={Math.abs(x) > 1e6}>
          Take a step
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setSteps([start])}>
          Back to the start
        </Button>
      </div>
      <p className={tried.small && tried.big ? styles.fbGood : styles.dim}>
        {tried.small && tried.big
          ? "Too small and the walk takes forever; too big and each step overshoots further than the last. The learning rate is a choice you make, not something the model learns."
          : `Try two things: reach the bottom with a rate of 0.5 or less${tried.small ? " (done)" : ""}, and then try a rate above 1${tried.big ? " (done)" : ""}.`}
      </p>
    </div>
  );
}
