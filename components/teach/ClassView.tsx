"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { avatarBackground } from "@/lib/pixel/looks";
import { PixelPerson } from "../art/PixelPerson";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { CopyCode } from "./CopyCode";
import styles from "./Teach.module.css";

export interface StudentItem {
  id: string;
  name: string;
  /** Their avatar, or an older look: lib/pixel/looks.ts reads either. */
  character: unknown;
  shipped: number;
  current: string | null;
  week: number;
  weekText: string;
  total: number;
  totalText: string;
  lastActive: number;
  lastActiveText: string;
}

export interface AssignmentItem {
  id: string;
  jobId: string;
  title: string;
  act: string;
  due: string | null;
  shipped: number;
}

export interface JobGroup {
  label: string;
  jobs: { id: string; title: string }[];
}

type Key = "name" | "shipped" | "current" | "week" | "total" | "lastActive";
const COLUMNS: { key: Key; label: string; numeric: boolean; narrow?: boolean }[] = [
  { key: "name", label: "Student", numeric: false },
  { key: "shipped", label: "Shipped", numeric: true },
  { key: "current", label: "Working on", numeric: false },
  { key: "week", label: "Last 7 days", numeric: true },
  { key: "total", label: "Total time", numeric: true, narrow: true },
  { key: "lastActive", label: "Last active", numeric: true },
];

export function ClassView({ cls, students, assignments, groups }: { cls: { id: string; name: string; joinCode: string }; students: StudentItem[]; assignments: AssignmentItem[]; groups: JobGroup[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const sorted = useMemo(() => {
    const value = (s: StudentItem): string | number => (sort.key === "name" ? s.name.toLowerCase() : sort.key === "current" ? (s.current ?? "").toLowerCase() : s[sort.key]);
    return [...students].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      // Students working on nothing sort last either way.
      if (sort.key === "current" && !va !== !vb) return va ? -1 : 1;
      if (va < vb) return -sort.dir;
      if (va > vb) return sort.dir;
      return a.name.localeCompare(b.name);
    });
  }, [students, sort]);

  const sortBy = (key: Key, numeric: boolean) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: numeric ? -1 : 1 }));

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <Link href="/teach" className={styles.back}>
          <Icon name="caretLeft" size={16} />
          Your classes
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{cls.name}</h1>
          <p className={styles.joinCode}>
            <span>Join code</span> <CopyCode code={cls.joinCode} />
          </p>
        </div>
        <p className={styles.meta}>
          {students.length === 0 ? "Nobody has joined yet." : `${students.length} ${students.length === 1 ? "student" : "students"}.`} Students type the code in Settings, under Classes.
        </p>
      </header>

      <section className={`px-panel ${styles.section}`} aria-labelledby="students-title">
        <h2 id="students-title" className={styles.h2}>
          Students
        </h2>
        {students.length === 0 ? (
          <p className={styles.empty}>When a student joins, they appear here with their projects, time and last visit.</p>
        ) : (
          <div className={styles.tableWrap} role="region" aria-labelledby="students-title" tabIndex={0}>
            <table className={styles.table}>
              <caption className="visually-hidden">Students in {cls.name}. Column headers sort the table.</caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={[c.numeric && c.key !== "lastActive" ? styles.num : "", c.narrow ? styles.hideNarrow : ""].join(" ")}
                      aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
                    >
                      <button type="button" className={styles.sort} onClick={() => sortBy(c.key, c.numeric)}>
                        {c.label}
                        <SortMark dir={sort.key === c.key ? sort.dir : 0} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className={styles.strongCell}>
                      <span className={styles.student}>
                        <span className={styles.face} style={{ background: avatarBackground(s.character) }} aria-hidden="true">
                          <PixelPerson avatar={s.character} crop="head" scale={1} animate={false} />
                        </span>
                        <Link href={`/teach/${cls.id}/${s.id}`}>{s.name}</Link>
                      </span>
                    </th>
                    <td className={styles.num}>{s.shipped}</td>
                    <td>{s.current ?? <span className={styles.meta}>None</span>}</td>
                    <td className={styles.num}>{s.weekText}</td>
                    <td className={[styles.num, styles.hideNarrow].join(" ")}>{s.totalText}</td>
                    <td className={styles.nowrap}>{s.lastActiveText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {students.length ? <p className={styles.meta}>Last 7 days is the time on steps worked on in the past seven days. Pick a name to see that student&apos;s projects, results and code.</p> : null}
      </section>

      <Assignments classId={cls.id} assignments={assignments} groups={groups} members={students.length} />
    </div>
  );
}

/** The sort mark: a caret pointing the way the column is sorted, faint when it isn't. */
function SortMark({ dir }: { dir: 1 | -1 | 0 }) {
  return <Icon name="caretDown" size={14} className={[styles.sortMark, dir === 0 ? styles.sortIdle : dir === 1 ? styles.sortUp : ""].join(" ")} />;
}

function Assignments({ classId, assignments, groups, members }: { classId: string; assignments: AssignmentItem[]; groups: JobGroup[]; members: number }) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    const res = await fetch(`/api/teach/classes/${classId}/assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, due }) });
    setBusy(false);
    if (!res.ok) return setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "That didn't work.");
    const title = groups.flatMap((g) => g.jobs).find((j) => j.id === jobId)?.title.replace(/^\d+\.\s*/, "");
    setNote(`Set ${title}.`);
    setJobId("");
    setDue("");
    router.refresh();
  };

  const remove = async (a: AssignmentItem) => {
    const res = await fetch(`/api/teach/classes/${classId}/assignments?id=${a.id}`, { method: "DELETE" });
    if (res.ok) setNote(`Removed ${a.title}.`);
    router.refresh();
  };

  return (
    <section className={`px-panel ${styles.section}`} aria-labelledby="set-title">
      <h2 id="set-title" className={styles.h2}>
        Projects set for the class
      </h2>
      {assignments.length === 0 ? (
        <p className={styles.empty}>Nothing set yet. A set project appears in each student&apos;s Clocktower, under their next project.</p>
      ) : (
        <div className={styles.tableWrap} role="region" aria-labelledby="set-title" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Due</th>
                <th scope="col" className={styles.num}>
                  Shipped
                </th>
                <th scope="col" className={styles.end}>
                  <span className="visually-hidden">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className={styles.jobCell}>
                    {a.title} <span className={styles.meta}>{a.act}</span>
                  </th>
                  <td className={styles.nowrap}>{a.due ?? <span className={styles.meta}>No date</span>}</td>
                  <td className={styles.num}>
                    {a.shipped} of {members}
                  </td>
                  <td className={styles.end}>
                    <Button size="sm" variant="ghost" onClick={() => void remove(a)} aria-label={`Remove ${a.title}`}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form className={styles.form} onSubmit={(e) => void set(e)}>
        <div className={[styles.field, styles.grow].join(" ")}>
          <label htmlFor="set-job" className="label">
            Project
          </label>
          <select id="set-job" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">Choose a project</option>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="set-due" className="label">
            Due, if any
          </label>
          <input id="set-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" disabled={!jobId || busy}>
          Set the project
        </Button>
      </form>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <p className={styles.status} role="status" aria-live="polite">
        {note ?? ""}
      </p>
    </section>
  );
}
