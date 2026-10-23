"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { SyncIndicator } from "../ui/SyncIndicator";
import styles from "./SiteHeader.module.css";

const LEARNER_LINKS = [
  ["/map", "Map"],
  ["/rounds", "Morning Rounds"],
  ["/shelf", "Shelf"],
  ["/concepts", "Concepts"],
  ["/drills", "Drills"],
  ["/settings", "Settings"],
] as const;

export function SiteHeader() {
  const { user, syncStatus, ready } = useSession();
  const path = usePathname();
  return (
    <header className={styles.header}>
      <Link href={user ? "/map" : "/"} className={styles.mark}>
        Paul&apos;s Python Course
      </Link>
      <nav aria-label="Main" className={styles.nav}>
        {user
          ? LEARNER_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={styles.link} aria-current={path === href ? "page" : undefined}>
                {label}
              </Link>
            ))
          : ready
            ? (
                <>
                  <Link href="/syllabus" className={styles.link} aria-current={path === "/syllabus" ? "page" : undefined}>
                    Syllabus
                  </Link>
                  <Link href="/login" className={styles.link} aria-current={path === "/login" ? "page" : undefined}>
                    Log in
                  </Link>
                  <Link href="/signup" className={styles.cta}>
                    Make an account
                  </Link>
                </>
              )
            : null}
      </nav>
      {user ? (
        <div className={styles.sync}>
          <SyncIndicator status={syncStatus} />
        </div>
      ) : null}
    </header>
  );
}
