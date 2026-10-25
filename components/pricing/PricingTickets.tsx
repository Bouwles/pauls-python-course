"use client";

import { useState } from "react";
import { FREE_ACTS, PLANS, money } from "@/lib/plans";
import { LinkButton } from "../ui/Button";
import styles from "./PricingTickets.module.css";

/**
 * The two plans as paper tickets (REDESIGN.md 8.4), with a monthly or yearly switch, then the
 * Classroom line and the promise. No ribbons, no crossed-out prices, no countdowns.
 */
export function PricingTickets({ freeProjects, proProjects, proActs }: { freeProjects: number; proProjects: number; proActs: number }) {
  const [yearly, setYearly] = useState(true);
  const monthly = PLANS["pro-monthly"];
  const year = PLANS["pro-yearly"];
  const classroom = PLANS.classroom;
  return (
    <div className={styles.wrap}>
      <div className={styles.switch} role="radiogroup" aria-label="Billing">
        <button role="radio" aria-checked={!yearly} className={styles.option} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button role="radio" aria-checked={yearly} className={styles.option} onClick={() => setYearly(true)}>
          Yearly
        </button>
      </div>
      <div className={styles.tickets}>
        <article className={`frame-paper ${styles.ticket}`} aria-labelledby="plan-free">
          <h3 id="plan-free" className={styles.name}>
            Free
          </h3>
          <p className={styles.price}>{money(0)}</p>
          <p className={styles.per}>for as long as you like</p>
          <ul className={styles.list}>
            <li>All of Act I: {freeProjects} projects, from a shop sign to an expense tracker</li>
            <li>Morning Rounds review and Drills for Act I</li>
            <li>Your Shelf, and downloads of everything you build</li>
            <li>The Python Handbook</li>
            <li>A look at the first job of every later Act</li>
          </ul>
          <LinkButton href="/job/shop-sign" variant="quiet">
            Start the first job
          </LinkButton>
        </article>
        <article className={`frame-paper ${styles.ticket}`} aria-labelledby="plan-pro">
          <h3 id="plan-pro" className={styles.name}>
            Pro
          </h3>
          <p className={styles.price}>{yearly ? money((year.price ?? 0) / 12) : money(monthly.price ?? 0)}</p>
          <p className={styles.per}>{yearly ? `a month, billed yearly (${money(year.price ?? 0)})` : "a month. Cancel any time."}</p>
          <ul className={styles.list}>
            <li>
              The other {proActs} Acts: {proProjects} more projects, from a Flask web app to a game-playing AI
            </li>
            <li>Review and Drills for every idea in the course</li>
            <li>Take It Home kits, and GitHub push for every project</li>
            <li>The Arcade League, capstone reviews, and a certificate for each Act</li>
          </ul>
          <LinkButton href={`/pricing/checkout?plan=${yearly ? "pro-yearly" : "pro-monthly"}`} variant="primary">
            Get Pro
          </LinkButton>
        </article>
      </div>
      <p className={styles.classroom}>
        <strong>Classroom.</strong> For teachers and schools: a class dashboard, assignments and progress, with Pro for every student.{" "}
        {classroom.price ? `${money(classroom.price)} per student per year.` : "Priced per student per year: write to us."}{" "}
        <a href="/teach">How it works</a>
      </p>
      <p className={styles.promise}>
        <strong>Your work is always yours.</strong> If you stop paying, you keep everything you built and all your progress, to read, run and download. Only new Pro projects lock.
      </p>
      <p className={styles.small}>{FREE_ACTS.size === 1 ? "Act I is free and needs no card." : null} No ads, anywhere.</p>
    </div>
  );
}
