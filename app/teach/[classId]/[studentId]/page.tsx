import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { getClass, studentDetail } from "@/lib/server/classes";
import { getJob, getJobSummary } from "@/lib/content/server";
import { duration, lastActive, shortDate, statusLabel } from "@/lib/teaching";
import { Page } from "@/components/site/Page";
import { LearnerSprite } from "@/components/world/LearnerSprite";
import { HandIn } from "@/components/teach/HandIn";
import { RemoveStudent } from "@/components/teach/RemoveStudent";
import styles from "@/components/teach/Teach.module.css";

async function load(classId: string, studentId: string, jobId: string | null) {
  const user = await getSessionUser().catch(() => null);
  if (!user) return null;
  const db = await getDb();
  const cls = await getClass(db, user.id, classId);
  const student = cls ? await studentDetail(db, user.id, classId, studentId, jobId) : null;
  return { cls, student };
}

export async function generateMetadata(props: PageProps<"/teach/[classId]/[studentId]">): Promise<Metadata> {
  const { classId, studentId } = await props.params;
  const found = await load(classId, studentId, null);
  return { title: found?.student && found.cls ? `${found.student.name}, ${found.cls.name}` : "Student" };
}

export default async function StudentPage(props: PageProps<"/teach/[classId]/[studentId]">) {
  const { classId, studentId } = await props.params;
  const search = await props.searchParams;
  const chosen = typeof search.job === "string" ? search.job : null;
  const found = await load(classId, studentId, chosen);
  if (!found) redirect("/login");
  const { cls, student } = found;
  if (!cls || !student) notFound();
  const now = Date.now();

  const order = (id: string) => {
    const j = getJobSummary(id);
    return j ? j.actNumber * 1000 + j.number : 1e9;
  };
  const jobs = [...student.jobs].sort((a, b) => order(a.jobId) - order(b.jobId));
  const shipped = jobs.filter((j) => j.status === "shipped" || j.status === "shipped-stretch").length;
  const latest = Math.max(0, ...jobs.map((j) => j.updatedAt)) || null;
  const job = student.jobId ? getJob(student.jobId) : null;
  const jobTitle = job?.title ?? student.jobId ?? "";
  const stepIndex = (id: string) => job?.steps.findIndex((s) => s.id === id) ?? -1;
  const steps = [...new Set(student.files.map((f) => f.stepId))].sort((a, b) => stepIndex(a) - stepIndex(b));

  return (
    <Page>
      <div className={styles.page}>
        <header className={styles.head}>
          <Link href={`/teach/${cls.id}`} className={styles.back}>
            {cls.name}
          </Link>
          <div className={styles.who}>
            {student.character ? <LearnerSprite look={student.character} scale={3} label={`${student.name}'s character`} /> : null}
            <div className={styles.head}>
              <h1 className={styles.title}>{student.name}</h1>
              <p className={styles.meta}>
                Joined {shortDate(student.joinedAt, now)}. Last active: {lastActive(latest, now).toLowerCase()}. {shipped} {shipped === 1 ? "Job" : "Jobs"} shipped.
              </p>
            </div>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="jobs-title">
          <h2 id="jobs-title" className={styles.h2}>
            Jobs
          </h2>
          {jobs.length === 0 ? (
            <p className={styles.empty}>Nothing started yet.</p>
          ) : (
            <div className={styles.tableWrap} role="region" aria-labelledby="jobs-title" tabIndex={0}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Job</th>
                    <th scope="col">Status</th>
                    <th scope="col" className={styles.num}>
                      Steps passed
                    </th>
                    <th scope="col" className={styles.num}>
                      Attempts
                    </th>
                    <th scope="col" className={styles.num}>
                      Hints
                    </th>
                    <th scope="col" className={styles.num}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => {
                    const summary = getJobSummary(j.jobId);
                    const here = j.jobId === student.jobId;
                    return (
                      <tr key={j.jobId} className={here ? styles.selected : undefined}>
                        <th scope="row" className={styles.jobCell}>
                          <Link href={`/teach/${cls.id}/${student.id}?job=${j.jobId}`} aria-current={here ? "true" : undefined} scroll={false}>
                            {summary?.title ?? j.jobId}
                          </Link>{" "}
                          {summary ? (
                            <span className={styles.meta}>
                              Act {summary.actNumber}, Job {summary.number}
                            </span>
                          ) : null}
                        </th>
                        <td className={styles.nowrap}>{statusLabel(j.status)}</td>
                        <td className={styles.num}>
                          {summary ? `${j.stepsPassed} of ${summary.stepCount}` : j.stepsPassed}
                          {j.stepsSeenSolution ? <span className={styles.meta}>, {j.stepsSeenSolution} {j.stepsSeenSolution === 1 ? "solution" : "solutions"} seen</span> : null}
                        </td>
                        <td className={styles.num}>{j.attempts}</td>
                        <td className={styles.num}>{j.hints}</td>
                        <td className={styles.num}>{duration(j.seconds)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {jobs.length ? <p className={styles.meta}>Pick a Job to see the code saved for it and anything handed in.</p> : null}
        </section>

        {student.jobId ? (
          <section className={styles.section} aria-labelledby="code-title">
            <h2 id="code-title" className={styles.h2}>
              Code for {jobTitle}
            </h2>
            {student.files.length === 0 ? (
              <p className={styles.empty}>No code saved for this Job yet.</p>
            ) : (
              <div className={styles.files}>
                <p className={styles.meta}>The latest saved version of each file. Read-only.</p>
                {steps.map((stepId) => (
                  <div key={stepId} className={styles.files}>
                    <h3 className={styles.h3}>{job?.steps.find((s) => s.id === stepId)?.title ?? stepId}</h3>
                    {student.files
                      .filter((f) => f.stepId === stepId)
                      .map((f) => (
                        <figure key={`${f.stepId}/${f.filename}`} className={styles.file}>
                          <figcaption className={styles.fileName}>
                            <code>{f.filename}</code>
                            <span className={styles.meta}>saved {shortDate(f.updatedAt, now)}</span>
                          </figcaption>
                          <pre className={styles.pre} tabIndex={0} aria-label={`${f.filename}, ${job?.steps.find((s) => s.id === stepId)?.title ?? stepId}`}>
                            <code>{f.content || " "}</code>
                          </pre>
                        </figure>
                      ))}
                  </div>
                ))}
              </div>
            )}
            {student.submission ? <HandIn submission={student.submission} job={job} when={shortDate(student.submission.createdAt, now)} /> : null}
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="membership-title">
          <h2 id="membership-title" className={styles.h2}>
            In this class
          </h2>
          <RemoveStudent classId={cls.id} className={cls.name} studentId={student.id} name={student.name} />
        </section>
      </div>
    </Page>
  );
}
