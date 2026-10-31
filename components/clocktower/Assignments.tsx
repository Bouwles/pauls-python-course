"use client";

// Projects set by the learner's classes, under Continue. Quiet on purpose: one line each, gone
// once the project ships.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JobSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { isShipped } from "@/lib/progress-rules";
import { dueDate } from "@/lib/teaching";
import { Card } from "../ui/Card";
import styles from "./DeskCards.module.css";

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
    <Card as="section" className={styles.card} aria-labelledby="desk-class">
      <h2 id="desk-class" className={styles.head}>
        Set by your class
      </h2>
      <ul className={styles.assigned}>
        {open.slice(0, 5).map((a) => (
          <li key={a.id}>
            <Link href={`/job/${a.jobId}`}>{a.job.title}</Link>
            <span className={styles.meta}>
              {a.className}
              {a.dueAt ? `, due ${dueDate(a.dueAt)}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
