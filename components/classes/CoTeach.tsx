"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { decodeTeach } from "@/lib/classes/link";
import { loadBook, putCoTeach, saveBook, useClassBook } from "@/lib/classes/store";
import type { CourseAct } from "@/lib/classes/types";
import { lastActive } from "@/lib/teaching";
import { Button } from "../ui/Button";
import teach from "../teach/Teach.module.css";
import { ClassLine, LinkTrouble, SetList, StudentFace, useCourse, useHash } from "./shared";
import styles from "./Classes.module.css";

/** /class/teach/#<link>: a class shared with a co-teacher, with its register. Adding it puts it on their class page. */
export function CoTeach({ acts, names }: { acts: CourseAct[]; names: Record<string, string> }) {
  const hash = useHash();
  const book = useClassBook();
  const course = useCourse(acts);
  const decoded = useMemo(() => (hash === null ? null : decodeTeach(hash)), [hash]);
  const [done, setDone] = useState<"added" | "merged" | "unsaved" | null>(null);
  // A new link opened on this page (the same page with another #) is a new class.
  useEffect(() => setDone(null), [hash]);

  if (!decoded) return <p className={teach.empty}>Reading the link.</p>;
  if (!decoded.ok) return <LinkTrouble problem={decoded.problem} kind={decoded.kind} hash={hash ?? ""} />;

  const { cls, register } = decoded.value;
  const have = book.teaching.find((t) => t.id === cls.id) ?? null;
  const students = [...register].sort((a, b) => a.student.name.localeCompare(b.student.name));

  const add = () => {
    const { book: next, result } = putCoTeach(loadBook(), cls, register);
    setDone(saveBook(next) ? result : "unsaved");
  };

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <p className={styles.kicker}>A class to help teach</p>
        <h1 className={teach.title}>{cls.name}</h1>
        <p className={teach.lede}>
          Shared by {cls.teacher}. {cls.assignments.length} {cls.assignments.length === 1 ? "project" : "projects"} set, {register.length} {register.length === 1 ? "student" : "students"} in the register.
        </p>
        <ClassLine who="neil" names={names} text="Add the class and progress links can come to either of you." />
      </header>

      <section className={`px-panel ${teach.section}`} aria-labelledby="set-title">
        <h2 id="set-title" className={teach.h2}>
          What&apos;s set
        </h2>
        <SetList assignments={cls.assignments} course={course} labelledBy="set-title" />
      </section>

      <section className={`px-panel ${teach.section}`} aria-labelledby="register-title">
        <h2 id="register-title" className={teach.h2}>
          In the register
        </h2>
        {students.length === 0 ? (
          <p className={teach.empty}>Nobody yet.</p>
        ) : (
          <ul className={styles.setList} aria-labelledby="register-title">
            {students.map((r) => (
              <li key={r.student.id} className={styles.setItem}>
                <span className={teach.student}>
                  <StudentFace student={r.student} />
                  {r.student.name}
                </span>
                <span className={teach.meta}>Sent {lastActive(r.sentAt).toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`px-panel ${teach.section}`} aria-labelledby="add-title">
        <h2 id="add-title" className={teach.h2}>
          {have ? "You have this class" : "Help teach it"}
        </h2>
        <p className={styles.troubleText} role="status" aria-live="polite">
          {done === "added"
            ? `Added. ${cls.name} is on your class page with its register.`
            : done === "merged"
              ? `${cls.name} is up to date: the newer of the two sets of projects, and each student's latest progress.`
              : ""}
        </p>
        {done === "unsaved" ? (
          <p className={teach.error} role="alert">
            This browser wouldn&apos;t save it. It may be a private window, or site data may be switched off.
          </p>
        ) : null}
        {done === "added" || done === "merged" ? (
          <div className={styles.actions}>
            <Link href="/class" className={teach.back}>
              See the class
            </Link>
          </div>
        ) : (
          <>
            <p className={teach.meta}>
              {have
                ? "It's already on your class page. Bringing this in keeps the newer projects and each student's latest progress."
                : "It's kept in this browser, beside any class of your own. Students' progress links can then be added here as well."}
            </p>
            <div className={styles.actions}>
              <Button variant="primary" icon="users" className={styles.wraps} onClick={add}>
                {have ? `Bring in ${cls.name}` : `Add ${cls.name} to my classes`}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
