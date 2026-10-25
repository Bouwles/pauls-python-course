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
              <dt>Got</dt>
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
        {allPassed ? `All ${required.length} checks passed` : `${passed} of ${required.length} checks passed`}
      </p>
      {allPassed && passLine ? <p className={styles.passLine}>{passLine}</p> : null}
      <ul className={styles.list}>
        {required.map((r, i) => (
          <CheckRow key={i} r={r} open={r === firstFail} source={source} onShowLine={onShowLine} />
        ))}
      </ul>
      {stretch.length ? (
        <div className={styles.stretch}>
          <h3 className={styles.stretchTitle}>Stretch, not required</h3>
          <ul className={styles.list}>
            {stretch.map((r, i) => (
              <CheckRow key={i} r={r} open={false} source={source} onShowLine={onShowLine} stretch />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** One check: an icon, its name, and (for a failure) what went in, what was expected and what came out. */
function CheckRow({ r, open, source, onShowLine, stretch = false }: { r: TestResult; open: boolean; source: string; onShowLine?: (line: number) => void; stretch?: boolean }) {
  const state = r.passed ? "passed" : r.notRun ? "not run" : stretch ? "not yet" : "failed";
  const icon = r.passed ? <PassIcon /> : r.notRun || stretch ? <DotIcon /> : <FailIcon />;
  if (r.passed) {
    return (
      <li className={styles.row}>
        <span className={styles.item}>
          {icon}
          <span className={styles.itemName}>{r.name}</span>
          <span className="visually-hidden">{state}</span>
        </span>
      </li>
    );
  }
  return (
    <li className={[styles.row, styles.rowFail].join(" ")}>
      <details open={open}>
        <summary className={styles.item}>
          {icon}
          <span className={styles.itemName}>{r.name}</span>
          <span className="visually-hidden">{state}</span>
        </summary>
        <Failure r={r} source={source} onShowLine={onShowLine} />
      </details>
    </li>
  );
}
