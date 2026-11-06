"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { BASE } from "@/lib/static";
import { useSession } from "@/lib/store/session";
import { encodeJoin, fitTeach, line, linkUrl, LIMITS } from "@/lib/classes/link";
import { projectReport } from "@/lib/classes/report";
import { dropJoined, dropStudent, dropTaught, loadBook, newId, putTaught, saveBook, useClassBook } from "@/lib/classes/store";
import type { Assignment, CourseAct, JoinedClass, ProjectReport, TaughtClass } from "@/lib/classes/types";
import { shortDate, statusLabel } from "@/lib/teaching";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Tabs } from "../ui/Tabs";
import teach from "../teach/Teach.module.css";
import { copyText, LinkBox } from "./LinkBox";
import { ProjectPicker } from "./ProjectPicker";
import { Register } from "./Register";
import { SendProgress } from "./SendProgress";
import { castFor, ClassLine, SetList, useCourse, type CourseIndex } from "./shared";
import { statusTone, stepsText } from "./StudentReport";
import styles from "./Classes.module.css";

const WONT_SAVE = "This browser wouldn't save it. It may be a private window, or site data may be switched off.";

/**
 * /class: the class you're in, the classes you teach, and making one. All of it is kept in this
 * browser and travels by link (lib/classes): the same on GitHub Pages as in the local version.
 */
export function ClassHome({ acts, names }: { acts: CourseAct[]; names: Record<string, string> }) {
  const book = useClassBook();
  const course = useCourse(acts);
  const { profile } = useSession();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<string | null>(null);
  const [making, setMaking] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => setMounted(true), []);

  const { teaching, joined } = book;
  const current = teaching.find((t) => t.id === tab) ?? teaching[0] ?? null;
  const showMake = making || (mounted && teaching.length === 0 && joined.length === 0);

  const first = joined[0];
  const teacherCast = first ? castFor(first.teacher) : null;
  const speech =
    teaching.length > 0
      ? { who: "neil", text: "When someone sends you their progress, open their link in this browser and add it to the register." }
      : first && teacherCast
        ? { who: teacherCast, text: "Have a go at what I've set, then send me your progress. I'll look at it before we next meet.", third: `Have a go at what ${first.teacher} set, then send your progress over.` }
        : first
          ? { who: "neil", text: `Have a go at what ${first.teacher} set, then send your progress over. It goes straight into the register.` }
          : { who: "paul", text: "Got a join link from me? Open it and the class turns up here. Or make a class of your own and teach it.", third: "Got a join link from Paul? Open it and the class turns up here. Or make a class of your own." };

  return (
    <div className={teach.page}>
      <header className={teach.head}>
        <h1 className={teach.title}>Your class</h1>
        <p className={teach.lede}>Classes here work by link. The teacher sends a join link, everyone sends their progress back the same way, and it&apos;s all kept in your browser.</p>
        {mounted ? <ClassLine who={speech.who} text={speech.text} third={speech.third} names={names} /> : null}
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {note}
      </p>

      {joined.length ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="joined-title">
          <h2 id="joined-title" className={teach.h2}>
            {joined.length === 1 ? "The class you're in" : "The classes you're in"}
          </h2>
          {joined.map((c) => (
            <JoinedView key={c.id} cls={c} course={course} many={joined.length > 1} onLeft={() => setNote(`You've left ${c.name}. Its join link brings you back.`)} />
          ))}
        </section>
      ) : mounted && teaching.length === 0 ? (
        <p className={teach.empty}>In someone&apos;s class? Open the join link they sent you, and it shows here with what&apos;s set.</p>
      ) : null}

      {current ? (
        <section className={`px-panel ${teach.section}`} aria-labelledby="teaching-title">
          <h2 id="teaching-title" className={teach.h2}>
            {teaching.length === 1 ? "The class you teach" : "Classes you teach"}
          </h2>
          {teaching.length > 1 ? <Tabs className={styles.classTabs} label="Classes you teach" idPrefix="taught" value={current.id} onChange={setTab} items={teaching.map((t) => ({ id: t.id, label: t.name }))} /> : null}
          <div role={teaching.length > 1 ? "tabpanel" : undefined} id={teaching.length > 1 ? `taught-${current.id}-panel` : undefined} aria-labelledby={teaching.length > 1 ? `taught-${current.id}` : undefined}>
            <TaughtView
              key={current.id}
              cls={current}
              acts={acts}
              course={course}
              names={names}
              onDeleted={(name) => {
                setTab(null);
                setNote(`Deleted ${name}.`);
              }}
            />
          </div>
        </section>
      ) : null}

      {showMake ? (
        <MakeClass
          acts={acts}
          defaultTeacher={profile.displayName.trim() || "Paul"}
          first={teaching.length === 0}
          onMade={(cls) => {
            setTab(cls.id);
            setMaking(false);
            setNote(`Made ${cls.name}. Copy its join link and send it round.`);
          }}
          onCancel={teaching.length || joined.length ? () => setMaking(false) : undefined}
        />
      ) : mounted ? (
        <div className={styles.actions}>
          <Button icon="chalkboard" onClick={() => setMaking(true)}>
            {teaching.length ? "Make another class" : "Make a class"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- the class you're in

function JoinedView({ cls, course, many, onLeft }: { cls: JoinedClass; course: CourseIndex; many: boolean; onLeft: () => void }) {
  const { store } = useSession();
  const [mine, setMine] = useState<Record<string, ProjectReport>>({});
  const [leaving, setLeaving] = useState(false);
  const facts = useCallback((jobId: string) => ({ total: course[jobId]?.total ?? 0, build: course[jobId]?.build ?? cls.build[jobId] ?? null }), [course, cls.build]);

  useEffect(() => {
    if (!store) return;
    let live = true;
    const load = async () => {
      const out: Record<string, ProjectReport> = {};
      for (const a of cls.assignments) out[a.jobId] = await projectReport(store, a.jobId, facts(a.jobId), false);
      if (live) setMine(out);
    };
    void load();
    const un1 = store.subscribe("job_progress", () => void load());
    const un2 = store.subscribe("step_progress", () => void load());
    return () => {
      live = false;
      un1();
      un2();
    };
  }, [store, cls.assignments, facts]);

  const Title = many ? "h3" : "p";
  return (
    <div className={teach.files}>
      <div className={teach.titleRow}>
        <Title className={many ? teach.h3 : teach.strongCell}>{cls.name}</Title>
        <span className={teach.meta}>
          Set by {cls.teacher}. Joined {shortDate(cls.joinedAt)}.
        </span>
      </div>
      <SetList
        assignments={cls.assignments}
        course={course}
        side={(a) => {
          const p = mine[a.jobId];
          return p ? (
            <>
              <Badge tone={statusTone(p.status)}>{statusLabel(p.status)}</Badge>
              <span className={teach.meta}>{stepsText(p)}</span>
            </>
          ) : null;
        }}
      />
      <SendProgress cls={cls} facts={facts} withClassName={many} />
      <div className={styles.dangerRow}>
        {leaving ? (
          <span className={styles.inlineConfirm}>
            <span>Leave {cls.name}? Your work stays; only the class goes.</span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (saveBook(dropJoined(loadBook(), cls.id))) onLeft();
              }}
            >
              Leave the class
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLeaving(false)}>
              Stay in it
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setLeaving(true)}>
            Leave the class
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- a class you teach

type Shown = { kind: "join" | "teach"; url: string; copied: boolean; leftOut: number; at: number };

function TaughtView({ cls, acts, course, names, onDeleted }: { cls: TaughtClass; acts: CourseAct[]; course: CourseIndex; names: Record<string, string>; onDeleted: (name: string) => void }) {
  const [shown, setShown] = useState<Shown | null>(null);
  // What's set is edited here and saved as it changes; the boxes show this copy, so a space typed at the end of a note stays put.
  const [draft, setDraft] = useState<Assignment[]>(cls.assignments);
  const [problem, setProblem] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = `taught-title-${cls.id}`;

  const latest = () => loadBook().teaching.find((t) => t.id === cls.id) ?? cls;

  const copyJoin = async () => {
    const url = linkUrl(window.location.origin, BASE, "join", encodeJoin(latest()));
    setShown({ kind: "join", url, copied: await copyText(url), leftOut: 0, at: Date.now() });
  };
  const shareTeach = () => {
    const now = latest();
    const fitted = fitTeach(now, now.register);
    setShown({ kind: "teach", url: linkUrl(window.location.origin, BASE, "teach", fitted.hash), copied: false, leftOut: fitted.leftOut, at: Date.now() });
  };
  const setWork = (next: Assignment[]) => {
    setDraft(next);
    // A link made before the change would carry the old projects.
    setShown(null);
    const clean = next.map((a) => ({ ...a, note: line(a.note, LIMITS.note) ?? "" }));
    setProblem(saveBook(putTaught(loadBook(), { ...latest(), assignments: clean, updatedAt: Date.now() })) ? null : WONT_SAVE);
  };

  return (
    <div className={teach.files}>
      <div>
        <h3 id={titleId} className={teach.h3}>
          {cls.name}
        </h3>
        <p className={teach.meta}>
          {cls.role === "co-teacher" ? `Co-teaching with ${cls.teacher}` : `Taught by ${cls.teacher}`}. {cls.register.length === 0 ? "Nobody in the register yet" : `${cls.register.length} ${cls.register.length === 1 ? "student" : "students"} in the register`}.
          {cls.createdAt ? ` Made ${shortDate(cls.createdAt)}.` : ""}
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="primary" icon="copy" onClick={() => void copyJoin()}>
          Copy the join link
        </Button>
        <Button icon="users" onClick={shareTeach}>
          Share with a co-teacher
        </Button>
      </div>
      {shown?.kind === "join" ? (
        <LinkBox key={shown.at} url={shown.url} label={`Join link for ${cls.name}`} shareTitle={`Join ${cls.name}`} shareText={`Join ${cls.name} on ${BRAND.name}.`} copied={shown.copied}>
          <p className={styles.linkNote}>Anyone with it can join. It holds the class and what&apos;s set, so send it again after changing the projects.</p>
        </LinkBox>
      ) : null}
      {shown?.kind === "teach" ? (
        <LinkBox key={shown.at} url={shown.url} label={`Co-teacher link for ${cls.name}`} shareTitle={`Help teach ${cls.name}`} shareText={`${cls.name}, with what's set and the register.`}>
          <p className={styles.linkNote}>
            For whoever helps you teach. It holds the class, what&apos;s set and the register
            {shown.leftOut ? ", without some students' code, which made it too long" : ""}. Opening it adds the class to their class page, so progress links can go to either of you.
          </p>
        </LinkBox>
      ) : null}

      <Register cls={cls} course={course} names={names} onRemove={(id) => setProblem(saveBook(dropStudent(loadBook(), cls.id, id)) ? null : WONT_SAVE)} />

      <div className={teach.files}>
        <h3 className={teach.h3}>What&apos;s set</h3>
        <ProjectPicker acts={acts} value={draft} onChange={setWork} idPrefix={`set-${cls.id}`} />
        <p className={teach.meta}>Changed what&apos;s set? Copy the join link again and send it round: opening it brings the change in for everyone who&apos;s joined.</p>
      </div>

      {problem ? (
        <p className={teach.error} role="alert">
          {problem}
        </p>
      ) : null}

      <div className={styles.dangerRow}>
        <Button size="sm" variant="ghost" onClick={() => dialog.current?.showModal()}>
          Delete the class
        </Button>
      </div>

      <dialog ref={dialog} className={`float ${teach.dialog}`} aria-labelledby={`delete-${cls.id}`}>
        <form
          method="dialog"
          className={teach.dialogBody}
          onSubmit={(e) => {
            e.preventDefault();
            dialog.current?.close();
            if (saveBook(dropTaught(loadBook(), cls.id))) onDeleted(cls.name);
            else setProblem(WONT_SAVE);
          }}
        >
          <h2 id={`delete-${cls.id}`} className={teach.h2}>
            Delete {cls.name}
          </h2>
          <p>Its register goes from this browser. Anyone who joined keeps the class on their side until they leave it, and anyone co-teaching keeps their copy.</p>
          <div className={teach.row}>
            <Button type="submit" variant="danger">
              Delete the class
            </Button>
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              Keep it
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

// ---------------------------------------------------------------- making a class

function MakeClass({ acts, defaultTeacher, first, onMade, onCancel }: { acts: CourseAct[]; defaultTeacher: string; first: boolean; onMade: (cls: TaughtClass) => void; onCancel?: () => void }) {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState<string | null>(null);
  const [work, setWork] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const who = teacher ?? defaultTeacher;

  const make = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = line(name, LIMITS.className);
    const cleanTeacher = line(who, LIMITS.teacher);
    if (!cleanName || !cleanTeacher) return setError("The class needs a name, and so do you.");
    const now = Date.now();
    const cls: TaughtClass = {
      id: newId(),
      name: cleanName,
      teacher: cleanTeacher,
      assignments: work.map((a) => ({ ...a, note: line(a.note, LIMITS.note) ?? "" })),
      updatedAt: now,
      role: "teacher",
      createdAt: now,
      register: [],
    };
    if (!saveBook(putTaught(loadBook(), cls))) return setError(WONT_SAVE);
    setError(null);
    onMade(cls);
  };

  return (
    <section className={`px-panel ${teach.section}`} aria-labelledby="make-title">
      <h2 id="make-title" className={teach.h2}>
        {first ? "Make a class" : "Make another class"}
      </h2>
      <p className={teach.meta}>It&apos;s kept in this browser. Students join from a link you send them, and send their progress back as a link too.</p>
      <form className={styles.makeForm} onSubmit={make}>
        <div className={styles.twoFields}>
          <div className={teach.field}>
            <label htmlFor="make-name" className="label">
              Class name
            </label>
            <input id="make-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.className} autoComplete="off" placeholder="Thursday Python" aria-invalid={error && !name.trim() ? true : undefined} />
          </div>
          <div className={teach.field}>
            <label htmlFor="make-teacher" className="label">
              Your name, as students see it
            </label>
            <input id="make-teacher" value={who} onChange={(e) => setTeacher(e.target.value)} maxLength={LIMITS.teacher} autoComplete="name" />
          </div>
        </div>
        <fieldset className={styles.fieldset}>
          <legend className="label">What to set: any of the course&apos;s projects, each with a date and a note if you like</legend>
          <ProjectPicker acts={acts} value={work} onChange={setWork} idPrefix="make" />
        </fieldset>
        {error ? (
          <p className={teach.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button type="submit" variant="primary" icon="chalkboard" disabled={!name.trim() || !who.trim()}>
            Make the class
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
