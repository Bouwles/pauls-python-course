"use client";

// The building blocks of the Settings page: a framed panel per group, and a chunky
// segmented choice (the radios are real, the faces are pixel toggles).
import { useId } from "react";
import styles from "./Settings.module.css";

export function Panel({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={["frame-panel", styles.panel, className].filter(Boolean).join(" ")} aria-labelledby={id}>
      <h2 id={id} className={styles.h2}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** `hideLabel` keeps the legend for screen readers when the panel's own heading already says it. */
export function Choice({ label, name, value, options, onChange, hint, hideLabel = false }: { label: string; name?: string; value: string; options: [string, string][]; onChange: (v: string) => void; hint?: string; hideLabel?: boolean }) {
  const hintId = useId();
  return (
    <fieldset className={styles.choice} aria-describedby={hint ? hintId : undefined}>
      <legend className={hideLabel ? "visually-hidden" : styles.legend}>{label}</legend>
      <div className={styles.toggle}>
        {options.map(([v, text]) => (
          <label key={v} className={[styles.option, value === v ? styles.on : ""].join(" ")}>
            <input type="radio" className="visually-hidden" name={name ?? label} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
