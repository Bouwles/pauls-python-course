"use client";

// /class with accounts, on GitHub Pages: classes kept in Supabase (lib/classes/remote.ts).
//   /class                       join with a code, the classes you're in, the ones you teach, and making one
//   /class?join=<code>           the same, with the code filled in (the join link a teacher sends)
//   /class?c=<class>             a class you teach: its register and set projects
//   /class?c=<class>&s=<student> one student's projects and code, for their teacher
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE } from "@/lib/static";
import { BRAND } from "@/lib/brand";
import { useSession } from "@/lib/store/session";
import { isShipped } from "@/lib/progress-rules";
import type { JobProgressRow } from "@/lib/store/types";
import type { CourseAct } from "@/lib/classes/types";
import { castColour } from "@/lib/cast";
import { isCast } from "@/lib/playas";
import { avatarBackground } from "@/lib/pixel/looks";
import { dueDate, duration, isoDay, lastActive, shortDate, statusLabel } from "@/lib/teaching";
import * as remote from "@/lib/classes/remote";
import { PixelPerson } from "../art/PixelPerson";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ClassView, type AssignmentItem, type ClassActions, type JobGroup, type StudentItem } from "../teach/ClassView";
import { CopyCode } from "../teach/CopyCode";
import { LinkBox } from "./LinkBox";
import { ClassLine, useCourse, type CourseIndex } from "./shared";
import teach from "../teach/Teach.module.css";
import styles from "./Classes.module.css";

/** Each project's steps, in order, for naming the code a student saved (built at build time). */
export type StepTitles = Record<string, { id: string; title: string }[]>;

const joinLink = (code: string) => `${window.location.origin}${BASE}/class/?join=${encodeURIComponent(code)}`;

export function AccountClasses({ acts, names, steps }: { acts: CourseAct[]; names: Record<string, string>; steps: StepTitles }) {
  const params = useSearchParams();
  const course = useCourse(acts);
  const classId = params.get("c");
  const studentId = params.get("s");
  if (classId && studentId) return <StudentWork key={`${classId}/${studentId}/${params.get("job") ?? ""}`} classId={classId} studentId={studentId} job={params.get("job")} course={course} steps={steps} />;
  if (classId) return <TaughtClassPage key={classId} classId={classId} acts={acts} course={course} />;
  return <ClassesHome acts={acts} names={names} course={course} code={params.get("join") ?? ""} />;
}

// ---------------------------------------------------------------- the class page

function ClassesHome({ names, course, code }: { acts: CourseAct[]; names: Record<string, string>; course: CourseIndex; code: string }) {
  const { user, store } = useSession();
  const [mine, setMine] = useState<remote.Membership[] | null>(null);
  const [sets, setSets] = useState<remote.MySet[]>([]);
  const [taught, setTaught] = useState<remote.TaughtClass[] | null>(null);
  const [progress, setProgress] = useState<Record<string, JobProgressRow>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      const [m, a, t] = await Promise.all([remote.myClasses(), remote.myAssignments(), remote.teacherClasses()]);
      setMine(m);
      setSets(a);
      setTaught(t);
      setProblem(null);
    } catch {
      setProblem("Couldn't load your classes. Check your connection and reload the page.");
    }
  }, []);
  useEffect(() => void load(), [load]);

  // How far you are with each set project, from your own saved progress.
  useEffect(() => {
    if (!store) return;
    void store.all("job_progress").then((rows) => setProgress(Object.fromEntries(rows.map((r) => [r.jobId, r]))));
  }, [store, sets]);

  const teacherCast = mine?.[0] ? (isCast(mine[0].teacher.toLowerCase()) ? mine[0].teacher.toLowerCase() : null) : null;

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <h1 className={teach.title}>Your class</h1>
        <ClassLine
          who={teacherCast ?? "paul"}
          names={names}
          text={mine?.length ? "Have a go at what's set, and I can see how you're getting on, so you don't need to send me anything." : "Got a class code from your teacher? Type it below and you're in."}
          third={mine?.length ? "Have a go at what's set, and your teacher can see how you're getting on." : "Got a class code? Type it below and you're in."}
        />
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {note}
      </p>
      {problem ? (
        <p className={teach.error} role="alert">
          {problem}
        </p>
      ) : null}

      <JoinForm initial={code} onJoined={(name) => (setNote(`You're in ${name}, and what's set is on your desk in the Clocktower.`), void load())} />

      {mine?.length ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="in-title">
          <h2 id="in-title" className={teach.h2}>
            {mine.length === 1 ? "The class you're in" : "The classes you're in"}
          </h2>
          {mine.map((c) => {
            const set = sets.filter((a) => a.classId === c.classId);
            return (
              <div key={c.classId} className={teach.files}>
                <div className={teach.titleRow}>
                  <h3 className={teach.h3}>{c.name}</h3>
                  <span className={teach.meta}>
                    {c.teacher ? `With ${c.teacher}, joined` : "Joined"} {shortDate(c.joinedAt)}.
                  </span>
                </div>
                {set.length === 0 ? (
                  <p className={teach.empty}>Nothing set yet.</p>
                ) : (
                  <ul className={styles.setList}>
                    {set.map((a) => {
                      const job = course[a.jobId];
                      const row = progress[a.jobId];
                      return (
                        <li key={a.id} className={styles.setItem}>
                          <div className={styles.setText}>
                            {job ? (
                              <Link href={`/job/${a.jobId}`} className={styles.setName}>
                                {job.name}
                              </Link>
                            ) : (
                              <span className={styles.setName}>{a.jobId}</span>
                            )}
                            <span className={teach.meta}>
                              {job ? `Act ${job.act}, project ${job.number}` : "Not in this version of the course"}
                              {a.dueAt ? `. Due ${dueDate(a.dueAt)}` : ""}
                            </span>
                          </div>
                          <div className={styles.setSide}>
                            <Badge tone={isShipped(row) ? "shipped" : row ? "progress" : "neutral"}>{statusLabel(row?.status ?? "not-started")}</Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <LeaveClass cls={c} userId={user?.id ?? ""} onLeft={() => (setNote(`You've left ${c.name}, but its code will get you back in.`), void load())} />
              </div>
            );
          })}
        </section>
      ) : null}

      <TaughtList classes={taught} onChanged={load} setNote={setNote} />
    </div>
  );
}

function JoinForm({ initial, onJoined }: { initial: string; onJoined: (name: string) => void }) {
  const router = useRouter();
  const [code, setCode] = useState(remote.normaliseCode(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const clean = remote.normaliseCode(code);
    if (clean.length !== 6) return setError("A class code is six letters and numbers.");
    setBusy(true);
    setError(null);
    try {
      const id = await remote.joinClass(clean);
      if (!id) return setError("No class has that code, so check it with your teacher.");
      const name = (await remote.myClasses()).find((c) => c.classId === id)?.name ?? "the class";
      setCode("");
      // The code has done its job: take it out of the address.
      if (initial) router.replace("/class");
      onJoined(name);
    } catch {
      setError("That didn't work, so try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`px-panel ${teach.section}`} aria-labelledby="join-title">
      <h2 id="join-title" className={teach.h2}>
        Join a class
      </h2>
      <form className={styles.addRow} onSubmit={join}>
        <div className={[teach.field, styles.fieldGrow].join(" ")}>
          <label htmlFor="join-code" className="label">
            Class code
          </label>
          <input id="join-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={9} placeholder="BCD 234" aria-invalid={error ? true : undefined} />
        </div>
        <Button type="submit" variant={initial ? "primary" : "secondary"} icon="users" disabled={busy || !code.trim()}>
          {busy ? "Joining" : "Join"}
        </Button>
      </form>
      {error ? (
        <p className={teach.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={teach.meta}>Your teacher sees your progress and code on the projects in this course while you&apos;re in their class, and you can leave whenever you like.</p>
      )}
    </section>
  );
}

function LeaveClass({ cls, userId, onLeft }: { cls: remote.Membership; userId: string; onLeft: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <div className={styles.dangerRow}>
      {asking ? (
        <span className={styles.inlineConfirm}>
          <span>Leave {cls.name}? Your work stays, it&apos;s only the class that goes.</span>
          <Button size="sm" variant="danger" onClick={() => void remote.leaveClass(cls.classId, userId).then(onLeft)}>
            Leave the class
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>
            Stay in it
          </Button>
        </span>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setAsking(true)}>
          Leave the class
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- the classes you teach

function TaughtList({ classes, onChanged, setNote }: { classes: remote.TaughtClass[] | null; onChanged: () => Promise<void>; setNote: (s: string) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<{ id: string; url: string } | null>(null);

  const make = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await remote.createClass(name);
      setNote(`Made ${name.trim()}, so now give your students its code or join link.`);
      setName("");
      await onChanged();
    } catch {
      setError("That didn't work, so try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {classes?.length ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="teach-title">
          <h2 id="teach-title" className={teach.h2}>
            {classes.length === 1 ? "The class you teach" : "Classes you teach"}
          </h2>
          <div className={teach.tableWrap} role="region" aria-labelledby="teach-title" tabIndex={0}>
            <table className={teach.table}>
              <thead>
                <tr>
                  <th scope="col">Class</th>
                  <th scope="col">Code</th>
                  <th scope="col" className={teach.num}>
                    Students
                  </th>
                  <th scope="col" className={teach.end}>
                    <span className="visually-hidden">Join link</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className={teach.strongCell}>
                      <Link href={`/class?c=${c.id}`}>{c.name}</Link>
                    </th>
                    <td>
                      <CopyCode code={c.joinCode} />
                    </td>
                    <td className={teach.num}>{c.students}</td>
                    <td className={teach.end}>
                      <Button size="sm" variant="ghost" icon="copy" onClick={() => setShown({ id: c.id, url: joinLink(c.joinCode) })}>
                        Join link
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown ? (
            <LinkBox key={shown.id} url={shown.url} label={`Join link for ${classes.find((c) => c.id === shown.id)?.name ?? "the class"}`} shareTitle="Join my class" shareText={`Join my class on ${BRAND.name}.`}>
              <p className={styles.linkNote}>Anyone with an account who opens it can join, and it fills the code in for them.</p>
            </LinkBox>
          ) : null}
          <p className={teach.meta}>Pick a class to see its students, their progress and code, and to set projects.</p>
        </section>
      ) : null}

      <section className={`px-panel ${teach.section}`} aria-labelledby="make-title">
        <h2 id="make-title" className={teach.h2}>
          {classes?.length ? "Make another class" : "Teaching? Make a class"}
        </h2>
        <form className={styles.addRow} onSubmit={make}>
          <div className={[teach.field, styles.fieldGrow].join(" ")}>
            <label htmlFor="make-name" className="label">
              Class name
            </label>
            <input id="make-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="off" placeholder="Thursday Python" />
          </div>
          <Button type="submit" variant="secondary" icon="chalkboard" disabled={busy || !name.trim()}>
            {busy ? "Making it" : "Make the class"}
          </Button>
        </form>
        {error ? (
          <p className={teach.error} role="alert">
            {error}
          </p>
        ) : (
          <p className={teach.meta}>It gets a six-character code, and students who join see what you set while you see their progress and code.</p>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- one class you teach

function TaughtClassPage({ classId, acts, course }: { classId: string; acts: CourseAct[]; course: CourseIndex }) {
  const router = useRouter();
  const [cls, setCls] = useState<remote.TaughtClass | null | undefined>(undefined);
  const [students, setStudents] = useState<remote.Student[]>([]);
  const [sets, setSets] = useState<remote.SetProject[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [typed, setTyped] = useState("");

  const load = useCallback(async () => {
    try {
      const all = await remote.teacherClasses();
      const found = all.find((c) => c.id === classId) ?? null;
      setCls(found);
      if (!found) return;
      const [r, a] = await Promise.all([remote.roster(classId), remote.classAssignments(classId)]);
      setStudents(r);
      setSets(a);
    } catch {
      setCls(null);
    }
  }, [classId]);
  useEffect(() => void load(), [load]);

  const now = Date.now();
  const title = useCallback((id: string) => course[id]?.name ?? id, [course]);
  const groups: JobGroup[] = useMemo(() => acts.map((a) => ({ label: a.label, jobs: a.jobs.map((j) => ({ id: j.id, title: `${j.number}. ${j.name}` })) })), [acts]);

  if (cls === undefined) return <p className={teach.empty}>Loading the class.</p>;
  if (cls === null)
    return (
      <section className={`px-panel ${teach.section}`}>
        <h1 className={teach.h2}>That class isn&apos;t one of yours</h1>
        <p className={teach.meta}>Only the teacher who made a class can see its students.</p>
        <Link href="/class" className={teach.back}>
          Back to your class page
        </Link>
      </section>
    );

  const items: StudentItem[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    username: s.username,
    playAs: s.playAs,
    character: s.character,
    shipped: s.shipped,
    current: s.currentJobId ? title(s.currentJobId) : null,
    week: s.weekSeconds,
    weekText: duration(s.weekSeconds),
    total: s.totalSeconds,
    totalText: duration(s.totalSeconds),
    lastActive: s.lastActive ?? 0,
    lastActiveText: lastActive(s.lastActive, now),
  }));
  const assignments: AssignmentItem[] = sets.map((a) => {
    const job = course[a.jobId];
    return { id: a.id, jobId: a.jobId, title: job?.name ?? a.jobId, act: job ? `Act ${job.act}, project ${job.number}` : "", due: a.dueAt ? dueDate(a.dueAt, now) : null, shipped: a.shipped };
  });
  const actions: ClassActions = {
    async set(jobId, due) {
      try {
        return (await remote.setAssignment(classId, jobId, /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null)) ? null : "That didn't work.";
      } catch {
        return "That didn't work, so try again in a moment.";
      }
    },
    async remove(a) {
      try {
        await remote.removeAssignment(a.id);
        return true;
      } catch {
        return false;
      }
    },
    changed: () => void load(),
  };

  return (
    <ClassView
      cls={{ id: cls.id, name: cls.name, joinCode: cls.joinCode }}
      students={items}
      assignments={assignments}
      groups={groups}
      studentHref={(id) => `/class?c=${cls.id}&s=${id}`}
      back={{ href: "/class", label: "Your class page" }}
      joinHint={
        <>
          Students join with the code on their Class page, or with the{" "}
          <button type="button" className={teach.copy} onClick={() => void navigator.clipboard?.writeText(joinLink(cls.joinCode))}>
            join link
          </button>
          .
        </>
      }
      actions={actions}
      footer={
        <div className={styles.dangerRow}>
          {deleting ? (
            <form
              className={styles.inlineConfirm}
              onSubmit={(e) => {
                e.preventDefault();
                if (typed.trim() !== cls.name.trim()) return;
                void remote.deleteClass(cls.id).then(() => router.push("/class"));
              }}
            >
              <label className={teach.field}>
                <span className="label">
                  Type <strong>{cls.name}</strong> to delete it (students keep their own work).
                </span>
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              </label>
              <Button type="submit" size="sm" variant="danger" disabled={typed.trim() !== cls.name.trim()}>
                Delete the class
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setDeleting(false)}>
                Keep it
              </Button>
            </form>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setDeleting(true)}>
              Delete the class
            </Button>
          )}
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------- one student

function StudentWork({ classId, studentId, job, course, steps }: { classId: string; studentId: string; job: string | null; course: CourseIndex; steps: StepTitles }) {
  const router = useRouter();
  const [student, setStudent] = useState<remote.StudentDetail | null | undefined>(undefined);
  const [removing, setRemoving] = useState(false);
  useEffect(() => {
    let gone = false;
    remote
      .studentDetail(classId, studentId, job)
      .then((s) => !gone && setStudent(s))
      .catch(() => !gone && setStudent(null));
    return () => {
      gone = true;
    };
  }, [classId, studentId, job]);

  if (student === undefined) return <p className={teach.empty}>Loading.</p>;
  if (student === null)
    return (
      <section className={`px-panel ${teach.section}`}>
        <h1 className={teach.h2}>Not in one of your classes</h1>
        <p className={teach.meta}>You see a student&apos;s work while they&apos;re in a class you teach.</p>
        <Link href="/class" className={teach.back}>
          Back to your class page
        </Link>
      </section>
    );

  const now = Date.now();
  const order = (id: string) => (course[id] ? course[id]!.act * 1000 + course[id]!.number : 1e9);
  const jobs = [...student.jobs].sort((a, b) => order(a.jobId) - order(b.jobId));
  const shipped = jobs.filter((j) => j.status === "shipped" || j.status === "shipped-stretch").length;
  const latest = Math.max(0, ...jobs.map((j) => j.updatedAt)) || null;
  const chosen = student.jobId;
  const stepList = chosen ? (steps[chosen] ?? []) : [];
  const stepTitle = (id: string) => stepList.find((s) => s.id === id)?.title ?? id;
  const stepIndex = (id: string) => stepList.findIndex((s) => s.id === id);
  const stepIds = [...new Set(student.files.map((f) => f.stepId))].sort((a, b) => stepIndex(a) - stepIndex(b));
  const cast = isCast(student.playAs) ? student.playAs : null;

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <Link href={`/class?c=${classId}`} className={teach.back}>
          <Icon name="caretLeft" size={16} />
          The class
        </Link>
        <div className={teach.who}>
          <span className={`px-panel ${teach.avatar}`} style={{ background: cast ? castColour(cast).face : avatarBackground(student.character) }}>
            <PixelPerson who={cast ?? undefined} avatar={cast ? undefined : student.character} crop="bust" scale={2} label={`${student.name}'s look`} />
          </span>
          <div className={teach.whoText}>
            <h1 className={teach.title}>{student.name}</h1>
            <p className={teach.meta}>
              @{student.username}, joined {shortDate(student.joinedAt, now)} and last active {lastActive(latest, now).toLowerCase()}, with {shipped} {shipped === 1 ? "project" : "projects"} shipped.
            </p>
          </div>
        </div>
      </header>

      <section className={`px-panel ${teach.section}`} aria-labelledby="jobs-title">
        <h2 id="jobs-title" className={teach.h2}>
          Projects
        </h2>
        {jobs.length === 0 ? (
          <p className={teach.empty}>Nothing started yet.</p>
        ) : (
          <div className={teach.tableWrap} role="region" aria-labelledby="jobs-title" tabIndex={0}>
            <table className={teach.table}>
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={teach.num}>
                    Steps passed
                  </th>
                  <th scope="col" className={teach.num}>
                    Hints
                  </th>
                  <th scope="col" className={teach.num}>
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const info = course[j.jobId];
                  const here = j.jobId === chosen;
                  return (
                    <tr key={j.jobId} className={here ? teach.selected : undefined}>
                      <th scope="row" className={teach.jobCell}>
                        <Link href={`/class?c=${classId}&s=${student.id}&job=${j.jobId}`} aria-current={here ? "true" : undefined} scroll={false}>
                          {info?.name ?? j.jobId}
                        </Link>{" "}
                        {info ? (
                          <span className={teach.meta}>
                            Act {info.act}, project {info.number}
                          </span>
                        ) : null}
                      </th>
                      <td className={teach.nowrap}>
                        <Badge tone={j.status === "shipped" || j.status === "shipped-stretch" ? "shipped" : j.status === "in-progress" ? "progress" : "neutral"}>{statusLabel(j.status)}</Badge>
                      </td>
                      <td className={teach.num}>
                        {info ? `${j.stepsPassed} of ${info.total}` : j.stepsPassed}
                        {j.stepsSeenSolution ? <span className={teach.meta}>, {j.stepsSeenSolution} {j.stepsSeenSolution === 1 ? "solution" : "solutions"} seen</span> : null}
                      </td>
                      <td className={teach.num}>{j.hints}</td>
                      <td className={teach.num}>{duration(j.seconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {jobs.length ? <p className={teach.meta}>Pick a project to see the code saved for it.</p> : null}
      </section>

      {chosen ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="code-title">
          <h2 id="code-title" className={teach.h2}>
            Code for {course[chosen]?.name ?? chosen}
          </h2>
          {student.files.length === 0 ? (
            <p className={teach.empty}>No code saved for this project yet.</p>
          ) : (
            <div className={teach.files}>
              <p className={teach.meta}>This is the latest saved version of each file, and you can only read it.</p>
              {stepIds.map((stepId) => (
                <div key={stepId} className={teach.files}>
                  <h3 className={teach.h3}>{stepTitle(stepId)}</h3>
                  {student.files
                    .filter((f) => f.stepId === stepId)
                    .map((f) => (
                      <figure key={`${f.stepId}/${f.filename}`} className={teach.file}>
                        <figcaption className={teach.fileName}>
                          <code>{f.filename}</code>
                          <span className={teach.meta}>saved {shortDate(f.updatedAt, now)}</span>
                        </figcaption>
                        <pre className={`code-dark ${teach.pre}`} tabIndex={0} aria-label={`${f.filename}, ${stepTitle(stepId)}`}>
                          <code>{f.content || " "}</code>
                        </pre>
                      </figure>
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section className={`px-panel ${teach.section}`} aria-labelledby="membership-title">
        <h2 id="membership-title" className={teach.h2}>
          In this class
        </h2>
        {removing ? (
          <span className={styles.inlineConfirm}>
            <span>Take {student.name} off the register? They keep all their work, and can join again with the code.</span>
            <Button size="sm" variant="danger" onClick={() => void remote.removeStudent(classId, student.id).then(() => router.push(`/class?c=${classId}`))}>
              Take them off
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRemoving(false)}>
              Keep them
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setRemoving(true)}>
            Take {student.name} off the register
          </Button>
        )}
      </section>
    </div>
  );
}

/** A set day ("2026-11-20") from a due time, for the date field. */
export const dayOf = (ms: number | null) => (ms ? isoDay(ms) : "");
