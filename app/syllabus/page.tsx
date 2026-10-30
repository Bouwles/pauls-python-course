import type { Metadata } from "next";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { LinkButton } from "@/components/ui/Button";
import styles from "@/components/legal/Syllabus.module.css";

export const metadata: Metadata = { title: "Syllabus" };

const ACT_WORDS: Record<number, string> = { 8: "Eight", 9: "Nine", 10: "Ten" };

export default function Syllabus() {
  const index = getIndex();
  const concepts = getConcepts();
  const totalHours = index.acts.reduce((n, a) => n + a.hours, 0);
  return (
    <Page>
      <header className={styles.head}>
        <h1 className={styles.title}>The syllabus</h1>
        <p className={styles.lede}>
          {ACT_WORDS[index.acts.length] ?? index.acts.length} Acts, {index.acts.reduce((n, a) => n + a.jobs.length, 0)} jobs, about {totalHours} hours. From a first print statement to an agent that races crabs. The first four Acts are the Python and the computer science; the next four are data, machine learning, deep learning and reinforcement learning; the last is capstone projects.
        </p>
        <nav className={styles.contents} aria-label="Acts">
          <ol>
            {index.acts.map((act) => (
              <li key={act.id}>
                <a href={`#act-${act.id}`}>
                  <span className={styles.actNo}>Act {act.number}</span> {act.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <div className={styles.acts}>
        {index.acts.map((act) => (
          <section key={act.id} id={`act-${act.id}`} className={`frame-panel ${styles.act}`} aria-labelledby={`act-${act.id}-title`}>
            <div className={styles.actHead}>
              <h2 id={`act-${act.id}-title`} className={styles.actTitle}>
                <span className={styles.actNo}>Act {act.number}</span> {act.title}
              </h2>
              <p className={styles.actMeta}>
                {act.subject}. About {act.hours} hours, {act.jobs.length} jobs.
              </p>
              <p className={styles.actSummary}>{act.summary}</p>
            </div>
            <ol className={styles.jobs}>
              {act.jobs.map((j) => (
                <li key={j.id} className={styles.job}>
                  <span className={styles.jobNo} aria-hidden="true">
                    {j.number}
                  </span>
                  <div className={styles.jobText}>
                    <p className={styles.jobTitle}>
                      {j.title} <span className={styles.jobFor}>for {index.characters[j.client]?.name ?? j.client}</span>
                    </p>
                    <p className={styles.jobSummary}>{j.summary}</p>
                    {j.conceptsIntroduced.length ? <p className={styles.concepts}>{j.conceptsIntroduced.map((c) => concepts[c]?.title ?? c).join(" · ")}</p> : null}
                  </div>
                  {j.status !== "written" ? <span className={styles.writing}>Being written</span> : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <div className={styles.foot}>
        <p className={styles.footText}>Try the first job without an account, or make one to keep your work.</p>
        <div className={styles.footButtons}>
          <LinkButton href="/#job-1" variant="primary">
            Try the first job
          </LinkButton>
          <LinkButton href="/signup" variant="quiet">
            Make an account
          </LinkButton>
        </div>
      </div>
    </Page>
  );
}
