"use client";

import { useRef } from "react";
import styles from "./Tabs.module.css";

// Text tabs with a 2 px sun underline on the selected one, and an
// optional count badge ("Checks 3/5"). Arrow keys move between tabs.
export interface TabItem {
  id: string;
  label: string;
  count?: string | number;
}

export function Tabs({ items, value, onChange, label, idPrefix = "tab", className }: { items: TabItem[]; value: string; onChange: (id: string) => void; label: string; idPrefix?: string; className?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = (i + items.length) % items.length;
    refs.current[n]?.focus();
    onChange(items[n]!.id);
  };
  return (
    <div role="tablist" aria-label={label} className={[styles.tabs, className].filter(Boolean).join(" ")}>
      {items.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`${idPrefix}-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`${idPrefix}-${t.id}-panel`}
          tabIndex={value === t.id ? 0 : -1}
          className={styles.tab}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(i + 1);
            else if (e.key === "ArrowLeft") move(i - 1);
          }}
        >
          {t.label}
          {t.count !== undefined ? <span className={styles.count}>{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
