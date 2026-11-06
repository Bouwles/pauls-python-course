"use client";

import type { CheckReport, TestMeta, TestResult } from "@/lib/python/protocol";
import { Icon } from "../ui/Icon";
import { ErrorExplanation } from "./Console";
import { charDiff, firstDifference, type DiffPart } from "./diff";
import styles from "./TestReport.module.css";

function describeInputs(t: TestMeta): string | null {
  if (t.kind === "function" || t.kind === "variable") return t.call ?? null;
  if (t.kind === "output" && t.inputs && t.inputs.length) return t.inputs.join("\n");
  return null;
}

function trimEnd(value: string): string {
  return value.replace(/\n$/, "");
}

/** Highlighted text: the parts only one side has are marked, and a marked line break shows as ↵. */
function Marked({ parts, tone }: { parts: DiffPart[]; tone: "missing" | "extra" }) {
  return (
    <>
      {parts.map((p, i) =>
        p.same ? (
          <span key={i}>{p.text}</span>
        ) : (
          <mark key={i} className={styles[tone]}>
            {p.text.replace(/\n/g, "↵\n")}
          </mark>
        ),
      )}
    </>
  );
}

function Failure({ r, source, onShowLine }: { r: TestResult; source: string; onShowLine?: (line: number) => void }) {
  const inputs = describeInputs(r);
  const showsValues = r.kind !== "structure" && r.kind !== "custom" && !r.notRun;
  const expected = r.expected !== undefined ? trimEnd(r.expected) : undefined;
  const got = r.actual !== undefined && !r.error ? trimEnd(r.actual) : undefined;
  const diff = expected !== undefined && got !== undefined ? charDiff(expected, got) : null;
  const where = expected !== undefined && got !== undefined ? firstDifference(expected, got) : null;
  return (
    <div className={styles.failure}>
      {r.message ? <p className={styles.message}>{r.message}</p> : null}
      {showsValues && (inputs || expected !== undefined || got !== undefined) ? (
        <div className={styles.compare}>
          {inputs ? (
            <div className={styles.col}>
              <p className={styles.colLabel}>{r.kind === "output" ? "Input" : "Called"}</p>
              <pre className={styles.value}>{inputs}</pre>
            </div>
          ) : null}
          {expected !== undefined ? (
            <div className={styles.col}>
              <p className={styles.colLabel}>Expected</p>
              <pre className={styles.value}>{diff ? <Marked parts={diff.expected} tone="missing" /> : expected || "(nothing)"}</pre>
            </div>
          ) : null}
          {got !== undefined ? (
            <div className={styles.col}>
              <p className={styles.colLabel}>Got</p>
              <pre className={styles.value}>{got === "" ? <span className={styles.nothing}>(nothing)</span> : diff ? <Marked parts={diff.got} tone="extra" /> : got}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
      {where && got ? (
        <p className={styles.where}>
          The first difference is on line {where.line}, character {where.column}.
        </p>
      ) : null}
      {r.error ? <ErrorExplanation error={r.error} source={source} onShowLine={onShowLine} /> : null}
      {r.hint ? (
        <p className={styles.hint}>
          <Icon name="hint" size={18} />
          <span>{r.hint}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Under the summary, a pixel block for each check: green passed, red failed, empty still to run. */
function Progress({ passed, failed, total }: { passed: number; failed: number; total: number }) {
  if (!total) return null;
  return (
    <div className={styles.progress} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < passed ? styles.barPass : i < passed + failed ? styles.barFail : styles.barRest} />
      ))}
    </div>
  );
}

/**
 * Check results: "3 of 5 checks passed" over a pixel block per check, every
 * check in a list, and the first failing one open with what went in, what was expected and what
 * came out side by side, the differences marked character by character.
 */
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
    const results = progress.results.filter(Boolean);
    const passed = results.filter((r) => r.passed).length;
    return (
      <div className={styles.report} aria-live="polite">
        <div className={styles.head}>
          <p className={styles.summary}>
            <Icon name="loader" spin />
            Checking{progress.tests.length ? `: ${results.length} of ${progress.tests.length}` : ""}
          </p>
          <Progress passed={passed} failed={results.length - passed} total={progress.tests.length} />
        </div>
      </div>
    );
  }
  if (!report) {
    return (
      <div className={styles.report}>
        <p className={styles.idle}>Press Check to run your program against the checks.</p>
      </div>
    );
  }
  if (report.status === "syntax-error" && report.syntaxError) {
    return (
      <div className={styles.report} aria-live="polite">
        <p className={[styles.summary, styles.bad].join(" ")}>
          <Icon name="cross" />
          Python couldn&apos;t read the code, so no checks ran
        </p>
        <ErrorExplanation error={report.syntaxError} source={source} onShowLine={onShowLine} />
      </div>
    );
  }
  if (report.status === "crashed") {
    return (
      <div className={styles.report} aria-live="polite">
        <p className={[styles.summary, styles.bad].join(" ")}>
          <Icon name="cross" />
          Python stopped unexpectedly during the checks. Run the program to see why
        </p>
      </div>
    );
  }
  const required = report.results.filter((r) => !r.stretch);
  const stretch = report.results.filter((r) => r.stretch);
  const passed = required.filter((r) => r.passed).length;
  const failed = required.filter((r) => !r.passed && !r.notRun).length;
  const allPassed = passed === required.length;
  const firstFail = required.find((r) => !r.passed) ?? null;
  return (
    <div className={styles.report} aria-live="polite">
      <div className={styles.head}>
        <p className={[styles.summary, allPassed ? styles.good : styles.bad].join(" ")}>
          <Icon name={allPassed ? "tick" : "cross"} />
          {allPassed ? `All ${required.length} checks passed` : `${passed} of ${required.length} checks passed`}
        </p>
        <Progress passed={passed} failed={failed} total={required.length} />
      </div>
      {allPassed && passLine ? <p className={styles.passLine}>{passLine}</p> : null}
      <ul className={styles.list}>
        {required.map((r, i) => (
          <CheckRow key={i} r={r} open={r === firstFail} source={source} onShowLine={onShowLine} />
        ))}
      </ul>
      {stretch.length ? (
        <div className={styles.stretch}>
          <h2 className={styles.stretchTitle}>Stretch, not required</h2>
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

/** One check: an icon, its name, and for a failure what went in, what was expected and what came out. */
function CheckRow({ r, open, source, onShowLine, stretch = false }: { r: TestResult; open: boolean; source: string; onShowLine?: (line: number) => void; stretch?: boolean }) {
  const state = r.passed ? "passed" : r.notRun ? "not run" : stretch ? "not yet" : "failed";
  const icon = r.passed ? <Icon name="tick" className={styles.iconPass} /> : r.notRun || stretch ? <Icon name="dash" className={styles.iconRest} /> : <Icon name="cross" className={styles.iconFail} />;
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
          <Icon name="caretRight" size={16} className={styles.caret} />
        </summary>
        <Failure r={r} source={source} onShowLine={onShowLine} />
      </details>
    </li>
  );
}
