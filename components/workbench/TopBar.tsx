"use client";

import { jobLabel } from "@/lib/display";
import Link from "next/link";
import type { Job } from "@/lib/content/types";
import type { SyncStatus } from "@/lib/store/sync";
import { SyncIndicator } from "../ui/SyncIndicator";
import styles from "./TopBar.module.css";

export function TopBar({ job, actTitle, syncStatus, guest, secondsSpent = 0 }: { job: Job; actTitle: string; syncStatus: SyncStatus; guest: boolean; secondsSpent?: number }) {
  const minutes = Math.floor(secondsSpent / 60);
  return (
    <header className={styles.bar}>
      <Link href={guest ? "/" : "/map"} className={styles.mark}>
        Paul&apos;s Python Course
      </Link>
      <p className={styles.crumbs}>
        <span className={styles.act}>{actTitle}</span>
        <span aria-hidden="true" className={styles.sep}>/</span>
        <span>
          {jobLabel(job)}, {job.title}
        </span>
      </p>
      <div className={styles.right}>
        {job.timedMinutes ? (
          // A suggested time, never enforced (University Readiness practises working to time).
          <p className={[styles.clock, minutes > job.timedMinutes ? styles.over : ""].join(" ")} title="Active time on this Job. Nothing happens when it runs out.">
            {minutes > job.timedMinutes ? `${minutes} min, ${job.timedMinutes} suggested` : `${minutes} of ${job.timedMinutes} min`}
          </p>
        ) : null}
        <SyncIndicator status={syncStatus} />
        {guest ? (
          <Link href="/signup?keep=1" className={styles.link}>
            Keep your work
          </Link>
        ) : (
          <nav className={styles.links} aria-label="Main">
            <Link href="/map" className={styles.link}>
              Map
            </Link>
            <Link href="/rounds" className={styles.link}>
              Rounds
            </Link>
            <Link href="/shelf" className={styles.link}>
              Shelf
            </Link>
            <Link href="/settings" className={styles.link}>
              Settings
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
