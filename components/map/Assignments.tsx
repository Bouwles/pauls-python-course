"use client";

// Jobs set by the learner's classes, under the next-Job panel on the map. Quiet on purpose:
// one line each, gone once the Job ships.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JobSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { isShipped } from "@/lib/progress-rules";
import { dueDate } from "@/lib/teaching";
import styles from "./Assignments.module.css";

interface Assigned {
  id: string;
  className: string;
  jobId: string;
  dueAt: number | null;
}

export function Assignments({ jobs, progress }: { jobs: JobSummary[]; progress: Record<string, JobProgressRow> }) {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<Assigned[]>([]);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    fetch("/api/classes/assignments")
      .then((r) => (r.ok ? r.json() : { assignments: [] }))
      .then((b: { assignments: Assigned[] }) => live && setItems(b.assignments))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [userId]);

  const open = items
    .map((a) => ({ ...a, job: jobs.find((j) => j.id === a.jobId) }))
    .filter((a): a is Assigned & { job: JobSummary } => Boolean(a.job) && a.job!.status === "written" && !isShipped(progress[a.jobId]));
  if (!user || open.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="Jobs set by your class">
      {open.slice(0, 5).map((a) => (
        <li key={a.id}>
          Assigned by {a.className}: <Link href={`/job/${a.jobId}`}>{a.job.title}</Link>
          {a.dueAt ? `, due ${dueDate(a.dueAt)}` : ""}.
        </li>
      ))}
    </ul>
  );
}
