import Link from "next/link";
import { Credit } from "./Credit";
import { Mark } from "./Brand";
import styles from "./SiteFooter.module.css";

const LINKS = [
  ["/syllabus", "Syllabus"],
  ["/pricing", "Pricing"],
  ["/handbook", "Python Handbook"],
  ["/credits", "Credits"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
] as const;

/** The footer: the links, and the credit line with the pixel heart (REDESIGN-2.md 1). */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Mark size={24} />
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
