// A student's latest Take It Home report or capstone milestone, as a teacher sees it.
import type { Job } from "@/lib/content/types";
import type { StudentSubmission } from "@/lib/server/classes";
import type { TestReport } from "@/lib/takehome";
import { FailIcon, PassIcon } from "../ui/Icons";
import styles from "./Teach.module.css";

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const MAX_CASES = 40;

export function HandIn({ submission, job, when }: { submission: StudentSubmission; job: Job | null; when: string }) {
  const r = submission.results;
  const step = job?.steps.find((s) => s.id === submission.stepId);
  return (
    <div className={styles.files}>
      <h3 className={styles.h3}>Latest hand-in</h3>
      {r.milestone ? <Milestone results={r} checklist={step && step.type === "milestone" ? step.checklist : []} when={when} /> : <Report results={r} kind={submission.kind} when={when} />}
    </div>
  );
}

function Report({ results, kind, when }: { results: Record<string, unknown>; kind: string; when: string }) {
  const report = results.report as TestReport | undefined;
  if (!report) return <p className={styles.meta}>Handed in {when}, with no test report.</p>;
  const how = kind === "local" ? "from the command-line tool" : "as an upload";
  const cases = report.cases.slice(0, MAX_CASES);
  return (
    <>
      <p className={styles.meta}>
        Take It Home, handed in {when} {how}. {report.passed} of {report.total} tests passed{results.passes ? ", which ships the Job" : ""}.
      </p>
      {cases.length ? (
        <ul className={styles.results} aria-label="Test results">
          {cases.map((c, i) => (
            <li key={`${c.name}-${i}`}>
              <span className={c.outcome === "passed" ? styles.pass : c.outcome === "skipped" ? styles.meta : styles.fail}>{c.outcome === "passed" ? <PassIcon /> : <FailIcon />}</span>
              <span>
                <code>{c.name}</code> <span className={styles.meta}>{c.outcome}</span>
                {c.message && c.outcome !== "passed" ? <span className={styles.meta}>: {c.message.slice(0, 200)}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {report.cases.length > MAX_CASES ? <p className={styles.meta}>And {report.cases.length - MAX_CASES} more.</p> : null}
    </>
  );
}

function Milestone({ results, checklist, when }: { results: Record<string, unknown>; checklist: { id: string; textHtml: string }[]; when: string }) {
  const checks = (results.checks ?? {}) as Record<string, boolean>;
  const ticked = Object.values(checks).filter(Boolean).length;
  const total = Math.max(checklist.length, Object.keys(checks).length);
  const plan = typeof results.plan === "string" ? results.plan.trim() : "";
  const link = typeof results.link === "string" && /^https:\/\/\S+$/.test(results.link) ? results.link : null;
  return (
    <>
      <p className={styles.meta}>
        Milestone, handed in {when}. {ticked} of {total} checklist items ticked.
      </p>
      {checklist.length ? (
        <ul className={styles.results} aria-label="Checklist">
          {checklist.map((c) => (
            <li key={c.id}>
              <span className={checks[c.id] ? styles.pass : styles.fail}>{checks[c.id] ? <PassIcon /> : <FailIcon />}</span>
              <span>
                {text(c.textHtml)} <span className="visually-hidden">{checks[c.id] ? "Ticked." : "Not ticked."}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {plan ? (
        <figure className={styles.file}>
          <figcaption className={styles.fileName}>Their test plan</figcaption>
          <pre className={styles.pre} tabIndex={0} style={{ whiteSpace: "pre-wrap" }}>
            {plan}
          </pre>
        </figure>
      ) : null}
      {link ? (
        <p className={styles.meta}>
          Their link:{" "}
          <a href={link} rel="nofollow noopener noreferrer">
            {link}
          </a>
        </p>
      ) : null}
    </>
  );
}
