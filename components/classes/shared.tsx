"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { castColour } from "@/lib/cast";
import { isCast, speakerOf } from "@/lib/playas";
import { avatarBackground } from "@/lib/pixel/looks";
import { useSession } from "@/lib/store/session";
import { useMedia } from "@/lib/useMedia";
import { dayMs, LINK_PATH, type LinkKind, type LinkProblem } from "@/lib/classes/link";
import type { Assignment, CourseAct, CourseJob, Student } from "@/lib/classes/types";
import { dueDate } from "@/lib/teaching";
import { PixelPerson } from "../art/PixelPerson";
import { Speech } from "../art/Speech";
import teach from "../teach/Teach.module.css";
import styles from "./Classes.module.css";

/** The page's hash without the "#": null until the page is in the browser. */
export function useHash(): string | null {
  const [hash, setHash] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setHash(window.location.hash.replace(/^#/, ""));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

export type CourseIndex = Record<string, CourseJob>;

export function useCourse(acts: CourseAct[]): CourseIndex {
  return useMemo(() => Object.fromEntries(acts.flatMap((a) => a.jobs.map((j) => [j.id, j]))), [acts]);
}

/** A project's name, with its place in the course: "Bill Splitter", "Act 1, project 3". */
export function jobLabel(course: CourseIndex, jobId: string): { name: string; place: string } {
  const j = course[jobId];
  return j ? { name: j.name, place: `Act ${j.act}, project ${j.number}` } : { name: jobId, place: "Not in this version of the course" };
}

export const dueText = (a: Assignment) => (a.due ? `Due ${dueDate(dayMs(a.due))}` : null);

/** A cast member's name for a teacher called it ("Neil", "neil smith"), so they can say the class's lines. */
export function castFor(teacher: string): string | null {
  const first = teacher.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return isCast(first) ? first : null;
}

/** A student's face beside their name: the cast member they play as, or their own look. */
export function StudentFace({ student, big = false }: { student: Student; big?: boolean }) {
  const cast = student.playAs;
  const background = cast ? castColour(cast).face : avatarBackground(student.character);
  if (big)
    return (
      <span className={`px-panel ${styles.bigFace}`} style={{ background }}>
        <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : student.character} crop="bust" scale={2} label={`${student.name}'s look`} />
      </span>
    );
  return (
    <span className={teach.face} style={{ background }} aria-hidden="true">
      <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : student.character} crop="head" scale={1} animate={false} />
    </span>
  );
}

/** "Playing as Neil", for someone playing as one of the cast under another name (Riya playing as Riya is just Riya). */
export function playingAs(s: Student, names: Record<string, string>): string | null {
  if (!s.playAs) return null;
  const cast = names[s.playAs] ?? s.playAs;
  return cast.toLowerCase() === s.name.toLowerCase() ? null : `Playing as ${cast}`;
}

const KIND_NAME: Record<LinkKind, string> = { join: "a join link", report: "a progress link", teach: "a co-teacher link" };

/** What to say about a link that doesn't read. */
export function LinkTrouble({ problem, kind, hash }: { problem: LinkProblem; kind?: LinkKind; hash: string }) {
  const [title, text] =
    problem === "empty"
      ? ["This link has nothing after the #", "The part that holds the class didn't come through. Ask for the link again, and copy all of it."]
      : problem === "old"
        ? ["This link is from an older version of the course", "It can't be read any more. Ask for a fresh one."]
        : problem === "newer"
          ? ["This link was made by a newer version of the course", "Reload this page and open the link again. If it still won't open, this copy of the course hasn't caught up yet."]
          : problem === "too-long"
            ? ["This link is far longer than any the course makes", "It may have been joined to something else when it was pasted. Ask for it again."]
            : problem === "wrong-kind" && kind
              ? [`This is ${KIND_NAME[kind]}`, "It opens on another page."]
              : ["This link didn't come through whole", "It may have been cut short or changed when it was copied. Ask for it again, and copy all of it."];
  return (
    <section className={`px-panel ${teach.section} ${styles.trouble}`} aria-labelledby="trouble-title">
      <h1 id="trouble-title" className={teach.h2}>
        {title}
      </h1>
      <p className={styles.troubleText}>{text}</p>
      <div className={styles.actions}>
        {problem === "wrong-kind" && kind ? (
          <Link href={`${LINK_PATH[kind].replace(/\/$/, "")}#${hash}`} className={teach.back}>
            Open it there
          </Link>
        ) : null}
        <Link href="/class" className={teach.back}>
          Go to your class page
        </Link>
      </div>
    </section>
  );
}

/** A cast member saying the page's line. Playing as them, their stand-in says it instead (lib/playas.ts). */
export function ClassLine({ who, text, third, names }: { who: string; text: string; third?: string; names: Record<string, string> }) {
  const { profile } = useSession();
  const phone = useMedia("(max-width: 720px)");
  const speaker = speakerOf(who, profile.settings.playAs);
  // Their stand-in can't say "I" for them.
  const words = speaker !== who && third ? third : text;
  return <Speech who={speaker} name={names[speaker] ?? speaker} text={words} size={phone ? 72 : 96} className={styles.speech} />;
}

/** The projects set for a class, with dates and notes. `side` adds something on the right of each (a status). */
export function SetList({ assignments, course, side, labelledBy }: { assignments: Assignment[]; course: CourseIndex; side?: (a: Assignment) => React.ReactNode; labelledBy?: string }) {
  if (assignments.length === 0) return <p className={teach.empty}>Nothing set yet.</p>;
  return (
    <ul className={styles.setList} aria-labelledby={labelledBy}>
      {assignments.map((a) => {
        const { name, place } = jobLabel(course, a.jobId);
        const due = dueText(a);
        return (
          <li key={a.jobId} className={styles.setItem}>
            <div className={styles.setText}>
              {course[a.jobId] ? (
                <Link href={`/job/${a.jobId}`} className={styles.setName}>
                  {name}
                </Link>
              ) : (
                <span className={styles.setName}>{name}</span>
              )}
              <span className={teach.meta}>
                {place}
                {due ? `. ${due}` : ""}
              </span>
              {a.note ? <span className={styles.setNote}>{a.note}</span> : null}
            </div>
            {side ? <div className={styles.setSide}>{side(a)}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}
