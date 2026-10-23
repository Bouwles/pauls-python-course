"use client";

import styles from "./ShortcutsSheet.module.css";

export function ShortcutsSheet() {
  return (
    <details className={styles.sheet}>
      <summary className={styles.summary}>Keys</summary>
      <div className={styles.panel}>
        <dl>
          <div>
            <dt>
              <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Enter</kbd>
            </dt>
            <dd>Run</dd>
          </div>
          <div>
            <dt>
              <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd>
            </dt>
            <dd>Check</dd>
          </div>
          <div>
            <dt>
              <kbd>Tab</kbd>, <kbd>Shift</kbd> + <kbd>Tab</kbd>
            </dt>
            <dd>Indent, outdent (four spaces)</dd>
          </div>
          <div>
            <dt>
              <kbd>Esc</kbd> then <kbd>Tab</kbd>
            </dt>
            <dd>Leave the editor</dd>
          </div>
          <div>
            <dt>
              <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>Z</kbd>
            </dt>
            <dd>Undo</dd>
          </div>
          <div>
            <dt>
              <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> + <kbd>F</kbd>
            </dt>
            <dd>Find</dd>
          </div>
        </dl>
        <p className={styles.note}>Indents are always four spaces. Python reads indentation as structure, so mixing widths causes errors that are hard to see.</p>
      </div>
    </details>
  );
}
