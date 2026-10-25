import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Credit } from "./Credit";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <nav aria-label="Footer" className={styles.links}>
          <Link href="/syllabus">Syllabus</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/handbook">Python Handbook</Link>
          <Link href="/credits">Credits</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p className={styles.line}>{BRAND.townName} is made up. The Python is real.</p>
      </div>
      <Credit className={styles.credit} />
    </footer>
  );
}
