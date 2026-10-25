"use client";

// One review card: a tiny retrieval task (predict, choose, fix, fill in, write), on a small
// paper repair slip pinned with a tack. The check report, when there is one, prints below
// the slip on the page itself, the way it does on the Workbench.
import { useMemo, useState } from "react";
import type { Card } from "@/lib/content/types";
import type { CheckReport } from "@/lib/python/protocol";
import { outputMatches } from "@/lib/content/answers";
import { Button } from "../ui/Button";
import { FailIcon, PassIcon } from "../ui/Icons";
import { CodeBlock } from "../workbench/CodeBlock";
import { Editor } from "../workbench/Editor";
import { TestReport } from "../workbench/TestReport";
import { optionLabel } from "../workbench/steps/PredictStep";
import type { Runner } from "../workbench/useRunner";
import styles from "./Rounds.module.css";

export interface CardOutcome {
  correct: boolean;
  attempts: number;
  misconception: string | null;
}

function passed(r: CheckReport | null) {
  return Boolean(r && r.status === "ok" && r.results.filter((x) => !x.stretch).every((x) => x.passed));
}

/** A pixel drawing-pin, 8x10 at 2x. */
function Tack() {
  return (
    <svg className={styles.tack} width="16" height="20" viewBox="0 0 8 10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 0h4v1H2zM1 1h6v3H1zM2 4h4v1H2z" fill="var(--brick-dark)" />
      <path d="M2 1h3v1H2zM2 2h1v1H2z" fill="var(--brick)" />
      <path d="M3 1h1v1H3z" fill="var(--chalk)" />
      <path d="M3 5h2v1H3zM4 6h1v4H4z" fill="var(--fog)" />
    </svg>
  );
}

export function ReviewCard({
  card,
  runner,
  onAnswered,
  head,
  children,
  label,
}: {
  card: Card;
  runner: Runner;
  onAnswered: (o: CardOutcome) => void;
  /** The top of the slip: who it's for and what it's about. */
  head?: React.ReactNode;
  /** The foot of the slip, under the feedback (the "next" button). */
  children?: React.ReactNode;
  /** The slip's accessible name. */
  label?: string;
}) {
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [typed, setTyped] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [code, setCode] = useState(card.type === "fix" ? card.code : card.type === "write" ? card.starter : "");
  const [blanks, setBlanks] = useState<string[]>(card.type === "fill" ? card.blanks.map(() => "") : []);
  const [report, setReport] = useState<CheckReport | null>(null);
  const done = result?.correct || (result && attempts >= 2);
  const busy = runner.state.phase !== "idle";

  const finish = (correct: boolean, text: string, misconception: string | null = null) => {
    const n = attempts + 1;
    setAttempts(n);
    setResult({ correct, text });
    if (correct || n >= 2) onAnswered({ correct, attempts: n, misconception });
  };

  const fillParts = useMemo(() => (card.type === "fill" ? card.code.split("___") : []), [card]);

  const check = async () => {
    switch (card.type) {
      case "predict": {
        const ok = outputMatches(typed, [card.answer, ...card.accept]);
        finish(ok, ok ? "Right." : `It prints:\n${card.answer}`);
        break;
      }
      case "choice": {
        if (choice === null) return;
        const o = card.options[choice]!;
        const right = card.options.find((x) => x.correct)!;
        finish(
          o.correct,
          o.correct ? (o.feedback?.replace(/<[^>]+>/g, "") ?? "Right.") : `${o.feedback?.replace(/<[^>]+>/g, "") ?? "Not that one."} The answer: ${right.text}`,
          o.correct ? null : o.misconception,
        );
        break;
      }
      case "fill": {
        const filled = fillParts.map((p, i) => p + (i < blanks.length ? blanks[i] : "")).join("");
        const exact = card.blanks.every((acc, i) => acc.some((a) => a === blanks[i]!.trim()));
        if (exact) {
          finish(true, "Right.");
          break;
        }
        const r = await runner.check({ ...card.files, "main.py": filled }, { source: card.tests });
        setReport(r);
        finish(passed(r), passed(r) ? "That works too." : `One answer: ${card.blanks.map((b) => b[0]).join(", ")}`);
        break;
      }
      case "fix":
      case "write": {
        const r = await runner.check({ ...card.files, "main.py": code }, { source: card.tests });
        setReport(r);
        finish(passed(r), passed(r) ? "That works." : "Not yet.");
        break;
      }
    }
  };

  return (
    <div className={styles.cardWrap}>
      <article className={["frame-paper", styles.slip].join(" ")} aria-label={label}>
        <Tack />
        {head}
        <div className={styles.card}>
          <p className={styles.prompt} dangerouslySetInnerHTML={{ __html: card.promptHtml }} />
          {card.type !== "fix" && card.type !== "write" && card.type !== "fill" && card.code ? <CodeBlock code={card.code} /> : null}
          {card.inputs.length && card.type !== "fix" && card.type !== "write" ? <p className={styles.inputs}>Typed in: {card.inputs.map((i) => `"${i}"`).join(", ")}</p> : null}

          {card.type === "predict" ? (
            <textarea
              className={styles.answer}
              rows={Math.max(1, card.answer.split("\n").length)}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={Boolean(done)}
              aria-label="What it prints"
              spellCheck={false}
            />
          ) : null}

          {card.type === "choice" ? (
            <fieldset className={styles.options} disabled={Boolean(done)}>
              <legend className="visually-hidden">Choose one</legend>
              {card.options.map((o, i) => (
                <label key={i} className={[styles.option, choice === i ? styles.chosen : ""].join(" ")}>
                  <input type="radio" className="visually-hidden" name={card.id} checked={choice === i} onChange={() => setChoice(i)} aria-label={optionLabel(o.text, !/\n|^[\d"'<]/.test(o.text))} />
                  <span className={styles.mark} aria-hidden="true" />
                  <span className={/\n|^[\d"'<]/.test(o.text) ? styles.mono : styles.optionText}>{o.text}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {card.type === "fill" ? (
            <pre className={styles.fill}>
              <code>
                {fillParts.map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < blanks.length ? (
                      <input
                        className={styles.blank}
                        value={blanks[i]}
                        onChange={(e) => setBlanks(blanks.map((b, j) => (j === i ? e.target.value : b)))}
                        size={Math.max(4, (card.blanks[i]![0] ?? "").length + 1)}
                        aria-label={`Gap ${i + 1}`}
                        disabled={Boolean(done)}
                        spellCheck={false}
                      />
                    ) : null}
                  </span>
                ))}
              </code>
            </pre>
          ) : null}

          {card.type === "fix" || card.type === "write" ? (
            <div className={["code-night", styles.editor].join(" ")}>
              <Editor docKey={card.id} value={code} onChange={(v) => setCode(v)} label="Code for this card" onCheck={() => void check()} readOnly={Boolean(done)} />
            </div>
          ) : null}

          {!done ? (
            <div className={styles.row}>
              <Button variant="primary" onClick={() => void check()} disabled={busy || (card.type === "choice" && choice === null) || (card.type === "predict" && !typed.trim())}>
                {busy ? "Checking" : result ? "Try again" : "Check"}
              </Button>
            </div>
          ) : null}

          {result ? (
            <div className={[styles.feedback, result.correct ? styles.good : styles.bad].join(" ")} role="status">
              <p className={styles.fbTitle}>
                {result.correct ? <PassIcon /> : <FailIcon />}
                <span>{result.correct ? (attempts > 1 ? "Got there." : "Right.") : done ? "Not this time." : "Not quite. One more go."}</span>
              </p>
              {result.text !== "Right." ? <p className={styles.fbText}>{result.text}</p> : null}
              {done && !result.correct && (card.type === "fix" || card.type === "write") ? (
                <>
                  <p className={styles.fbText}>One way to do it:</p>
                  <CodeBlock code={card.solution} />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        {children}
      </article>
      {report && !passed(report) && !done ? (
        <div className={styles.printout}>
          <TestReport report={report} progress={null} source={code} />
        </div>
      ) : null}
    </div>
  );
}
