import { SHOWCASE } from "@/lib/showcase";
import { SpriteFrame } from "../world/SpriteFrame";
import styles from "./Landing.module.css";

/** A pixel shelf of real projects. Hover or focus an object for one line about it. */
export function BuildShelf() {
  const rows = [SHOWCASE.slice(0, 4), SHOWCASE.slice(4)];
  return (
    <div className={styles.shelf}>
      {rows.map((row, r) => (
        <ul key={r} className={styles.shelfRow}>
          {row.map((p) => (
            <li key={p.sprite} className={styles.shelfItem} tabIndex={0} aria-describedby={`${p.sprite}-line`}>
              <SpriteFrame sprite={p.sprite} scale={4} />
              <span className={styles.shelfLabel}>{p.name}</span>
              <span className={styles.shelfAct}>{p.act}</span>
              <span id={`${p.sprite}-line`} role="tooltip" className={styles.shelfLine}>
                {p.line}
              </span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
