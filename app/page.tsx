import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { FREE_ACTS } from "@/lib/plans";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { getSessionUser } from "@/lib/server/auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroScene } from "@/components/landing/HeroScene";
import { Wordmark } from "@/components/landing/Wordmark";
import { PlayableJob } from "@/components/landing/PlayableJob";
import { LandingMap } from "@/components/landing/LandingMap";
import { BuildShelf } from "@/components/landing/BuildShelf";
import { PricingTickets } from "@/components/pricing/PricingTickets";
import { LinkButton } from "@/components/ui/Button";
import { Track } from "@/lib/track";
import styles from "@/components/landing/Landing.module.css";

const FAQ = [
  ["What's free?", `All of Act I: thirteen real projects, review and drills for them, your Shelf, downloads, and the Python Handbook. No card, no trial clock.`],
  ["What does Pro add?", "The other Acts: real-world Python, algorithms, data science, machine learning, deep learning and reinforcement learning, with Take It Home kits, GitHub push and a certificate for each Act."],
  ["What happens to my code if I stop paying?", "Nothing. You keep everything you built and all your progress, to read, run and download. Only new Pro projects lock."],
  ["Do I need to install anything?", "No. Python runs inside the page. Later Acts have Take It Home kits for your own computer, with a guide for Windows, macOS and Linux."],
  ["How long does it take?", "Act I is about 25 hours. The whole course is several hundred. Every project shows an honest time estimate."],
  ["What level does it reach?", "A strong first year of a computer science or AI degree: data structures and algorithms, NumPy and pandas, machine learning built from scratch, neural networks, a small transformer, and reinforcement learning."],
  ["Who is it for?", "Anyone 13 or older who wants to get properly good at Python. It assumes you're clever, not that you've written code before."],
  ["Is there a student or school price?", "Schools and teachers can buy Classroom seats. Student pricing, where it's offered, is applied at checkout."],
];

export default async function Landing() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/map");
  const index = getIndex();
  const job = getJob("shop-sign")!;
  const concepts = getConcepts();
  const conceptTitles = Object.fromEntries(Object.values(concepts).map((c) => [c.id, c.title]));
  const harbour = index.acts[0]!;
  const free = index.acts.filter((a) => FREE_ACTS.has(a.id));
  const pro = index.acts.filter((a) => !FREE_ACTS.has(a.id));
  const count = (acts: typeof index.acts) => acts.reduce((n, a) => n + a.jobs.filter((j) => !j.sidequest && !j.placementFor).length, 0);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <Track event="visit-landing" />
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroScene}>
            <HeroScene />
          </div>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.wordmark}>
              <Wordmark scale={4} />
            </h1>
            <p className={styles.tagline}>{BRAND.tagline}</p>
            <p className={styles.lede}>
              A town that runs on old Python scripts, and they&apos;re breaking. You&apos;re the new apprentice at Moss&apos;s repair shop. Every job is a real program: a bill splitter, a to-do list, a weather app, a spam filter, a neural network.
            </p>
            <div className={styles.ctaRow}>
              <LinkButton href="#job-1" variant="primary">
                Start the first job (free, no sign-up)
              </LinkButton>
              <LinkButton href="/syllabus" variant="quiet">
                See every project
              </LinkButton>
            </div>
          </div>
        </section>

        <section id="job-1" className={styles.band} aria-labelledby="job1-title">
          <div className={styles.bandHead}>
            <h2 id="job1-title" className={styles.h2}>
              Try it here
            </h2>
            <p className={styles.bandLede}>The real first job, not a video of it. About twenty minutes. Your work stays on this device until you decide to keep it.</p>
          </div>
          <div className={styles.window}>
            <div className={styles.titleBar}>
              <span className={styles.titleDots} aria-hidden="true" />
              <span>
                Job 1: {job.title}
              </span>
              <span className={styles.titleWhere}>Moss&apos;s workshop</span>
            </div>
            <PlayableJob job={job} characters={index.characters} conceptTitles={conceptTitles} actTitle={harbour.title} />
          </div>
        </section>

        <section className={styles.band} aria-labelledby="build-title">
          <div className={styles.bandHead}>
            <h2 id="build-title" className={styles.h2}>
              What you&apos;ll build
            </h2>
            <p className={styles.bandLede}>Real programs with plain names, the kind people build and use. Each one goes on your Shelf, downloads as a folder with a README, and can go on GitHub.</p>
          </div>
          <BuildShelf />
        </section>

        <section className={styles.band} aria-labelledby="town-title">
          <div className={styles.bandHead}>
            <h2 id="town-title" className={styles.h2}>
              The town, district by district
            </h2>
            <p className={styles.bandLede}>Each district is an Act. The town comes back to life as you fix it: lamps on, shutters up, smoke from the chimneys.</p>
          </div>
          <div className={styles.townGrid}>
            <div className={styles.townMap}>
              <LandingMap />
            </div>
            <ol className={styles.acts}>
              {index.acts.map((a) => (
                <li key={a.id} className={styles.act}>
                  <h3 className={styles.actTitle}>
                    <span className={styles.actNo}>{a.number}</span> {a.title}
                    {FREE_ACTS.has(a.id) ? <span className={styles.freeTag}>Free</span> : null}
                  </h3>
                  <p className={styles.actSubject}>
                    {a.subject}. About {a.hours} hours.
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <details className={styles.syllabus}>
            <summary>The full syllabus</summary>
            <div className={styles.syllabusBody}>
              {index.acts.map((a) => (
                <div key={a.id}>
                  <h3 className={styles.syllabusAct}>
                    Act {a.number}: {a.title}
                  </h3>
                  <ol className={styles.syllabusJobs}>
                    {a.jobs
                      .filter((j) => !j.placementFor)
                      .map((j) => (
                        <li key={j.id}>{j.title}</li>
                      ))}
                  </ol>
                </div>
              ))}
            </div>
          </details>
        </section>

        <section id="pricing" className={styles.band} aria-labelledby="pricing-title">
          <div className={styles.bandHead}>
            <h2 id="pricing-title" className={styles.h2}>
              Pricing
            </h2>
            <p className={styles.bandLede}>Act I is free. Pro opens the rest of the town.</p>
          </div>
          <PricingTickets freeProjects={count(free)} proProjects={count(pro)} proActs={pro.length} />
        </section>

        <section id="faq" className={styles.band} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>
            FAQ
          </h2>
          <dl className={styles.faq}>
            {FAQ.map(([q, a]) => (
              <div key={q} className={styles.faqItem}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
