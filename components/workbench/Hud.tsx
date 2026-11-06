"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import type { Job } from "@/lib/content/types";
import type { SyncStatus } from "@/lib/store/sync";
import { useMe } from "@/lib/useMe";
import { Mark } from "../site/Brand";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";
import { SyncIndicator } from "../ui/SyncIndicator";
import styles from "./Hud.module.css";

/** "Project 2 of 13", or what an unnumbered project is. */
export function projectPosition(job: Pick<Job, "number" | "sidequest" | "placementFor">, total?: number): string {
  if (job.placementFor) return "Placement";
  if (job.sidequest) return "Sidequest";
  return total ? `Project ${job.number} of ${total}` : `Project ${job.number}`;
}

/**
 * The Workbench header (REDESIGN-2.md 4.1): the logo and name, where you are ("Act 1 / Bill
 * Splitter", "Project 2 of 13"), then the save status, the Clocktower and you.
 */
export function Hud({ job, actProjects, syncStatus, guest, secondsSpent = 0 }: { job: Job; actTitle?: string; actProjects?: number; syncStatus: SyncStatus; guest: boolean; secondsSpent?: number }) {
  const me = useMe();
  const minutes = Math.floor(secondsSpent / 60);
  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.home} aria-label={BRAND.name}>
        <Mark size={32} />
        <span className={styles.brand} aria-hidden="true">
          {BRAND.name}
        </span>
      </Link>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <ol>
          <li>
            <Link href="/map" className={styles.act}>
              Act {job.actNumber}
            </Link>
          </li>
          <li aria-current="page" className={styles.job}>
            {job.title}
          </li>
        </ol>
        <p className={styles.position}>{projectPosition(job, actProjects)}</p>
      </nav>
      <div className={styles.right}>
        {job.timedMinutes ? (
          // A suggested time, never enforced (University Readiness practises working to time).
          <p className={[styles.clock, minutes > job.timedMinutes ? styles.over : ""].join(" ")} title="Active time on this project. Nothing happens when it runs out.">
            <Icon name="timer" />
            {minutes}/{job.timedMinutes} min
          </p>
        ) : null}
        <SyncIndicator status={syncStatus} />
        <Link href="/" className={styles.iconLink} title="The Clocktower">
          <Icon name="map" />
          <span className="visually-hidden">The Clocktower</span>
        </Link>
        {/* Everyone, guest or not: progress is kept as you go, so there's nothing to sign up for. */}
        <Link href="/settings" className={styles.avatar} title="You and your settings">
          <Avatar name={me.name} colour={me.colour} look={me.avatar} who={me.who} size={36} />
          <span className="visually-hidden">Your settings</span>
        </Link>
      </div>
    </header>
  );
}
