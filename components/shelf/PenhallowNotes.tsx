"use client";

// Ada Penhallow's notes (Section 4.2), as the learner has found them: each one
// was a comment in code she left behind. Unfound notes stay hidden; the count
// says how many there are, which is the only hint.
import type { StoryNote } from "@/lib/content/types";
import { useEarned } from "../world/useWorkshopExtras";
import styles from "./PenhallowNotes.module.css";

export function PenhallowNotes({ notes, jobTitles }: { notes: StoryNote[]; jobTitles: Record<string, string> }) {
  const earned = useEarned();
  const found = notes.filter((n) => earned.has(n.id));
  if (found.length === 0) return null;
  return (
    <section className={`frame-panel ${styles.notes}`} aria-labelledby="notes-title">
      <h2 id="notes-title" className={styles.title}>
        Penhallow&apos;s notes
      </h2>
      <p className={styles.meta}>
        {found.length} of {notes.length} found, in the code she left behind.
      </p>
      <ol className={styles.list}>
        {found.map((n) => (
          <li key={n.id} className={styles.note}>
            <p className={styles.noteTitle}>{n.title}</p>
            <blockquote className={styles.text}>{n.text}</blockquote>
            <p className={styles.where}>
              {jobTitles[n.job] ? `${jobTitles[n.job]}. ` : ""}
              {n.where}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
