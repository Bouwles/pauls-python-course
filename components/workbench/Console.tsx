"use client";

import { useEffect, useRef, useState } from "react";
import { explainError } from "@/lib/errors";
import type { PyError } from "@/lib/python/protocol";
import type { RunnerState } from "./useRunner";
import { Button } from "../ui/Button";
import { LivingPlayer } from "./LivingPlayer";
import styles from "./Console.module.css";

interface Props {
  state: RunnerState;
  source: string;
  onInput: (text: string) => void;
  onShowLine?: (line: number) => void;
  onRetry?: () => void;
}

export function ErrorExplanation({ error, source, onShowLine }: { error: PyError; source: string; onShowLine?: (line: number) => void }) {
  const explanation = explainError(error, source);
  return (
    <div className={styles.error}>
      <pre className={styles.traceback}>{error.traceback || `${error.type}: ${error.message}`}</pre>
      {explanation ? (
        <div className={styles.explain}>
          <p className={styles.explainTitle}>{explanation.title}</p>
          <p>{explanation.body}</p>
          {error.line && onShowLine ? (
            <Button size="sm" variant="quiet" onClick={() => onShowLine(error.line!)}>
              Go to line {error.line}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Console({ state, source, onInput, onShowLine, onRetry }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");

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
      <div ref={scroller} className={styles.scroll} role="log" aria-live="polite" aria-label="Output">
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
            <form
              className={styles.inputForm}
              onSubmit={(e) => {
                e.preventDefault();
                onInput(typed);
              }}
            >
              <label className="visually-hidden" htmlFor="console-input">
                {state.awaitingInput ? `Answer: ${state.awaitingInput}` : "Type your input and press Enter"}
              </label>
              <input
                id="console-input"
                ref={input}
                className={styles.input}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
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
