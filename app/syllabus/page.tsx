import type { Metadata } from "next";
import { castColour, floorFor } from "@/lib/cast";
import { duration } from "@/lib/display";
import { getConcepts, getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { Badge } from "@/components/ui/Badge";
import { FloorResident } from "@/components/site/FloorResident";
import { LinkButton } from "@/components/ui/Button";
import styles from "@/components/legal/Syllabus.module.css";

export const metadata: Metadata = { title: "Syllabus" };

const WORDS: Record<number, string> = { 8: "Eight", 9: "Nine", 10: "Ten" };

/** The floor's resident colour, for the small square beside each Act in the contents. */
function square(act: number): React.CSSProperties {
  const who = floorFor(act)?.residents[0] ?? "paul";
  return { background: `var(--c-${who}, ${castColour(who).face})` };
}

export default function Syllabus() {
  const index = getIndex();
  const concepts = getConcepts();
  const totalHours = index.acts.reduce((n, a) => n + a.hours, 0);
  const totalJobs = index.acts.reduce((n, a) => n + a.jobs.filter((j) => !j.placementFor).length, 0);
  const first = index.acts[0]?.jobs[0];
  const names = Object.fromEntries(Object.values(index.characters).map((c) => [c.id, c.name]));
  return (
    <Page>
      <header className={styles.head}>
        <h1 className={styles.title}>The syllabus</h1>
        <p className={styles.lede}>
          {WORDS[index.acts.length] ?? index.acts.length} Acts, {totalJobs} projects, about {totalHours} hours, from a first print statement to an agent that wins at the Arcade. The first four Acts are Python and computer science; the next four are data, machine learning, deep learning and reinforcement learning; the last is capstone projects.
        </p>
        <nav className={styles.contents} aria-label="Acts">
          <ol>
            {index.acts.map((act) => (
              <li key={act.id}>
                <a href={`#act-${act.id}`}>
                  <span className={styles.square} style={square(act.number)} aria-hidden="true" />
                  <span className={styles.contentsNo}>Act {act.number}</span>
                  <span>{act.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <div className={styles.acts}>
        {index.acts.map((act) => {
          const floor = floorFor(act.number);
          const jobs = act.jobs.filter((j) => !j.placementFor);
          return (
            <section key={act.id} id={`act-${act.id}`} className={styles.act} aria-labelledby={`act-${act.id}-title`}>
              <div className={styles.actHead}>
                <FloorResident act={act.number} names={names} className={styles.resident} />
                <p className={styles.actLabel}>
                  Act {act.number}
                  {floor ? `, ${floor.label.toLowerCase()}` : null}
                </p>
                <h2 id={`act-${act.id}-title`} className={styles.actTitle}>
                  {act.title}
                </h2>
                <p className={styles.actMeta}>
                  <span>
                    {act.subject}. About {act.hours} hours, {jobs.length} projects.
                  </span>
                </p>
                <p className={styles.actSummary}>{act.summary}</p>
              </div>
              <ol className={styles.jobs}>
                {jobs.map((j) => (
                  <li key={j.id} className={styles.job}>
                    <span className={styles.jobNo} aria-hidden="true">
                      {j.sidequest ? "" : j.number}
                    </span>
                    <div className={styles.jobText}>
                      <h3 className={styles.jobTitle}>
                        <span>{j.title}</span>
                        {j.sidequest ? <Badge tone="neutral">Sidequest</Badge> : null}
                        {j.status !== "written" ? <Badge tone="info">Being written</Badge> : null}
                      </h3>
                      <p className={styles.jobSummary}>{j.summary}</p>
                      <p className={styles.jobMeta}>
                        For {index.characters[j.client]?.name ?? j.client}, about {duration(j.estimatedMinutes)}
                      </p>
                      {j.conceptsIntroduced.length ? (
                        <ul className={styles.concepts} aria-label="Ideas it introduces">
                          {j.conceptsIntroduced.map((c) => (
                            <li key={c}>
                              <Badge tone="neutral" className={styles.concept}>
                                {concepts[c]?.title ?? c}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
      <div className={styles.foot}>
        <div className={styles.footButtons}>
          <LinkButton href={`/job/${first?.id ?? "shop-sign"}`} variant="primary">
            Start the first project
          </LinkButton>
        </div>
      </div>
    </Page>
  );
}
