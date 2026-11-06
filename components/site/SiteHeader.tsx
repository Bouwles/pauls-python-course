"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { useMe } from "@/lib/useMe";
import { Avatar } from "../ui/Avatar";
import { SyncIndicator } from "../ui/SyncIndicator";
import { Wordmark } from "./Brand";
import styles from "./SiteHeader.module.css";

const LINKS = [
  ["/", "Clocktower"],
  ["/rounds", "Morning Rounds"],
  ["/shelf", "Shelf"],
  ["/drills", "Drills"],
  ["/class", "Class"],
  ["/handbook", "Handbook"],
] as const;

/**
 * The header for every page that isn't the Workbench: a pixel bar with the wordmark, the nav, and
 * on the right your avatar (and the save status when signed in). Everyone goes straight in: there's
 * no sign-up step, and an account is only for classes (a small "Log in", not on GitHub Pages).
 */
export function SiteHeader() {
  const { user, syncStatus, profile } = useSession();
  const me = useMe();
  const path = usePathname();
  const here = (href: string) => (path === href || (href !== "/" && path.startsWith(`${href}/`)) || (href === "/" && path === "/map") ? "page" : undefined);
  return (
    <header className={styles.header} data-guest={user ? undefined : true}>
      <Link href="/" className={styles.home}>
        <Wordmark size={32} className={styles.full} />
        <Wordmark size={32} short className={styles.short} />
      </Link>
      <nav aria-label="Main" className={styles.nav}>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className={styles.link} aria-current={here(href)} id={href === "/shelf" ? "hud-shelf" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.right}>
        {user ? <SyncIndicator status={syncStatus} /> : null}
        {/* Named for where it goes; the picture inside is kept out of the name (WCAG 2.5.3). */}
        <Link href="/settings" className={styles.avatar} aria-label={profile.displayName ? `Settings, ${user ? "signed in as " : ""}${profile.displayName}` : "Settings"} title="Settings" aria-current={here("/settings")}>
          <span aria-hidden="true" className={styles.avatarArt}>
            <Avatar name={me.name} colour={me.colour} look={me.avatar} who={me.who} size={36} />
          </span>
        </Link>
      </div>
    </header>
  );
}
