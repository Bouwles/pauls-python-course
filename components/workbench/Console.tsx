"use client";

import { useEffect, useRef, useState } from "react";
import { explainError } from "@/lib/errors";
import { ASSISTANT } from "@/lib/cast";
import { speakerOf } from "@/lib/playas";
import { useSession } from "@/lib/store/session";
import { hash } from "@/lib/pixel/variety";
import type { Expression } from "@/lib/pixel/people";
import type { PyError } from "@/lib/python/protocol";
import type { RunnerState } from "./useRunner";
import { Button } from "../ui/Button";
import { Portrait } from "../art/Portrait";
import { LivingPlayer } from "./LivingPlayer";
import { useMaybeWorkbench } from "./context";
import styles from "./Console.module.css";

interface Props {
  state: RunnerState;
  source: string;
  onInput: (text: string) => void;
  onShowLine?: (line: number) => void;
  onRetry?: () => void;
}

/** Neil's faces for an error, one per error so they don't all look alike: he's calm about them. */
const DEBUG_FACES: Expression[] = ["thinking", "focused", "curious", "thinking", "determined"];

/**
 * The traceback, then the error panel (REDESIGN-2.md 3): Neil beside it working it out, since
 * debugging is his (Paul, when you're playing as Neil), a short heading in the pixel face, the
 * plain explanation and a "Go to line" button. The portrait is a small head and shoulders, so it's
 * the face that changes, error to error.
 */
export function ErrorExplanation({ error, source, onShowLine }: { error: PyError; source: string; onShowLine?: (line: number) => void }) {
  const wb = useMaybeWorkbench();
  const { profile } = useSession();
  const explanation = explainError(error, source);
  const who = speakerOf(ASSISTANT, profile.settings.playAs);
  const name = wb?.characters[who]?.name ?? who.charAt(0).toUpperCase() + who.slice(1);
  const face = DEBUG_FACES[hash(`${error.type}|${error.line ?? ""}|${error.message}`) % DEBUG_FACES.length]!;
  return (
    <div className={styles.error}>
      <pre className={styles.traceback}>{error.traceback || `${error.type}: ${error.message}`}</pre>
      {explanation ? (
        <section className={styles.explain} aria-label={`${name} explains the error`}>
          <div className={styles.explainHead}>
            <Portrait who={who} name={name} size={wb?.compact ? 72 : 80} expression={face} />
            <h2 className={styles.explainTitle}>{explanation.title.replace(/\.$/, "")}</h2>
          </div>
          <p className={styles.explainBody}>{explanation.body}</p>
          {error.line && onShowLine ? (
            <div className={styles.explainActions}>
              <Button size="sm" variant="secondary" onClick={() => onShowLine(error.line!)}>
                Go to line {error.line}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/** Program output, with input() typed inline after the prompt and a blinking block cursor. */
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
  const empty = !state.output.length && !result && phase === "idle" && !state.loadError;

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
        {empty ? <p className={styles.empty}>Press Run and what your program prints shows up here.</p> : null}
        <pre className={styles.out}>
          {state.output.map((p, i) => (
            <span key={i} className={styles[p.kind]}>
              {p.text}
            </span>
          ))}
          {state.awaitingInput !== null ? (
            // Typing happens inline, after the prompt, with a blinking block cursor like a real
            // terminal. A real input underneath does the work and keeps it accessible.
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
        {state.inputUnavailable ? <p className={styles.status}>This browser blocked typing into a running program. Reload the page; if it keeps happening, try another browser.</p> : null}
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
