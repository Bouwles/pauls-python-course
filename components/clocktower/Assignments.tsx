"use client";

// Projects set by the learner's classes, under Continue. Quiet on purpose: one line each, gone
// once the project ships. Two kinds of class set them: a class joined through a link (app/class,
// kept in this browser, in every version), and in the local version an account class for a
// signed-in learner (/api/classes/assignments). GitHub Pages has no server, so only the first.
// A class joined through a link keeps its card while there's progress to send: its progress link
// is made here as well as on the class page.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JobSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { isShipped } from "@/lib/progress-rules";
import { STATIC } from "@/lib/static";
import { dueDate } from "@/lib/teaching";
import { dayMs } from "@/lib/classes/link";
import { useClassBook } from "@/lib/classes/store";
import type { JoinedClass } from "@/lib/classes/types";
import { Card } from "../ui/Card";
import { SendProgress } from "../classes/SendProgress";
import classes from "../classes/Classes.module.css";
import styles from "./DeskCards.module.css";

interface Assigned {
  id: string;
  className: string;
  jobId: string;
  dueAt: number | null;
  note?: string;
}

const SHOWN = 5;

export function Assignments({ jobs, progress }: { jobs: JobSummary[]; progress: Record<string, JobProgressRow> }) {
  const { user } = useSession();
  const book = useClassBook();
  // Account classes need the server: the local version, signed in.
  const userId = STATIC ? null : (user?.id ?? null);
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

  const local: Assigned[] = book.joined.flatMap((c) => c.assignments.map((a) => ({ id: `${c.id}/${a.jobId}`, className: c.name, jobId: a.jobId, dueAt: a.due ? dayMs(a.due) : null, note: a.note })));
  const open = [...(userId ? items : []), ...local]
    .map((a) => ({ ...a, job: jobs.find((j) => j.id === a.jobId) }))
    .filter((a): a is Assigned & { job: JobSummary } => Boolean(a.job) && a.job!.status === "written" && !isShipped(progress[a.jobId]))
    // Soonest due first; no date after.
    .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  if (open.length === 0 && book.joined.length === 0) return null;

  const facts = (cls: JoinedClass) => (jobId: string) => ({ total: jobs.find((j) => j.id === jobId)?.stepCount ?? 0, build: cls.build[jobId] ?? null });

  return (
    <Card as="section" className={styles.card} aria-labelledby="desk-class">
      <h2 id="desk-class" className={styles.head}>
        Set by your class
      </h2>
      {open.length ? (
        <ul className={styles.assigned}>
          {open.slice(0, SHOWN).map((a) => (
            <li key={a.id}>
              <Link href={`/job/${a.jobId}`}>{a.job.title}</Link>
              <span className={styles.meta}>
                {a.className}
                {a.dueAt ? `, due ${dueDate(a.dueAt)}` : ""}
              </span>
              {a.note ? <span className={classes.deskNote}>{a.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.meta}>Everything set is shipped.</p>
      )}
      {open.length > SHOWN || book.joined.length ? (
        <p className={styles.meta}>
          <Link href="/class">{open.length > SHOWN ? `${open.length - SHOWN} more on the class page` : "The class page"}</Link>
        </p>
      ) : null}
      {book.joined.map((c) => (
        <SendProgress key={c.id} cls={c} facts={facts(c)} variant="secondary" withClassName={book.joined.length > 1} block />
      ))}
    </Card>
  );
}
