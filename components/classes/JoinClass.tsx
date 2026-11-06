"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { decodeJoin } from "@/lib/classes/link";
import { loadBook, putJoined, saveBook, useClassBook } from "@/lib/classes/store";
import type { CourseAct } from "@/lib/classes/types";
import { Button } from "../ui/Button";
import teach from "../teach/Teach.module.css";
import { castFor, ClassLine, LinkTrouble, SetList, useCourse, useHash } from "./shared";
import styles from "./Classes.module.css";

/** /class/join/#<link>: a class someone sent, what's set in it, and Join. */
export function JoinClass({ acts, names }: { acts: CourseAct[]; names: Record<string, string> }) {
  const hash = useHash();
  const book = useClassBook();
  const course = useCourse(acts);
  const { profile, updateProfile, ready } = useSession();
  const decoded = useMemo(() => (hash === null ? null : decodeJoin(hash)), [hash]);
  const [name, setName] = useState("");
  const [done, setDone] = useState<"joined" | "updated" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A new link opened on this page (the same page with another #) is a new class.
  useEffect(() => {
    setDone(null);
    setError(null);
  }, [hash]);

  if (!decoded) return <p className={teach.empty}>Reading the link.</p>;
  if (!decoded.ok) return <LinkTrouble problem={decoded.problem} kind={decoded.kind} hash={hash ?? ""} />;

  const cls = decoded.value;
  const already = book.joined.find((j) => j.id === cls.id);
  const yours = book.teaching.some((t) => t.id === cls.id);
  const needsName = ready && !profile.displayName.trim();
  const cast = castFor(cls.teacher);
  const count = cls.assignments.length;

  const join = async () => {
    if (needsName) await updateProfile({ displayName: name.trim() });
    // Each set project's Build step, from this copy of the course, for the progress link.
    const build: Record<string, string> = {};
    for (const a of cls.assignments) {
      const step = course[a.jobId]?.build;
      if (step) build[a.jobId] = step;
    }
    const { book: next, result } = putJoined(loadBook(), cls, build);
    if (saveBook(next)) {
      setError(null);
      setDone(result);
    } else setError("This browser wouldn't save the class. It may be a private window, or site data may be switched off.");
  };

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <p className={styles.kicker}>A class to join</p>
        <h1 className={teach.title}>{cls.name}</h1>
        <p className={teach.lede}>
          With {cls.teacher}. {count === 0 ? "Nothing set yet." : `${count} ${count === 1 ? "project" : "projects"} set.`}
        </p>
        {cast ? (
          <ClassLine who={cast} names={names} text="Join, and what I've set turns up on your desk in the Clocktower. Send me your progress when you've had a go." third={`Join, and what ${cls.teacher} has set turns up on your desk in the Clocktower.`} />
        ) : (
          <ClassLine who="neil" names={names} text={`Join, and what ${cls.teacher} has set turns up on your desk in the Clocktower.`} />
        )}
      </header>

      <section className={`px-panel ${teach.section}`} aria-labelledby="set-title">
        <h2 id="set-title" className={teach.h2}>
          What&apos;s set
        </h2>
        <SetList assignments={cls.assignments} course={course} labelledBy="set-title" />
      </section>

      <section className={`px-panel ${teach.section}`} aria-labelledby="join-title">
        <h2 id="join-title" className={teach.h2}>
          {done ? "You're in" : already ? "You're already in this class" : "Join the class"}
        </h2>
        {done ? (
          <>
            <p className={styles.troubleText}>{done === "joined" ? `You're in ${cls.name}. What's set is on your desk in the Clocktower.` : `${cls.name} is up to date with this link.`}</p>
            <div className={styles.actions}>
              <Link href="/" className={teach.back}>
                Go to the Clocktower
              </Link>
              <Link href="/class" className={teach.back}>
                See the class
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={teach.meta}>
              {already
                ? cls.updatedAt > already.updatedAt
                  ? "This link has newer projects than the copy in this browser. Update it to bring them in."
                  : "Updating brings in anything changed since you joined."
                : `Your progress stays yours, in this browser. When you want to, you send it to ${cls.teacher} as a link.`}
              {yours ? " This is one of your own classes, so send this link to your students." : ""}
            </p>
            {needsName ? (
              <div className={[teach.field, styles.fieldGrow].join(" ")}>
                <label htmlFor="join-name" className="label">
                  Your name, so {cls.teacher} knows who you are
                </label>
                <input id="join-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
              </div>
            ) : null}
            <div className={styles.actions}>
              <Button variant="primary" icon="users" className={styles.wraps} onClick={() => void join()} disabled={!ready || (needsName && !name.trim())}>
                {already ? `Update ${cls.name}` : `Join ${cls.name}`}
              </Button>
            </div>
          </>
        )}
        {error ? (
          <p className={teach.error} role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
