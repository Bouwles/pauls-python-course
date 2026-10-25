"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { jobLabel } from "@/lib/display";
import { defaultLook } from "@/lib/pixel/learner";
import type { Job } from "@/lib/content/types";
import type { SyncStatus } from "@/lib/store/sync";
import { useSession } from "@/lib/store/session";
import { SyncIndicator } from "../ui/SyncIndicator";
import { PixelIcon, type IconName } from "../ui/PixelIcon";
import { LinkButton } from "../ui/Button";
import { LearnerHead } from "../world/LearnerSprite";
import styles from "./Hud.module.css";

function IconLink({ href, icon, label, id }: { href: string; icon: IconName; label: string; id?: string }) {
  return (
    <Link href={href} className={styles.iconLink} title={label} id={id}>
      <PixelIcon name={icon} />
      <span className="visually-hidden">{label}</span>
    </Link>
  );
}

/** The Workbench HUD (REDESIGN.md 5.1): the mark, a breadcrumb, and the save, Shelf, map and settings icons. */
export function Hud({ job, actTitle, syncStatus, guest, secondsSpent = 0 }: { job: Job; actTitle: string; syncStatus: SyncStatus; guest: boolean; secondsSpent?: number }) {
  const { profile } = useSession();
  const minutes = Math.floor(secondsSpent / 60);
  return (
    <header className={styles.hud}>
      <Link href={guest ? "/" : "/map"} className={styles.home}>
        <PixelIcon name="mark" />
        <span className={styles.brand}>{BRAND.name}</span>
      </Link>
      <nav aria-label="Breadcrumb" className={styles.crumbs}>
        <ol>
          <li>
            <Link href="/map">{actTitle.replace(/^The /, "")}</Link>
          </li>
          <li aria-current="page">
            <span className={styles.job}>
              {jobLabel(job)}
              <span className={styles.jobTitle}>: {job.title}</span>
            </span>
          </li>
        </ol>
      </nav>
      <div className={styles.right}>
        {job.timedMinutes ? (
          // A suggested time, never enforced (University Readiness practises working to time).
          <p className={[styles.clock, minutes > job.timedMinutes ? styles.over : ""].join(" ")} title="Active time on this job. Nothing happens when it runs out.">
            {minutes}/{job.timedMinutes} min
          </p>
        ) : null}
        <SyncIndicator status={syncStatus} />
        <IconLink href="/shelf" icon="shelf" label="Shelf" id="hud-shelf" />
        <IconLink href="/map" icon="map" label="Map" />
        <IconLink href="/settings" icon="settings" label="Settings" />
        {guest ? (
          <LinkButton href="/signup?keep=1" variant="primary" size="sm" className={styles.save}>
            Save my progress
          </LinkButton>
        ) : (
          <Link href="/settings#character" className={styles.avatar} title="Your character">
            <LearnerHead look={profile.character ?? defaultLook()} scale={2} />
            <span className="visually-hidden">Your character</span>
          </Link>
        )}
      </div>
    </header>
  );
}
