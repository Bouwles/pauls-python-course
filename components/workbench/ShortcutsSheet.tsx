"use client";

import { useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import styles from "./ShortcutsSheet.module.css";

const KEYS: [React.ReactNode, string][] = [
  [<><kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Enter</kbd></>, "Run"],
  [<><kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd></>, "Check"],
  [<><kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd></>, "Indent, outdent (four spaces)"],
  [<><kbd>Esc</kbd> then <kbd>Tab</kbd></>, "Leave the editor"],
  [<><kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Z</kbd></>, "Undo"],
  [<><kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>F</kbd></>, "Find"],
  [<kbd>Space</kbd>, "Next line of dialogue (outside the editor)"],
  [<kbd>Esc</kbd>, "Close Dennis's drawer"],
];

/** The Keys sheet: every keyboard shortcut in one place, so buttons never have to show them. */
export function ShortcutsSheet({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog ref={dialog} className={`frame-panel ${styles.sheet}`} onClose={onClose} aria-labelledby="keys-title">
      <div className={styles.head}>
        <h2 id="keys-title" className={styles.title}>
          Keys
        </h2>
        <Button size="sm" variant="quiet" onClick={() => dialog.current?.close()}>
          Close
        </Button>
      </div>
      <dl className={styles.list}>
        {KEYS.map(([keys, what]) => (
          <div key={what} className={styles.row}>
            <dt>{keys}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>Indents are always four spaces. Python reads indentation as structure, so mixing widths causes errors that are hard to see.</p>
    </dialog>
  );
}
