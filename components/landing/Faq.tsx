import styles from "./Faq.module.css";

/** Questions and answers in two columns: all open, nothing to click to read them. */
export function Faq({ items, level = 3 }: { items: readonly (readonly [string, string])[]; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className={styles.faq}>
      {items.map(([q, a]) => (
        <div key={q} className={styles.item}>
          <H className={styles.q}>{q}</H>
          <p className={styles.a}>{a}</p>
        </div>
      ))}
    </div>
  );
}
