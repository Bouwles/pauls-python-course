"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { ACCOUNTS } from "@/lib/supabase/project";
import { useMe } from "@/lib/useMe";
import { Avatar } from "../ui/Avatar";
import { LinkButton } from "../ui/Button";
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

/** With accounts, a signed-in learner also has their friends. */
const MEMBER_LINKS = [...LINKS.slice(0, 5), ["/friends", "Friends"], LINKS[5]] as const;

/** With accounts, someone signed out sees what they can read, and the way in. */
const VISITOR_LINKS = [
  ["/about", "About"],
  ["/syllabus", "Syllabus"],
  ["/handbook", "Handbook"],
] as const;

/**
 * The header for every page that isn't the Workbench: a pixel bar with the wordmark, the nav, and
 * on the right your avatar (and the save status when signed in). Without accounts everyone goes
 * straight in. With them (GitHub Pages and Supabase), someone signed out gets Log in and Sign up
 * on the right instead, and the pages they can read.
 */
export function SiteHeader() {
  const { user, syncStatus, profile, ready } = useSession();
  const me = useMe();
  const path = usePathname();
  const visitor = ACCOUNTS && !user;
  const links = !ACCOUNTS ? LINKS : user ? MEMBER_LINKS : VISITOR_LINKS;
  const here = (href: string) => (path === href || (href !== "/" && path.startsWith(`${href}/`)) || (href === "/" && path === "/map") ? "page" : undefined);
  return (
    <header className={styles.header} data-guest={user ? undefined : true}>
      <Link href="/" className={styles.home}>
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
        {visitor ? (
          // Held back until it's known who this is, so a signed-in learner never sees them flash.
          <span className={styles.way} style={ready ? undefined : { visibility: "hidden" }}>
            <LinkButton href="/login" size="sm" variant="ghost">
              Log in
            </LinkButton>
            <LinkButton href="/signup" size="sm" variant="primary">
              Sign up
            </LinkButton>
          </span>
        ) : null}
        {user ? <SyncIndicator status={syncStatus} /> : null}
        {/* Named for where it goes; the picture inside is kept out of the name (WCAG 2.5.3). */}
        {visitor ? null : (
          <Link href="/settings" className={styles.avatar} aria-label={profile.displayName ? `Settings, ${user ? "signed in as " : ""}${profile.displayName}` : "Settings"} title="Settings" aria-current={here("/settings")}>
            <span aria-hidden="true" className={styles.avatarArt}>
              <Avatar name={me.name} colour={me.colour} look={me.avatar} who={me.who} size={36} />
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
