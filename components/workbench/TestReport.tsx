"use client";

import type { CheckReport, TestMeta, TestResult } from "@/lib/python/protocol";
import { PassIcon, FailIcon, DotIcon } from "../ui/Icons";
import { ErrorExplanation } from "./Console";
import styles from "./TestReport.module.css";

function describeInputs(t: TestMeta): string | null {
  if (t.kind === "function" || t.kind === "variable") return t.call ?? null;
  if (t.kind === "output" && t.inputs && t.inputs.length) return t.inputs.join("\n");
  return null;
}

function show(value: string | undefined): string {
  if (value === undefined) return "";
  return value === "" ? "(nothing)" : value.replace(/\n$/, "");
}

function Failure({ r, source, onShowLine }: { r: TestResult; source: string; onShowLine?: (line: number) => void }) {
  const inputs = describeInputs(r);
  const showsValues = r.kind !== "structure" && r.kind !== "custom" && !r.notRun;
  return (
    <div className={styles.failure}>
      {r.message ? <p className={styles.message}>{r.message}</p> : null}
      {showsValues ? (
        <dl className={styles.values}>
          {inputs ? (
            <div>
              <dt>{r.kind === "output" ? "Typed in" : "Called"}</dt>
              <dd>
                <pre>{inputs}</pre>
              </dd>
            </div>
          ) : null}
          {r.expected !== undefined ? (
            <div>
              <dt>Expected</dt>
              <dd>
                <pre>{show(r.expected)}</pre>
              </dd>
            </div>
          ) : null}
          {r.actual !== undefined && !r.error ? (
            <div>
              <dt>Yours</dt>
              <dd>
                <pre>{show(r.actual)}</pre>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {r.error ? <ErrorExplanation error={r.error} source={source} onShowLine={onShowLine} /> : null}
      {r.hint ? <p className={styles.hint}>{r.hint}</p> : null}
    </div>
  );
}

export function TestReport({
  report,
  progress,
  source,
  onShowLine,
  passLine,
}: {
  report: CheckReport | null;
  progress: { tests: TestMeta[]; results: TestResult[] } | null;
  source: string;
  onShowLine?: (line: number) => void;
  passLine?: string | null;
}) {
  if (progress) {
    const done = progress.results.filter(Boolean).length;
    return (
      <div className={styles.report} aria-live="polite">
        <p className={styles.summary}>
          Checking{progress.tests.length ? `: ${done} of ${progress.tests.length}` : ""}.
        </p>
      </div>
    );
  }
  if (!report) return null;
  if (report.status === "syntax-error" && report.syntaxError) {
    return (
      <div className={styles.report} aria-live="polite">
        <p className={[styles.summary, styles.bad].join(" ")}>
          <FailIcon /> Python couldn&apos;t read the code, so no checks ran.
        </p>
        <ErrorExplanation error={report.syntaxError} source={source} onShowLine={onShowLine} />
      </div>
    );
  }
  if (report.status === "crashed") {
    return (
      <div className={styles.report} aria-live="polite">
        <p className={[styles.summary, styles.bad].join(" ")}>
          <FailIcon /> Python stopped unexpectedly during the checks. Run the program to see why.
        </p>
      </div>
    );
  }
  const required = report.results.filter((r) => !r.stretch);
  const stretch = report.results.filter((r) => r.stretch);
  const passed = required.filter((r) => r.passed).length;
  const allPassed = passed === required.length;
  const firstFail = required.find((r) => !r.passed) ?? null;
  return (
    <div className={styles.report} aria-live="polite">
      <p className={[styles.summary, allPassed ? styles.good : styles.bad].join(" ")}>
        {allPassed ? <PassIcon /> : <FailIcon />}
        {allPassed ? "All checks passed." : `${passed} of ${required.length} checks passed.`}
      </p>
      {allPassed && passLine ? <p className={styles.passLine}>{passLine}</p> : null}
      {firstFail ? (
        <section className={styles.first} aria-label="First check that failed">
          <h3 className={styles.name}>{firstFail.name}</h3>
          <Failure r={firstFail} source={source} onShowLine={onShowLine} />
        </section>
      ) : null}
      <ul className={styles.list}>
        {required.map((r, i) => (
          <li key={i} className={r.passed ? styles.itemPass : styles.itemFail}>
            {r.passed || r === firstFail ? (
              <span className={styles.item}>
                {r.passed ? <PassIcon /> : <FailIcon />}
                <span>{r.name}</span>
                <span className="visually-hidden">{r.passed ? "passed" : "failed"}</span>
              </span>
            ) : (
              <details>
                <summary className={styles.item}>
                  <FailIcon />
                  <span>{r.name}</span>
                  <span className="visually-hidden">failed</span>
                </summary>
                <Failure r={r} source={source} onShowLine={onShowLine} />
              </details>
            )}
          </li>
        ))}
      </ul>
      {stretch.length ? (
        <div className={styles.stretch}>
          <p className="label">Stretch, not required</p>
          <ul className={styles.list}>
            {stretch.map((r, i) => (
              <li key={i}>
                <details>
                  <summary className={styles.item}>
                    {r.passed ? <PassIcon /> : <DotIcon />}
                    <span>{r.name}</span>
                    <span className="visually-hidden">{r.passed ? "passed" : "not yet"}</span>
                  </summary>
                  {!r.passed ? <Failure r={r} source={source} onShowLine={onShowLine} /> : null}
                </details>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
