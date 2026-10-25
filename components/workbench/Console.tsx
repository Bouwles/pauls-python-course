"use client";

import { useEffect, useRef, useState } from "react";
import { explainError } from "@/lib/errors";
import type { PyError } from "@/lib/python/protocol";
import type { RunnerState } from "./useRunner";
import { Button } from "../ui/Button";
import { LivingPlayer } from "./LivingPlayer";
import { CharacterPortrait } from "../world/CharacterPortrait";
import styles from "./Console.module.css";

interface Props {
  state: RunnerState;
  source: string;
  onInput: (text: string) => void;
  onShowLine?: (line: number) => void;
  onRetry?: () => void;
}

// Moss's opening line for each kind of error: short, in character, then the plain explanation.
const MOSS_SAYS: [RegExp, string][] = [
  [/^(SyntaxError|IndentationError|TabError)$/, "It never ran. Python couldn't read a line, so it stopped before the start."],
  [/^NameError$/, "Python has never heard of that name. Check the spelling, then check it was set first."],
  [/^ZeroDivisionError$/, "Something went to zero underneath a division. Find out what."],
  [/^(IndexError|KeyError)$/, "It went looking for something and found an empty shelf."],
  [/^RecursionError$/, "It's chasing its own tail. Find where it should stop."],
  [/^ValueError$/, "Right sort of thing, wrong value. Read the last line."],
  [/^AttributeError$/, "It asked something for a part it doesn't have."],
];

function mossLine(type: string): string {
  return MOSS_SAYS.find(([re]) => re.test(type))?.[1] ?? "Read it from the bottom. The last line is where it hurt.";
}

/** The traceback, then Moss's error panel (REDESIGN.md 4.6): his squinting portrait, his line, the plain explanation. */
export function ErrorExplanation({ error, source, onShowLine }: { error: PyError; source: string; onShowLine?: (line: number) => void }) {
  const explanation = explainError(error, source);
  return (
    <div className={styles.error}>
      <pre className={styles.traceback}>{error.traceback || `${error.type}: ${error.message}`}</pre>
      {explanation ? (
        <div className={styles.explainWrap}>
          <p className={styles.plate}>Moss</p>
          <div className={`frame-dialogue ${styles.explain}`}>
            <div className={styles.portrait}>
              <CharacterPortrait id="moss" sprite="moss" face="squinting" scale={2} height={96} />
            </div>
            <div className={styles.explainText}>
              <p className={styles.mossLine}>
                <span className="visually-hidden">Moss: </span>
                {mossLine(error.type)}
              </p>
              <p className={styles.explainTitle}>{explanation.title}</p>
              <p>{explanation.body}</p>
              {error.line && onShowLine ? (
                <div>
                  <Button size="sm" variant="quiet" onClick={() => onShowLine(error.line!)}>
                    Go to line {error.line}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Console({ state, source, onInput, onShowLine, onRetry }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.output, state.awaitingInput, state.result]);

  useEffect(() => {
    if (state.awaitingInput !== null) {
      setTyped("");
      input.current?.focus();
    }
  }, [state.awaitingInput]);

  const { phase, result, runtime } = state;
  let statusLine: string | null = null;
  if (phase === "starting" || (runtime.status === "loading" && phase !== "idle")) statusLine = "Starting Python. The first time takes a few seconds.";
  else if (phase === "running" && state.packages) statusLine = state.packages;
  else if (phase === "running") statusLine = state.awaitingInput !== null ? "Waiting for you to type." : "Running.";
  else if (result?.status === "ok" && !result.output) statusLine = "Ran. Nothing was printed.";
  else if (result?.status === "stopped") statusLine = "Stopped. If it was going round forever, look for a loop whose condition never changes.";
  else if (result?.status === "output-limit") statusLine = "Stopped after 2000 lines of output. A loop that never ends is the usual cause.";
  else if (result?.status === "ok" && result.exitCode) statusLine = `Finished with exit code ${result.exitCode}.`;

  return (
    <div className={styles.console}>
      <div
        ref={scroller}
        className={styles.scroll}
        role="log"
        aria-live="polite"
        aria-label="Output"
        onClick={() => {
          if (state.awaitingInput !== null && !window.getSelection()?.toString()) input.current?.focus();
        }}
      >
        {state.loadError ? (
          <div className={styles.loadError}>
            <p>Python didn&apos;t start. This is usually the connection. Try again.</p>
            <div className={styles.row}>
              {onRetry ? (
                <Button size="sm" onClick={onRetry}>
                  Try again
                </Button>
              ) : null}
              <details>
                <summary>Details</summary>
                <pre>{state.loadError}</pre>
              </details>
            </div>
          </div>
        ) : null}
        <pre className={styles.out}>
          {state.output.map((p, i) => (
            <span key={i} className={styles[p.kind]}>
              {p.text}
            </span>
          ))}
          {state.awaitingInput !== null ? (
            // Typing happens inline, after the prompt, with a blinking block cursor like a real
            // terminal (REDESIGN.md 4.4). A real input underneath does the work and keeps it accessible.
            <form
              className={styles.inputForm}
              onSubmit={(e) => {
                e.preventDefault();
                onInput(typed);
              }}
              onClick={() => input.current?.focus()}
            >
              <label className="visually-hidden" htmlFor="console-input">
                {state.awaitingInput ? `Answer: ${state.awaitingInput}` : "Type your input and press Enter"}
              </label>
              <span className={styles.input} aria-hidden="true">
                {typed}
              </span>
              <span className={[styles.cursor, focused ? styles.blink : ""].join(" ")} aria-hidden="true" />
              <input
                id="console-input"
                ref={input}
                className={styles.hiddenInput}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </form>
          ) : null}
        </pre>
        {state.inputUnavailable ? (
          <p className={styles.status}>This browser blocked typing into a running program. Reload the page; if it keeps happening, try another browser.</p>
        ) : null}
        {result?.figures?.length ? (
          <div className={styles.figures}>
            {result.figures.map((png, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={`data:image/png;base64,${png}`} alt={`Figure ${i + 1} drawn by the program`} className={styles.figure} />
            ))}
          </div>
        ) : null}
        {result?.visuals?.frames.length ? <LivingPlayer visuals={result.visuals} /> : null}
        {result?.status === "error" && result.error ? <ErrorExplanation error={result.error} source={source} onShowLine={onShowLine} /> : null}
        {statusLine ? <p className={styles.status}>{statusLine}</p> : null}
      </div>
    </div>
  );
}
