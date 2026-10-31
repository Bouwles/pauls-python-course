import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { FREE_ACTS, PLANS, money } from "@/lib/plans";
import { getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { AskAParent } from "@/components/pricing/AskAParent";
import { Faq } from "@/components/pricing/Faq";
import styles from "@/components/pricing/Pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${BRAND.name} is free for all of Act I. Pro opens the rest of the course. No ads, and your work is always yours.`,
};

const FAQ = [
  ["Can I cancel any time?", "Yes, from Settings, in two clicks. Pro stays on until the end of the period you've paid for, then you're back on the free plan."],
  ["What about refunds?", "If Pro isn't for you, ask within 14 days of paying and you get your money back. Write to us from the address at the bottom of this page."],
  ["What happens to my code if I stop paying?", "Nothing happens to it. Everything you built and all your progress stays yours, to read, run and download, and any project you started stays open. Only Pro projects you haven't started lock."],
  ["Is there a student price?", "Where a student discount is running, you'll see it at checkout. The whole of Act I is free whatever happens."],
  ["We're a school. How does it work?", "A teacher buys Classroom seats for a class. Students join with the class code and have Pro for as long as the seats last, with a class dashboard, assignments and progress for the teacher."],
  ["Why no ads?", "They'd get in the way while you're coding, and many people learning here are under 18. The course is paid for by Pro, and that's all."],
] as const;

export default async function PricingPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const index = getIndex();
  const projects = (acts: typeof index.acts) => acts.flatMap((a) => a.jobs.filter((j) => !j.sidequest && !j.placementFor));
  const free = projects(index.acts.filter((a) => FREE_ACTS.has(a.id)));
  const proActs = index.acts.filter((a) => !FREE_ACTS.has(a.id));
  const pro = projects(proActs);
  const forParent = sp.for === "parent";
  return (
    <Page>
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Pricing</h1>
          <p className={styles.lede}>
            Act I is free and needs no card. Pro opens the other {proActs.length} Acts: {pro.length} more projects, from a Flask web app to a game-playing AI.
          </p>
        </header>
        {forParent ? (
          <section className={styles.parent} aria-labelledby="parent-title">
            <h2 id="parent-title" className={styles.parentTitle}>
              For parents and guardians
            </h2>
            <p>
              Someone has asked if they can have {BRAND.name} Pro. {BRAND.name} teaches Python, the programming language, from the first line of code to building machine learning models. It has a cast of characters and a story, and every project is a real program.
            </p>
            <p>
              Pro is {money(PLANS["pro-monthly"].price ?? 0)} a month or {money(PLANS["pro-yearly"].price ?? 0)} a year. It can be cancelled at any time from Settings, and there are no ads and no in-app purchases. If it stops, everything they made stays theirs.
            </p>
            <p>To buy it, sign in to their account on this site, press Get Pro, and confirm that you&apos;re the parent or guardian.</p>
          </section>
        ) : null}
        <div className={styles.section}>
          <PricingPlans freeProjects={free.length} proProjects={pro.length} proActs={proActs.length} freeRange={free.length ? [free[0]!.title, free.at(-1)!.title] : undefined} level={2} />
          <AskAParent />
        </div>
        <section id="faq" className={styles.section} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.sectionTitle}>
            Questions
          </h2>
          <Faq items={FAQ} />
          <p className={styles.contact}>
            Anything else: <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
          </p>
        </section>
      </div>
    </Page>
  );
}
