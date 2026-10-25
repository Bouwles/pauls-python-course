import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getConcepts, getIndex, getJob } from "@/lib/content/server";
import { getSessionUser } from "@/lib/server/auth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroScene } from "@/components/landing/HeroScene";
import { PlayableJob } from "@/components/landing/PlayableJob";
import { LandingMap } from "@/components/landing/LandingMap";
import styles from "@/components/landing/Landing.module.css";

const HOW = [
  { file: "ask.png", title: "The Ask", text: "Someone in town comes in with a problem and a clear spec: what goes in, what comes out, one example run." },
  { file: "predict.png", title: "Predict", text: "Before you run new code, you say what it will do. Each wrong answer is written for a particular mistake, so the feedback explains the one you made." },
  { file: "pips.png", title: "Pip's Version", text: "Pip, the other apprentice, has a go first. His bugs are the ones beginners really make. You find them and fix them." },
  { file: "make.png", title: "Make", text: "You write the program yourself, from a nearly empty file. Real tests check it, with values you haven't seen." },
  { file: "shelf.png", title: "The Shelf", text: "Everything you ship goes on your Shelf. Run it again, download it, or export the lot as a repository." },
];

const FAQ = [
  ["Is it free?", "Yes. If that ever changes, everything you have made stays yours and can be exported."],
  ["Do I need to install anything?", "No. Python runs inside the page. From Act VI you will set up Python on your own computer for PyTorch, with a guide for Windows, macOS and Linux."],
  ["How long does it take?", "An hour or two a day gets you through the first three Acts (the Python, then the algorithms) in ten to fourteen weeks. The whole course is several hundred hours. Every job shows an honest time estimate."],
  ["What level does it reach?", "A strong first year of a computer science or AI degree: data structures and algorithms, NumPy and pandas, classical machine learning built from scratch, neural networks with backpropagation, a small transformer, and reinforcement learning up to DQN and policy gradients."],
  ["Who is it for?", "Anyone 13 or older who wants to get properly good at Python, especially if a computer science or AI degree is next. It assumes you are clever, not that you have written code before."],
];

export default async function Landing() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/map");
  const index = getIndex();
  const job = getJob("sign-on-the-door")!;
  const concepts = getConcepts();
  const conceptTitles = Object.fromEntries(Object.values(concepts).map((c) => [c.id, c.title]));
  const how = HOW.filter((h) => fs.existsSync(path.join(process.cwd(), "public", "how", h.file)));
  const harbour = index.acts[0]!;
  const written = index.acts.reduce((n, a) => n + a.jobs.filter((j) => j.status === "written").length, 0);
  const total = index.acts.reduce((n, a) => n + a.jobs.length, 0);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.headline}>Saltmarsh is falling apart.</h1>
            <p className={styles.lede}>
              Its engineer left decades ago and took the manual with her. Half the town still runs on her old Python scripts, and they are breaking one by one. You are the new apprentice at Moss&apos;s repair shop.
            </p>
            <p className={styles.lede}>
              Every job is a real program for someone in town: a till for the bakery, a tide table for the harbour, a weather model for the observatory. By the last one you will have written a neural network and taught a crab to race.
            </p>
            <div className={styles.ctaRow}>
              <a href="#job-1" className={styles.cta}>
                Try the first job
              </a>
              <Link href="/signup" className={styles.secondary}>
                Make an account
              </Link>
            </div>
            <p className={styles.small}>Nothing to install. Python runs in the page.</p>
          </div>
          <figure className={styles.heroScene}>
            <HeroScene />
            <figcaption className={styles.caption}>Moss, and the radio he has been meaning to fix for forty years.</figcaption>
          </figure>
        </section>

        <section id="job-1" className={styles.section} aria-labelledby="job1-title">
          <div className={styles.sectionHead}>
            <h2 id="job1-title" className={styles.h2}>
              Job 1: {job.title}
            </h2>
            <p className={styles.sectionLede}>
              The sign blew off Moss&apos;s door again. About twenty minutes, no account needed. Your work stays on this device until you decide to keep it.
            </p>
          </div>
          <PlayableJob job={job} characters={index.characters} conceptTitles={conceptTitles} actTitle={harbour.title} />
        </section>

        <section className={styles.section} aria-labelledby="town-title">
          <div className={styles.sectionHead}>
            <h2 id="town-title" className={styles.h2}>
              Eight districts, from the quay to the lighthouse
            </h2>
            <p className={styles.sectionLede}>
              Each district is an Act. They open one at a time, and the town comes back to life as you fix it: lights on, signs repainted, smoke from the chimneys.
            </p>
          </div>
          <LandingMap />
          <ol className={styles.acts}>
            {index.acts.map((a) => (
              <li key={a.id} className={styles.act}>
                <p className={styles.actNo}>Act {a.number}</p>
                <h3 className={styles.actTitle}>{a.title}</h3>
                <p className={styles.actSubject}>
                  {a.subject}. About {a.hours} hours.
                </p>
                <p className={styles.actSummary}>{a.summary}</p>
              </li>
            ))}
          </ol>
          <details className={styles.syllabus}>
            <summary>
              The full syllabus: {total} jobs{written < total ? ` (${written} written so far)` : ""}
            </summary>
            <div className={styles.syllabusBody}>
              {index.acts.map((a) => (
                <div key={a.id}>
                  <h3 className={styles.syllabusAct}>
                    Act {a.number}, {a.title}
                  </h3>
                  <ol className={styles.syllabusJobs}>
                    {a.jobs.map((j) => (
                      <li key={j.id}>
                        <span className={styles.jobName}>{j.title}</span> <span className={styles.jobFor}>for {index.characters[j.client]?.name ?? j.client}.</span> {j.summary}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </details>
        </section>

        {how.length ? (
          <section className={styles.section} aria-labelledby="how-title">
            <div className={styles.sectionHead}>
              <h2 id="how-title" className={styles.h2}>
                How a job goes
              </h2>
              <p className={styles.sectionLede}>Every job is a short sequence of steps. Early on there are many; by Act III the Workbench is mostly empty, because you no longer need it.</p>
            </div>
            <ol className={styles.how}>
              {how.map((h, i) => (
                <li key={h.file} className={styles.howItem}>
                  <Image src={`/how/${h.file}`} alt={`Screenshot: ${h.title}`} width={720} height={450} className={styles.howShot} />
                  <div>
                    <p className={styles.howNo}>{i + 1}</p>
                    <h3 className={styles.howTitle}>{h.title}</h3>
                    <p className={styles.howText}>{h.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section id="faq" className={styles.section} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>
            Questions
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
