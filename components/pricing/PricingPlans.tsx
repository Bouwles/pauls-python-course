"use client";

import { useState } from "react";
import Link from "next/link";
import { FREE_ACTS, PLANS, money } from "@/lib/plans";
import { Icon } from "../ui/Icon";
import { LinkButton } from "../ui/Button";
import styles from "./PricingPlans.module.css";

/**
 * Free and Pro side by side (REDESIGN-2.md 6), Pro outlined in sun, with its own monthly or
 * yearly switch. Then the promise and the Classroom line. No ribbons, crossed-out prices or
 * countdowns.
 */
export function PricingPlans({ freeProjects, proProjects, proActs, freeRange, level = 3 }: { freeProjects: number; proProjects: number; proActs: number; freeRange?: [string, string]; level?: 2 | 3 }) {
  const [yearly, setYearly] = useState(true);
  const H = level === 2 ? "h2" : "h3";
  const monthly = PLANS["pro-monthly"];
  const year = PLANS["pro-yearly"];
  const classroom = PLANS.classroom;
  return (
    <div className={styles.wrap}>
      <div className={styles.plans}>
        <article className={styles.plan} aria-labelledby="plan-free">
          <div className={styles.top}>
            <H id="plan-free" className={styles.name}>
              Free
            </H>
          </div>
          <div className={styles.price}>
            <span className={styles.amount}>{money(0)}</span>
          </div>
          <p className={styles.per}>For as long as you like. No card.</p>
          <LinkButton href="/job/shop-sign" variant="secondary" className={styles.cta}>
            Start the first project
          </LinkButton>
          <ul className={styles.list}>
            <li>
              <Icon name="check" />
              <span>
                All of Act I: {freeProjects} projects{freeRange ? `, from ${freeRange[0]} to ${freeRange[1]}` : null}
              </span>
            </li>
            <li>
              <Icon name="check" />
              <span>Morning Rounds review and Drills for Act I</span>
            </li>
            <li>
              <Icon name="check" />
              <span>Your Shelf, and downloads of everything you build</span>
            </li>
            <li>
              <Icon name="check" />
              <span>The Python Handbook</span>
            </li>
            <li>
              <Icon name="check" />
              <span>A look at the first project of every later Act</span>
            </li>
          </ul>
        </article>
        <article className={`${styles.plan} ${styles.pro}`} aria-labelledby="plan-pro">
          <div className={styles.top}>
            <H id="plan-pro" className={styles.name}>
              Pro
            </H>
            <div className={styles.switch} role="radiogroup" aria-label="Billing">
              <button type="button" role="radio" aria-checked={!yearly} className={styles.option} onClick={() => setYearly(false)}>
                Monthly
              </button>
              <button type="button" role="radio" aria-checked={yearly} className={styles.option} onClick={() => setYearly(true)}>
                Yearly
              </button>
            </div>
          </div>
          <div className={styles.price}>
            <span className={styles.amount}>{yearly ? money((year.price ?? 0) / 12) : money(monthly.price ?? 0)}</span>
            <span className={styles.unit}>a month</span>
          </div>
          <p className={styles.per} aria-live="polite">
            {yearly ? `Billed yearly, ${money(year.price ?? 0)}. Cancel any time.` : "Billed monthly. Cancel any time."}
          </p>
          <LinkButton href={`/pricing/checkout?plan=${yearly ? "pro-yearly" : "pro-monthly"}`} variant="primary" className={styles.cta}>
            Get Pro
          </LinkButton>
          <ul className={styles.list}>
            <li>
              <Icon name="check" />
              <span>Everything in Free</span>
            </li>
            <li>
              <Icon name="check" />
              <span>
                The other {proActs} Acts: {proProjects} more projects, from a Flask web app to a game-playing AI
              </span>
            </li>
            <li>
              <Icon name="check" />
              <span>Review and Drills for every idea in the course</span>
            </li>
            <li>
              <Icon name="check" />
              <span>Take It Home kits, and GitHub push for every project</span>
            </li>
            <li>
              <Icon name="check" />
              <span>The Arcade League, capstone reviews, and a certificate for each Act</span>
            </li>
          </ul>
        </article>
      </div>
      <div className={styles.notes}>
        <div className={styles.note}>
          <H className={styles.noteTitle}>Your work is always yours.</H>
          <p>If you stop paying, you keep everything you built and all your progress, to read, run and download. Only new Pro projects lock. {FREE_ACTS.size === 1 ? "Act I stays free." : null} No ads, anywhere.</p>
        </div>
        <div className={styles.note}>
          <H className={styles.noteTitle}>Classroom, for teachers and schools.</H>
          <p>
            A class dashboard, assignments and progress, with Pro for every student. {classroom.price ? `${money(classroom.price)} per student per year.` : "Priced per student per year: write to us."}{" "}
            <Link href="/teach">How it works</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
