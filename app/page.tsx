import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { getSessionUser } from "@/lib/server/auth";
import { duration } from "@/lib/display";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Wordmark } from "@/components/site/Brand";
import { ClassScene } from "@/components/landing/ClassScene";
import { BrowserFrame } from "@/components/landing/BrowserFrame";
import { PlayableJob } from "@/components/landing/PlayableJob";
import { BuildGrid } from "@/components/landing/BuildGrid";
import { MeetTheClass } from "@/components/landing/MeetTheClass";
import { FloorDirectory } from "@/components/landing/FloorDirectory";
import { TowerStatic } from "@/components/clocktower/TowerStatic";
import { Faq } from "@/components/landing/Faq";
import { LinkButton } from "@/components/ui/Button";
import { Track } from "@/lib/track";
import styles from "@/components/landing/Landing.module.css";

const FAQ = [
  ["What does it cost?", "Nothing. Every Act is open: real-world Python, algorithms, data science, machine learning, deep learning and reinforcement learning, with Take It Home kits and a certificate for each Act."],
  ["Do I need to install anything?", "No. Python runs inside the page. Later Acts have Take It Home kits for your own computer, with a guide for Windows, macOS and Linux."],
  ["How long does it take?", "Act I is about 25 hours. The whole course is several hundred. Every project shows an honest time estimate."],
  ["What level does it reach?", "A strong first year of a computer science or AI degree: data structures and algorithms, NumPy and pandas, machine learning built from scratch, neural networks, a small transformer, and reinforcement learning."],
  ["Who is it for?", "Anyone 13 or older who wants to get properly good at Python. It assumes you're clever, not that you've written code before."],
  ["Can I teach a class with it?", "Yes. Make a class from the Teach page, share its code, set projects, and see how everyone's getting on."],
] as const;

export default async function Landing() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/map");
  const index = getIndex();
  const firstAct = index.acts[0]!;
  const firstId = firstAct.jobs[0]?.id ?? "shop-sign";
  const job = getJob(firstId)!;
  const conceptTitles = Object.fromEntries(Object.values(getConcepts()).map((c) => [c.id, c.title]));
  const names = Object.fromEntries(Object.values(index.characters).map((c) => [c.id, c.name]));
  const total = index.acts.reduce((n, a) => n + a.jobs.filter((j) => !j.placementFor).length, 0);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <Track event="visit-landing" />
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroText}>
            <Wordmark size={48} className={styles.heroMark} />
            <h1 id="hero-title" className={styles.headline}>
              {BRAND.tagline}
            </h1>
            <p className={styles.description}>{BRAND.description}</p>
            <div className={styles.ctas}>
              <LinkButton href={`/job/${firstId}`} variant="primary">
                Start the first project
              </LinkButton>
              <LinkButton href="/syllabus" variant="secondary">
                See all {total} projects
              </LinkButton>
            </div>
            <p className={styles.small}>No account needed to start.</p>
          </div>
          <div className={styles.heroArt}>
            <ClassScene names={names} greeting="Welcome to the Clocktower. We build real things here, starting with the sign on the front door." />
          </div>
        </section>

        <section id="try" className={`${styles.section} ${styles.band}`} aria-labelledby="try-title">
          <div className={styles.inner}>
            <div className={styles.head}>
              <h2 id="try-title" className={styles.h2}>
                Try it now
              </h2>
              <p className={styles.lede}>
                The first project, {job.title}, for real: the same Workbench as the course, with Python running in this page. About {duration(job.estimatedMinutes)}. Your work stays on this device until you make an account.
              </p>
            </div>
            <BrowserFrame address={`${BRAND.domain}/job/${firstId}`} className={styles.tryFrame} label="The first project, playable">
              <PlayableJob job={job} characters={index.characters} conceptTitles={conceptTitles} actTitle={firstAct.title} />
            </BrowserFrame>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="build-title">
          <div className={styles.inner}>
            <div className={styles.head}>
              <h2 id="build-title" className={styles.h2}>
                What you&apos;ll build
              </h2>
              <p className={styles.lede}>Real programs with plain names, shown here doing what they do. Each one goes on your Shelf, downloads as a folder with a README, and can go on GitHub.</p>
            </div>
            <BuildGrid names={names} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.band}`} aria-labelledby="class-title">
          <div className={styles.inner}>
            <div className={styles.head}>
              <h2 id="class-title" className={styles.h2}>
                Meet the class
              </h2>
              <p className={styles.lede}>Paul runs the course from the Clocktower, and Neil helps when you&apos;re stuck. Four classmates bring you the projects, and sometimes their own broken code to fix.</p>
            </div>
            <MeetTheClass names={names} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="tower-title">
          <div className={styles.inner}>
            <div className={styles.head}>
              <h2 id="tower-title" className={styles.h2}>
                The Clocktower
              </h2>
              <p className={styles.lede}>An old clocktower that Paul turned into a code school. Each floor is an Act, and the rooms fill up as you ship projects.</p>
            </div>
            <div className={styles.tower}>
              <div className={styles.towerArt}>
                <TowerStatic />
              </div>
              <FloorDirectory acts={index.acts} names={names} />
            </div>
          </div>
        </section>

        <section id="faq" className={`${styles.section} ${styles.band}`} aria-labelledby="faq-title">
          <div className={styles.inner}>
            <div className={styles.head}>
              <h2 id="faq-title" className={styles.h2}>
                Questions
              </h2>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
