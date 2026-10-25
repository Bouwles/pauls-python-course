import { BRAND } from "@/lib/brand";
import { Page } from "../site/Page";
import { LinkButton } from "../ui/Button";
import { PixelIcon } from "../ui/PixelIcon";
import { Track } from "@/lib/track";
import styles from "./ProGate.module.css";

/** A Pro project opened without Pro: what it is, what Pro is, and no nagging (REDESIGN.md 8.4). */
export function LockedProject({ title, actTitle, actNumber }: { title: string; actTitle: string; actNumber: number }) {
  return (
    <Page narrow>
      <Track event="view-paywall" />
      <section className={`frame-panel ${styles.locked}`} aria-labelledby="locked-title">
        <span className={styles.lock} aria-hidden="true">
          <PixelIcon name="lock" scale={3} />
        </span>
        <h1 id="locked-title" className={styles.lockedTitle}>
          {title}
        </h1>
        <p>
          This project is in Act {actNumber}, {actTitle}, which is part of {BRAND.name} Pro. Act I is free, and everything you&apos;ve made there stays yours whatever you decide.
        </p>
        <div className={styles.row}>
          <LinkButton href="/pricing/checkout?plan=pro-yearly" variant="primary">
            Get Pro
          </LinkButton>
          <LinkButton href="/map" variant="quiet">
            Not now
          </LinkButton>
        </div>
      </section>
    </Page>
  );
}
