import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.line}>Paul&apos;s Python Course. Saltmarsh is fictional; the Python is real.</p>
      <nav aria-label="Footer" className={styles.links}>
        <Link href="/syllabus">Syllabus</Link>
        <Link href="/#faq">Questions</Link>
        <Link href="/credits">Credits</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}
