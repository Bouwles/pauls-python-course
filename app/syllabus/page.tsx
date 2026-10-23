import type { Metadata } from "next";
import Link from "next/link";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import styles from "@/components/legal/Syllabus.module.css";

export const metadata: Metadata = { title: "Syllabus" };

export default function Syllabus() {
  const index = getIndex();
  const concepts = getConcepts();
  const totalHours = index.acts.reduce((n, a) => n + a.hours, 0);
  return (
    <Page>
      <div className={styles.head}>
        <h1 className={styles.title}>The syllabus</h1>
        <p className={styles.lede}>
          Eight Acts, {index.acts.reduce((n, a) => n + a.jobs.length, 0)} jobs, about {totalHours} hours. From a first print statement to an agent that races crabs. The first three Acts are the Python and the computer science; the next four are data, machine learning, deep learning and reinforcement learning; the last is capstone projects.
        </p>
      </div>
      {index.acts.map((act) => (
        <section key={act.id} className={styles.act} aria-labelledby={`act-${act.id}`}>
          <div className={styles.actHead}>
            <p className={styles.actNo}>Act {act.number}</p>
            <h2 id={`act-${act.id}`} className={styles.actTitle}>
              {act.title}
            </h2>
            <p className={styles.actMeta}>
              {act.subject}. About {act.hours} hours.
            </p>
            <p className={styles.actSummary}>{act.summary}</p>
          </div>
          <ol className={styles.jobs}>
            {act.jobs.map((j) => (
              <li key={j.id} className={styles.job}>
                <span className={styles.jobTitle}>{j.title}</span>
                <span className={styles.jobFor}>for {index.characters[j.client]?.name ?? j.client}</span>
                <span className={styles.jobSummary}>{j.summary}</span>
                {j.conceptsIntroduced.length ? (
                  <span className={styles.concepts}>
                    {j.conceptsIntroduced.map((c) => concepts[c]?.title ?? c).join(" · ")}
                  </span>
                ) : null}
                {j.status !== "written" ? <span className={styles.writing}>Being written</span> : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className={styles.foot}>
        <Link href="/signup">Make an account</Link> to keep your work, or <Link href="/#job-1">try the first job</Link> without one.
      </p>
    </Page>
  );
}
