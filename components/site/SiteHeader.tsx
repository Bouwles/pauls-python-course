"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useSession } from "@/lib/store/session";
import { defaultLook } from "@/lib/pixel/learner";
import { SyncIndicator } from "../ui/SyncIndicator";
import { PixelIcon } from "../ui/PixelIcon";
import { LinkButton } from "../ui/Button";
import { LearnerHead } from "../world/LearnerSprite";
import styles from "./SiteHeader.module.css";

const LEARNER_LINKS = [
  ["/map", "Map"],
  ["/rounds", "Morning Rounds"],
  ["/shelf", "Shelf"],
  ["/drills", "Drills"],
  ["/handbook", "Handbook"],
] as const;

/** The HUD for every page that isn't the Workbench: the mark, pixel-font tabs, save status and you. */
export function SiteHeader() {
  const { user, syncStatus, ready, profile } = useSession();
  const path = usePathname();
  const here = (href: string) => (path === href || path.startsWith(`${href}/`) ? "page" : undefined);
  return (
    <header className={styles.header}>
      <Link href={user ? "/map" : "/"} className={styles.mark}>
        <PixelIcon name="mark" />
        <span className={styles.brand}>{BRAND.name}</span>
      </Link>
      <nav aria-label="Main" className={styles.nav}>
        {user
          ? LEARNER_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={styles.link} aria-current={here(href)} id={href === "/shelf" ? "hud-shelf" : undefined}>
                {label}
              </Link>
            ))
          : ready
            ? (
                <>
                  <Link href="/syllabus" className={styles.link} aria-current={here("/syllabus")}>
                    Syllabus
                  </Link>
                  <Link href="/pricing" className={styles.link} aria-current={here("/pricing")}>
                    Pricing
                  </Link>
                  <Link href="/handbook" className={styles.link} aria-current={here("/handbook")}>
                    Handbook
                  </Link>
                </>
              )
            : null}
      </nav>
      <div className={styles.right}>
        {user ? (
          <>
            <SyncIndicator status={syncStatus} />
            <Link href="/settings" className={styles.icon} title="Settings" aria-current={here("/settings")}>
              <PixelIcon name="settings" />
              <span className="visually-hidden">Settings</span>
            </Link>
            <Link href="/settings#character" className={styles.avatar} title="Your character">
              <LearnerHead look={profile.character ?? defaultLook()} scale={2} />
              <span className="visually-hidden">Your character</span>
            </Link>
          </>
        ) : ready ? (
          <>
            <Link href="/login" className={styles.link} aria-current={here("/login")}>
              Log in
            </Link>
            <LinkButton href="/job/shop-sign" variant="primary" size="sm">
              Start free
            </LinkButton>
          </>
        ) : null}
      </div>
    </header>
  );
}
