import { STRENGTH_LABEL, type Strength as Level } from "@/lib/review/strength";
import styles from "./Concepts.module.css";

const PIPS: Record<Level, number> = { unseen: 0, new: 1, shaky: 1, fresh: 2, steady: 3, strong: 4 };

/** How well a concept is holding: four pixel pips and the word for it (never colour alone). */
export function Strength({ level, children }: { level: Level; children?: React.ReactNode }) {
  const lit = PIPS[level];
  return (
    <span className={[styles.strength, styles[level]].join(" ")}>
      <span className={styles.pips} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < lit ? styles.pipOn : styles.pip} />
        ))}
      </span>
      <span>
        {STRENGTH_LABEL[level]}
        {children}
      </span>
    </span>
  );
}
