"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TeacherClass } from "@/lib/server/classes";
import { Button } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { CopyCode } from "./CopyCode";
import styles from "./Teach.module.css";

type ClassItem = TeacherClass & { made: string };

/** /teach: the teacher's classes, making one, deleting one. */
export function TeachHome({ teacher, classes }: { teacher: boolean; classes: ClassItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<ClassItem | null>(null);

  const make = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    const res = await fetch("/api/teach/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const body = (await res.json().catch(() => ({}))) as { class?: TeacherClass; error?: string };
    setBusy(false);
    if (!res.ok || !body.class) return setError(body.error ?? "That didn't work.");
    setName("");
    setNote(`Made ${body.class.name}. Its code is ${body.class.joinCode}.`);
    router.refresh();
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Your classes</h1>
        <p className={styles.lede}>
          Make a class and give its code to your students. They type it in Settings. From then until they leave, you see each one&apos;s progress, test results, time and code. You can set Jobs for the whole class.
        </p>
      </header>

      {!teacher ? (
        <p className={styles.notice}>
          <PixelIcon name="settings" />
          <span>
            Switch on &ldquo;I teach a class&rdquo; in <Link href="/settings">Settings</Link> to make a class.
          </span>
        </p>
      ) : null}

      {classes.length ? (
        <div className={`frame-panel ${styles.section}`}>
        <div className={styles.tableWrap} role="region" aria-label="Your classes" tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Join code</th>
                <th scope="col" className={styles.num}>
                  Students
                </th>
                <th scope="col" className={[styles.num, styles.hideNarrow].join(" ")}>
                  Jobs set
                </th>
                <th scope="col" className={styles.hideNarrow}>
                  Made
                </th>
                <th scope="col" className={styles.end}>
                  <span className="visually-hidden">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <th scope="row">
                    <Link href={`/teach/${c.id}`}>{c.name}</Link>
                  </th>
                  <td>
                    <CopyCode code={c.joinCode} />
                  </td>
                  <td className={styles.num}>{c.students}</td>
                  <td className={[styles.num, styles.hideNarrow].join(" ")}>{c.assignments}</td>
                  <td className={[styles.nowrap, styles.hideNarrow].join(" ")}>{c.made}</td>
                  <td className={styles.end}>
                    <Button size="sm" variant="quiet" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      ) : teacher ? (
        <p className={styles.empty}>No classes yet. Make one below; it gets its own six-character code.</p>
      ) : null}

      {teacher ? (
        <section className={`frame-panel ${styles.section}`} aria-labelledby="new-class">
          <h2 id="new-class" className={styles.h2}>
            New class
          </h2>
          <form className={styles.form} onSubmit={(e) => void make(e)}>
            <label className={[styles.field, styles.grow].join(" ")}>
              <span className={styles.fieldLabel}>Class name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="off" aria-invalid={error ? true : undefined} aria-describedby={error ? "new-class-error" : undefined} />
            </label>
            <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
              Make the class
            </Button>
          </form>
          {error ? (
            <p id="new-class-error" className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <p className={styles.status} role="status" aria-live="polite">
            {note ?? ""}
          </p>
        </section>
      ) : null}

      <DeleteClass cls={deleting} onClose={() => setDeleting(null)} onDeleted={() => router.refresh()} />
    </div>
  );
}

/** Typed confirmation: the class name. */
function DeleteClass({ cls, onClose, onDeleted }: { cls: ClassItem | null; onClose: () => void; onDeleted: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Open the dialog when a class is picked, empty each time.
  useEffect(() => {
    if (!cls) return;
    setTyped("");
    setError(null);
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [cls]);

  const close = () => {
    dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className={`frame-panel float ${styles.dialog}`} aria-labelledby="delete-class-title" onClose={onClose}>
      {cls ? (
        <form
          method="dialog"
          className={styles.dialogBody}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await fetch(`/api/teach/classes/${cls.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: typed }) });
            setBusy(false);
            if (res.ok) {
              close();
              onDeleted();
            } else setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "That didn't work.");
          }}
        >
          <h2 id="delete-class-title" className={styles.h2}>
            Delete {cls.name}
          </h2>
          <p>
            {cls.students === 0 ? "Nobody has joined it yet." : cls.students === 1 ? "Its one student leaves the class." : `Its ${cls.students} students leave the class.`} Its set Jobs go and the code stops working. Students keep all their own work. This can&apos;t be undone.
          </p>
          <label className={styles.field}>
            <span className={styles.fieldText}>
              Type <strong>{cls.name}</strong> to confirm
            </span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.row}>
            <Button type="submit" variant="danger" disabled={typed.trim() !== cls.name.trim() || busy}>
              Delete the class
            </Button>
            <Button type="button" variant="quiet" onClick={close}>
              Keep it
            </Button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
