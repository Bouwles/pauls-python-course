"use client";

import Link from "next/link";
import type { ActSummary, PlacementSummary } from "@/lib/content/types";
import type { JobProgressRow } from "@/lib/store/types";
import { useSession } from "@/lib/store/session";
import { castTitle, isYou } from "@/lib/playas";
import { duration } from "@/lib/display";
import { isShipped, nextJob } from "@/lib/progress-rules";
import { LinkButton } from "../ui/Button";
import { Card } from "../ui/Card";
import { ShelfObject } from "../art/ShelfObject";
import { Assignments } from "./Assignments";
import styles from "./DeskCards.module.css";

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/**
 * Beside the tower (under it on a phone): Continue, with the exact project and step; Morning
 * Rounds, with the cards due; and the Shelf. Then anything set by a class,
 * the Arcade League once its floor is open, and the placement test for anyone who's coded before.
 */
export function DeskCards({
  acts,
  placements,
  progress,
  steps,
  names,
  due,
  shipped,
  open,
  className,
}: {
  acts: ActSummary[];
  placements: PlacementSummary[];
  progress: Record<string, JobProgressRow>;
  steps: Record<string, [string, string][]>;
  names: Record<string, string>;
  due: number | null;
  shipped: number;
  open: Set<string>;
  className?: string;
}) {
  const { profile } = useSession();
  const playAs = profile.settings.playAs;
  const allJobs = acts.flatMap((a) => a.jobs);
  const last = profile.lastLocation;
  const lastJob = last ? allJobs.find((j) => j.id === last.jobId && j.status === "written") : undefined;
  const resume = lastJob && !isShipped(progress[lastJob.id]) ? lastJob : null;
  const next = resume ? null : nextJob(acts, progress, placements);
  const stepList = resume ? (steps[resume.id] ?? []) : [];
  const stepAt = resume && last ? stepList.findIndex(([id]) => id === last.stepId) : -1;
  const step = stepAt >= 0 ? stepList[stepAt] : undefined;
  const actOf = (number: number) => acts.find((a) => a.number === number);
  const arcade = actOf(8);
  const floor1 = actOf(2);
  const minutes = due ? Math.max(2, Math.round(Math.min(due, 10) * 0.7)) : 0;

  return (
    <aside className={[styles.side, className].filter(Boolean).join(" ")} aria-label="Your desk">
      {resume ? (
        <Card as="section" className={styles.card} aria-labelledby="desk-continue">
          <h2 id="desk-continue" className={styles.head}>
            Continue
          </h2>
          <div className={styles.project}>
            <ShelfObject jobId={resume.id} title={resume.title} client={resume.client} size={48} />
            <div className={styles.projectText}>
              <p className={styles.projectName}>{resume.title}</p>
              <p className={styles.meta}>{step ? `Step ${stepAt + 1} of ${stepList.length}: ${castTitle(step[1], playAs, names)}` : `Act ${resume.actNumber}, project ${resume.number}`}</p>
            </div>
          </div>
          <LinkButton variant="primary" href={`/job/${resume.id}${step ? `?step=${encodeURIComponent(step[0])}` : ""}`} className={styles.wide}>
            Back to your desk
          </LinkButton>
        </Card>
      ) : next ? (
        <Card as="section" className={styles.card} aria-labelledby="desk-continue">
          <h2 id="desk-continue" className={styles.head}>
            Next project
          </h2>
          <div className={styles.project}>
            <ShelfObject jobId={next.id} title={next.title} client={next.client} size={48} />
            <div className={styles.projectText}>
              <p className={styles.projectName}>{next.title}</p>
              <p className={styles.meta}>
                {isYou(next.client, playAs) ? "Your own project" : `For ${names[next.client] ?? cap(next.client)}`}. About {duration(next.estimatedMinutes)}.
              </p>
            </div>
          </div>
          <LinkButton variant="primary" href={`/job/${next.id}`} className={styles.wide}>
            Start
          </LinkButton>
        </Card>
      ) : (
        <Card as="section" className={styles.card} aria-labelledby="desk-continue">
          <h2 id="desk-continue" className={styles.head}>
            Continue
          </h2>
          <p className={styles.meta}>All shipped so far. Pick a floor.</p>
        </Card>
      )}

      <div className={styles.pair}>
        <Card as="section" className={styles.card} aria-labelledby="desk-rounds">
          <h2 id="desk-rounds" className={styles.head}>
            Morning Rounds
          </h2>
          {due === null ? (
            <p className={styles.meta}>Checking what&apos;s due.</p>
          ) : due === 0 ? (
            <p className={styles.meta}>Nothing due today.</p>
          ) : (
            <>
              <p className={styles.big}>
                {due} {due === 1 ? "card" : "cards"} due
              </p>
              <p className={styles.meta}>About {minutes} minutes.</p>
              <LinkButton variant="secondary" href="/rounds" className={styles.wide}>
                Start
              </LinkButton>
            </>
          )}
        </Card>

        <Card as="section" className={styles.card} aria-labelledby="desk-shelf">
          <h2 id="desk-shelf" className={styles.head}>
            Shelf
          </h2>
          {shipped === 0 ? (
            <p className={styles.meta}>Nothing here yet.</p>
          ) : (
            <>
              <p className={styles.big}>
                {shipped} {shipped === 1 ? "thing" : "things"} made
              </p>
              <p className={styles.meta}>Run, download or push any of them.</p>
              <LinkButton variant="secondary" href="/shelf" className={styles.wide}>
                Open the Shelf
              </LinkButton>
            </>
          )}
        </Card>
      </div>

      <Assignments jobs={allJobs} progress={progress} />

      {/* The League races entries in the browser, so it's on GitHub Pages too. */}
      {arcade && open.has(arcade.id) ? (
        <p className={styles.aside}>
          <Link href="/league">The Arcade League</Link>: this week&apos;s races on the Club Course.
        </p>
      ) : null}
      {profile.experience && profile.experience !== "none" && floor1 && !open.has(floor1.id) ? (
        <p className={styles.aside}>
          Written Python before? <Link href="/placement">The placement test</Link> opens the floors you already know.
        </p>
      ) : null}
    </aside>
  );
}
