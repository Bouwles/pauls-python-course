"use client";

import { useEffect, useRef, useState } from "react";
import { listSnapshots } from "@/lib/store/progress";
import type { SnapshotRow } from "@/lib/store/types";
import { Button } from "../ui/Button";
import { CodeBlock } from "./CodeBlock";
import { useWorkbench } from "./context";
import styles from "./VersionHistory.module.css";

const REASON: Record<SnapshotRow["reason"], string> = {
  run: "Ran",
  check: "Checked",
  manual: "Before reset",
  conflict: "From another device",
  restore: "Before restoring",
};

function when(t: number) {
  const d = new Date(t);
  const today = new Date();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === today.toDateString() ? time : `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`;
}

export function VersionHistory({ stepId, file, current, onClose, onRestore }: { stepId: string; file: string; current: string; onClose: () => void; onRestore: (content: string) => void }) {
  const { store, job } = useWorkbench();
  const dialog = useRef<HTMLDialogElement>(null);
  const [snaps, setSnaps] = useState<SnapshotRow[] | null>(null);
  const [picked, setPicked] = useState<SnapshotRow | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
    if (store) void listSnapshots(store, job.id, stepId, file).then((s) => {
      setSnaps(s);
      setPicked(s[0] ?? null);
    });
  }, [store, job.id, stepId, file]);

  return (
    <dialog ref={dialog} className={`float ${styles.dialog}`} onClose={onClose} aria-labelledby="history-title">
      <div className={styles.head}>
        <h2 id="history-title" className={styles.title}>
          History of {file}
        </h2>
        <Button size="sm" variant="ghost" icon="close" onClick={() => dialog.current?.close()}>
          Close
        </Button>
      </div>
      {snaps === null ? (
        <p className={styles.empty}>Looking.</p>
      ) : snaps.length === 0 ? (
        <p className={styles.empty}>No earlier versions yet. One is kept every time you run or check.</p>
      ) : (
        <div className={styles.body}>
          <ol className={styles.list}>
            {snaps.map((s) => (
              <li key={s.key}>
                <button className={styles.item} aria-pressed={picked?.key === s.key} onClick={() => setPicked(s)}>
                  <span>{when(s.createdAt)}</span>
                  <span className={styles.reason}>{REASON[s.reason]}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.preview}>
            {picked ? (
              <>
                <CodeBlock code={picked.content || "\n"} label={`Version from ${when(picked.createdAt)}`} />
                <div className={styles.row}>
                  <Button variant="primary" icon="history" disabled={picked.content === current} onClick={() => onRestore(picked.content)}>
                    Restore this version
                  </Button>
                  {picked.content === current ? <span className={styles.same}>Same as what you have now.</span> : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </dialog>
  );
}
