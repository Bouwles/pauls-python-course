"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Terminal.module.css";

export interface TermLine {
  kind: "cmd" | "out" | "err";
  text: string;
}

/** A small shell: type a command, press Enter. Up and Down walk back through history. */
export function Terminal({ lines, onCommand, prompt = "project $" }: { lines: TermLine[]; onCommand: (cmd: string) => void; prompt?: string }) {
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const history = lines.filter((l) => l.kind === "cmd").map((l) => l.text);

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [lines]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]!);
    } else if (e.key === "ArrowDown" && cursor !== null) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i]!);
      }
    }
  };

  return (
    <div className={styles.terminal} onClick={() => scroll.current?.parentElement?.querySelector("input")?.focus()}>
      <div ref={scroll} className={styles.scroll} role="log" aria-live="polite" aria-label="Terminal">
        {lines.map((l, i) => (
          <div key={i} className={[styles.line, styles[l.kind], l.kind === "out" && l.text.startsWith("+") && !l.text.startsWith("+++") ? styles.add : "", l.kind === "out" && l.text.startsWith("-") && !l.text.startsWith("---") ? styles.del : "", l.kind === "out" && /^(CONFLICT|<{7}|>{7}|={7})/.test(l.text) ? styles.conflict : ""].join(" ")}>
            {l.kind === "cmd" ? <span className={styles.prompt}>{prompt} </span> : null}
            {l.text || " "}
          </div>
        ))}
      </div>
      <form
        className={styles.inputRow}
        onSubmit={(e) => {
          e.preventDefault();
          onCommand(value);
          setValue("");
          setCursor(null);
        }}
      >
        <label className={styles.prompt} htmlFor="terminal-input">
          {prompt}
        </label>
        <input id="terminal-input" className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Type a command" />
      </form>
    </div>
  );
}
