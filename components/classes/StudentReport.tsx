"use client";

import type { ProjectReport, Report } from "@/lib/classes/types";
import { duration, lastActive, statusLabel } from "@/lib/teaching";
import { Badge } from "../ui/Badge";
import teach from "../teach/Teach.module.css";
import { jobLabel, type CourseIndex } from "./shared";
import styles from "./Classes.module.css";

export const statusTone = (s: ProjectReport["status"]) => (s === "shipped" || s === "shipped-stretch" ? "shipped" : s === "in-progress" ? "progress" : "neutral");

/** What was handed in from the student's own computer: Take It Home results, and milestones signed off with the link they showed. */
function HandIns({ project }: { project: ProjectReport }) {
  if (!project.handIns?.length) return null;
  return (
    <span className={styles.handIns}>
      {project.handIns.map((h) => (
        <span key={h.stepId} className={teach.meta}>
          {h.kind === "tests"
            ? `Take It Home: ${h.passed} of ${h.total} tests passed${h.done ? ", handed in" : ", not finished yet"}.`
            : `Milestone signed off${h.passed !== null && h.total ? `, ${h.passed} of ${h.total} tests passed` : ""}.`}
          {h.link ? (
            <>
              {" "}
              <a href={h.link} target="_blank" rel="noopener noreferrer nofollow" className={styles.handInLink}>
                {h.link.replace(/^https:\/\//, "")}
              </a>
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

export const stepsText = (p: ProjectReport) => (p.total ? `${p.passed} of ${p.total} steps` : `${p.passed} ${p.passed === 1 ? "step" : "steps"}`);

/** Each set project in a report: how far, with what help, for how long, and when. */
export function ProjectTable({ report, course, labelledBy }: { report: Report; course: CourseIndex; labelledBy: string }) {
  if (report.projects.length === 0) return <p className={teach.empty}>No projects were set when this was sent.</p>;
  return (
    <div className={teach.tableWrap} role="region" aria-labelledby={labelledBy} tabIndex={0}>
      <table className={teach.table}>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Status</th>
            <th scope="col" className={teach.num}>
              Steps passed
            </th>
            <th scope="col" className={teach.num}>
              Hints
            </th>
            <th scope="col" className={teach.num}>
              Time
            </th>
            <th scope="col" className={teach.hideNarrow}>
              Last worked on
            </th>
          </tr>
        </thead>
        <tbody>
          {report.projects.map((p) => {
            const { name, place } = jobLabel(course, p.jobId);
            return (
              <tr key={p.jobId}>
                <th scope="row" className={teach.jobCell}>
                  {name} <span className={teach.meta}>{place}</span>
                  <HandIns project={p} />
                </th>
                <td className={teach.nowrap}>
                  <Badge tone={statusTone(p.status)}>{statusLabel(p.status)}</Badge>
                </td>
                <td className={teach.num}>
                  {p.total ? `${p.passed} of ${p.total}` : p.passed}
                  {p.seen ? <span className={teach.meta}>, {p.seen} {p.seen === 1 ? "solution" : "solutions"} seen</span> : null}
                </td>
                <td className={teach.num}>{p.hints}</td>
                <td className={teach.num}>{duration(p.seconds)}</td>
                <td className={[teach.nowrap, teach.hideNarrow].join(" ")}>{lastActive(p.lastWorked, report.sentAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The student's code for each set project's Build step, read only. */
export function CodeList({ report, course, level = 3 }: { report: Report; course: CourseIndex; level?: 3 | 4 | 5 }) {
  const H = `h${level}` as "h3" | "h4" | "h5";
  if (report.projects.length === 0) return <p className={teach.empty}>No code: nothing was set when this was sent.</p>;
  return (
    <div className={teach.files}>
      {report.projects.map((p) => {
        const { name } = jobLabel(course, p.jobId);
        return (
          <div key={p.jobId} className={teach.files}>
            <H className={level === 5 ? styles.h5 : teach.h3}>{name}</H>
            {p.codeLeftOut ? (
              <p className={teach.empty}>Left out to keep the link a sensible length.</p>
            ) : p.code.length === 0 ? (
              <p className={teach.empty}>No code saved for the Build step yet.</p>
            ) : (
              p.code.map((f) => (
                <figure key={f.name} className={teach.file}>
                  <figcaption className={teach.fileName}>
                    <code>{f.name}</code>
                    <span className={teach.meta}>for the Build step</span>
                  </figcaption>
                  <pre className={`code-dark ${teach.pre}`} tabIndex={0} aria-label={`${f.name}, ${name}`}>
                    <code>{f.content || " "}</code>
                  </pre>
                </figure>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
