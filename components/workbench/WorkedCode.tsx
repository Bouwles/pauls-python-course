// A worked example with its subgoal labels in the margin.
import { highlightLines } from "./CodeBlock";
import cb from "./CodeBlock.module.css";
import styles from "./WorkedCode.module.css";

export function WorkedCode({ code, subgoals, language = "python" }: { code: string; subgoals: { label: string; lines: [number, number] }[]; language?: "python" | "text" }) {
  const lines = highlightLines(code, language);
  const groupOf = (n: number) => subgoals.findIndex((g) => n >= g.lines[0] && n <= g.lines[1]);
  const blocks: { group: number; start: number; end: number }[] = [];
  lines.forEach((segs, i) => {
    const n = i + 1;
    // A blank line stays with the block above it rather than making a block of its own.
    const g = segs.length === 0 && blocks.length ? blocks[blocks.length - 1]!.group : groupOf(n);
    const last = blocks[blocks.length - 1];
    if (last && last.group === g) last.end = n;
    else blocks.push({ group: g, start: n, end: n });
  });
  return (
    <div className={styles.worked} role="group" aria-label="Worked example with subgoals">
      {blocks.map((b, bi) => (
        <div key={bi} className={[styles.block, b.group >= 0 ? styles.labelled : ""].join(" ")}>
          <div className={styles.label}>
            {b.group >= 0 && subgoals[b.group]!.lines[0] === b.start ? (
              <>
                <span className={styles.n}>{b.group + 1}</span>
                <span>{subgoals[b.group]!.label}</span>
              </>
            ) : null}
          </div>
          <pre className={styles.code}>
            <code>
              {lines.slice(b.start - 1, b.end).map((segs, i) => (
                <span key={i} className={styles.line}>
                  <span className={styles.num} aria-hidden="true">
                    {b.start + i}
                  </span>
                  <span className={cb.text}>
                    {segs.length === 0 ? "​" : segs.map((s, j) => (s.cls ? <span key={j} className={s.cls.split(" ").map((c) => cb[c] ?? "").join(" ")}>{s.text}</span> : s.text))}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        </div>
      ))}
    </div>
  );
}
