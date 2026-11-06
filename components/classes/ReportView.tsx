"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { decodeReport } from "@/lib/classes/link";
import { isoWeek, weekName } from "@/lib/league/course";
import { loadBook, putReport, saveBook, useClassBook, type AddResult } from "@/lib/classes/store";
import type { CourseAct } from "@/lib/classes/types";
import { shortDate } from "@/lib/teaching";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import teach from "../teach/Teach.module.css";
import { ClassLine, LinkTrouble, playingAs, StudentFace, useCourse, useHash } from "./shared";
import { CodeList, ProjectTable } from "./StudentReport";
import styles from "./Classes.module.css";

const SAID: Record<Exclude<AddResult, "no-class">, (name: string, cls: string) => string> = {
  added: (name, cls) => `Added to ${cls}. ${name} is in the register now.`,
  replaced: (name, cls) => `Added to ${cls}. It replaces ${name}'s last progress.`,
  same: (name, cls) => `This one is already in ${cls}'s register.`,
  older: (name, cls) => `The register for ${cls} already has newer progress from ${name}, so this one wasn't added.`,
};

/** /class/report/#<link>: a student's progress, sent to their teacher, to read and add to the register. */
export function ReportView({ acts, names }: { acts: CourseAct[]; names: Record<string, string> }) {
  const hash = useHash();
  const book = useClassBook();
  const course = useCourse(acts);
  const decoded = useMemo(() => (hash === null ? null : decodeReport(hash)), [hash]);
  const [result, setResult] = useState<AddResult | "unsaved" | null>(null);
  // A new link opened on this page (the same page with another #) is a new report.
  useEffect(() => setResult(null), [hash]);

  if (!decoded) return <p className={teach.empty}>Reading the link.</p>;
  if (!decoded.ok) return <LinkTrouble problem={decoded.problem} kind={decoded.kind} hash={hash ?? ""} />;

  const report = decoded.value;
  const { student } = report;
  const cls = book.teaching.find((t) => t.id === report.classId) ?? null;
  const kept = cls?.register.find((r) => r.student.id === student.id) ?? null;
  const as = playingAs(student, names);

  const add = () => {
    const { book: next, result: got } = putReport(loadBook(), report);
    if (got === "added" || got === "replaced") setResult(saveBook(next) ? got : "unsaved");
    else setResult(got);
  };

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <Link href="/class" className={teach.back}>
          <Icon name="caretLeft" size={16} />
          Your class
        </Link>
        <div className={teach.who}>
          <StudentFace student={student} big />
          <div className={teach.whoText}>
            <p className={styles.kicker}>Progress for {report.className}</p>
            <h1 className={teach.title}>{student.name}</h1>
            <p className={teach.meta}>
              Sent {shortDate(report.sentAt)} at {new Date(report.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}. {report.shipped} {report.shipped === 1 ? "project" : "projects"} shipped in all.
              {as ? ` ${as}.` : ""}
            </p>
          </div>
        </div>
        <ClassLine who="neil" names={names} text={`${student.name} sent this. Add it to the register and it replaces anything older from them.`} />
      </header>

      <section className={`px-panel ${teach.section}`} aria-labelledby="add-title">
        <h2 id="add-title" className={teach.h2}>
          The register
        </h2>
        {cls ? (
          <>
            {!result || result === "unsaved" ? (
              <p className={teach.meta}>
                {kept
                  ? kept.sentAt >= report.sentAt
                    ? kept.sentAt === report.sentAt
                      ? `This one is already in ${cls.name}'s register.`
                      : `${cls.name}'s register already has newer progress from ${student.name}.`
                    : `${cls.name}'s register has older progress from ${student.name}. This replaces it.`
                  : `${student.name} isn't in ${cls.name}'s register yet.`}
              </p>
            ) : null}
            <p className={`${styles.troubleText} ${result === "added" || result === "replaced" ? styles.ok : ""}`} role="status" aria-live="polite">
              {result && result !== "no-class" && result !== "unsaved" ? SAID[result](student.name, cls.name) : ""}
            </p>
            {result === "unsaved" ? (
              <p className={teach.error} role="alert">
                This browser wouldn&apos;t save it. It may be a private window, or site data may be switched off.
              </p>
            ) : null}
            <div className={styles.actions}>
              {result === "added" || result === "replaced" ? (
                <Link href="/class" className={teach.back}>
                  See the register
                </Link>
              ) : (
                <Button variant="primary" icon="check" className={styles.wraps} onClick={add} disabled={Boolean(kept && kept.sentAt >= report.sentAt)}>
                  Add to {cls.name}
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className={teach.meta}>
            This is for {report.className}, which isn&apos;t kept in this browser. Open it in the browser where {report.teacher} made the class, or where the co-teacher link was opened.
          </p>
        )}
      </section>

      <section className={`px-panel ${teach.section}`} aria-labelledby="projects-title">
        <h2 id="projects-title" className={teach.h2}>
          Projects set
        </h2>
        <ProjectTable report={report} course={course} labelledBy="projects-title" />
      </section>

      {report.league ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="league-title">
          <h2 id="league-title" className={teach.h2}>
            The Arcade League
          </h2>
          <p>
            {report.league.week === isoWeek() ? "This week" : weekName(report.league.week)}: {report.league.score.toFixed(2)} moves on average, {report.league.finished} of {report.league.races} finished.
          </p>
          <p className={teach.meta}>
            {report.league.checked
              ? `Raced again in this browser from ${student.name}'s policy, so it's the course's own count. Adding this to the register puts it on the class's table.`
              : "Their policy didn't fit in the link, so this is the score as sent."}
          </p>
        </section>
      ) : null}

      <section className={`px-panel ${teach.section}`} aria-labelledby="code-title">
        <h2 id="code-title" className={teach.h2}>
          Code
        </h2>
        <p className={teach.meta}>What {student.name} had for each project&apos;s Build step when they sent this. Read only.</p>
        <CodeList report={report} course={course} />
      </section>
    </div>
  );
}
