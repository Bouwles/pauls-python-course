"use client";

// Concept before code for Big-O: how the amount of work grows with n.
import { useState } from "react";
import styles from "./widgets.module.css";

const CURVES = [
  { id: "1", label: "constant, O(1)", f: () => 1 },
  { id: "logn", label: "O(log n)", f: (n: number) => Math.max(1, Math.log2(n)) },
  { id: "n", label: "O(n)", f: (n: number) => n },
  { id: "nlogn", label: "O(n log n)", f: (n: number) => n * Math.max(1, Math.log2(n)) },
  { id: "n2", label: "O(n²)", f: (n: number) => n * n },
] as const;

export function Growth({ params, onDone, done }: { params: { max?: number; show?: string[] }; onDone: () => void; done: boolean }) {
  const max = params.max ?? 1000;
  const shown = CURVES.filter((c) => !params.show || params.show.includes(c.id));
  const [n, setN] = useState(10);
  const [moved, setMoved] = useState(done);
  const W = 560;
  const H = 260;
  const top = Math.max(...shown.map((c) => c.f(n)));
  const xs = Array.from({ length: 40 }, (_, i) => Math.max(1, Math.round((n * (i + 1)) / 40)));
  return (
    <div className={styles.widget}>
      <label className={styles.question} htmlFor="growth-n">
        Piles of n items. How many steps does each kind of search or sort take? n = {n}
      </label>
      <input
        id="growth-n"
        type="range"
        min={2}
        max={max}
        value={n}
        onChange={(e) => {
          setN(Number(e.target.value));
          if (!moved && Number(e.target.value) > max / 2) {
            setMoved(true);
            onDone();
          }
        }}
        className={styles.range}
        style={{ width: "100%", maxWidth: W }}
      />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className={styles.chart} style={{ maxWidth: W }} role="img" aria-label={`Steps for n = ${n}: ${shown.map((c) => `${c.label} ${Math.round(c.f(n))}`).join(", ")}`}>
        {shown.map((c, k) => {
          const pts = xs.map((x, i) => `${(i / (xs.length - 1)) * (W - 20) + 10},${H - 10 - (c.f(x) / top) * (H - 30)}`).join(" ");
          const colours = ["var(--text-2)", "var(--c-neil)", "var(--blue-text)", "var(--sun)", "var(--fail)"];
          return <polyline key={c.id} points={pts} fill="none" stroke={colours[k % colours.length]} strokeWidth={2} />;
        })}
      </svg>
      <table className={styles.growthTable}>
        <thead>
          <tr>
            <th scope="col">Growth</th>
            <th scope="col">Steps at n = {n}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((c) => (
            <tr key={c.id}>
              <th scope="row">{c.label}</th>
              <td>{Math.round(c.f(n)).toLocaleString("en-GB")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {moved ? <p className={styles.fbGood}>At n = {n}, the difference between the slowest and quickest growth is a factor of {Math.round(top / Math.max(1, Math.min(...shown.map((c) => c.f(n))))).toLocaleString("en-GB")}. That gap is what Big-O describes.</p> : <p className={styles.dim}>Drag n past {Math.round(max / 2)} and watch which line runs away.</p>}
    </div>
  );
}
