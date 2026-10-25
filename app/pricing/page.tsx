import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { FREE_ACTS, PLANS, money } from "@/lib/plans";
import { getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { PricingTickets } from "@/components/pricing/PricingTickets";
import { AskAParent } from "@/components/pricing/AskAParent";
import styles from "@/components/pricing/Pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${BRAND.name} is free for all of Act I. Pro opens the rest of the course. No ads, and your work is always yours.`,
};

const FAQ: [string, string][] = [
  ["Can I cancel any time?", "Yes, from Settings, in two clicks. Pro stays on until the end of the period you've paid for, then you're back on the free plan."],
  ["What about refunds?", "If Pro isn't for you, ask within 14 days of paying and you get your money back. Write to us from the address at the bottom of this page."],
  ["What happens to my code if I stop paying?", "Nothing happens to it. Everything you built and all your progress stays yours, to read, run and download, and any project you started stays open. Only Pro projects you haven't started lock."],
  ["Is there a student price?", "Where a student discount is running, you'll see it at checkout. The whole of Act I is free whatever happens."],
  ["We're a school. How does it work?", "A teacher buys Classroom seats for a class. Students join with the class code and have Pro for as long as the seats last, with a class dashboard, assignments and progress for the teacher."],
  ["Why no ads?", "They'd get in the way while you're coding, and many people learning here are under 18. The course is paid for by Pro, and that's all."],
];

export default async function PricingPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const index = getIndex();
  const free = index.acts.filter((a) => FREE_ACTS.has(a.id));
  const pro = index.acts.filter((a) => !FREE_ACTS.has(a.id));
  const count = (acts: typeof index.acts) => acts.reduce((n, a) => n + a.jobs.filter((j) => !j.sidequest && !j.placementFor).length, 0);
  const forParent = sp.for === "parent";
  return (
    <Page>
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Pricing</h1>
          <p className={styles.lede}>Act I is free and needs no card. Pro opens the other {pro.length} Acts: {count(pro)} more projects, from a Flask web app to a game-playing AI.</p>
        </header>
        {forParent ? (
          <section className={`frame-paper ${styles.parent}`} aria-labelledby="parent-title">
            <h2 id="parent-title" className={styles.parentTitle}>
              For parents and guardians
            </h2>
            <p>
              Someone has asked if they can have {BRAND.name} Pro. {BRAND.name} teaches Python, the programming language, from the first line of code to building machine learning models. It&apos;s a game in the sense that it has a story and pixel art; every project is a real program.
            </p>
            <p>
              Pro is {money(PLANS["pro-monthly"].price ?? 0)} a month or {money(PLANS["pro-yearly"].price ?? 0)} a year. It can be cancelled at any time from Settings, and there are no ads and no in-game purchases. If it stops, everything they made stays theirs.
            </p>
            <p>To buy it, sign in to their account on this site, press Get Pro, and confirm that you&apos;re the parent or guardian.</p>
          </section>
        ) : null}
        <PricingTickets freeProjects={count(free)} proProjects={count(pro)} proActs={pro.length} />
        <AskAParent />
        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.faqTitle}>
            Questions
          </h2>
          <dl>
            {FAQ.map(([q, a]) => (
              <div key={q} className={styles.faqItem}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.contact}>
            Anything else: <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
          </p>
        </section>
      </div>
    </Page>
  );
}
