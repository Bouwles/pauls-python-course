"use client";

// The building blocks of the Settings page: a section with a heading, rows with the label on
// the left and the control on the right, and a segmented choice over real radios.
import { useId } from "react";
import styles from "./Settings.module.css";

export function Section({ id, title, intro, children, className }: { id: string; title: string; intro?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={[styles.section, className].filter(Boolean).join(" ")} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-title`} className={styles.h2}>
          {title}
        </h2>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      <div className={styles.rows}>{children}</div>
    </section>
  );
}

/** A labelled row: the words on the left, the control on the right (stacked on a phone). */
export function Row({ label, hint, children, htmlFor, wide = false }: { label: React.ReactNode; hint?: React.ReactNode; children?: React.ReactNode; htmlFor?: string; wide?: boolean }) {
  return (
    <div className={[styles.row, wide ? styles.rowWide : ""].join(" ")}>
      <div className={styles.rowText}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={styles.rowLabel}>
            {label}
          </label>
        ) : (
          <p className={styles.rowLabel}>{label}</p>
        )}
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      {children !== undefined ? <div className={styles.rowControl}>{children}</div> : null}
    </div>
  );
}

/** A segmented choice. The radios are real; `name` keeps each group separate. */
export function Choice({ label, name, value, options, onChange, hint }: { label: string; name?: string; value: string; options: [string, string][]; onChange: (v: string) => void; hint?: string }) {
  const labelId = useId();
  const hintId = useId();
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <p id={labelId} className={styles.rowLabel}>
          {label}
        </p>
        {hint ? (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        ) : null}
      </div>
      <div className={styles.rowControl}>
        <div role="radiogroup" aria-labelledby={labelId} aria-describedby={hint ? hintId : undefined} className={styles.segmented}>
          {options.map(([v, text]) => (
            <label key={v} className={[styles.segment, value === v ? styles.on : ""].join(" ")}>
              <input type="radio" className="visually-hidden" name={name ?? label} value={v} checked={value === v} onChange={() => onChange(v)} />
              <span>{text}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
