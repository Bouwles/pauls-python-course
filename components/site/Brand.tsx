// The logo (REDESIGN-2.md 1): a snake curled into a P, in the sun colour, and the wordmark
// "Paul's Python Course" in the display face beside it. The same drawing is public/brand/mark.svg.
import { BRAND } from "@/lib/brand";
import styles from "./Brand.module.css";

export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false" className={styles.mark}>
      <path d="M14 59c4 0 7-2.4 7-6.5V22c0-9.4 6.6-16 15-16 8.6 0 15 6.4 15 14.5S44.6 35 39 35" fill="none" stroke="var(--sun)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="38" cy="35" rx="8" ry="6.8" fill="var(--sun)" />
      <circle cx="35.6" cy="33" r="1.8" fill="var(--sun-ink)" />
      <path d="M30.6 37.2h-1.9m0 0l-1.3-1.1m1.3 1.1l-1.3 1.1" fill="none" stroke="var(--fail)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The mark and the name. `size` is the mark's height; the name scales with it. */
export function Wordmark({ size = 28, short = false, className }: { size?: number; short?: boolean; className?: string }) {
  return (
    <span className={[styles.wordmark, className].filter(Boolean).join(" ")} style={{ ["--mark" as string]: `${size}px` }}>
      <Mark size={size} />
      <span className={styles.name}>{short ? BRAND.shortName : BRAND.name}</span>
    </span>
  );
}
