"use client";

// One review card: a tiny retrieval task (predict, choose, fix, fill in, write) on a pixel panel,
// with "Check" under it. Morning Rounds and the Drills both use it. When a check fails, the
// report prints under the card, the way it does on the Workbench.
import { useMemo, useState } from "react";
import type { Card } from "@/lib/content/types";
import type { CheckReport } from "@/lib/python/protocol";
import { outputMatches } from "@/lib/content/answers";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { CodeBlock } from "../workbench/CodeBlock";
import { Editor } from "../workbench/Editor";
import { TestReport } from "../workbench/TestReport";
import { optionLabel } from "../workbench/steps/PredictStep";
import type { Runner } from "../workbench/useRunner";
import styles from "./ReviewCard.module.css";

export interface CardOutcome {
  correct: boolean;
  attempts: number;
  misconception: string | null;
}

function passed(r: CheckReport | null) {
  return Boolean(r && r.status === "ok" && r.results.filter((x) => !x.stretch).every((x) => x.passed));
}

/** Options that are code (or printed output) are set in the code face. */
const isCode = (text: string) => /\n|^[\d"'<[(]/.test(text);

export function ReviewCard({
  card,
  runner,
  onAnswered,
  onAttempt,
  head,
  children,
  label,
}: {
  card: Card;
  runner: Runner;
  onAnswered: (o: CardOutcome) => void;
  /** Every go, right or wrong, as it's marked: whoever is watching can react to it. */
  onAttempt?: (correct: boolean, attempt: number) => void;
  /** The top of the card: the project it comes from, or the task number. */
  head?: React.ReactNode;
  /** The foot of the card, under the feedback (the "next" button). */
  children?: React.ReactNode;
  /** The card's accessible name. */
  label?: string;
}) {
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; text: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [code, setCode] = useState(card.type === "fix" ? card.code : card.type === "write" ? card.starter : "");
  const [blanks, setBlanks] = useState<string[]>(card.type === "fill" ? card.blanks.map(() => "") : []);
  const [report, setReport] = useState<CheckReport | null>(null);
  const done = Boolean(result?.correct || (result && attempts >= 2));
  const busy = runner.state.phase !== "idle";

  const finish = (correct: boolean, text: string, misconception: string | null = null) => {
    const n = attempts + 1;
    setAttempts(n);
    setResult({ correct, text });
    onAttempt?.(correct, n);
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

  // When any option is code or printed output, all of them are set in the code face, so they compare.
  const codeOptions = card.type === "choice" && card.options.some((o) => isCode(o.text));
  const canCheck = !busy && !(card.type === "choice" && choice === null) && !(card.type === "predict" && !typed.trim());

  return (
    <div className={styles.wrap}>
      <article className={`px-panel ${styles.card}`} aria-label={label}>
        {head}
        <div className={styles.task}>
          <p className={styles.prompt} dangerouslySetInnerHTML={{ __html: card.promptHtml }} />
          {card.type !== "fix" && card.type !== "write" && card.type !== "fill" && card.code ? (
            <div className={styles.code}>
              <CodeBlock code={card.code} />
            </div>
          ) : null}
          {card.inputs.length && card.type !== "fix" && card.type !== "write" ? (
            <p className={styles.inputs}>
              <span className="label">Typed in</span> <code>{card.inputs.map((i) => `"${i}"`).join(", ")}</code>
            </p>
          ) : null}

          {card.type === "predict" ? (
            <label className={styles.answerField}>
              <span className="label">What it prints</span>
              <textarea
                className={styles.answer}
                rows={Math.max(2, card.answer.split("\n").length)}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={done}
                spellCheck={false}
              />
            </label>
          ) : null}

          {card.type === "choice" ? (
            <fieldset className={styles.options} disabled={done}>
              <legend className="visually-hidden">Choose one</legend>
              {card.options.map((o, i) => (
                <label key={i} className={[styles.option, choice === i ? styles.chosen : ""].join(" ")}>
                  <input type="radio" className="visually-hidden" name={card.id} checked={choice === i} onChange={() => setChoice(i)} aria-label={optionLabel(o.text, !codeOptions)} />
                  <span className={styles.mark} aria-hidden="true" />
                  <span className={codeOptions ? styles.mono : styles.optionText}>{o.text}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {card.type === "fill" ? (
            <pre className={`code-dark px-inset ${styles.fill}`}>
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
                        disabled={done}
                        spellCheck={false}
                      />
                    ) : null}
                  </span>
                ))}
              </code>
            </pre>
          ) : null}

          {card.type === "fix" || card.type === "write" ? (
            <div className={`px-inset ${styles.editor}`}>
              <Editor docKey={card.id} value={code} onChange={(v) => setCode(v)} label="Code for this card" onCheck={() => void check()} readOnly={done} />
            </div>
          ) : null}

          {!done ? (
            <div className={styles.row}>
              <Button variant="primary" icon="check" onClick={() => void check()} disabled={!canCheck}>
                {busy ? "Checking" : result ? "Try again" : "Check"}
              </Button>
            </div>
          ) : null}

          {result ? (
            <div className={[styles.feedback, result.correct ? styles.good : styles.bad].join(" ")} role="status">
              <p className={styles.fbTitle}>
                <Icon name={result.correct ? "tick" : "cross"} />
                <span>{result.correct ? (attempts > 1 ? "Got there." : "Right.") : done ? "Not this time." : "Not quite. One more go."}</span>
              </p>
              {result.text !== "Right." ? <p className={styles.fbText}>{result.text}</p> : null}
              {done && !result.correct && (card.type === "fix" || card.type === "write") ? (
                <>
                  <p className={styles.fbText}>One way to do it:</p>
                  <div className={styles.code}>
                    <CodeBlock code={card.solution} />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        {children ? <div className={styles.foot}>{children}</div> : null}
      </article>
      {report && !passed(report) && !done ? (
        <div className={styles.report}>
          <TestReport report={report} progress={null} source={code} />
        </div>
      ) : null}
    </div>
  );
}
