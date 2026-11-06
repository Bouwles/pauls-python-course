"use client";

import { useState } from "react";
import { isoWeek } from "@/lib/league/course";
import type { TaughtClass } from "@/lib/classes/types";
import { duration, lastActive, shortDate, statusLabel } from "@/lib/teaching";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import teach from "../teach/Teach.module.css";
import { jobLabel, playingAs, StudentFace, type CourseIndex } from "./shared";
import { CodeList, statusTone, stepsText } from "./StudentReport";
import styles from "./Classes.module.css";

/**
 * The register: each student's latest progress, a column for each set project, and their code
 * to read underneath. Each row is the last progress link added for that student.
 */
export function Register({ cls, course, names, onRemove }: { cls: TaughtClass; course: CourseIndex; names: Record<string, string>; onRemove: (studentId: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const students = [...cls.register].sort((a, b) => a.student.name.localeCompare(b.student.name));
  const reading = students.find((r) => r.student.id === open) ?? null;
  const titleId = `register-${cls.id}`;
  const now = Date.now();
  // The League column: each student's entry this week, if their latest progress link had one.
  const week = isoWeek(new Date(now));
  const league = students.some((r) => r.league);

  return (
    <div className={teach.files}>
      <h3 id={titleId} className={teach.h3}>
        Register
      </h3>
      {students.length === 0 ? (
        <p className={teach.empty}>No progress in yet.</p>
      ) : (
        <>
          <div className={teach.tableWrap} role="region" aria-labelledby={titleId} tabIndex={0}>
            <table className={teach.table}>
              <caption className="visually-hidden">Each student&apos;s latest progress in {cls.name}, by set project.</caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  {cls.assignments.map((a) => (
                    <th key={a.jobId} scope="col">
                      {jobLabel(course, a.jobId).name}
                    </th>
                  ))}
                  {league ? <th scope="col">League this week</th> : null}
                  <th scope="col">Sent</th>
                  <th scope="col" className={teach.end}>
                    <span className="visually-hidden">Code</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((r) => {
                  const as = playingAs(r.student, names);
                  return (
                    <tr key={r.student.id} className={open === r.student.id ? teach.selected : undefined}>
                      <th scope="row" className={teach.strongCell}>
                        <span className={teach.student}>
                          <StudentFace student={r.student} />
                          <span className={styles.studentCell}>
                            <span>{r.student.name}</span>
                            <span className={teach.meta}>
                              {r.shipped} shipped in all{as ? `. ${as}` : ""}
                            </span>
                          </span>
                        </span>
                      </th>
                      {cls.assignments.map((a) => {
                        const p = r.projects.find((x) => x.jobId === a.jobId);
                        return (
                          <td key={a.jobId}>
                            {p ? (
                              <span className={styles.cell}>
                                <Badge tone={statusTone(p.status)}>{statusLabel(p.status)}</Badge>
                                <span className={styles.cellMeta}>{stepsText(p)}</span>
                                <span className={styles.cellMeta}>{duration(p.seconds)}</span>
                              </span>
                            ) : (
                              <span className={teach.meta}>Set after this was sent</span>
                            )}
                          </td>
                        );
                      })}
                      {league ? (
                        <td>
                          {r.league?.week === week ? (
                            <span className={styles.cell}>
                              <span>{r.league.score.toFixed(2)}</span>
                              <span className={styles.cellMeta}>
                                {r.league.finished} of {r.league.races} finished
                              </span>
                            </span>
                          ) : (
                            <span className={teach.meta}>Not this week</span>
                          )}
                        </td>
                      ) : null}
                      <td className={teach.nowrap}>
                        <span title={new Date(r.sentAt).toLocaleString("en-GB")}>{lastActive(r.sentAt, now)}</span>
                      </td>
                      <td className={teach.end}>
                        <Button size="sm" variant="ghost" icon="code" aria-expanded={open === r.student.id} aria-controls={`code-${cls.id}`} onClick={() => setOpen(open === r.student.id ? null : r.student.id)}>
                          {open === r.student.id ? "Hide the code" : `Read ${r.student.name}'s code`}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div id={`code-${cls.id}`}>
        {reading ? (
          <section className={styles.detail} aria-labelledby={`code-title-${cls.id}`}>
            <div className={styles.detailHead}>
              <h4 id={`code-title-${cls.id}`} className={teach.h3}>
                {reading.student.name}&apos;s code
              </h4>
              <span className={teach.meta}>Sent {shortDate(reading.sentAt, now)}</span>
            </div>
            <CodeList report={reading} course={course} level={5} />
            <div className={styles.dangerRow}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onRemove(reading.student.id);
                  setOpen(null);
                }}
              >
                Take {reading.student.name} off the register
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
