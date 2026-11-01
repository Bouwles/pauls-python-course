"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { readAvatar } from "@/lib/avatar";
import { Avatar } from "../ui/Avatar";
import { SyncIndicator } from "../ui/SyncIndicator";
import { LinkButton } from "../ui/Button";
import { Wordmark } from "./Brand";
import styles from "./SiteHeader.module.css";

const LEARNER_LINKS = [
  ["/map", "Clocktower"],
  ["/rounds", "Morning Rounds"],
  ["/shelf", "Shelf"],
  ["/drills", "Drills"],
  ["/handbook", "Handbook"],
] as const;

const VISITOR_LINKS = [
  ["/syllabus", "Syllabus"],
  ["/pricing", "Pricing"],
  ["/handbook", "Handbook"],
] as const;

/**
 * The header for every page that isn't the Workbench (REDESIGN-2.md 6, REDESIGN3_PLAN.md P2): a
 * pixel bar with the wordmark, the nav in the pixel face, and on the right the save status and
 * your avatar, or "Log in" and "Start free".
 */
export function SiteHeader() {
  const { user, syncStatus, profile } = useSession();
  const path = usePathname();
  const here = (href: string) => (path === href || path.startsWith(`${href}/`) ? "page" : undefined);
  const links = user ? LEARNER_LINKS : VISITOR_LINKS;
  return (
    <header className={styles.header} data-guest={user ? undefined : true}>
      <Link href={user ? "/map" : "/"} className={styles.home}>
        <Wordmark size={32} className={styles.full} />
        <Wordmark size={32} short className={styles.short} />
      </Link>
      <nav aria-label="Main" className={styles.nav}>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={styles.link} aria-current={here(href)} id={href === "/shelf" ? "hud-shelf" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.right}>
        {user ? (
          <>
            <SyncIndicator status={syncStatus} />
            {/* Named for where it goes; the initials inside are a picture, kept out of the name (WCAG 2.5.3). */}
            <Link href="/settings" className={styles.avatar} aria-label={profile.displayName ? `Settings, signed in as ${profile.displayName}` : "Settings"} title="Settings" aria-current={here("/settings")}>
              <span aria-hidden="true" className={styles.avatarArt}>
                <Avatar name={profile.displayName} colour={readAvatar(profile.character).colour} look={profile.character} size={36} />
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.login} aria-current={here("/login")}>
              Log in
            </Link>
            <LinkButton href="/job/shop-sign" variant="primary" size="sm">
              Start free
            </LinkButton>
          </>
        )}
      </div>
    </header>
  );
}
