import Link from "next/link";
import { Credit } from "./Credit";
import { Mark } from "./Brand";
import styles from "./SiteFooter.module.css";

const LINKS = [
  ["/syllabus", "Syllabus"],
  ["/handbook", "Python Handbook"],
  ["/credits", "Credits"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
] as const;

/** The footer: the mark, the links in the pixel face, and the credit line with the pixel heart (REDESIGN-2.md 1). */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Mark size={32} />
        <nav aria-label="Footer" className={styles.links}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Credit className={styles.credit} />
      </div>
    </footer>
  );
}
