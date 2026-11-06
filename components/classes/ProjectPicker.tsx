"use client";

import { useState } from "react";
import type { Assignment, CourseAct } from "@/lib/classes/types";
import { LIMITS } from "@/lib/classes/link";
import { Button } from "../ui/Button";
import teach from "../teach/Teach.module.css";
import { jobLabel, useCourse } from "./shared";
import styles from "./Classes.module.css";

/**
 * Choosing what to set: the projects chosen so far, each with an optional due date and note, and a
 * picker of the course's Acts and projects to add another. Changes go straight to `onChange`.
 */
export function ProjectPicker({ acts, value, onChange, idPrefix }: { acts: CourseAct[]; value: Assignment[]; onChange: (next: Assignment[]) => void; idPrefix: string }) {
  const course = useCourse(acts);
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");
  const chosen = new Set(value.map((a) => a.jobId));
  const full = value.length >= LIMITS.assignments;

  const edit = (jobId: string, patch: Partial<Assignment>) => onChange(value.map((a) => (a.jobId === jobId ? { ...a, ...patch } : a)));
  const add = () => {
    if (!pick || chosen.has(pick) || full) return;
    onChange([...value, { jobId: pick, due: null, note: "" }]);
    setNote(`Added ${jobLabel(course, pick).name}.`);
    setPick("");
  };
  const remove = (jobId: string) => {
    onChange(value.filter((a) => a.jobId !== jobId));
    setNote(`Removed ${jobLabel(course, jobId).name}.`);
  };

  return (
    <div className={styles.picker}>
      {value.length ? (
        <ol className={styles.pickRows}>
          {value.map((a) => {
            const { name, place } = jobLabel(course, a.jobId);
            const id = `${idPrefix}-${a.jobId}`;
            return (
              <li key={a.jobId} className={styles.pickRow}>
                <div className={styles.pickTitle}>
                  <span className={teach.strongCell}>{name}</span>
                  <span className={teach.meta}>{place}</span>
                </div>
                <div className={teach.field}>
                  <label htmlFor={`${id}-due`} className="label">
                    Due, if any
                  </label>
                  <input id={`${id}-due`} type="date" value={a.due ?? ""} onChange={(e) => edit(a.jobId, { due: /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : null })} />
                </div>
                <div className={[teach.field, styles.pickNote].join(" ")}>
                  <label htmlFor={`${id}-note`} className="label">
                    A note, if any
                  </label>
                  <input id={`${id}-note`} value={a.note} maxLength={LIMITS.note} autoComplete="off" placeholder="Try the stretch if you finish early." onChange={(e) => edit(a.jobId, { note: e.target.value })} />
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(a.jobId)} aria-label={`Remove ${name}`}>
                  Remove
                </Button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={teach.empty}>No projects yet.</p>
      )}
      <div className={styles.addRow}>
        <div className={[teach.field, styles.fieldGrow].join(" ")}>
          <label htmlFor={`${idPrefix}-pick`} className="label">
            Project to set
          </label>
          <select id={`${idPrefix}-pick`} value={pick} onChange={(e) => setPick(e.target.value)} disabled={full}>
            <option value="">Choose a project</option>
            {acts.map((act) => (
              <optgroup key={act.number} label={act.label}>
                {act.jobs.map((j) => (
                  <option key={j.id} value={j.id} disabled={chosen.has(j.id)}>
                    {j.number ? `${j.number}. ${j.name}` : j.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <Button type="button" icon="next" onClick={add} disabled={!pick || full}>
          Add the project
        </Button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
